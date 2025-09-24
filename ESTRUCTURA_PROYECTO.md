# 📁 Estructura del Proyecto - ChatBot UTS v1.3.0

## 🗂️ Organización General - Estado Actual (Septiembre 2025)

```
chatbot-uts/
├── 📁 backups/                    # Archivos de respaldo y versiones anteriores
│   ├── backup-test.db             # Base de datos de respaldo
│   └── package.json.backup        # Configuración anterior de dependencias
├── 📁 cache/                      # Cache de scrapers web (datos extraídos)
│   ├── database.json              # Cache de datos estructurados 
│   ├── web_https___www_uts_edu_co_sitio_ingenieria_de_sistemas_.json
│   ├── web_https___www_uts_edu_co_sitio_aspirantes_.json
│   ├── web_https___www_uts_edu_co_sitio_estudiantes_.json
│   ├── web_https___www_uts_edu_co_sitio_docentes_.json  # ⚠️ OBSOLETO (ya no contiene datos)
│   ├── web_https___www_uts_edu_co_sitio_programas_academicos_ingenieria_de_sistemas_.json
│   ├── web_https___www_uts_edu_co_sitio_tecnologia_en_desarrollo_de_sistemas_informaticos_.json
│   └── web_https___www_uts_edu_co_sitio_proceso_modalidad_presencial_.json
├── 📁 config/                     # Configuraciones del sistema
│   └── automation.json            # Configuración de automatización
├── 📁 docs/                       # Documentación especializada
│   ├── AUTOMATIZACION.md          # Guía de automatización del sistema
│   ├── TEACHER_SYNC.md            # ⚠️ Sistema sincronización docentes (OBSOLETO)
│   └── Malla Completa Pensum 2019.pdf  # Documento oficial de referencia
├── 📁 logs/                       # Sistema de logging por fechas
│   ├── chatbot-2025-09-22.log     # Logs diarios del sistema
│   ├── chatbot-2025-09-23.log
│   └── chatbot-2025-09-24.log
├── 📁 scripts/                    # 🔧 SCRIPTS DE AUTOMATIZACIÓN
│   ├── run-scrapers.cjs           # ✅ Ejecutor de todos los scrapers (ACTIVO)
│   ├── generate-synonyms.cjs      # ✅ Generador automático de sinónimos (ACTIVO)
│   ├── auto-update-system.cjs     # ✅ Sistema de actualización automática (ACTIVO)
│   ├── sync-teacher-keywords.cjs  # ⚠️ Sincronizador docentes (OBSOLETO - conservado)
│   ├── change-detector.cjs        # ✅ Detector de cambios en contenido web
│   ├── deploy-init.cjs           # ✅ Script de inicialización para deploy
│   ├── improve-keywords.cjs      # ✅ Mejorador de palabras clave
│   ├── setup-teacher-sync.cjs    # ⚠️ Setup sincronización docentes (OBSOLETO)
│   ├── setup-automation-unix.sh   # Automatización para Unix/Linux
│   └── setup-automation-windows.bat # Automatización para Windows
├── 📁 scrapers/                   # 🕷️ SISTEMA DE SCRAPERS WEB
│   ├── scraper_fixed.cjs          # ✅ Scraper principal (Ingeniería de Sistemas) 
│   ├── scraper_docentes.cjs       # ⚠️ Scraper docentes (OBSOLETO - no extrae datos)
│   ├── scraper_aspirantes.cjs     # ✅ Scraper información aspirantes (ACTIVO)
│   ├── scraper_estudiantes.cjs    # ✅ Scraper información estudiantes (ACTIVO)
│   ├── scraper_tecnologia.cjs     # ✅ Scraper Tecnología en Desarrollo (ACTIVO)
│   └── README.md                  # Documentación actualizada de scrapers
├── 📁 public/                     # Archivos públicos del frontend
│   ├── 📁 assets/                 # 🎨 ASSETS ORGANIZADOS
│   │   ├── 📁 animations/         # GIFs y animaciones
│   │   │   ├── ChatbotAzulEstudiante.gif
│   │   │   ├── ChatbotGrisTodos.gif
│   │   │   ├── ChatbotNaranjaDocente.gif
│   │   │   ├── ChatbotVerdeAspirante.gif
│   │   │   └── ChatbotVerdeUTS.gif
│   │   ├── 📁 images/             # Imágenes estáticas
│   │   └── 📁 logos/              # Logos y marcas
│   │       └── logoUTS.webp
│   ├── 📁 admin/                  # Panel de administración
│   ├── 📁 chat/                   # 💬 INTERFAZ PRINCIPAL DE CHAT
│   │   ├── 📁 css/                # 🎨 ESTILOS ORGANIZADOS
│   │   │   ├── 📁 components/     # Estilos de componentes específicos
│   │   │   │   ├── malla-curricular.css    # Malla curricular completa
│   │   │   │   ├── malla-connections.css   # Conexiones de prerrequisitos
│   │   │   │   └── modal-user.css          # Modal de selección de usuario
│   │   │   └── 📁 layouts/        # Estilos de layout general
│   │   │       └── chat.css       # Interfaz principal del chat
│   │   ├── 📁 js/                 # 📜 JAVASCRIPT ORGANIZADO
│   │   │   ├── 📁 components/     # Componentes reutilizables
│   │   │   │   ├── malla-modal.js          # Modal de malla curricular
│   │   │   │   ├── modal-user.js           # Modal de selección de perfil
│   │   │   │   └── widget.js               # Widgets auxiliares
│   │   │   ├── 📁 modules/        # Módulos principales
│   │   │   │   ├── chat.js                 # Lógica principal del chat
│   │   │   │   └── malla-navigator.js      # Navegador de malla curricular
│   │   │   └── 📁 utils/          # Utilidades y helpers
│   │   │       └── simple-malla.js        # Utilidades de malla simple
│   │   ├── 📁 themes/             # Temas visuales por perfil
│   │   │   ├── aspirante.css
│   │   │   ├── docente.css
│   │   │   ├── estudiante.css
│   │   │   └── visitante.css
│   │   └── index.html             # Página principal del chat
│   └── index.html                 # Landing page del proyecto
├── 📁 scrapers/                   # Scripts de web scraping
├── 📁 scripts/                    # Scripts de automatización
├── 📁 src/                        # Código fuente del backend
│   ├── 📁 ai/                     # 🤖 Integración con IA (Google Gemini)
│   │   └── geminiClient.js        # Cliente principal de Gemini con manejo de docentes
│   ├── 📁 data/                   # 📊 Datos y base de conocimientos
│   │   ├── knowledge.json         # Base de conocimiento principal
│   │   └── mallaCurricular.js     # Estructura de malla curricular completa
│   ├── 📁 db/                     # 🗄️ Base de datos (SQLite/PostgreSQL)
│   │   ├── database.db            # Base de datos SQLite local
│   │   ├── database.js            # Configuración de conexión
│   │   ├── index.js               # Exportaciones principales
│   │   └── repositories.js        # Repositorios de datos
│   ├── 📁 middlewares/            # ⚙️ Middlewares de Express
│   │   └── adminAuth.js           # Autenticación de administrador
│   ├── 📁 nlp/                    # 🧠 Procesamiento de lenguaje natural
│   │   ├── kbLoader.js            # Cargador de base de conocimiento
│   │   ├── retriever.js           # Recuperador de información con Fuse.js
│   │   ├── synonyms.js            # Sistema de sinónimos inteligentes
│   │   └── teacherSearch.js       # ⚠️ Búsqueda docentes (detecta pero sin datos)
│   ├── 📁 routes/                 # 🛣️ Rutas del API REST
│   │   ├── admin.js               # Rutas del panel administrativo
│   │   ├── chat.js                # API principal del chat
│   │   ├── feedback.js            # Sistema de feedback de usuarios
│   │   └── malla.js               # API de malla curricular
│   ├── 📁 utils/                  # 🛠️ Utilidades del backend
│   │   ├── database-adapter.cjs   # Adaptador de base de datos
│   │   ├── id.js                  # Generador de IDs únicos
│   │   ├── logger.js              # Sistema de logging estructurado
│   │   └── normalize.js           # Normalizador de texto
│   └── server.js                  # 🚀 Servidor principal Express
└── 📁 tests/                      # 🧪 Pruebas automatizadas
    └── chat.test.js               # Pruebas del sistema de chat
```

