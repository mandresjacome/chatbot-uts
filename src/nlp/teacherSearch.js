/**
 * Módulo especializado para búsqueda de docentes por nombre
 * Este módulo NO afecta las búsquedas generales del chatbot
 */

/**
 * Parsea la información de docentes desde texto plano
 * @param {string} teachersText - Texto con información de docentes
 * @returns {Array} Array de objetos con información de docentes
 */
function parseTeachersFromText(teachersText) {
    const teachers = [];
    
    // Si el texto está todo en una línea, intentar separar por patrones de correo
    if (!teachersText.includes('\n') && teachersText.includes('@correo.uts.edu.co')) {
            // Buscar todos los correos @correo.uts.edu.co y extraer contexto alrededor
            const emailPattern = /([a-zA-Z0-9._%+-]+@correo\.uts\.edu\.co)/g;
            let emailMatch;
            
            while ((emailMatch = emailPattern.exec(teachersText)) !== null) {
                const correo = emailMatch[1];
                const startIndex = emailMatch.index;
                
                // Buscar hacia atrás para encontrar el nombre (hasta 150 chars antes)
                const beforeEmail = teachersText.substring(Math.max(0, startIndex - 150), startIndex);
                
                // Patrón más flexible para nombres (incluye acentos y caracteres especiales)
                const namePattern = /([A-ZÁÉÍÓÚÑÜ][a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.-]{2,50}[a-záéíóúñüA-ZÁÉÍÓÚÑÜ])\s*$/;
                const nameExec = namePattern.exec(beforeEmail);
                const nombre = nameExec ? nameExec[1].trim() : correo.split('@')[0];
                
                // Buscar hacia adelante para información adicional (hasta 500 chars después)
                const afterEmail = teachersText.substring(startIndex + correo.length, startIndex + correo.length + 500);
                
                // Buscar CvLAC
                const cvlacPattern = /(https:\/\/scienti\.minciencias\.gov\.co\/cvlac\/[^\s]+)/;
                const cvlacExec = cvlacPattern.exec(afterEmail);
                const cvlac = cvlacExec ? cvlacExec[1] : '';
                
                if (nombre && correo.includes('@correo.uts.edu.co')) {
                    teachers.push({
                        nombre: nombre,
                        correo: correo,
                        estudios: afterEmail.substring(0, 100).trim() + '...',
                        cursos: '',
                        experienciaTotal: '',
                        experienciaUTS: '',
                        cvlac: cvlac
                    });
                }
            }
    } else {
        // Método original para texto con líneas separadas
        const lines = teachersText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            // Saltar líneas que no parecen ser datos de docentes
            if (line.includes('DOCENTE') || line.includes('Correo Institucional') || 
                line.includes('---') || line.length < 10) {
                continue;
            }
            
            // Dividir por tabulaciones o múltiples espacios
            const parts = line.split(/\t+|\s{2,}/).filter(part => part.trim());
            
            if (parts.length >= 6) {
                const teacher = {
                    nombre: parts[0]?.trim() || '',
                    correo: parts[1]?.trim() || '',
                    estudios: parts[2]?.trim() || '',
                    cursos: parts[3]?.trim() || '',
                    experienciaTotal: parts[4]?.trim() || '',
                    experienciaUTS: parts[5]?.trim() || '',
                    cvlac: parts[6]?.trim() || ''
                };
                
                // Solo agregar si tiene nombre y correo válidos
                if (teacher.nombre && teacher.correo && teacher.correo.includes('@')) {
                    teachers.push(teacher);
                }
            }
        }
    }
    
    return teachers;
}

/**
 * Normaliza un nombre para búsqueda (elimina acentos, convierte a minúsculas)
 * @param {string} name - Nombre a normalizar
 * @returns {string} Nombre normalizado
 */
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z\s]/g, '') // Solo letras y espacios
        .replace(/\s+/g, ' ') // Normalizar espacios
        // Normalizar variaciones ortográficas comunes
        .replace(/leidy/g, 'leydi') // Normalizar Leidy -> Leydi
        .replace(/leydy/g, 'leydi') // Normalizar Leydy -> Leydi
        .trim();
}

/**
 * Busca docentes que coincidan con un nombre (puede devolver múltiples resultados)
 * @param {string} searchName - Nombre a buscar
 * @param {string} teachersText - Texto con información de docentes
 * @returns {Array} Array de docentes que coinciden
 */
