import { GoogleGenerativeAI } from '@google/generative-ai';

const USE_LLM = process.env.USE_LLM || 'gemini';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const hasKey = Boolean(process.env.GEMINI_API_KEY);

const MAX_EVIDENCE = Number(process.env.MAX_CHARS_EVIDENCE || 2500);
const MAX_RESPONSE = Number(process.env.MAX_CHARS_RESPONSE || 1200);

// Recorta texto por caracteres (defensivo)
function cut(text = '', max = 2000) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// Prompt "evidencia primero"
function buildPrompt({ question, evidenceChunks, userType }) {
  const system = [
    'Eres el Chatbot UTS v1.2.0 para las Unidades Tecnológicas de Santander.',
    'Responde ÚNICAMENTE con la evidencia proporcionada.',
    'Si la evidencia no basta, pide datos concretos (programa, sede, periodo).',
    `Perfil del usuario: ${userType}.`,
    'Tono institucional, claro y conciso. Formatea con viñetas si ayuda.',
    'USA EMOJIS relevantes para hacer las respuestas más visuales y atractivas.',
    'Incluye emojis al inicio de secciones importantes y en las viñetas.',
    'NO incluyas referencias ni menciones de fuentes en tu respuesta.',
  ].join(' ');

  const evidence = evidenceChunks.length
    ? evidenceChunks.map((c,i)=> `[#${i+1}] ${c.text}`).join('\n')
    : '(no hay evidencia disponible)';

  const body = [
    system,
    '',
    `Pregunta del usuario: ${question}`,
    '',
    'EVIDENCIA:',
    cut(evidence, MAX_EVIDENCE),
    '',
    `Redacta la mejor respuesta posible en <= ${MAX_RESPONSE} caracteres, fiel a la evidencia.`
  ].join('\n');

  return body;
}

// --- Cliente Gemini (si hay API key) ---
let genAI = null;
if (hasKey) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function answerLLM({ question, evidenceChunks, userType }) {
  // Fallback mock o sin clave
  if (USE_LLM === 'mock' || !hasKey) {
    if (!evidenceChunks?.length) {
      return `🤔 No tengo evidencia suficiente sobre "${question}". ` +
             `📝 Indícame programa/sede/periodo para ayudarte mejor.`;
    }
    const bullets = evidenceChunks.map((c,i)=> `📌 ${c.text}`).join('\n');
    return `${bullets}\n\n❓ ¿Deseas detalles para tu programa o sede específicos?`;
  }

  // Gemini "evidencia primero"
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = buildPrompt({ question, evidenceChunks, userType });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  // Cortamos por seguridad/estilo
  const out = result?.response?.text?.() || '';
  return cut(out, MAX_RESPONSE);
}
