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
        // Usar regex para encontrar patrones de docentes
        // Patrón: nombre + correo@uts.edu.co + información adicional + URL CvLAC
        const teacherPattern = /([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü\s]+[a-záéíóúñü])\s+([a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s+(.*?)(?=\s+[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü\s]+[a-záéíóúñü]\s+[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|$)/g;
        
        let match;
        while ((match = teacherPattern.exec(teachersText)) !== null) {
            const [, nombre, correo, info] = match;
            
            if (nombre && correo && correo.includes('@uts.edu.co')) {
                // Extraer información adicional del texto
                const infoText = info.trim();
                
                // Buscar CvLAC URL al final
                const cvlacMatch = infoText.match(/(https:\/\/scienti\.minciencias\.gov\.co\/cvlac\/[^\s]+)/);
                const cvlac = cvlacMatch ? cvlacMatch[1] : '';
                
                // Remover CvLAC del texto para extraer el resto
                const remainingInfo = cvlac ? infoText.replace(cvlac, '').trim() : infoText;
                
                const teacher = {
                    nombre: nombre.trim(),
                    correo: correo.trim(),
                    estudios: remainingInfo.substring(0, 200) + '...', // Primeros 200 chars como estudios
                    cursos: '', // Difícil de extraer del formato actual
                    experienciaTotal: '',
                    experienciaUTS: '',
                    cvlac: cvlac
                };
                
                teachers.push(teacher);
            }
        }
        
        // Si no funciona el regex complejo, usar método más simple
        if (teachers.length === 0) {
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
        .trim();
}

/**
 * Busca un docente específico por nombre
 * @param {string} searchName - Nombre a buscar
 * @param {string} teachersText - Texto con información de docentes
 * @returns {Object|null} Información del docente encontrado o null
 */
function findTeacherByName(searchName, teachersText) {
    const teachers = parseTeachersFromText(teachersText);
    const normalizedSearch = normalizeName(searchName);
    
    // Buscar coincidencia exacta primero
    for (const teacher of teachers) {
        const normalizedTeacherName = normalizeName(teacher.nombre);
        
        // Coincidencia exacta
        if (normalizedTeacherName === normalizedSearch) {
            return teacher;
        }
        
        // Coincidencia parcial (nombre o apellido)
        const searchParts = normalizedSearch.split(' ');
        const teacherParts = normalizedTeacherName.split(' ');
        
        // Verificar si todas las partes del nombre buscado están en el nombre del docente
        const allPartsMatch = searchParts.every(searchPart => 
            teacherParts.some(teacherPart => 
                teacherPart.includes(searchPart) || searchPart.includes(teacherPart)
            )
        );
        
        if (allPartsMatch && searchParts.length >= 2) {
            return teacher;
        }
    }
    
    // Búsqueda más flexible (solo por primer nombre o apellido)
    for (const teacher of teachers) {
        const normalizedTeacherName = normalizeName(teacher.nombre);
        
        if (normalizedTeacherName.includes(normalizedSearch) || 
            normalizedSearch.includes(normalizedTeacherName.split(' ')[0])) {
            return teacher;
        }
    }
    
    return null;
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
    
    // Si parece ser solo un nombre (2-4 palabras, principalmente letras)
    const words = normalizedQuery.split(/\s+/);
    const seemsLikeName = words.length >= 2 && words.length <= 4 && 
        words.every(word => /^[a-záéíóúñü]+$/i.test(word));
    
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

export {
    isTeacherSearchQuery,
    findTeacherByName,
    formatTeacherInfo,
    parseTeachersFromText
};
