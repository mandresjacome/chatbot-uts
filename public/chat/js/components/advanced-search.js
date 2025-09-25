/**
 * Componente UI - Búsqueda Avanzada
 * Interfaz visual para indicar cuándo se está usando búsqueda web
 */

class AdvancedSearchUI {
  
  constructor() {
    this.isActive = false;
    this.searchIndicator = null;
    this.messageContainer = null;
    this.init();
  }

  /**
   * Inicializa el componente UI
   */
  init() {
    this.createSearchIndicator();
    this.injectStyles();
  }

  /**
   * Crea el indicador visual de búsqueda
   */
  createSearchIndicator() {
    this.searchIndicator = document.createElement('div');
    this.searchIndicator.className = 'advanced-search-indicator';
    this.searchIndicator.innerHTML = `
      <div class="search-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="search-text">
        <span class="search-main">🔍 Búsqueda inteligente activa</span>
        <span class="search-sub">Consultando fuentes adicionales...</span>
      </div>
    `;

    // Ocultar por defecto
    this.searchIndicator.style.display = 'none';
  }

  /**
   * Inyecta estilos CSS del componente
   */
  injectStyles() {
    if (document.getElementById('advanced-search-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'advanced-search-styles';
    styles.textContent = `
      .advanced-search-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--bg-secondary, #f8f9fa);
        border: 1px solid var(--border-color, #dee2e6);
        border-radius: 12px;
        margin: 8px 0;
        font-size: 14px;
        transition: all 0.3s ease;
        animation: fadeInSearch 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      [data-theme="dark"] .advanced-search-indicator {
        background: var(--bg-secondary-dark, #2d2d2d);
        border-color: var(--border-color-dark, #444);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .search-spinner {
        position: relative;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .spinner-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid transparent;
        border-top-color: var(--primary-color, #007bff);
        border-radius: 50%;
        animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      }

      .spinner-ring:nth-child(2) {
        animation-delay: -0.4s;
        border-top-color: var(--secondary-color, #6c757d);
      }

      .spinner-ring:nth-child(3) {
        animation-delay: -0.8s;
        border-top-color: var(--success-color, #28a745);
      }

      [data-theme="dark"] .spinner-ring {
        border-top-color: var(--primary-color-dark, #4dabf7);
      }

      [data-theme="dark"] .spinner-ring:nth-child(2) {
        border-top-color: var(--secondary-color-dark, #adb5bd);
      }

      [data-theme="dark"] .spinner-ring:nth-child(3) {
        border-top-color: var(--success-color-dark, #51cf66);
      }

      .search-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .search-main {
        font-weight: 600;
        color: var(--text-primary, #212529);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .search-sub {
        font-size: 12px;
        color: var(--text-secondary, #6c757d);
        opacity: 0.8;
      }

      [data-theme="dark"] .search-main {
        color: var(--text-primary-dark, #f8f9fa);
      }

      [data-theme="dark"] .search-sub {
        color: var(--text-secondary-dark, #adb5bd);
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes fadeInSearch {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeOutSearch {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      /* Indicador de fuentes de información */
      .response-sources {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .source-badge {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .source-database {
        background: rgba(40, 167, 69, 0.1);
        color: var(--success-color, #28a745);
        border: 1px solid rgba(40, 167, 69, 0.3);
      }

      .source-web {
        background: rgba(0, 123, 255, 0.1);
        color: var(--primary-color, #007bff);
        border: 1px solid rgba(0, 123, 255, 0.3);
      }

      .source-hybrid {
        background: rgba(108, 117, 125, 0.1);
        color: var(--secondary-color, #6c757d);
        border: 1px solid rgba(108, 117, 125, 0.3);
      }

      [data-theme="dark"] .source-database {
        background: rgba(81, 207, 102, 0.15);
        color: var(--success-color-dark, #51cf66);
        border-color: rgba(81, 207, 102, 0.4);
      }

      [data-theme="dark"] .source-web {
        background: rgba(77, 171, 247, 0.15);
        color: var(--primary-color-dark, #4dabf7);
        border-color: rgba(77, 171, 247, 0.4);
      }

      [data-theme="dark"] .source-hybrid {
        background: rgba(173, 181, 189, 0.15);
        color: var(--secondary-color-dark, #adb5bd);
        border-color: rgba(173, 181, 189, 0.4);
      }

      /* Confianza de respuesta */
      .response-confidence {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        margin-top: 8px;
      }

      .confidence-high {
        background: rgba(40, 167, 69, 0.1);
        color: var(--success-color, #28a745);
        border: 1px solid rgba(40, 167, 69, 0.3);
      }

      .confidence-medium {
        background: rgba(255, 193, 7, 0.1);
        color: var(--warning-color, #ffc107);
        border: 1px solid rgba(255, 193, 7, 0.3);
      }

      .confidence-low {
        background: rgba(220, 53, 69, 0.1);
        color: var(--danger-color, #dc3545);
        border: 1px solid rgba(220, 53, 69, 0.3);
      }

      [data-theme="dark"] .confidence-high {
        background: rgba(81, 207, 102, 0.15);
        color: var(--success-color-dark, #51cf66);
        border-color: rgba(81, 207, 102, 0.4);
      }

      [data-theme="dark"] .confidence-medium {
        background: rgba(255, 212, 59, 0.15);
        color: var(--warning-color-dark, #ffd43b);
        border-color: rgba(255, 212, 59, 0.4);
      }

      [data-theme="dark"] .confidence-low {
        background: rgba(255, 107, 107, 0.15);
        color: var(--danger-color-dark, #ff6b6b);
        border-color: rgba(255, 107, 107, 0.4);
      }

      /* Animaciones suaves */
      .source-badge, .response-confidence {
        transition: all 0.2s ease;
      }

      .source-badge:hover, .response-confidence:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      [data-theme="dark"] .source-badge:hover, 
      [data-theme="dark"] .response-confidence:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Muestra indicador de búsqueda activa
   * @param {HTMLElement} messageContainer - Contenedor del mensaje
   * @param {string} searchQuery - Consulta de búsqueda
   */
  showSearchIndicator(messageContainer, searchQuery = '') {
    if (!messageContainer) return;

    this.messageContainer = messageContainer;
    this.isActive = true;

    // Actualizar texto si se proporciona consulta
    if (searchQuery) {
      const searchSub = this.searchIndicator.querySelector('.search-sub');
      searchSub.textContent = `Buscando información sobre: "${searchQuery}"...`;
    }

    // Insertar indicador
    this.searchIndicator.style.display = 'flex';
    messageContainer.appendChild(this.searchIndicator);
  }

  /**
   * Oculta indicador de búsqueda
   */
  hideSearchIndicator() {
    if (!this.isActive || !this.searchIndicator) return;

    this.searchIndicator.style.animation = 'fadeOutSearch 0.3s ease';
    
    setTimeout(() => {
      if (this.searchIndicator && this.searchIndicator.parentNode) {
        this.searchIndicator.parentNode.removeChild(this.searchIndicator);
      }
      this.isActive = false;
    }, 300);
  }

  /**
   * Añade indicadores de fuentes a una respuesta
   * @param {HTMLElement} messageElement - Elemento del mensaje
   * @param {Object} sources - Fuentes utilizadas
   * @param {number} confidence - Nivel de confianza
   */
  addResponseSources(messageElement, sources, confidence = 0) {
    if (!messageElement || !sources) return;

    const sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'response-sources';

    // Indicador de fuente de base de datos
    if (sources.database) {
      const dbBadge = document.createElement('div');
      dbBadge.className = 'source-badge source-database';
      dbBadge.innerHTML = '🗄️ Base de datos';
      sourcesContainer.appendChild(dbBadge);
    }

    // Indicador de búsqueda web
    if (sources.webSearch) {
      const webBadge = document.createElement('div');
      webBadge.className = 'source-badge source-web';
      webBadge.innerHTML = '🌐 Búsqueda web';
      sourcesContainer.appendChild(webBadge);
    }

    // Indicador híbrido
    if (sources.database && sources.webSearch) {
      const hybridBadge = document.createElement('div');
      hybridBadge.className = 'source-badge source-hybrid';
      hybridBadge.innerHTML = '⚡ Respuesta híbrida';
      sourcesContainer.appendChild(hybridBadge);
    }

    // Indicador de confianza
    if (confidence > 0) {
      const confidenceElement = document.createElement('div');
      confidenceElement.className = 'response-confidence';
      
      let confidenceClass, confidenceIcon, confidenceText;
      
      if (confidence >= 80) {
        confidenceClass = 'confidence-high';
        confidenceIcon = '✅';
        confidenceText = `Alta confianza (${confidence}%)`;
      } else if (confidence >= 50) {
        confidenceClass = 'confidence-medium';
        confidenceIcon = '⚠️';
        confidenceText = `Confianza media (${confidence}%)`;
      } else {
        confidenceClass = 'confidence-low';
        confidenceIcon = '❌';
        confidenceText = `Baja confianza (${confidence}%)`;
      }
      
      confidenceElement.className += ` ${confidenceClass}`;
      confidenceElement.innerHTML = `${confidenceIcon} ${confidenceText}`;
      sourcesContainer.appendChild(confidenceElement);
    }

    // Agregar al mensaje
    messageElement.appendChild(sourcesContainer);
  }

  /**
   * Actualiza el indicador durante la búsqueda
   * @param {string} status - Estado actual ('searching', 'found', 'combining')
   */
  updateSearchStatus(status) {
    if (!this.isActive || !this.searchIndicator) return;

    const searchMain = this.searchIndicator.querySelector('.search-main');
    const searchSub = this.searchIndicator.querySelector('.search-sub');

    switch (status) {
      case 'searching':
        searchMain.innerHTML = '🔍 Búsqueda inteligente activa';
        searchSub.textContent = 'Consultando fuentes web de UTS...';
        break;
      case 'found':
        searchMain.innerHTML = '📊 Información encontrada';
        searchSub.textContent = 'Procesando y combinando datos...';
        break;
      case 'combining':
        searchMain.innerHTML = '⚡ Generando respuesta híbrida';
        searchSub.textContent = 'Integrando múltiples fuentes...';
        break;
    }
  }

  /**
   * Verifica si el indicador está activo
   * @returns {boolean}
   */
  isSearchActive() {
    return this.isActive;
  }
}

// Exportar instancia singleton
const advancedSearchUI = new AdvancedSearchUI();
export default advancedSearchUI;