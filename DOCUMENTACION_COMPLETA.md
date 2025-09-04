# 📋 Documentación Completa del Proyecto Chatbot UTS

## 🎯 Información General del Proyecto

**Nombre**: Chatbot UTS v1.2.0  
**Propósito**: Chatbot inteligente para las Unidades Tecnológicas de Santander (UTS)  
**Desarrollador**: Mario Andrés Jácome Mantilla  
**Tecnologías**: Node.js, Express, SQLite, Google Gemini AI, JavaScript Vanilla  

### 🚀 Características Principales
- **Chat inteligente** con procesamiento de lenguaje natural
- **Base de conocimientos** específica de la UTS obtenida mediante web scraping
- **Búsqueda difusa** con Fuse.js para mejores resultados de recuperación
- **Integración con Gemini AI** para respuestas contextuales y naturales
- **Persistencia de datos** con SQLite (con soporte para PostgreSQL)
- **Panel de administración** completo con métricas en tiempo real
- **Sistema de feedback** para mejorar la calidad del servicio
- **API REST** completa y documentada
- **Sistema de automatización** para actualización continua de contenido
- **Múltiples interfaces** (widget, chat directo, panel admin)

---

## 📁 Estructura Detallada del Proyecto

### 🗂️ Directorio Raíz
```
chatbot-uts/
├── package.json              # Configuración del proyecto Node.js
├── jest.config.json          # Configuración de pruebas con Jest
├── README.md                 # Documentación principal del proyecto
├── backup-test.db            # Backup de prueba de la base de datos
├── DOCUMENTACION_COMPLETA.md # Este archivo de documentación
```

### 📂 `/src` - Código Fuente Principal

#### 🌐 **`server.js`** - Servidor Principal
- **Función**: Punto de entrada de la aplicación
- **Características**:
  - Configuración de Express.js con middlewares
  - Inicialización de base de datos automática
  - Configuración de CORS para peticiones cross-origin
  - Endpoints de salud y métricas públicas
  - Rutas estáticas para archivos públicos
  - Sistema de logging integrado
  - Autenticación admin para mantenimiento

#### 🛣️ **`/routes`** - Rutas de la API

##### **`chat.js`** - Endpoint Principal del Chatbot
- **Función**: Maneja las conversaciones del chatbot
- **Endpoint**: `POST /api/chat/message`
- **Proceso**:
  1. Validación de entrada (mensaje, tipo de usuario, sessionId)
  2. Búsqueda de evidencia en base de conocimiento con retriever
  3. Generación de respuesta con IA (Gemini)
  4. Persistencia de conversación en base de datos
  5. Retorno de respuesta con referencias y metadatos
- **Métricas**: Tiempo de respuesta, evidencia encontrada, modelo usado

##### **`feedback.js`** - Sistema de Retroalimentación
- **Función**: Recopilar y almacenar feedback de usuarios
- **Endpoint**: `POST /api/feedback`
- **Datos**: rating (1-5), comentarios, sessionId, conversationId

##### **`admin.js`** - Rutas de Administración
- **Función**: Operaciones de mantenimiento protegidas
- **Autenticación**: Middleware adminAuth con token
- **Operaciones**: Gestión de base de conocimiento, mantenimiento del sistema

#### 🧠 **`/ai`** - Integración con Inteligencia Artificial

##### **`geminiClient.js`** - Cliente de Google Gemini
- **Función**: Interfaz con la API de Google Gemini
- **Características**:
  - Soporte para múltiples modelos (gemini-2.5-flash por defecto)
  - Sistema de prompts optimizado "evidencia primero"
  - Fallback a modo mock sin API key
  - Control de longitud de respuesta y evidencia
  - Manejo de errores y reintentos

#### 🗄️ **`/db`** - Capa de Base de Datos

##### **`index.js`** - Abstracción de Base de Datos
- **Función**: Capa de abstracción para SQLite/PostgreSQL
- **Características**:
  - Conexión automática según variables de entorno
  - Bootstrap automático del esquema
  - Funciones de consulta unificadas
  - Manejo de transacciones

