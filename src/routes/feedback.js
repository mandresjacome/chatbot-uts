import { Router } from 'express';
import { Feedback } from '../db/repositories.js';

const router = Router();

/**
 * POST /api/feedback
 * { "conversationId": number, "useful": true|false, "comment": "..." }
 */
router.post('/', async (req, res) => {
  try {
    const { conversationId, useful, comment } = req.body || {};
    if (!conversationId || typeof useful !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }
    const id = await Feedback.create({ conversation_id: conversationId, useful, comment });
    res.json({ success: true, id });
  } catch (err) {
    console.error('[feedback] error:', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

export default router;
