# Panel de Administración - Chatbot UTS v1.3.0 🎨✨

## 🎯 Descripción

Panel de administración **completamente renovado** para el Chatbot UTS v1.3.0. Interfaz moderna con diseño responsivo, funcionalidades organizadas y experiencia de usuario optimizada para gestionar el sistema de manera eficiente.

## 🎨 **NUEVO en v1.3.0: Interfaz Completamente Renovada**

### ✨ **Mejoras Visuales Principales**
- **🎛️ Dashboard moderno** con tarjetas estadísticas organizadas horizontalmente
- **📊 Layout en cuadrícula** para mejor aprovechamiento del espacio
- **🎮 Controles optimizados** - botones y campos en línea horizontal
- **📱 Completamente responsivo** - funciona perfecto en móvil, tablet y desktop
- **⚡ Animaciones suaves** y transiciones para mejor experiencia
- **🎯 Navegación intuitiva** con secciones claramente organizadas

## 📊 Características Principales Mejoradas

### 1. 💬 **Sección Feedback (Renovada)**
- **Estadísticas horizontales** en tarjetas visuales profesionales:
  - 📊 **Total Votos** - Contador general de feedback recibido  
  - 👍 **Respuestas Útiles** - Feedback positivo de usuarios
  - 👎 **Respuestas No Útiles** - Feedback para mejora continua
- **Diseño en cuadrícula** responsive que se adapta a cualquier pantalla
- **Filtros avanzados** por rating, período, tipo de consulta
- **Análisis visual** mejorado para identificar tendencias

### 2. 📚 **Base de Conocimiento (Completamente Rediseñada)**
- **5 estadísticas categorizadas** en tarjetas organizadas:
  - 📝 **Total Entradas** - Contador general de la base de conocimiento
  - 🎓 **Estudiantes** - Contenido específico para estudiantes  
  - 👨‍🏫 **Docentes** - Información dirigida a docentes
  - 🌟 **Aspirantes** - Contenido para futuros estudiantes
  - 👥 **Todos/Visitantes** - Información general del programa
- **Controles de búsqueda en línea**: Input + 3 botones horizontales
  - 🔍 **Buscar** - Búsqueda en tiempo real
  - 🗑️ **Limpiar** - Reset de filtros
  - 🔄 **Actualizar** - Refresh de datos
- **Interfaz optimizada** con CSS Grid para distribución perfecta
- **Tabla moderna** con paginación y filtros avanzados

### 3. ⚙️ **Mantenimiento (Revolucionado)**
- **🔐 Autenticación segura funcional** con token `admin123`
- **📊 Estado del Sistema en tarjetas**:
  - 🖥️ **Servidor** - Estado de Node.js y Express
  - 🗄️ **Base de datos** - Conexión SQLite/PostgreSQL  
  - 🤖 **IA (Gemini)** - Estado del servicio de inteligencia artificial
  - 📚 **Registros KB** - Conteo de entradas en base de conocimiento
  - ⏱️ **Última actualización** - Timestamp de última sincronización

- **� Funciones Específicas Expandibles** organizadas en 6 tabs:
  - 🤖 **Automatización** - Control de tareas automáticas, detección de cambios
  - 👥 **Docentes** - Sincronización y verificación de información de profesores  
  - 🔍 **Búsqueda** - Gestión de índices y optimización de relevancia
  - 💡 **Sugerencias** - Control del sistema de sugerencias estáticas
  - 🌐 **Scrapers** - Gestión de extracción de datos web desde UTS
  - ⚙️ **Operaciones** - Funciones de sistema, backup y mantenimiento BD

## 🏗️ Arquitectura Modular Optimizada

### 1. Métricas en Tiempo Real
- **Conversaciones totales** del sistema por período
- **Tasa de satisfacción** basada en feedback de usuarios
- **Estadísticas de uso** por tipo de consulta (malla, docentes, general)
- **Últimas conversaciones** con contexto completo
- **Estado del modelo IA** (Gemini/Mock) y rendimiento

### 2. Gestión de Feedback
- **Lista completa** de feedback de usuarios con contexto
- **Filtros avanzados** por rating, período, tipo de consulta
- **Análisis de sentimientos** automático
- **Métricas de satisfacción** por funcionalidad

### 3. Base de Conocimiento (Solo Lectura - Actualización Automática)
- **Fuente única**: Información extraída automáticamente desde web oficial UTS
- **Verificación de fuentes** UTS vs externas
- **Visualización completa**: Ver, buscar, filtrar entradas existentes
- **Búsqueda y filtrado** avanzado por contenido
- **Metadatos completos**: URLs, fechas, palabras clave
- **Estado de sincronización** con scrapers
- **Sin edición manual**: Se actualiza automáticamente via scrapers