##### **`repositories.js`** - Repositorios de Datos
- **Función**: Operaciones CRUD especializadas
- **Repositorios**:
  - `Conversations`: Gestión de conversaciones del chat
  - `Feedback`: Almacenamiento de valoraciones
  - `KnowledgeBase`: Base de conocimiento UTS

##### **`database.js`** - Adaptador de Compatibilidad
- **Función**: Compatibilidad con scrapers CJS existentes
- **Características**: Traduce placeholders entre SQLite y PostgreSQL

#### 🔍 **`/nlp`** - Procesamiento de Lenguaje Natural

##### **`retriever.js`** - Sistema de Recuperación
- **Función**: Búsqueda inteligente en base de conocimiento
- **Tecnologías**:
  - **Fuse.js**: Búsqueda difusa tolerante a errores
  - **compromise**: Análisis de entidades y fechas
  - **Sinónimos**: Expansión automática de consultas
- **Configuración**: Pesos ajustados (palabras clave 50%, pregunta 30%, contenido 20%)
- **Filtros**: Por tipo de usuario (aspirante, estudiante, docente, todos)

##### **`synonyms.js`** - Sinónimos Generados
- **Función**: Sinónimos específicos para mejorar búsquedas
- **Generación**: Automática basada en análisis de contenido UTS
- **Categorías**: 21+ grupos de sinónimos específicos por dominio
- **Actualización**: Regeneración automática con cambios de contenido

##### **`kbLoader.js`** - Cargador de Base de Conocimiento
- **Función**: Carga y sincronización de KB desde base de datos
- **Características**: Procesamiento de texto para búsqueda optimizada

#### 🛠️ **`/utils`** - Utilidades del Sistema

##### **`logger.js`** - Sistema de Logging
- **Función**: Logging estructurado del sistema
- **Características**:
  - Logs categorizados (CHAT, AI, DB, SYSTEM, etc.)
  - Timestamps automáticos
  - Diferentes niveles de log
  - Formato legible y parseable

##### **`normalize.js`** - Normalización de Texto
- **Función**: Limpieza y normalización de consultas
- **Características**: Eliminación de acentos, espacios, caracteres especiales

##### **`id.js`** - Generación de Identificadores
- **Función**: Generación de sessionIds únicos para conversaciones

##### **`database-adapter.cjs`** - Adaptador CJS
- **Función**: Compatibilidad con scrapers CommonJS existentes

#### 🔐 **`/middlewares`** - Middlewares de Express

##### **`adminAuth.js`** - Autenticación de Administrador
- **Función**: Protección de rutas de mantenimiento
- **Método**: Token-based authentication
- **Variable**: `ADMIN_TOKEN` environment variable

#### 📊 **`/data`** - Datos del Sistema

##### **`knowledge.json`** - Base de Conocimiento Legacy
- **Función**: Base de conocimiento inicial (migrada a SQLite)
- **Estado**: Mantenida para compatibilidad

### 📂 `/public` - Archivos Públicos e Interfaces

#### 🎨 **Página Principal** (`index.html`)
- **Función**: Demostración del widget flotante
- **Características**: Widget embebido, múltiples temas, responsive

#### 💬 **`/chat`** - Interfaz de Chat Directo
- **Archivos**:
  - `index.html`: Página principal del chat
  - `chat.css`: Estilos del chat
  - `chat.js`: Lógica del chat
  - `widget.js`: Widget embebible
  - `modal-user.js/.css`: Modal para selección de perfil
- **Temas**: 4 temas visuales (aspirante, estudiante, docente, visitante)

#### 🔧 **`/admin`** - Panel de Administración
- **Función**: Interface web completa para administradores
- **Secciones**:
  1. **Métricas**: Conversaciones totales, satisfacción, últimas interacciones
  2. **Feedback**: Análisis de valoraciones de usuarios
  3. **Base de Conocimiento**: Exploración y verificación de fuentes
  4. **Mantenimiento**: Operaciones del sistema (protegidas)

##### **Archivos del Admin Panel**:
- `index.html`: Página principal con navegación por tabs
- **CSS Modular**:
  - `css/base.css`: Estilos base y tema
  - `css/metrics.css`: Estilos para métricas
  - `css/feedback.css`: Estilos para feedback
  - `css/knowledge.css`: Estilos para base de conocimiento
  - `css/maintenance.css`: Estilos para mantenimiento
