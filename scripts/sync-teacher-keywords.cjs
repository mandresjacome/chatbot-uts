/**
 * Script automático para sincronizar nombres de docentes con palabras clave
 * Se ejecuta periódicamente para mantener actualizadas las búsquedas por nombre
 */

async function syncTeacherKeywords() {
    console.log('🔄 Iniciando sincronización de nombres de docentes...');
    
    try {
        // Importar funciones necesarias
        const { bootstrapSchema, queryAll, exec } = await import('../src/db/index.js');
        const { parseTeachersFromText } = await import('../src/nlp/teacherSearch.js');
        
        await bootstrapSchema();
        
        // 1. Encontrar el registro de docentes
        const teacherRecord = await queryAll(`
            SELECT * FROM knowledge_base 
            WHERE pregunta LIKE '%docentes%' AND respuesta_texto LIKE '%@correo.uts.edu.co%'
            LIMIT 1
        `);
        
        if (teacherRecord.length === 0) {
            console.log('❌ No se encontró registro de docentes');
            return false;
        }
        
        const record = teacherRecord[0];
        console.log(`📋 Procesando registro ID ${record.id}: "${record.pregunta}"`);
        
        // 2. Extraer nombres de todos los docentes del texto
        console.log('🔍 Extrayendo nombres de docentes...');
        const teachers = parseTeachersFromText(record.respuesta_texto);
        console.log(`📊 Docentes encontrados: ${teachers.length}`);
        
        // 3. Extraer solo nombres (sin apellidos repetitivos) 
        const teacherNames = teachers.map(teacher => {
            if (!teacher.nombre) return null;
            
            // Limpiar y normalizar nombre
            const cleanName = teacher.nombre
                .toLowerCase()
                .replace(/[^\w\s]/g, '') // Quitar acentos y caracteres especiales
                .trim();
            
            // Extraer palabras individuales (nombres y apellidos)
            const words = cleanName.split(/\s+/).filter(word => word.length > 2);
            return words;
        }).filter(Boolean).flat();
        
        // 4. Eliminar duplicados y crear lista única
        const uniqueNames = [...new Set(teacherNames)].sort();
        console.log(`🎯 Nombres únicos extraídos: ${uniqueNames.length}`);
        console.log(`   Ejemplos: ${uniqueNames.slice(0, 10).join(', ')}...`);
        
        // 5. Crear las nuevas palabras clave
        const baseKeywords = [
            'docentes ingeniería sistemas',
            'profesores ingeniería sistemas', 
            'planta docente ingeniería',
            'cuerpo académico ingeniería',
            'faculty ingeniería sistemas',
            'maestros ingeniería UTS'
        ];
        
        const allKeywords = [...baseKeywords, ...uniqueNames];
        const keywordString = allKeywords.join(', ');
        
        console.log(`📝 Total palabras clave: ${allKeywords.length}`);
        console.log(`📏 Longitud total: ${keywordString.length} caracteres`);
        
        // 6. Verificar si hay cambios necesarios
        const currentKeywords = record.palabras_clave || '';
        
        if (currentKeywords === keywordString) {
            console.log('✅ No se requieren cambios - palabras clave ya están actualizadas');
            return false;
        }
        
        // 7. Actualizar la base de datos
        console.log('💾 Actualizando base de datos...');
        await exec(
            'UPDATE knowledge_base SET palabras_clave = ?, updated_at = datetime("now") WHERE id = ?',
            [keywordString, record.id]
        );
        
        // 8. Recargar la base de conocimiento en el retriever
        console.log('🔄 Recargando base de conocimiento en retriever...');
        const { reloadKB } = await import('../src/nlp/retriever.js');
        const reloadedCount = await reloadKB();
        
        console.log('✅ Sincronización completada exitosamente!');
        console.log(`📊 Items recargados en retriever: ${reloadedCount}`);
        console.log(`🔑 Nuevas búsquedas disponibles para: ${uniqueNames.slice(0, 5).join(', ')}...`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error durante la sincronización:', error.message);
        return false;
    }
}

/**
 * Verifica si los docentes han cambiado comparando con un hash previo
 */
async function checkTeachersChanged() {
    try {
        const { queryAll } = await import('../src/db/index.js');
        const fs = await import('fs/promises');
        const crypto = await import('crypto');
        
        // Obtener contenido actual de docentes
        const teacherRecord = await queryAll(`
            SELECT respuesta_texto FROM knowledge_base 
            WHERE pregunta LIKE '%docentes%' AND respuesta_texto LIKE '%@correo.uts.edu.co%'
            LIMIT 1
        `);
        
        if (teacherRecord.length === 0) {
            return false;
        }
        
        // Calcular hash del contenido actual
        const currentContent = teacherRecord[0].respuesta_texto;
        const currentHash = crypto.createHash('md5').update(currentContent).digest('hex');
        
        // Leer hash previo si existe
        const hashFile = './cache/teachers-hash.txt';
        let previousHash = '';
        
        try {
            previousHash = await fs.readFile(hashFile, 'utf8');
        } catch (error) {
            // Archivo no existe, es primera ejecución
        }
        
        // Comparar hashes
        if (currentHash !== previousHash) {
            // Los docentes cambiaron, guardar nuevo hash
            await fs.writeFile(hashFile, currentHash, 'utf8');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error verificando cambios en docentes:', error.message);
        return true; // En caso de error, asumir que hay cambios
    }
}

/**
 * Función principal que verifica cambios y sincroniza si es necesario
 */
async function autoSyncTeachers() {
    console.log('🤖 Iniciando auto-sincronización de docentes...');
    
    const hasChanged = await checkTeachersChanged();
    
    if (hasChanged) {
        console.log('📢 Cambios detectados en información de docentes');
        const synced = await syncTeacherKeywords();
        return synced;
    } else {
        console.log('✅ No se detectaron cambios en docentes - no se requiere sincronización');
        return false;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--force')) {
        console.log('🔧 Modo forzado activado - omitiendo verificación de cambios');
        syncTeacherKeywords().catch(console.error);
    } else {
        autoSyncTeachers().catch(console.error);
    }
}

module.exports = { syncTeacherKeywords, autoSyncTeachers, checkTeachersChanged };