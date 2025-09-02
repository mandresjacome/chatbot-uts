import { Router } from 'express';
import { retrieveTopK } from '../nlp/retriever.js';
import { answerLLM } from '../ai/geminiClient.js';
import { Conversations } from '../db/repositories.js';
import { ensureSessionId } from '../utils/id.js';

const router = Router();

router.post('/message', async (req, res) => {
  try {
    const { message = '', userType = 'todos', sessionId } = req.body || {};
    const clean = String(message || '').trim();
    if (!clean) return res.status(400).json({ success: false, error: 'Mensaje vacío' });

    const sess = ensureSessionId(sessionId);

    // 1) Evidencia local
    const { chunks, meta } = retrieveTopK({ query: clean, userType, k: 3 });

    // 2) IA / mock
    const responseText = await answerLLM({
      question: clean,
      evidenceChunks: chunks,
      userType
    });

    // 3) Guardar conversación
    const knowledgeRefs = chunks.length ? chunks.map(c => c.titulo).join(' | ') : null;
    const conversationId = await Conversations.create({
      session_id: sess,
      pregunta: clean,
      respuesta: responseText,
      tipo_usuario: userType,
      knowledge_refs: knowledgeRefs
    });

    return res.json({
      success: true,
      response: responseText,
      evidenceCount: chunks.length,
      meta: { ...meta, model: process.env.USE_LLM },
      conversationId,
      sessionId: sess
    });
  } catch (err) {
    console.error('[chat/message] error:', err);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
});

export default router;
