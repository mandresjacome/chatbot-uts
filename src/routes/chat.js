import { Router } from 'express';
import { retrieveTopK } from '../nlp/retriever.js';
import { answerLLM } from '../ai/geminiClient.js';
import { getStaticSuggestions } from '../nlp/staticSuggestions.js';
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

    // 1) Obtener historial de conversación
    const historyStart = Date.now();
    const conversationHistory = await Conversations.getHistoryBySession(sessionId, 5);
    const historyTime = Date.now() - historyStart;
    
    logger.info('HISTORY', `Historial recuperado`, {
      historyTimeMs: historyTime,
      conversationsFound: conversationHistory.length
    });

    // 2) Búsqueda de evidencia local
    const retrievalStart = Date.now();
    let { chunks, meta } = retrieveTopK({ query: clean, userType, k: 3 });
    const retrievalTime = Date.now() - retrievalStart;
    
    logger.info('RETRIEVER', `Evidencia encontrada`, {
      retrievalTimeMs: retrievalTime,
      evidenceCount: chunks.length
    });

    // 3) Generación de respuesta con IA (incluyendo historial)
    const llmStart = Date.now();
    const responseText = await answerLLM({
      question: clean,
      evidenceChunks: chunks,
      userType,
      conversationHistory
    });
    const llmTime = Date.now() - llmStart;
    

    
    logger.info('AI', `Respuesta generada`, {
      llmTimeMs: llmTime,
      responseLength: responseText.length
    });

    // Si es consulta de malla curricular, usar referencias especiales
    const isMallaQuery = /\b(malla|curricular|materia|asignatura|semestre|nivel|credito)/i.test(clean);
    if (isMallaQuery && responseText.includes('**MALLA_CURRICULAR_COMPONENT**')) {
      chunks = [{
        id: 'coordinacion-sistemas',
        titulo: 'Coordinación de Ingeniería de Sistemas - UTS',
        url: null,
        nombreRecurso: 'Coordinación Académica'
      }];
    }

    // 4) Guardar conversación en base de datos
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
    
    // Log final de la conversación completa (incluyendo tiempo de historial)
    logger.conversation(sessionId, userType, clean, responseText, chunks, {
      totalTimeMs: totalTime,
      historyTimeMs: historyTime,
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

// Nuevo endpoint para generar sugerencias inteligentes
// Endpoint para obtener sugerencias estáticas por tipo de usuario
router.get('/suggestions/:userType', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { userType } = req.params;
    
    // Validar tipo de usuario
    const validTypes = ['estudiante', 'docente', 'aspirante', 'visitante', 'todos'];
    if (!validTypes.includes(userType)) {
      logger.warn('SUGGESTIONS', 'Tipo de usuario inválido', { userType });
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo de usuario inválido',
        validTypes 
      });
    }

    logger.info('SUGGESTIONS', 'Generando sugerencias estáticas', { userType });

    // Usar sugerencias estáticas rápidas en lugar de Gemini
    const suggestions = getStaticSuggestions(userType, 4);

    const totalTime = Date.now() - startTime;
    
    logger.info('SUGGESTIONS', 'Sugerencias estáticas generadas exitosamente', {
      userType,
      count: suggestions.length,
      totalTimeMs: totalTime
    });

    res.json({
      success: true,
      suggestions,
      userType,
      meta: {
        generatedAt: new Date().toISOString(),
        count: suggestions.length,
        totalTimeMs: totalTime,
        cached: true, // Las sugerencias estáticas están siempre "cacheadas"
        source: 'static'
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error('SUGGESTIONS', 'Error generando sugerencias', {
      ...error,
      userType: req.params.userType,
      totalTimeMs: totalTime
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Error generando sugerencias',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint para obtener sugerencias estáticas (para panel admin)
router.get('/suggestions/static', async (req, res) => {
  try {
    const suggestions = getStaticSuggestions();
    
    res.json({
      success: true,
      data: {
        estudiante: suggestions.estudiante || [],
        docente: suggestions.docente || [],
        aspirante: suggestions.aspirante || [],  
        todos: suggestions.todos || []
      },
      meta: {
        timestamp: new Date().toISOString(),
        system: 'static',
        performance: '0ms (instantáneas)'
      }
    });
  } catch (error) {
    console.error('[CHAT] Error getting static suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

export default router;
