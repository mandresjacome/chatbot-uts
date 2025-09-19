/**
 * Versión simplificada del MallaNavigator para debugging
 */

class SimpleMallaNavigator {
  constructor() {
    this.data = null;
    console.log('🔧 SimpleMallaNavigator creado');
  }

  async initialize() {
    console.log('🔄 Inicializando SimpleMallaNavigator...');
    
    try {
      // Probar carga de datos
      await this.loadData();
      
      // Renderizar interfaz simple
      this.render();
      
      console.log('✅ SimpleMallaNavigator inicializado correctamente');
    } catch (error) {
      console.error('❌ Error en SimpleMallaNavigator:', error);
      this.showError(error.message);
    }
  }

  async loadData() {
    console.log('📡 Cargando datos de API...');
    
    const response = await fetch('/api/malla-curricular');
    console.log('📡 Respuesta API:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📚 Datos recibidos:', result);
    
    if (!result.success || !result.data) {
      throw new Error('Respuesta de API inválida');
    }
    
    this.data = result.data;
    console.log('✅ Datos cargados. Programas:', Object.keys(this.data));
  }

  render() {
    const container = document.querySelector('.malla-content');
    if (!container) {
      console.error('❌ No se encontró contenedor .malla-content');
      return;
    }

    // Ocultar spinner
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }

    // Mostrar datos básicos
    container.innerHTML = `
      <div class="simple-malla">
        <h4>✅ Malla cargada correctamente</h4>
        <p><strong>Programas disponibles:</strong></p>
        <ul>
          ${Object.entries(this.data).map(([key, programa]) => 
            `<li><strong>${key}:</strong> ${programa.nombre} (${programa.duracion})</li>`
          ).join('')}
        </ul>
        <p><em>Navegación completa en desarrollo...</em></p>
      </div>
    `;

    console.log('🎨 Interfaz renderizada');
  }

  showError(message) {
    const container = document.querySelector('.malla-content');
    if (!container) return;

    container.innerHTML = `
      <div class="malla-error">
        <p>❌ Error: ${message}</p>
        <button onclick="location.reload()">🔄 Recargar</button>
      </div>
    `;
  }
}

// Exportar globalmente
window.SimpleMallaNavigator = SimpleMallaNavigator;
console.log('📚 SimpleMallaNavigator cargado');