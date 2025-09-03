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

export default router;
