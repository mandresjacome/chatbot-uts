import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveTopK } from '../nlp/retriever.js';
import { Conversations } from '../db/repositories.js';

class SuggestionsGenerator {
  constructor() {
    // Usar la misma lógica que geminiClient
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    if (hasKey) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: modelName });
    } else {
      this.genAI = null;
      this.model = null;
    }
    
    // Cache para optimizar rendimiento
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutos
    
    console.log(`SuggestionsGenerator inicializado para UTS con modelo: ${modelName} (hasKey: ${hasKey})`);
  }

  /**
   * Genera sugerencias inteligentes según el tipo de usuario
   * @param {string} userType - Tipo de usuario (estudiante, docente, aspirante, visitante)
   * @param {object} options - Opciones adicionales (hora, contexto, etc.)
   * @returns {Promise<Array>} Array de sugerencias
   */
  async generateSuggestions(userType, options = {}) {
    try {
      console.log(`Generando sugerencias para tipo: ${userType}`);
      
      // Verificar cache primero
      const cacheKey = `${userType}-${JSON.stringify(options)}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('Usando sugerencias desde cache');
          return cached.suggestions;
        }
      }

      // Obtener información contextual de la base de datos
      const contextInfo = await this.getContextFromDatabase(userType);
      
      // Verificar si Gemini está disponible
      if (!this.model) {
        console.log('Gemini no disponible, usando fallback');
        return this.getDatabaseFallbackSuggestions(userType);
      }
      
      const prompt = await this.buildPrompt(userType, options, contextInfo);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parsear la respuesta JSON
      const suggestions = this.parseGeminiResponse(text);
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        suggestions,
        timestamp: Date.now()
      });

      console.log(`Generadas ${suggestions.length} sugerencias para ${userType}`);
      return suggestions;

    } catch (error) {
      console.error('Error generando sugerencias con Gemini:', error);
      // Fallback a sugerencias de la base de datos
      return await this.getDatabaseFallbackSuggestions(userType);
    }
  }

  /**
   * Construye el prompt para Gemini basado en datos REALES de la BD
   */
  async buildPrompt(userType, options, contextInfo) {
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    
    // CONSULTAR EJEMPLOS REALES DE LA BASE DE DATOS PRIMERO
    const realExamples = await this.getRealExamplesFromDatabase(userType);
    const realContexts = await this.getRealContextsFromDatabase(userType);

    return `
Eres AvaUTS, el asistente inteligente de las Unidades Tecnológicas de Santander (UTS). 

Genera exactamente 4 sugerencias de preguntas inteligentes y naturales para un ${userType} de la UTS.

CONTEXTO UTS REAL (extraído de la base de datos):
- Institución: Unidades Tecnológicas de Santander (UTS)
- Tipo de usuario: ${userType}
- Hora del día: ${timeOfDay} (${currentHour}:00)
- Información contextual: ${contextInfo}
- Contextos reales de BD: ${realContexts}

CRITERIOS:
1. Basarse en las consultas REALES de usuarios ${userType} en la base de datos
2. Usar el estilo y lenguaje de las preguntas reales encontradas
3. Variar entre consultas académicas, administrativas y servicios UTS
4. Usar lenguaje natural colombiano como en las consultas reales
5. Considerar el contexto temporal (${timeOfDay})
6. Referirse específicamente a la UTS como en los ejemplos reales

EJEMPLOS REALES DE LA BASE DE DATOS para ${userType}:
${realExamples}

FORMATO DE RESPUESTA (JSON estricto):
{
  "suggestions": [
    {
      "text": "Pregunta natural específica de la UTS basada en ejemplos reales",
      "type": "popular" | "common",
      "category": "academico" | "administrativo" | "servicios"
    }
  ]
}

IMPORTANTE: 
- Usa el mismo estilo de los ejemplos reales mostrados arriba
- Las preguntas deben sonar como las que realmente hacen los usuarios
- Responde SOLO con el JSON, sin texto adicional.
`;
  }

  /**
   * Obtiene información contextual según el tipo de usuario
   */
  getContextInfo(userType, options) {
    const contexts = {
      estudiante: 'Enfócate en consultas sobre vida académica activa: notas, horarios, plataforma virtual UTS, servicios estudiantiles',
      docente: 'Enfócate en herramientas pedagógicas UTS, gestión académica, aulas virtuales, evaluaciones',
      aspirante: 'Enfócate en proceso de admisión UTS, programas disponibles, requisitos, fechas importantes',
      visitante: 'Enfócate en información general UTS, servicios, ubicación, contacto, programas ofertados'
    };
    
    return contexts[userType] || contexts.visitante;
  }

  /**
   * Obtiene contexto real de la base de datos
   */
  async getContextFromDatabase(userType) {
    try {
      // Obtener consultas relacionadas con el tipo de usuario desde la base de datos
      const queries = [
        `información para ${userType}`,
        `consultas ${userType} UTS`,
        `servicios ${userType}`,
        `preguntas frecuentes ${userType}`
      ];

      let contextData = [];
      
      for (const query of queries) {
        const results = retrieveTopK({ query, k: 3, userType });
        if (results && results.chunks && results.chunks.length > 0) {
          contextData = contextData.concat(results.chunks);
        }
      }

      // Extraer información relevante
      const contextInfo = contextData
        .map(item => item.text || item.titulo || item.pregunta)
        .filter(Boolean)
        .slice(0, 5) // Limitar a 5 elementos más relevantes
        .join('. ');

      return contextInfo || this.getContextInfo(userType);
      
    } catch (error) {
      console.error('Error obteniendo contexto de BD:', error);
      return this.getContextInfo(userType);
    }
  }

  /**
   * Obtiene sugerencias de fallback desde la base de datos
   */
  async getDatabaseFallbackSuggestions(userType) {
    try {
      console.log('Usando fallback de base de datos para:', userType);
      
      // Consultar preguntas frecuentes de la BD por tipo de usuario
      const searchQueries = [
        `preguntas frecuentes ${userType}`,
        `consultas comunes ${userType}`,
        `información ${userType} UTS`,
        `servicios ${userType}`
      ];

      let suggestions = [];

      for (const query of searchQueries) {
        const results = retrieveTopK({ query, k: 2, userType });
        
        if (results?.chunks?.length > 0) {
          results.chunks.forEach(result => {
            if (result.pregunta || result.titulo) {
              suggestions.push({
                text: result.pregunta || result.titulo,
                type: 'common',
                category: this.categorizeFromContent(result.contenido || result.texto || '')
              });
            }
          });
        }
      }

      // Si no hay suficientes, completar con estáticas
      if (suggestions.length < 4) {
        const staticSuggestions = this.getStaticFallbackSuggestions(userType);
        suggestions = [...suggestions, ...staticSuggestions].slice(0, 4);
      }

      return suggestions.slice(0, 4);
      
    } catch (error) {
      console.error('Error en fallback de BD:', error);
      return this.getStaticFallbackSuggestions(userType);
    }
  }

  /**
   * Categoriza contenido automáticamente
   */
  categorizeFromContent(content) {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('nota') || contentLower.includes('materia') || contentLower.includes('programa') || contentLower.includes('académico')) {
      return 'academico';
    }
    if (contentLower.includes('inscripción') || contentLower.includes('matrícula') || contentLower.includes('administrativo') || contentLower.includes('trámite')) {
      return 'administrativo';  
    }
    if (contentLower.includes('servicio') || contentLower.includes('biblioteca') || contentLower.includes('ubicación') || contentLower.includes('contacto')) {
      return 'servicios';
    }
    
    return 'general';
  }

  /**
   * GENERA EJEMPLOS basándose en el CONTENIDO de la base de datos
   */
  async getRealExamplesFromDatabase(userType) {
    try {
      console.log(`Generando ejemplos basados en contenido de BD para ${userType}...`);
      
      // Buscar CONTENIDO/INFORMACIÓN en la BD, no preguntas existentes
      const keywords = this.getUserSearchTerms(userType);
      let contentData = [];
      
      for (const keyword of keywords) {
        const results = retrieveTopK({ query: keyword, k: 3, userType });
        if (results?.chunks?.length > 0) {
          contentData = contentData.concat(results.chunks);
        }
      }
      
      if (contentData.length > 0) {
        // GENERAR ejemplos de preguntas basándome en el CONTENIDO encontrado
        const examples = this.generateExamplesFromContent(contentData, userType);
        return examples.length > 0 
          ? examples.map((ex, i) => `${i + 1}. "${ex}"`).join('\n')
          : this.getDefaultExamples(userType);
      }
      
      return this.getDefaultExamples(userType);
      
    } catch (error) {
      console.error('Error generando ejemplos desde contenido BD:', error);
      return this.getDefaultExamples(userType);
    }
  }

  /**
   * GENERA preguntas ejemplo basándose en el CONTENIDO encontrado
   */
  generateExamplesFromContent(contentData, userType) {
    const examples = [];
    
    try {
      contentData.forEach(item => {
        const content = item.contenido || item.texto || item.titulo || '';
        const preguntaOriginal = item.pregunta || '';
        
        if (content.length > 50) {
          // Generar preguntas basándome en el CONTENIDO, no copiar las existentes
          const generatedQuestions = this.createQuestionsFromContent(content, userType, preguntaOriginal);
          examples.push(...generatedQuestions);
        }
      });
      
      // Filtrar y limpiar ejemplos únicos
      const uniqueExamples = [...new Set(examples)]
        .filter(ex => ex.length > 15 && ex.length < 100)
        .slice(0, 6);
        
      return uniqueExamples;
      
    } catch (error) {
      console.error('Error creando ejemplos desde contenido:', error);
      return [];
    }
  }

  /**
   * CREA preguntas nuevas basándose en el contenido encontrado
   */
  createQuestionsFromContent(content, userType, originalQuestion) {
    const questions = [];
    const contentLower = content.toLowerCase();
    
    // Analizar el contenido y generar preguntas relevantes
    if (userType === 'estudiante') {
      if (contentLower.includes('nota') || contentLower.includes('calificación')) {
        questions.push('¿Cómo puedo consultar mis calificaciones?');
      }
      if (contentLower.includes('horario') || contentLower.includes('clase')) {
        questions.push('¿Dónde veo mis horarios de clase?');
      }
      if (contentLower.includes('matrícula') || contentLower.includes('inscripción')) {
        questions.push('¿Cuál es el proceso de matrícula?');
      }
      if (contentLower.includes('biblioteca') || contentLower.includes('recurso')) {
        questions.push('¿Qué recursos tiene la biblioteca UTS?');
      }
    }
    
    if (userType === 'docente') {
      if (contentLower.includes('aula') || contentLower.includes('salón')) {
        questions.push('¿Cómo reservo un aula virtual?');
      }
      if (contentLower.includes('evaluación') || contentLower.includes('examen')) {
        questions.push('¿Cómo registro las evaluaciones?');
      }
      if (contentLower.includes('fecha') || contentLower.includes('calendario')) {
        questions.push('¿Cuáles son las fechas académicas importantes?');
      }
    }
    
    if (userType === 'aspirante') {
      if (contentLower.includes('admisión') || contentLower.includes('ingreso')) {
        questions.push('¿Qué necesito para ingresar a la UTS?');
      }
      if (contentLower.includes('programa') || contentLower.includes('carrera')) {
        questions.push('¿Qué programas académicos tienen disponibles?');
      }
      if (contentLower.includes('costo') || contentLower.includes('precio')) {
        questions.push('¿Cuánto cuesta estudiar en la UTS?');
      }
    }
    
    if (userType === 'visitante') {
      if (contentLower.includes('ubicación') || contentLower.includes('dirección')) {
        questions.push('¿Dónde queda la sede principal de la UTS?');
      }
      if (contentLower.includes('servicio') || contentLower.includes('atención')) {
        questions.push('¿Qué servicios ofrece la UTS?');
      }
      if (contentLower.includes('contacto') || contentLower.includes('teléfono')) {
        questions.push('¿Cómo me comunico con la UTS?');
      }
    }
    
    return questions.slice(0, 2); // Máximo 2 por contenido
  }

  /**
   * CONSULTA CONTEXTOS REALES de la base de datos 
   */
  async getRealContextsFromDatabase(userType) {
    try {
      console.log(`Consultando contextos reales para ${userType} en la BD...`);
      
      // Consultar información específica del tipo de usuario
      const searchTerms = this.getUserSearchTerms(userType);
      let realContexts = [];
      
      for (const term of searchTerms) {
        const results = retrieveTopK({ query: term, k: 3, userType });
        if (results?.chunks?.length > 0) {
          realContexts = realContexts.concat(
            results.chunks.map(r => r.text || r.titulo || r.pregunta).filter(Boolean)
          );
        }
      }
      
      // Limpiar y formatear contextos reales
      const cleanContexts = realContexts
        .slice(0, 5)
        .map(context => context.substring(0, 200) + '...')
        .join(' | ');
        
      return cleanContexts || this.getDefaultContext(userType);
      
    } catch (error) {
      console.error('Error consultando contextos reales:', error);
      return this.getDefaultContext(userType);
    }
  }

  /**
   * Busca ejemplos por palabras clave si no hay suficiente contenido
   */
  async getExamplesByKeywords(userType) {
    try {
      const keywords = this.getUserSearchTerms(userType);
      let contentFound = [];
      
      for (const keyword of keywords) {
        const results = retrieveTopK({ query: keyword, k: 2, userType });
        if (results?.chunks?.length > 0) {
          contentFound = contentFound.concat(results.chunks);
        }
      }
      
      if (contentFound.length > 0) {
        const generatedExamples = this.generateExamplesFromContent(contentFound, userType);
        return generatedExamples.length > 0 
          ? generatedExamples.slice(0, 6).map((ex, i) => `${i + 1}. "${ex}"`).join('\n')
          : this.getDefaultExamples(userType);
      }
      
      return this.getDefaultExamples(userType);
        
    } catch (error) {
      console.error('Error buscando por keywords:', error);
      return this.getDefaultExamples(userType);
    }
  }

  /**
   * Términos de búsqueda específicos por tipo de usuario
   */
  getUserSearchTerms(userType) {
    const terms = {
      estudiante: ['notas', 'materias', 'horarios', 'campus virtual', 'matrícula', 'calificaciones'],
      docente: ['aulas', 'evaluaciones', 'sistema docente', 'fechas académicas', 'recursos pedagógicos'],
      aspirante: ['admisiones', 'inscripciones', 'requisitos', 'programas académicos', 'costos'],
      visitante: ['información general', 'ubicación', 'servicios', 'contacto', 'programas ofertados']
    };
    
    return terms[userType] || terms.visitante;
  }

  /**
   * Contexto por defecto si la BD falla
   */
  getDefaultContext(userType) {
    const contexts = {
      estudiante: 'Vida académica activa UTS: consultas sobre notas, horarios, plataforma virtual',
      docente: 'Herramientas pedagógicas UTS: aulas virtuales, gestión académica, evaluaciones', 
      aspirante: 'Proceso admisión UTS: programas disponibles, requisitos, inscripciones',
      visitante: 'Información general UTS: servicios, ubicación, contacto, programas'
    };
    return contexts[userType] || contexts.visitante;
  }

  /**
   * Ejemplos por defecto si la BD falla
   */
  getDefaultExamples(userType) {
    const examples = {
      estudiante: '1. "¿Cómo consulto mis notas en la UTS?"\n2. "¿Cuáles son mis horarios de clase?"\n3. "¿Cómo accedo al campus virtual?"',
      docente: '1. "¿Cómo cargo notas en el sistema UTS?"\n2. "¿Cuáles son las fechas académicas?"\n3. "¿Cómo reservo aulas virtuales?"',
      aspirante: '1. "¿Cuáles son los requisitos de admisión UTS?"\n2. "¿Qué programas académicos ofrecen?"\n3. "¿Cuándo son las inscripciones?"',
      visitante: '1. "¿Dónde está ubicada la UTS?"\n2. "¿Qué servicios ofrecen?"\n3. "¿Cómo contacto con la universidad?"'
    };
    return examples[userType] || examples.visitante;
  }

  /**
   * Determina el momento del día para contexto temporal
   */
  getTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'mañana';
    if (hour >= 12 && hour < 18) return 'tarde';
    if (hour >= 18 && hour < 24) return 'noche';
    return 'madrugada';
  }

  /**
   * Parsea la respuesta JSON de Gemini
   */
  parseGeminiResponse(text) {
    try {
      // Limpiar el texto por si tiene markdown o caracteres extra
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.map(suggestion => ({
          text: suggestion.text || '',
          type: suggestion.type || 'common',
          category: suggestion.category || 'general'
        }));
      }
      
      throw new Error('Formato de respuesta inválido');
    } catch (error) {
      console.error('Error parseando respuesta de Gemini:', error);
      console.log('Texto recibido:', text);
      throw error;
    }
  }

  /**
   * Sugerencias de fallback estáticas si la BD falla
   */
  getStaticFallbackSuggestions(userType) {
    const fallbacks = {
      estudiante: [
        { text: "¿Cómo consulto mis notas?", type: "popular", category: "academico" },
        { text: "¿Cuál es el proceso de matrícula?", type: "popular", category: "administrativo" },
        { text: "¿Dónde está la biblioteca?", type: "common", category: "servicios" },
        { text: "¿Cómo accedo al campus virtual?", type: "popular", category: "academico" }
      ],
      docente: [
        { text: "¿Cómo cargo notas en el sistema?", type: "popular", category: "academico" },
        { text: "¿Cuáles son las fechas académicas?", type: "common", category: "administrativo" },
        { text: "¿Cómo solicito aulas virtuales?", type: "popular", category: "servicios" },
        { text: "¿Dónde encuentro recursos pedagógicos?", type: "common", category: "academico" }
      ],
      aspirante: [
        { text: "¿Cuáles son los requisitos de admisión?", type: "popular", category: "administrativo" },
        { text: "¿Cuándo son las inscripciones?", type: "popular", category: "administrativo" },
        { text: "¿Qué programas académicos ofrecen?", type: "common", category: "academico" },
        { text: "¿Cuáles son los costos de matrícula?", type: "popular", category: "administrativo" }
      ],
      visitante: [
        { text: "¿Dónde está ubicada la universidad?", type: "common", category: "servicios" },
        { text: "¿Qué programas académicos tienen?", type: "popular", category: "academico" },
        { text: "¿Cuáles son los horarios de atención?", type: "common", category: "servicios" },
        { text: "¿Cómo puedo contactar con admisiones?", type: "popular", category: "administrativo" }
      ]
    };

    return fallbacks[userType] || fallbacks.visitante;
  }

  /**
   * Limpia el cache de sugerencias
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache de sugerencias limpiado');
  }

  /**
   * INVALIDA cache cuando la BD cambia (llamar después del scraper)
   */
  invalidateCacheOnDatabaseChange() {
    console.log('🔄 Base de datos cambió - Invalidando cache de sugerencias...');
    this.cache.clear();
    
    // Opcional: Pre-generar cache para todos los tipos
    this.preGenerateCache();
  }

  /**
   * Pre-genera cache para todos los tipos de usuario
   */
  async preGenerateCache() {
    const userTypes = ['estudiante', 'docente', 'aspirante', 'visitante'];
    
    console.log('🚀 Pre-generando cache de sugerencias...');
    
    for (const userType of userTypes) {
      try {
        await this.generateSuggestions(userType, {
          timestamp: new Date().toISOString(),
          hour: new Date().getHours(),
          preCache: true
        });
        console.log(`✅ Cache generado para ${userType}`);
      } catch (error) {
        console.error(`❌ Error pre-generando cache para ${userType}:`, error);
      }
    }
    
    console.log('🎉 Pre-generación de cache completada');
  }

  /**
   * Fuerza actualización de sugerencias (para botón admin)
   */
  async forceRefreshSuggestions(userType = null) {
    console.log('🔄 Forzando actualización de sugerencias...');
    
    if (userType) {
      // Actualizar solo un tipo específico
      this.cache.delete(`${userType}-${JSON.stringify({})}`);
      return await this.generateSuggestions(userType);
    } else {
      // Actualizar todos los tipos
      this.clearCache();
      return await this.preGenerateCache();
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default SuggestionsGenerator;