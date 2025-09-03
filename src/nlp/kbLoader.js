// src/nlp/kbLoader.js
import { queryAll, exec } from '../db/index.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadInitialData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'knowledge.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    logger.info('KB', 'Cargando datos iniciales desde knowledge.json...');
    
    let insertedCount = 0;
    for (const item of data) {
      await exec(`
        INSERT INTO knowledge_base (pregunta, respuesta_texto, tipo_usuario, palabras_clave, activo)
        VALUES (?, ?, ?, ?, ?)
      `, [
        item.pregunta,
        item.respuesta_texto,
        item.tipo_usuario || 'todos',
        item.palabras_clave || '',
        true
      ]);
      insertedCount++;
    }
    
    logger.info('KB', `✅ Datos iniciales cargados: ${insertedCount} registros`);
    return insertedCount;
  } catch (error) {
    logger.error('KB', 'Error cargando datos iniciales', error);
    return 0;
  }
}

export async function loadKB() {
  try {
    logger.startup('Verificando base de conocimiento...');
    const rows = await queryAll('SELECT COUNT(*) as total FROM knowledge_base');
    const total = rows[0]?.total || 0;
    
    if (total > 0) {
      logger.knowledgeLoaded(total, 'base de datos');
    } else {
      logger.warn('KB', 'Base de conocimiento vacía, cargando datos iniciales...');
      const loaded = await loadInitialData();
      if (loaded > 0) {
        logger.knowledgeLoaded(loaded, 'datos iniciales');
        return loaded;
      }
    }
    
    return Number(total);
  } catch (error) {
    logger.error('KB', 'Error cargando base de conocimiento', error);
    return 0;
  }
}