### 4. Mantenimiento del Sistema
- **Ejecutar scrapers**: Actualización automática desde web UTS
- **Regenerar sinónimos**: Sistema de NLP mejorado
- **Backup de base de datos**: Exportación completa
- **Reload de índices**: Actualización en caliente
- **Logs del sistema**: Monitoreo de errores y rendimiento

## 🔐 Configuración de Seguridad

### Token de Administrador
```env
# .env
ADMIN_TOKEN=tu_token_super_secreto_aqui
```

### Acceso al Panel
1. Navega a `/admin` en tu navegador
2. Ve a la sección "Mantenimiento"
3. Ingresa el ADMIN_TOKEN para acceder a funciones protegidas

## 🏗️ Arquitectura Modular

```
public/admin/
├─ index.html                 # Página principal con navegación por tabs
├─ css/
│  ├─ base.css               # Estilos base y sistema de temas
│  ├─ metrics.css            # Estilos específicos para métricas
│  ├─ feedback.css           # Estilos específicos para feedback
│  ├─ knowledge.css          # Estilos específicos para KB
│  └─ maintenance.css        # Estilos específicos para mantenimiento
└─ js/
   ├─ metrics.js             # Lógica de métricas
   ├─ feedback.js            # Lógica de feedback
   ├─ knowledge.js           # Lógica de base de conocimiento
   └─ maintenance.js         # Lógica de mantenimiento
```

## 🔌 Endpoints de API - Estado Actual

### Métricas del Sistema
- `GET /api/admin/metrics` - Métricas generales y estadísticas
- `GET /api/admin/conversations` - Últimas conversaciones con filtros

### Gestión de Feedback
- `GET /api/feedback/list` - Lista todos los feedback con filtros
- `POST /api/feedback` - Crear nuevo feedback (desde chat)

### Base de Conocimiento (Solo Lectura)
- `GET /api/admin/knowledge` - Obtener entradas con paginación y filtros
- `GET /api/admin/knowledge/:id` - Obtener entrada específica
- **Nota**: No hay endpoints de creación, edición o eliminación manual
- **Actualización**: Solo via scrapers automáticos

### Malla Curricular (Especializado)
- `GET /api/malla-curricular` - Información completa de la malla
- `GET /api/malla-curricular/programa_completo` - Solo programa principal
- `GET /api/malla-curricular/programa_completo/:nivel` - Nivel específico
- `GET /api/malla-curricular/buscar/:materia` - Buscar materia específica

### Mantenimiento y Scrapers
- `POST /api/admin/run-scrapers` - Ejecutar todos los scrapers
- `POST /api/admin/reload-kb` - Recargar base de conocimiento en memoria
- `POST /api/admin/backup-db` - Generar backup de base de datos
- `POST /api/admin/regenerate-synonyms` - Regenerar sinónimos automáticos

### Estado del Sistema
- `GET /api/health` - Health check general
- `GET /api/admin/db-status` - Estado de conexión BD
- `GET /api/admin/ai-status` - Estado de servicio Gemini AI
- `GET /api/admin/scrapers-status` - Estado última ejecución scrapers

## 🎨 Sistema de Temas

El panel incluye un sistema de temas automático:
- **Auto**: Sigue la preferencia del sistema
- **Claro**: Tema claro forzado
- **Oscuro**: Tema oscuro forzado

## ⚠️ Notas importantes del sistema actual

### Información de Docentes
- **Estado actual**: La sección de docentes **NO está disponible** en la web oficial UTS
- **Comportamiento del bot**: Responde apropiadamente informando que no hay información específica
- **Redirección**: Orienta a los usuarios hacia canales oficiales de contacto
- **Datos históricos**: El archivo `knowledge.json` contiene información obsoleta de docentes

### Fuentes de Información
- **Primaria**: Scrapers automáticos desde https://www.uts.edu.co/sitio/ingenieria-de-sistemas/
- **Malla curricular**: Datos integrados programáticamente desde `mallaCurricular.js`
- **Sin datos manuales**: Todo proviene de fuentes oficiales verificables
- **Cache web**: Sistema de cache para optimizar scrapers

### Proceso de Actualización
1. **Scrapers** extraen información actualizada desde web oficial
2. **Base de datos** se actualiza automáticamente
3. **Panel admin** permite verificar y gestionar contenido  
4. **Sistema de logging** registra todos los cambios y errores
5. **Sinónimos automáticos** mejoran la búsqueda semántica

---

**Desarrollado por Mario Andrés Jácome Mantilla**  
**Especializado para Ingeniería de Sistemas - UTS 2025**  
**Repositorio**: https://github.com/mandresjacome/chatbot-uts
