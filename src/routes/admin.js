import { Router } from 'express';
import { exec as shellExec } from 'child_process';
import { promisify } from 'util';
import { loadKB } from '../nlp/kbLoader.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();
const execAsync = promisify(shellExec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOTA: Todas las rutas en este router están protegidas por adminAuth en server.js
// Solo contiene operaciones de mantenimiento que requieren autenticación

// Scrapers específicos (nueva versión)
router.post('/run-scrapers', async (req, res) => {
  try {
    const { type = 'all' } = req.body;
    console.log(`[admin] Ejecutando scrapers: ${type}`);
    
    let command;
    if (type === 'all') {
      command = 'npm run scrapers';
    } else {
      command = `npm run scraper:${type}`;
    }
    
    const { stdout } = await execAsync(command, {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 300000 // 5 minutos
    });
    
    res.json({
      success: true,
      output: stdout
    });
  } catch (error) {
    console.error('[admin/run-scrapers] error:', error);
    res.status(500).json({
      success: false,
      error: `Error ejecutando scrapers: ${error.message}`
    });
  }
});

// Recargar base de conocimiento (protegido)
router.post('/reload-kb', async (_req, res) => {
  try {
    console.log('[admin] Recargando base de conocimiento...');
    const loaded = await loadKB();
    res.json({
      success: true,
      loaded: loaded,
      message: `Base de conocimiento recargada: ${loaded} entradas`
    });
  } catch (err) {
    console.error('[admin/reload-kb] error:', err);
    res.status(500).json({ 
      success: false, 
      error: `Error recargando KB: ${err.message}`
    });
  }
});

// Backup de base de datos (protegido) - Soporte para SQLite y PostgreSQL
router.get('/backup', async (_req, res) => {
  try {
    console.log('[admin] Creando backup de base de datos...');
    
    const isDatabaseUrl = !!process.env.DATABASE_URL;
    
    if (isDatabaseUrl) {
      // PostgreSQL backup
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const file = `/tmp/backup-uts-${ts}.sql`;
      const cmd = `pg_dump ${process.env.DATABASE_URL} > ${file}`;
      
      shellExec(cmd, (err) => {
        if (err) {
          console.error('[backup] pg_dump error:', err);
          return res.status(500).json({ success: false, error: 'pg_dump falló' });
        }
        res.download(file, `backup-uts-${ts}.sql`);
      });
    } else {
      // SQLite backup
      const dbPath = path.join(__dirname, '..', 'db', 'database.db');
      
      if (!fs.existsSync(dbPath)) {
        return res.status(404).json({
          success: false,
          error: 'Base de datos no encontrada'
        });
      }

      const dbBuffer = fs.readFileSync(dbPath);
      const ts = new Date().toISOString().split('T')[0];
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="backup-uts-${ts}.db"`);
      res.setHeader('Content-Length', dbBuffer.length);
      
      res.send(dbBuffer);
    }
  } catch (err) {
    console.error('[admin/backup] error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Backup error'
    });
  }
});

// ===== NUEVAS RUTAS DE AUTOMATIZACIÓN =====

// Detección de cambios
router.post('/detect-changes', async (_req, res) => {
  try {
    console.log('[admin] Detectando cambios...');
    
    const { stdout } = await execAsync('node scripts/change-detector.cjs detect', {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 30000
    });
    
    // El script retorna exit code 1 si hay cambios, 0 si no hay cambios
    res.json({
      success: true,
      data: {
        hasChanges: false, // No hay cambios según el output
        output: stdout
      }
    });
  } catch (error) {
    // Exit code 1 significa que hay cambios detectados
    if (error.code === 1) {
      res.json({
        success: true,
        data: {
          hasChanges: true,
          output: error.stdout || error.message
        }
      });
    } else {
      console.error('[admin/detect-changes] error:', error);
      res.status(500).json({
        success: false,
        error: `Error detectando cambios: ${error.message}`
      });
    }
  }
});

// Actualización automática
router.post('/auto-update', async (req, res) => {
  try {
    const { mode = 'full' } = req.body;
    console.log(`[admin] Ejecutando actualización automática: ${mode}`);
    
    const command = mode === 'quick' 
      ? 'node scripts/auto-update-system.cjs quick'
      : 'node scripts/auto-update-system.cjs full';
    
    const { stdout } = await execAsync(command, {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 300000 // 5 minutos
    });
    
    res.json({
      success: true,
      data: {
        mode: mode,
        output: stdout
      }
    });
  } catch (error) {
    console.error('[admin/auto-update] error:', error);
    res.status(500).json({
      success: false,
      error: `Error en actualización automática: ${error.message}`
    });
  }
});

// Mejora de palabras clave
router.post('/improve-keywords', async (_req, res) => {
  try {
    console.log('[admin] Mejorando palabras clave...');
    
    const { stdout } = await execAsync('npm run improve-keywords', {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 60000
    });
    
    res.json({
      success: true,
      data: {
        output: stdout
      }
    });
  } catch (error) {
    console.error('[admin/improve-keywords] error:', error);
    res.status(500).json({
      success: false,
      error: `Error mejorando keywords: ${error.message}`
    });
  }
});

// Generación de sinónimos
router.post('/generate-synonyms', async (_req, res) => {
  try {
    console.log('[admin] Generando sinónimos...');
    
    const { stdout } = await execAsync('npm run generate-synonyms', {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 60000
    });
    
    res.json({
      success: true,
      data: {
        output: stdout
      }
    });
  } catch (error) {
    console.error('[admin/generate-synonyms] error:', error);
    res.status(500).json({
      success: false,
      error: `Error generando sinónimos: ${error.message}`
    });
  }
});

// Sincronización de palabras clave de docentes
router.post('/sync-teachers', async (_req, res) => {
  try {
    console.log('[admin] Sincronizando palabras clave de docentes...');
    
    const { stdout } = await execAsync('node scripts/sync-teacher-keywords.cjs', {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 60000
    });
    
    // Parsear la salida para extraer estadísticas
    const lines = stdout.split('\n').filter(line => line.trim());
    const stats = {
      processed: 0,
      added: 0,
      updated: 0
    };
    
    lines.forEach(line => {
      if (line.includes('Docentes procesados:')) {
        stats.processed = parseInt(line.match(/\d+/)?.[0] || '0');
      }
      if (line.includes('nombres añadidos')) {
        stats.added = parseInt(line.match(/\d+/)?.[0] || '0');
      }
      if (line.includes('registros actualizados')) {
        stats.updated = parseInt(line.match(/\d+/)?.[0] || '0');
      }
    });
    
    res.json({
      success: true,
      stats,
      output: stdout
    });
  } catch (error) {
    console.error('[admin/sync-teachers] error:', error);
    res.status(500).json({
      success: false,
      error: `Error sincronizando docentes: ${error.message}`
    });
  }
});

// Verificar cambios en docentes
router.get('/check-teachers', async (_req, res) => {
  try {
    console.log('[admin] Verificando cambios en docentes...');
    
    const { stdout } = await execAsync('node -e "' +
      'const { syncTeacherKeywords } = require(\"./scripts/sync-teacher-keywords.cjs\"); ' +
      'syncTeacherKeywords(true).then(result => console.log(JSON.stringify(result)));' +
      '"', {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 30000
    });
    
    const result = JSON.parse(stdout.trim());
    
    res.json({
      success: true,
      data: {
        hasChanges: result.hasChanges,
        lastUpdate: result.lastUpdate || 'Nunca',
        teachersCount: result.teachersCount || 0
      }
    });
  } catch (error) {
    console.error('[admin/check-teachers] error:', error);
    res.status(500).json({
      success: false,
      error: `Error verificando docentes: ${error.message}`
    });
  }
});

// Obtener logs del sistema
router.get('/logs', async (_req, res) => {
  try {
    console.log('[admin] Obteniendo logs...');
    
    const logsDir = path.join(__dirname, '..', '..', 'logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.json({
        success: true,
        logs: []
      });
    }
    
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .sort()
      .slice(-3); // Últimos 3 archivos
    
    const logs = [];
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n')
        .filter(line => line.trim())
        .slice(-20); // Últimas 20 líneas por archivo
      
      lines.forEach(line => {
        // Parsear formato de log simple
        const match = line.match(/^\[(.*?)\] (.*?):(.*)/);
        if (match) {
          logs.push({
            timestamp: match[1],
            level: match[2].trim(),
            message: match[3].trim()
          });
        } else {
          logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line
          });
        }
      });
    }
    
    res.json({
      success: true,
      logs: logs.slice(-50) // Últimas 50 entradas
    });
  } catch (error) {
    console.error('[admin/logs] error:', error);
    res.status(500).json({
      success: false,
      error: `Error obteniendo logs: ${error.message}`
    });
  }
});

// Regenerar sugerencias analizando la base de datos SQLite
router.post('/suggestions/regenerate', async (req, res) => {
  try {
    console.log('[admin] Regenerando sugerencias desde contenido de BD...');
    
    const { queryAll } = await import('../db/index.js');
    const fs = await import('fs');
    const path = await import('path');
    
    // Obtener todo el contenido activo de la base de conocimiento
    const knowledge = await queryAll(`
      SELECT 
        id,
        pregunta,
        respuesta_texto,
        tipo_usuario,
        palabras_clave,
        nombre_recurso
      FROM knowledge_base 
      WHERE activo = 1
      ORDER BY tipo_usuario, id
    `);

    if (knowledge.length === 0) {
      return res.json({
        success: false,
        error: 'No se encontró contenido activo en la base de conocimiento'
      });
    }

    // Analizar el contenido y generar sugerencias
    const suggestions = {
      estudiante: [],
      docente: [],
      aspirante: [],
      todos: []
    };

    // Procesar cada entrada de conocimiento
    knowledge.forEach(entry => {
      let userType = entry.tipo_usuario;
      
      // Si es 'todos', agregar a todas las categorías incluyendo 'todos'
      const targetTypes = userType === 'todos' ? 
        ['estudiante', 'docente', 'aspirante', 'todos'] : 
        [userType];
      
      targetTypes.forEach(type => {
        if (!suggestions[type]) return;
        
        // Generar sugerencia basada en la pregunta o contenido
        let suggestionText = entry.pregunta;
        
        // Si la pregunta es muy técnica, generar una más natural
        if (suggestionText.includes('Información sobre')) {
          const topic = suggestionText.replace('Información sobre ', '').replace(' para ' + entry.tipo_usuario + ' UTS', '');
          suggestionText = `¿Información sobre ${topic}?`;
        }
        
        // Limpiar texto
        suggestionText = suggestionText.replace(/UTS\.\.\./g, 'UTS').replace(/\.\.\./g, '').trim();
        if (!suggestionText.endsWith('?')) {
          suggestionText += '?';
        }
        
        // Determinar categoría basada en palabras clave
        const keywords = (entry.palabras_clave || '').toLowerCase();
        let category = 'general';
        
        if (keywords.includes('calendario') || keywords.includes('horario') || keywords.includes('materia')) {
          category = 'academico';
        } else if (keywords.includes('admision') || keywords.includes('inscripcion') || keywords.includes('requisitos')) {
          category = 'admisiones';
        } else if (keywords.includes('docente') || keywords.includes('profesor') || keywords.includes('coordinacion')) {
          category = 'contacto';
        } else if (keywords.includes('tramite') || keywords.includes('documento')) {
          category = 'tramites';
        } else if (keywords.includes('plataforma') || keywords.includes('servicio')) {
          category = 'servicios';
        }
        
        // Crear sugerencia
        const suggestion = {
          text: suggestionText,
          type: 'knowledge',
          category: category,
          source_id: entry.id
        };

        // Evitar duplicados y limitar a 15 por tipo
        const exists = suggestions[type].some(s => 
          s.text.toLowerCase().trim() === suggestion.text.toLowerCase().trim()
        );

        if (!exists && suggestions[type].length < 15) {
          suggestions[type].push(suggestion);
        }
      });
    });

    // Generar contenido del archivo
    const fileContent = `// Sugerencias estáticas generadas desde la base de conocimiento SQLite
// Generado el: ${new Date().toISOString()}
// Basado en ${knowledge.length} entradas activas de knowledge_base

export const STATIC_SUGGESTIONS = ${JSON.stringify(suggestions, null, 2)};

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
`;

    // Escribir archivo
    const filePath = path.join(process.cwd(), 'src', 'nlp', 'staticSuggestions.js');
    fs.writeFileSync(filePath, fileContent);

    // Estadísticas
    const stats = {
      totalKnowledgeEntries: knowledge.length,
      totalSuggestions: Object.values(suggestions).reduce((acc, arr) => acc + arr.length, 0),
      byCategory: Object.fromEntries(
        Object.entries(suggestions).map(([key, arr]) => [key, arr.length])
      ),
      knowledgeByType: knowledge.reduce((acc, entry) => {
        acc[entry.tipo_usuario] = (acc[entry.tipo_usuario] || 0) + 1;
        return acc;
      }, {})
    };

    console.log('[admin] Sugerencias regeneradas desde knowledge_base:', stats);

    res.json({
      success: true,
      message: 'Sugerencias regeneradas exitosamente desde la base de conocimiento',
      stats,
      filePath: 'src/nlp/staticSuggestions.js'
    });

  } catch (error) {
    console.error('[admin/suggestions/regenerate] error:', error);
    res.status(500).json({
      success: false,
      error: `Error regenerando sugerencias: ${error.message}`
    });
  }
});

// Control de automatización
router.post('/automation/toggle', async (req, res) => {
  try {
    const { enable, mode = 'smart' } = req.body;
    const fs = await import('fs');
    const path = await import('path');
    
    console.log(`[admin] ${enable ? 'Activando' : 'Desactivando'} automatización...`);
    
    // Leer configuración actual
    const configPath = path.resolve('./config/automation.json');
    let config;
    
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      // Si no existe, crear configuración por defecto
      config = {
        automation: {
          enabled: false,
          mode: 'smart',
          schedules: {
            change_detection: "*/6 * * * *",
            full_update: "0 2 * * *", 
            smart_update: "0 */2 * * *"
          },
          monitoring: {
            urls: [
              "https://www.uts.edu.co/sitio/programas-academicos/tecnologia-en-desarrollo-de-sistemas-informaticos/",
              "https://www.uts.edu.co/sitio/programas-academicos/ingenieria-de-sistemas/",
              "https://www.uts.edu.co/sitio/aspirantes/",
              "https://www.uts.edu.co/sitio/docentes/",
              "https://www.uts.edu.co/sitio/estudiantes/"
            ],
            timeout: 30000,
            retries: 3
          },
          updates: {
            auto_keywords: true,
            auto_synonyms: true,
            auto_reload: true,
            skip_on_error: false
          },
          notifications: {
            enabled: false,
            email: "",
            webhook: ""
          }
        },
        logging: {
          level: "info",
          max_file_size: "10MB",
          max_files: 5,
          include_timestamps: true
        },
        performance: {
          max_parallel_scrapers: 3,
          scraper_timeout: 60000,
          database_timeout: 10000
        }
      };
    }
    
    // Actualizar estado
    const previousState = config.automation.enabled;
    config.automation.enabled = enable;
    config.automation.mode = mode;
    config.automation.last_modified = new Date().toISOString();
    
    // Configuración simplificada para secretaria
    if (enable) {
      // Automatización inteligente: solo lo esencial
      config.automation.tasks = {
        "monitor_website": {
          "enabled": true,
          "description": "Revisar sitio UTS cada 6 horas",
          "schedule": "0 */6 * * *",
          "priority": "high"
        },
        "update_content": {
          "enabled": true, 
          "description": "Actualizar contenido cuando hay cambios",
          "trigger": "on_changes_detected",
          "priority": "high"
        },
        "sync_teachers": {
          "enabled": true,
          "description": "Sincronizar docentes diariamente",
          "schedule": "0 2 * * *",
          "priority": "medium"
        },
        "improve_keywords": {
          "enabled": true,
          "description": "Mejorar palabras clave semanalmente", 
          "schedule": "0 3 * * 1",
          "priority": "low"
        }
      };
      config.automation.user_friendly = {
        "status": "La automatización está ACTIVA",
        "what_it_does": "El sistema se mantiene actualizado automáticamente",
        "next_check": "Próxima revisión en 6 horas máximo",
        "safe_to_leave": "Sí, puede dejar el sistema funcionando solo"
      };
    } else {
      config.automation.tasks = {};
      config.automation.user_friendly = {
        "status": "La automatización está DESACTIVADA", 
        "what_it_does": "Debe actualizar manualmente cuando sea necesario",
        "manual_steps": "Use los botones del panel para actualizar",
        "recommendation": "Active la automatización para mayor comodidad"
      };
    }
    
    // Guardar configuración
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    const status = enable ? 'activada' : 'desactivada';
    const action = enable ? 'ACTIVACIÓN' : 'DESACTIVACIÓN';
    
    console.log(`[admin] Automatización ${status} exitosamente`);
    
    // Respuesta con información amigable para secretaria
    const response = {
      success: true,
      message: enable ? 
        "✅ Automatización ACTIVADA - El sistema se actualizará solo" :
        "⏸️ Automatización DESACTIVADA - Debe actualizar manualmente",
      previous_state: previousState,
      current_state: enable,
      mode: mode,
      timestamp: new Date().toISOString(),
      
      // Información amigable para la secretaria
      user_friendly: config.automation.user_friendly,
      
      // Detalles técnicos (colapsables en la interfaz)
      technical_details: {
        action: enable ? 'ACTIVACIÓN' : 'DESACTIVACIÓN',
        config_file: 'config/automation.json',
        tasks: enable ? Object.keys(config.automation.tasks || {}).length : 0
      }
    };
    
    // Si se activó, incluir tareas programadas de forma simple
    if (enable && config.automation.tasks) {
      response.active_tasks = Object.entries(config.automation.tasks).map(([key, task]) => ({
        name: task.description,
        frequency: task.schedule || task.trigger || 'Cuando sea necesario',
        priority: task.priority
      }));
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('[admin/automation/toggle] error:', error);
    res.status(500).json({
      success: false,
      error: `Error controlando automatización: ${error.message}`
    });
  }
});

// Obtener estado actual de automatización
router.get('/automation/status', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const configPath = path.resolve('./config/automation.json');
    
    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      // Si no existe el archivo, retornar estado por defecto
      return res.json({
        success: true,
        automation: {
          enabled: false,
          mode: 'smart',
          status: 'DESACTIVADA',
          message: 'Archivo de configuración no encontrado - estado por defecto'
        }
      });
    }
    
    const automation = config.automation;
    const status = automation.enabled ? 'ACTIVADA' : 'DESACTIVADA';
    
    res.json({
      success: true,
      automation: {
        enabled: automation.enabled,
        mode: automation.mode,
        status: status,
        last_modified: automation.last_modified || 'No disponible',
        schedules: automation.schedules,
        monitoring: {
          urls_count: automation.monitoring?.urls?.length || 0,
          timeout: automation.monitoring?.timeout || 30000
        },
        updates: automation.updates
      },
      config_file: 'config/automation.json'
    });
    
  } catch (error) {
    console.error('[admin/automation/status] error:', error);
    res.status(500).json({
      success: false,
      error: `Error obteniendo estado de automatización: ${error.message}`
    });
  }
});

// Obtener entradas de base de conocimiento
router.get('/knowledge', async (req, res) => {
  try {
    const { queryAll } = await import('../db/database.js');
    const { q = '', page = 1, size = 100 } = req.query;
    
    let query = 'SELECT * FROM knowledge_base';
    let params = [];
    
    // Si hay búsqueda, agregar filtro
    if (q.trim()) {
      query += ' WHERE pregunta LIKE ? OR respuesta LIKE ? OR keywords LIKE ?';
      const searchTerm = `%${q.trim()}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }
    
    query += ' ORDER BY id DESC';
    
    // Agregar paginación
    const offset = (parseInt(page) - 1) * parseInt(size);
    query += ` LIMIT ${parseInt(size)} OFFSET ${offset}`;
    
    const knowledgeData = await queryAll(query, params);
    
    res.json({
      success: true,
      data: knowledgeData,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: knowledgeData.length
      }
    });
  } catch (error) {
    console.error('[admin/knowledge] error:', error);
    res.status(500).json({
      success: false,
      error: `Error obteniendo base de conocimiento: ${error.message}`
    });
  }
});

export default router;
