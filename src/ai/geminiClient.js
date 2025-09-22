import { GoogleGenerativeAI } from '@google/generative-ai';
import { isTeacherSearchQuery, findTeachersByName, formatTeacherInfo, formatMultipleTeachersResponse } from '../nlp/teacherSearch.js';

// Función para detectar consultas de malla curricular
function isMallaQuery(question) {
  const questionLower = question.toLowerCase();
  
  // Palabras clave de malla curricular
  const mallaKeywords = ['malla curricular', 'malla', 'pensum', 'plan de estudios', 'curriculum'];
  
  return mallaKeywords.some(keyword => questionLower.includes(keyword));
}

// Función para detectar si es una consulta específica sobre materias/créditos/prerrequisitos
function isSpecificMallaQuery(question) {
  const questionLower = question.toLowerCase();
  
  // Patrones de consultas específicas
  const specificPatterns = [
    /\b(cuántos?|cuantos?)\s+(creditos?|créditos?)\s+(tiene|de)\s+[\w\s]+/i,
    /\b(qué|cuales|cuáles)\s+(prerrequisitos?|prerequisitos?)\s+(tiene|de)\s+[\w\s]+/i,
    /\b(cuántas?|cuantas?)\s+(horas?)\s+(tiene|de)\s+[\w\s]+/i,
    /\b(prerrequisitos?|prerequisitos?)\s+(para|de)\s+[\w\s]+/i,
    /\b(creditos?|créditos?)\s+(de|para)\s+[\w\s]+/i,
    /\b(qué|cuales|cuáles)\s+(materias?|asignaturas?)\s+.*\b(semestre|nivel)\s*\d+/i,
    /\b(semestre|nivel)\s+\d+.*\b(materias?|asignaturas?)/i,
    /\bmaterias?\s+(del?|en el?)\s+(primer|segundo|tercer|cuarto|quinto|sexto|séptimo|octavo|noveno|décimo|primero|segundo|tercero|cuarto|quinto|sexto|septimo|octavo|noveno|decimo)\b/i,
  ];
  
  return specificPatterns.some(pattern => pattern.test(question));
}

// Función para verificar si el usuario ya ha visto la malla curricular en esta sesión
function hasSeenMallaInSession(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) return false;
  
  return conversationHistory.some(conv => 
    conv.respuesta && conv.respuesta.includes('**MALLA_CURRICULAR_COMPONENT**')
  );
}

// Función para generar respuesta con componente de malla curricular
function generateMallaResponse(question, evidenceChunks) {
  return `🎓 **Malla Curricular de Ingeniería de Sistemas - UTS**

📋 Explora la estructura académica completa de nuestro programa de Sistemas.

**El programa tiene una duración de 10 semestres**, dividido en:
- 📘 **Nivel Tecnológico** (I-VI): 6 semestres  
- 📗 **Nivel Universitario** (VII-X): 4 semestres



**MALLA_CURRICULAR_COMPONENT**`;
}

const USE_LLM = process.env.USE_LLM || 'gemini';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const hasKey = Boolean(process.env.GEMINI_API_KEY);

const MAX_EVIDENCE = Number(process.env.MAX_CHARS_EVIDENCE || 2500);
const MAX_RESPONSE = Number(process.env.MAX_CHARS_RESPONSE || 1800);

// Recorta texto por caracteres (defensivo)
function cut(text = '', max = 2000) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// Prompt "evidencia primero" con contexto de conversación
function buildPrompt({ question, evidenceChunks, userType, conversationHistory = [] }) {
  const system = [
    'Eres el Chatbot UTS v1.2.0 especializado en INGENIERÍA DE SISTEMAS de las Unidades Tecnológicas de Santander.',
    'TODAS las consultas se refieren al programa de Ingeniería de Sistemas UTS por defecto.',
    'Responde ÚNICAMENTE con la evidencia proporcionada sobre Ingeniería de Sistemas.',
    'NO pidas aclaraciones sobre programa, sede o período - asume que es Ingeniería de Sistemas UTS.',
    `Perfil del usuario: ${userType}.`,
    'Tono institucional, claro y conciso. Formatea con viñetas si ayuda.',
    'USA EMOJIS relevantes para hacer las respuestas más visuales y atractivas.',
    'Incluye emojis al inicio de secciones importantes y en las viñetas.',
    'NO incluyas referencias ni menciones de fuentes en tu respuesta.',
    'MANTÉN COHERENCIA con la conversación anterior si existe contexto previo.',
  ].join(' ');

  const evidence = evidenceChunks.length
    ? evidenceChunks.map((c,i)=> `[#${i+1}] ${c.text}`).join('\n')
    : '(no hay evidencia disponible)';

  // Incluir historial de conversación si existe
  let contextSection = '';
  if (conversationHistory.length > 0) {
    const historyText = conversationHistory.map(conv => 
      `Usuario: ${conv.pregunta}\nAsistente: ${conv.respuesta}`
    ).join('\n\n');
    contextSection = `CONVERSACIÓN ANTERIOR:\n${cut(historyText, 800)}\n\n`;
  }

  const body = [
    system,
    '',
    contextSection,
    `Pregunta actual del usuario: ${question}`,
    '',
    'EVIDENCIA:',
    cut(evidence, MAX_EVIDENCE),
    '',
    `Redacta la mejor respuesta posible en <= ${MAX_RESPONSE} caracteres, considerando el contexto de la conversación y siendo fiel a la evidencia.`
  ].join('\n');

  return body;
}