## � Estado Actual del Sistema (Septiembre 2025)

### ✅ Componentes Totalmente Funcionales
- **Web Scraping**: Extrae información actualizada de UTS (excepto docentes)
- **Chat con IA**: Gemini integrado con respuestas contextuales
- **Malla Curricular**: Navegación completa con prerrequisitos
- **Panel Admin**: Gestión completa del sistema
- **Base de Conocimiento**: Actualización automática con sinónimos
- **Logging**: Sistema robusto de trazabilidad

### ⚠️ Componentes Obsoletos (Conservados por Compatibilidad)
- **Información de Docentes**: UTS eliminó la sección de profesores
- **Scripts de Sincronización de Docentes**: Ya no funcionan (fuente eliminada)
- **Cache de Docentes**: Contiene datos históricos sin actualización

### 🎯 Comportamiento Actual con Docentes
El sistema detecta búsquedas de profesores pero responde apropiadamente:
```
❌ No encontré información del docente "carlos" en los datos disponibles
💡 Te sugiero contactar directamente con la coordinación académica
```

## 🔧 Cambios Principales vs Versiones Anteriores

### ✅ 1. Manejo Inteligente de Datos Faltantes
- **Antes**: Errores al buscar docentes
- **Ahora**: Respuestas útiles con alternativas de contacto
- **Beneficio**: Mejor experiencia de usuario

