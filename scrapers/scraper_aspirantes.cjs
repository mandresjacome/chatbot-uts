// SCRAPER ESPECÍFICO PARA INFORMACIÓN DE ASPIRANTES UTS
// Extrae información relevante de https://www.uts.edu.co/sitio/proceso-modalidad-presencial/
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const loadDatabase = require('../src/utils/database-adapter.cjs');

console.log('🎯 Scraper para INFORMACIÓN DE ASPIRANTES UTS...');

const ASPIRANTES_URL = 'https://www.uts.edu.co/sitio/proceso-modalidad-presencial/';

// **EXTRACTOR ESPECÍFICO PARA INFORMACIÓN DE ASPIRANTES**
async function extractAspirantesInfo(html) {
  console.log('🔍 Extrayendo información para aspirantes...');
  const $ = cheerio.load(html);
  
  const sections = {};
  
  // 1. EXTRAER PROCESO DE ADMISIÓN PASO A PASO
  console.log('📋 Extrayendo proceso de admisión paso a paso...');
  let procesoAdmision = '';
  
  // Buscar todos los pasos del proceso
  const pasos = [];
  $('h3, h4').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('paso ') || text.toLowerCase().includes('step ')) {
      console.log(`   ✅ Encontrado: ${text}`);
      
      // Obtener el contenido después del título
      let content = text + '\n\n';
      
      // Buscar el contenido en los siguientes elementos
      $(el).nextUntil('h3, h4').each((j, nextEl) => {
        const nextText = $(nextEl).text().trim();
        if (nextText && nextText.length > 10) {
          content += nextText + '\n';
        }
      });
      
      if (content.length > 50) {
        pasos.push(content);
      }
    }
  });
  
  if (pasos.length > 0) {
    procesoAdmision = `Proceso de Admisión UTS - Modalidad Presencial:\n\n${pasos.join('\n---\n')}`;
    sections['proceso_admision'] = procesoAdmision;
  }
  
  // 2. EXTRAER CALENDARIO ACADÉMICO/FECHAS IMPORTANTES
  console.log('📋 Extrayendo calendario de aspirantes...');
  let calendario = '';
  
  // Buscar tabla o sección de calendario
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('calendario') && text.toLowerCase().includes('aspirante')) {
      console.log('   ✅ Encontrado calendario de aspirantes');
      
      // Extraer las fechas
      let calendarContent = 'Calendario Importantes para Aspirantes UTS:\n\n';
      
      // Buscar fechas específicas
      const parent = $(el).parent();
      parent.find('*').each((j, child) => {
        const childText = $(child).text().trim();
        if (childText.includes('2025') || childText.includes('Abril') || childText.includes('Julio') || childText.includes('Agosto')) {
          calendarContent += `• ${childText}\n`;
        }
      });
      
      if (calendarContent.length > 100) {
        calendario = calendarContent;
      }
    }
  });
  
  if (calendario) {
    sections['calendario_aspirantes'] = calendario;
  }
  
  // 3. EXTRAER DOCUMENTOS REQUERIDOS
  console.log('📋 Extrayendo documentos requeridos...');
  let documentos = '';
  
  // Buscar tabla de documentos
  $('table, ul, ol').each((i, el) => {
    const text = $(el).text();
    if (text.includes('Documento') && text.includes('formato') && text.includes('PDF')) {
      console.log('   ✅ Encontrada tabla de documentos');
      
      let docsContent = 'Documentos Requeridos para Inscripción:\n\n';
      
      $(el).find('tr, li').each((j, row) => {
        const rowText = $(row).text().trim();
        if (rowText && rowText.length > 10 && !rowText.toLowerCase().includes('documento ejemplo')) {
          docsContent += `• ${rowText}\n`;
        }
      });
      
      if (docsContent.length > 100) {
        documentos = docsContent;
      }
    }
  });
  
  if (documentos) {
    sections['documentos_requeridos'] = documentos;
  }
  
  // 4. EXTRAER INFORMACIÓN DE CONTACTO Y ASESORÍA
  console.log('📋 Extrayendo información de contacto...');
  let contactoAsesorias = '';
  
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes('Asesoría') && text.includes('Inscripciones')) {
      console.log('   ✅ Encontrada información de asesoría');
      
      let contactContent = 'Asesoría e Información para Aspirantes:\n\n';
      
      // Buscar el contenido de contacto
      const parent = $(el).closest('div, section, p');
      parent.find('*').each((j, child) => {
        const childText = $(child).text().trim();
        if (childText.includes('@') || childText.includes('teléfono') || childText.includes('ubicado')) {
          contactContent += `${childText}\n`;
        }
      });
      
      if (contactContent.length > 100) {
        contactoAsesorias = contactContent;
      }
    }
  });
  
  if (contactoAsesorias) {
    sections['contacto_asesorias'] = contactoAsesorias;
  }
  
  // 5. EXTRAER INFORMACIÓN SOBRE BECAS Y GRATUIDAD
  console.log('📋 Extrayendo información sobre becas...');
  let becas = '';
  
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('beca') || text.toLowerCase().includes('gratuidad')) {
      console.log('   ✅ Encontrada información sobre becas');
      
      let becasContent = 'Información sobre Becas y Gratuidad:\n\n';
      becasContent += text;
      
      if (becasContent.length > 50) {
        becas = becasContent;
      }
    }
  });
  
  if (becas) {
    sections['becas_gratuidad'] = becas;
  }
  
  // 6. EXTRAER COSTOS Y VALORES
  console.log('📋 Extrayendo información de costos...');
  let costos = '';
  
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes('$') && (text.includes('inscripción') || text.includes('matrícula'))) {
      console.log('   ✅ Encontrada información de costos');
      
      let costosContent = 'Costos de Inscripción y Matrícula:\n\n';
      costosContent += text;
      
      if (costosContent.length > 30) {
        costos = costosContent;
      }
    }
  });
  
  if (costos) {
    sections['costos_pagos'] = costos;
  }
  
  // 7. EXTRAER ENLACES IMPORTANTES
  console.log('📋 Extrayendo enlaces importantes...');
  const enlacesImportantes = [];
  
  $('a').each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    
    if (text && href && href.startsWith('http') && text.length > 5) {
      // Filtrar enlaces relevantes para aspirantes
      const relevantKeywords = ['inscri', 'pago', 'liquidación', 'formulario', 'admisi', 'matricula', 'calendario'];
      
      if (relevantKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        enlacesImportantes.push(`• ${text}: ${href}`);
      }
    }
  });
  
  if (enlacesImportantes.length > 0) {
    sections['enlaces_importantes'] = `Enlaces Importantes para Aspirantes:\n\n${enlacesImportantes.join('\n')}`;
  }
  
  return sections;
}