// --- Cliente Gemini (si hay API key) ---
let genAI = null;
if (hasKey) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function answerLLM({ question, evidenceChunks, userType, conversationHistory = [] }) {
  const isMallaQueryResult = isMallaQuery(question);
  const isSpecificQuery = isSpecificMallaQuery(question);
  const hasSeenMalla = hasSeenMallaInSession(conversationHistory);
  
  // ESTRATEGIA DE MALLA CURRICULAR:
  // 1. Si es consulta específica (prerrequisitos, créditos, etc.) → Respuesta directa siempre
  // 2. Si es consulta general de malla Y no la ha visto antes → Mostrar tarjeta
  // 3. Si es consulta general de malla Y ya la vio → Respuesta directa
  
  if (isMallaQueryResult) {
    if (isSpecificQuery) {
      // Consulta específica → Respuesta directa del chatbot
      console.log('🎯 Consulta específica de malla - respuesta directa');
      // Continuar con el flujo normal (Gemini o mock)
    } else if (!hasSeenMalla) {
      // Primera vez viendo malla general → Mostrar tarjeta
      return generateMallaResponse(question, evidenceChunks);
    } else {
      // Ya vio la malla antes → Respuesta directa
      console.log('🔄 Ya vio la malla - respuesta directa');
      // Continuar con el flujo normal (Gemini o mock)
    }
  }

  // Verificar si es una búsqueda de docente específico
  if (isTeacherSearchQuery(question)) {
    // Buscar información de docentes en los chunks de evidencia
    const teacherChunk = evidenceChunks.find(chunk => 
      chunk.text.includes('DOCENTE') || 
      chunk.text.includes('Correo Institucional') ||
      (chunk.text.toLowerCase().includes('docente') && chunk.text.includes('@correo.uts.edu.co'))
    );
    
    if (teacherChunk) {
      // Extraer solo el nombre del docente de la pregunta
      const teacherNameQuery = question
        .toLowerCase()
        .replace(/\b(profesor|docente|maestro|ingeniero|magister|doctor|informacion|sobre|del|de|la|el)\b/g, '')
        .trim();
      
      const matchingTeachers = findTeachersByName(teacherNameQuery, teacherChunk.text);
      
      if (matchingTeachers.length === 1) {
        // Una sola coincidencia - mostrar información completa
        return `¡Información encontrada! 🎓\n\n${formatTeacherInfo(matchingTeachers[0])}\n\n📍 **Programa:** Ingeniería de Sistemas - UTS\n\n¿Te gustaría conocer algo más específico sobre este docente o el programa?`;
      } else if (matchingTeachers.length > 1) {
        // Múltiples coincidencias - mostrar opciones
        return `${formatMultipleTeachersResponse(teacherNameQuery, matchingTeachers)}\n\n📍 **Programa:** Ingeniería de Sistemas - UTS`;
      } else if (teacherNameQuery.trim().length > 0) {
        // No se encontraron coincidencias pero sí había un nombre
        return `❌ No encontré ningún docente con el nombre "${teacherNameQuery}" en el programa de Ingeniería de Sistemas.\n\n💡 **Sugerencias:**\n- Verifica la ortografía del nombre\n- Intenta con el nombre completo (ej: "Victor Ochoa")\n- Pregunta por "lista de docentes" para ver todos los profesores disponibles\n\n¿Te gustaría que te ayude de otra manera?`;
      }
    }
  }

  // Fallback mock o sin clave con contexto
  if (USE_LLM === 'mock' || !hasKey) {
    let contextNote = '';
    if (conversationHistory.length > 0) {
      contextNote = '\n\n💬 Continuando nuestra conversación anterior... ';
    }
    
    if (!evidenceChunks?.length) {
      return `🤔 No tengo información específica sobre "${question}" en mi base de datos de Ingeniería de Sistemas UTS. ` +
             `🔍 Intenta preguntar sobre docentes, materias, plan de estudios, o requisitos del programa.${contextNote}`;
    }
    const bullets = evidenceChunks.map((c,i)=> `📌 ${c.text}`).join('\n');
    return `${bullets}${contextNote}\n\n💬 ¿Hay algo más sobre Ingeniería de Sistemas que te gustaría saber?`;
  }

  // Gemini "evidencia primero" con historial de conversación
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = buildPrompt({ question, evidenceChunks, userType, conversationHistory });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  // Cortamos por seguridad/estilo
  const out = result?.response?.text?.() || '';
  return cut(out, MAX_RESPONSE);
}