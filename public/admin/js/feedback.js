// Feedback JS - Funcionalidad para la sección de feedback

class FeedbackManager {
  constructor() {
    this.initialized = false;
    this.currentFilters = {
      type: 'all',
      period: 'all'
    };
    this.feedbackData = [];
  }

  init() {
    if (this.initialized) return;
    
    this.bindEvents();
    this.loadFeedback();
    this.initialized = true;
  }

  bindEvents() {
    const applyFiltersBtn = document.getElementById('applyFeedbackFilters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.applyFilters();
      });
    }

    const typeFilter = document.getElementById('feedbackType');
    const periodFilter = document.getElementById('feedbackPeriod');
    
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        this.currentFilters.type = typeFilter.value;
      });
    }

    if (periodFilter) {
      periodFilter.addEventListener('change', () => {
        this.currentFilters.period = periodFilter.value;
      });
    }
  }

  async loadFeedback() {
    try {
      const response = await fetch('/api/feedback/list');
      const result = await response.json();

      if (result.success) {
        this.feedbackData = result.data || [];
        this.displayFeedback(this.feedbackData);
        this.updateStats(this.feedbackData);
      } else {
        console.error('Error loading feedback:', result.error);
        this.showError('Error al cargar el feedback');
      }
    } catch (error) {
      console.error('Network error loading feedback:', error);
      this.showError('Error de conexión');
    }
  }

  applyFilters() {
    let filteredData = [...this.feedbackData];

    // Filtrar por tipo
    if (this.currentFilters.type !== 'all') {
      filteredData = filteredData.filter(item => {
        const isPositive = item.useful === 1 || item.useful === true;
        return this.currentFilters.type === 'positive' ? isPositive : !isPositive;
      });
    }

    // Filtrar por período
    if (this.currentFilters.period !== 'all') {
      const now = new Date();
      const filterDate = this.getFilterDate(now, this.currentFilters.period);
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= filterDate;
      });
    }

    this.displayFeedback(filteredData);
    this.updateStats(filteredData);
  }

  getFilterDate(now, period) {
    switch (period) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      default:
        return new Date(0);
    }
  }

  displayFeedback(feedbackList) {
    const container = document.getElementById('feedbackContainer');
    if (!container) return;

    if (!feedbackList || feedbackList.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }

    const feedbackHtml = feedbackList.map(item => this.createFeedbackItem(item)).join('');
    container.innerHTML = feedbackHtml;
  }

  createFeedbackItem(item) {
    const isPositive = item.useful === 1 || item.useful === true;
    const typeClass = isPositive ? 'positive' : 'negative';
    const typeIcon = isPositive ? '👍' : '👎';
    const typeText = isPositive ? 'Útil' : 'No útil';

    const date = new Date(item.created_at).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const questionPreview = this.truncateText(item.question || 'Pregunta no disponible', 200);
    const responsePreview = this.truncateText(item.response || 'Respuesta no disponible', 300);

    // Usar el formatUserType de metrics para consistencia
    const userDisplay = window.metricsManager && window.metricsManager.formatUserType 
      ? window.metricsManager.formatUserType(item.user_id)
      : this.formatUserType(item.user_id);

    return `
      <div class="feedback-item">
        <div class="feedback-header">
          <div class="feedback-type ${typeClass}">
            ${typeIcon} ${typeText}
          </div>
          <div class="feedback-date">${date}</div>
        </div>
        
        <div class="feedback-content">
          <div class="feedback-question">
            <strong>Pregunta:</strong> ${this.escapeHtml(questionPreview)}
          </div>
          <div class="feedback-response">
            <strong>Respuesta:</strong> ${this.escapeHtml(responsePreview)}
          </div>
          ${item.comment && item.comment.trim() ? `
            <div class="feedback-comment">
              <strong>Observación:</strong> "${this.escapeHtml(item.comment.trim())}"
            </div>
          ` : ''}
        </div>
        
        <div class="feedback-meta">
          <div class="feedback-user">
            <div class="feedback-user-icon">👤</div>
            <span>${userDisplay}</span>
          </div>
          <div class="feedback-vote">
            ${isPositive ? '✅ Marcado como útil' : '❌ Marcado como no útil'}
          </div>
        </div>
      </div>
    `;
  }

  updateStats(feedbackList) {
    const total = feedbackList.length;
    const positive = feedbackList.filter(item => {
      return item.useful === 1 || item.useful === true;
    }).length;
    const negative = total - positive;

    // Actualizar elementos de estadísticas
    const totalElement = document.getElementById('feedbackStatsTotal');
    const positiveElement = document.getElementById('feedbackStatsPositive');
    const negativeElement = document.getElementById('feedbackStatsNegative');

    if (totalElement) totalElement.textContent = total;
    if (positiveElement) positiveElement.textContent = positive;
    if (negativeElement) negativeElement.textContent = negative;
  }

  getEmptyState() {
    return `
      <div class="feedback-empty">
        <div class="feedback-empty-icon">�👎</div>
        <div class="feedback-empty-text">No hay votos disponibles</div>
        <div class="feedback-empty-subtitle">
          Las votaciones de utilidad de los usuarios aparecerán aquí cuando estén disponibles.
        </div>
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById('feedbackContainer');
    if (container) {
      container.innerHTML = `
        <div class="feedback-empty">
          <div class="feedback-empty-icon">⚠️</div>
          <div class="feedback-empty-text">Error al cargar feedback</div>
          <div class="feedback-empty-subtitle">${this.escapeHtml(message)}</div>
        </div>
      `;
    }

    // Limpiar stats
    ['feedbackStatsTotal', 'feedbackStatsPositive', 'feedbackStatsNegative'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = '—';
    });
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  formatUserType(userType) {
    const types = {
      'estudiante': '🎓 Estudiante',
      'docente': '👨‍🏫 Docente', 
      'aspirante': '🌟 Aspirante',
      'visitante': '👥 Visitante',
      'todos': '👥 Visitante' // todos equivale a visitante
    };
    return types[userType] || `👤 ${userType || 'Anónimo'}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    this.initialized = false;
  }
}

// Crear instancia global
window.feedbackManager = new FeedbackManager();

// Función de inicialización para el sistema de tabs
window.initFeedback = function() {
  window.feedbackManager.init();
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar siempre para que esté disponible cuando se cambie de pestaña
  window.initFeedback();
});
