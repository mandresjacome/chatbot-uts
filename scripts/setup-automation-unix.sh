#!/bin/bash

# Script para configurar cron jobs en Linux/Mac
# Ejecutar con: chmod +x setup-automation-unix.sh && ./setup-automation-unix.sh

echo "=============================================="
echo "    CONFIGURADOR DE AUTOMATIZACION UTS"
echo "=============================================="
echo

PROJECT_PATH=$(cd "$(dirname "$0")" && cd .. && pwd)
USER=$(whoami)

echo "Configurando cron jobs para el chatbot UTS..."
echo "Directorio del proyecto: $PROJECT_PATH"
echo "Usuario: $USER"
echo

# Crear archivo temporal para crontab
TEMP_CRON=$(mktemp)
echo "# UTS Chatbot - Automatización generada $(date)" > $TEMP_CRON
echo "# Directorio: $PROJECT_PATH" >> $TEMP_CRON
echo "" >> $TEMP_CRON

# Preservar crontab existente si existe
if crontab -l 2>/dev/null | grep -v "UTS Chatbot" >> $TEMP_CRON; then
    echo "✅ Crontab existente preservado"
fi

echo "" >> $TEMP_CRON
echo "# === UTS CHATBOT AUTOMATION ===" >> $TEMP_CRON

# Tarea 1: Verificación cada 6 horas (0, 6, 12, 18)
echo "0 */6 * * * cd $PROJECT_PATH && npm run detect-changes >> logs/automation.log 2>&1" >> $TEMP_CRON

# Tarea 2: Actualización completa diaria a las 2:00 AM
echo "0 2 * * * cd $PROJECT_PATH && npm run auto-update >> logs/automation.log 2>&1" >> $TEMP_CRON

# Tarea 3: Actualización inteligente cada 2 horas
echo "0 */2 * * * cd $PROJECT_PATH && npm run auto-check-update >> logs/automation.log 2>&1" >> $TEMP_CRON

echo "# === FIN UTS CHATBOT AUTOMATION ===" >> $TEMP_CRON

# Aplicar nuevo crontab
if crontab $TEMP_CRON; then
    echo "✅ Cron jobs configurados exitosamente"
else
    echo "❌ Error configurando cron jobs"
    exit 1
fi

# Limpiar archivo temporal
rm $TEMP_CRON

echo
echo "=============================================="
echo "          CONFIGURACION COMPLETADA"
echo "=============================================="
echo
echo "Cron jobs configurados:"
echo "  - Verificación de cambios: cada 6 horas"
echo "  - Actualización completa:  diario a las 2:00 AM"
echo "  - Actualización inteligente: cada 2 horas (solo si hay cambios)"
echo
echo "Para ver los cron jobs:    crontab -l"
echo "Para editar cron jobs:     crontab -e"
echo "Para logs:                 tail -f $PROJECT_PATH/logs/automation.log"
echo
echo "IMPORTANTE:"
echo "- Asegúrese de que Node.js y npm estén en el PATH"
echo "- Verifique que el proyecto tenga permisos de escritura"
echo "- Los logs se guardarán en $PROJECT_PATH/logs/"
echo