- **JavaScript Modular**:
  - `js/metrics.js`: Lógica de métricas
  - `js/feedback.js`: Lógica de feedback
  - `js/knowledge.js`: Lógica de base de conocimiento
  - `js/maintenance.js`: Lógica de mantenimiento

#### 🖼️ **Recursos Visuales**
- **GIFs Animados**: 5 avatares del chatbot por tipo de usuario
- **logoUTS.webp**: Logo oficial de la UTS
- **Temas CSS**: Colores específicos por perfil de usuario

### 📂 `/scripts` - Scripts de Automatización

#### 🤖 **`auto-update-system.cjs`** - Sistema Principal de Automatización
- **Función**: Orquestador principal del sistema de actualización
- **Operaciones**:
  - `fullUpdate()`: Actualización completa (scrapers + keywords + sinónimos)
  - `quickUpdate()`: Actualización rápida (solo optimización)
  - `checkContent()`: Verificación de nuevo contenido
- **Reportes**: Métricas detalladas de cada operación

#### 🔍 **`change-detector.cjs`** - Detector de Cambios
- **Función**: Monitoreo automático de cambios en páginas UTS
- **Características**:
  - Cache de snapshots anteriores
  - Detección granular de modificaciones
  - Triggers automáticos de actualización
  - Sistema de umbral para evitar false positives

#### 🎯 **`improve-keywords.cjs`** - Optimizador de Palabras Clave
- **Función**: Mejora automática de keywords para búsqueda
- **Algoritmo**: Análisis de frecuencia y relevancia
- **Actualización**: Modificación directa en base de datos

#### 📝 **`generate-synonyms.cjs`** - Generador de Sinónimos
- **Función**: Creación automática de sinónimos específicos UTS
- **Método**: Análisis del corpus de conocimiento
- **Salida**: Archivo `synonyms.js` actualizado

#### 🕷️ **`run-scrapers.cjs`** - Ejecutor de Scrapers
- **Función**: Coordinación de todos los scrapers web
- **Scrapers incluidos**: aspirantes, docentes, estudiantes, tecnología, fixed

#### ⚙️ **Scripts de Configuración Automática**
- **`setup-automation-windows.bat`**: Configuración de Task Scheduler (Windows)
- **`setup-automation-unix.sh`**: Configuración de Cron Jobs (Linux/Mac)

### 📂 `/scrapers` - Extractores de Contenido Web

#### 🎯 **Scrapers Especializados**:
- **`scraper_aspirantes.cjs`**: Información para futuros estudiantes
- **`scraper_docentes.cjs`**: Recursos y procedimientos para docentes
- **`scraper_estudiantes.cjs`**: Servicios y trámites estudiantiles
- **`scraper_tecnologia.cjs`**: Programas tecnológicos específicos
- **`scraper_fixed.cjs`**: Información general y estática

#### 🔧 **Características de los Scrapers**:
- **Robustez**: Manejo de errores de red y parsing
- **Selectores inteligentes**: Adaptación a cambios menores en HTML
- **Categorización automática**: Asignación de tipo de usuario
- **Procesamiento de texto**: Limpieza y estructuración de contenido
- **Cache de resultados**: Evita re-procesamiento innecesario

### 📂 `/tests` - Suite de Pruebas

#### 🧪 **`chat.test.js`** - Pruebas de la API de Chat
- **Framework**: Jest + Supertest
- **Cobertura**:
  - Validación de entrada (mensajes vacíos)
  - Modo mock vs. modo real
  - Manejo de evidencia
  - Respuestas de fallback
- **Configuración**: `jest.config.json` con soporte ES modules

### 📂 `/cache` - Cache del Sistema

#### 💾 **Archivos de Cache**:
- **`database.json`**: Estado anterior de la base de datos
- **`web_*.json`**: Snapshots de páginas web monitoreadas
- **`detection_report.json`**: Último reporte de detección de cambios

### 📂 `/logs` - Sistema de Logging

#### 📋 **Archivos de Log**:
- **`chatbot-YYYY-MM-DD.log`**: Logs diarios del chatbot
- **`automation.log`**: Logs específicos de automatización (Unix)

### 📂 `/config` - Configuración del Sistema

