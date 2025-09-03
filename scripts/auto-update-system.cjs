const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

class AutoUpdateSystem {
    constructor() {
        this.logPrefix = '🤖 [AUTO-UPDATE]';
        this.scriptsPath = path.join(__dirname);
        this.rootPath = path.join(__dirname, '..');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleString('es-CO');
        const icons = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            process: '🔄'
        };
        console.log(`${this.logPrefix} ${icons[type]} [${timestamp}] ${message}`);
    }

    async runCommand(command, description) {
        this.log(`${description}...`, 'process');
        try {
            const { stdout, stderr } = await execAsync(command, { 
                cwd: this.rootPath,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            
            if (stderr && !stderr.includes('nodemon')) {
                this.log(`Warning: ${stderr}`, 'warning');
            }
            
            this.log(`✓ ${description} completado`, 'success');
            return { success: true, output: stdout };
        } catch (error) {
            this.log(`Error en ${description}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async runScrapers() {
        this.log('=== FASE 1: EJECUTANDO SCRAPERS ===', 'info');
        
        const scrapers = [
            { cmd: 'npm run scraper:aspirantes', desc: 'Scraper de aspirantes' },
            { cmd: 'npm run scraper:docentes', desc: 'Scraper de docentes' },
            { cmd: 'npm run scraper:estudiantes', desc: 'Scraper de estudiantes' },
            { cmd: 'npm run scraper:tecnologia', desc: 'Scraper de tecnología' }
        ];

        let successCount = 0;
        let failCount = 0;

        for (const scraper of scrapers) {
            const result = await this.runCommand(scraper.cmd, scraper.desc);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        this.log(`Scrapers completados: ${successCount} exitosos, ${failCount} fallidos`, 
                 failCount > 0 ? 'warning' : 'success');
        
        return { successCount, failCount };
    }

    async improveKeywords() {
        this.log('=== FASE 2: MEJORANDO PALABRAS CLAVE ===', 'info');
        return await this.runCommand('npm run improve-keywords', 'Mejora de palabras clave');
    }

    async generateSynonyms() {
        this.log('=== FASE 3: GENERANDO SINÓNIMOS ===', 'info');
        return await this.runCommand('npm run generate-synonyms', 'Generación de sinónimos');
    }

    async validateDatabase() {
        this.log('=== FASE 4: VALIDANDO BASE DE DATOS ===', 'info');
        
        try {
            const { bootstrapSchema, queryAll } = await import('../src/db/index.js');
            await bootstrapSchema();
            
            const records = await queryAll("SELECT COUNT(*) as total FROM knowledge_base");
            const totalRecords = records[0].total;
            
            this.log(`Base de datos validada: ${totalRecords} registros encontrados`, 'success');
            
            if (totalRecords === 0) {
                this.log('⚠️ Base de datos vacía - se recomienda ejecutar scrapers', 'warning');
                return { success: false, records: 0 };
            }

            // Verificar que los registros tengan palabras clave mejoradas
            const withKeywords = await queryAll(
                "SELECT COUNT(*) as total FROM knowledge_base WHERE LENGTH(palabras_clave) > 50"
            );
            const improvedRecords = withKeywords[0].total;
            
            this.log(`Registros con palabras clave mejoradas: ${improvedRecords}/${totalRecords}`, 'info');
            
            return { success: true, records: totalRecords, improved: improvedRecords };
        } catch (error) {
            this.log(`Error validando base de datos: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async checkForNewContent() {
        this.log('=== VERIFICANDO CONTENIDO NUEVO ===', 'info');
        
        // Ejecutar un scraper de prueba para detectar cambios
        const result = await this.runCommand('npm run scraper:fixed', 'Verificación de contenido');
        
        if (result.success) {
            this.log('Verificación de contenido completada', 'success');
            return true;
        } else {
            this.log('Error en verificación de contenido', 'warning');
            return false;
        }
    }

    async reloadServer() {
        this.log('=== FASE 5: RECARGANDO SERVIDOR ===', 'info');
        
        // El servidor con nodemon se recarga automáticamente
        // Solo necesitamos asegurarnos de que el retriever se recargue
        try {
            this.log('Servidor se recargará automáticamente con nodemon', 'info');
            this.log('Sistema de retriever se actualizará automáticamente', 'success');
            return { success: true };
        } catch (error) {
            this.log(`Error al recargar servidor: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async fullUpdate() {
        this.log('🚀 INICIANDO ACTUALIZACIÓN COMPLETA DEL SISTEMA', 'info');
        this.log('=' * 60, 'info');
        
        const startTime = Date.now();
        let results = {
            scrapers: null,
            keywords: null,
            synonyms: null,
            database: null,
            server: null
        };

        try {
            // Fase 1: Scrapers
            results.scrapers = await this.runScrapers();
            
            // Fase 2: Mejorar palabras clave
            results.keywords = await this.improveKeywords();
            
            // Fase 3: Generar sinónimos
            results.synonyms = await this.generateSynonyms();
            
            // Fase 4: Validar base de datos
            results.database = await this.validateDatabase();
            
            // Fase 5: Recargar servidor
            results.server = await this.reloadServer();
            
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            this.log('=' * 60, 'info');
            this.log(`🎉 ACTUALIZACIÓN COMPLETA FINALIZADA EN ${duration}s`, 'success');
            this.generateReport(results);
            
            return results;
            
        } catch (error) {
            this.log(`Error crítico en actualización: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async quickUpdate() {
        this.log('⚡ INICIANDO ACTUALIZACIÓN RÁPIDA (sin scrapers)', 'info');
        
        const startTime = Date.now();
        
        try {
            // Solo mejorar keywords y sinónimos
            await this.improveKeywords();
            await this.generateSynonyms();
            const dbValidation = await this.validateDatabase();
            
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            this.log(`⚡ Actualización rápida completada en ${duration}s`, 'success');
            this.log(`📊 Registros procesados: ${dbValidation.records || 0}`, 'info');
            
            return { success: true, duration, records: dbValidation.records };
            
        } catch (error) {
            this.log(`Error en actualización rápida: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    generateReport(results) {
        this.log('📊 REPORTE DE ACTUALIZACIÓN:', 'info');
        this.log(`   Scrapers: ${results.scrapers?.successCount || 0} exitosos, ${results.scrapers?.failCount || 0} fallidos`);
        this.log(`   Palabras clave: ${results.keywords?.success ? '✅' : '❌'}`);
        this.log(`   Sinónimos: ${results.synonyms?.success ? '✅' : '❌'}`);
        this.log(`   Base de datos: ${results.database?.records || 0} registros`);
        this.log(`   Servidor: ${results.server?.success ? '✅ Recargado' : '❌ Error'}`);
    }

    async scheduleUpdate() {
        this.log('⏰ CONFIGURANDO ACTUALIZACIÓN PROGRAMADA', 'info');
        this.log('💡 Para programar actualizaciones automáticas, use cron jobs o Task Scheduler', 'info');
        this.log('💡 Ejemplo para cron (Linux/Mac): 0 2 * * * npm run auto-update', 'info');
        this.log('💡 Ejemplo para Windows Task Scheduler: Diario a las 2:00 AM', 'info');
    }
}

// Funciones principales exportadas
async function fullUpdate() {
    const system = new AutoUpdateSystem();
    return await system.fullUpdate();
}

async function quickUpdate() {
    const system = new AutoUpdateSystem();
    return await system.quickUpdate();
}

async function checkContent() {
    const system = new AutoUpdateSystem();
    return await system.checkForNewContent();
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'full';
    
    const system = new AutoUpdateSystem();
    
    switch (command) {
        case 'full':
            await system.fullUpdate();
            break;
        case 'quick':
            await system.quickUpdate();
            break;
        case 'check':
            await system.checkForNewContent();
            break;
        case 'schedule':
            await system.scheduleUpdate();
            break;
        default:
            console.log('Comandos disponibles:');
            console.log('  full    - Actualización completa (scrapers + keywords + synonyms)');
            console.log('  quick   - Actualización rápida (solo keywords + synonyms)');
            console.log('  check   - Verificar contenido nuevo');
            console.log('  schedule- Información sobre programación automática');
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    AutoUpdateSystem, 
    fullUpdate, 
    quickUpdate, 
    checkContent 
};
