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
// Importar función para inicializar el esquema de base de datos
import { bootstrapSchema } from './db/index.js';

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
bootstrapSchema();

// Endpoint para verificar el estado de salud del servicio
app.get('/api/health', (_req, res) => {
  // Responder con información del estado del servicio
  res.json({ ok: true, name: 'Chatbot UTS v1.2.0', env: process.env.NODE_ENV });
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

// 👉 Conectar las rutas de admin bajo el prefijo '/api/admin' (métricas para defensa)
app.use('/api/admin', adminRouter);

// Obtener el puerto desde las variables de entorno o usar 3001 por defecto
const PORT = process.env.PORT || 3001;

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`🚀 Chatbot UTS v1.2.0 escuchando en http://localhost:${PORT}`);
});