// Función principal para scraping de aspirantes
async function scrapeAspirantesInfo() {
  try {
    console.log('🌐 Conectando a página de Proceso Modalidad Presencial UTS...');
    
    const response = await fetch(ASPIRANTES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ HTML obtenido: ${html.length} caracteres`);
    
    // Extraer información específica para aspirantes
    const extractedSections = await extractAspirantesInfo(html);
    
    console.log(`🎯 Secciones de Aspirantes extraídas: ${Object.keys(extractedSections).length}`);
    
    // Mostrar resumen
    Object.entries(extractedSections).forEach(([section, content]) => {
      console.log(`📋 ${section}: ${content.length} caracteres`);
      console.log(`   Preview: "${content.substring(0, 100)}..."`);
    });
    
    if (Object.keys(extractedSections).length === 0) {
      console.log('❌ No se extrajo información de aspirantes. Verificar estructura de la página.');
      return;
    }
    
    // Conectar a DB y guardar
    const Database = await loadDatabase();
    await Database.connect();
    
    // Limpiar datos anteriores de aspirantes
    console.log('🧹 Limpiando datos anteriores de aspirantes...');
    await Database.run(`DELETE FROM knowledge_base WHERE nombre_recurso = 'Información para Aspirantes - UTS'`);
    
    // Insertar información para aspirantes
    for (const [section, content] of Object.entries(extractedSections)) {
      if (content && content.length > 50) {
        console.log(`💾 Insertando ${section} de información aspirantes...`);
        
        await Database.run(`
          INSERT INTO knowledge_base (
            pregunta, respuesta_texto, tipo_usuario, activo, 
            nombre_recurso, recurso_url, palabras_clave, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          `Información sobre ${section.replace('_', ' ')} para aspirantes UTS`,
          content,
          'aspirante', // Específico para tipo usuario aspirante
          1,
          'Información para Aspirantes - UTS',
          ASPIRANTES_URL,
          section.replace('_', ' ') + ', aspirantes, admisiones, inscripciones, UTS'
        ]);
        
        console.log(`✅ ${section} para aspirantes insertado correctamente`);
      }
    }
    
    console.log('🎉 Scraping de INFORMACIÓN ASPIRANTES completado con éxito');
    console.log('🎯 Información específica para tipo de usuario: ASPIRANTE');
    
  } catch (error) {
    console.error('❌ Error en scraping de información aspirantes:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  scrapeAspirantesInfo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal en información aspirantes:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeAspirantesInfo };
