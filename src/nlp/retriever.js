// Importar Fuse.js para búsqueda difusa (fuzzy search)
import Fuse from 'fuse.js';
// Importar compromise para procesamiento de lenguaje natural
import nlp from 'compromise';
// Importar función de normalización de texto
import { normalize } from '../utils/normalize.js';
// Importar función para consultas a la base de datos
import { queryAll } from '../db/index.js';
// Importar sinónimos generados automáticamente
import { synonyms } from './synonyms.js';
// Importar datos de malla curricular
import mallaCurricular from '../data/mallaCurricular.js';

// Variable para almacenar la KB cargada desde la base de datos
let KB = [];
let fuse = null;

// Función para generar entradas de conocimiento desde la malla curricular
function generateMallaKnowledgeEntries() {
  const mallaEntries = [];
  
  try {
    const programa = mallaCurricular.programa_completo;
    
    // Entrada general del programa
    mallaEntries.push({
      id: 'malla_general',
      pregunta: 'Información general sobre la malla curricular de Ingeniería de Sistemas',
      respuesta_texto: `🎓 **${programa.nombre}**\n\n${programa.descripcion}\n\n📚 **Duración:** ${programa.duracion_total}\n💳 **Créditos totales:** ${programa.creditos_total}\n\n**Estructura del programa:**\n\n📘 **${programa.nivel_tecnologico.nombre}** (${programa.nivel_tecnologico.niveles})\n- Duración: ${programa.nivel_tecnologico.duracion}\n- Título: ${programa.nivel_tecnologico.titulo}\n\n📗 **${programa.nivel_universitario.nombre}** (${programa.nivel_universitario.niveles})\n- Duración: ${programa.nivel_universitario.duracion}\n- Título: ${programa.nivel_universitario.titulo}`,
      tipo_usuario: 'todos',
      palabras_clave: 'malla curricular, pensum, plan estudios, curriculum, estructura académica, niveles formación, tecnológico universitario, duración programa, créditos',
      recurso_url: '/api/malla-curricular',
      nombre_recurso: 'Malla Curricular - Coordinación Sistemas UTS'
    });

    // Entradas por cada nivel/semestre
    Object.entries(programa.niveles).forEach(([nivelNum, nivelData]) => {
      const materiasList = nivelData.materias.map(materia => 
        `📌 **${materia.nombre}** (${materia.creditos} créditos) - ${materia.htd}h presenciales, ${materia.hti}h independientes`
      ).join('\n');

      mallaEntries.push({
        id: `malla_nivel_${nivelNum}`,
        pregunta: `Información del ${nivelData.nombre} (Nivel ${nivelData.nivel_romano}) de Ingeniería de Sistemas`,
        respuesta_texto: `📚 **${nivelData.nombre} (${nivelData.nivel_romano})**\n\n🎯 **Tipo:** ${nivelData.tipo}\n⏰ **Horas totales:** ${nivelData.htd_total}h presenciales + ${nivelData.hti_total}h independientes\n💳 **Créditos:** ${nivelData.creditos}\n\n**Materias del semestre:**\n\n${materiasList}`,
        tipo_usuario: 'todos',
        palabras_clave: `nivel ${nivelNum}, semestre ${nivelNum}, ${nivelData.nivel_romano}, ${nivelData.nombre}, ${nivelData.tipo.toLowerCase()}, materias semestre ${nivelNum}, asignaturas nivel ${nivelNum}`,
        recurso_url: `/api/malla-curricular/programa_completo/${nivelNum}`,
        nombre_recurso: `${nivelData.nombre} - Malla Curricular UTS`
      });

      // Entradas individuales por materia
      nivelData.materias.forEach(materia => {
        const prerequisitosTexto = materia.prerequisitos && materia.prerequisitos.length > 0 
          ? `\n\n📋 **Prerrequisitos:** ${materia.prerequisitos.join(', ')}`
          : '\n\n📋 **Prerrequisitos:** Ninguno';

        mallaEntries.push({
          id: `materia_${materia.nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
          pregunta: `Información sobre la materia ${materia.nombre}`,
          respuesta_texto: `📖 **${materia.nombre}**\n\n📍 **Nivel:** ${nivelData.nombre} (${nivelData.nivel_romano})\n🎯 **Tipo de formación:** ${nivelData.tipo}\n💳 **Créditos:** ${materia.creditos}\n⏰ **Horas:** ${materia.htd}h presenciales + ${materia.hti}h independientes\n🏷️ **Línea de formación:** ${materia.linea_formacion.replace(/_/g, ' ')}${prerequisitosTexto}`,
          tipo_usuario: 'todos',
          palabras_clave: `${materia.nombre}, materia ${materia.nombre}, asignatura ${materia.nombre}, ${materia.codigo}, créditos ${materia.nombre}, prerequisitos ${materia.nombre}`,
          recurso_url: `/api/malla-curricular/buscar/${encodeURIComponent(materia.nombre)}`,
          nombre_recurso: `${materia.nombre} - Malla Curricular UTS`
        });
      });
    });

    return mallaEntries;
  } catch (error) {
    console.error('Error generando entradas de malla curricular:', error);
    return [];
  }
}

// Función para expandir consulta con sinónimos generados automáticamente
function expandQuery(query) {
  let expandedQuery = query.toLowerCase();
  
  // Expandir usando sinónimos generados automáticamente de la base de conocimiento
  Object.keys(synonyms).forEach(word => {
    if (expandedQuery.includes(word)) {
      const syns = synonyms[word];
      expandedQuery += ' ' + syns.join(' ');
    }
  });
  
  return expandedQuery;
}

// Función para cargar la base de conocimiento desde la base de datos
async function loadKBFromDatabase() {
  try {
    const rows = await queryAll(`
      SELECT id, pregunta, respuesta_texto, tipo_usuario, palabras_clave, recurso_url, nombre_recurso 
      FROM knowledge_base 
      WHERE activo = true
    `);
    
    // Procesar los datos y agregar campo de búsqueda
    const dbKB = rows.map(item => ({
      ...item,
      searchText: normalize(
        `${item.pregunta} ${item.respuesta_texto} ${item.palabras_clave || ''}`
      )
    }));

    // Agregar entradas de malla curricular
    const mallaKB = generateMallaKnowledgeEntries().map(item => ({
      ...item,
      searchText: normalize(
        `${item.pregunta} ${item.respuesta_texto} ${item.palabras_clave || ''}`
      )
    }));

    // Combinar ambas fuentes de conocimiento
    KB = [...dbKB, ...mallaKB];

    // Configurar Fuse.js para búsqueda difusa inteligente
    fuse = new Fuse(KB, {
      includeScore: true,
      threshold: 0.4,         // Más tolerante a errores de escritura
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'palabras_clave', weight: 0.5 },  // Mayor peso a palabras clave
        { name: 'pregunta',       weight: 0.3 },  
        { name: 'searchText',     weight: 0.2 }   // Búsqueda en contenido completo
      ]
    });

    console.log(`📚 Base de conocimiento cargada: ${dbKB.length} entradas DB + ${mallaKB.length} entradas malla = ${KB.length} total`);
    return KB.length;
  } catch (error) {
    console.error('Error cargando KB desde base de datos:', error);
    return 0;
  }
}

// Cargar la KB al inicializar el módulo
await loadKBFromDatabase();

/**
 * Recarga la base de conocimiento desde la base de datos
 */
export async function reloadKB() {
  return await loadKBFromDatabase();
}

/**
 * Regenera los sinónimos ejecutando el script automático
 */
export async function regenerateSynonyms() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    console.log('🔄 Regenerando sinónimos automáticamente...');
    await execAsync('node scripts/generate-synonyms.cjs');
    console.log('✅ Sinónimos regenerados');
    
    // Recargar el retriever
    await reloadKB();
    return true;
  } catch (error) {
    console.error('❌ Error regenerando sinónimos:', error);
    return false;
  }
}

/**
 * Recupera los mejores k fragmentos para la pregunta del usuario
 * filtrando por tipo de usuario cuando aplique.
 */
export function retrieveTopK({ query, userType = 'todos', k = 3 }) {
  // Verificar que fuse esté inicializado
  if (!fuse || KB.length === 0) {
    console.warn('Base de conocimiento no cargada. Reintentando...');
    return { chunks: [], meta: { fechasDetectadas: null } };
  }

  // Expandir consulta con sinónimos básicos y normalizar
  const expandedQuery = expandQuery(query);
  const clean = normalize(expandedQuery);
  
  // Entities por si luego quieres usarlas (fechas, lugares, etc.)
  const doc = nlp(query);
  const fechas = doc.match('#Date').text();

  // Realizar búsqueda difusa y procesar resultados
  const results = fuse.search(clean)
    .map(r => ({ ...r.item, _score: r.score }))
    .filter(it => it.tipo_usuario === userType || it.tipo_usuario === 'todos')
    .slice(0, k)
    .map((it, i) => ({
      id: it.id ?? i,
      text: it.respuesta_texto,
      titulo: it.pregunta,
      score: (1 - (it._score ?? 1)).toFixed(2),
      url: it.recurso_url || null,
      nombreRecurso: it.nombre_recurso || null
    }));

  return { chunks: results, meta: { fechasDetectadas: fechas || null } };
}
