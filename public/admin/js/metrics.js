// Metrics JS - Funcionalidad para la sección de métricas

class MetricsManager {
  constructor() {
    this.initialized = false;
    this.refreshButton = null;
    this.intervals = [];
  }

  init() {
    if (this.initialized) return;
    
    this.refreshButton = document.getElementById('refreshMetrics');
    this.bindEvents();
    this.loadMetrics();
    this.startAutoRefresh();
    this.initialized = true;
  }

  bindEvents() {
    if (this.refreshButton) {
      this.refreshButton.addEventListener('click', () => {
        this.loadMetrics(true);
      });
    }
  }

  async loadMetrics(showLoading = false) {
    if (showLoading && this.refreshButton) {
      this.refreshButton.disabled = true;
      this.refreshButton.innerHTML = '🔄 Cargando...';
    }

    try {
      const response = await fetch('/api/admin/metrics');
      const result = await response.json();

      if (result.success) {
        this.updateMetricsDisplay(result.data);
        this.updateConversationsTable(result.data.lastConversations);
      } else {
        console.error('Error loading metrics:', result.error);
        this.showError('Error al cargar métricas');
      }
    } catch (error) {
      console.error('Network error loading metrics:', error);
      this.showError('Error de conexión');
    } finally {
      if (showLoading && this.refreshButton) {
        this.refreshButton.disabled = false;
        this.refreshButton.innerHTML = '🔄 Actualizar';
      }
    }
  }

  updateMetricsDisplay(data) {
    // Total de conversaciones
    const totalElement = document.getElementById('totalConversations');
    if (totalElement) {
      this.animateNumber(totalElement, data.totalConversations || 0);
    }

    // Estadísticas de feedback
    if (data.feedback) {
      const { total, positive, negative, satisfactionRate } = data.feedback;
      
      // Total de feedback
      const feedbackTotalElement = document.getElementById('feedbackTotal');
      if (feedbackTotalElement) {
        this.animateNumber(feedbackTotalElement, total || 0);
      }

      // Detalles de feedback
      const feedbackDetailsElement = document.getElementById('feedbackDetails');
      if (feedbackDetailsElement) {
        feedbackDetailsElement.textContent = `${positive || 0} positivos, ${negative || 0} negativos`;
      }

      // Tasa de satisfacción
      const satisfactionElement = document.getElementById('satisfactionRate');
      const satisfactionBar = document.getElementById('satisfactionBar');
      
      if (satisfactionElement && satisfactionBar) {
        const rate = satisfactionRate || 0;
        this.animateNumber(satisfactionElement, rate, '%');
        this.animateProgressBar(satisfactionBar, rate);
      }
    }

    // Modelo de IA (extraer del primer elemento de conversaciones si existe)
    const modelElement = document.getElementById('modelName');
    if (modelElement && data.lastConversations && data.lastConversations.length > 0) {
      const firstConv = data.lastConversations[0];
      if (firstConv.meta && firstConv.meta.model) {
        modelElement.textContent = firstConv.meta.model;
      } else {
        modelElement.textContent = 'Gemini Pro';
      }
    }
  }

  updateConversationsTable(conversations) {
    const tableBody = document.getElementById('recentConversationsTable');
    if (!tableBody) return;

    if (!conversations || conversations.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay conversaciones recientes</td></tr>';
      return;
    }

    const rows = conversations.map(conv => {
      const date = new Date(conv.created_at).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const responsePreview = this.truncateText(conv.response_text || 'Sin respuesta', 100);
      const questionPreview = this.truncateText(conv.question || 'Sin pregunta', 80);

      return `
        <tr>
          <td class="metric-id">#${conv.id}</td>
          <td>${this.escapeHtml(conv.user_id || 'Anónimo')}</td>
          <td title="${this.escapeHtml(conv.question || '')}">${this.escapeHtml(questionPreview)}</td>
          <td title="${this.escapeHtml(conv.response_text || '')}">${this.escapeHtml(responsePreview)}</td>
          <td>${date}</td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = rows;
  }

  animateNumber(element, targetValue, suffix = '') {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 segundo
    const steps = 30;
    const stepValue = (targetValue - startValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.round(startValue + (stepValue * currentStep));
      element.textContent = `${currentValue}${suffix}`;

      if (currentStep >= steps) {
        clearInterval(timer);
        element.textContent = `${targetValue}${suffix}`;
      }
    }, stepDuration);
  }

  animateProgressBar(element, targetPercentage) {
    if (!element) return;
    
    const startWidth = parseFloat(element.style.width) || 0;
    const duration = 1000;
    const steps = 30;
    const stepValue = (targetPercentage - startWidth) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentWidth = startWidth + (stepValue * currentStep);
      element.style.width = `${Math.max(0, Math.min(100, currentWidth))}%`;

      if (currentStep >= steps) {
        clearInterval(timer);
        element.style.width = `${Math.max(0, Math.min(100, targetPercentage))}%`;
      }
    }, stepDuration);
  }

  startAutoRefresh() {
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      this.loadMetrics();
    }, 30000);
    
    this.intervals.push(interval);
  }

  showError(message) {
    // Mostrar error en las métricas
    const elements = ['totalConversations', 'satisfactionRate', 'feedbackTotal', 'modelName'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = 'Error';
        element.classList.add('text-danger');
      }
    });

    // Mostrar en la tabla
    const tableBody = document.getElementById('recentConversationsTable');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${this.escapeHtml(message)}</td></tr>`;
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
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.initialized = false;
  }
}

// Crear instancia global
window.metricsManager = new MetricsManager();

// Función de inicialización para el sistema de tabs
window.initMetrics = function() {
  window.metricsManager.init();
};

// Auto-inicializar si estamos en la página de métricas
document.addEventListener('DOMContentLoaded', () => {
  const metricsSection = document.getElementById('metrics-section');
  if (metricsSection && metricsSection.classList.contains('active')) {
    window.initMetrics();
  }
});
