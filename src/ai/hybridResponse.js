/**
 * Generador de Respuestas Híbridas SIMPLIFICADO
 * Solo hace búsqueda web directa cuando el usuario la solicita
 */

import WebSearcher from './webSearcher.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

class HybridResponseGenerator {
  
  constructor() {
    // Configuración de Gemini para síntesis de respuestas
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 3000
      }
    });

    // Inicializar buscador web
    this.webSearcher = new WebSearcher();
  }

  /**
   * Genera una respuesta híbrida combinando información de BD con búsqueda web
   * VERSIÓN SIMPLIFICADA - Siempre hace búsqueda web ya que el usuario la solicitó
   */
  async generateHybridResponse(question, dbResponse = '', evidenceChunks = [], userType = 'estudiante') {
    try {
      console.log(`[HybridResponse] Usuario solicitó búsqueda web para: "${question}"`);

      // Realizar búsqueda web (ya que el usuario hizo clic en el botón)
      console.log(`[HybridResponse] Ejecutando búsqueda web solicitada`);
      const webResult = await this.webSearcher.searchWeb(question, question);

      let finalResponse = {
        response: dbResponse,
        sources: [],
        searchUsed: false,
        webInfo: null,
        hybridGenerated: false
      };

      if (webResult.success && webResult.webInfo) {
        // Generar respuesta híbrida combinada
        const hybridResponse = await this.synthesizeHybridResponse({
          question,
          dbResponse,
          webInfo: webResult.webInfo,
          evidenceChunks,
          userType,
          webSources: webResult.sources,
          webKeyPoints: webResult.keyPoints
        });

        finalResponse = {
          response: hybridResponse.response,
          sources: webResult.sources || [],
          searchUsed: true,
          webInfo: webResult.webInfo,
          hybridGenerated: true,
          searchQuery: question,
          combinedSources: {
            database: evidenceChunks.length,
            webResults: webResult.sources?.length || 0
          }
        };

        console.log(`[HybridResponse] ✅ Respuesta híbrida generada exitosamente`);
      } else {
        console.log(`[HybridResponse] ❌ Fallo en búsqueda web, usando respuesta de BD`);
        finalResponse.response = dbResponse || 'No se pudo obtener información adicional en este momento.';
      }

      return finalResponse;

    } catch (error) {
      console.error(`[HybridResponse] Error general:`, error);
      return {
        response: dbResponse || 'Error al procesar la información.',
        sources: [],
        searchUsed: false,
        webInfo: null,
        hybridGenerated: false,
        error: error.message
      };
    }
  }

  /**
   * Combina información de BD y web en una respuesta unificada
   */
  async synthesizeHybridResponse({ question, dbResponse, webInfo, evidenceChunks, userType, webSources, webKeyPoints }) {
    try {
      const prompt = `Como AvaUTS, el asistente virtual oficial de la UTS (Unidades Tecnológicas de Santander), combina la información disponible para responder de manera completa y útil.

PREGUNTA DEL USUARIO: "${question}"

INFORMACIÓN DE BASE DE DATOS LOCAL:
${dbResponse || 'No hay información específica en la base de datos local.'}

INFORMACIÓN ADICIONAL DE LA WEB (sitio oficial UTS):
${webInfo || 'No se encontró información web adicional.'}

PUNTOS CLAVE DE LA BÚSQUEDA WEB:
${webKeyPoints ? webKeyPoints.join('\n- ') : 'No hay puntos clave disponibles'}

INSTRUCCIONES:
1. Combina TODA la información disponible de ambas fuentes
2. Da prioridad a la información del sitio oficial de la UTS
3. Si hay información contradictoria, menciona ambas versiones
4. Estructura la respuesta de manera clara y organizada
5. Incluye detalles específicos como fechas, requisitos, procedimientos
6. Personaliza para el tipo de usuario: ${userType}
7. Mantén el tono profesional pero amigable de AvaUTS

Respuesta completa:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        response: response,
        sources: webSources,
        synthesisUsed: true
      };

    } catch (error) {
      console.error(`[HybridResponse] Error en síntesis:`, error);
      
      // Fallback: combinar información manualmente
      let combinedResponse = dbResponse || '';
      
      if (webInfo) {
        if (combinedResponse) {
          combinedResponse += '\n\n**Información adicional del sitio oficial UTS:**\n' + webInfo;
        } else {
          combinedResponse = webInfo;
        }
      }
      
      if (webKeyPoints && webKeyPoints.length > 0) {
        combinedResponse += '\n\n**Puntos importantes:**\n- ' + webKeyPoints.join('\n- ');
      }

      return {
        response: combinedResponse || 'No se pudo procesar la información en este momento.',
        sources: webSources,
        synthesisUsed: false,
        error: error.message
      };
    }
  }
}

export default HybridResponseGenerator;