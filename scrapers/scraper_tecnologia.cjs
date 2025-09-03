// SCRAPER ESPECÍFICO PARA TECNOLOGÍA EN DESARROLLO DE SISTEMAS INFORMÁTICOS
// Basado en scraper_fixed.js que ya funciona
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const loadDatabase = require('../src/utils/database-adapter.cjs');

console.log('� Scraper para TECNOLOGÍA EN DESARROLLO DE SISTEMAS INFORMÁTICOS UTS...');

const TECH_URL = 'https://www.uts.edu.co/sitio/tecnologia-en-desarrollo-de-sistemas-informaticos/';

// **EXTRACTOR ESPECÍFICO PARA TABS/ACORDEONES DE TECNOLOGÍA**
async function extractFromTechTabs(html) {
  console.log('🔍 Extrayendo contenido de tabs/acordeones de Tecnología...');
  const $ = cheerio.load(html);
  
  const sections = {};
  
  // Los H4 están en vc_tta-panel-heading, el contenido en vc_tta-panel-body
  $('h4').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    const sectionMapping = {
      'presentación': 'presentacion',
      'perfil profesional': 'perfil_profesional',
      'campos de acción': 'campos_de_accion', 
      'plan de estudios': 'plan_de_estudios',
      'resultados de aprendizaje de titulación': 'resultados_aprendizaje',
      'resultados de aprendizaje': 'resultados_aprendizaje'
      // NOTA: docentes y contacto se reutilizan de Ingeniería
    };
    
    const sectionKey = sectionMapping[title];
    if (sectionKey) {
      console.log(`✅ Procesando Tecnología: ${title} → ${sectionKey}`);
      
      // Buscar el panel body correspondiente
      const panelHeading = $(el).closest('.vc_tta-panel-heading');
      const panel = panelHeading.closest('.vc_tta-panel');
      const panelBody = panel.find('.vc_tta-panel-body');
      
      let content = '';
      
      if (panelBody.length) {
        console.log(`   📋 Panel body encontrado para ${sectionKey}`);
        
        // Extraer todo el texto del panel body, limpiando
        content = panelBody.text().trim();
        
        // Limpiar contenido
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .trim();
          
        console.log(`   📝 Contenido extraído: ${content.length} caracteres`);
        
        if (content.length > 50) {
          sections[sectionKey] = content;
        }
      } else {
        console.log(`   ⚠️ No se encontró panel body para ${sectionKey}`);
      }
    }
  });
  
  // Si no funciona con tabs, buscar contenido específico por patrones para Tecnología
  if (Object.keys(sections).length < 4) {
    console.log('🔄 Buscando contenido de Tecnología por patrones específicos...');
    
    // Patrones específicos para Tecnología
    const patterns = {
      'campos_de_accion': {
        keywords: ['tecnólogo', 'desarrollador', 'soporte técnico', 'analista', 'programador']
      },
      'perfil_profesional': {
        keywords: ['El tecnólogo', 'capacidad de', 'competencias', 'habilidades']
      },
      'presentacion': {
        keywords: ['SNIES', 'duración', 'semestres', 'tecnología', 'modalidad']
      },
      'plan_de_estudios': {
        keywords: ['plan de estudios', 'malla curricular', 'asignaturas', 'materias']
      },
      'resultados_aprendizaje': {
        keywords: ['Resultados del aprendizaje', 'competencias', 'logros']
      }
    };
    
    Object.entries(patterns).forEach(([sectionKey, pattern]) => {
      if (!sections[sectionKey]) {
        console.log(`� Buscando ${sectionKey} de Tecnología por patrones...`);
        
        let foundContent = '';
        pattern.keywords.forEach(keyword => {
          if (!foundContent) {
            $(`*:contains("${keyword}")`).each((j, keywordEl) => {
              const text = $(keywordEl).text().trim();
              if (text.length > 100 && text.length < 2000 && text.includes(keyword)) {
                foundContent = text;
                return false; // break
              }
            });
          }
        });
        
        if (foundContent) {
          sections[sectionKey] = foundContent;
          console.log(`   ✅ ${sectionKey} encontrado por palabras clave: ${foundContent.length} chars`);
        }
      }
    });
  }
  
  return sections;
}

// Función principal para Tecnología
async function scrapeTechProgram() {
  try {
    console.log('🌐 Conectando a página de Tecnología UTS...');
    
    const response = await fetch(TECH_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ HTML obtenido: ${html.length} caracteres`);
    
    // Extraer con el método probado
    const extractedSections = await extractFromTechTabs(html);
    
    console.log(`🎯 Secciones de Tecnología extraídas: ${Object.keys(extractedSections).length}`);
    
    // Mostrar resumen
    Object.entries(extractedSections).forEach(([section, content]) => {
      console.log(`📋 ${section}: ${content.length} caracteres`);
      console.log(`   Preview: "${content.substring(0, 100)}..."`);
    });
    
    if (Object.keys(extractedSections).length === 0) {
      console.log('❌ No se extrajo contenido de Tecnología. Verificar estructura de la página.');
      return;
    }
    
    // Conectar a DB y guardar
    const Database = await loadDatabase();
    await Database.connect();
    
    // Limpiar datos anteriores de Tecnología
    console.log('🧹 Limpiando datos anteriores de Tecnología...');
    await Database.run(`DELETE FROM knowledge_base WHERE nombre_recurso = 'Tecnología en Desarrollo de Sistemas Informáticos - UTS'`);
    
    // Insertar contenido de Tecnología
    for (const [section, content] of Object.entries(extractedSections)) {
      if (content && content.length > 50) {
        console.log(`💾 Insertando ${section} de Tecnología...`);
        
        await Database.run(`
          INSERT INTO knowledge_base (
            pregunta, respuesta_texto, tipo_usuario, activo, 
            nombre_recurso, recurso_url, palabras_clave, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          `Información sobre ${section.replace('_', ' ')} del programa de Tecnología en Desarrollo de Sistemas Informáticos UTS`,
          content,
          'todos',
          1,
          'Tecnología en Desarrollo de Sistemas Informáticos - UTS',
          TECH_URL,
          section.replace('_', ' ') + ', tecnología sistemas, tecnólogo, UTS'
        ]);
        
        console.log(`✅ ${section} de Tecnología insertado correctamente`);
      }
    }
    
    console.log('🎉 Scraping de TECNOLOGÍA completado con éxito');
    console.log('ℹ️ NOTA: Contacto y docentes se reutilizan de Ingeniería de Sistemas');
    
  } catch (error) {
    console.error('❌ Error en scraping de Tecnología:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  scrapeTechProgram()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal en Tecnología:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeTechProgram };
