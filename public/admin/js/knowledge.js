// Knowledge JS - Funcionalidad para la sección de base de conocimiento

class KnowledgeManager {
  constructor() {
    this.initialized = false;
    this.knowledgeData = [];
    this.filteredData = [];
    this.currentSearch = '';
  }

  init() {
    if (this.initialized) return;
    
    this.bindEvents();
    this.loadKnowledge();
    this.initialized = true;
  }

  bindEvents() {
    const refreshBtn = document.getElementById('refreshKnowledge');
    const searchBtn = document.getElementById('kbSearchBtn');
    const clearBtn = document.getElementById('kbClearSearch');
    const searchInput = document.getElementById('kbSearchInput');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadKnowledge(true);
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });

      searchInput.addEventListener('input', (e) => {
        if (e.target.value === '') {
          this.clearSearch();
        }
      });
    }
  }

  async loadKnowledge(showLoading = false) {
    const refreshBtn = document.getElementById('refreshKnowledge');
    
    if (showLoading && refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '🔄 Cargando...';
    }

    try {
      const params = new URLSearchParams({
        q: this.currentSearch,
        page: '1',
        size: '100'
      });
      
      const response = await fetch(`/api/admin/knowledge?${params}`);
      const result = await response.json();

      if (result.success) {
        this.knowledgeData = result.data || [];
        this.filteredData = [...this.knowledgeData];
        this.displayKnowledge();
        this.updateStats();
      } else {
        console.error('Error loading knowledge:', result.error);
        this.showError('Error al cargar la base de conocimiento');
      }
    } catch (error) {
      console.error('Network error loading knowledge:', error);
      this.showError('Error de conexión');
    } finally {
      if (showLoading && refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '🔄 Actualizar';
      }
    }
  }

  async performSearch() {
    const searchInput = document.getElementById('kbSearchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    this.currentSearch = query;

    try {
      const params = new URLSearchParams({
        q: query,
        page: '1',
        size: '100'
      });
      
      const response = await fetch(`/api/admin/knowledge?${params}`);
      const result = await response.json();

      if (result.success) {
        this.knowledgeData = result.data || [];
        this.filteredData = [...this.knowledgeData];
        this.displayKnowledge();
        this.showSearchResults();
      } else {
        console.error('Error searching knowledge:', result.error);
        this.showError('Error al buscar en la base de conocimiento');
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Error de conexión durante la búsqueda');
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('kbSearchInput');
    if (searchInput) {
      searchInput.value = '';
    }

    this.currentSearch = '';
    this.filteredData = [...this.knowledgeData];
    this.displayKnowledge();
    this.hideSearchResults();
  }

  displayKnowledge() {
    const tableBody = document.getElementById('knowledgeTable');
    if (!tableBody) return;

    if (!this.filteredData || this.filteredData.length === 0) {
      if (this.currentSearch) {
        tableBody.innerHTML = this.getNoResultsRow();
      } else {
        tableBody.innerHTML = this.getEmptyRow();
      }
      return;
    }

    const rows = this.filteredData.map(item => this.createKnowledgeRow(item)).join('');
    tableBody.innerHTML = rows;

    // Bind eventos de acciones
    this.bindRowActions();
  }

  createKnowledgeRow(item) {
    const userTypeClass = this.getUserTypeClass(item.tipo_usuario);
    const questionPreview = this.truncateText(item.pregunta || 'Sin pregunta', 50);
    const sourceStatus = this.getSourceStatus(item);
    const lastUpdate = this.formatDate(item.updated_at || item.created_at);

    return `
      <tr data-id="${item.id}">
        <td class="kb-entry-id">#${item.id}</td>
        <td class="kb-question" title="${this.escapeHtml(item.pregunta || '')}">
          ${this.escapeHtml(questionPreview)}
        </td>
        <td>
          <span class="kb-user-type ${userTypeClass}">
            ${this.escapeHtml(item.tipo_usuario || 'todos')}
          </span>
        </td>
        <td class="kb-source">
          ${sourceStatus.icon}
          ${sourceStatus.link}
        </td>
        <td class="kb-last-update">${lastUpdate}</td>
        <td class="kb-actions">
          <button class="kb-action-btn kb-view-btn" data-action="view" data-id="${item.id}">
            👁️ Ver
          </button>
          <button class="kb-action-btn kb-source-btn" data-action="source" data-id="${item.id}">
            🔗 Fuente
          </button>
        </td>
      </tr>
    `;
  }

  bindRowActions() {
    const actionButtons = document.querySelectorAll('.kb-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const id = e.target.dataset.id;
        
        if (action === 'view') {
          this.viewKnowledgeItem(id);
        } else if (action === 'source') {
          this.openSourceUrl(id);
        }
      });
    });
  }

  viewKnowledgeItem(id) {
    const item = this.knowledgeData.find(k => k.id == id);
    if (!item) return;

    this.showModal({
      title: `📚 Entrada #${item.id}`,
      content: this.createModalContent(item)
    });
  }

  createModalContent(item) {
    return `
      <div class="kb-modal-body">
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">Pregunta/Tema:</span>
          <div class="kb-modal-field-value">${this.escapeHtml(item.pregunta || 'N/A')}</div>
        </div>
        
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">Respuesta:</span>
          <div class="kb-modal-field-value">${this.escapeHtml(item.respuesta_texto || 'N/A')}</div>
        </div>
        
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">Tipo de Usuario:</span>
          <div class="kb-modal-field-value">
            <span class="kb-user-type ${this.getUserTypeClass(item.tipo_usuario)}">
              ${this.escapeHtml(item.tipo_usuario || 'todos')}
            </span>
          </div>
        </div>
        
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">Palabras Clave:</span>
          <div class="kb-modal-field-value">${this.escapeHtml(item.palabras_clave || 'N/A')}</div>
        </div>
        
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">URL Fuente:</span>
          <div class="kb-modal-field-value">
            ${item.recurso_url ? 
              `<a href="${this.escapeHtml(item.recurso_url)}" target="_blank" class="kb-source-link">
                🔗 ${this.escapeHtml(item.recurso_url)}
              </a>` : 
              'No especificada'
            }
          </div>
        </div>
        
        <div class="kb-modal-field">
          <span class="kb-modal-field-label">Última Actualización:</span>
          <div class="kb-modal-field-value">${this.formatDate(item.updated_at || item.created_at)}</div>
        </div>
      </div>
    `;
  }

  openSourceUrl(id) {
    const item = this.knowledgeData.find(k => k.id == id);
    if (!item || !item.recurso_url) {
      alert('No hay URL fuente disponible para esta entrada');
      return;
    }

    // Verificar si es una URL válida de UTS
    if (this.isUtsUrl(item.recurso_url)) {
      window.open(item.recurso_url, '_blank');
    } else {
      const confirmed = confirm(
        `⚠️ Advertencia: Esta URL no pertenece al dominio UTS.\n\nURL: ${item.recurso_url}\n\n¿Deseas continuar?`
      );
      if (confirmed) {
        window.open(item.recurso_url, '_blank');
      }
    }
  }

  isUtsUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('uts.edu.co') || 
             urlObj.hostname.includes('unitecnologica.edu.co');
    } catch {
      return false;
    }
  }

  getSourceStatus(item) {
    if (!item.recurso_url) {
      return {
        icon: '<span class="kb-source-unverified" title="Sin fuente"></span>',
        link: '<span class="text-muted">Sin fuente</span>'
      };
    }

    const isVerified = this.isUtsUrl(item.recurso_url);
    const domain = this.extractDomain(item.recurso_url);
    
    return {
      icon: isVerified ? 
        '<span class="kb-source-verified" title="Fuente UTS verificada"></span>' :
        '<span class="kb-source-unverified" title="Fuente externa"></span>',
      link: `<span class="kb-source-link" title="${this.escapeHtml(item.recurso_url)}">${this.escapeHtml(domain)}</span>`
    };
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'URL inválida';
    }
  }

  getUserTypeClass(tipo) {
    switch (tipo?.toLowerCase()) {
      case 'estudiante': return 'estudiante';
      case 'aspirante': return 'aspirante';
      case 'docente': return 'docente';
      default: return 'todos';
    }
  }

  updateStats() {
    const total = this.knowledgeData.length;
    const verified = this.knowledgeData.filter(item => 
      item.recurso_url && this.isUtsUrl(item.recurso_url)
    ).length;
    
    const lastUpdate = this.getLastUpdateDate();

    const totalElement = document.getElementById('kbTotalEntries');
    const verifiedElement = document.getElementById('kbVerifiedSources');
    const updateElement = document.getElementById('kbLastUpdate');

    if (totalElement) totalElement.textContent = total;
    if (verifiedElement) verifiedElement.textContent = verified;
    if (updateElement) updateElement.textContent = lastUpdate;
  }

  getLastUpdateDate() {
    if (!this.knowledgeData.length) return 'N/A';
    
    const dates = this.knowledgeData
      .map(item => new Date(item.updated_at || item.created_at))
      .filter(date => !isNaN(date.getTime()));
    
    if (!dates.length) return 'N/A';
    
    const lastDate = new Date(Math.max(...dates));
    return this.formatDate(lastDate);
  }

  showSearchResults() {
    const searchDiv = document.querySelector('.kb-search-results');
    if (searchDiv) {
      searchDiv.remove();
    }

    const searchContainer = document.querySelector('.kb-search');
    if (searchContainer) {
      const resultsDiv = document.createElement('div');
      resultsDiv.className = 'kb-search-results';
      resultsDiv.innerHTML = `
        Mostrando ${this.filteredData.length} de ${this.knowledgeData.length} entradas 
        para "${this.escapeHtml(this.currentSearch)}"
      `;
      searchContainer.appendChild(resultsDiv);
    }
  }

  hideSearchResults() {
    const searchDiv = document.querySelector('.kb-search-results');
    if (searchDiv) {
      searchDiv.remove();
    }
  }

  showModal({ title, content }) {
    // Remover modal existente
    const existingModal = document.querySelector('.kb-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Crear nuevo modal
    const modal = document.createElement('div');
    modal.className = 'kb-modal';
    modal.innerHTML = `
      <div class="kb-modal-content">
        <div class="kb-modal-header">
          <h3 class="kb-modal-title">${title}</h3>
          <button class="kb-modal-close">&times;</button>
        </div>
        ${content}
      </div>
    `;

    document.body.appendChild(modal);

    // Eventos del modal
    const closeBtn = modal.querySelector('.kb-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // Mostrar modal
    setTimeout(() => modal.classList.add('active'), 10);
  }

  getNoResultsRow() {
    return `
      <tr>
        <td colspan="6" class="kb-no-results">
          <div class="kb-no-results-icon">🔍</div>
          <div>No se encontraron resultados para "${this.escapeHtml(this.currentSearch)}"</div>
          <small>Intenta con otros términos de búsqueda</small>
        </td>
      </tr>
    `;
  }

  getEmptyRow() {
    return '<tr><td colspan="6" class="loading">No hay datos en la base de conocimiento</td></tr>';
  }

  showError(message) {
    const tableBody = document.getElementById('knowledgeTable');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${this.escapeHtml(message)}</td></tr>`;
    }

    // Limpiar stats
    ['kbTotalEntries', 'kbLastUpdate', 'kbVerifiedSources'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = '—';
    });
  }

  formatDate(dateInput) {
    try {
      const date = new Date(dateInput);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    const modal = document.querySelector('.kb-modal');
    if (modal) {
      modal.remove();
    }
    this.initialized = false;
  }
}

// Crear instancia global
window.knowledgeManager = new KnowledgeManager();

// Función de inicialización para el sistema de tabs
window.initKnowledge = function() {
  window.knowledgeManager.init();
};

// Auto-inicializar si estamos en la página de knowledge
document.addEventListener('DOMContentLoaded', () => {
  const knowledgeSection = document.getElementById('knowledge-section');
  if (knowledgeSection && knowledgeSection.classList.contains('active')) {
    window.initKnowledge();
  }
});