function findTeachersByName(searchName, teachersText) {
    const teachers = parseTeachersFromText(teachersText);
    const normalizedSearch = normalizeName(searchName);
    const searchParts = normalizedSearch.split(' ');
    const results = [];
    
    for (const teacher of teachers) {
        const normalizedTeacherName = normalizeName(teacher.nombre);
        const teacherParts = normalizedTeacherName.split(' ');
        
        // Coincidencia exacta (máxima prioridad)
        if (normalizedTeacherName === normalizedSearch) {
            return [teacher]; // Devolver solo este resultado
        }
        
        // Coincidencia completa (nombre y apellido)
        if (searchParts.length >= 2) {
            const allPartsMatch = searchParts.every(searchPart => 
                teacherParts.some(teacherPart => 
                    teacherPart.includes(searchPart) || searchPart.includes(teacherPart)
                )
            );
            
            if (allPartsMatch) {
                results.push({ teacher, score: 100 }); // Puntuación alta
            }
        } else {
            // Búsqueda por un solo nombre/apellido
            const singlePart = searchParts[0];
            
            // Verificar si coincide con primer nombre
            if (teacherParts[0] && teacherParts[0].includes(singlePart)) {
                results.push({ teacher, score: 80 }); // Puntuación media-alta
            }
            // Verificar si coincide con algún apellido  
            else if (teacherParts.slice(1).some(part => part.includes(singlePart))) {
                results.push({ teacher, score: 70 }); // Puntuación media
            }
            // Coincidencia parcial en cualquier parte del nombre
            else if (normalizedTeacherName.includes(singlePart)) {
                results.push({ teacher, score: 60 }); // Puntuación baja
            }
        }
    }
    
    // Ordenar por puntuación y devolver solo los docentes
    return results
        .sort((a, b) => b.score - a.score)
        .map(result => result.teacher);
}

/**
 * Busca un docente específico por nombre (mantiene compatibilidad)
 * @param {string} searchName - Nombre a buscar
 * @param {string} teachersText - Texto con información de docentes
 * @returns {Object|null} Información del docente encontrado o null
 */
function findTeacherByName(searchName, teachersText) {
    const results = findTeachersByName(searchName, teachersText);
    return results.length > 0 ? results[0] : null;
}

/**
 * Detecta si una consulta está buscando información de un docente específico
 * @param {string} query - Consulta del usuario
 * @returns {boolean} true si parece una búsqueda de docente
 */
function isTeacherSearchQuery(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Palabras clave que indican búsqueda de docente
    const teacherKeywords = [
        'profesor', 'docente', 'maestro', 'ingeniero', 'magister', 'doctor'
    ];
    
    // Si contiene palabras clave de docente
    const hasTeacherKeyword = teacherKeywords.some(keyword => 
        normalizedQuery.includes(keyword)
    );
    
    // Si parece ser solo un nombre (1-4 palabras, principalmente letras)
    const words = normalizedQuery.split(/\s+/);
    const seemsLikeName = words.length >= 1 && words.length <= 4 && 
        words.every(word => /^[a-záéíóúñü]+$/i.test(word)) &&
        words.every(word => word.length >= 3); // Mínimo 3 letras por palabra
    
    return hasTeacherKeyword || seemsLikeName;
}

/**
 * Formatea la información de un docente para mostrar al usuario
 * @param {Object} teacher - Información del docente
 * @returns {string} Información formateada
 */
function formatTeacherInfo(teacher) {
    const sections = [];
    
    sections.push(`👨‍🏫 **${teacher.nombre}**`);
    sections.push(`📧 **Correo:** ${teacher.correo}`);
    
    if (teacher.estudios) {
        sections.push(`🎓 **Formación:** ${teacher.estudios}`);
    }
    
    if (teacher.cursos) {
        sections.push(`📚 **Áreas de enseñanza:** ${teacher.cursos}`);
    }
    
    if (teacher.experienciaTotal) {
        sections.push(`⏱️ **Experiencia total:** ${teacher.experienciaTotal}`);
    }
    
    if (teacher.experienciaUTS) {
        sections.push(`🏛️ **Experiencia en UTS:** ${teacher.experienciaUTS}`);
    }
    
    if (teacher.cvlac && teacher.cvlac.startsWith('http')) {
        sections.push(`🔗 **CvLAC:** [Ver curriculum](${teacher.cvlac})`);
    }
    
    return sections.join('\n\n');
}

/**
 * Crea una respuesta inteligente cuando hay múltiples coincidencias para un nombre
 * @param {string} searchName - Nombre buscado
 * @param {Array} matchingTeachers - Docentes que coinciden
 * @returns {string} Respuesta formateada
 */
function formatMultipleTeachersResponse(searchName, matchingTeachers) {
    if (matchingTeachers.length === 0) {
        return `No encontré ningún docente con el nombre "${searchName}". ¿Podrías verificar la ortografía o proporcionar más información?`;
    }
    
    if (matchingTeachers.length === 1) {
        return formatTeacherInfo(matchingTeachers[0]);
    }
    
    // Múltiples coincidencias
    const response = [`Encontré varios docentes con el nombre "${searchName}". ¿Te refieres a alguno de estos?`];
    
    matchingTeachers.slice(0, 5).forEach((teacher, index) => {
        response.push(`${index + 1}. **${teacher.nombre}** - ${teacher.correo}`);
    });
    
    if (matchingTeachers.length > 5) {
        response.push(`... y ${matchingTeachers.length - 5} más.`);
    }
    
    response.push('');
    response.push('💡 **Tip:** Para obtener información específica, escribe el nombre completo del docente, por ejemplo: "Victor Ochoa" o "Leydi Polo".');
    
    return response.join('\n\n');
}

export {
    isTeacherSearchQuery,
    findTeacherByName,
    findTeachersByName,
    formatTeacherInfo,
    formatMultipleTeachersResponse,
    parseTeachersFromText
};
