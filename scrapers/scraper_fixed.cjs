const fetch = require('node-fetch');
const cheerio = require('cheerio');
const loadDatabase = require('../src/utils/database-adapter.cjs');

console.log('🚀 Scraper CORREGIDO para tabs/acordeones UTS...');

const TARGET_URL = 'https://www.uts.edu.co/sitio/ingenieria-de-sistemas/';

// **EXTRACTOR ESPECÍFICO PARA TABS/ACORDEONES**
async function extractFromTabs(html) {
  console.log('🔍 Extrayendo contenido de tabs/acordeones...');
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
      'docentes': 'docentes',
      'contacto': 'contacto'
    };
    
    const sectionKey = sectionMapping[title];
    if (sectionKey) {
      console.log(`✅ Procesando: ${title} → ${sectionKey}`);
      
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
  
  // Si no funciona con tabs, buscar contenido específico por patrones
  if (Object.keys(sections).length < 4) {
    console.log('🔄 Buscando contenido por patrones específicos...');
    
    // Patrones específicos basados en lo que sabemos que existe
    const patterns = {
      'campos_de_accion': {
        start: 'El Ingeniero de Sistemas de las Unidades Tecnológicas de Santander podrá desempeñarse',
        keywords: ['Gerente de Proyectos', 'Ingeniero de Software', 'Analista']
      },
      'perfil_profesional': {
        start: 'El Ingeniero de Sistemas de las Unidades Tecnológicas de Santander estará en capacidad de:',
        keywords: ['Desarrollar sistemas software', 'Modelar y simular']
      },
      'presentacion': {
        start: 'SNIES:',
        keywords: ['101596', 'duración', 'semestres']
      },
      'plan_de_estudios': {
        keywords: ['Analizar y valorar el impacto social', 'técnicas y metodologías']
      },
      'resultados_aprendizaje': {
        keywords: ['Resultados del aprendizaje', 'competencias']
      },
      'contacto': {
        keywords: ['contacto', 'información', 'teléfono', 'correo']
      }
    };
    
    Object.entries(patterns).forEach(([sectionKey, pattern]) => {
      if (!sections[sectionKey]) {
        console.log(`🔍 Buscando ${sectionKey} por patrones...`);
        
        // Buscar por texto inicial si existe
        if (pattern.start) {
          const startElement = $(`*:contains("${pattern.start}")`).first();
          if (startElement.length) {
            let content = startElement.text().trim();
            
            // Limpiar y truncar contenido
            content = content
              .substring(content.indexOf(pattern.start))
              .substring(0, 2000)
              .trim();
              
            if (content.length > 100) {
              sections[sectionKey] = content;
              console.log(`   ✅ ${sectionKey} encontrado por texto inicial: ${content.length} chars`);
              return;
            }
          }
        }
        
        // Buscar por palabras clave
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

// Función principal
async function scrapeUtsProgram() {
  try {
    console.log('🌐 Conectando a UTS...');
    
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ HTML obtenido: ${html.length} caracteres`);
    
    // Extraer con el nuevo método
    const extractedSections = await extractFromTabs(html);
    
    console.log(`🎯 Secciones extraídas: ${Object.keys(extractedSections).length}`);
    
    // Mostrar resumen
    Object.entries(extractedSections).forEach(([section, content]) => {
      console.log(`📋 ${section}: ${content.length} caracteres`);
      console.log(`   Preview: "${content.substring(0, 100)}..."`);
    });
    
    if (Object.keys(extractedSections).length === 0) {
      console.log('❌ No se extrajo contenido. Verificar estructura de la página.');
      return;
    }
    
    // Conectar a DB y guardar
    const Database = await loadDatabase();
    await Database.connect();
    
    // Limpiar datos anteriores
    console.log('🧹 Limpiando base de datos...');
    await Database.run(`DELETE FROM knowledge_base WHERE nombre_recurso = 'Ingeniería de Sistemas - UTS'`);
    
    // Insertar contenido limpio
    for (const [section, content] of Object.entries(extractedSections)) {
      if (content && content.length > 50) {
        console.log(`💾 Insertando ${section}...`);
        
        await Database.run(`
          INSERT INTO knowledge_base (
            pregunta, respuesta_texto, tipo_usuario, activo, 
            nombre_recurso, recurso_url, palabras_clave, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          `Información sobre ${section.replace('_', ' ')} del programa de Ingeniería de Sistemas UTS`,
          content,
          'todos',
          1,
          'Ingeniería de Sistemas - UTS',
          TARGET_URL,
          section.replace('_', ' ') + ', ingeniería sistemas, UTS'
        ]);
        
        console.log(`✅ ${section} insertado correctamente`);
      }
    }
    
    console.log('🎉 Scraping completado con contenido CORRECTO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  scrapeUtsProgram()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeUtsProgram };
