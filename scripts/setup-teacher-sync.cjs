/**
 * Sistema automatizado de actualización de palabras clave para docentes
 * Este script configura la sincronización automática de nombres de docentes
 */

async function setupTeacherSync() {
    console.log('⚙️ Configurando sistema de sincronización automática de docentes...\n');
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
        // 1. Crear directorio cache si no existe
        const cacheDir = './cache';
        try {
            await fs.access(cacheDir);
        } catch {
            await fs.mkdir(cacheDir, { recursive: true });
            console.log('📁 Creado directorio cache');
        }
        
        // 2. Ejecutar sincronización inicial
        console.log('🔄 Ejecutando sincronización inicial...');
        const { syncTeacherKeywords } = await import('./sync-teacher-keywords.cjs');
        const synced = await syncTeacherKeywords();
        
        if (synced) {
            console.log('✅ Sincronización inicial completada');
        } else {
            console.log('ℹ️ No se requirieron cambios en la sincronización inicial');
        }
        
        // 3. Configurar el auto-update-system para incluir teacher sync
        console.log('\n📋 Configurando automatización...');
        
        const autoUpdatePath = './scripts/auto-update-system.cjs';
        let autoUpdateContent = '';
        
        try {
            autoUpdateContent = await fs.readFile(autoUpdatePath, 'utf8');
        } catch (error) {
            console.log('⚠️ Archivo auto-update-system.cjs no encontrado, creando uno básico...');
            autoUpdateContent = `/**
 * Sistema automático de actualización de datos del chatbot
 */

async function runAutoUpdate() {
    console.log('🤖 Iniciando actualización automática del sistema...');
    
    // Aquí se ejecutan las tareas de actualización
    console.log('✅ Actualización automática completada');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runAutoUpdate().catch(console.error);
}

module.exports = { runAutoUpdate };
`;
        }
        
        // Verificar si ya incluye teacher sync
        if (!autoUpdateContent.includes('sync-teacher-keywords')) {
            // Agregar teacher sync al auto-update-system
            const syncImport = "    const { autoSyncTeachers } = await import('./sync-teacher-keywords.cjs');\n";
            const syncCall = "    \n    // Sincronizar nombres de docentes con palabras clave\n    await autoSyncTeachers();\n";
            
            // Insertar después de console.log inicial
            autoUpdateContent = autoUpdateContent.replace(
                "console.log('🤖 Iniciando actualización automática del sistema...');",
                "console.log('🤖 Iniciando actualización automática del sistema...');\n" + syncImport
            );
            
            // Insertar llamada antes del console.log final
            autoUpdateContent = autoUpdateContent.replace(
                "console.log('✅ Actualización automática completada');",
                syncCall + "    console.log('✅ Actualización automática completada');"
            );
            
            await fs.writeFile(autoUpdatePath, autoUpdateContent, 'utf8');
            console.log('✅ Auto-update-system configurado para incluir sincronización de docentes');
        } else {
            console.log('ℹ️ Auto-update-system ya incluye sincronización de docentes');
        }
        
        // 4. Mostrar instrucciones de uso
        console.log('\n📖 INSTRUCCIONES DE USO:\n');
        console.log('🔧 SINCRONIZACIÓN MANUAL:');
        console.log('   node scripts/sync-teacher-keywords.cjs --force');
        console.log('   (Fuerza la actualización sin verificar cambios)');
        
        console.log('\n🤖 SINCRONIZACIÓN AUTOMÁTICA:');
        console.log('   node scripts/auto-update-system.cjs');
        console.log('   (Verifica cambios y sincroniza solo si es necesario)');
        
        console.log('\n⏰ PROGRAMACIÓN AUTOMÁTICA:');
        console.log('   - Windows: Usar Programador de Tareas');
        console.log('   - Linux/Mac: Usar crontab');
        console.log('   - Ejemplo cron (cada hora): 0 * * * * cd /path/to/chatbot && node scripts/auto-update-system.cjs');
        
        console.log('\n🔍 VERIFICAR FUNCIONAMIENTO:');
        console.log('   1. Agregar un nuevo docente a la base de datos');
        console.log('   2. Ejecutar: node scripts/sync-teacher-keywords.cjs --force');
        console.log('   3. Probar búsqueda del nuevo docente en el chatbot');
        
        console.log('\n📊 MONITOREO:');
        console.log('   - Los logs mostrarán cuándo se detectan cambios');
        console.log('   - El archivo cache/teachers-hash.txt guarda el estado actual');
        console.log('   - Las búsquedas por nombre funcionarán automáticamente');
        
        console.log('\n✅ ¡Sistema configurado exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la configuración:', error.message);
        throw error;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    setupTeacherSync().catch(console.error);
}

module.exports = { setupTeacherSync };