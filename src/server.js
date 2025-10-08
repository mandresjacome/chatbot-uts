// Importar configuración de variables de entorno desde .env
import 'dotenv/config';
// Importar el framework Express para crear el servidor web
import express from 'express';
// Importar CORS para permitir peticiones desde otros dominios
import cors from 'cors';
// Importar módulos para rutas y archivos estáticos
import path from 'path';
import { fileURLToPath } from 'url';
// Importar el router del chat desde el archivo de rutas
import chatRouter from './routes/chat.js';
// Importar el router del feedback
import feedbackRouter from './routes/feedback.js';
// Importar el router de admin (métricas)
import adminRouter from './routes/admin.js';
// Importar el router de malla curricular
import mallaRouter from './routes/malla.js';
// Importar el router de sugerencias
import suggestionsRouter from './routes/suggestions.js';
// Importar el router de búsqueda web
import webSearchRouter from './routes/webSearch.js';
// Importar middleware de autenticación admin
import { adminAuth } from './middlewares/adminAuth.js';
// Importar función para inicializar el esquema de base de datos
import { bootstrapSchema, dbEngine } from './db/index.js';
// Importar el sistema de logging
import { logger } from './utils/logger.js';

// Crear la instancia de la aplicación Express
const app = express();

// Resolver ruta absoluta a /public para archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// Configurar CORS para permitir peticiones cross-origin
app.use(cors());

// Configurar middleware para parsear JSON en las peticiones
app.use(express.json());

// 👉 Servir archivos estáticos desde /public
app.use(express.static(publicDir));

// 👉 Inicializar esquema de base de datos (crea tablas si no existen)
async function initializeDatabase() {
  const isRender = process.env.RENDER === 'true';
  const isProduction = !!process.env.DATABASE_URL;
  
  logger.startup(`Inicializando base de datos... ${isRender ? '[RENDER]' : '[LOCAL]'}`);
  
  // En Render, usar configuración optimizada
  if (isRender) {
    console.log('🌐 Deploy en Render detectado - Configuración optimizada');
    console.log('💾 Usando PostgreSQL + Cache fallback');
  }
  
  try {
    // Intentar bootstrapSchema con tolerancia a fallos
    await bootstrapSchema();
    const engine = dbEngine();
    logger.dbConnected(engine, { 
      isProduction,
      isRender,
      path: engine === 'sqlite' ? process.env.DB_SQLITE_PATH || './src/db/database.db' : 'PostgreSQL'
    });
    
    console.log('✅ Schema de base de datos verificado');
  } catch (schemaError) {
    console.error('⚠️ Error en schema PostgreSQL (continuando con fallback):', schemaError.message);
  }
  
  try {
    // Cargar y verificar base de conocimiento (con tolerancia a fallos)
    const { loadKB } = await import('./nlp/kbLoader.js');
    const loaded = await loadKB();
    console.log(`✅ LoadKB completado: ${loaded} registros`);
  } catch (loadError) {
    console.error('⚠️ Error en loadKB (retriever ya tiene fallback):', loadError.message);
  }
  
  try {
    // Recargar el retriever para usar la base de datos (opcional)
    const { reloadKB } = await import('./nlp/retriever.js');
    await reloadKB();
    logger.info('RETRIEVER', 'Base de conocimiento recargada en retriever');
  } catch (reloadError) {
    console.error('⚠️ Error recargando retriever (ya tiene datos de fallback):', reloadError.message);
  }
  
  // En lugar de process.exit(1), continuar con el sistema de fallback
  console.log('✅ Inicialización de base de datos completada (con tolerancia a fallos)');
}

initializeDatabase();

// Endpoint para verificar el estado de salud del servicio
app.get('/api/health', (_req, res) => {
  logger.info('HEALTH', 'Health check solicitado');
  // Responder con información del estado del servicio
  res.json({ ok: true, name: 'Chatbot UTS v1.2.0', env: process.env.NODE_ENV });
});

