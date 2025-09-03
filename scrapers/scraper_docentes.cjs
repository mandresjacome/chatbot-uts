// SCRAPER ESPECÍFICO PARA INFORMACIÓN DE DOCENTES UTS
// Extrae información relevante de https://www.uts.edu.co/sitio/docentes/
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const loadDatabase = require('../src/utils/database-adapter.cjs');

console.log('👨‍🏫 Scraper para INFORMACIÓN DE DOCENTES UTS...');

const DOCENTES_URL = 'https://www.uts.edu.co/sitio/docentes/';

// **EXTRACTOR ESPECÍFICO PARA INFORMACIÓN DE DOCENTES**
async function extractDocentesInfo(html) {
  console.log('🔍 Extrayendo información para docentes...');
  const $ = cheerio.load(html);
  
  const sections = {};
  
  // 1. EXTRAER SECCIÓN "MANTENTE INFORMADO"
  console.log('📋 Extrayendo sección "Mantente Informado"...');
  let informadoContent = '';
  
  // Buscar por el título y extraer los enlaces
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('informado')) {
      console.log('   ✅ Encontrada sección Informado');
      
      // Buscar los enlaces en la sección siguiente
      const container = $(el).parent();
      const links = container.find('a').map((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          return `• ${text}: ${href}`;
        }
      }).get();
      
      if (links.length > 0) {
        informadoContent = `Documentos y recursos importantes para docentes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  // 2. EXTRAER SECCIÓN "SERVICIOS"
  console.log('📋 Extrayendo sección "Servicios"...');
  let serviciosContent = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('servicios')) {
      console.log('   ✅ Encontrada sección Servicios');
      
      const container = $(el).parent();
      const links = container.find('a').map((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          return `• ${text}: ${href}`;
        }
      }).get();
      
      if (links.length > 0) {
        serviciosContent = `Servicios disponibles para docentes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  // 3. EXTRAER SECCIÓN "ACADÉMICO"
  console.log('📋 Extrayendo sección "Académico"...');
  let academicoContent = '';
  
  $('h2').each((i, el) => {
    const title = $(el).text().trim().toLowerCase();
    if (title.includes('académico')) {
      console.log('   ✅ Encontrada sección Académico');
      
      const container = $(el).parent();
      const links = container.find('a').map((j, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href && text.length > 5) {
          return `• ${text}: ${href}`;
        }
      }).get();
      
      if (links.length > 0) {
        academicoContent = `Recursos académicos para docentes UTS:\n\n${links.join('\n')}`;
      }
    }
  });
  
  // 4. EXTRAER INFORMACIÓN GENERAL SOBRE DOCENCIA UTS
  console.log('📋 Extrayendo información general sobre docencia...');
  let misionDocenteContent = '';
  
  // Buscar párrafos que contengan información sobre la docencia
  $('p').each((i, p) => {
    const text = $(p).text().trim();
    if (text.includes('docente') && text.includes('educativo') && text.length > 100) {
      misionDocenteContent = text;
      console.log('   ✅ Encontrada misión docente');
      return false; // break
    }
  });
  
  // 5. EXTRAER ENLACES ESPECÍFICOS POR CATEGORÍAS
  console.log('📋 Organizando información por categorías...');
  
  const enlaces = [];
  $('a').each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    
    if (text && href && href.startsWith('http') && text.length > 5) {
      // Categorizar enlaces
      let categoria = 'general';
      
      if (text.toLowerCase().includes('reglamento') || text.toLowerCase().includes('estatuto')) {
        categoria = 'normatividad';
      } else if (text.toLowerCase().includes('portal') || text.toLowerCase().includes('plataforma')) {
        categoria = 'plataformas';
      } else if (text.toLowerCase().includes('biblioteca') || text.toLowerCase().includes('base')) {
        categoria = 'recursos';
      } else if (text.toLowerCase().includes('tutoría') || text.toLowerCase().includes('académico')) {
        categoria = 'academico';
      }
      
      enlaces.push({ texto: text, url: href, categoria });
    }
  });
  
  // Organizar por categorías
  const categorias = ['normatividad', 'plataformas', 'recursos', 'academico'];
  categorias.forEach(cat => {
    const enlacesCat = enlaces.filter(e => e.categoria === cat);
    if (enlacesCat.length > 0) {
      const contenido = enlacesCat.map(e => `• ${e.texto}: ${e.url}`).join('\n');
      sections[cat] = `${cat.charAt(0).toUpperCase() + cat.slice(1)} para docentes UTS:\n\n${contenido}`;
    }
  });
  
  // Agregar las secciones principales
  if (informadoContent) sections['informacion_docentes'] = informadoContent;
  if (serviciosContent) sections['servicios_docentes'] = serviciosContent;
  if (academicoContent) sections['recursos_academicos'] = academicoContent;
  if (misionDocenteContent) sections['mision_docente'] = `Sobre la docencia en UTS:\n\n${misionDocenteContent}`;
  
  return sections;
}

// Función principal para scraping de docentes
async function scrapeDocentesInfo() {
  try {
    console.log('🌐 Conectando a página de Docentes UTS...');
    
    const response = await fetch(DOCENTES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ HTML obtenido: ${html.length} caracteres`);
    
    // Extraer información específica para docentes
    const extractedSections = await extractDocentesInfo(html);
    
    console.log(`🎯 Secciones de Docentes extraídas: ${Object.keys(extractedSections).length}`);
    
    // Mostrar resumen
    Object.entries(extractedSections).forEach(([section, content]) => {
      console.log(`📋 ${section}: ${content.length} caracteres`);
      console.log(`   Preview: "${content.substring(0, 100)}..."`);
    });
    
    if (Object.keys(extractedSections).length === 0) {
      console.log('❌ No se extrajo información de docentes. Verificar estructura de la página.');
      return;
    }
    
    // Conectar a DB y guardar
    const Database = await loadDatabase();
    await Database.connect();
    
    // Limpiar datos anteriores de docentes
    console.log('🧹 Limpiando datos anteriores de docentes...');
    await Database.run(`DELETE FROM knowledge_base WHERE nombre_recurso = 'Información para Docentes - UTS'`);
    
    // Insertar información para docentes
    for (const [section, content] of Object.entries(extractedSections)) {
      if (content && content.length > 50) {
        console.log(`💾 Insertando ${section} de información docentes...`);
        
        await Database.run(`
          INSERT INTO knowledge_base (
            pregunta, respuesta_texto, tipo_usuario, activo, 
            nombre_recurso, recurso_url, palabras_clave, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          `Información sobre ${section.replace('_', ' ')} para docentes UTS`,
          content,
          'docente', // Específico para tipo usuario docente
          1,
          'Información para Docentes - UTS',
          DOCENTES_URL,
          section.replace('_', ' ') + ', docentes, profesores, UTS, académico'
        ]);
        
        console.log(`✅ ${section} para docentes insertado correctamente`);
      }
    }
    
    console.log('🎉 Scraping de INFORMACIÓN DOCENTES completado con éxito');
    console.log('👨‍🏫 Información específica para tipo de usuario: DOCENTE');
    
  } catch (error) {
    console.error('❌ Error en scraping de información docentes:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  scrapeDocentesInfo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal en información docentes:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeDocentesInfo };
