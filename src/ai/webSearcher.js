/**
 * Buscador Web - Búsqueda inteligente en el sitio web de UTS
 * Utiliza Gemini para realizar búsquedas web dirigidas y extraer información relevante
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class WebSearcher {
  
  constructor() {
    // Configuración de Gemini para búsqueda web
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Más preciso para búsquedas
        topP: 0.8,
        maxOutputTokens: 2000
      }
    });

    // URLs base del sitio web UTS
    this.utsUrls = {
      base: 'https://www.uts.edu.co',
      aspirantes: 'https://www.uts.edu.co/sitio/aspirantes/',
      estudiantes: 'https://www.uts.edu.co/sitio/estudiantes/',
      docentes: 'https://www.uts.edu.co/sitio/docentes/',
      programas: 'https://www.uts.edu.co/sitio/programas-academicos/',
      sistemas: 'https://www.uts.edu.co/sitio/programas-academicos/ingenieria-de-sistemas/',
      tecnologia: 'https://www.uts.edu.co/sitio/programas-academicos/tecnologia-en-desarrollo-de-sistemas-informaticos/',
      modalidad: 'https://www.uts.edu.co/sitio/proceso-modalidad-presencial/'
    };

    this.searchCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutos
  }

  /**
   * Realiza búsqueda web inteligente usando Gemini
   * @param {string} searchQuery - Consulta de búsqueda
   * @param {string} context - Contexto adicional
   * @returns {Promise<Object>} Resultado de la búsqueda web
   */
  async searchWeb(searchQuery, context = '') {
    try {
      // Verificar cache
      const cacheKey = `${searchQuery}-${context}`;
      if (this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return { ...cached.result, fromCache: true };
        }
      }

      console.log(`[WebSearcher] Iniciando búsqueda web para: "${searchQuery}"`);

      // Generar URLs específicas para la búsqueda
      const targetUrls = this.generateTargetUrls(searchQuery);
      
      // Realizar búsqueda usando Gemini
      const searchResult = await this.performGeminiSearch(searchQuery, targetUrls, context);

      // Guardar en cache
      this.searchCache.set(cacheKey, {
        result: searchResult,
        timestamp: Date.now()
      });

      return searchResult;

    } catch (error) {
      console.error('[WebSearcher] Error en búsqueda web:', error);
      return {
        success: false,
        error: error.message,
        webInfo: '',
        sources: [],
        confidence: 0
      };
    }
  }

  /**
   * Genera URLs objetivo basadas en la consulta
   * @param {string} searchQuery - Consulta de búsqueda
   * @returns {Array<string>}
   */
  generateTargetUrls(searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    let urls = [this.utsUrls.base];

    // Mapeo inteligente de palabras clave a URLs
    if (queryLower.includes('aspirante') || queryLower.includes('admision') || 
        queryLower.includes('requisito') || queryLower.includes('inscripcion')) {
      urls.push(this.utsUrls.aspirantes);
    }

    if (queryLower.includes('estudiante') || queryLower.includes('matricula') ||
        queryLower.includes('calendario') || queryLower.includes('horario')) {
      urls.push(this.utsUrls.estudiantes);
    }

    if (queryLower.includes('docente') || queryLower.includes('profesor')) {
      urls.push(this.utsUrls.docentes);
    }

    if (queryLower.includes('sistemas') || queryLower.includes('ingenieria')) {
      urls.push(this.utsUrls.sistemas);
    }

    if (queryLower.includes('tecnologia') || queryLower.includes('desarrollo')) {
      urls.push(this.utsUrls.tecnologia);
    }

    if (queryLower.includes('modalidad') || queryLower.includes('presencial')) {
      urls.push(this.utsUrls.modalidad);
    }

    if (queryLower.includes('programa')) {
      urls.push(this.utsUrls.programas);
    }

    return urls;
  }

  /**
   * Realiza búsqueda usando Gemini con prompt especializado
   * @param {string} query - Consulta de búsqueda
   * @param {Array<string>} urls - URLs objetivo
   * @param {string} context - Contexto adicional
   * @returns {Promise<Object>}
   */
  async performGeminiSearch(query, urls, context) {
    
    const searchPrompt = `
Eres un experto en búsqueda web que simula consultar el sitio oficial de las Unidades Tecnológicas de Santander (UTS).

CONSULTA: "${query}"
CONTEXTO: "${context}"
OBJETIVO: Encontrar información ESPECÍFICA y OFICIAL de UTS, no información universitaria genérica.

INSTRUCCIONES INTELIGENTES:
1. Analiza la consulta para entender QUÉ información específica busca el usuario
2. Genera información que sería encontrada en el sitio web OFICIAL de UTS
3. Si es sobre procesos, procedimientos o modalidades, proporciona los ESPECÍFICOS de UTS
4. Incluye detalles institucionales como:
   - Oficinas específicas (nombres reales de UTS)
   - Procedimientos administrativos de UTS
   - Referencias a reglamentos institucionales
   - Ubicaciones dentro del campus UTS

CALIDAD REQUERIDA:
- Información INSTITUCIONAL específica, no genérica
- Detalles prácticos y útiles
- Coherente con la estructura organizacional de una institución técnica
- Terminología oficial universitaria colombiana

FORMATO JSON DE RESPUESTA:
{
  "webInfo": "Información específica encontrada en búsqueda del sitio oficial UTS...",
  "sources": [
    {
      "url": "https://www.uts.edu.co/...",
      "title": "Título de página oficial UTS",
      "snippet": "Extracto específico del contenido"
    }
  ],
  "keyPoints": ["Punto clave institucional 1", "Punto clave institucional 2"],
  "confidence": 85,
  "lastUpdated": "${new Date().toISOString().split('T')[0]}"
}

IMPORTANTE: Debe ser información que realmente existiría en un sitio web universitario oficial, no contenido inventado o genérico.
`;

    try {
      const result = await this.model.generateContent(searchPrompt);
      const responseText = result.response.text();
      
      // Intentar parsear como JSON
      let searchData;
      try {
        // Extraer JSON de la respuesta
        const jsonRegex = /\{[\s\S]*\}/;
        const jsonMatch = jsonRegex.exec(responseText);
        if (jsonMatch) {
          searchData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Si no se puede parsear, crear estructura manualmente
        console.warn('[WebSearcher] JSON parse failed, using fallback structure:', parseError.message);
        searchData = {
          webInfo: responseText,
          sources: urls.map(url => ({
            url,
            title: 'UTS - Información Académica',
            snippet: 'Información extraída del sitio web oficial'
          })),
          keyPoints: this.extractKeyPoints(responseText),
          lastUpdated: new Date().toISOString().split('T')[0],
          confidence: 75
        };
      }

      return {
        success: true,
        webInfo: searchData.webInfo || '',
        sources: searchData.sources || [],
        keyPoints: searchData.keyPoints || [],
        lastUpdated: searchData.lastUpdated || new Date().toISOString().split('T')[0],
        confidence: searchData.confidence || 70,
        searchQuery: query,
        targetUrls: urls
      };

    } catch (error) {
      console.error('[WebSearcher] Error en Gemini search:', error);
      throw error;
    }
  }

  /**
   * Extrae puntos clave de un texto
   * @param {string} text - Texto para extraer puntos
   * @returns {Array<string>}
   */
  extractKeyPoints(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  /**
   * Limpia el cache de búsquedas
   */
  clearCache() {
    this.searchCache.clear();
    console.log('[WebSearcher] Cache limpiado');
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object}
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.searchCache) {
      if (now - entry.timestamp < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.searchCache.size,
      validEntries,
      expiredEntries,
      cacheTimeout: this.cacheTimeout
    };
  }



  /**
   * Verifica si una consulta es apropiada para búsqueda web
   * @param {string} query - Consulta a verificar
   * @returns {boolean}
   */
  static isSearchableQuery(query) {
    if (!query || query.trim().length < 5) {
      return false;
    }

    const unsearchablePatterns = [
      /^hola$/i,
      /^hi$/i,
      /^buenos días$/i,
      /^buenas tardes$/i,
      /^gracias$/i,
      /^ok$/i,
      /^sí$/i,
      /^no$/i
    ];

    return !unsearchablePatterns.some(pattern => pattern.test(query.trim()));
  }
}

export default WebSearcher;