#### ⚙️ **`automation.json`** - Configuración de Automatización
- **Secciones**:
  - `automation`: Habilitación y modo del sistema
  - `schedules`: Frecuencias de ejecución (cron format)
  - `monitoring`: URLs monitoreadas y timeouts
  - `updates`: Configuración de actualizaciones automáticas
  - `performance`: Límites de recursos del sistema
  - `logging`: Configuración avanzada de logs

---

## 🔧 Configuración y Funcionamiento

### 🌍 Variables de Entorno

```bash
# Obligatorias
GEMINI_API_KEY=tu_api_key_de_google_gemini  # Clave API de Google Gemini

# Opcionales con valores por defecto
PORT=3001                    # Puerto del servidor
NODE_ENV=development         # Entorno de ejecución
USE_LLM=gemini              # Modo de IA (gemini/mock)
GEMINI_MODEL=gemini-2.5-flash # Modelo específico de Gemini
ADMIN_TOKEN=admin123        # Token para operaciones de admin

# Base de datos (automática)
DATABASE_URL=               # PostgreSQL URL (si no se define, usa SQLite)
DB_SQLITE_PATH=./src/db/database.db  # Ruta de SQLite por defecto

# Límites del sistema
MAX_CHARS_EVIDENCE=2500     # Máximo caracteres de evidencia para IA
MAX_CHARS_RESPONSE=1200     # Máximo caracteres de respuesta
```

### 🚀 Scripts de Package.json

```bash
# Desarrollo
npm run dev                 # Servidor con nodemon (hot-reload)
npm start                   # Servidor de producción

# Testing
npm test                    # Ejecutar pruebas con Jest

# Scrapers individuales
npm run scraper:aspirantes  # Scraper de aspirantes
npm run scraper:docentes    # Scraper de docentes
npm run scraper:estudiantes # Scraper de estudiantes
npm run scraper:tecnologia  # Scraper de tecnología
npm run scraper:fixed       # Scraper de información general
npm run scrapers            # Todos los scrapers

# Optimización del sistema
npm run improve-keywords    # Mejorar palabras clave
npm run generate-synonyms   # Generar sinónimos automáticos

# Automatización
npm run auto-update         # Actualización completa del sistema
npm run auto-update-quick   # Actualización rápida (sin scrapers)
npm run detect-changes      # Detectar cambios en páginas web
npm run auto-check-update   # Actualizar solo si hay cambios

# Configuración
npm run setup-automation    # Información para configurar tareas automáticas
```

---

## 🔄 Flujo de Funcionamiento

### 💬 **Proceso de Chat**
1. **Usuario envía mensaje** → `POST /api/chat/message`
2. **Validación de entrada** → sessionId, userType, message
3. **Búsqueda de evidencia** → Fuse.js en base de conocimiento
4. **Expansión con sinónimos** → Mejora la búsqueda
5. **Filtro por tipo de usuario** → aspirante/estudiante/docente/todos
6. **Generación de respuesta IA** → Gemini con contexto y evidencia
7. **Persistencia en BD** → Conversación guardada para métricas
8. **Respuesta al usuario** → JSON con respuesta, referencias y metadatos

### 🕷️ **Proceso de Scraping**
1. **Ejecución programada/manual** → Scripts de scraping
2. **Descarga de páginas web** → URLs específicas de UTS
3. **Extracción de contenido** → Cheerio + selectores CSS
4. **Procesamiento de texto** → Limpieza y estructuración
5. **Categorización automática** → Asignación de tipo de usuario
6. **Almacenamiento en BD** → Insert/Update en knowledge_base
7. **Generación de keywords** → Análisis automático de relevancia
8. **Actualización de sinónimos** → Regeneración basada en nuevo contenido

### 🤖 **Proceso de Automatización**
1. **Detección de cambios** → Comparación con cache anterior
2. **Trigger condicional** → Solo actualiza si hay cambios
3. **Ejecución de scrapers** → Obtención de nuevo contenido
4. **Optimización automática** → Keywords y sinónimos
5. **Validación de BD** → Verificación de integridad
6. **Recarga del sistema** → Retriever y cache actualizado
7. **Generación de reportes** → Métricas y logs del proceso

---

## 📊 Arquitectura del Sistema

