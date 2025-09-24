# Panel de Administración - Chatbot UTS v1.2.0

## 🎯 Descripción

Panel de administración integral para el Chatbot UTS especializado en **Ingeniería de Sistemas**. Permite monitorear, gestionar contenido y mantener el sistema actualizado con información oficial de UTS.

## 📊 Características Principales

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

### 3. Base de Conocimiento (Lectura + Gestión)
- **Fuente única**: Información extraída desde web oficial UTS
- **Verificación de fuentes** UTS vs externas
- **Gestión completa**: Agregar, editar, eliminar entradas
- **Búsqueda y filtrado** avanzado por contenido
- **Metadatos completos**: URLs, fechas, palabras clave
- **Estado de sincronización** con scrapers

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

### Base de Conocimiento
- `GET /api/admin/knowledge` - Obtener entradas con paginación
- `POST /api/admin/knowledge` - Crear nueva entrada
- `PUT /api/admin/knowledge/:id` - Actualizar entrada existente
- `DELETE /api/admin/knowledge/:id` - Eliminar entrada

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
