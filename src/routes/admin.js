import { Router } from 'express';
import { Conversations, Feedback } from '../db/repositories.js';

const router = Router();

router.get('/metrics', async (_req, res) => {
  try {
    const [totalConversations, lastConvs, fbStats] = await Promise.all([
      Conversations.totals(),
      Conversations.last(10),
      Feedback.stats()
    ]);
    res.json({
      success: true,
      data: {
        totalConversations,
        lastConversations: lastConvs,
        feedback: fbStats
      }
    });
  } catch (err) {
    console.error('[admin/metrics] error:', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

export default router;