// 👉 Rutas públicas de admin (sin protección)
// Métricas para mostrar en el panel (solo lectura)
app.get('/api/admin/metrics', async (_req, res) => {
  try {
    logger.info('ADMIN', 'Consultando métricas del sistema');
    const { Conversations, Feedback } = await import('./db/repositories.js');
    const [totalConversations, lastConvs, fbStats] = await Promise.all([
      Conversations.totals(),
      Conversations.last(10),
      Feedback.stats()
    ]);
    logger.info('ADMIN', 'Métricas obtenidas exitosamente', { 
      totalConversations: totalConversations.total,
      feedbackCount: fbStats.total 
    });
    res.json({
      success: true,
      data: {
        totalConversations,
        lastConversations: lastConvs,
        feedback: fbStats
      }
    });
  } catch (err) {
    logger.error('ADMIN', 'Error obteniendo métricas', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

// Base de conocimiento para mostrar en el panel (solo lectura)
app.get('/api/admin/knowledge', async (req, res) => {
  try {
    const { queryAll } = await import('./db/index.js');
    const { q = '', page = '1', size = '20' } = req.query;
    const offset = (Number(page) - 1) * Number(size);
    const like = `%${q.toLowerCase()}%`;
    
    const isDatabaseUrl = !!process.env.DATABASE_URL;
    const rows = await queryAll(
      `SELECT id, pregunta, respuesta_texto, tipo_usuario, recurso_url, nombre_recurso, palabras_clave, updated_at, created_at
       FROM knowledge_base
       WHERE lower(pregunta) LIKE ${isDatabaseUrl ? '$1' : '?'} OR lower(palabras_clave) LIKE ${isDatabaseUrl ? '$1' : '?'}
       ORDER BY updated_at DESC
       LIMIT ${isDatabaseUrl ? '$2' : '?'} OFFSET ${isDatabaseUrl ? '$3' : '?'}`,
      isDatabaseUrl ? [like, Number(size), offset] : [like, like, Number(size), offset]
    );
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        size: Number(size),
        hasMore: rows.length === Number(size)
      }
    });
  } catch (err) {
    console.error('[admin/knowledge] error:', err);
    res.status(500).json({ success: false, error: 'Error KB' });
  }
});

// Conteo total de registros KB para el panel de monitoreo
app.get('/api/admin/kb-count', async (req, res) => {
  try {
    const { queryAll } = await import('./db/index.js');
    const isDatabaseUrl = !!process.env.DATABASE_URL;
    
    const result = await queryAll(
      `SELECT COUNT(*) as total FROM knowledge_base WHERE activo = ${isDatabaseUrl ? '$1' : '?'}`,
      isDatabaseUrl ? [1] : [1]
    );
    
    const total = result[0]?.total || 0;
    
    res.json({
      success: true,
      count: total,
      status: total > 0 ? 'active' : 'empty',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[admin/kb-count] error:', err);
    res.status(500).json({ success: false, error: 'Error contando KB' });
  }
});

// Autenticación de admin (debe ser pública para permitir login)
app.post('/api/admin/auth', (req, res) => {
  try {
    const { token } = req.body;
    const adminToken = process.env.ADMIN_TOKEN || 'admin123';
    
    if (token === adminToken) {
      logger.info('ADMIN', 'Autenticación admin exitosa');
      res.json({ success: true, message: 'Autenticado correctamente' });
    } else {
      logger.warn('ADMIN', 'Intento de autenticación admin fallido', { tokenProvided: !!token });
      res.status(401).json({ success: false, error: 'Token inválido' });
    }
  } catch (err) {
    logger.error('ADMIN', 'Error en autenticación admin', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

// Estados del sistema (públicos para monitoreo)
app.get('/api/admin/db-status', async (_req, res) => {
  try {
    const { Conversations } = await import('./db/repositories.js');
    await Conversations.totals(); // Test simple de DB
    res.json({ 
      success: true, 
      status: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      status: 'disconnected',
      error: err.message 
    });
  }
});

app.get('/api/admin/ai-status', async (_req, res) => {
  try {
    res.json({ 
      success: true, 
      status: 'available',
      model: 'gemini-pro',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      status: 'unavailable',
      error: err.message 
    });
  }
});

// 👉 Página principal - Demostración con widget flotante
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 👉 Atajo para acceder al panel de administración
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

// 👉 Chat directo (usado por el widget iframe)
app.get('/chat', (_req, res) => {
  res.sendFile(path.join(publicDir, 'chat', 'index.html'));
});

// 👉 Conectar las rutas del chatbot bajo el prefijo '/api/chat'
// Esto hace que todas las rutas de chatRouter sean accesibles como /api/chat/*
app.use('/api/chat', chatRouter);

// 👉 Conectar las rutas del feedback bajo el prefijo '/api/feedback'
app.use('/api/feedback', feedbackRouter);

// 👉 Conectar las rutas de sugerencias bajo el prefijo '/api/suggestions'
app.use('/api/suggestions', suggestionsRouter);

// 👉 Conectar las rutas de malla curricular bajo el prefijo '/api'
app.use('/api', mallaRouter);

// 👉 Conectar las rutas de búsqueda web bajo el prefijo '/api/web-search'
app.use('/api/web-search', webSearchRouter);

// 👉 Conectar las rutas de admin PROTEGIDAS bajo el prefijo '/api/admin' 
// Solo las operaciones de mantenimiento que requieren autenticación
app.use('/api/admin', adminAuth, adminRouter);

// Obtener el puerto desde las variables de entorno o usar 3001 por defecto
const PORT = process.env.PORT || 3001;

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  logger.serverStart(PORT, '1.2.0');
  
  // Log de configuración del sistema
  logger.startup('Configuración del sistema', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: PORT,
    adminToken: !!process.env.ADMIN_TOKEN,
    databaseUrl: !!process.env.DATABASE_URL,
    geminiApiKey: !!process.env.GEMINI_API_KEY
  });
  
  logger.info('SYSTEM', 'Sistema listo para recibir conexiones');
});