### 🏗️ **Patrón Arquitectónico**: MVC + Microservicios
- **Model**: Repositorios de datos (`/db/repositories.js`)
- **View**: Interfaces web (`/public/*`)
- **Controller**: Rutas y lógica de negocio (`/routes/*`)
- **Services**: NLP, AI, Scrapers como servicios independientes

### 🧩 **Componentes Principales**:

#### 🌐 **API Layer**
- Express.js con middlewares
- CORS configurado para desarrollo
- Autenticación basada en tokens
- Rate limiting implícito

#### 🧠 **Intelligence Layer**
- **Retriever**: Búsqueda semántica con Fuse.js
- **AI Client**: Integración con Google Gemini
- **NLP**: Procesamiento con compromise
- **Synonyms**: Expansión automática de consultas

#### 🗄️ **Data Layer**
- **SQLite**: Base de datos principal (desarrollo)
- **PostgreSQL**: Soporte para producción
- **Abstraction**: Capa unificada para ambas BD
- **Migrations**: Bootstrap automático de esquema

#### 🕷️ **Scraping Layer**
- **Scrapers especializados**: Por tipo de contenido UTS
- **Change Detection**: Monitoreo automático de modificaciones
- **Content Processing**: Limpieza y estructuración de datos
- **Batch Processing**: Ejecución coordinada de múltiples scrapers

#### 🤖 **Automation Layer**
- **Smart Updates**: Actualizaciones solo cuando es necesario
- **Scheduled Tasks**: Tareas programadas del SO
- **Performance Monitoring**: Métricas de recursos y tiempo
- **Error Recovery**: Manejo robusto de fallos

---

## 🔐 Seguridad

### 🛡️ **Medidas Implementadas**:
- **Autenticación**: Token-based para operaciones admin
- **Validación de entrada**: Sanitización de datos de usuario
- **CORS configurado**: Control de acceso cross-origin
- **Rate limiting**: Protección contra abuse (implícito)
- **Error handling**: No exposición de información sensible
- **Environment variables**: Configuración externa de secretos

### 🔒 **Operaciones Protegidas**:
- Mantenimiento del sistema
- Ejecución manual de scrapers
- Modificación de base de conocimiento
- Acceso a logs detallados
- Configuración de automatización

---

## 📈 Monitoreo y Métricas

### 📊 **Métricas Recolectadas**:
- **Conversaciones**: Total, por tipo de usuario, por periodo
- **Satisfacción**: Ratings promedio, distribución de feedback
- **Performance**: Tiempos de respuesta, evidencia encontrada
- **Sistema**: Estado de BD, IA, scrapers, última actualización
- **Contenido**: Registros en KB, cobertura por área

### 🔍 **Monitoring Endpoints**:
- `GET /api/health` - Estado general del sistema
- `GET /api/admin/metrics` - Métricas detalladas
- `GET /api/admin/db-status` - Estado de base de datos
- `GET /api/admin/ai-status` - Estado del servicio IA

### 📋 **Logging**:
- **Estructurado**: JSON con categorías y timestamps
- **Rotación automática**: Por fecha y tamaño
- **Niveles**: ERROR, WARN, INFO, DEBUG
- **Categorías**: CHAT, AI, DB, SYSTEM, AUTOMATION, SCRAPER

---

## 🚀 Deployment y DevOps

### 🏗️ **Opciones de Despliegue**:

#### **Desarrollo Local**:
```bash
npm install
npm run dev  # Con hot-reload
```

#### **Producción Simple**:
```bash
npm ci --only=production
npm start
```

#### **Con PM2** (Recomendado):
```bash
npm install -g pm2
pm2 start src/server.js --name "chatbot-uts"
pm2 startup  # Autostart en boot
pm2 save     # Guardar configuración
```

#### **Docker** (Opcional):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### 🔄 **CI/CD Consideraciones**:
- **Testing**: `npm test` antes de deployment
- **Environment**: Variables de entorno por ambiente
- **Database**: Migrations automáticas con `bootstrapSchema()`
- **Static files**: Servidos por Express (o nginx en producción)

---

## 🛠️ Mantenimiento

