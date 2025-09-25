/**
 * Sugerencias Flotantes - Versión Simplificada
 */
class FloatingSuggestions {
  constructor() {
    this.container = null;
    this.isExpanded = true;
    this.isVisible = false;
    this.currentType = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    
    console.log('FloatingSuggestions inicializando...');
  }

  init() {
    try {
      console.log('Iniciando FloatingSuggestions');
      
      // Crear el contenedor
      this.createContainer();
      
      // Escuchar eventos de tipo de usuario
      document.addEventListener('uts:userTypeChanged', (e) => {
        console.log('Tipo de usuario cambió:', e.detail);
        this.handleUserTypeChange(e.detail.type);
      });

      console.log('FloatingSuggestions inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando FloatingSuggestions:', error);
    }
  }

  createContainer() {
    console.log('Creando contenedor de sugerencias');
    
    const container = document.createElement('div');
    container.className = 'suggestions-container';
    container.innerHTML = `
      <div class="suggestions-header" onclick="window.floatingSuggestions.toggle()">
        <h3 class="suggestions-title">
          <span class="suggestions-icon">💡</span>
          Sugerencias Inteligentes
        </h3>
        <button class="suggestions-toggle" onclick="event.stopPropagation(); window.floatingSuggestions.toggle()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14l5-5 5 5z"/>
          </svg>
        </button>
      </div>
      <div class="suggestions-content">
        <div class="suggestions-loading">
          <div class="loading-spinner"></div>
          <span>Cargando sugerencias...</span>
        </div>
        <div class="suggestions-list"></div>
        <div class="suggestions-empty hidden">
          <div class="empty-icon">🤔</div>
          <div>No hay sugerencias disponibles</div>
        </div>
        <div class="suggestions-error hidden">
          <div class="error-icon">⚠️</div>
          <div>Error cargando sugerencias</div>
          <button class="suggestions-retry" onclick="window.floatingSuggestions.loadSuggestions()">
            Reintentar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.container = container;
    
    console.log('Contenedor creado y agregado al DOM');
  }

  show() {
    if (!this.container) {
      console.warn('No hay contenedor para mostrar');
      return;
    }
    
    console.log('Mostrando sugerencias');
    this.container.classList.add('visible');
    this.isVisible = true;
  }

  hide() {
    if (!this.container) return;
    
    console.log('Ocultando sugerencias');
    this.container.classList.remove('visible');
    this.isVisible = false;
  }

  toggle() {
    console.log('Toggle sugerencias - Estado actual:', this.isExpanded);
    
    const content = this.container?.querySelector('.suggestions-content');
    const toggle = this.container?.querySelector('.suggestions-toggle');
    
    if (!content || !toggle) {
      console.error('No se encontraron elementos para toggle');
      return;
    }

    this.isExpanded = !this.isExpanded;
    
    if (this.isExpanded) {
      // Expandir
      this.container.classList.remove('collapsed');
      content.classList.remove('collapsed');
      toggle.classList.remove('collapsed');
    } else {
      // Colapsar a botón flotante
      this.container.classList.add('collapsed');
      content.classList.add('collapsed');
      toggle.classList.add('collapsed');
    }
    
    console.log('Nuevo estado expandido:', this.isExpanded);
  }

  handleUserTypeChange(userType) {
    console.log('Procesando cambio de tipo de usuario:', userType);
    
    if (!userType || userType === 'none') {
      this.hide();
      return;
    }

    this.currentType = userType;
    this.show();
    this.loadSuggestions();
  }

  loadSuggestions() {
    console.log('Cargando sugerencias para tipo:', this.currentType);
    
    if (!this.container) {
      console.error('No hay contenedor para cargar sugerencias');
      return;
    }

    this.showLoading();

    // Usar sugerencias estáticas rápidas
    this.fetchStaticSuggestions()
      .then(suggestions => {
        this.displaySuggestions(suggestions);
      })
      .catch(error => {
        console.error('Error cargando sugerencias estáticas:', error);
        // Fallback a sugerencias locales
        const fallbackSuggestions = this.getSuggestionsForType(this.currentType);
        this.displaySuggestions(fallbackSuggestions);
      });
  }

  async fetchStaticSuggestions() {
    try {
      console.log('Solicitando sugerencias estáticas para:', this.currentType);
      
      const response = await fetch(`/api/chat/suggestions/${encodeURIComponent(this.currentType)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.suggestions) {
        console.log(`Recibidas ${data.suggestions.length} sugerencias estáticas`);
        return data.suggestions;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error en fetchStaticSuggestions:', error);
      throw error;
    }
  }

