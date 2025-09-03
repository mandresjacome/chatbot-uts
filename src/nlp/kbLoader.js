// src/nlp/kbLoader.js
import { queryAll } from '../db/index.js';
import { logger } from '../utils/logger.js';

export async function loadKB() {
  try {
    logger.startup('Verificando base de conocimiento...');
    const rows = await queryAll('SELECT COUNT(*) as total FROM knowledge_base');
    const total = rows[0]?.total || 0;
    
    if (total > 0) {
      logger.knowledgeLoaded(total, 'base de datos');
    } else {
      logger.warn('KB', 'Base de conocimiento vacía', { total });
    }
    
    return Number(total);
  } catch (error) {
    logger.error('KB', 'Error cargando base de conocimiento', error);
    return 0;
  }
}
