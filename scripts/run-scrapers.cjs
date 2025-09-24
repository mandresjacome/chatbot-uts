#!/usr/bin/env node

// Script para ejecutar todos los scrapers del chatbot UTS
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const scrapers = [
  'scrapers/scraper_fixed.cjs',         // Información general de Ingeniería
  'scrapers/scraper_aspirantes.cjs',    // Información para aspirantes
  'scrapers/scraper_docentes.cjs',      // Información para docentes  
  'scrapers/scraper_estudiantes.cjs',   // Información para estudiantes
  'scrapers/scraper_tecnologia.cjs'     // Información de Tecnología
];

async function runScraper(scraperPath) {
  console.log(`\n🚀 Ejecutando ${scraperPath}...`);
  
  try {
    const { stdout, stderr } = await execAsync(`node ${scraperPath}`);
    
    if (stdout) {
      // Mostrar solo líneas importantes del output
      const lines = stdout.split('\n');
      const importantLines = lines.filter(line => 
        line.includes('✅') || 
        line.includes('🎉') || 
        line.includes('🎯') ||
        line.includes('❌') ||
        line.includes('💾')
      );
      importantLines.forEach(line => console.log(line));
    }
    
    if (stderr) {
      console.error('⚠️ Advertencias:', stderr);
    }
    
    console.log(`✅ ${scraperPath} completado exitosamente\n`);
    
  } catch (error) {
    console.error(`❌ Error en ${scraperPath}:`, error.message);
    throw error;
  }
}

async function runAllScrapers() {
  console.log('🔄 Iniciando actualización de la base de conocimiento...\n');
  console.log(`📋 Scrapers a ejecutar: ${scrapers.length}`);
  
  let completed = 0;
  let failed = 0;
  
  for (const scraper of scrapers) {
    try {
      await runScraper(scraper);
      completed++;
      console.log('⏳ Esperando 1 segundo antes del siguiente scraper...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      failed++;
      console.error(`💥 Falló ${scraper}, continuando con el siguiente...\n`);
    }
  }
  
  console.log('📊 RESUMEN DE EJECUCIÓN:');
  console.log(`✅ Completados: ${completed}/${scrapers.length}`);
  console.log(`❌ Fallidos: ${failed}/${scrapers.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todos los scrapers ejecutados exitosamente!');
    console.log('📚 La base de conocimiento ha sido actualizada completamente.');
    
    // Invalidar cache de sugerencias automáticamente
    await invalidateSuggestionsCache();
  } else {
    console.log(`\n⚠️ ${failed} scraper(s) fallaron. Revisa los errores arriba.`);
  }
}

// Función para invalidar cache de sugerencias
async function invalidateSuggestionsCache() {
  try {
    console.log('\n🔄 Invalidando cache de sugerencias...');
    
    const fetch = require('node-fetch').default || require('node-fetch');
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    
    const response = await fetch(`${serverUrl}/chat/suggestions/invalidate-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Cache de sugerencias invalidado correctamente');
      console.log('🚀 Las sugerencias se regenerarán con la nueva información');
    } else {
      console.log('⚠️ No se pudo invalidar el cache (servidor puede estar apagado)');
    }
    
  } catch (error) {
    console.log('⚠️ No se pudo conectar al servidor para invalidar cache:', error.message);
    console.log('💡 La secretaria puede refrescar manualmente desde el panel admin');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllScrapers().catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { runScraper, runAllScrapers };
