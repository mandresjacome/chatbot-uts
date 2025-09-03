// SCRAPER ESPECÍFICO PARA INFORMACIÓN DE ESTUDIANTES UTS
// Extrae información relevante de https://www.uts.edu.co/sitio/estudiantes/
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const loadDatabase = require('../src/utils/database-adapter.cjs');

console.log('🎓 Scraper para INFORMACIÓN DE ESTUDIANTES UTS...');

const ESTUDIANTES_URL = 'https://www.uts.edu.co/sitio/estudiantes/';

// **EXTRACTOR ESPECÍFICO PARA INFORMACIÓN DE ESTUDIANTES**
async function extractEstudiantesInfo(html) {
  console.log('🔍 Extrayendo información para estudiantes...');
  const $ = cheerio.load(html);
  
  const sections = {};
  
  // 1. EXTRAER SECCIÓN "NORMATIVIDAD"
  console.log('📋 Extrayendo sección Normatividad...');
  let normatividad = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('normatividad')) {
      console.log('   ✅ Encontrada sección Normatividad');
      
      // Buscar enlaces en la sección siguiente
      const container = $(el).parent();
      const links = [];
      
      container.find('a').each((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          // Filtrar enlaces relevantes para estudiantes
          if (text.toLowerCase().includes('calendario') || 
              text.toLowerCase().includes('reglamento') ||
              text.toLowerCase().includes('derechos') ||
              text.toLowerCase().includes('trabajo de grado')) {
            links.push(`• ${text}: ${href}`);
          }
        }
      });
      
      if (links.length > 0) {
        normatividad = `Normatividad importante para estudiantes UTS:\n\n${links.slice(0, 15).join('\n')}`;
      }
    }
  });
  
  if (normatividad) {
    sections['normatividad_estudiantes'] = normatividad;
  }
  
  // 2. EXTRAER SECCIÓN "ACADÉMICO"
  console.log('📋 Extrayendo sección Académico...');
  let academico = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('académico')) {
      console.log('   ✅ Encontrada sección Académico');
      
      const container = $(el).parent();
      const links = [];
      
      container.find('a').each((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          links.push(`• ${text}: ${href}`);
        }
      });
      
      if (links.length > 0) {
        academico = `Recursos académicos para estudiantes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  if (academico) {
    sections['recursos_academicos'] = academico;
  }
  
  // 3. EXTRAER SECCIÓN "SERVICIOS"
  console.log('📋 Extrayendo sección Servicios...');
  let servicios = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('servicios')) {
      console.log('   ✅ Encontrada sección Servicios');
      
      const container = $(el).parent();
      const links = [];
      
      container.find('a').each((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          // Filtrar servicios específicos para estudiantes
          if (text.toLowerCase().includes('portal') || 
              text.toLowerCase().includes('biblioteca') ||
              text.toLowerCase().includes('icetex') ||
              text.toLowerCase().includes('diploma')) {
            links.push(`• ${text}: ${href}`);
          }
        }
      });
      
      if (links.length > 0) {
        servicios = `Servicios disponibles para estudiantes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  if (servicios) {
    sections['servicios_estudiantes'] = servicios;
  }
  
  // 4. EXTRAER SECCIÓN "MANTENTE INFORMADO"
  console.log('📋 Extrayendo sección Mantente Informado...');
  let informado = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('informado')) {
      console.log('   ✅ Encontrada sección Mantente Informado');
      
      const container = $(el).parent();
      const links = [];
      
      container.find('a').each((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          links.push(`• ${text}: ${href}`);
        }
      });
      
      if (links.length > 0) {
        informado = `Información importante para estudiantes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  if (informado) {
    sections['informacion_estudiantes'] = informado;
  }
  
  // 5. EXTRAER INFORMACIÓN SOBRE LA MISIÓN DE LOS ESTUDIANTES
  console.log('📋 Extrayendo misión estudiantil...');
  let misionEstudiantil = '';
  
  $('p').each((i, p) => {
    const text = $(p).text().trim();
    if (text.includes('estudiantes') && text.includes('institución') && text.length > 100) {
      misionEstudiantil = `Sobre los estudiantes de UTS:\n\n${text}`;
      console.log('   ✅ Encontrada misión estudiantil');
      return false; // break
    }
  });
  
  if (misionEstudiantil) {
    sections['mision_estudiantil'] = misionEstudiantil;
  }
  
  // 6. EXTRAER CALENDARIOS ACADÉMICOS ESPECÍFICOS
  console.log('📋 Extrayendo calendarios académicos...');
  let calendarios = '';
  
  const calendarioLinks = [];
  $('a').each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    
    if (text && href && text.toLowerCase().includes('calendario') && text.includes('2025')) {
      calendarioLinks.push(`• ${text}: ${href}`);
    }
  });
  
  if (calendarioLinks.length > 0) {
    calendarios = `Calendarios Académicos 2025 para estudiantes:\n\n${calendarioLinks.slice(0, 10).join('\n')}`;
    sections['calendarios_academicos'] = calendarios;
  }
  
  // 7. EXTRAER ENLACES A PLATAFORMAS DIGITALES
  console.log('📋 Extrayendo plataformas digitales...');
  let plataformas = '';
  
  const plataformaLinks = [];
  $('a').each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    
    if (text && href && href.startsWith('http') && text.length > 5) {
      // Filtrar plataformas específicas
      if (text.toLowerCase().includes('portal') || 
          text.toLowerCase().includes('atena') ||
          text.toLowerCase().includes('moodle') ||
          text.toLowerCase().includes('virtual') ||
          text.toLowerCase().includes('biblioteca') ||
          text.toLowerCase().includes('tutoría')) {
        plataformaLinks.push(`• ${text}: ${href}`);
      }
    }
  });
  
  if (plataformaLinks.length > 0) {
    plataformas = `Plataformas digitales para estudiantes UTS:\n\n${plataformaLinks.join('\n')}`;
    sections['plataformas_digitales'] = plataformas;
  }
  
  // 8. EXTRAER INFORMACIÓN SOBRE TRÁMITES Y PROCEDIMIENTOS
  console.log('📋 Extrayendo información sobre trámites...');
  let tramites = '';
  
  const tramiteLinks = [];
  $('a').each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    
    if (text && href && text.length > 5) {
      // Filtrar trámites estudiantiles
      if (text.toLowerCase().includes('modalidades de grado') || 
          text.toLowerCase().includes('duplicados') ||
          text.toLowerCase().includes('póliza') ||
          text.toLowerCase().includes('auxiliatura') ||
          text.toLowerCase().includes('estímulos')) {
        tramiteLinks.push(`• ${text}: ${href}`);
      }
    }
  });
  
  if (tramiteLinks.length > 0) {
    tramites = `Trámites y procedimientos para estudiantes UTS:\n\n${tramiteLinks.join('\n')}`;
    sections['tramites_estudiantes'] = tramites;
  }
  
  return sections;
}

// Función principal para scraping de estudiantes
async function scrapeEstudiantesInfo() {
  try {
    console.log('🌐 Conectando a página de Estudiantes UTS...');
    
    const response = await fetch(ESTUDIANTES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ HTML obtenido: ${html.length} caracteres`);
    
    // Extraer información específica para estudiantes
    const extractedSections = await extractEstudiantesInfo(html);
    
    console.log(`🎯 Secciones de Estudiantes extraídas: ${Object.keys(extractedSections).length}`);
    
    // Mostrar resumen
    Object.entries(extractedSections).forEach(([section, content]) => {
      console.log(`📋 ${section}: ${content.length} caracteres`);
      console.log(`   Preview: "${content.substring(0, 100)}..."`);
    });
    
    if (Object.keys(extractedSections).length === 0) {
      console.log('❌ No se extrajo información de estudiantes. Verificar estructura de la página.');
      return;
    }
    
    // Conectar a DB y guardar
    const Database = await loadDatabase();
    await Database.connect();
    
    // Limpiar datos anteriores de estudiantes
    console.log('🧹 Limpiando datos anteriores de estudiantes...');
    await Database.run(`DELETE FROM knowledge_base WHERE nombre_recurso = 'Información para Estudiantes - UTS'`);
    
    // Insertar información para estudiantes
    for (const [section, content] of Object.entries(extractedSections)) {
      if (content && content.length > 50) {
        console.log(`💾 Insertando ${section} de información estudiantes...`);
        
        await Database.run(`
          INSERT INTO knowledge_base (
            pregunta, respuesta_texto, tipo_usuario, activo, 
            nombre_recurso, recurso_url, palabras_clave, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          `Información sobre ${section.replace('_', ' ')} para estudiantes UTS`,
          content,
          'estudiante', // Específico para tipo usuario estudiante
          1,
          'Información para Estudiantes - UTS',
          ESTUDIANTES_URL,
          section.replace('_', ' ') + ', estudiantes, académico, UTS, servicios'
        ]);
        
        console.log(`✅ ${section} para estudiantes insertado correctamente`);
      }
    }
    
    console.log('🎉 Scraping de INFORMACIÓN ESTUDIANTES completado con éxito');
    console.log('🎓 Información específica para tipo de usuario: ESTUDIANTE');
    
  } catch (error) {
    console.error('❌ Error en scraping de información estudiantes:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  scrapeEstudiantesInfo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal en información estudiantes:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeEstudiantesInfo };
