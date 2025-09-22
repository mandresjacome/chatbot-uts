# 🔄 Sistema de Sincronización Automática de Docentes

## 📋 Descripción

Sistema automático que mantiene actualizadas las **palabras clave** del registro de docentes con todos los nombres de profesores. Esto garantiza que las búsquedas por nombre específico (como "leydi polo", "victor ochoa") funcionen correctamente.

## 🔧 Funcionalidades

### ✅ Sincronización Automática
- **Detecta cambios** en la información de docentes
- **Extrae nombres** automáticamente del texto
- **Actualiza palabras clave** en la base de datos
- **Recarga** la base de conocimiento del retriever
- **Guarda estado** para evitar procesamiento innecesario

### 🎯 Nombres Soportados
El sistema extrae y agrega automáticamente:
- Nombres completos: "sergio suarez", "victor ochoa"
- Nombres individuales: "leydi", "alain", "elsa"
- Apellidos: "polo", "carvajal", "perez"
- Variaciones: "leidy" y "leydi" automáticamente

## 🚀 Uso

### Sincronización Manual (Forzada)
```bash
node scripts/sync-teacher-keywords.cjs --force
```
- Ejecuta sincronización sin verificar cambios
- Útil para primera configuración o troubleshooting

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

### Linux/macOS (crontab)
```bash
# Editar crontab
crontab -e

# Agregar línea para ejecutar cada hora
0 * * * * cd /path/to/chatbot-uts && node scripts/auto-update-system.cjs
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