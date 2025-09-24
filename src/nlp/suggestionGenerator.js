// src/nlp/suggestionGenerator.js
// Generador inteligente de preguntas sugeridas basado en la base de conocimiento

import { queryAll } from '../db/index.js';

/**
 * Genera preguntas sugeridas dinámicamente basadas en el contenido actual de la BD
 */
class SuggestionGenerator {
  constructor() {
    this.suggestionsCache = new Map();
    this.lastCacheUpdate = null;
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  }

  /**
   * Obtiene sugerencias para un tipo de usuario específico
   */
  async getSuggestionsForUser(userType = 'todos') {
    const cacheKey = `suggestions_${userType}`;
    
    // Verificar cache
    if (this.isCacheValid(cacheKey)) {
      return this.suggestionsCache.get(cacheKey);
    }

    // Generar nuevas sugerencias
    const suggestions = await this.generateSuggestions(userType);
    
    // Guardar en cache
    this.suggestionsCache.set(cacheKey, suggestions);
    this.lastCacheUpdate = Date.now();
    
    return suggestions;
  }

  /**
   * Genera sugerencias basadas en el contenido de la BD
   */
  async generateSuggestions(userType) {
    try {
      // Obtener contenido relevante de la BD
      const query = userType === 'todos' 
        ? `SELECT * FROM knowledge_base WHERE activo = 1`
        : `SELECT * FROM knowledge_base WHERE activo = 1 AND (tipo_usuario = ? OR tipo_usuario = 'todos')`;
      
      const params = userType === 'todos' ? [] : [userType];
      const knowledgeItems = await queryAll(query, params);

      if (!knowledgeItems || knowledgeItems.length === 0) {
        return this.getFallbackSuggestions(userType);
      }

      // Analizar contenido y generar sugerencias
      const suggestions = this.analyzeAndGenerateSuggestions(knowledgeItems, userType);
      
      return {
        userType,
        totalSuggestions: suggestions.length,
        suggestions: suggestions.slice(0, 6), // Máximo 6 sugerencias
        generatedAt: new Date().toISOString(),
        basedOn: knowledgeItems.length + ' registros de conocimiento'
      };

    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return this.getFallbackSuggestions(userType);
    }
  }

  /**
   * Analiza el contenido y crea preguntas sugeridas inteligentes
   */
  analyzeAndGenerateSuggestions(knowledgeItems, userType) {
    const suggestions = [];
    const usedQuestions = new Set();

    // Patrones de pregunta por tipo de usuario
    const questionPatterns = this.getQuestionPatterns(userType);

    // Extraer palabras clave importantes del contenido
    const keyTopics = this.extractKeyTopics(knowledgeItems);

    // Generar preguntas basadas en patrones + contenido real
    for (const topic of keyTopics) {
      const patterns = questionPatterns[topic.category] || questionPatterns.general;
      
      for (const pattern of patterns) {
        const question = pattern.replace('{topic}', topic.term);
        
        if (!usedQuestions.has(question) && this.isRelevantQuestion(question, knowledgeItems)) {
          suggestions.push({
            question: question,
            category: topic.category,
            confidence: topic.confidence,
            basedOnContent: true
          });
          usedQuestions.add(question);
        }
      }
    }

    // Ordenar por relevancia/confianza
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extrae temas clave del contenido de la BD
   */
  extractKeyTopics(knowledgeItems) {
    const topicMap = new Map();

    knowledgeItems.forEach(item => {
      // Analizar palabras clave
      if (item.palabras_clave) {
        const keywords = item.palabras_clave.split(',').map(k => k.trim().toLowerCase());
        keywords.forEach(keyword => {
          if (keyword.length > 3) { // Ignorar palabras muy cortas
            const count = topicMap.get(keyword) || 0;
            topicMap.set(keyword, count + 1);
          }
        });
      }

      // Analizar preguntas existentes para extraer temas
      if (item.pregunta) {
        const questionTopics = this.extractTopicsFromText(item.pregunta);
        questionTopics.forEach(topic => {
          const count = topicMap.get(topic) || 0;
          topicMap.set(topic, count + 0.5);
        });
      }
    });

    // Convertir a array ordenado
    return Array.from(topicMap.entries())
      .map(([term, frequency]) => ({
        term,
        frequency,
        confidence: Math.min(frequency / knowledgeItems.length, 1),
        category: this.categorizeTopicByContent(term, knowledgeItems)
      }))
      .filter(topic => topic.frequency > 1) // Solo temas que aparecen más de una vez
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 15); // Top 15 temas
  }

