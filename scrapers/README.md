# 🕷️ Scrapers del Chatbot UTS v1.2.0

Sistema de extracción automática de información desde el sitio web oficial de UTS para mantener actualizada la base de conocimiento del chatbot.

## 📋 Scrapers disponibles

### **`scraper_fixed.cjs`** - 🎯 PRINCIPAL
**Fuente**: https://www.uts.edu.co/sitio/ingenieria-de-sistemas/  
**Propósito**: Extrae información completa del programa de Ingeniería de Sistemas  
**Datos extraídos**:
- ✅ Presentación del programa
- ✅ Perfil profesional y competencias
- ✅ Campos de acción laboral
- ✅ Plan de estudios general
- ✅ Resultados de aprendizaje
- ✅ Información de contacto
- ❌ Docentes específicos (sección no disponible en web)

### **`scraper_aspirantes.cjs`** - 🎓 ASPIRANTES
**Fuente**: https://www.uts.edu.co/sitio/aspirantes/  
**Propósito**: Información especializada para futuros estudiantes  
**Usuario objetivo**: `aspirante`

### **`scraper_docentes.cjs`** - 👨‍🏫 DOCENTES
**Fuente**: https://www.uts.edu.co/sitio/docentes/  
**Propósito**: Recursos y servicios para profesores  
**Usuario objetivo**: `docente`  
**Nota**: NO extrae información de docentes específicos

### **`scraper_estudiantes.cjs`** - 📚 ESTUDIANTES
**Fuente**: https://www.uts.edu.co/sitio/estudiantes/  
**Propósito**: Servicios y trámites para estudiantes actuales  
**Usuario objetivo**: `estudiante`

### **`scraper_tecnologia.cjs`** - 🔧 TECNOLOGÍA
**Fuente**: Información del programa de Tecnología en Desarrollo de Sistemas  
**Propósito**: Datos del programa articulado (nivel tecnológico)  
**Usuario objetivo**: `todos`

## 🚀 Cómo ejecutar

### Scraper individual
```bash
# Ejecutar un scraper específico desde la raíz del proyecto
node scrapers/scraper_fixed.cjs
node scrapers/scraper_aspirantes.cjs
node scrapers/scraper_docentes.cjs
```

### Todos los scrapers (RECOMENDADO)
```bash
# Desde la raíz del proyecto
node scripts/run-scrapers.cjs

# Este script ejecuta todos los scrapers en orden con delays
# y manejo de errores automático
```

### Sistema de automatización
```bash
# Sistema completo de actualización
node scripts/auto-update-system.cjs

# Solo regenerar sinónimos después de scraping
node scripts/generate-synonyms.cjs
```

## ⚙️ Configuración técnica

### Dependencias utilizadas
- **node-fetch@2** - Peticiones HTTP a páginas web
- **cheerio** - Parser HTML tipo jQuery para Node.js  
- **database-adapter** - Adaptador para base de datos ESM/CJS

### Headers de petición
```javascript
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### Estructura de datos insertados
```javascript
{
  pregunta: "Información sobre [sección] del programa...",
  respuesta_texto: "Contenido extraído y limpiado...",
  tipo_usuario: "todos|aspirante|docente|estudiante",
  activo: true,
  nombre_recurso: "Fuente - UTS",
  recurso_url: "URL_original",
  palabras_clave: "keywords, relacionadas, programa",
  created_at: "datetime('now')"
}
```

## 🔄 Proceso de actualización

1. **Limpieza previa**: Cada scraper elimina datos anteriores de su fuente
2. **Extracción**: Parseo específico por estructura web de UTS
3. **Limpieza de datos**: Normalización de espacios y formato
4. **Validación**: Solo se insertan contenidos con más de 50 caracteres
5. **Inserción BD**: Guardado con metadatos completos
6. **Logging**: Registro detallado de resultados

## ⚠️ Notas importantes

- **Sección de docentes**: La web oficial de UTS ya NO incluye listado específico de docentes
- **Cache web**: Los scrapers pueden cachear responses para desarrollo
- **Rate limiting**: Delay de 1 segundo entre scrapers para no sobrecargar el servidor
- **Error handling**: Cada scraper maneja errores independientemente
- **Idempotencia**: Los scrapers pueden ejecutarse múltiples veces sin duplicar datos

## 📊 Métricas típicas

**scraper_fixed.cjs** (principal):
- ~6 secciones extraídas
- ~10KB de contenido total
- ~30 segundos de ejecución

**Todos los scrapers**:
- ~25-30 entradas en base de datos
- ~50KB de contenido total  
- ~2-3 minutos ejecución completa
