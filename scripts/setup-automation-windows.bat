@echo off
:: Script para configurar tareas programadas en Windows
:: Ejecutar como Administrador

echo ==============================================
echo    CONFIGURADOR DE AUTOMATIZACION UTS
echo ==============================================
echo.

set "PROJECT_PATH=%~dp0.."
set "NODE_PATH=node"
set "TASK_PREFIX=UTS-Chatbot"

echo Configurando tareas programadas para el chatbot UTS...
echo Directorio del proyecto: %PROJECT_PATH%
echo.

:: Tarea 1: Verificación diaria de cambios (cada 6 horas)
echo [1/3] Configurando verificación de cambios (cada 6 horas)...
schtasks /create /tn "%TASK_PREFIX%-Check-Changes" /tr "cmd /c cd /d \"%PROJECT_PATH%\" && npm run detect-changes" /sc hourly /mo 6 /f
if %errorlevel% == 0 (
    echo ✅ Tarea de verificación configurada exitosamente
) else (
    echo ❌ Error configurando tarea de verificación
)
echo.

:: Tarea 2: Actualización automática diaria (2:00 AM)
echo [2/3] Configurando actualización automática diaria (2:00 AM)...
schtasks /create /tn "%TASK_PREFIX%-Auto-Update" /tr "cmd /c cd /d \"%PROJECT_PATH%\" && npm run auto-update" /sc daily /st 02:00 /f
if %errorlevel% == 0 (
    echo ✅ Tarea de actualización diaria configurada exitosamente
) else (
    echo ❌ Error configurando tarea de actualización diaria
)
echo.

:: Tarea 3: Actualización inteligente (solo si hay cambios) cada 2 horas
echo [3/3] Configurando actualización inteligente (cada 2 horas)...
schtasks /create /tn "%TASK_PREFIX%-Smart-Update" /tr "cmd /c cd /d \"%PROJECT_PATH%\" && npm run auto-check-update" /sc hourly /mo 2 /f
if %errorlevel% == 0 (
    echo ✅ Tarea de actualización inteligente configurada exitosamente
) else (
    echo ❌ Error configurando tarea de actualización inteligente
)
echo.

echo ==============================================
echo          CONFIGURACION COMPLETADA
echo ==============================================
echo.
echo Tareas programadas creadas:
echo   - %TASK_PREFIX%-Check-Changes     (cada 6 horas)
echo   - %TASK_PREFIX%-Auto-Update       (diario a las 2:00 AM)
echo   - %TASK_PREFIX%-Smart-Update      (cada 2 horas, solo si hay cambios)
echo.
echo Para ver las tareas:     schtasks /query /tn "%TASK_PREFIX%*"
echo Para eliminar las tareas: schtasks /delete /tn "%TASK_PREFIX%*" /f
echo.
echo IMPORTANTE: 
echo - Asegúrese de que Node.js esté en el PATH del sistema
echo - Las tareas se ejecutarán con los permisos del usuario actual
echo - Revise los logs en la carpeta logs/ del proyecto
echo.
pause
