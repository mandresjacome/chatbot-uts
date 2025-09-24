// src/routes/suggestions.js
// Rutas API para preguntas sugeridas

import { Router } from 'express';
import SuggestionGenerator from '../nlp/suggestionGenerator.js';
import { logger } from '../utils/logger.js';

const router = Router();
const suggestionGenerator = new SuggestionGenerator();

/**
 * GET /api/suggestions?userType=aspirante
 * Obtiene preguntas sugeridas para un tipo de usuario
 */
router.get('/', async (req, res) => {
  try {
    const { userType = 'todos' } = req.query;
    
    // Validar tipo de usuario
    const validUserTypes = ['aspirante', 'estudiante', 'docente', 'todos'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de usuario inválido',
        validTypes: validUserTypes
      });
    }

    logger.info('SUGGESTIONS', `Generando sugerencias para: ${userType}`);
    
    // Generar sugerencias
    const suggestions = await suggestionGenerator.getSuggestionsForUser(userType);
    
    logger.info('SUGGESTIONS', `Generadas ${suggestions.totalSuggestions} sugerencias para ${userType}`);
    
    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    logger.error('SUGGESTIONS', `Error obteniendo sugerencias: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/suggestions/refresh
 * Fuerza la regeneración de sugerencias (limpia cache)
 */
router.post('/refresh', async (req, res) => {
  try {
    const { userType } = req.body;
    
    // Limpiar cache
    suggestionGenerator.clearCache();
    
    logger.info('SUGGESTIONS', 'Cache de sugerencias limpiado');
    
    // Regenerar si se especifica tipo de usuario
    let newSuggestions = null;
    if (userType) {
      newSuggestions = await suggestionGenerator.getSuggestionsForUser(userType);
      logger.info('SUGGESTIONS', `Sugerencias regeneradas para: ${userType}`);
    }
    
    res.json({
      success: true,
      message: 'Cache limpiado y sugerencias regeneradas',
      data: newSuggestions
    });

  } catch (error) {
    logger.error('SUGGESTIONS', `Error refrescando sugerencias: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Error refrescando sugerencias'
    });
  }
});

/**
 * GET /api/suggestions/all
 * Obtiene sugerencias para todos los tipos de usuario
 */
router.get('/all', async (req, res) => {
  try {
    logger.info('SUGGESTIONS', 'Generando sugerencias para todos los tipos de usuario');
    
    const userTypes = ['aspirante', 'estudiante', 'docente', 'todos'];
    const allSuggestions = {};
    
    // Generar sugerencias para cada tipo de usuario
    for (const userType of userTypes) {
      try {
        allSuggestions[userType] = await suggestionGenerator.getSuggestionsForUser(userType);
      } catch (error) {
        logger.error('SUGGESTIONS', `Error generando sugerencias para ${userType}: ${error.message}`, error);
        allSuggestions[userType] = {
          error: `No se pudieron generar sugerencias para ${userType}`,
          userType,
          totalSuggestions: 0,
          suggestions: []
        };
      }
    }
    
    const totalSuggestions = Object.values(allSuggestions)
      .reduce((total, userSuggestions) => total + (userSuggestions.totalSuggestions || 0), 0);
    
    logger.info('SUGGESTIONS', `Generadas ${totalSuggestions} sugerencias totales`);
    
    res.json({
      success: true,
      data: {
        totalSuggestions,
        generatedAt: new Date().toISOString(),
        suggestions: allSuggestions
      }
    });

  } catch (error) {
    logger.error('SUGGESTIONS', `Error obteniendo todas las sugerencias: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo sugerencias para todos los usuarios'
    });
  }
});

export default router;