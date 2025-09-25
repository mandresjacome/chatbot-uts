// Maintenance JS - Funcionalidad para la sección de mantenimiento

class MaintenanceManager {
  constructor() {
    this.initialized = false;
    this.authenticated = false;
    this.adminToken = null;
    this.runningTasks = new Set();
  }

  init() {
    if (this.initialized) return;
    
    this.bindEvents();
    this.checkSystemStatus();
    this.initialized = true;
  }

  bindEvents() {
    const authenticateBtn = document.getElementById('authenticateBtn');
    const adminTokenInput = document.getElementById('adminToken');

    if (authenticateBtn) {
      authenticateBtn.addEventListener('click', () => {
        this.authenticate();
      });
    }

    if (adminTokenInput) {
      adminTokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.authenticate();
        }
      });
    }

    // ===== NUEVOS BOTONES DE AUTOMATIZACIÓN =====
    
    // Sistema de Automatización
    this.bindButton('detectChangesBtn', () => this.detectChanges());
    this.bindButton('autoUpdateBtn', () => this.runAutoUpdate('full'));
    this.bindButton('quickUpdateBtn', () => this.runAutoUpdate('quick'));
    
    // Sincronización de Docentes
    this.bindButton('syncTeachersBtn', () => this.syncTeachers());
    this.bindButton('checkTeachersBtn', () => this.checkTeachersChanges());
    
    // Optimización de Búsqueda
    this.bindButton('improveKeywordsBtn', () => this.improveKeywords());
    this.bindButton('generateSynonymsBtn', () => this.generateSynonyms());
    
    // Sugerencias Estáticas
    this.bindButton('viewAllSuggestionsBtn', () => this.viewSuggestions('all'));
    this.bindButton('viewEstudianteBtn', () => this.viewSuggestions('estudiante'));
    this.bindButton('viewDocenteBtn', () => this.viewSuggestions('docente'));
    this.bindButton('viewAspiranteBtn', () => this.viewSuggestions('aspirante'));
    this.bindButton('editSuggestionsBtn', () => this.showEditSuggestionsInfo());
    
    // Scrapers Manuales
    this.bindButton('runAllScrapersBtn', () => this.runScrapers('all'));
    this.bindButton('runAspirantesBtn', () => this.runScrapers('aspirantes'));
    this.bindButton('runDocentesBtn', () => this.runScrapers('docentes'));
    this.bindButton('runEstudiantesBtn', () => this.runScrapers('estudiantes'));
    this.bindButton('runTecnologiaBtn', () => this.runScrapers('tecnologia'));
    
    // Operaciones del Sistema
    this.bindButton('reloadKbBtn', () => this.reloadKnowledgeBase());
    this.bindButton('backupDbBtn', () => this.backupDatabase());
    this.bindButton('checkSystemBtn', () => this.checkSystemStatus());
    
    // Configuración
    this.bindButton('setupAutomationBtn', () => this.setupAutomation());
    this.bindButton('viewLogsBtn', () => this.viewLogs());
  }

  bindButton(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  async authenticate() {
    const tokenInput = document.getElementById('adminToken');
    const authenticateBtn = document.getElementById('authenticateBtn');
    
    if (!tokenInput || !authenticateBtn) return;

    const token = tokenInput.value.trim();
    if (!token) {
      this.showAuthError('Por favor ingresa el token de administrador');
      return;
    }

    authenticateBtn.disabled = true;
    authenticateBtn.textContent = 'Verificando...';

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const result = await response.json();

      if (result.success) {
        this.adminToken = token;
        this.authenticated = true;
        this.showMaintenanceActions();
        this.updateAuthStatus(true);
      } else {
        this.showAuthError(result.error || 'Token inválido');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.showAuthError('Error de conexión');
    } finally {
      authenticateBtn.disabled = false;
      authenticateBtn.textContent = 'Autenticar';
    }
  }

  showMaintenanceActions() {
    const authSection = document.getElementById('authSection');
    const maintenanceActions = document.getElementById('maintenanceActions');

    if (authSection) authSection.style.display = 'none';
    if (maintenanceActions) maintenanceActions.style.display = 'block';
  }

  updateAuthStatus(authenticated) {
    const authIndicator = document.getElementById('authIndicator');
    const authText = document.getElementById('authText');
    const authStatus = document.getElementById('authStatus');

    if (authenticated) {
      if (authIndicator) authIndicator.textContent = '🔓';
      if (authText) authText.textContent = 'Autenticado';
      if (authStatus) authStatus.classList.add('authenticated');
    } else {
      if (authIndicator) authIndicator.textContent = '🔒';
      if (authText) authText.textContent = 'No autenticado';
      if (authStatus) authStatus.classList.remove('authenticated');
    }
  }

  showAuthError(message) {
    const authText = document.getElementById('authText');
    const authStatus = document.getElementById('authStatus');
    
    if (authText) authText.textContent = message;
    if (authStatus) {
      authStatus.classList.add('error');
      setTimeout(() => authStatus.classList.remove('error'), 3000);
    }
  }

  async reloadKnowledgeBase() {
    if (!this.authenticated) return;

    const taskId = 'systemOps';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La recarga ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '🔄 Recargando base de conocimiento...\n');

    try {
      const response = await fetch('/api/admin/reload-kb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Base de conocimiento recargada exitosamente\n');
        if (result.stats) {
          this.appendTaskOutput(taskId, `📊 Entradas procesadas: ${result.stats.total}\n`);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Base de conocimiento recargada', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Reload error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async backupDatabase() {
    if (!this.authenticated) return;

    const taskId = 'systemOps';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('El backup ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '💾 Creando backup de la base de datos...\n');

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'GET',
        headers: {
          'x-admin-token': this.adminToken
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Obtener el nombre del archivo desde los headers o usar uno por defecto
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `chatbot-uts-backup-${new Date().toISOString().split('T')[0]}.db`;
        if (contentDisposition) {
          const regexMatch = /filename="(.+)"/.exec(contentDisposition);
          if (regexMatch) filename = regexMatch[1];
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.appendTaskOutput(taskId, '✅ Backup descargado exitosamente\n');
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Backup creado y descargado', 'success');
      } else {
        const result = await response.json();
        this.appendTaskOutput(taskId, `❌ Error: ${result.error || 'Error desconocido'}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Backup error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async checkSystemStatus() {
    try {
      const checks = [
        { name: 'servidor', endpoint: '/api/health' },
        { name: 'base de datos', endpoint: '/api/admin/db-status' },
        { name: 'ia', endpoint: '/api/admin/ai-status' }
      ];

      for (const check of checks) {
        this.updateSystemStatus(check.name, 'checking');
      }

      const results = await Promise.allSettled(
        checks.map(check => 
          fetch(check.endpoint).then(r => ({ 
            name: check.name, 
            ok: r.ok, 
            status: r.status 
          }))
        )
      );

      results.forEach((result, index) => {
        const checkName = checks[index].name;
        if (result.status === 'fulfilled') {
          const status = result.value.ok ? 'online' : 'offline';
          this.updateSystemStatus(checkName, status);
        } else {
          this.updateSystemStatus(checkName, 'offline');
        }
      });

    } catch (error) {
      console.error('System check error:', error);
      ['servidor', 'base de datos', 'ia'].forEach(name => {
        this.updateSystemStatus(name, 'offline');
      });
    }
  }

  updateSystemStatus(component, status) {
    const elementMap = {
      'servidor': 'serverStatus',
      'base de datos': 'dbStatus',
      'ia': 'aiStatus'
    };

    const elementId = elementMap[component];
    const element = document.getElementById(elementId);
    
    if (!element) return;

    const statusText = {
      'online': '🟢 En línea',
      'offline': '🔴 Desconectado',
      'checking': '🟡 Verificando...'
    };

    element.textContent = statusText[status] || '❓ Desconocido';
    element.className = `info-value ${status}`;
  }

  setTaskStatus(taskId, status) {
    // Mapeo de taskIds a elementos específicos
    const buttonMappings = {
      'automation': ['detectChangesBtn', 'autoUpdateBtn', 'quickUpdateBtn'],
      'optimization': ['improveKeywordsBtn', 'generateSynonymsBtn'],
      'teacher-sync': ['syncTeachersBtn'],
      'teacher-check': ['checkTeachersBtn'],
      'suggestions': ['viewAllSuggestionsBtn', 'viewEstudianteBtn', 'viewDocenteBtn', 'viewAspiranteBtn', 'editSuggestionsBtn'],
      'scrapers': ['runAllScrapersBtn', 'runAspirantesBtn', 'runDocentesBtn', 'runEstudiantesBtn', 'runTecnologiaBtn'],
      'systemOps': ['reloadKbBtn', 'backupDbBtn'],
      'config': ['setupAutomationBtn', 'viewLogsBtn']
    };

    const statusMappings = {
      'automation': 'automationStatus',
      'optimization': 'optimizationStatus',
      'teacher-sync': 'teacherSyncStatus',
      'teacher-check': 'teacherSyncStatus',
      'suggestions': 'suggestionsStatus',
      'scrapers': 'scrapersStatus',
      'systemOps': 'systemOpsStatus',
      'config': 'configStatus'
    };

    // Actualizar botones relacionados
    const buttons = buttonMappings[taskId] || [];
    buttons.forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = status === 'running';
        if (status === 'running') {
          button.classList.add('loading');
        } else {
          button.classList.remove('loading');
        }
      }
    });

    // Actualizar status element
    const statusElementId = statusMappings[taskId];
    const statusElement = document.getElementById(statusElementId);
    if (statusElement) {
      const statusText = {
        'running': 'Ejecutando...',
        'success': 'Completado',
        'error': 'Error',
        'ready': 'Listo'
      };
      statusElement.textContent = statusText[status] || 'Listo';
      statusElement.className = `action-status ${status}`;
    }

    if (status === 'running') {
      this.runningTasks.add(taskId);
    } else {
      this.runningTasks.delete(taskId);
    }
  }

  showTaskOutput(taskId, content) {
    const outputMappings = {
      'automation': 'automationOutput',
      'optimization': 'optimizationOutput',
      'suggestions': 'suggestionsOutput', 
      'scrapers': 'scrapersOutput',
      'systemOps': 'systemOpsOutput',
      'config': 'configOutput'
    };

    const outputElementId = outputMappings[taskId];
    const outputElement = document.getElementById(outputElementId);
    if (outputElement) {
      outputElement.textContent = content;
      outputElement.classList.add('active');
      outputElement.classList.remove('success', 'error');
    }
  }

  appendTaskOutput(taskId, content) {
    const outputMappings = {
      'automation': 'automationOutput',
      'optimization': 'optimizationOutput',
      'suggestions': 'suggestionsOutput',
      'scrapers': 'scrapersOutput',
      'systemOps': 'systemOpsOutput',
      'config': 'configOutput'
    };

    const outputElementId = outputMappings[taskId];
    const outputElement = document.getElementById(outputElementId);
    if (outputElement) {
      outputElement.textContent += content;
      outputElement.scrollTop = outputElement.scrollHeight;
    }
  }

  destroy() {
    this.runningTasks.clear();
    this.authenticated = false;
    this.adminToken = null;
    this.initialized = false;
  }

  // ===== NUEVAS FUNCIONES DE AUTOMATIZACIÓN =====

  async detectChanges() {
    if (!this.authenticated) {
      this.showAlert('No estás autenticado', 'error');
      return;
    }

    const taskId = 'automation';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La detección de cambios ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '🔍 Iniciando detección de cambios...\n');

    try {
      console.log('Admin token:', this.adminToken);
      console.log('Sending request to:', '/api/admin/detect-changes');
      
      const response = await fetch('/api/admin/detect-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        const hasChanges = result.data?.hasChanges || false;
        if (hasChanges) {
          this.appendTaskOutput(taskId, '🔄 Cambios detectados en el sistema\n');
          this.appendTaskOutput(taskId, `   Base de datos: ${result.data.database?.changes?.length || 0} cambios\n`);
          this.appendTaskOutput(taskId, `   Páginas web: ${result.data.web?.length || 0} cambios\n`);
          this.showAlert('Cambios detectados - Se recomienda ejecutar actualización', 'warning');
        } else {
          this.appendTaskOutput(taskId, '✅ No se detectaron cambios - Sistema actualizado\n');
          this.showAlert('Sistema actualizado - No hay cambios detectados', 'success');
        }
        this.setTaskStatus(taskId, 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Detection error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async runAutoUpdate(mode = 'full') {
    if (!this.authenticated) return;

    const taskId = 'automation';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La actualización ya está en progreso', 'warning');
      return;
    }

    const modeText = mode === 'full' ? 'completa' : 'rápida';
    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, `🤖 Iniciando actualización ${modeText}...\n`);

    try {
      const response = await fetch('/api/admin/auto-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        },
        body: JSON.stringify({ mode })
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, `✅ Actualización ${modeText} completada exitosamente\n`);
        if (result.data) {
          this.appendTaskOutput(taskId, `   Duración: ${result.data.duration || 'N/A'}s\n`);
          this.appendTaskOutput(taskId, `   Registros procesados: ${result.data.records || 0}\n`);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert(`Actualización ${modeText} completada`, 'success');
        
        // Actualizar estado del sistema
        setTimeout(() => this.checkSystemStatus(), 1000);
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Auto-update error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async improveKeywords() {
    if (!this.authenticated) return;

    const taskId = 'optimization';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La mejora de keywords ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '🎯 Mejorando palabras clave...\n');

    try {
      const response = await fetch('/api/admin/improve-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Palabras clave mejoradas exitosamente\n');
        if (result.data) {
          this.appendTaskOutput(taskId, `   Registros actualizados: ${result.data.updated || 0}\n`);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Keywords mejorados exitosamente', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Keywords error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async generateSynonyms() {
    if (!this.authenticated) return;

    const taskId = 'optimization';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La generación de sinónimos ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '📝 Generando sinónimos específicos...\n');

    try {
      const response = await fetch('/api/admin/generate-synonyms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Sinónimos generados exitosamente\n');
        if (result.data) {
          this.appendTaskOutput(taskId, `   Grupos creados: ${result.data.groups || 0}\n`);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Sinónimos generados exitosamente', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Synonyms error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async syncTeachers() {
    if (!this.authenticated) return;

    const taskId = 'teacher-sync';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La sincronización de docentes ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '👨‍🏫 Sincronizando palabras clave de docentes...\n');

    try {
      const response = await fetch('/api/admin/sync-teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Sincronización completada exitosamente\n');
        if (result.stats) {
          this.appendTaskOutput(taskId, `   Docentes procesados: ${result.stats.processed}\n`);
          this.appendTaskOutput(taskId, `   Nombres añadidos: ${result.stats.added}\n`);
          this.appendTaskOutput(taskId, `   Registros actualizados: ${result.stats.updated}\n`);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Palabras clave de docentes sincronizadas exitosamente', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Teacher sync error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async checkTeachersChanges() {
    if (!this.authenticated) return;

    const taskId = 'teacher-check';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('La verificación de cambios ya está en progreso', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '🔍 Verificando cambios en docentes...\n');

    try {
      const response = await fetch('/api/admin/check-teachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        const hasChanges = result.data.hasChanges;
        const statusIcon = hasChanges ? '⚠️' : '✅';
        const statusText = hasChanges ? 'Cambios detectados' : 'Sin cambios';
        
        this.appendTaskOutput(taskId, `${statusIcon} ${statusText}\n`);
        this.appendTaskOutput(taskId, `   Última actualización: ${result.data.lastUpdate}\n`);
        this.appendTaskOutput(taskId, `   Docentes en base: ${result.data.teachersCount}\n`);
        
        if (hasChanges) {
          this.appendTaskOutput(taskId, '   💡 Se recomienda ejecutar la sincronización\n');
        }
        
        this.setTaskStatus(taskId, hasChanges ? 'warning' : 'success');
        this.showAlert(`Verificación completada: ${statusText}`, hasChanges ? 'warning' : 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Teacher check error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async runScrapers(type = 'all') {
    if (!this.authenticated) return;

    const taskId = 'scrapers';
    if (this.runningTasks.has(taskId)) {
      this.showAlert('Los scrapers ya se están ejecutando', 'warning');
      return;
    }

    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, `🕷️ Ejecutando scrapers ${type}...\n`);

    try {
      const response = await fetch('/api/admin/run-scrapers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        },
        body: JSON.stringify({ type })
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Scrapers ejecutados exitosamente\n');
        if (result.output) {
          this.appendTaskOutput(taskId, result.output);
        }
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Scrapers ejecutados exitosamente', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
      }
    } catch (error) {
      console.error('Scrapers error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async setupAutomation() {
    if (!this.authenticated) return;

    const taskId = 'config';
    this.showTaskOutput(taskId, '⚙️ Configuración de automatización:\n\n');
    this.appendTaskOutput(taskId, '🖥️ WINDOWS:\n');
    this.appendTaskOutput(taskId, '   1. Ejecutar como Administrador:\n');
    this.appendTaskOutput(taskId, '      scripts\\setup-automation-windows.bat\n\n');
    
    this.appendTaskOutput(taskId, '🐧 LINUX/MAC:\n');
    this.appendTaskOutput(taskId, '   1. Dar permisos: chmod +x scripts/setup-automation-unix.sh\n');
    this.appendTaskOutput(taskId, '   2. Ejecutar: ./scripts/setup-automation-unix.sh\n\n');
    
    this.appendTaskOutput(taskId, '📋 TAREAS PROGRAMADAS:\n');
    this.appendTaskOutput(taskId, '   • Verificación: cada 6 horas\n');
    this.appendTaskOutput(taskId, '   • Actualización completa: diario 2:00 AM\n');
    this.appendTaskOutput(taskId, '   • Actualización inteligente: cada 2 horas\n\n');
    
    this.appendTaskOutput(taskId, '💡 Comandos disponibles:\n');
    this.appendTaskOutput(taskId, '   npm run detect-changes\n');
    this.appendTaskOutput(taskId, '   npm run auto-update\n');
    this.appendTaskOutput(taskId, '   npm run auto-update-quick\n');
    this.appendTaskOutput(taskId, '   npm run auto-check-update\n');
    
    this.showAlert('Instrucciones de configuración mostradas', 'info');
  }

  async viewLogs() {
    if (!this.authenticated) return;

    const taskId = 'config';
    this.showTaskOutput(taskId, '📋 Consultando logs del sistema...\n');

    try {
      const response = await fetch('/api/admin/logs', {
        method: 'GET',
        headers: {
          'x-admin-token': this.adminToken
        }
      });

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Logs obtenidos exitosamente\n\n');
        if (result.logs && result.logs.length > 0) {
          result.logs.forEach(log => {
            this.appendTaskOutput(taskId, `[${log.timestamp}] ${log.level}: ${log.message}\n`);
          });
        } else {
          this.appendTaskOutput(taskId, 'No hay logs disponibles\n');
        }
      } else {
        this.appendTaskOutput(taskId, `❌ Error obteniendo logs: ${result.error}\n`);
      }
    } catch (error) {
      console.error('Logs error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
    }
  }

  async viewSuggestions(userType = 'all') {
    const taskId = 'suggestions';
    const taskName = userType === 'all' ? 
      'Ver todas las sugerencias estáticas' : 
      `Ver sugerencias para ${userType}`;

    this.setTaskStatus('suggestions', 'running');
    this.showTaskOutput('suggestions', `�️ Cargando sugerencias estáticas (${userType})...\n`);

    try {
      // Obtener sugerencias del sistema estático
      const response = await fetch('/api/chat/suggestions/static', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const suggestions = result.data;
        this.appendTaskOutput('suggestions', `✅ Sugerencias cargadas exitosamente\n\n`);
        
        if (userType === 'all') {
          // Mostrar todas las categorías
          Object.keys(suggestions).forEach(category => {
            this.appendTaskOutput('suggestions', `� ${category.toUpperCase()}:\n`);
            suggestions[category].forEach((suggestion, index) => {
              this.appendTaskOutput('suggestions', `   ${index + 1}. ${suggestion.text}\n`);
            });
            this.appendTaskOutput('suggestions', '\n');
          });
        } else {
          // Mostrar categoría específica
          if (suggestions[userType]) {
            this.appendTaskOutput('suggestions', `� SUGERENCIAS PARA ${userType.toUpperCase()}:\n\n`);
            suggestions[userType].forEach((suggestion, index) => {
              this.appendTaskOutput('suggestions', `${index + 1}. ${suggestion.text}\n`);
            });
          } else {
            this.appendTaskOutput('suggestions', `⚠️ No se encontraron sugerencias para ${userType}\n`);
          }
        }
        
        this.setTaskStatus('suggestions', 'success');
        this.showAlert(`Sugerencias para ${userType} mostradas correctamente`, 'success');
      } else {
        this.appendTaskOutput('suggestions', `❌ Error obteniendo sugerencias: ${result.error}\n`);
        this.setTaskStatus('suggestions', 'error');
      }

    } catch (error) {
      console.error('View suggestions error:', error);
      this.appendTaskOutput('suggestions', `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus('suggestions', 'error');
    }
  }

  showEditSuggestionsInfo() {
    const taskId = 'suggestions';
    this.showTaskOutput('suggestions', '✏️ EDITAR SUGERENCIAS ESTÁTICAS\n\n');
    this.appendTaskOutput('suggestions', '📁 Archivo de configuración:\n');
    this.appendTaskOutput('suggestions', '   src/nlp/staticSuggestions.js\n\n');
    
    this.appendTaskOutput('suggestions', '🔧 Para modificar las sugerencias:\n');
    this.appendTaskOutput('suggestions', '   1. Editar el archivo staticSuggestions.js\n');
    this.appendTaskOutput('suggestions', '   2. Modificar las categorías según necesites\n');
    this.appendTaskOutput('suggestions', '   3. Reiniciar el servidor para aplicar cambios\n\n');
    
    this.appendTaskOutput('suggestions', '📋 Estructura actual:\n');
    this.appendTaskOutput('suggestions', '   • estudiante: Consultas académicas\n');
    this.appendTaskOutput('suggestions', '   • docente: Recursos educativos\n');
    this.appendTaskOutput('suggestions', '   • aspirante: Información de admisión\n');
    this.appendTaskOutput('suggestions', '   • todos: Consultas generales\n\n');
    
    this.appendTaskOutput('suggestions', '⚡ Ventajas del sistema actual:\n');
    this.appendTaskOutput('suggestions', '   ✅ Respuesta instantánea (0ms)\n');
    this.appendTaskOutput('suggestions', '   ✅ Sin dependencias externas\n');
    this.appendTaskOutput('suggestions', '   ✅ Sin costos de API\n');
    this.appendTaskOutput('suggestions', '   ✅ 100% confiable\n');
    
    this.showAlert('Información de edición mostrada', 'info');
  }

  showAlert(message, type = 'info') {
    // Crear alert temporal
    const alertContainer = document.querySelector('.maintenance-actions');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `automation-alert ${type}`;
    alert.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${message}`;
    
    alertContainer.insertBefore(alert, alertContainer.firstChild);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }
}

// Crear instancia global
window.maintenanceManager = new MaintenanceManager();

// Función de inicialización para el sistema de tabs
window.initMaintenance = function() {
  window.maintenanceManager.init();
};

// Auto-inicializar si estamos en la página de maintenance
document.addEventListener('DOMContentLoaded', () => {
  const maintenanceSection = document.getElementById('maintenance-section');
  if (maintenanceSection && maintenanceSection.classList.contains('active')) {
    window.initMaintenance();
  }
});
