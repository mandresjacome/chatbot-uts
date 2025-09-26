# Chatbot UTS v1.3.0 🤖

Chatbot inteligente para el **programa de Ingeniería de Sistemas** de las Unidades Tecnológicas de Santander (UTS). Sistema desarrollado con Node.js, Express, SQLite y integración con Google Gemini AI que proporciona información actualizada directamente desde la web oficial.

## 🚀 Características Pr## 📊 Roadmap

- [x] **v1.3.0**: ✅ Sistema de sugerencias estáticas optimizado
- [x] **v1.3.0**: ✅ Búsqueda web complementaria controlada por usuario  
- [x] **v1.3.0**: ✅ Filtros de relevancia optimizados en retrieval
- [ ] **v1.4.0**: Integración con calendario académico
- [ ] **v1.5.0**: Soporte para múltiples programas académicos
- [ ] **v1.6.0**: Bot de Telegram/WhatsApp
- [ ] **v2.0.0**: Interfaz de voz con speech-to-textles

- **Chat inteligente especializado** en Ingeniería de Sistemas UTS
- **Información actualizada** mediante scrapers automáticos de la web oficial
- **Sistema de sugerencias estáticas optimizado** - instantáneas sin dependencias externas
- **Malla curricular interactiva** con navegación por semestres
- **Búsqueda web complementaria** controlada por usuario cuando BD no tiene información
- **Filtros de relevancia optimizados** para mejor detección de contenido existente
- **Integración con Gemini AI** para respuestas contextuales
- **Sistema de scrapers** que mantiene la información sincronizada
- **Panel de administración** con métricas y gestión de contenido
- **Detección inteligente** de búsquedas de docentes (con respuesta apropiada)
- **API REST completa** con documentación integrada

## 🛠️ Tecnologías

- **Backend**: Node.js + Express.js
- **Base de datos**: SQLite3 (desarrollo) / PostgreSQL (producción)
- **IA**: Google Generative AI (Gemini 2.5-flash)
- **NLP**: Fuse.js + compromise + búsqueda semántica
- **Scrapers**: Cheerio + node-fetch para extracción web
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Testing**: Jest + Supertest

## 📁 Estructura del proyecto

```
chatbot-uts/
├── src/
│   ├── server.js              # Servidor principal Express
│   ├── routes/
│   │   ├── chat.js            # Endpoint principal del chatbot
│   │   ├── feedback.js        # Sistema de feedback de usuarios
│   │   ├── admin.js           # Panel de administración
│   │   └── malla.js           # API de malla curricular
│   ├── nlp/
│   │   ├── retriever.js       # Motor de búsqueda optimizado + malla curricular
│   │   ├── staticSuggestions.js # Sistema de sugerencias estáticas instantáneas
│   │   ├── teacherSearch.js   # Sistema de búsqueda de docentes
│   │   ├── kbLoader.js        # Cargador de base de conocimiento
│   │   └── synonyms.js        # Sinónimos generados automáticamente
│   ├── ai/
│   │   ├── geminiClient.js    # Cliente Gemini AI + lógica de respuestas
│   │   └── webSearcher.js     # Motor de búsqueda web complementaria
│   ├── db/
│   │   ├── index.js           # Conexión BD (SQLite/PostgreSQL)
│   │   ├── database.js        # Esquema y configuración
│   │   └── repositories.js    # Repositorios de datos
│   ├── data/
│   │   ├── knowledge.json     # Datos históricos (NO ACTIVO)
│   │   ├── mallaCurricular.js # Malla completa de Ingeniería
│   │   └── README.md          # Documentación de datos
│   ├── utils/
│   │   ├── normalize.js       # Normalización de texto
│   │   ├── logger.js          # Sistema de logging
│   │   └── id.js              # Generación de IDs únicos
│   └── middlewares/
│       └── adminAuth.js       # Autenticación del panel admin
├── scrapers/                  # Sistema de scrapers web
│   ├── scraper_fixed.cjs      # Scraper principal (Ingeniería de Sistemas)
│   ├── scraper_docentes.cjs   # Scraper información para docentes
│   ├── scraper_aspirantes.cjs # Scraper información aspirantes
│   ├── scraper_estudiantes.cjs# Scraper información estudiantes
│   ├── scraper_tecnologia.cjs # Scraper Tecnología en Desarrollo
│   └── README.md              # Documentación de scrapers
├── scripts/                   # Scripts de automatización
│   ├── run-scrapers.cjs       # Ejecutor automático de todos los scrapers
│   ├── generate-synonyms.cjs  # Generador automático de sinónimos
│   ├── auto-update-system.cjs # Sistema de actualización automática
│   └── sync-teacher-keywords.cjs # Sincronizador de palabras clave
├── public/
│   ├── chat/                  # Interfaz de chat público
│   │   ├── index.html         # Chat principal
│   │   ├── css/               # Estilos del chat
│   │   └── js/                # Lógica del chat (sistema simplificado)
│   │       ├── components/    # Componentes de búsqueda web avanzada
│   │       └── modules/       # Módulos optimizados (chat.js renovado)
│   └── admin/                 # Panel de administración web
│       ├── index.html         # Dashboard principal
│       ├── admin.css          # Estilos del admin
│       ├── admin.js           # Lógica del admin
│       └── css/               # Estilos específicos por sección
├── tests/
│   └── chat.test.js           # Tests del sistema de chat
├── docs/                      # Documentación del proyecto
│   ├── AUTOMATIZACION.md      # Guía de automatización
│   └── TEACHER_SYNC.md        # Sincronización de docentes
├── logs/                      # Archivos de log del sistema
├── cache/                     # Cache de scrapers web
└── config/                    # Archivos de configuración
```

