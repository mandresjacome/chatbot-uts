// public/chat/js/components/suggestions.js
// Componente de preguntas sugeridas dinámicas

class SuggestionsManager {
  constructor() {
    this.currentUserType = 'todos';
    this.suggestions = [];
    this.isVisible = false;
    this.suggestionButtons = [];
  }

  /**
   * Inicializa el sistema de sugerencias
   */
  init() {
    this.createSuggestionsContainer();
    this.bindEvents();
    this.loadSuggestions();
  }

  /**
   * Crea el contenedor HTML para las sugerencias
   */
  createSuggestionsContainer() {
    // Verificar si ya existe el contenedor
    if (document.getElementById('suggestions-container')) {
      return;
    }

    // Buscar donde insertar las sugerencias
    const targetContainer = document.getElementById('suggestions-component');
    const fallbackContainer = document.querySelector('.bar'); // footer con input
    
    let insertionPoint = targetContainer || fallbackContainer;
    
    if (!insertionPoint) {
      console.warn('No se encontró lugar para insertar las sugerencias');
      return;
    }

    // Crear contenedor de sugerencias
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions-container';
    suggestionsContainer.className = 'suggestions-container';
    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">
        <h4 class="suggestions-title">
          <span class="suggestions-icon">💡</span>
          Preguntas sugeridas
        </h4>
        <button class="suggestions-toggle" title="Ocultar sugerencias">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="suggestions-content">
        <div class="suggestions-loading">
          <div class="loading-spinner"></div>
          <span>Generando sugerencias personalizadas...</span>
        </div>
        <div class="suggestions-list"></div>
        <div class="suggestions-error hidden">
          <span class="error-icon">⚠️</span>
          <span class="error-text">No se pudieron cargar las sugerencias</span>
          <button class="suggestions-retry">Reintentar</button>
        </div>
      </div>
    `;

    // Insertar en el lugar correcto
    if (targetContainer) {
      // Si existe el contenedor específico, usarlo
      targetContainer.appendChild(suggestionsContainer);
    } else {
      // Si no, insertar antes del input de chat
      fallbackContainer.parentNode.insertBefore(suggestionsContainer, fallbackContainer);
    }
    
    console.log('✅ Contenedor de sugerencias creado e insertado');
  }

  /**
   * Conecta eventos del componente
   */
  bindEvents() {
    // Toggle visibility
    const toggleBtn = document.querySelector('.suggestions-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleVisibility());
    }

    // Retry button
    const retryBtn = document.querySelector('.suggestions-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadSuggestions(true));
    }

    // Escuchar cambios de usuario
    document.addEventListener('userTypeChanged', (event) => {
      this.updateUserType(event.detail.userType);
    });
  }

  /**
   * Actualiza el tipo de usuario y recarga sugerencias
   */
  updateUserType(newUserType) {
    if (this.currentUserType !== newUserType) {
      console.log(`🔄 Cambiando sugerencias de ${this.currentUserType} a ${newUserType}`);
      this.currentUserType = newUserType;
      this.loadSuggestions();
      
      // Actualizar título
      this.updateTitle();
    }
  }

  /**
   * Actualiza el título según el tipo de usuario
   */
  updateTitle() {
    const titleElement = document.querySelector('.suggestions-title');
    if (!titleElement) return;

    const userTypeNames = {
      'aspirante': 'Aspirante',
      'estudiante': 'Estudiante', 
      'docente': 'Docente',
      'todos': 'General'
    };

    const userTypeName = userTypeNames[this.currentUserType] || 'General';
    titleElement.innerHTML = `
      <span class="suggestions-icon">💡</span>
      Preguntas sugeridas - ${userTypeName}
    `;
  }

  /**
   * Carga sugerencias desde la API
   */
  async loadSuggestions(forceRefresh = false) {
    const container = document.getElementById('suggestions-container');
    if (!container) return;

    const loadingElement = container.querySelector('.suggestions-loading');
    const listElement = container.querySelector('.suggestions-list');
    const errorElement = container.querySelector('.suggestions-error');

    // Mostrar loading
    loadingElement?.classList.remove('hidden');
    listElement?.classList.add('hidden');
    errorElement?.classList.add('hidden');

    try {
      const url = `/api/suggestions?userType=${this.currentUserType}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Respuesta inválida de la API');
      }

      this.suggestions = data.data.suggestions || [];
      this.renderSuggestions();
      
      console.log(`✅ Cargadas ${this.suggestions.length} sugerencias para ${this.currentUserType}`);
      
