const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ChangeDetector {
    constructor() {
        this.cacheDir = path.join(__dirname, '..', 'cache');
        this.logPrefix = '🔍 [CHANGE-DETECTOR]';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleString('es-CO');
        const icons = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            change: '🔄'
        };
        console.log(`${this.logPrefix} ${icons[type]} [${timestamp}] ${message}`);
    }

    async ensureCacheDir() {
        try {
            await fs.access(this.cacheDir);
        } catch {
            await fs.mkdir(this.cacheDir, { recursive: true });
            this.log('Directorio cache creado', 'success');
        }
    }

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
    }

    async saveSnapshot(name, data) {
        await this.ensureCacheDir();
        const filePath = path.join(this.cacheDir, `${name}.json`);
        const snapshot = {
            timestamp: new Date().toISOString(),
            hash: this.generateHash(JSON.stringify(data)),
            data: data,
            recordCount: Array.isArray(data) ? data.length : Object.keys(data).length
        };
        
        await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));
        this.log(`Snapshot guardado: ${name} (${snapshot.recordCount} registros)`, 'success');
        return snapshot;
    }

    async loadSnapshot(name) {
        try {
            const filePath = path.join(this.cacheDir, `${name}.json`);
            const content = await fs.readFile(filePath, 'utf8');
            const snapshot = JSON.parse(content);
            this.log(`Snapshot cargado: ${name} (${snapshot.recordCount} registros)`, 'info');
            return snapshot;
        } catch (error) {
            this.log(`No se encontró snapshot: ${name}`, 'warning');
            return null;
        }
    }

    async detectDatabaseChanges() {
        this.log('Detectando cambios en base de datos...', 'info');
        
        try {
            const { bootstrapSchema, queryAll } = await import('../src/db/index.js');
            await bootstrapSchema();
            
            const currentData = await queryAll(
                "SELECT id, pregunta, palabras_clave, LENGTH(respuesta_texto) as content_length FROM knowledge_base ORDER BY id"
            );
            
            const previousSnapshot = await this.loadSnapshot('database');
            const currentSnapshot = await this.saveSnapshot('database', currentData);
            
            if (!previousSnapshot) {
                this.log('Primera ejecución - no hay datos previos para comparar', 'info');
                return {
                    hasChanges: true,
                    isFirstRun: true,
                    current: currentData.length,
                    changes: []
                };
            }

            const changes = this.compareDatabaseSnapshots(previousSnapshot.data, currentData);
            
            if (changes.length > 0) {
                this.log(`🔄 Cambios detectados: ${changes.length}`, 'change');
                changes.forEach(change => {
                    this.log(`  ${change.type}: ID ${change.id} - ${change.description}`, 'change');
                });
            } else {
                this.log('No se detectaron cambios en la base de datos', 'success');
            }

            return {
                hasChanges: changes.length > 0,
                isFirstRun: false,
                previous: previousSnapshot.data.length,
                current: currentData.length,
                changes: changes
            };

        } catch (error) {
            this.log(`Error detectando cambios: ${error.message}`, 'error');
            return { hasChanges: false, error: error.message };
        }
    }

    compareDatabaseSnapshots(previous, current) {
        const changes = [];
        const prevMap = new Map(previous.map(item => [item.id, item]));
        const currMap = new Map(current.map(item => [item.id, item]));

        // Detectar nuevos registros
        for (const [id, record] of currMap) {
            if (!prevMap.has(id)) {
                changes.push({
                    type: 'NUEVO',
                    id: id,
                    description: `Nuevo registro: ${record.pregunta.substring(0, 50)}...`
                });
            }
        }

        // Detectar registros eliminados
        for (const [id, record] of prevMap) {
            if (!currMap.has(id)) {
                changes.push({
                    type: 'ELIMINADO',
                    id: id,
                    description: `Registro eliminado: ${record.pregunta.substring(0, 50)}...`
                });
            }
        }

        // Detectar registros modificados
        for (const [id, currRecord] of currMap) {
            const prevRecord = prevMap.get(id);
            if (prevRecord) {
                const prevHash = this.generateHash(JSON.stringify(prevRecord));
                const currHash = this.generateHash(JSON.stringify(currRecord));
                
                if (prevHash !== currHash) {
                    changes.push({
                        type: 'MODIFICADO',
                        id: id,
                        description: `Registro modificado: ${currRecord.pregunta.substring(0, 50)}...`
                    });
                }
            }
        }

        return changes;
    }

    async detectWebChanges(urls) {
        this.log('Detectando cambios en páginas web...', 'info');
        
        // Por ahora, simplemente retornamos sin cambios para que el endpoint funcione
        this.log('Verificación web temporalmente deshabilitada', 'warning');
        return [];
        
        /*
        // Importar fetch dinámicamente
        const fetch = (await import('node-fetch')).default;
        
        const changes = [];
        
        for (const url of urls) {
            try {
                const response = await fetch(url);
                const content = await response.text();
                const contentHash = this.generateHash(content);
                
                const urlKey = url.replace(/[^a-zA-Z0-9]/g, '_');
                const previousSnapshot = await this.loadSnapshot(`web_${urlKey}`);
                
                await this.saveSnapshot(`web_${urlKey}`, { url, hash: contentHash, length: content.length });
                
                if (previousSnapshot && previousSnapshot.data.hash !== contentHash) {
                    changes.push({
                        type: 'WEB_CHANGE',
                        url: url,
                        description: `Contenido web modificado en ${url}`
                    });
                    this.log(`🔄 Cambio detectado en: ${url}`, 'change');
                } else if (!previousSnapshot) {
                    this.log(`Primera verificación de: ${url}`, 'info');
                } else {
                    this.log(`Sin cambios en: ${url}`, 'success');
                }
                
            } catch (error) {
                this.log(`Error verificando ${url}: ${error.message}`, 'error');
            }
        }
        
        return changes;
        */
    }

    async runFullDetection() {
        this.log('=== INICIANDO DETECCIÓN COMPLETA DE CAMBIOS ===', 'info');
        
        const results = {
            database: await this.detectDatabaseChanges(),
            web: await this.detectWebChanges([
                'https://www.uts.edu.co/sitio/tecnologia-en-desarrollo-de-sistemas-informaticos/',
                'https://www.uts.edu.co/sitio/ingenieria-de-sistemas/',
                'https://www.uts.edu.co/sitio/proceso-modalidad-presencial/',
                'https://www.uts.edu.co/sitio/docentes/',
                'https://www.uts.edu.co/sitio/estudiantes/'
            ])
        };

        const hasAnyChanges = results.database.hasChanges || results.web.length > 0;
        
        this.log('=== RESUMEN DE DETECCIÓN ===', 'info');
        this.log(`Base de datos: ${results.database.changes?.length || 0} cambios`, 'info');
        this.log(`Páginas web: ${results.web.length} cambios`, 'info');
        this.log(`¿Requiere actualización?: ${hasAnyChanges ? 'SÍ' : 'NO'}`, hasAnyChanges ? 'change' : 'success');
        
        return {
            hasChanges: hasAnyChanges,
            database: results.database,
            web: results.web,
            recommendation: hasAnyChanges ? 'EJECUTAR_UPDATE' : 'NO_ACTION'
        };
    }

    async generateReport() {
        const detection = await this.runFullDetection();
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                hasChanges: detection.hasChanges,
                recommendation: detection.recommendation
            },
            details: {
                database: {
                    changesCount: detection.database.changes?.length || 0,
                    currentRecords: detection.database.current || 0,
                    changes: detection.database.changes || []
                },
                web: {
                    changesCount: detection.web.length,
                    changes: detection.web
                }
            }
        };

        await this.saveSnapshot('detection_report', report);
        return report;
    }
}

// Función principal para CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'detect';
    
    const detector = new ChangeDetector();
    
    switch (command) {
        case 'detect':
            const result = await detector.runFullDetection();
            if (result.hasChanges) {
                console.log('\n🔄 CAMBIOS DETECTADOS - Se recomienda ejecutar actualización');
                process.exit(1); // Exit code 1 indica cambios detectados
            } else {
                console.log('\n✅ NO HAY CAMBIOS - Sistema actualizado');
                process.exit(0);
            }
            break;
            
        case 'report':
            const report = await detector.generateReport();
            console.log('\n📊 REPORTE GUARDADO:', JSON.stringify(report.summary, null, 2));
            break;
            
        default:
            console.log('Comandos disponibles:');
            console.log('  detect  - Detectar cambios y devolver exit code');
            console.log('  report  - Generar reporte detallado');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { ChangeDetector };