### 🔧 **Tareas Regulares**:
- **Actualización de contenido**: Automática via scrapers
- **Optimización de búsqueda**: Keywords y sinónimos automáticos
- **Monitoreo de logs**: Revisar errores y performance
- **Backup de BD**: Recomendado semanal
- **Actualización de dependencias**: Mensual

### 📅 **Programación Recomendada**:
- **Verificación de cambios**: Cada 6 horas
- **Actualización completa**: Diario a las 2:00 AM
- **Actualización inteligente**: Cada 2 horas
- **Backup de base de datos**: Semanal
- **Revisión de logs**: Diario

### 🚨 **Troubleshooting**:
- **Chat no responde**: Verificar API key de Gemini
- **Búsqueda deficiente**: Ejecutar `npm run improve-keywords`
- **Contenido desactualizado**: Ejecutar `npm run scrapers`
- **Performance lenta**: Revisar logs de timing
- **Errores de BD**: Verificar permisos de archivo SQLite

---

## 📚 Recursos y Referencias

### 🔗 **APIs y Servicios**:
- **Google Gemini AI**: https://ai.google.dev/
- **Fuse.js**: https://fusejs.io/
- **Cheerio**: https://cheerio.js.org/
- **Express.js**: https://expressjs.com/

### 📖 **Documentación UTS**:
- **Sitio principal**: https://www.uts.edu.co/
- **Programas académicos**: https://www.uts.edu.co/sitio/programas-academicos/
- **Aspirantes**: https://www.uts.edu.co/sitio/aspirantes/
- **Estudiantes**: https://www.uts.edu.co/sitio/estudiantes/
- **Docentes**: https://www.uts.edu.co/sitio/docentes/

### 🎯 **Específico del Proyecto**:
- **Repositorio**: https://github.com/mandresjacome/chatbot-uts
- **Issues**: Para reportar bugs o solicitar features
- **Wiki**: Documentación adicional y tutoriales

---

## 🤝 Contribución y Desarrollo

### 🔧 **Setup de Desarrollo**:
```bash
git clone https://github.com/mandresjacome/chatbot-uts.git
cd chatbot-uts
npm install
cp .env.example .env  # Configurar variables
npm run dev           # Iniciar en modo desarrollo
```

### 📋 **Convenciones**:
- **Commits**: Conventional commits (feat:, fix:, docs:)
- **Code style**: ESLint + Prettier
- **Testing**: Jest para unit tests
- **Documentation**: JSDoc para funciones principales

### 🎯 **Áreas de Mejora**:
- **Testing**: Ampliar cobertura de pruebas
- **Performance**: Optimización de consultas BD
- **Features**: Más tipos de contenido UTS
- **UI/UX**: Mejoras en interfaces
- **Analytics**: Métricas más detalladas

---

## 📄 Licencia y Créditos

**Licencia**: ISC License  
**Autor**: Mario Andrés Jácome Mantilla  
**Institución**: Unidades Tecnológicas de Santander (UTS)  
**Año**: 2025

### 🙏 **Agradecimientos**:
- **UTS**: Por la oportunidad y el contenido
- **Google**: Por la API de Gemini AI
- **Comunidad Open Source**: Por las librerías utilizadas

---

## 📞 Contacto y Soporte

Para consultas sobre el sistema:
- **Email**: [mario.jacome@uts.edu.co]
- **GitHub**: [@mandresjacome]
- **Institución**: Unidades Tecnológicas de Santander

---

*Documentación generada automáticamente el 3 de septiembre de 2025*  
*Última actualización: v1.2.0*

---

### 🎉 Resumen Ejecutivo

El **Chatbot UTS v1.2.0** es un sistema integral de asistencia virtual para la comunidad universitaria, que combina:

✅ **Inteligencia Artificial** para respuestas naturales  
✅ **Automatización completa** de mantenimiento de contenido  
✅ **Interfaces múltiples** adaptadas a cada tipo de usuario  
✅ **Arquitectura escalable** con soporte para crecimiento  
✅ **Monitoreo integral** con métricas y feedback continuo  
✅ **Mantenimiento automático** sin intervención manual  

El sistema está diseñado para **funcionar de manera autónoma**, manteniéndose actualizado automáticamente con el contenido más reciente de la UTS y proporcionando asistencia 24/7 a estudiantes, docentes y aspirantes.
