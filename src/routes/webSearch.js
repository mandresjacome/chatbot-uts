/**
 * Endpoint API - Búsqueda Web SIMPLIFICADA
 * Solo maneja búsqueda web directa cuando el usuario hace clic en el botón
 */

import express from 'express';
import HybridResponseGenerator from '../ai/hybridResponse.js';
import { retrieveTopK } from '../nlp/retriever.js';
import logger from '../utils/logger.js';

const router = express.Router();
const hybridGenerator = new HybridResponseGenerator();

/**
 * POST /api/web-search/web-search
 * Realiza búsqueda web cuando el usuario hace clic en el botón
 */
router.post('/web-search', async (req, res) => {
  try {
    const { question, userType = 'estudiante', useWebSearch = true } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Pregunta requerida',
        details: 'El campo "question" es obligatorio y no puede estar vacío'
      });
    }

    const trimmedQuestion = question.trim();
    logger.info(`[WebSearch API] Búsqueda web solicitada por usuario: "${trimmedQuestion}" (Usuario: ${userType})`);

    // Obtener respuesta inicial de la base de datos
    let dbResponse = '';
    let evidenceChunks = [];

    try {
      const retrieverResult = retrieveTopK(trimmedQuestion, 5);
      evidenceChunks = retrieverResult.chunks || [];
      
      // Simular respuesta de BD básica
      if (evidenceChunks.length > 0) {
        dbResponse = evidenceChunks
          .slice(0, 2)
          .map(chunk => chunk.content)
          .join(' ');
      } else {
        dbResponse = 'No tengo información específica sobre ese tema en mi base de datos.';
      }
    } catch (dbError) {
      logger.warn('[WebSearch API] Error consultando BD:', dbError.message);
      dbResponse = 'No se pudo consultar la base de datos en este momento.';
    }

    // Generar respuesta híbrida con búsqueda web
    const responseData = await hybridGenerator.generateHybridResponse(
      trimmedQuestion,
      dbResponse,
      evidenceChunks,
      userType
    );

    logger.info(`[WebSearch API] Respuesta híbrida generada exitosamente`);

    res.json({
      success: true,
      response: responseData.response,
      sources: responseData.sources || [],
      searchQuery: responseData.searchQuery || trimmedQuestion,
      evidenceCount: evidenceChunks.length,
      meta: {
        responseType: 'hybrid',
        webSearchUsed: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('[WebSearch API] Error en búsqueda híbrida:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda web',
      details: 'No se pudo completar la búsqueda web',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;