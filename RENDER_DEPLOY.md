# Guía de Deploy en Render.com

## ⚙️ Configuración en Render.com

### 1. **Configuraciones del Servicio:**
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Node Version:** `18.x` o superior

### 2. **Variables de Entorno Requeridas:**

```bash
# Configuración básica
NODE_ENV=production
PORT=10000

# Deploy optimizado
SKIP_SCRAPERS_ON_START=true
QUICK_BOOT_MODE=true
DEPLOY_MODE=true
RENDER=true

# Tu configuración actual (agregar las que ya tienes)
GEMINI_API_KEY=tu_clave_actual
ADMIN_TOKEN=tu_token_actual
DATABASE_URL=tu_url_bd_si_usas_postgres
```

### 3. **Configuraciones Avanzadas:**
- **Auto-Deploy:** ✅ Activado 
- **Health Check Path:** `/api/health`
- **Instance Type:** Free tier está bien para empezar

### 4. **Lo que hace automáticamente:**
- ✅ Instala dependencias optimizadas
- ✅ Crea directorios necesarios
- ✅ Inicializa archivos mínimos si no existen
- ✅ Evita operaciones pesadas en deploy
- ✅ Timeout optimizado

## 🚀 Pasos para Deploy:

1. **Conectar GitHub** a Render.com
2. **Seleccionar tu repo** `chatbot-uts`
3. **Configurar build command:** `npm run build`
4. **Configurar start command:** `npm start`
5. **Agregar variables de entorno** (las de arriba)
6. **Deploy** 🎉

## ⚡ ¿Por qué no habrá timeout ahora?

- **Deploy rápido:** Solo inicializa lo esencial
- **Sin scrapers pesados:** Se ejecutan después del deploy
- **Timeouts optimizados:** Operaciones más cortas
- **Archivos mínimos:** Crea solo lo necesario

¡Tu chatbot funcionará perfecto en Render! 🎊