  getSuggestionsForType(type) {
    const suggestions = {
      estudiante: [
        { text: "¿Cómo consulto mis notas?", type: "popular" },
        { text: "¿Cuál es el proceso de matrícula?", type: "popular" },
        { text: "¿Dónde está la biblioteca?", type: "common" },
        { text: "¿Cómo accedo al campus virtual?", type: "popular" }
      ],
      docente: [
        { text: "¿Cómo cargo notas en el sistema?", type: "popular" },
        { text: "¿Cuáles son las fechas académicas?", type: "common" },
        { text: "¿Cómo solicito aulas virtuales?", type: "popular" }
      ],
      aspirante: [
        { text: "¿Cuáles son los requisitos de admisión?", type: "popular" },
        { text: "¿Cuándo son las inscripciones?", type: "popular" },
        { text: "¿Qué programas académicos ofrecen?", type: "common" }
      ]
    };

    return suggestions[type] || [];
  }

  showLoading() {
    const loading = this.container?.querySelector('.suggestions-loading');
    const list = this.container?.querySelector('.suggestions-list');
    const empty = this.container?.querySelector('.suggestions-empty');
    const error = this.container?.querySelector('.suggestions-error');

    if (loading) loading.classList.remove('hidden');
    if (list) list.innerHTML = '';
    if (empty) empty.classList.add('hidden');
    if (error) error.classList.add('hidden');
  }

  displaySuggestions(suggestions) {
    console.log('Mostrando', suggestions.length, 'sugerencias');
    
    const loading = this.container?.querySelector('.suggestions-loading');
    const list = this.container?.querySelector('.suggestions-list');
    const empty = this.container?.querySelector('.suggestions-empty');

    if (loading) loading.classList.add('hidden');

    if (!suggestions || suggestions.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (list) {
      list.innerHTML = suggestions.map(suggestion => `
        <button class="suggestion-btn" onclick="window.floatingSuggestions.sendSuggestion('${suggestion.text}')">
          <span class="suggestion-text">${suggestion.text}</span>
          <span class="suggestion-badge ${suggestion.type === 'popular' ? '' : 'fallback'}">
            ${suggestion.type === 'popular' ? 'Popular' : 'Común'}
          </span>
        </button>
      `).join('');
    }
  }

  sendSuggestion(text) {
    console.log('Enviando sugerencia automáticamente:', text);
    
    // Buscar el campo de entrada y el botón de envío
    const input = document.querySelector('#msg');
    const sendButton = document.querySelector('#send');
    
    if (input && sendButton) {
      // Establecer el texto en el input
      input.value = text;
      
      // Disparar eventos para activar el botón de envío
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Simular click en el botón de envío después de un pequeño delay
      setTimeout(() => {
        if (!sendButton.disabled) {
          sendButton.click();
          console.log('Mensaje enviado automáticamente');
        } else {
          console.warn('Botón de envío está deshabilitado');
        }
      }, 100);
    } else {
      console.error('No se encontraron elementos de entrada o envío');
    }
    
    // Colapsar después de seleccionar
    if (this.isExpanded) {
      this.toggle();
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

// Instancia global
let floatingSuggestions = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM listo - Inicializando FloatingSuggestions');
  floatingSuggestions = new FloatingSuggestions();
  window.floatingSuggestions = floatingSuggestions; // Hacer disponible globalmente
  floatingSuggestions.init();
});

console.log('Módulo FloatingSuggestions cargado');