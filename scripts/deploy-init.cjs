/**
 * Script de inicialización optimizada para deploy
 * Evita operaciones pesadas que causan timeout
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando configuración de deploy...');

// 1. Verificar estructura mínima de directorios
const requiredDirs = ['logs', 'cache', 'src/db'];
requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Creado directorio: ${dir}`);
  }
});

// 2. Crear archivo de cache mínimo si no existe
const cacheFile = path.join(process.cwd(), 'cache/database.json');
if (!fs.existsSync(cacheFile)) {
  const minimalCache = {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    deploy_mode: true,
    entries: []
  };
  fs.writeFileSync(cacheFile, JSON.stringify(minimalCache, null, 2));
  console.log('✅ Cache mínimo creado');
}

// 3. Verificar base de datos
const dbPath = path.join(process.cwd(), 'src/db/database.db');
if (!fs.existsSync(dbPath)) {
  // Crear archivo de base de datos vacío
  fs.writeFileSync(dbPath, '');
  console.log('✅ Archivo de base de datos creado');
}

// 4. Verificar knowledge.json
const knowledgePath = path.join(process.cwd(), 'src/data/knowledge.json');
if (!fs.existsSync(knowledgePath)) {
  const minimalKnowledge = [];
  fs.writeFileSync(knowledgePath, JSON.stringify(minimalKnowledge, null, 2));
  console.log('✅ Knowledge.json mínimo creado');
}

console.log('🎉 Configuración de deploy completada');
