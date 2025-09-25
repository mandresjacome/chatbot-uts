/**
 * Sugerencias Estáticas - Sistema rápido basado en contenido real de la BD
 * Reemplaza el sistema lento de Gemini con sugerencias precargadas
 */

// Sugerencias basadas en el análisis real de la base de datos
const STATIC_SUGGESTIONS = {
  estudiante: [
    { text: "¿Cómo consulto el calendario académico?", type: "popular", category: "academico" },
    { text: "¿Qué plataformas digitales tiene UTS?", type: "popular", category: "servicios" },
    { text: "¿Cuáles son los trámites para estudiantes?", type: "popular", category: "tramites" },
    { text: "¿Cuál es la misión estudiantil de UTS?", type: "popular", category: "institucional" },
    { text: "¿Cómo es la malla curricular de Ingeniería de Sistemas?", type: "popular", category: "academico" },
    { text: "¿Qué materias tiene el tercer semestre?", type: "popular", category: "academico" },
    { text: "¿Cuáles son los prerrequisitos de una materia?", type: "popular", category: "academico" },
    { text: "¿Información sobre modalidades de grado?", type: "popular", category: "tramites" },
    { text: "¿Cómo contacto la coordinación de Sistemas?", type: "popular", category: "contacto" },
    { text: "¿Qué campos laborales tiene Ingeniería de Sistemas?", type: "popular", category: "profesional" },
    { text: "¿Cuál es el perfil profesional del ingeniero?", type: "popular", category: "profesional" },
    { text: "¿Cómo es el programa de Tecnología en Sistemas?", type: "popular", category: "academico" }
  ],
  
  docente: [
    { text: "¿Qué normatividad aplica para docentes?", type: "popular", category: "normatividad" },
    { text: "¿Cuáles son las plataformas para docentes?", type: "popular", category: "servicios" },
    { text: "¿Qué recursos están disponibles para docentes?", type: "popular", category: "recursos" },
    { text: "¿Cómo es el proceso académico docente?", type: "popular", category: "academico" },
    { text: "¿Cuál es la misión docente en UTS?", type: "popular", category: "institucional" },
    { text: "¿Información sobre el programa de Sistemas?", type: "popular", category: "academico" },
    { text: "¿Cómo es la malla curricular del programa?", type: "popular", category: "academico" },
    { text: "¿Qué competencias desarrolla el programa?", type: "popular", category: "academico" },
    { text: "¿Cuál es el perfil del egresado?", type: "popular", category: "profesional" },
    { text: "¿Cómo contacto la coordinación académica?", type: "popular", category: "contacto" },
    { text: "¿Información sobre resultados de aprendizaje?", type: "popular", category: "academico" },
    { text: "¿Qué campos laborales abarca el programa?", type: "popular", category: "profesional" }
  ],
  
  aspirante: [
    { text: "¿Cuál es el calendario de admisiones?", type: "popular", category: "admisiones" },
    { text: "¿Qué documentos necesito para inscribirme?", type: "popular", category: "admisiones" },
    { text: "¿Dónde puedo recibir asesorías?", type: "popular", category: "servicios" },
    { text: "¿Hay becas o programas de gratuidad?", type: "popular", category: "financiero" },
    { text: "¿Cuáles son los costos del programa?", type: "popular", category: "financiero" },
    { text: "¿Dónde encuentro enlaces importantes?", type: "popular", category: "servicios" },
    { text: "¿Cómo es el programa de Ingeniería de Sistemas?", type: "popular", category: "academico" },
    { text: "¿Qué hace un Ingeniero de Sistemas?", type: "popular", category: "profesional" },
    { text: "¿En qué áreas puede trabajar un egresado?", type: "popular", category: "profesional" },
    { text: "¿Cuál es la duración del programa?", type: "popular", category: "academico" },
    { text: "¿Cómo es la modalidad de estudios?", type: "popular", category: "academico" },
    { text: "¿Información sobre el programa de Tecnología?", type: "popular", category: "academico" }
  ],
  
  todos: [
    { text: "¿Cómo es el programa de Ingeniería de Sistemas?", type: "popular", category: "academico" },
    { text: "¿Qué hace un Ingeniero de Sistemas?", type: "popular", category: "profesional" },
    { text: "¿Cuál es el perfil profesional del ingeniero?", type: "popular", category: "profesional" },
    { text: "¿En qué campos puede trabajar un egresado?", type: "popular", category: "profesional" },
    { text: "¿Cómo es la malla curricular del programa?", type: "popular", category: "academico" },
    { text: "¿Cuál es la duración del programa?", type: "popular", category: "academico" },
    { text: "¿Información sobre el programa de Tecnología?", type: "popular", category: "academico" },
    { text: "¿Qué competencias desarrolla el programa?", type: "popular", category: "academico" },
    { text: "¿Cómo es la modalidad de estudios en UTS?", type: "popular", category: "academico" },
    { text: "¿Información sobre resultados de aprendizaje?", type: "popular", category: "academico" },
    { text: "¿Cómo contacto la coordinación de Sistemas?", type: "popular", category: "contacto" },
    { text: "¿Qué oportunidades laborales hay en Sistemas?", type: "popular", category: "profesional" }
  ]
};

/**
 * Obtiene sugerencias aleatorias para un tipo de usuario
 * @param {string} userType - Tipo de usuario (estudiante, docente, aspirante)
 * @param {number} count - Número de sugerencias a retornar (default: 4)
 * @returns {Array<string>} Array de sugerencias aleatorias
 */
export function getStaticSuggestions(userType = 'estudiante', count = 4) {
  const suggestions = STATIC_SUGGESTIONS[userType] || STATIC_SUGGESTIONS.estudiante;
  
  // Seleccionar aleatoriamente sin repetir
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, suggestions.length));
}

/**
 * Obtiene todas las sugerencias disponibles para un tipo de usuario
 * @param {string} userType - Tipo de usuario
 * @returns {Array<string>} Todas las sugerencias del tipo
 */
export function getAllSuggestions(userType = 'estudiante') {
  return STATIC_SUGGESTIONS[userType] || STATIC_SUGGESTIONS.estudiante;
}

/**
 * Obtiene estadísticas de las sugerencias
 * @returns {Object} Estadísticas de sugerencias por tipo
 */
export function getSuggestionStats() {
  return {
    estudiante: STATIC_SUGGESTIONS.estudiante.length,
    docente: STATIC_SUGGESTIONS.docente.length,
    aspirante: STATIC_SUGGESTIONS.aspirante.length,
    total: Object.values(STATIC_SUGGESTIONS).reduce((sum, arr) => sum + arr.length, 0)
  };
}

export default { getStaticSuggestions, getAllSuggestions, getSuggestionStats };