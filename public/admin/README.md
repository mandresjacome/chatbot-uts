# Panel de Administración - Chatbot UTS v1.2.0

## 🎯 Descripción

Panel de administración modular para el Chatbot UTS que permite monitorear, verificar fuentes y mantener el sistema de forma sólida y trazable.

## 📊 Características Principales

### 1. Métricas (Solo Lectura)
- Conversaciones totales del sistema
- Tasa de satisfacción basada en feedback
- Resumen de feedback positivos/negativos
- Últimas conversaciones registradas
- Estado del modelo de IA

### 2. Feedback (Solo Lectura con Filtros)
- Lista completa de feedback de usuarios
- Filtros por tipo (positivo/negativo)
- Filtros por período (hoy, semana, mes)
- Estadísticas agregadas en tiempo real

### 3. Base de Conocimiento (Solo Lectura y Verificación)
- **Objetivo**: Verificar que la KB proviene del sitio UTS
- Búsqueda y filtrado de entradas
- Verificación de fuentes UTS vs externas
- Enlaces directos a recursos originales
- Información de última actualización
- Visualización de metadatos completos

### 4. Mantenimiento (Protegido con ADMIN_TOKEN)
- **Ejecutar Scrapers**: Corre `npm run scrapers`
- **Recargar Índice**: Endpoint `/api/admin/reload-kb`
- **Backup Database**: Descarga rápida de la DB
- **Estado del Sistema**: Verificación de servicios

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

## 🔌 Endpoints de API

### Métricas (Sin autenticación)
- `GET /api/admin/metrics` - Obtiene métricas del sistema

### Feedback (Sin autenticación)
- `GET /api/feedback/list` - Lista todos los feedback

### Base de Conocimiento (Sin autenticación)
- `GET /api/admin/knowledge` - Obtiene entradas de la KB

### Mantenimiento (Requiere ADMIN_TOKEN)
- `POST /api/admin/auth` - Autenticación de token
- `POST /api/admin/run-scrapers` - Ejecuta scrapers
- `POST /api/admin/reload-kb` - Recarga base de conocimiento
- `POST /api/admin/backup-db` - Descarga backup de DB

### Estado del Sistema
- `GET /api/health` - Estado general
- `GET /api/admin/db-status` - Estado de base de datos
- `GET /api/admin/ai-status` - Estado del servicio de IA

## 🎨 Sistema de Temas

El panel incluye un sistema de temas automático:
- **Auto**: Sigue la preferencia del sistema
- **Claro**: Tema claro forzado
- **Oscuro**: Tema oscuro forzado

## 🔍 Verificación de Fuentes UTS

### Objetivo Principal
Comprobar que la información en la base de conocimiento proviene del sitio oficial UTS.

### Indicadores Visuales
- ✅ **Verde**: Fuente verificada del dominio UTS
- ⚠️ **Amarillo**: Fuente externa o no verificada
- ❌ **Rojo**: Sin fuente especificada

### Dominios UTS Verificados
- `*.uts.edu.co`
- `*.unitecnologica.edu.co`

## 🚀 Uso del Panel

### Para Sustentación del Proyecto
1. **Demostrar Trazabilidad**: Mostrar que cada respuesta del bot tiene una fuente UTS verificable
2. **Mostrar Métricas**: Estadísticas de uso y satisfacción real
3. **Verificar Feedback**: Comentarios reales de usuarios
4. **Proceso de Actualización**: Cómo se mantiene actualizada la información

### Flujo de Trabajo
1. Los scrapers extraen información del sitio UTS
2. La información se almacena en `knowledge.json`
3. El panel permite verificar que cada entrada tiene su fuente UTS
4. Las métricas muestran el uso real del sistema

## 💡 Razones del Diseño

### Solo Lectura para KB
- **Trazabilidad**: La fuente de verdad es el sitio UTS
- **Integridad**: Evita desalineación manual vs sitio oficial
- **Proceso Claro**: Scrapers → Ingest → Reload (pipeline definido)

### Separación Modular
- **Mantenibilidad**: Cada sección es independiente
- **Escalabilidad**: Fácil agregar nuevas funcionalidades
- **Responsabilidad**: Cada módulo tiene un propósito claro

## 🛠️ Desarrollo

### Agregar Nueva Funcionalidad
1. Crear CSS en `css/nueva-seccion.css`
2. Crear JS en `js/nueva-seccion.js`
3. Agregar tab en `index.html`
4. Implementar endpoint en backend si es necesario

### Personalización de Temas
Editar variables CSS en `css/base.css`:
```css
:root {
  --primary: #2563eb;
  --success: #059669;
  /* etc... */
}
```

## 📚 Dependencias

### Frontend
- CSS Grid y Flexbox nativo
- JavaScript ES6+ nativo
- Sin frameworks externos

### Backend
- Express.js para rutas
- Autenticación por token simple
- Integración con sistema de scrapers existente

## 🔧 Solución de Problemas

### Error de Autenticación
1. Verificar que `ADMIN_TOKEN` esté configurado en `.env`
2. Revisar que el token ingresado sea correcto
3. Verificar permisos del servidor

### Datos No Cargan
1. Verificar que el servidor esté ejecutándose
2. Revisar conexión de base de datos
3. Verificar que exista `knowledge.json`

### Scrapers No Ejecutan
1. Verificar que `npm run scrapers` funcione manualmente
2. Revisar permisos de ejecución
3. Verificar timeout de 2 minutos

---

**Desarrollado por Mario Andrés Jácome Mantilla**  
**Unidades Tecnológicas de Santander - 2024**