  /**
   * Extrae temas importantes de un texto
   */
  extractTopicsFromText(text) {
    const importantWords = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 4 && 
        !this.getStopWords().includes(word)
      );

    return [...new Set(importantWords)];
  }

  /**
   * Categoriza un tema basado en el contenido
   */
  categorizeTopicByContent(term, knowledgeItems) {
    const termLower = term.toLowerCase();
    
    // Categorías específicas basadas en palabras clave
    if (termLower.includes('costo') || termLower.includes('pago') || termLower.includes('beca')) return 'costos';
    if (termLower.includes('documento') || termLower.includes('requisito')) return 'requisitos';
    if (termLower.includes('calendario') || termLower.includes('fecha')) return 'fechas';
    if (termLower.includes('plataforma') || termLower.includes('digital')) return 'plataformas';
    if (termLower.includes('tramite') || termLower.includes('proceso')) return 'tramites';
    if (termLower.includes('programa') || termLower.includes('carrera')) return 'programa';
    if (termLower.includes('perfil') || termLower.includes('profesional')) return 'perfil';
    if (termLower.includes('campo') || termLower.includes('trabajo')) return 'campo_laboral';
    
    return 'general';
  }

  /**
   * Patrones de preguntas por tipo de usuario
   */
  getQuestionPatterns(userType) {
    const patterns = {
      aspirante: {
        costos: [
          '¿Cuáles son los costos de {topic}?',
          '¿Qué información hay sobre {topic}?',
          '¿Cómo funciona el proceso de {topic}?'
        ],
        requisitos: [
          '¿Qué {topic} necesito?',
          '¿Cuáles son los requisitos de {topic}?',
          '¿Dónde consigo información sobre {topic}?'
        ],
        fechas: [
          '¿Cuándo es el {topic}?',
          '¿Qué fechas importantes hay para {topic}?'
        ],
        general: [
          '¿Qué información hay sobre {topic}?',
          '¿Cómo puedo saber más de {topic}?'
        ]
      },
      estudiante: {
        plataformas: [
          '¿Cómo accedo a {topic}?',
          '¿Dónde encuentro {topic}?'
        ],
        tramites: [
          '¿Cómo hago el trámite de {topic}?',
          '¿Qué necesito para {topic}?'
        ],
        fechas: [
          '¿Cuándo es el {topic}?',
          '¿Qué fechas son importantes para {topic}?'
        ],
        general: [
          '¿Dónde encuentro información sobre {topic}?',
          '¿Cómo puedo acceder a {topic}?'
        ]
      },
      docente: {
        plataformas: [
          '¿Cómo accedo a {topic}?',
          '¿Dónde está disponible {topic}?'
        ],
        general: [
          '¿Qué recursos hay para {topic}?',
          '¿Dónde encuentro información sobre {topic}?'
        ]
      },
      todos: {
        programa: [
          '¿Qué es {topic}?',
          '¿Cuáles son las características de {topic}?'
        ],
        perfil: [
          '¿Cuál es el {topic}?',
          '¿Qué puedo hacer con {topic}?'
        ],
        campo_laboral: [
          '¿En qué {topic} puedo trabajar?',
          '¿Cuáles son los {topic} disponibles?'
        ],
        general: [
          '¿Qué información hay sobre {topic}?',
          '¿Cuéles son las características de {topic}?'
        ]
      }
    };

    return patterns[userType] || patterns.todos;
  }

  /**
   * Verifica si una pregunta es relevante basada en el contenido
   */
  isRelevantQuestion(question, knowledgeItems) {
    const questionLower = question.toLowerCase();
    
    return knowledgeItems.some(item => {
      const content = (item.respuesta_texto || '').toLowerCase();
      const keywords = (item.palabras_clave || '').toLowerCase();
      
      // La pregunta debe tener relación con el contenido existente
      return content.includes(questionLower.split(' ')[2]) || 
             keywords.includes(questionLower.split(' ')[2]);
    });
  }

  /**
   * Sugerencias de respaldo si no se puede generar dinámicamente
   */
  getFallbackSuggestions(userType) {
    const fallbackSuggestions = {
      aspirante: [
        { question: '¿Cuáles son los costos del programa?', category: 'costos', confidence: 0.8, basedOnContent: false },
        { question: '¿Qué documentos necesito para inscribirme?', category: 'requisitos', confidence: 0.8, basedOnContent: false },
        { question: '¿Hay becas disponibles?', category: 'costos', confidence: 0.7, basedOnContent: false },
        { question: '¿Cuándo son las inscripciones?', category: 'fechas', confidence: 0.7, basedOnContent: false }
      ],
      estudiante: [
        { question: '¿Cómo accedo a las plataformas digitales?', category: 'plataformas', confidence: 0.8, basedOnContent: false },
        { question: '¿Cuándo son los calendarios académicos?', category: 'fechas', confidence: 0.8, basedOnContent: false },
        { question: '¿Qué trámites puedo hacer en línea?', category: 'tramites', confidence: 0.7, basedOnContent: false },
        { question: '¿Dónde encuentro información académica?', category: 'general', confidence: 0.6, basedOnContent: false }
      ],
      docente: [
        { question: '¿Qué recursos están disponibles?', category: 'general', confidence: 0.8, basedOnContent: false },
        { question: '¿Dónde encuentro la normatividad?', category: 'general', confidence: 0.8, basedOnContent: false },
        { question: '¿Cómo accedo a las plataformas académicas?', category: 'plataformas', confidence: 0.7, basedOnContent: false }
      ],
      todos: [
        { question: '¿Qué es la Ingeniería de Sistemas?', category: 'programa', confidence: 0.9, basedOnContent: false },
        { question: '¿Cuál es el perfil profesional?', category: 'perfil', confidence: 0.8, basedOnContent: false },
        { question: '¿En qué campos puedo trabajar?', category: 'campo_laboral', confidence: 0.8, basedOnContent: false },
        { question: '¿Cuáles son las materias del programa?', category: 'programa', confidence: 0.7, basedOnContent: false }
      ]
    };

    return {
      userType,
      totalSuggestions: fallbackSuggestions[userType]?.length || 0,
      suggestions: fallbackSuggestions[userType] || fallbackSuggestions.todos,
      generatedAt: new Date().toISOString(),
      basedOn: 'Fallback predefinido'
    };
  }

  /**
   * Palabras vacías a ignorar
   */
  getStopWords() {
    return ['sobre', 'para', 'desde', 'hasta', 'with', 'from', 'the', 'and', 'información', 'programa', 'sistema', 'sistemas'];
  }

  /**
   * Verifica si el cache es válido
   */
  isCacheValid(cacheKey) {
    if (!this.suggestionsCache.has(cacheKey)) return false;
    if (!this.lastCacheUpdate) return false;
    
    return (Date.now() - this.lastCacheUpdate) < this.CACHE_DURATION;
  }

  /**
   * Limpia el cache de sugerencias
   */
  clearCache() {
    this.suggestionsCache.clear();
    this.lastCacheUpdate = null;
  }
}

export default SuggestionGenerator;