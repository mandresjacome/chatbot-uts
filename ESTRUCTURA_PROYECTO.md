# 📁 Estructura del Proyecto - ChatBot UTS v1.3.1

## 🗂️ Organización General - Estado Actualizado (Septiembre 2025)

### ## 📈 Estado Actual del Sistema (Octubre 2025) - v1.3.1

### ✅ Componentes Totalmente Funcionales y Optimizados v1.3.1
- **Web Scraping**: Extrae información actualizada de UTS (excepto docentes)
- **Chat con ---

📅 **Última actualización**: 8 de Octubre de 2025  
🔄 **Estado**: Sistema completamente funcional con análisis inteligente de calidad  
👨‍💻 **Desarrollador**: Mario Andrés Jácome Mantilla  
🏫 **Cliente**: Universidad Tecnológica de Santander - Ingeniería de Sistemas  
✨ **Versión**: v1.3.1 - Sistema Inteligente AdaptativoGemini integrado con **análisis automático de calidad**
- **Sistema de Sugerencias**: ✨ **RENOVADO** - Sugerencias estáticas instantáneas
- **Búsqueda Híbrida Inteligente**: ✨ **MEJORADO** - BD local + búsqueda web **sin hardcode**
- **Análisis de Respuestas**: 🆕 **NUEVO** - Detección automática de limitaciones
- **Filtros Optimizados**: ✅ **MEJORADO** - Fuse.js con threshold 0.4 y score ≤0.95

---

📅 **Última actualización**: 8 de octubre de 2025  
🔄 **Estado**: Sistema inteligente con análisis automático de calidad y detección sin hardcode  
👨‍💻 **Desarrollador**: Mario Andrés Jácome Mantilla  
🏫 **Cliente**: Universidad Tecnológica de Santander - Ingeniería de Sistemas  
✨ **Versión**: v1.3.1 - Sistema inteligente adaptativo sin hardcode

## 🎯 Beneficios del Sistema Actual (v1.3.1)

1. **🧠 Análisis Inteligente**: Detección automática de limitaciones sin hardcode
2. **🎯 Búsqueda Híbrida**: BD local + web complementaria controlada por usuario
3. **🔍 Filtros Optimizados**: Balance perfecto entre relevancia y cobertura de resultados
4. **🤖 IA Contextual**: Gemini integrado con detección inteligente de consultas
5. **⚡ Respuesta Rápida**: Cache inteligente y base de conocimiento optimizada
6. **🛡️ Manejo de Errores**: Respuestas apropiadas para datos no disponibles
7. **📈 Escalabilidad**: Arquitectura modular preparada para crecimiento
8. **🔧 Mantenibilidad**: Logging estructurado y documentación completa
9. **👥 Multiusuario**: Perfiles diferenciados (estudiante, docente, aspirante)
10. **🎮 Control de Usuario**: Búsquedas web solo cuando usuario lo solicitae información actualizada de UTS (excepto docentes)
- **Chat con IA**: Gemini integrado con respuestas contextuales
- **Sistema de Sugerencias**: ✨ **RENOVADO** - Sugerencias estáticas instantáneas
- **Búsqueda Híbrida**: ✨ **NUEVO** - BD local + búsqueda web complementaria 
- **Filtros Optimizados**: ✅ **MEJORADO** - Fuse.js con threshold 0.4 y score ≤0.95
- **Malla Curricular**: Navegación completa con prerrequisitos
- **Panel Admin**: Gestión completa del sistema
- **Base de Conocimiento**: Actualización automática con sinónimos
- **Logging**: Sistema robusto de trazabilidad

### ✨ Nuevas Funcionalidades Implementadas (v1.3.0)
- **staticSuggestions.js**: Sistema de sugerencias instantáneas sin APIs externas
- **webSearcher.js**: Motor de búsqueda web para información complementaria
- **advanced-search.js**: Interfaz moderna para resultados de búsqueda externa
- **Lógica simplificada**: BD check → evidenceCount === 0 → botón → búsqueda web
- **Control total del usuario**: Aparece botón solo cuando BD no tiene información

