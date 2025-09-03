// Script para generar sinónimos automáticamente basado en la base de conocimiento
const path = require('path');
const fs = require('fs');

async function generateSynonyms() {
  console.log('🔍 Analizando base de conocimiento para generar sinónimos...');
  
  try {
    // Importar dinámicamente las funciones de DB
    const { queryAll, bootstrapSchema } = await import('../src/db/index.js');
    
    // Inicializar esquema
    await bootstrapSchema();
    
    // Obtener todos los registros activos
    const rows = await queryAll(`
      SELECT pregunta, palabras_clave, respuesta_texto 
      FROM knowledge_base 
      WHERE activo = 1
    `);
    
    console.log(`📚 Analizando ${rows.length} registros...`);
    
    // Objeto para almacenar sinónimos encontrados
    const synonymGroups = {};
    
    // Términos frecuentes para agrupar
    const commonTerms = new Map();
    
    rows.forEach(row => {
      // Combinar pregunta y palabras clave para análisis
      const allText = `${row.pregunta} ${row.palabras_clave || ''}`.toLowerCase();
      
      // Extraer términos importantes (palabras de 3+ caracteres)
      const words = allText.match(/\b\w{3,}\b/g) || [];
      
      words.forEach(word => {
        if (!isStopWord(word)) {
          commonTerms.set(word, (commonTerms.get(word) || 0) + 1);
        }
      });
    });
    
    // Filtrar términos más frecuentes (aparecen en 2+ registros)
    const frequentTerms = Array.from(commonTerms.entries())
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);
    
    console.log(`🎯 Términos frecuentes encontrados: ${frequentTerms.length}`);
    
    // Generar grupos de sinónimos basados en el contenido real
    analyzeAndGroupSynonyms(rows, synonymGroups);
    
    // Crear el archivo de sinónimos
    const synonymsContent = generateSynonymsFile(synonymGroups, frequentTerms);
    
    // Guardar el archivo
    const outputPath = path.join(__dirname, '..', 'src', 'nlp', 'synonyms.js');
    fs.writeFileSync(outputPath, synonymsContent, 'utf8');
    
    console.log(`✅ Archivo de sinónimos generado: ${outputPath}`);
    console.log(`📊 Grupos de sinónimos creados: ${Object.keys(synonymGroups).length}`);
    
    // Mostrar preview de los sinónimos generados
    console.log('\n🔍 Preview de sinónimos generados:');
    Object.entries(synonymGroups).slice(0, 10).forEach(([key, synSet]) => {
      const syns = Array.from(synSet);
      console.log(`  ${key}: [${syns.slice(0, 3).join(', ')}...]`);
    });
    
  } catch (error) {
    console.error('❌ Error generando sinónimos:', error.message);
  }
}

