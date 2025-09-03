# Scrapers del Chatbot UTS

Esta carpeta contiene los scrapers que extraen información del sitio web de UTS para poblar la base de conocimiento del chatbot.

## Scrapers disponibles

- **`scraper_aspirantes.cjs`** - Extrae información para aspirantes (admisiones, costos, calendario, documentos)
- **`scraper_docentes.cjs`** - Extrae información para docentes (plataformas, recursos, normatividad)
- **`scraper_estudiantes.cjs`** - Extrae información para estudiantes (trámites, calendarios, plataformas)
- **`scraper_tecnologia.cjs`** - Extrae información del programa de Tecnología en Desarrollo de Sistemas
- **`scraper_fixed.cjs`** - Extrae información general del programa de Ingeniería de Sistemas

## Cómo ejecutar

```bash
# Ejecutar un scraper específico
cd scrapers
node scraper_aspirantes.cjs

# Ejecutar todos los scrapers
node scraper_fixed.cjs
node scraper_aspirantes.cjs
node scraper_docentes.cjs
node scraper_estudiantes.cjs
node scraper_tecnologia.cjs
```

## Dependencias

Los scrapers utilizan:
- **node-fetch@2** - Para hacer peticiones HTTP
- **cheerio** - Para parsear HTML
- **database-adapter** - Para conectar con la base de datos ESM

## Base de datos

Los scrapers insertan la información en la tabla `knowledge_base` con diferentes tipos de usuario:
- `aspirante` - Información específica para aspirantes
- `docente` - Información específica para docentes  
- `estudiante` - Información específica para estudiantes
- `todos` - Información general para todos los usuarios
