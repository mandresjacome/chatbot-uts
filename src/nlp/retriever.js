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

// Variable para almacenar la KB cargada desde la base de datos
let KB = [];
let fuse = null;

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
    KB = rows.map(item => ({
      ...item,
      searchText: normalize(
        `${item.pregunta} ${item.respuesta_texto} ${item.palabras_clave || ''}`
      )
    }));

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