## ⚡ Instalación rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/mandresjacome/chatbot-uts.git
cd chatbot-uts
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tu API key de Google Gemini
```

4. **Ejecutar scrapers iniciales** (para poblar la BD)
```bash
node scripts/run-scrapers.cjs
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

6. **Acceder a la aplicación**
- Chat público: http://localhost:3001/chat
- Chat API: http://localhost:3001/api/chat/message  
- Panel Admin: http://localhost:3001/admin
- Malla curricular: http://localhost:3001/api/malla-curricular
- Health Check: http://localhost:3001/api/health

## 🔧 Variables de entorno

```env
# API Key de Google Gemini (requerida para respuestas IA)
GEMINI_API_KEY=tu_api_key_aqui

# Configuración del servidor
PORT=3001
NODE_ENV=development

# Configuración de IA
USE_LLM=gemini         # 'gemini' o 'mock' para desarrollo
GEMINI_MODEL=gemini-2.5-flash

# Configuración de base de datos
DB_SQLITE_PATH=./src/db/database.db
DATABASE_URL=postgresql://...  # Para producción

# Configuración de respuestas
MAX_CHARS_EVIDENCE=2500
MAX_CHARS_RESPONSE=1800
```

## 📡 API Endpoints

### Chat Principal
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "¿Cuáles son las materias del primer semestre?",
  "userType": "todos",        # "todos", "estudiante", "docente", "aspirante"
  "sessionId": "session-123"  # Opcional para mantener contexto
}
```

### Malla Curricular
```http
GET /api/malla-curricular                    # Información completa
GET /api/malla-curricular/programa_completo  # Solo programa principal
GET /api/malla-curricular/programa_completo/1 # Nivel específico
GET /api/malla-curricular/buscar/Cálculo    # Buscar materia específica
```

### Feedback de usuarios
```http
POST /api/feedback
Content-Type: application/json

{
  "sessionId": "session-123",
  "conversationId": 1,
  "rating": 5,              # 1-5 estrellas
  "comment": "Muy útil"     # Opcional
}
```

### Panel de administración
```http
GET /api/admin/metrics          # Métricas generales
GET /api/admin/conversations    # Últimas conversaciones
GET /api/admin/knowledge        # Base de conocimiento
POST /api/admin/knowledge       # Agregar/editar conocimiento
DELETE /api/admin/knowledge/:id # Eliminar entrada
```

## 🔄 Sistema de actualización automática

El chatbot incluye scrapers que mantienen la información actualizada:

```bash
# Ejecutar todos los scrapers manualmente
node scripts/run-scrapers.cjs

# Regenerar sinónimos automáticamente
node scripts/generate-synonyms.cjs

# Sistema de actualización completo
node scripts/auto-update-system.cjs
```

**Scrapers disponibles:**
- `scraper_fixed.cjs` - Información principal de Ingeniería de Sistemas
- `scraper_docentes.cjs` - Recursos para docentes  
- `scraper_aspirantes.cjs` - Información para aspirantes
- `scraper_estudiantes.cjs` - Información para estudiantes
- `scraper_tecnologia.cjs` - Tecnología en Desarrollo de Sistemas

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 🚀 Despliegue

### Desarrollo local
```bash
npm run dev  # Con nodemon y recarga automática
```

### Producción
```bash
# Instalar dependencias de producción
npm ci --only=production

# Ejecutar scrapers para poblar BD
node scripts/run-scrapers.cjs

