# Datos de Conocimiento - UTS Chatbot

## ⚠️ IMPORTANTE: knowledge.json - SOLO REFERENCIA

**El archivo `knowledge.json` NO se usa en producción.** 

### 🔄 Flujo Actual del Sistema:
1. **BD es la fuente única**: Toda la información se gestiona desde la base de datos
2. **JSON deshabilitado**: La carga automática desde `knowledge.json` está desactivada en `kbLoader.js`
3. **Admin panel**: Use `/admin` para gestionar el contenido

### 📁 Propósito del knowledge.json:
- **Histórico**: Datos originales del sistema (incluye información de docentes obsoleta)
- **Backup**: Respaldo de la estructura de datos  
- **Referencia**: Para consultar formato y ejemplos
- **⚠️ DATOS DOCENTES OBSOLETOS**: Los nombres de profesores están desactualizados (sept 2024)
- **⚠️ FUENTE ELIMINADA**: UTS quitó la sección de docentes de su web oficial
- **NO FUNCIONAL**: El sistema NO lee este archivo actualmente

### ✅ Para actualizar contenido:
1. Ir a `/admin` en el navegador
2. Usar la interfaz de gestión de conocimiento  
3. Los cambios se guardan automáticamente en la BD

### 🗑️ Para eliminar este archivo:
Si quiere limpieza total, puede eliminar `knowledge.json` sin afectar el funcionamiento.

---
**Última actualización**: Sept 2025 - Sistema migrado completamente a BD