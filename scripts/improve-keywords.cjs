async function improveKeywords() {
    console.log('🔧 Iniciando mejora de palabras clave...');
    
    // Importar funciones específicas del módulo DB
    const { bootstrapSchema, queryAll } = await import('../src/db/index.js');
    
    await bootstrapSchema();
    const records = await queryAll("SELECT * FROM knowledge_base ORDER BY id");
    
    console.log(`📊 Registros encontrados: ${records.length}`);
    
    const keywordMappings = {
        // INGENIERÍA DE SISTEMAS
        'presentacion del programa de Ingeniería de Sistemas': {
            keywords: [
                'presentacion ingeniería sistemas',
                'sobre ingeniería sistemas', 
                'que es ingeniería sistemas',
                'información ingeniería sistemas',
                'programa ingeniería sistemas',
                'acerca ingeniería sistemas',
                'descripción ingeniería',
                'introducción ingeniería',
                'conocer ingeniería',
                'estudiar ingeniería sistemas UTS'
            ]
        },
        'perfil profesional del programa de Ingeniería de Sistemas': {
            keywords: [
                'perfil profesional ingeniero',
                'perfil del ingeniero sistemas',
                'competencias ingeniero sistemas',
                'habilidades ingeniero sistemas', 
                'que hace ingeniero sistemas',
                'funciones ingeniero sistemas',
                'capacidades ingeniero',
                'destrezas ingeniero',
                'perfil ingeniero UTS',
                'rol del ingeniero sistemas'
            ]
        },
        'campos de_accion del programa de Ingeniería de Sistemas': {
            keywords: [
                'campos accion ingeniero sistemas',
                'donde trabaja ingeniero sistemas',
                'trabajo ingeniero sistemas',
                'empleos ingeniero sistemas',
                'campo laboral ingeniero',
                'áreas trabajo ingeniero',
                'sectores ingeniero sistemas',
                'oportunidades laborales ingeniero',
                'mercado laboral ingeniero',
                'campos desempeño ingeniero'
            ]
        },
        'plan de_estudios del programa de Ingeniería de Sistemas': {
            keywords: [
                'plan estudios ingeniería sistemas',
                'materias ingeniería sistemas',
                'semestres ingeniería sistemas',
                'curriculum ingeniería sistemas',
                'pensum ingeniería sistemas',
                'asignaturas ingeniería',
                'malla curricular ingeniería',
                'contenido académico ingeniería',
                'programa académico ingeniería',
                'estructura curricular ingeniería'
            ]
        },
        'resultados aprendizaje del programa de Ingeniería de Sistemas': {
            keywords: [
                'resultados aprendizaje ingeniería',
                'competencias ingeniería sistemas',
                'logros académicos ingeniería',
                'objetivos aprendizaje ingeniería',
                'metas educativas ingeniería',
                'outcomes ingeniería sistemas',
                'aprendizajes esperados ingeniería'
            ]
        },
        'docentes del programa de Ingeniería de Sistemas': {
            keywords: [
                'docentes ingeniería sistemas',
                'profesores ingeniería sistemas',
                'planta docente ingeniería',
                'cuerpo académico ingeniería',
                'faculty ingeniería sistemas',
                'maestros ingeniería UTS'
            ]
        },
        'contacto del programa de Ingeniería de Sistemas': {
            keywords: [
                'contacto ingeniería sistemas',
                'información contacto ingeniería',
                'teléfono ingeniería sistemas',
                'email ingeniería sistemas',
                'dirección ingeniería UTS',
                'comunicarse ingeniería'
            ]
        },

        // TECNOLOGÍA EN DESARROLLO DE SISTEMAS
        'presentacion del programa de Tecnología en Desarrollo de Sistemas': {
            keywords: [
                'presentacion tecnología sistemas',
                'sobre tecnología desarrollo sistemas',
                'que es tecnología sistemas informáticos',
                'información tecnología sistemas',
                'programa tecnología desarrollo',
                'acerca tecnología sistemas',
                'descripción tecnología',
                'introducción tecnología',
                'conocer tecnología sistemas UTS',
                'estudiar tecnología informática'
            ]
        },
        'perfil profesional del programa de Tecnología en Desarrollo de Sistemas': {
            keywords: [
                'perfil profesional tecnólogo',
                'perfil del tecnólogo sistemas',
                'competencias tecnólogo sistemas',
                'habilidades tecnólogo informático',
                'que hace tecnólogo sistemas',
                'funciones tecnólogo desarrollo',
                'capacidades tecnólogo',
                'destrezas tecnólogo',
                'perfil tecnólogo UTS',
                'rol del tecnólogo sistemas'
            ]
        },
        'campos de_accion del programa de Tecnología en Desarrollo de Sistemas': {
            keywords: [
                'campos accion tecnólogo sistemas',
                'donde trabaja tecnólogo sistemas',
                'trabajo tecnólogo desarrollo',
                'empleos tecnólogo sistemas',
                'campo laboral tecnólogo',
                'áreas trabajo tecnólogo',
                'sectores tecnólogo informático',
                'oportunidades laborales tecnólogo',
                'mercado laboral tecnólogo'
            ]
        },
        'plan de_estudios del programa de Tecnología en Desarrollo de Sistemas': {
            keywords: [
                'plan estudios tecnología sistemas',
                'materias tecnología desarrollo',
                'semestres tecnología sistemas',
                'curriculum tecnología informática',
                'pensum tecnología sistemas',
                'asignaturas tecnología',
                'malla curricular tecnología',
                'contenido académico tecnología'
            ]
        },
        'resultados aprendizaje del programa de Tecnología en Desarrollo de Sistemas': {
            keywords: [
                'resultados aprendizaje tecnología',
                'competencias tecnología sistemas',
                'logros académicos tecnología',
                'objetivos aprendizaje tecnología',
                'metas educativas tecnología',
                'outcomes tecnología sistemas'
            ]
        },

        // ASPIRANTES
        'calendario aspirantes': {
            keywords: [
                'calendario aspirantes',
                'fechas inscripciones',
                'calendario académico aspirantes',
                'cronograma admisiones',
                'fechas importantes aspirantes',
                'calendario admisiones UTS',
                'períodos inscripción',
                'fechas matrícula'
            ]
        },
        'documentos requeridos para aspirantes': {
            keywords: [
                'documentos aspirantes',
                'requisitos inscripción',
                'documentos admisión',
                'papeles necesarios aspirantes',
                'requisitos documentales',
                'documentación requerida',
                'certificados necesarios',
                'papelería admisión'
            ]
        },
        'contacto asesorias para aspirantes': {
            keywords: [
                'contacto asesorías aspirantes',
                'asesorías académicas aspirantes',
                'orientación aspirantes',
                'ayuda aspirantes',
                'soporte aspirantes',
                'consejería aspirantes'
            ]
        },
        'becas gratuidad para aspirantes': {
            keywords: [
                'becas aspirantes',
                'gratuidad educación',
                'ayudas económicas aspirantes',
                'financiamiento estudios',
                'becas UTS',
                'apoyo económico estudiantes',
                'subsidios educativos'
            ]
        },
        'costos pagos para aspirantes': {
            keywords: [
                'costos aspirantes',
                'precios matrícula',
                'costos educación UTS',
                'valor semestre',
                'tarifas académicas',
                'costos estudios',
                'precio carrera'
            ]
        },
        'enlaces importantes para aspirantes': {
            keywords: [
                'enlaces aspirantes',
                'links importantes aspirantes',
                'sitios web aspirantes',
                'páginas útiles aspirantes',
                'recursos online aspirantes'
            ]
        },

        // DOCENTES
        'normatividad para docentes': {
            keywords: [
                'normatividad docentes',
                'reglamentos docentes',
                'normas profesores',
                'estatuto docente',
                'legislación académica',
                'reglamentación docente UTS'
            ]
        },
        'plataformas para docentes': {
            keywords: [
                'plataformas docentes',
                'herramientas digitales docentes',
                'sistemas académicos docentes',
                'plataformas educativas UTS',
                'tecnología educativa docentes'
            ]
        },
        'recursos para docentes': {
            keywords: [
                'recursos docentes',
                'materiales académicos docentes',
                'herramientas pedagógicas',
                'apoyo docente UTS',
                'recursos educativos'
            ]
        },
        'academico para docentes': {
            keywords: [
                'académico docentes',
                'gestión académica docentes',
                'procesos académicos profesores',
                'administración académica UTS'
            ]
        },
        'mision docente para docentes': {
            keywords: [
                'misión docente',
                'función docente UTS',
                'rol profesor UTS',
                'propósito académico docente'
            ]
        },

        // ESTUDIANTES
        'mision estudiantil para estudiantes': {
            keywords: [
                'misión estudiantil',
                'servicios estudiantes',
                'bienestar estudiantil UTS',
                'apoyo estudiantes',
                'vida estudiantil'
            ]
        },
        'calendarios academicos para estudiantes': {
            keywords: [
                'calendario académico estudiantes',
                'fechas académicas estudiantes',
                'cronograma académico UTS',
                'calendario escolar estudiantes'
            ]
        },
        'plataformas digitales para estudiantes': {
            keywords: [
                'plataformas estudiantes',
                'herramientas digitales estudiantes',
                'sistemas académicos estudiantes',
                'campus virtual UTS',
                'plataformas educativas estudiantes'
            ]
        },
        'tramites estudiantes para estudiantes': {
            keywords: [
                'trámites estudiantes',
                'procesos académicos estudiantes',
                'gestiones estudiantes UTS',
                'servicios académicos estudiantes',
                'procedimientos estudiantes'
            ]
        }
    };

    let updatedCount = 0;

    for (const record of records) {
        const pregunta = record.pregunta.toLowerCase();
        
        // Buscar coincidencias en los mapeos
        for (const [key, config] of Object.entries(keywordMappings)) {
            if (pregunta.includes(key.toLowerCase())) {
                const newKeywords = config.keywords.join(', ');
                
                const { exec } = await import('../src/db/index.js');
                await exec(
                    "UPDATE knowledge_base SET palabras_clave = ? WHERE id = ?",
                    [newKeywords, record.id]
                );
                
                console.log(`✅ Actualizado ID ${record.id}: ${key}`);
                console.log(`   Nuevas palabras clave: ${newKeywords.substring(0, 80)}...`);
                updatedCount++;
                break;
            }
        }
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Registros actualizados: ${updatedCount}/${records.length}`);
    console.log(`💡 Las palabras clave han sido mejoradas con términos más específicos y variados`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    improveKeywords().catch(console.error);
}

module.exports = { improveKeywords };