### ✅ 2. Sistema de Cache Robusto  
- **Antes**: Cache simple por URL
- **Ahora**: `database.json` centralizado + cache específico por sección
- **Beneficio**: Mejor gestión de datos estructurados

### ✅ 3. Logging Estructurado
- **Antes**: Logs básicos en consola
- **Ahora**: Archivos diarios con rotación automática
- **Beneficio**: Mejor debugging y monitoreo

### ✅ 4. Scripts de Automatización Ampliados
- **Antes**: Scripts básicos de scraping
- **Ahora**: Suite completa con detección de cambios, mejora de keywords, deploy
- **Beneficio**: Sistema más autónomo y mantenible

## 🔗 Integración con Tecnologías Actuales

### Backend (Node.js + Express)
```javascript
// Estructura modular actual
const express = require('express');
const { geminiClient } = require('./src/ai/geminiClient');
const { retriever } = require('./src/nlp/retriever');
const { teacherSearch } = require('./src/nlp/teacherSearch'); // Detecta pero no retorna datos
```

### Base de Datos (Dual: SQLite + PostgreSQL)
- **Desarrollo**: SQLite local (`database.db`)
- **Producción**: PostgreSQL en Render
- **Migración**: Automática según `NODE_ENV`

### Sistema de Scraping Actualizado
```bash
# Scrapers activos (extraen datos actuales)
node scripts/run-scrapers.cjs
# - scraper_fixed.cjs ✅
# - scraper_aspirantes.cjs ✅  
# - scraper_estudiantes.cjs ✅
# - scraper_tecnologia.cjs ✅
# - scraper_docentes.cjs ⚠️ (conservado, no extrae datos)
```

## 🎯 Beneficios del Sistema Actual (v1.3.0)

1. **� IA Contextual**: Gemini integrado con detección inteligente de consultas
2. **🔍 Búsqueda Semántica**: Fuse.js + sinónimos automáticos para mejor recuperación
3. **� Datos Actualizados**: Web scraping automático de fuentes oficiales UTS  
4. **⚡ Respuesta Rápida**: Cache inteligente y base de conocimiento optimizada
5. **🛡️ Manejo de Errores**: Respuestas apropiadas para datos no disponibles
6. **📈 Escalabilidad**: Arquitectura modular preparada para crecimiento
7. **� Mantenabilidad**: Logging estructurado y documentación completa
8. **👥 Multiusuario**: Perfiles diferenciados (estudiante, docente, aspirante)

## 🚨 Notas Importantes para Desarrollo

### ✅ Funcionamiento Actual
- **Chat Principal**: 100% funcional con IA contextual
- **Malla Curricular**: Navegación completa con prerrequisitos
- **Admin Panel**: Gestión de feedback y mantenimiento  
- **Auto-actualización**: Sistema de scrapers automáticos
- **Sinónimos**: Generación automática para mejor búsqueda

### ⚠️ Limitaciones Conocidas
- **Información de Docentes**: No disponible (fuente oficial eliminada)
- **Datos Históricos**: Cache contiene información de sept 2024
- **Actualización Docentes**: Scripts conservados pero no funcionales

### 🔮 Preparado para el Futuro
Si UTS restaura la información de docentes:
1. `scraper_docentes.cjs` está preparado para reactivación
2. `teacherSearch.js` mantiene lógica de detección
3. `sync-teacher-keywords.cjs` listo para sincronización
4. Base de conocimiento expandible automáticamente

---

📅 **Última actualización**: Septiembre 2025  
🔄 **Estado**: Sistema completamente funcional con limitaciones documentadas  
👨‍� **Desarrollador**: Mario Andrés Jácome Mantilla  
🏫 **Cliente**: Universidad Tecnológica de Santander - Ingeniería de Sistemas