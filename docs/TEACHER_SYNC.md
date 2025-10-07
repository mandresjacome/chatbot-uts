# ⚠️ Sistema de Sincronización de Docentes - OBSOLETO v1.3.0

## 📋 Estado Actual - Actualizado v1.3.0

**🚨 IMPORTANTE**: Este sistema está **OBSOLETO** desde septiembre 2024.

**Razón**: La página web oficial de UTS **eliminó la sección de docentes específicos** del programa de Ingeniería de Sistemas.

**✨ NUEVO en v1.3.0**: El sistema ahora maneja inteligentemente las consultas de docentes con respuestas útiles y redirecciones apropiadas.

## 🔄 ¿Qué hacía antes?

### Funcionalidades Históricas (YA NO OPERATIVAS)
- ~~Sincronización automática de nombres de docentes~~
- ~~Extracción de palabras clave de profesores~~  
- ~~Actualización de base de conocimiento con nombres~~
- ~~Búsqueda por nombres específicos de docentes~~

### Nombres que Antes Soportaba
El sistema extraía automáticamente nombres como:
- ~~"Sergio Suárez", "Victor Ochoa", "Leydi Polo"~~
- ~~"Roberto Carvajal", "Alain Pérez", "Elsa Carvajal"~~
- ~~Variaciones ortográficas automáticas~~

## 🎯 Estado Actual del Sistema

### Comportamiento Actual del Chatbot
✅ **Detección correcta**: El bot aún detecta búsquedas de docentes  
✅ **Respuesta apropiada**: Informa que no hay información específica disponible  
✅ **Redirección útil**: Orienta hacia canales oficiales de contacto  
❌ **Sin datos específicos**: No puede proporcionar información individual de profesores  

### Ejemplo de Respuesta Actual
```
❌ No encontré información del docente "carlos" en los datos disponibles 
   del programa de Ingeniería de Sistemas.

💡 Te puedo ayudar con:
- 📋 Información general del programa  
- 🎓 Malla curricular y materias
- 📞 Contacto de coordinación académica
- 🏛️ Requisitos de admisión
```

## 🚀 Alternativas Actuales

### Para Consultas de Docentes
1. **Contacto directo**: Coordinación académica del programa
2. **Web oficial**: https://www.uts.edu.co/sitio/ingenieria-de-sistemas/
3. **Teléfono**: Información disponible en sección de contacto
4. **Correo**: Coordinación académica

### Scripts Relacionados (DESHABILITADOS)
```bash
# ❌ YA NO FUNCIONAL
# node scripts/sync-teacher-keywords.cjs

# ✅ ALTERNATIVA: Información general
node scripts/run-scrapers.cjs  # Actualiza información disponible
```

## 📚 Información Histórica

Este sistema fue desarrollado cuando la web oficial de UTS incluía un listado detallado de docentes con:
- Nombres completos y correos institucionales
- Formación académica de cada profesor  
- Experiencia y materias que enseñaban
- Enlaces a CvLAC de cada docente

**La universidad decidió remover esta sección**, posiblemente por:
- Política de privacidad
- Reestructuración del sitio web
- Centralización de información de contacto

## � Mantenimiento

### Archivos Relacionados (CONSERVADOS)
- `src/nlp/teacherSearch.js` - **ACTIVO** (detecta búsquedas y responde apropiadamente)
- `scripts/sync-teacher-keywords.cjs` - **OBSOLETO** (no eliminar por compatibilidad)
- `src/data/knowledge.json` - **HISTÓRICO** (contiene datos obsoletos)

### Si la UTS Restaura la Sección
Si en el futuro la universidad vuelve a publicar información de docentes:
1. Actualizar `scraper_fixed.cjs` para extraer la nueva sección
2. Reactivar `sync-teacher-keywords.cjs`  
3. Actualizar `teacherSearch.js` para procesar datos reales
4. Eliminar respuestas de "no disponible"

---

**Documentación actualizada**: Septiembre 2025  
**Estado**: Sistema adaptado a realidad actual de UTS  
**Desarrollador**: Mario Andrés Jácome Mantilla

### Sincronización Inteligente
```bash
node scripts/sync-teacher-keywords.cjs
```
- Verifica si hay cambios antes de procesar
- Solo actualiza si es necesario
- Más eficiente para uso programado

### Sistema Completo de Actualización  
```bash
node scripts/auto-update-system.cjs
```
- Ejecuta todas las tareas de actualización del sistema
- Incluye sincronización de docentes automáticamente
- Recomendado para uso programado

## ⏰ Programación Automática

### Windows (Programador de Tareas)
1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Configurar para ejecutar cada hora:
   ```
   Programa: node
   Argumentos: scripts/auto-update-system.cjs
   Iniciar en: C:\ruta\al\chatbot-uts
   ```

### Control desde Panel Admin (Recomendado)
```
✅ Acceder a /admin con token de autenticación
✅ Usar botón "Auto Update" para ejecutar manualmente
✅ Monitorear logs en tiempo real desde interfaz web
✅ No requiere configuración de sistema operativo
```

## 🔍 Monitoreo y Logs

### Archivos de Estado
- `cache/teachers-hash.txt`: Hash MD5 del contenido actual de docentes
- Logs en consola muestran progreso detallado

### Verificación de Funcionamiento
```bash
# 1. Ejecutar sincronización
node scripts/sync-teacher-keywords.cjs --force

# 2. Verificar en base de datos
sqlite3 src/db/database.db "SELECT palabras_clave FROM knowledge_base WHERE pregunta LIKE '%docentes%';"

# 3. Probar búsqueda en el chatbot
# Buscar: "leydi polo", "victor ochoa", etc.
```

## 📊 Ejemplo de Salida

```
🔄 Iniciando sincronización de nombres de docentes...
📋 Procesando registro ID 73: "Información sobre docentes del programa de Ingeniería de Sistemas UTS"
🔍 Extrayendo nombres de docentes...
📊 Docentes encontrados: 55
🎯 Nombres únicos extraídos: 173
💾 Actualizando base de datos...
🔄 Recargando base de conocimiento en retriever...
✅ Sincronización completada exitosamente!
🔑 Nuevas búsquedas disponibles para: sergio, victor, leydi, alain, elsa...
```

## 🛠️ Solución de Problemas

### No encuentra docentes nuevos
1. Verificar que el nuevo docente esté en `knowledge_base`
2. Ejecutar sincronización forzada: `--force`
3. Reiniciar servidor del chatbot

### Búsqueda no funciona después de sincronización
1. Verificar que el servidor se reinició
2. Comprobar logs del retriever
3. Verificar palabras clave en base de datos

### Error en sincronización
1. Verificar permisos de escritura en `cache/`
2. Comprobar conectividad a base de datos
3. Revisar sintaxis del contenido de docentes

## 🔧 Mantenimiento

- **Frecuencia recomendada**: Cada hora o diariamente
- **Requisitos**: Node.js, acceso a base de datos SQLite
- **Recursos**: Mínimo impacto, solo procesa si hay cambios
- **Compatibilidad**: Windows, Linux, macOS

## 💡 Beneficios

1. **Búsquedas siempre actualizadas**: Nuevos docentes son buscables automáticamente
2. **Cero mantenimiento manual**: No requiere editar palabras clave manualmente  
3. **Eficiencia**: Solo procesa cuando hay cambios reales
4. **Robustez**: Maneja errores y casos extremos
5. **Transparencia**: Logs detallados de todas las operaciones

---

**Configurado automáticamente** ✅  
El sistema está listo para funcionar sin intervención manual.