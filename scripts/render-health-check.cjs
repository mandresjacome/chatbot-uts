#!/usr/bin/env node
// scripts/render-health-check.cjs
// Verificación específica para deployments en Render

const path = require('path');
const fs = require('fs');

console.log('🔍 RENDER HEALTH CHECK - Verificando compatibilidad...');
console.log('=' .repeat(60));

// 1. Verificar variables de entorno críticas
function checkEnvVars() {
  console.log('\n📋 1. VARIABLES DE ENTORNO');
  
  const required = ['DATABASE_URL', 'NODE_ENV', 'PORT'];
  const optional = ['RENDER', 'ADMIN_TOKEN', 'GEMINI_API_KEY'];
  
  let allGood = true;
  
  for (const env of required) {
    const value = process.env[env];
    if (value) {
      console.log(`✅ ${env}: ${env === 'DATABASE_URL' ? '[OCULTO]' : value}`);
    } else {
      console.log(`❌ ${env}: NO CONFIGURADO`);
      allGood = false;
    }
  }
  
  console.log('\n📋 Opcionales:');
  for (const env of optional) {
    const value = process.env[env];
    console.log(`${value ? '✅' : '⚪'} ${env}: ${value || 'no configurado'}`);
  }
  
  return allGood;
}

// 2. Verificar archivos críticos
function checkFiles() {
  console.log('\n📁 2. ARCHIVOS CRÍTICOS');
  
  const critical = [
    'src/server.js',
    'src/db/index.js',
    'src/nlp/retriever.js',
    'cache/database.json',
    'config/automation.json'
  ];
  
  let allGood = true;
  
  for (const file of critical) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      console.log(`✅ ${file} (${size} bytes)`);
    } else {
      console.log(`❌ ${file}: NO ENCONTRADO`);
      allGood = false;
    }
  }
  
  return allGood;
}

// 3. Verificar configuración PostgreSQL
function checkPgConfig() {
  console.log('\n🗄️ 3. CONFIGURACIÓN POSTGRESQL');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL no configurado');
    return false;
  }
  
  const url = process.env.DATABASE_URL;
  
  try {
    const parsed = new URL(url);
    console.log(`✅ Host: ${parsed.hostname}`);
    console.log(`✅ Puerto: ${parsed.port || 5432}`);
    console.log(`✅ Base de datos: ${parsed.pathname.substring(1)}`);
    console.log(`✅ SSL: ${url.includes('sslmode=require') ? 'Requerido' : 'Opcional'}`);
    return true;
  } catch (error) {
    console.log(`❌ URL inválida: ${error.message}`);
    return false;
  }
}

// 4. Verificar cache de fallback
function checkCache() {
  console.log('\n💾 4. CACHE DE FALLBACK');
  
  const cachePath = path.join(process.cwd(), 'cache', 'database.json');
  
  if (!fs.existsSync(cachePath)) {
    console.log('❌ Cache no encontrado en cache/database.json');
    return false;
  }
  
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const records = cache.data?.length || 0;
    
    console.log(`✅ Cache válido: ${records} registros`);
    console.log(`✅ Timestamp: ${cache.timestamp}`);
    console.log(`✅ Hash: ${cache.hash}`);
    
    if (records === 0) {
      console.log('⚠️ Cache vacío - podría afectar el fallback');
    }
    
    return records > 0;
  } catch (error) {
    console.log(`❌ Cache corrupto: ${error.message}`);
    return false;
  }
}

// 5. Verificar configuración de automation
function checkAutomation() {
  console.log('\n⚙️ 5. CONFIGURACIÓN AUTOMATION');
  
  const configPath = path.join(process.cwd(), 'config', 'automation.json');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ automation.json no encontrado');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    console.log(`✅ Automatización: ${config.automation?.enabled ? 'Habilitada' : 'Deshabilitada'}`);
    console.log(`✅ Modo: ${config.automation?.mode || 'no configurado'}`);
    console.log(`✅ Tareas: ${Object.keys(config.automation?.tasks || {}).length}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Config inválida: ${error.message}`);
    return false;
  }
}

// Ejecutar todas las verificaciones
async function runHealthCheck() {
  console.log(`🚀 Iniciando health check - ${new Date().toISOString()}`);
  
  const results = {
    envVars: checkEnvVars(),
    files: checkFiles(),
    postgres: checkPgConfig(),
    cache: checkCache(),
    automation: checkAutomation()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  
  for (const [check, passed] of Object.entries(results)) {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) allPassed = false;
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 TODAS LAS VERIFICACIONES PASARON');
    console.log('✅ El deploy debería funcionar correctamente');
    process.exit(0);
  } else {
    console.log('⚠️ ALGUNAS VERIFICACIONES FALLARON');
    console.log('❌ Revisar configuración antes del deploy');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };