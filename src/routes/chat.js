import { Router } from 'express';
import { retrieveTopK } from '../nlp/retriever.js';
import { answerLLM } from '../ai/geminiClient.js';
import SuggestionsGenerator from '../ai/suggestionsGenerator.js';
import { Conversations } from '../db/repositories.js';
import { ensureSessionId } from '../utils/id.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Instancia del generador de sugerencias
const suggestionsGenerator = new SuggestionsGenerator();

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
router.get('/suggestions/:userType', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { userType } = req.params;
    
    // Validar tipo de usuario
    const validTypes = ['estudiante', 'docente', 'aspirante', 'visitante'];
    if (!validTypes.includes(userType)) {
      logger.warn('SUGGESTIONS', 'Tipo de usuario inválido', { userType });
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo de usuario inválido',
        validTypes 
      });
    }

    logger.info('SUGGESTIONS', 'Generando sugerencias', { userType });

    // Generar sugerencias con Gemini
    const suggestions = await suggestionsGenerator.generateSuggestions(userType, {
      timestamp: new Date().toISOString(),
      hour: new Date().getHours()
    });

    const totalTime = Date.now() - startTime;
    
    logger.info('SUGGESTIONS', 'Sugerencias generadas exitosamente', {
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
        cached: false // TODO: implementar detección de cache
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

// Endpoint para refrescar sugerencias (para panel admin)
router.post('/suggestions/refresh', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { userType, force = true } = req.body;
    
    logger.info('SUGGESTIONS_REFRESH', 'Refrescando sugerencias', { userType, force });

    let result;
    
    if (userType) {
      // Refrescar tipo específico
      const validTypes = ['estudiante', 'docente', 'aspirante', 'visitante'];
      if (!validTypes.includes(userType)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Tipo de usuario inválido',
          validTypes 
        });
      }
      
      result = await suggestionsGenerator.forceRefreshSuggestions(userType);
    } else {
      // Refrescar todos los tipos
      result = await suggestionsGenerator.forceRefreshSuggestions();
    }

    const totalTime = Date.now() - startTime;
    
    logger.info('SUGGESTIONS_REFRESH', 'Sugerencias refrescadas exitosamente', {
      userType: userType || 'todos',
      totalTimeMs: totalTime
    });

    res.json({
      success: true,
      message: userType 
        ? `Sugerencias refrescadas para ${userType}`
        : 'Todas las sugerencias refrescadas',
      userType: userType || 'todos',
      meta: {
        refreshedAt: new Date().toISOString(),
        totalTimeMs: totalTime,
        cacheCleared: true
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error('SUGGESTIONS_REFRESH', 'Error refrescando sugerencias', {
      ...error,
      userType: req.body?.userType,
      totalTimeMs: totalTime
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Error refrescando sugerencias',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint para invalidar cache después del scraper
router.post('/suggestions/invalidate-cache', async (req, res) => {
  try {
    logger.info('SUGGESTIONS_CACHE', 'Invalidando cache por cambios en BD');
    
    suggestionsGenerator.invalidateCacheOnDatabaseChange();
    
    res.json({
      success: true,
      message: 'Cache de sugerencias invalidado',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('SUGGESTIONS_CACHE', 'Error invalidando cache', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error invalidando cache' 
    });
  }
});

export default router;