function analyzeAndGroupSynonyms(rows, synonymGroups) {
  console.log('🎯 Generando sinónimos específicos por tipo de conocimiento...');
  
  // Analizar cada registro individualmente para crear sinónimos específicos
  rows.forEach(row => {
    const pregunta = row.pregunta.toLowerCase();
    const palabrasClave = (row.palabras_clave || '').toLowerCase();
    
    // === INGENIERÍA DE SISTEMAS ===
    if (pregunta.includes('presentacion') && pregunta.includes('ingeniería de sistemas')) {
      addSynonymGroup(synonymGroups, 'presentacion_ingenieria', [
        'presentacion ingeniería', 'sobre ingeniería sistemas', 'que es ingeniería sistemas',
        'acerca ingeniería', 'información ingeniería', 'programa ingeniería'
      ]);
    }
    
    if (pregunta.includes('perfil profesional') && pregunta.includes('ingeniería de sistemas')) {
      addSynonymGroup(synonymGroups, 'perfil_ingeniero', [
        'perfil ingeniero', 'perfil del ingeniero', 'perfil ingeniero sistemas',
        'competencias ingeniero', 'habilidades ingeniero', 'que hace un ingeniero',
        'funciones ingeniero', 'trabajo ingeniero'
      ]);
    }
    
    if (pregunta.includes('campos de_accion') && pregunta.includes('ingeniería de sistemas')) {
      addSynonymGroup(synonymGroups, 'campo_ingeniero', [
        'campo ingeniero', 'campos ingeniero', 'donde trabaja ingeniero',
        'trabajo ingeniero', 'empleos ingeniero', 'campo laboral ingeniero'
      ]);
    }
    
    if (pregunta.includes('plan de_estudios') && pregunta.includes('ingeniería de sistemas')) {
      addSynonymGroup(synonymGroups, 'plan_ingenieria', [
        'plan ingeniería', 'plan estudios ingeniería', 'materias ingeniería',
        'semestres ingeniería', 'curriculum ingeniería', 'pensum ingeniería'
      ]);
    }
    
    // === TECNOLOGÍA EN DESARROLLO ===
    if (pregunta.includes('presentacion') && pregunta.includes('tecnología en desarrollo')) {
      addSynonymGroup(synonymGroups, 'presentacion_tecnologia', [
        'presentacion tecnología', 'sobre tecnología', 'que es tecnología sistemas',
        'acerca tecnología', 'información tecnología', 'programa tecnología'
      ]);
    }
    
    if (pregunta.includes('perfil profesional') && pregunta.includes('tecnología en desarrollo')) {
      addSynonymGroup(synonymGroups, 'perfil_tecnologo', [
        'perfil tecnólogo', 'perfil del tecnólogo', 'perfil tecnólogo sistemas',
        'competencias tecnólogo', 'habilidades tecnólogo', 'que hace un tecnólogo',
        'funciones tecnólogo', 'trabajo tecnólogo'
      ]);
    }
    
    if (pregunta.includes('campos de_accion') && pregunta.includes('tecnología en desarrollo')) {
      addSynonymGroup(synonymGroups, 'campo_tecnologo', [
        'campo tecnólogo', 'campos tecnólogo', 'donde trabaja tecnólogo',
        'trabajo tecnólogo', 'empleos tecnólogo', 'campo laboral tecnólogo'
      ]);
    }
    
    if (pregunta.includes('plan de_estudios') && pregunta.includes('tecnología en desarrollo')) {
      addSynonymGroup(synonymGroups, 'plan_tecnologia', [
        'plan tecnología', 'plan estudios tecnología', 'materias tecnología',
        'semestres tecnología', 'curriculum tecnología', 'pensum tecnología'
      ]);
    }
    
    // === ASPIRANTES ===
    if (pregunta.includes('aspirantes') && palabrasClave.includes('admisiones')) {
      addSynonymGroup(synonymGroups, 'admisiones', [
        'admisiones', 'inscripciones', 'como ingresar', 'requisitos ingreso',
        'proceso admisión', 'inscribirse'
      ]);
    }
    
    if (pregunta.includes('costos') && pregunta.includes('aspirantes')) {
      addSynonymGroup(synonymGroups, 'costos_aspirantes', [
        'costos', 'precio carrera', 'cuanto cuesta', 'matricula', 'valor carrera',
        'derechos pecuniarios', 'costo semestre'
      ]);
    }
    
    if (pregunta.includes('documentos') && pregunta.includes('aspirantes')) {
      addSynonymGroup(synonymGroups, 'documentos_aspirantes', [
        'documentos', 'requisitos', 'papeles', 'documentación', 'que necesito',
        'documentos ingreso'
      ]);
    }
    
    if (pregunta.includes('becas') && pregunta.includes('aspirantes')) {
      addSynonymGroup(synonymGroups, 'becas', [
        'becas', 'gratuidad', 'financiación', 'apoyo económico', 'subsidio',
        'ayuda financiera'
      ]);
    }
    
    // === ESTUDIANTES ===
    if (pregunta.includes('tramites') && pregunta.includes('estudiantes')) {
      addSynonymGroup(synonymGroups, 'tramites_estudiantes', [
        'trámites', 'procedimientos', 'gestiones estudiantiles', 'servicios estudiantes'
      ]);
    }
    
    if (pregunta.includes('plataformas') && pregunta.includes('estudiantes')) {
      addSynonymGroup(synonymGroups, 'plataformas_estudiantes', [
        'plataformas', 'portal estudiante', 'campus virtual', 'moodle', 'portal académico'
      ]);
    }
    
    if (pregunta.includes('calendario') && pregunta.includes('estudiantes')) {
      addSynonymGroup(synonymGroups, 'calendario_estudiantes', [
        'calendario académico', 'fechas importantes', 'cronograma', 'horarios'
      ]);
    }
    
    // === DOCENTES ===
    if (pregunta.includes('recursos') && pregunta.includes('docentes')) {
      addSynonymGroup(synonymGroups, 'recursos_docentes', [
        'recursos docentes', 'herramientas docentes', 'apoyo académico'
      ]);
    }
    
    if (pregunta.includes('plataformas') && pregunta.includes('docentes')) {
      addSynonymGroup(synonymGroups, 'plataformas_docentes', [
        'plataformas docentes', 'portal docente', 'herramientas digitales'
      ]);
    }
    
    if (pregunta.includes('normatividad') && pregunta.includes('docentes')) {
      addSynonymGroup(synonymGroups, 'normatividad_docentes', [
        'normatividad', 'reglamento docente', 'normas académicas'
      ]);
    }
  });
  
  // Agregar términos generales solo cuando no hay especificidad
  addGeneralSynonyms(synonymGroups);
}

