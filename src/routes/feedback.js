import { Router } from 'express';
import { Feedback } from '../db/repositories.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/feedback
 * { "conversationId": number, "useful": true|false, "comment": "..." }
 */
router.post('/', async (req, res) => {
  try {
    const { conversationId, useful, comment } = req.body || {};
    if (!conversationId || typeof useful !== 'boolean') {
      logger.warn('FEEDBACK', 'Datos de feedback inválidos', { conversationId, useful, hasComment: !!comment });
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }
    
    logger.info('FEEDBACK', `Nuevo feedback: ${useful ? 'útil' : 'no útil'}`, {
      conversationId,
      useful,
      hasComment: !!comment,
      commentLength: comment?.length || 0
    });
    
    const id = await Feedback.create({ conversation_id: conversationId, useful, comment });
    
    logger.dbOperation('INSERT', 'feedback', { feedbackId: id, conversationId });
    
    res.json({ success: true, id });
  } catch (err) {
    logger.error('FEEDBACK', 'Error guardando feedback', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

/**
 * GET /api/feedback/list
 * Obtiene la lista de feedback para el panel de administración
 */
router.get('/list', async (req, res) => {
  try {
    logger.info('FEEDBACK', 'Consultando lista de feedback');
    const feedbackList = await Feedback.list();
    logger.info('FEEDBACK', `Lista de feedback obtenida: ${feedbackList.length} entradas`);
    res.json({
      success: true,
      data: feedbackList
    });
  } catch (err) {
    logger.error('FEEDBACK', 'Error obteniendo lista de feedback', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

export default router;