# Iniciar servidor
npm start
```

### Con PM2 (recomendado para producción)
```bash
npm install -g pm2
pm2 start src/server.js --name "chatbot-uts"
pm2 startup
pm2 save
```

### Deploy en Render.com
Ver [RENDER_DEPLOY.md](RENDER_DEPLOY.md) para instrucciones detalladas de despliegue.

## 📊 Panel de administración

Accede a `/admin` para gestionar el sistema con una **interfaz moderna y completamente renovada**:

### 🎛️ **Secciones principales**
- 💬 **Feedback**: Vista organizada de satisfacción de usuarios con estadísticas en tarjetas horizontales
- � **Base de Conocimiento**: Gestión completa con estadísticas por tipo de usuario y controles de búsqueda optimizados
- ⚙️ **Mantenimiento**: Sistema de autenticación seguro con funciones organizadas en tabs expandibles

### ✨ **Características del panel**
- **📊 Dashboard moderno** con tarjetas estadísticas organizadas horizontalmente
- **🔍 Controles de búsqueda optimizados** - input y botones en línea para mejor UX
- **📈 Métricas categorizadas** por tipos de usuario (Estudiantes, Docentes, Aspirantes, Todos/Visitantes)
- **🔐 Autenticación segura** con token de administrador (por defecto: `admin123`)
- **⚙️ Mantenimiento avanzado** con 6 categorías organizadas:
  - 🤖 **Automatización** - Control de tareas automáticas
  - 👥 **Docentes** - Sincronización de información de profesores
  - 🔍 **Búsqueda** - Gestión de índices y relevancia
  - 💡 **Sugerencias** - Control del sistema de sugerencias
  - 🌐 **Scrapers** - Gestión de extracción de datos web
  - ⚙️ **Operaciones** - Funciones de sistema y base de datos

### 🎨 **Mejoras de diseño v1.3.0**
- **Layout responsivo** que se adapta a cualquier dispositivo
- **Estadísticas en cuadrícula** para mejor visualización de métricas
- **Interfaz expandible** para funciones avanzadas sin saturar la vista
- **Animaciones suaves** y transiciones para mejor experiencia de usuario
- **Organización por pestañas** en funciones específicas de mantenimiento

## 🎯 Funcionalidades especializadas

### Sistema de sugerencias estáticas optimizado
- **Sugerencias instantáneas** sin dependencia de APIs externas
- **4 categorías de usuarios**: estudiante, docente, aspirante, todos
- **Respuestas inmediatas** que reemplazaron el sistema Gemini lento
- **Contexto específico** según el perfil del usuario

### Búsqueda web complementaria inteligente
- **Detección automática** cuando BD no tiene información (evidenceCount === 0)
- **Control del usuario** - botón aparece solo cuando es necesario
- **Búsqueda externa** en fuentes confiables cuando BD local no es suficiente
- **Sistema simplificado** que eliminó complejidad innecesaria

### Motor de búsqueda optimizado
- **Filtros de relevancia mejorados** - Fuse.js con threshold 0.4 y score ≤0.95
- **Detección precisa** de información existente en base de datos
- **Balance perfecto** entre relevancia y cobertura de resultados
- **Debug logging** para monitoreo del comportamiento de búsqueda

### Malla curricular interactiva
- Navegación por niveles y semestres
- Búsqueda de materias específicas
- Información de prerrequisitos y créditos
- Componente visual integrado

### Manejo de docentes
- Detección inteligente de búsquedas de profesores
- Respuesta apropiada cuando no hay información disponible
- Redirección a canales oficiales de contacto

## 🤖 Tipos de consultas soportadas

- **Información general**: Presentación, requisitos, modalidades
- **Malla curricular**: Materias, créditos, prerrequisitos por semestre
- **Perfil profesional**: Competencias y campos de acción
- **Proceso de admisión**: Requisitos, inscripciones, fechas
- **Contacto**: Información de coordinación y ubicación
- **Recursos académicos**: Enlaces y documentos oficiales

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Ejecuta los tests (`npm test`)
4. Actualiza documentación si es necesario
5. Commit tus cambios (`git commit -am 'feat: agregar nueva funcionalidad'`)
6. Push a la rama (`git push origin feature/nueva-funcionalidad`)
7. Abre un Pull Request

### Estructura de commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bugs
- `docs:` cambios en documentación
- `style:` cambios de formato
- `refactor:` refactorización de código
- `test:` agregar o corregir tests

## � Roadmap

- [ ] **v1.3.0**: Integración con calendario académico
- [ ] **v1.4.0**: Soporte para múltiples programas académicos
- [ ] **v1.5.0**: Bot de Telegram/WhatsApp
- [ ] **v2.0.0**: Interfaz de voz con speech-to-text

## ⚠️ Notas importantes

- **Información de docentes**: Actualmente no disponible en la web oficial UTS
- **Datos históricos**: El archivo `knowledge.json` contiene información obsoleta
- **Fuente única**: Todo el contenido proviene de scrapers de la web oficial
- **Actualización**: Los scrapers deben ejecutarse periódicamente para mantener datos actualizados

## �📄 Licencia

ISC License - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Mario Andrés Jácome Mantilla**  
Unidades Tecnológicas de Santander  
📧 Email: [tu-email@uts.edu.co]  
🐙 GitHub: [@mandresjacome](https://github.com/mandresjacome)

---

<div align="center">
  <p>🎓 Hecho con ❤️ para la comunidad de Ingeniería de Sistemas UTS</p>
  <p>
    <strong>Chatbot UTS v1.3.0</strong> - Información siempre actualizada con sugerencias instantáneas
  </p>
  <p>✨ <em>Última actualización: Sistema híbrido optimizado con búsqueda web complementaria</em></p>
</div>