      // Mostrar contenedor si hay sugerencias
      if (this.suggestions.length > 0) {
        this.show();
      }

    } catch (error) {
      console.error('❌ Error cargando sugerencias:', error);
      this.showError();
    } finally {
      loadingElement?.classList.add('hidden');
    }
  }

  /**
   * Renderiza las sugerencias en el DOM
   */
  renderSuggestions() {
    const listElement = document.querySelector('.suggestions-list');
    if (!listElement) return;

    // Limpiar sugerencias anteriores
    listElement.innerHTML = '';
    this.suggestionButtons = [];

    if (this.suggestions.length === 0) {
      listElement.innerHTML = `
        <div class="suggestions-empty">
          <span class="empty-icon">🤔</span>
          <span>No hay sugerencias disponibles</span>
        </div>
      `;
      listElement.classList.remove('hidden');
      return;
    }

    // Crear botones de sugerencia
    this.suggestions.forEach((suggestion, index) => {
      const suggestionButton = document.createElement('button');
      suggestionButton.className = 'suggestion-btn';
      suggestionButton.setAttribute('data-question', suggestion.question);
      suggestionButton.innerHTML = `
        <span class="suggestion-text">${suggestion.question}</span>
        ${suggestion.basedOnContent ? 
          '<span class="suggestion-badge">Basado en contenido</span>' : 
          '<span class="suggestion-badge fallback">Predefinido</span>'
        }
      `;

      // Agregar evento click
      suggestionButton.addEventListener('click', () => {
        this.selectSuggestion(suggestion.question);
      });

      listElement.appendChild(suggestionButton);
      this.suggestionButtons.push(suggestionButton);
    });

    listElement.classList.remove('hidden');
  }

  /**
   * Maneja la selección de una sugerencia
   */
  selectSuggestion(question) {
    console.log('🎯 Sugerencia seleccionada:', question);
    
    // Usar la función global sendSuggestion definida en chat.js
    if (typeof window.sendSuggestion === 'function') {
      window.sendSuggestion(question);
      this.hide();
      return;
    }
    
    // Fallback: buscar el textarea por su ID real
    const chatInput = document.querySelector('#msg');
    const sendButton = document.querySelector('#send');
    
    if (chatInput && sendButton) {
      chatInput.value = question;
      chatInput.focus();
      
      // Disparar evento de input para que el chat lo procese
      const inputEvent = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(inputEvent);
      
      // Enviar automáticamente
      setTimeout(() => sendButton.click(), 100);
    } else {
      console.warn('No se pudo enviar la sugerencia - elementos no encontrados');
    }

    // Ocultar sugerencias después de seleccionar
    this.hide();
  }

  /**
   * Envía automáticamente la pregunta seleccionada
   */
  autoSubmit() {
    const sendButton = document.querySelector('#send');
    if (sendButton && !sendButton.disabled) {
      sendButton.click();
    } else {
      console.warn('Botón de envío no disponible');
    }
  }

  /**
   * Muestra error en la carga
   */
  showError() {
    const errorElement = document.querySelector('.suggestions-error');
    const listElement = document.querySelector('.suggestions-list');
    
    if (errorElement) errorElement.classList.remove('hidden');
    if (listElement) listElement.classList.add('hidden');
  }

  /**
   * Muestra el contenedor de sugerencias
   */
  show() {
    const container = document.getElementById('suggestions-container');
    if (container) {
      container.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  /**
   * Oculta el contenedor de sugerencias
   */
  hide() {
    const container = document.getElementById('suggestions-container');
    if (container) {
      container.classList.add('hidden');
      this.isVisible = false;
    }
  }

  /**
   * Alterna la visibilidad de las sugerencias
   */
  toggleVisibility() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Refresca las sugerencias forzando regeneración
   */
  async refreshSuggestions() {
    try {
      // Llamar al endpoint de refresh
      await fetch('/api/suggestions/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userType: this.currentUserType })
      });

      // Recargar sugerencias
      await this.loadSuggestions();
      
    } catch (error) {
      console.error('❌ Error refrescando sugerencias:', error);
    }
  }

  /**
   * Limpia el componente
   */
  destroy() {
    const container = document.getElementById('suggestions-container');
    if (container) {
      container.remove();
    }
    this.suggestions = [];
    this.suggestionButtons = [];
  }
}

// Crear instancia global
window.suggestionsManager = new SuggestionsManager();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.suggestionsManager) {
    window.suggestionsManager.init();
  }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuggestionsManager;
}