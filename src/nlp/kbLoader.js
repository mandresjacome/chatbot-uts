// src/nlp/kbLoader.js
import { queryAll, exec, dbEngine } from '../db/index.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadInitialData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'knowledge.json');
    
    if (!fs.existsSync(dataPath)) {
      logger.error('KB', `Archivo knowledge.json no encontrado en: ${dataPath}`);
      return 0;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    logger.info('KB', `Cargando datos iniciales desde knowledge.json... (${data.length} registros)`);
    
    const isPg = dbEngine() === 'pg';
    let insertedCount = 0;
    
    for (const item of data) {
      try {
        // Usar sintaxis específica según la base de datos
        if (isPg) {
          await exec(`
            INSERT INTO knowledge_base (pregunta, respuesta_texto, tipo_usuario, palabras_clave, recurso_url, nombre_recurso, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            item.pregunta || '',
            item.respuesta_texto || '',
            item.tipo_usuario || 'todos',
            item.palabras_clave || '',
            item.recurso_url || null,
            item.nombre_recurso || null,
            true
          ]);
        } else {
          await exec(`
            INSERT INTO knowledge_base (pregunta, respuesta_texto, tipo_usuario, palabras_clave, recurso_url, nombre_recurso, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            item.pregunta || '',
            item.respuesta_texto || '',
            item.tipo_usuario || 'todos',
            item.palabras_clave || '',
            item.recurso_url || null,
            item.nombre_recurso || null,
            1
          ]);
        }
        insertedCount++;
      } catch (itemError) {
        logger.error('KB', `Error insertando registro ${insertedCount + 1}:`, {
          error: itemError.message,
          pregunta: item.pregunta?.substring(0, 50) + '...'
        });
      }
    }
    
    logger.info('KB', `✅ Datos iniciales cargados: ${insertedCount}/${data.length} registros`);
    return insertedCount;
  } catch (error) {
    logger.error('KB', 'Error cargando datos iniciales:', {
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
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
