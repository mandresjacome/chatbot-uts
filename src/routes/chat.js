import { Router } from 'express';
import { retrieveTopK } from '../nlp/retriever.js';
import { answerLLM } from '../ai/geminiClient.js';
import { Conversations } from '../db/repositories.js';
import { ensureSessionId } from '../utils/id.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/message', async (req, res) => {
  const startTime = Date.now();
  let sessionId = null;
  
  try {
    const { message = '', userType = 'todos', sessionId: providedSessionId } = req.body || {};
    const clean = String(message || '').trim();
    
    // Validación de entrada
    if (!clean) {
      logger.warn('CHAT', 'Mensaje vacío recibido', { userType, sessionId: providedSessionId });
      return res.status(400).json({ success: false, error: 'Mensaje vacío' });
    }

    sessionId = ensureSessionId(providedSessionId);
    
    logger.chat('Inicio', `Nueva consulta`, {
      sessionId,
      userType,
      question: clean.substring(0, 50) + (clean.length > 50 ? '...' : ''),
      questionLength: clean.length
    });

    // 1) Búsqueda de evidencia local
    const retrievalStart = Date.now();
    const { chunks, meta } = retrieveTopK({ query: clean, userType, k: 3 });
    const retrievalTime = Date.now() - retrievalStart;
    
    logger.info('RETRIEVER', `Evidencia encontrada`, {
      retrievalTimeMs: retrievalTime,
      evidenceCount: chunks.length
    });

    // 2) Generación de respuesta con IA
    const llmStart = Date.now();
    const responseText = await answerLLM({
      question: clean,
      evidenceChunks: chunks,
      userType
    });
    const llmTime = Date.now() - llmStart;
    
    logger.info('AI', `Respuesta generada`, {
      llmTimeMs: llmTime,
      responseLength: responseText.length
    });

    // 3) Guardar conversación en base de datos
    const dbStart = Date.now();
    const knowledgeRefs = chunks.length ? chunks.map(c => c.titulo).join(' | ') : null;
    const conversationId = await Conversations.create({
      session_id: sessionId,
      pregunta: clean,
      respuesta: responseText,
      tipo_usuario: userType,
      knowledge_refs: knowledgeRefs
    });
    const dbTime = Date.now() - dbStart;
    
    logger.dbOperation('INSERT', 'conversations', {
      conversationId,
      dbTimeMs: dbTime
    });

    const totalTime = Date.now() - startTime;
    
    // Log final de la conversación completa
    logger.conversation(sessionId, userType, clean, responseText, chunks, {
      totalTimeMs: totalTime,
      retrievalTimeMs: retrievalTime,
      llmTimeMs: llmTime,
      dbTimeMs: dbTime
    });

    return res.json({
      success: true,
      response: responseText,
      evidenceCount: chunks.length,
      references: chunks.map(c => ({
        id: c.id,
        titulo: c.titulo,
        url: c.url,
        nombreRecurso: c.nombreRecurso
      })),
      meta: { ...meta, model: process.env.USE_LLM },
      conversationId,
      sessionId
    });
    
  } catch (err) {
    const totalTime = Date.now() - startTime;
    logger.error('CHAT', 'Error procesando mensaje', {
      ...err,
      sessionId,
      totalTimeMs: totalTime
    });
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
});

export default router;