### ⚠️ Componentes Obsoletos (Conservados por Compatibilidad)
- **Información de Docentes**: UTS eliminó la sección de profesores
- **Scripts de Sincronización de Docentes**: Ya no funcionan (fuente eliminada)
- **Cache de Docentes**: Contiene datos históricos sin actualización
- **suggestionsGenerator.js**: ❌ ELIMINADO - Reemplazado por sistema estáticotualizaciones Implementadas**:
- **Sistema de Sugerencias Estáticas**: Reemplazó Gemini lento por respuestas instantáneas
- **Búsqueda Web Complementaria**: Sistema híbrido controlado por usuario  
- **Filtros de Relevancia Optimizados**: Mejor detección de contenido existente
- **Sistema Simplificado**: Eliminación de complejidad innecesaria que causaba bugs

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
│   ├── sync-teacher-keywords.cjs # ⚠️ Keywords específicas docentes (OBSOLETO)  
│   └── validate-suggestions.mjs  # ✅ Validador de sugerencias v1.3.0
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
│   ├── 📁 admin/                  # ✨ PANEL ADMINISTRATIVO RENOVADO v1.3.0
│   │   ├── index.html             # Interfaz principal con navegación por tabs
│   │   ├── admin.css              # Estilos base del panel
│   │   ├── admin.js               # Lógica principal y navegación
│   │   ├── README.md              # ✅ Documentación específica del admin
│   │   ├── 📁 css/                # 🎨 ESTILOS MODULARES RENOVADOS
│   │   │   ├── base.css           # Estilos base y variables CSS
│   │   │   ├── feedback.css       # ✨ RENOVADO: Estilos con estadísticas horizontales
│   │   │   ├── knowledge.css      # ✨ RENOVADO: Grid de 5 estadísticas + controles horizontales
│   │   │   ├── maintenance.css    # ✨ RENOVADO: Sistema de tabs expandibles + autenticación
│   │   │   └── responsive.css     # Media queries para dispositivos móviles
│   │   └── 📁 js/                 # 📜 JAVASCRIPT MODULAR RENOVADO
│   │       ├── feedback.js        # Gestión de feedback con estadísticas horizontales
│   │       ├── knowledge.js       # ✨ RENOVADO: 5 categorías de estadísticas KB
│   │       └── maintenance.js     # ✨ RENOVADO: Autenticación + 6 funciones expandibles
│   ├── 📁 chat/                   # 💬 INTERFAZ PRINCIPAL DE CHAT RENOVADA
│   │   ├── 📁 css/                # 🎨 ESTILOS ORGANIZADOS
│   │   │   ├── 📁 components/     # Estilos de componentes específicos
│   │   │   │   ├── malla-curricular.css    # Malla curricular completa
│   │   │   │   ├── malla-connections.css   # Conexiones de prerrequisitos
│   │   │   │   └── modal-user.css          # Modal de selección de usuario
│   │   │   └── 📁 layouts/        # Estilos de layout general
│   │   │       └── chat.css       # Interfaz principal del chat
│   │   ├── 📁 js/                 # 📜 JAVASCRIPT RENOVADO Y OPTIMIZADO
│   │   │   ├── 📁 components/     # Componentes reutilizables
│   │   │   │   ├── advanced-search.js      # ✨ NUEVO: Búsqueda web avanzada
│   │   │   │   ├── malla-modal.js          # Modal de malla curricular
│   │   │   │   ├── modal-user.js           # Modal de selección de perfil
│   │   │   │   └── widget.js               # Widgets auxiliares
│   │   │   ├── 📁 modules/        # Módulos principales RENOVADOS
│   │   │   │   ├── chat.js                 # ✅ RENOVADO: Lógica simplificada del chat
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
│   ├── 📁 ai/                     # 🤖 Integración con IA y búsqueda web
│   │   ├── geminiClient.js        # Cliente principal de Gemini con manejo de docentes
│   │   └── webSearcher.js         # ✨ NUEVO: Motor de búsqueda web complementaria
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
│   ├── 📁 nlp/                    # 🧠 Procesamiento de lenguaje natural OPTIMIZADO
│   │   ├── kbLoader.js            # Cargador de base de conocimiento
│   │   ├── retriever.js           # ✅ OPTIMIZADO: Motor con filtros mejorados (Fuse.js)
│   │   ├── staticSuggestions.js   # ✨ NUEVO: Sistema de sugerencias instantáneas
│   │   ├── synonyms.js            # Sistema de sinónimos inteligentes
│   │   └── teacherSearch.js       # ⚠️ Búsqueda docentes (detecta pero sin datos)
│   ├── 📁 routes/                 # 🛣️ Rutas del API REST
│   │   ├── admin.js               # Rutas del panel administrativo
│   │   ├── chat.js                # ✅ RENOVADO: API principal con lógica simplificada
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
- **Panel Admin**: ✨ **COMPLETAMENTE RENOVADO v1.3.0** - Interfaz moderna con:
  - **Autenticación Segura**: Token admin123 con validación del servidor
  - **Sección Feedback**: Estadísticas horizontales organizadas por importancia
  - **Sección Knowledge Base**: 5 categorías de estadísticas + controles horizontales
  - **Sección Mantenimiento**: 6 funciones expandibles con navegación por tabs
  - **Diseño Profesional**: CSS Grid moderno, responsive, UX optimizada
