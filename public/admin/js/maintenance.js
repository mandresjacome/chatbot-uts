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
    this.setupAdditionalEvents();
    this.checkSystemStatus();
    this.initialized = true;
  }

  bindEvents() {
    console.log('MaintenanceManager: Binding events...');
    
    const authenticateBtn = document.getElementById('authenticateBtn');
    const adminTokenInput = document.getElementById('adminToken');

    console.log('AuthenticateBtn found:', !!authenticateBtn);
    console.log('AdminTokenInput found:', !!adminTokenInput);

    if (authenticateBtn) {
      authenticateBtn.addEventListener('click', (e) => {
        console.log('Authenticate button clicked!');
        e.preventDefault();
        this.authenticate();
      });
    } else {
      console.warn('MaintenanceManager: authenticateBtn not found');
    }

    if (adminTokenInput) {
      adminTokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('Enter pressed in token input');
          e.preventDefault();
          this.authenticate();
        }
      });
    } else {
      console.warn('MaintenanceManager: adminTokenInput not found');
    }

    // Funcionalidad para expandir funciones específicas
    const expandBtn = document.getElementById('expandSpecificFunctions');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.toggleSpecificFunctions();
      });
    }

    // Funcionalidad para tabs de funciones
    const functionTabBtns = document.querySelectorAll('.function-tab-btn');
    functionTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-target');
        this.switchFunctionTab(target);
      });
    });
  }

  toggleSpecificFunctions() {
    const expandHeader = document.getElementById('expandSpecificFunctions');
    const content = document.getElementById('specificFunctionsContent');
    
    if (expandHeader && content) {
      expandHeader.classList.toggle('active');
      content.classList.toggle('active');
    }
  }

  switchFunctionTab(targetId) {
    // Ocultar todas las tabs
    const allContents = document.querySelectorAll('.function-tab-content');
    allContents.forEach(content => {
      content.classList.remove('active');
    });

    // Desactivar todos los botones
    const allButtons = document.querySelectorAll('.function-tab-btn');
    allButtons.forEach(btn => {
      btn.classList.remove('active');
    });

    // Activar la tab seleccionada
    const targetContent = document.getElementById(targetId);
    const targetButton = document.querySelector(`[data-target="${targetId}"]`);
    
    if (targetContent && targetButton) {
      targetContent.classList.add('active');
      targetButton.classList.add('active');
    }
  }

  setupAdditionalEvents() {
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
    this.bindButton('viewTodosBtn', () => this.viewSuggestions('todos'));
    this.bindButton('editSuggestionsBtn', () => this.showEditSuggestionsInfo());
    this.bindButton('regenerateSuggestionsBtn', () => this.regenerateSuggestionsFromDB());
    
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
    this.bindButton('autoMaintenanceBtn', () => this.runAutoMaintenance());
    this.bindButton('viewLogsBtn', () => this.viewLogs());
  }

  bindButton(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  async authenticate() {
    console.log('MaintenanceManager: authenticate() called');
    
    const tokenInput = document.getElementById('adminToken');
    const authenticateBtn = document.getElementById('authenticateBtn');
    
    if (!tokenInput || !authenticateBtn) {
      console.error('MaintenanceManager: Missing elements - tokenInput:', !!tokenInput, 'authenticateBtn:', !!authenticateBtn);
      return;
    }

    const token = tokenInput.value.trim();
    console.log('MaintenanceManager: Token entered:', token ? 'Yes' : 'No');
    
    if (!token) {
      this.showAuthError('Por favor ingresa el token de administrador');
      return;
    }

    console.log('MaintenanceManager: Sending auth request...');
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

      console.log('MaintenanceManager: Auth response status:', response.status);
      const result = await response.json();
      console.log('MaintenanceManager: Auth result:', result);

      if (result.success) {
        this.adminToken = token;
        this.authenticated = true;
        this.showMaintenanceActions();
        this.updateAuthStatus(true);
        console.log('MaintenanceManager: Authentication successful');
      } else {
        this.showAuthError(result.error || 'Token inválido');
        console.log('MaintenanceManager: Authentication failed:', result.error);
      }
    } catch (error) {
      console.error('MaintenanceManager: Authentication error:', error);
      this.showAuthError('Error de conexión');
    } finally {
      authenticateBtn.disabled = false;
      authenticateBtn.textContent = 'Autenticar';
    }
  }

  showMaintenanceActions() {
    console.log('MaintenanceManager: showMaintenanceActions() called');
    
    const authCard = document.getElementById('authenticationCard');
    const maintenanceControls = document.getElementById('maintenanceControls');

    console.log('AuthCard found:', !!authCard);
    console.log('MaintenanceControls found:', !!maintenanceControls);

    if (authCard) {
      authCard.style.display = 'none';
      console.log('MaintenanceManager: Auth card hidden');
    }
    if (maintenanceControls) {
      maintenanceControls.style.display = 'block';
      console.log('MaintenanceManager: Maintenance controls shown');
    }
  }

  updateAuthStatus(authenticated) {
    console.log('MaintenanceManager: updateAuthStatus() called with:', authenticated);
    
    const authIndicator = document.getElementById('authIndicator');
    const authText = document.getElementById('authText');
    const authStatus = document.getElementById('authStatus');

    console.log('Auth elements found - Indicator:', !!authIndicator, 'Text:', !!authText, 'Status:', !!authStatus);

    if (authenticated) {
      if (authIndicator) authIndicator.textContent = '🔓';
      if (authText) authText.textContent = 'Autenticado';
      if (authStatus) {
        authStatus.classList.add('authenticated');
        authStatus.textContent = 'Autenticado ✅';
      }
      console.log('MaintenanceManager: Auth status updated to authenticated');
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

      // También actualizar KB Records y Last Update
      this.updateKBStatus('checking');
      this.updateLastUpdateStatus('checking');

      const results = await Promise.allSettled(
        checks.map(check => 
          fetch(check.endpoint, {
            headers: check.name !== 'servidor' ? {
              'x-admin-token': this.adminToken,
              'Content-Type': 'application/json'
            } : {}
          }).then(r => ({ 
            name: check.name, 
            ok: r.ok, 
            status: r.status,
            data: r.ok ? r.json() : null
          }))
        )
      );

      results.forEach(async (result, index) => {
        const checkName = checks[index].name;
        if (result.status === 'fulfilled') {
          const status = result.value.ok ? 'online' : 'offline';
          this.updateSystemStatus(checkName, status);
        } else {
          this.updateSystemStatus(checkName, 'offline');
        }
      });

      // Obtener información adicional para KB Records
      try {
        const kbResponse = await fetch('/api/admin/kb-count', {
          headers: {
            'x-admin-token': this.adminToken,
            'Content-Type': 'application/json'
          }
        });
        
        if (kbResponse.ok) {
          const kbData = await kbResponse.json();
          const recordCount = kbData.count || 0;
          this.updateKBStatus(`${recordCount} registros`);
        } else {
          this.updateKBStatus('Error');
        }
      } catch (error) {
        this.updateKBStatus('No disponible');
      }

      // Actualizar timestamp
      this.updateLastUpdateStatus(new Date().toLocaleString('es-CO'));

    } catch (error) {
      console.error('System check error:', error);
      ['servidor', 'base de datos', 'ia'].forEach(name => {
        this.updateSystemStatus(name, 'offline');
      });
      this.updateKBStatus('Error');
      this.updateLastUpdateStatus('Error');
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

  updateKBStatus(value) {
    const element = document.getElementById('kbRecordsStatus');
    if (!element) return;

    if (value === 'checking') {
      element.textContent = '🟡 Verificando...';
      element.className = 'info-value checking';
    } else if (value === 'Error') {
      element.textContent = '🔴 Error';
      element.className = 'info-value offline';
    } else {
      element.textContent = `📚 ${value}`;
      element.className = 'info-value online';
    }
  }

  updateLastUpdateStatus(value) {
    const element = document.getElementById('lastUpdateStatus');
    if (!element) return;

    if (value === 'checking') {
      element.textContent = '🟡 Verificando...';
      element.className = 'info-value checking';
    } else if (value === 'Error') {
      element.textContent = '🔴 Error';
      element.className = 'info-value offline';
    } else {
      element.textContent = `🕒 ${value}`;
      element.className = 'info-value online';
    }
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
    try {
      // Primero obtener el estado actual
      this.showTaskOutput(taskId, '🔍 Verificando estado de automatización...\n');
      
      const statusResponse = await fetch('/api/admin/automation/status', {
        method: 'GET',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Error obteniendo estado: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (!statusData.success) {
        throw new Error(statusData.error || 'Error obteniendo estado de automatización');
      }

      const automation = statusData.automation;
      const currentStatus = automation.enabled ? 'ACTIVADA' : 'DESACTIVADA';
      const statusIcon = automation.enabled ? '🟢' : '🔴';
      
      // Mensaje principal para la secretaria
      this.appendTaskOutput(taskId, `${statusIcon} AUTOMATIZACIÓN: ${currentStatus}\n\n`);
      
      if (automation.user_friendly) {
        this.appendTaskOutput(taskId, `📋 ${automation.user_friendly.status}\n`);
        this.appendTaskOutput(taskId, `💡 ${automation.user_friendly.what_it_does}\n\n`);
        
        if (automation.enabled) {
          this.appendTaskOutput(taskId, `⏰ ${automation.user_friendly.next_check}\n`);
          this.appendTaskOutput(taskId, `✅ ${automation.user_friendly.safe_to_leave}\n\n`);
        } else {
          this.appendTaskOutput(taskId, `🔧 ${automation.user_friendly.manual_steps}\n`);
          this.appendTaskOutput(taskId, `💡 ${automation.user_friendly.recommendation}\n\n`);
        }
      }
      
      // Información técnica simple
      this.appendTaskOutput(taskId, `📊 Modo: ${automation.mode}\n`);
      
      if (automation.last_modified && automation.last_modified !== 'No disponible') {
        const lastModified = new Date(automation.last_modified).toLocaleString('es-CO');
        this.appendTaskOutput(taskId, `🕒 Última modificación: ${lastModified}\n`);
      }
      
      this.appendTaskOutput(taskId, `🌐 Sitios monitoreados: ${automation.monitoring.urls_count}\n\n`);
      
      // Mostrar controles interactivos
      this.appendTaskOutput(taskId, '🎛️ CONTROLES DE AUTOMATIZACIÓN:\n\n');
      
      if (automation.enabled) {
        this.appendTaskOutput(taskId, '⏸️ Para DESACTIVAR automatización:\n');
        this.appendTaskOutput(taskId, '   [Clic en "Desactivar Automatización"]\n\n');
        
        this.appendTaskOutput(taskId, '📋 HORARIOS ACTIVOS:\n');
        if (automation.schedules) {
          this.appendTaskOutput(taskId, `   • Detección de cambios: ${automation.schedules.change_detection}\n`);
          this.appendTaskOutput(taskId, `   • Actualización completa: ${automation.schedules.full_update}\n`);
          this.appendTaskOutput(taskId, `   • Actualización inteligente: ${automation.schedules.smart_update}\n\n`);
        }
      } else {
        this.appendTaskOutput(taskId, '▶️ Para ACTIVAR automatización:\n');
        this.appendTaskOutput(taskId, '   [Clic en "Activar Automatización"]\n\n');
      }
      
      // Agregar botones dinámicos
      this.addAutomationButtons(taskId, automation.enabled);
      
    } catch (error) {
      console.error('Error en setupAutomation:', error);
      this.appendTaskOutput(taskId, `❌ Error: ${error.message}\n\n`);
      
      // Mostrar instrucciones manuales como fallback
      this.appendTaskOutput(taskId, '📝 CONFIGURACIÓN MANUAL (FALLBACK):\n\n');
      this.appendTaskOutput(taskId, '🖥️ WINDOWS:\n');
      this.appendTaskOutput(taskId, '   1. Ejecutar como Administrador:\n');
      this.appendTaskOutput(taskId, '      scripts\\setup-automation-windows.bat\n\n');
      
      this.appendTaskOutput(taskId, '🐧 LINUX/MAC:\n');
      this.appendTaskOutput(taskId, '   1. Dar permisos: chmod +x scripts/setup-automation-unix.sh\n');
      this.appendTaskOutput(taskId, '   2. Ejecutar: ./scripts/setup-automation-unix.sh\n\n');
    }
  }

  addAutomationButtons(taskId, isEnabled) {
    const outputElement = document.getElementById('configOutput');
    if (!outputElement) return;

    // Crear contenedor para botones si no existe
    let buttonContainer = document.getElementById('automation-buttons');
    if (buttonContainer) {
      buttonContainer.remove();
    }

    buttonContainer = document.createElement('div');
    buttonContainer.id = 'automation-buttons';
    buttonContainer.className = 'automation-buttons';
    buttonContainer.style.cssText = `
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    `;

    if (isEnabled) {
      // Botón para desactivar
      const disableBtn = document.createElement('button');
      disableBtn.textContent = '⏸️ Desactivar (Todo Manual)';
      disableBtn.className = 'btn btn-warning';
      disableBtn.style.cssText = 'margin-right: 10px;';
      disableBtn.title = 'El sistema dejará de actualizarse automáticamente';
      disableBtn.onclick = () => this.toggleAutomation(false);
      buttonContainer.appendChild(disableBtn);
    } else {
      // Botón para activar
      const enableBtn = document.createElement('button');
      enableBtn.textContent = '▶️ Activar (Automático)';
      enableBtn.className = 'btn btn-success';
      enableBtn.style.cssText = 'margin-right: 10px;';
      enableBtn.title = 'El sistema se actualizará solo, sin intervención';
      enableBtn.onclick = () => this.toggleAutomation(true);
      buttonContainer.appendChild(enableBtn);
    }

    // Botón para recargar estado
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '🔄 Ver Estado Actual';
    reloadBtn.className = 'btn btn-info';
    reloadBtn.title = 'Revisar si la automatización está funcionando';
    reloadBtn.onclick = () => this.setupAutomation();
    buttonContainer.appendChild(reloadBtn);

    outputElement.appendChild(buttonContainer);
  }

  async toggleAutomation(enable) {
    if (!this.authenticated) return;

    const taskId = 'config';
    try {
      const action = enable ? 'Activando' : 'Desactivando';
      this.appendTaskOutput(taskId, `\n🔄 ${action} automatización...\n`);

      const response = await fetch('/api/admin/automation/toggle', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          enable: enable,
          mode: 'smart'
        })
      });

      if (!response.ok) {
        throw new Error(`Error en toggle: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error cambiando estado de automatización');
      }

      const statusIcon = enable ? '🟢' : '🔴';
      const status = enable ? 'ACTIVADA' : 'DESACTIVADA';
      
      this.appendTaskOutput(taskId, `${statusIcon} ${data.message}\n`);
      
      // Mostrar información amigable para la secretaria
      if (data.user_friendly) {
        this.appendTaskOutput(taskId, `\n� ${data.user_friendly.status}\n`);
        this.appendTaskOutput(taskId, `💡 ${data.user_friendly.what_it_does}\n`);
        
        if (enable) {
          this.appendTaskOutput(taskId, `⏰ ${data.user_friendly.next_check}\n`);
          this.appendTaskOutput(taskId, `✅ ${data.user_friendly.safe_to_leave}\n`);
        } else {
          this.appendTaskOutput(taskId, `🔧 ${data.user_friendly.manual_steps}\n`);
          this.appendTaskOutput(taskId, `💡 ${data.user_friendly.recommendation}\n`);
        }
      }
      
      this.appendTaskOutput(taskId, `\n📊 Modo: ${data.mode}\n`);
      this.appendTaskOutput(taskId, `🕒 Cambio realizado: ${new Date(data.timestamp).toLocaleString('es-CO')}\n`);
      
      // Mostrar tareas activas de forma simple
      if (enable && data.active_tasks) {
        this.appendTaskOutput(taskId, '\n📋 TAREAS PROGRAMADAS:\n');
        data.active_tasks.forEach(task => {
          const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
          this.appendTaskOutput(taskId, `   ${priority} ${task.name}\n`);
          this.appendTaskOutput(taskId, `      ⏰ ${task.frequency}\n`);
        });
      }
      
      // Recargar la interfaz
      setTimeout(() => this.setupAutomation(), 1000);
      
      this.showAlert(`Automatización ${status.toLowerCase()} correctamente`, 'success');
      
    } catch (error) {
      console.error('Error en toggleAutomation:', error);
      this.appendTaskOutput(taskId, `❌ Error: ${error.message}\n`);
      this.showAlert('Error cambiando estado de automatización', 'error');
    }
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
      const response = await fetch('/api/chat/suggestions/admin/static', {
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

  async regenerateSuggestionsFromDB() {
    const taskId = 'suggestions';
    this.setTaskStatus(taskId, 'running');
    this.showTaskOutput(taskId, '🔄 Regenerando sugerencias desde la base de datos...\n\n');

    try {
      // Llamar al endpoint para regenerar sugerencias
      const response = await fetch('/api/admin/suggestions/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        this.appendTaskOutput(taskId, '✅ Análisis de base de datos completado\n');
        this.appendTaskOutput(taskId, `📊 Consultas analizadas: ${result.stats.totalQueries}\n`);
        this.appendTaskOutput(taskId, `🎯 Sugerencias generadas: ${result.stats.totalSuggestions}\n\n`);
        
        // Mostrar estadísticas por categoría
        Object.entries(result.stats.byCategory).forEach(([category, count]) => {
          this.appendTaskOutput(taskId, `   • ${category}: ${count} sugerencias\n`);
        });
        
        this.appendTaskOutput(taskId, `\n💾 Archivo actualizado: ${result.filePath}\n`);
        this.appendTaskOutput(taskId, '🔄 Reinicia el servidor para aplicar los cambios\n');
        
        this.setTaskStatus(taskId, 'success');
        this.showAlert('Sugerencias regeneradas exitosamente desde la base de datos', 'success');
      } else {
        this.appendTaskOutput(taskId, `❌ Error: ${result.error}\n`);
        this.setTaskStatus(taskId, 'error');
        this.showAlert(`Error: ${result.error}`, 'error');
      }

    } catch (error) {
      console.error('Regenerate suggestions error:', error);
      this.appendTaskOutput(taskId, `❌ Error de conexión: ${error.message}\n`);
      this.setTaskStatus(taskId, 'error');
      this.showAlert('Error al regenerar sugerencias', 'error');
    }
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

  // Inicializar botón de automatización
  async initAutomationButton() {
    try {
      const response = await fetch('/api/admin/automation/status', {
        method: 'GET',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.updateAutomationButton(data.automation.enabled);
        }
      }
    } catch (error) {
      console.log('No se pudo verificar estado de automatización:', error);
    }
  }

  // Actualizar botón de automatización
  updateAutomationButton(isEnabled) {
    const toggleBtn = document.getElementById('toggleAutomationBtn');
    const toggleText = document.getElementById('toggleAutomationText');
    
    if (!toggleBtn || !toggleText) return;

    toggleBtn.style.display = 'inline-flex';
    
    if (isEnabled) {
      toggleBtn.className = 'btn btn-warning';
      toggleText.textContent = 'Desactivar Automático';
      toggleBtn.title = 'El sistema está funcionando automáticamente. Clic para desactivar.';
    } else {
      toggleBtn.className = 'btn btn-success';
      toggleText.textContent = 'Activar Automático';  
      toggleBtn.title = 'El sistema está en modo manual. Clic para activar automático.';
    }
  }

  // Toggle rápido de automatización
  async quickToggleAutomation() {
    if (!this.authenticated) {
      this.showAlert('Debe autenticarse primero', 'error');
      return;
    }

    try {
      // Obtener estado actual
      const statusResponse = await fetch('/api/admin/automation/status', {
        method: 'GET',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        throw new Error('No se pudo obtener el estado actual');
      }

      const statusData = await statusResponse.json();
      const currentState = statusData.automation.enabled;
      const newState = !currentState;

      // Cambiar estado
      const toggleResponse = await fetch('/api/admin/automation/toggle', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          enable: newState,
          mode: 'smart'
        })
      });

      if (!toggleResponse.ok) {
        throw new Error('Error en el cambio de estado');
      }

      const data = await toggleResponse.json();
      
      if (data.success) {
        // Actualizar botón
        this.updateAutomationButton(newState);
        
        // Mostrar mensaje amigable
        const message = newState ? 
          '✅ Automatización ACTIVADA - El sistema trabajará solo' :
          '⏸️ Automatización DESACTIVADA - Debe actualizar manualmente';
          
        this.showAlert(message, newState ? 'success' : 'warning');
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('Error en quickToggleAutomation:', error);
      this.showAlert(`Error: ${error.message}`, 'error');
    }
  }

  // Ejecutar mantenimiento automático completo
  async runAutoMaintenance() {
    if (!this.authenticated) {
      this.showAlert('Debe autenticarse primero', 'error');
      return;
    }

    const taskId = 'config';
    const btn = document.getElementById('autoMaintenanceBtn');
    
    try {
      // Deshabilitar botón durante el proceso
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-icon">⏳</span>Ejecutando...';
      }

      this.showTaskOutput(taskId, '🤖 INICIANDO MANTENIMIENTO AUTOMÁTICO\n\n');
      this.appendTaskOutput(taskId, '📋 Secuencia de tareas:\n');
      this.appendTaskOutput(taskId, '   1. 🔍 Detectar cambios\n');
      this.appendTaskOutput(taskId, '   2. 🌐 Ejecutar scrapers (si hay cambios)\n');
      this.appendTaskOutput(taskId, '   3. 📚 Recargar base de conocimiento\n');
      this.appendTaskOutput(taskId, '   4. 👥 Sincronizar docentes\n');
      this.appendTaskOutput(taskId, '   5. 🎯 Mejorar palabras clave\n\n');

      let hasChanges = false;

      // PASO 1: Detectar cambios
      this.appendTaskOutput(taskId, '🔍 PASO 1: Detectando cambios...\n');
      const changesResponse = await fetch('/api/admin/detect-changes', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (changesResponse.ok) {
        const changesData = await changesResponse.json();
        hasChanges = changesData.hasChanges;
        this.appendTaskOutput(taskId, hasChanges ? 
          '✅ Se detectaron cambios - continuando...\n\n' : 
          '✅ No hay cambios - saltando scrapers\n\n'
        );
      } else {
        this.appendTaskOutput(taskId, '⚠️ Error en detección - continuando de todas formas\n\n');
      }

      // PASO 2: Scrapers (solo si hay cambios)
      if (hasChanges) {
        this.appendTaskOutput(taskId, '🌐 PASO 2: Ejecutando scrapers...\n');
        const scrapersResponse = await fetch('/api/admin/run-scrapers', {
          method: 'POST',
          headers: {
            'x-admin-token': this.adminToken,
            'Content-Type': 'application/json'
          }
        });

        if (scrapersResponse.ok) {
          this.appendTaskOutput(taskId, '✅ Scrapers completados\n\n');
        } else {
          this.appendTaskOutput(taskId, '⚠️ Error en scrapers - continuando\n\n');
        }
      } else {
        this.appendTaskOutput(taskId, '⏭️ PASO 2: Saltando scrapers (no hay cambios)\n\n');
      }

      // PASO 3: Recargar KB
      this.appendTaskOutput(taskId, '📚 PASO 3: Recargando base de conocimiento...\n');
      const reloadResponse = await fetch('/api/admin/reload-kb', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        this.appendTaskOutput(taskId, `✅ KB recargada: ${reloadData.entries || 'N/A'} entradas\n\n`);
      } else {
        this.appendTaskOutput(taskId, '⚠️ Error recargando KB - continuando\n\n');
      }

      // PASO 4: Sincronizar docentes
      this.appendTaskOutput(taskId, '👥 PASO 4: Sincronizando docentes...\n');
      const teachersResponse = await fetch('/api/admin/sync-teachers', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        const stats = teachersData.stats || {};
        this.appendTaskOutput(taskId, `✅ Docentes: ${stats.processed || 0} procesados\n\n`);
      } else {
        this.appendTaskOutput(taskId, '⚠️ Error sincronizando docentes - continuando\n\n');
      }

      // PASO 5: Mejorar keywords
      this.appendTaskOutput(taskId, '🎯 PASO 5: Mejorando palabras clave...\n');
      const keywordsResponse = await fetch('/api/admin/improve-keywords', {
        method: 'POST',
        headers: {
          'x-admin-token': this.adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (keywordsResponse.ok) {
        this.appendTaskOutput(taskId, '✅ Keywords mejoradas\n\n');
      } else {
        this.appendTaskOutput(taskId, '⚠️ Error mejorando keywords\n\n');
      }

      // FINAL
      this.appendTaskOutput(taskId, '🎉 MANTENIMIENTO AUTOMÁTICO COMPLETADO\n');
      this.appendTaskOutput(taskId, `⏰ Tiempo: ${new Date().toLocaleString('es-CO')}\n`);
      this.appendTaskOutput(taskId, '✅ El sistema está actualizado y listo para usar\n');

      this.showAlert('✅ Mantenimiento automático completado exitosamente', 'success');

    } catch (error) {
      console.error('Error en runAutoMaintenance:', error);
      this.appendTaskOutput(taskId, `❌ Error en mantenimiento: ${error.message}\n`);
      this.showAlert('Error durante el mantenimiento automático', 'error');
    } finally {
      // Restaurar botón
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">🤖</span>Mantenimiento Automático';
      }
    }
  }
}

// Crear instancia global
window.maintenanceManager = new MaintenanceManager();

// Función de inicialización para el sistema de tabs
window.initMaintenance = function() {
  if (!window.maintenanceManager) {
    window.maintenanceManager = new MaintenanceManager();
  }
  window.maintenanceManager.init();
  return window.maintenanceManager;
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.initMaintenance();
});

// También inicializar cuando se carga la ventana por si acaso
window.addEventListener('load', () => {
  window.initMaintenance();
});