function addGeneralSynonyms(synonymGroups) {
  addSynonymGroup(synonymGroups, 'sistemas', [
    'sistemas', 'informática', 'software', 'computación'
  ]);
  
  addSynonymGroup(synonymGroups, 'contacto', [
    'contacto', 'información', 'asesorías', 'consultas'
  ]);
  
  addSynonymGroup(synonymGroups, 'calendario', [
    'calendario', 'fechas', 'cronograma'
  ]);
}

function addSynonymGroup(synonymGroups, key, synonyms) {
  if (!synonymGroups[key]) {
    synonymGroups[key] = new Set();
  }
  synonyms.forEach(syn => synonymGroups[key].add(syn));
}

function isStopWord(word) {
  const stopWords = [
    'para', 'del', 'de', 'la', 'el', 'en', 'con', 'por', 'sobre', 'una', 'uno',
    'los', 'las', 'que', 'se', 'es', 'un', 'al', 'le', 'da', 'su', 'sus',
    'información', 'uts', 'programa', 'estudiantes', 'sistema'
  ];
  return stopWords.includes(word) || word.length < 3;
}

function generateSynonymsFile(synonymGroups, frequentTerms) {
  // Convertir Sets a Arrays
  const finalSynonyms = {};
  Object.entries(synonymGroups).forEach(([key, synSet]) => {
    finalSynonyms[key] = Array.from(synSet);
  });
  
  return `// Sinónimos específicos por tipo de conocimiento
// Generado automáticamente el: ${new Date().toLocaleString('es-CO')}
// Cada entrada mantiene sus sinónimos propios sin mezclarse
// Total de grupos: ${Object.keys(finalSynonyms).length}

export const synonyms = ${JSON.stringify(finalSynonyms, null, 2)};

// Términos más frecuentes en la base de conocimiento:
// ${frequentTerms.slice(0, 20).map(([word, count]) => `${word} (${count})`).join(', ')}

export default synonyms;
`;
}

function isStopWord(word) {
  const stopWords = [
    'para', 'del', 'de', 'la', 'el', 'en', 'con', 'por', 'sobre', 'una', 'uno',
    'los', 'las', 'que', 'se', 'es', 'un', 'al', 'le', 'da', 'su', 'sus',
    'información', 'uts', 'programa', 'estudiantes', 'sistema'
  ];
  return stopWords.includes(word) || word.length < 3;
}

// Ejecutar el script
generateSynonyms();