- **Base de Conocimiento**: Actualización automática con sinónimos
- **Logging**: Sistema robusto de trazabilidad

### ⚠️ Componentes Obsoletos (Conservados por Compatibilidad)
- **Información de Docentes**: UTS eliminó la sección de profesores
- **Scripts de Sincronización de Docentes**: Ya no funcionan (fuente eliminada)
- **Cache de Docentes**: Contiene datos históricos sin actualización

### 🎯 Comportamiento Actual del Sistema v1.3.0
#### **Sugerencias Estáticas Instantáneas**:
```javascript
// Sistema nuevo ultrarrápido sin APIs
const suggestions = getStaticSuggestions(userType);
// 4 categorías: estudiante/docente/aspirante/todos
// Respuesta inmediata sin latencia de red
```

#### **Búsqueda Híbrida Inteligente**:
```javascript
// 1. Búsqueda en BD local con filtros optimizados
const evidence = retriever.search(query, userType);
// 2. Si no hay resultados (evidenceCount === 0)
if (shouldShowWebSearchButton(data)) {
  // Mostrar botón - usuario decide si buscar en web
  showWebSearchButton();
}
```

#### **Respuesta con Docentes (Mejorada)**:
```
❌ No encontré información del docente "carlos" en los datos disponibles
💡 Te sugiero contactar directamente con la coordinación académica
🔍 ¿Te gustaría buscar información complementaria en la web? [Botón]
```

## 🔧 Cambios Principales vs Versiones Anteriores

### ✅ 1. Sistema de Sugerencias Revolucionado (v1.3.0)
- **Antes**: Gemini API → lento (2-3 segundos) + dependencia externa
- **Ahora**: Sugerencias estáticas → instantáneas (0ms) + sin dependencias
- **Beneficio**: UX perfecto, sin latencia, sin costos API adicionales
- **Implementación**: `staticSuggestions.js` con 4 categorías específicas

### ✅ 2. Búsqueda Híbrida Controlada por Usuario (v1.3.0)
- **Antes**: Sistema complejo con análisis automático → bugs y complejidad
- **Ahora**: Lógica simple → BD check → botón → usuario decide
- **Beneficio**: Control total, sin falsas búsquedas, UX predecible
- **Componentes**: `webSearcher.js` + `advanced-search.js` + lógica simplificada

### ✅ 3. Filtros de Relevancia Optimizados (v1.3.0)
- **Antes**: Filtros restrictivos (score ≤0.3) → información válida no detectada
- **Ahora**: Balance perfecto (threshold 0.4, score ≤0.95) → mejor cobertura
- **Beneficio**: Encuentra información que definitivamente existe en BD
- **Validado**: Consultas sobre perfiles profesionales ahora funcionan

### ✅ 4. Manejo Inteligente de Datos Faltantes
- **Antes**: Errores al buscar docentes
- **Ahora**: Respuestas útiles con alternativas de contacto
- **Beneficio**: Mejor experiencia de usuario

### ✅ 5. Sistema de Cache Robusto  
- **Antes**: Cache simple por URL
- **Ahora**: `database.json` centralizado + cache específico por sección
- **Beneficio**: Mejor gestión de datos estructurados

### ✅ 6. Logging Estructurado
- **Antes**: Logs básicos en consola
- **Ahora**: Archivos diarios con rotación automática
- **Beneficio**: Mejor debugging y monitoreo

### ✅ 7. Scripts de Automatización Ampliados
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

### ✅ Funcionamiento Actual v1.3.0
- **Chat Principal**: 100% funcional con IA contextual
- **Sugerencias Estáticas**: ✨ Instantáneas sin APIs externas
- **Búsqueda Híbrida**: ✨ BD local + web complementaria bajo demanda
- **Filtros Optimizados**: ✅ Balance perfecto relevancia/cobertura
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