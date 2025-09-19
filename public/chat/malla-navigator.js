/**
 * Navegador Interactivo de Malla Curricular
 * Maneja la navegación por niveles y programas de manera visual e interactiva
 */

class MallaNavigator {
  constructor() {
    this.programaActual = 'tecnologia';
    this.nivelActual = 1;
    this.zoomLevel = 100;
    this.mallaDatos = null;
    this.isInitialized = false;
    
    // Bind de métodos para eventos
    this.cambiarPrograma = this.cambiarPrograma.bind(this);
    this.cambiarNivel = this.cambiarNivel.bind(this);
    this.maximizarMalla = this.maximizarMalla.bind(this);
    this.cerrarModal = this.cerrarModal.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
  }

  /**
   * Inicializa el navegador cargando datos y configurando eventos
   */
  async initialize() {
    try {
      await this.cargarDatosMalla();
      this.configurarEventos();
      this.renderizarMalla();
      this.isInitialized = true;
      console.log('✅ MallaNavigator inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando MallaNavigator:', error);
      this.mostrarError(error.message);
    }
  }

  /**
   * Alias para compatibilidad
   */
  async inicializar() {
    return this.initialize();
  }

  /**
   * Carga los datos de la malla desde el servidor
   */
  async cargarDatosMalla() {
    try {
      const response = await fetch('/api/malla-curricular');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        this.mallaDatos = result.data;
        console.log('📚 Datos de malla curricular cargados:', Object.keys(this.mallaDatos));
      } else {
        throw new Error('Respuesta del servidor no válida');
      }
    } catch (error) {
      console.warn('⚠️ Error cargando datos del servidor:', error.message);
      throw error;
    }
  }

  /**
   * Usa datos de fallback cuando no se pueden cargar del servidor
   */
  usarDatosFallback() {
    this.mallaDatos = {
      tecnologia: {
        nombre: "Tecnología en Desarrollo de Sistemas Informáticos",
        duracion: "6 semestres",
        creditos_total: 120,
        niveles: {
          1: {
            nombre: "Primer Nivel",
            creditos: 20,
            materias: [
              { codigo: "TDS101", nombre: "Matemáticas Básicas", creditos: 4 },
              { codigo: "TDS102", nombre: "Introducción a la Programación", creditos: 4 },
              { codigo: "TDS103", nombre: "Física I", creditos: 3 }
            ]
          }
        }
      },
      ingenieria: {
        nombre: "Ingeniería de Sistemas",
        duracion: "10 semestres", 
        creditos_total: 200,
        niveles: {
          1: {
            nombre: "Primer Nivel",
            creditos: 20,
            materias: [
              { codigo: "ING101", nombre: "Cálculo Diferencial", creditos: 4 },
              { codigo: "ING102", nombre: "Álgebra Lineal", creditos: 3 }
            ]
          }
        }
      }
    };
    this.isInitialized = true;
    console.log('📚 Usando datos de fallback para malla curricular');
  }

  /**
   * Muestra un error en el contenedor de la malla
   */
  mostrarError(mensaje) {
    const contenido = document.querySelector('.malla-content');
    if (contenido) {
      contenido.innerHTML = `
        <div class="malla-error">
          <p>❌ ${mensaje}</p>
          <button onclick="location.reload()">🔄 Reintentar</button>
        </div>
      `;
    }
  }

  /**
   * Configura los event listeners
   */
  configurarEventos() {
    // Botones de programa
    document.querySelectorAll('.program-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const programa = e.target.dataset.program;
        this.cambiarPrograma(programa);
      });
    });

    // Botones de navegación
    const btnAnterior = document.getElementById('prevLevel');
    const btnSiguiente = document.getElementById('nextLevel');
    
    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => this.cambiarNivel(-1));
    }
    
    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', () => this.cambiarNivel(1));
    }

    // Botón expandir
    const btnExpandir = document.getElementById('expandMalla');
    if (btnExpandir) {
      btnExpandir.addEventListener('click', () => this.maximizarMalla());
    }
  }

  /**
   * Renderiza la malla inicial
   */
  renderizarMalla() {
    if (!this.mallaDatos) {
      this.mostrarError('No se pudieron cargar los datos de la malla curricular');
      return;
    }
    
    console.log('🎨 Renderizando malla inicial...');
    
    // Ocultar spinner de carga
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
    
    // Mostrar contenido de la malla
    this.crearContenidoMalla();
    
    // Actualizar con datos del nivel actual
    setTimeout(() => {
      this.actualizarTarjeta();
    }, 100);
  }

  /**
   * Crea el contenido inicial de la malla
   */
  crearContenidoMalla() {
    const mallaContent = document.querySelector('.malla-content');
    if (!mallaContent) return;

    mallaContent.innerHTML = `
      <div class="nivel-info">
        <h4 class="nivel-titulo">Nivel <span id="nivel-actual">${this.nivelActual}</span> de <span id="total-niveles">${this.getMaxNivel()}</span></h4>
        <p class="nivel-creditos">${this.getNivelData()?.creditos || 0} créditos</p>
      </div>
      
      <div id="materias-container" class="materias-container">
        <ul class="materias-lista">
          <!-- Las materias se cargarán dinámicamente -->
        </ul>
      </div>
    `;
  }

  /**
   * Obtiene los datos del nivel actual
   */
  getNivelData() {
    return this.mallaDatos?.[this.programaActual]?.niveles?.[this.nivelActual];
  }

  /**
   * Configura event listeners para los elementos de la tarjeta
   */
  setupEventListeners() {
    // Botones de programa
    document.querySelectorAll('.btn-programa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.cambiarPrograma(e.target.dataset.programa);
      });
    });

    // Botones de navegación
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    
    if (btnAnterior) {
      btnAnterior.addEventListener('click', (e) => {
        e.preventDefault();
        this.cambiarNivel(-1);
      });
    }
    
    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', (e) => {
        e.preventDefault();
        this.cambiarNivel(1);
      });
    }

    // Botón maximizar
    const btnMaximizar = document.querySelector('.maximize-btn');
    if (btnMaximizar) {
      btnMaximizar.addEventListener('click', (e) => {
        e.preventDefault();
        this.maximizarMalla();
      });
    }
  }

  /**
   * Cambia el programa actual (tecnología/ingeniería)
   */
  cambiarPrograma(programa) {
    if (!this.mallaDatos || !this.mallaDatos[programa]) {
      console.warn(`Programa ${programa} no encontrado`);
      return;
    }

    this.programaActual = programa;
    this.nivelActual = 1; // Reiniciar al primer nivel
    this.actualizarTarjeta();
    this.actualizarBotonesPrograma();
    
    // Animación suave
    this.animarCambio();
    
    console.log(`📊 Cambiado a programa: ${programa}`);
  }

  /**
   * Cambia el nivel actual
   */
  cambiarNivel(direccion) {
    if (!this.mallaDatos || !this.mallaDatos[this.programaActual]) return;

    const maxNivel = this.getMaxNivel();
    const nuevoNivel = this.nivelActual + direccion;
    
    if (nuevoNivel >= 1 && nuevoNivel <= maxNivel) {
      this.nivelActual = nuevoNivel;
      this.actualizarTarjeta();
      this.animarCambio();
      
      console.log(`📈 Nivel cambiado a: ${nuevoNivel}/${maxNivel}`);
    }
  }

  /**
   * Obtiene el número máximo de niveles para el programa actual
   */
  getMaxNivel() {
    if (!this.mallaDatos || !this.mallaDatos[this.programaActual]) return 1;
    return Object.keys(this.mallaDatos[this.programaActual].niveles).length;
  }

  /**
   * Actualiza el contenido de la tarjeta
   */
  actualizarTarjeta() {
    if (!this.isInitialized) {
      console.warn('⚠️ MallaNavigator no está inicializado');
      return;
    }

    console.log(`🔄 Actualizando tarjeta - Programa: ${this.programaActual}, Nivel: ${this.nivelActual}`);
    
    const programaData = this.mallaDatos[this.programaActual];
    const nivelData = programaData?.niveles[this.nivelActual];
    
    console.log('📊 Programa data:', programaData);
    console.log('📋 Nivel data:', nivelData);
    
    if (!nivelData) {
      console.warn(`Nivel ${this.nivelActual} no encontrado para ${this.programaActual}`);
      return;
    }

    // Actualizar información del nivel
    this.actualizarInfoNivel(nivelData, programaData);
    
    // Actualizar lista de materias
    console.log('📚 Materias a mostrar:', nivelData.materias);
    this.actualizarMaterias(nivelData.materias || []);
    
    // Actualizar botones de navegación
    this.actualizarBotonesNavegacion();
    
    // Actualizar botones de programa
    this.actualizarBotonesPrograma();
  }

  /**
   * Actualiza la información del nivel actual
   */
  actualizarInfoNivel(nivelData, programaData) {
    const nivelActualSpan = document.getElementById('nivel-actual');
    const totalNivelesSpan = document.getElementById('total-niveles');
    const creditosSpan = document.querySelector('.nivel-creditos');
    
    if (nivelActualSpan) {
      nivelActualSpan.textContent = this.nivelActual;
    }
    
    if (totalNivelesSpan) {
      totalNivelesSpan.textContent = this.getMaxNivel();
    }
    
    if (creditosSpan) {
      creditosSpan.textContent = `${nivelData.creditos || 0} créditos`;
    }
  }

  /**
   * Actualiza la lista de materias
   */
  actualizarMaterias(materias) {
    console.log('🔍 actualizarMaterias llamado con:', materias);
    
    const materiasContainer = document.getElementById('materias-container');
    if (!materiasContainer) {
      console.error('❌ No se encontró materias-container');
      return;
    }

    const materiasLista = materiasContainer.querySelector('.materias-lista') || 
                         materiasContainer.querySelector('ul') ||
                         materiasContainer;
    
    console.log('📋 materiasLista encontrada:', materiasLista);

    if (!materias || materias.length === 0) {
      console.warn('⚠️ No hay materias para mostrar');
      materiasLista.innerHTML = '<li class="materia-item">No hay materias disponibles</li>';
      return;
    }

    const materiasHTML = materias.map((materia, index) => {
      const nombre = materia.nombre || materia;
      const creditos = materia.creditos || 0;
      const codigo = materia.codigo || `MAT${index + 1}`;
      
      return `
        <li class="materia-item">
          <div class="materia-info">
            <span class="materia-codigo">${codigo}</span>
            <span class="materia-nombre">${nombre}</span>
          </div>
          <span class="materia-creditos">${creditos}cr</span>
        </li>
      `;
    }).join('');

    materiasLista.innerHTML = materiasHTML;
  }

  /**
   * Actualiza el estado de los botones de navegación
   */
  actualizarBotonesNavegacion() {
    const btnAnterior = document.getElementById('prevLevel');
    const btnSiguiente = document.getElementById('nextLevel');
    const levelIndicator = document.querySelector('.level-indicator');
    const maxNivel = this.getMaxNivel();
    
    if (btnAnterior) {
      btnAnterior.disabled = this.nivelActual <= 1;
    }
    
    if (btnSiguiente) {
      btnSiguiente.disabled = this.nivelActual >= maxNivel;
    }
    
    if (levelIndicator) {
      levelIndicator.textContent = `Nivel ${this.nivelActual}`;
    }
  }

  /**
   * Actualiza el estado activo de los botones de programa
   */
  actualizarBotonesPrograma() {
    document.querySelectorAll('.program-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.program === this.programaActual);
    });
  }

  /**
   * Añade animación suave a los cambios
   */
  animarCambio() {
    const materiasContainer = document.getElementById('materias-container');
    if (materiasContainer) {
      materiasContainer.style.transform = 'translateY(10px)';
      materiasContainer.style.opacity = '0.7';
      
      setTimeout(() => {
        materiasContainer.style.transform = 'translateY(0)';
        materiasContainer.style.opacity = '1';
        materiasContainer.style.transition = 'all 0.3s ease';
      }, 100);
    }
  }

  /**
   * Maximiza la malla mostrando el modal completo
   */
  maximizarMalla() {
    const modal = document.getElementById('malla-modal');
    if (!modal) {
      this.crearModal();
      return;
    }
    
    modal.classList.remove('hidden');
    this.generarVistaCompleta();
    document.body.style.overflow = 'hidden';
    
    console.log('🔍 Modal de malla maximizado');
  }

  /**
   * Crea el modal si no existe
   */
  crearModal() {
    const modalHTML = `
      <div id="malla-modal" class="malla-modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>🎓 Malla Curricular Completa</h2>
            <div class="modal-controls">
              <button class="modal-control-btn" onclick="window.mallaNav.zoomOut()">🔍−</button>
              <span id="zoom-level">100%</span>
              <button class="modal-control-btn" onclick="window.mallaNav.zoomIn()">🔍+</button>
              <button class="modal-control-btn" onclick="window.mallaNav.cerrarModal()">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="malla-completa" id="malla-zoom-container">
              <div class="programa-tabs">
                <button class="tab-btn active" data-programa="tecnologia">Tecnología (6 niveles)</button>
                <button class="tab-btn" data-programa="ingenieria">Ingeniería (10 niveles)</button>
              </div>
              <div class="niveles-grid" id="niveles-grid"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos del modal
    this.setupModalEvents();
    
    // Mostrar modal
    setTimeout(() => this.maximizarMalla(), 100);
  }

  /**
   * Configura eventos específicos del modal
   */
  setupModalEvents() {
    // Cerrar con backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', this.cerrarModal);
    }

    // Tabs de programa en modal
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.cambiarProgramaModal(e.target.dataset.programa);
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cerrarModal();
      }
    });
  }

  /**
   * Cambia programa en el modal
   */
  cambiarProgramaModal(programa) {
    this.programaActual = programa;
    this.actualizarTabsModal();
    this.generarVistaCompleta();
  }

  /**
   * Actualiza tabs activos en el modal
   */
  actualizarTabsModal() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.programa === this.programaActual);
    });
  }

  /**
   * Cierra el modal
   */
  cerrarModal() {
    const modal = document.getElementById('malla-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
      this.zoomLevel = 100;
      this.actualizarZoom();
      
      console.log('❌ Modal de malla cerrado');
    }
  }

  /**
   * Genera la vista completa de la malla en el modal
   */
  generarVistaCompleta() {
    const nivelesGrid = document.getElementById('niveles-grid');
    if (!nivelesGrid || !this.mallaDatos) return;

    const programaData = this.mallaDatos[this.programaActual];
    if (!programaData) return;

    const niveles = Object.keys(programaData.niveles).sort((a, b) => parseInt(a) - parseInt(b));
    
    let html = '';
    niveles.forEach(nivel => {
      const nivelData = programaData.niveles[nivel];
      const materias = nivelData.materias || [];
      
      html += `
        <div class="nivel-card">
          <h3>📊 ${nivelData.nombre || `Nivel ${nivel}`}</h3>
          <div class="nivel-creditos-modal">${nivelData.creditos || 0} créditos</div>
          <ul class="nivel-materias">
            ${materias.map(materia => `
              <li>
                <span class="materia-codigo">${materia.codigo || ''}</span>
                ${materia.nombre || materia}
                <strong>${materia.creditos || 0}cr</strong>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });
    
    nivelesGrid.innerHTML = html;
  }

  /**
   * Aumenta el zoom del modal
   */
  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 20, 200);
    this.actualizarZoom();
  }

  /**
   * Disminuye el zoom del modal
   */
  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 20, 50);
    this.actualizarZoom();
  }

  /**
   * Actualiza el nivel de zoom visual
   */
  actualizarZoom() {
    const container = document.getElementById('malla-zoom-container');
    const zoomLevelSpan = document.getElementById('zoom-level');
    
    if (container) {
      container.style.transform = `scale(${this.zoomLevel / 100})`;
    }
    
    if (zoomLevelSpan) {
      zoomLevelSpan.textContent = `${this.zoomLevel}%`;
    }
  }

  /**
   * Obtiene el estado actual para persistencia
   */
  getState() {
    return {
      programa: this.programaActual,
      nivel: this.nivelActual,
      zoom: this.zoomLevel
    };
  }

  /**
   * Restaura un estado previo
   */
  setState(state) {
    if (state.programa) this.programaActual = state.programa;
    if (state.nivel) this.nivelActual = state.nivel;
    if (state.zoom) this.zoomLevel = state.zoom;
    
    this.actualizarTarjeta();
  }
}

// ===== FUNCIONES GLOBALES =====

/**
 * Instancia global del navegador de malla
 */
let mallaNavigatorInstance = null;

/**
 * Inicializa el navegador de malla curricular
 */
async function inicializarMallaNavigator() {
  if (!mallaNavigatorInstance) {
    mallaNavigatorInstance = new MallaNavigator();
    await mallaNavigatorInstance.inicializar();
    
    // Exponer globalmente para uso desde HTML
    window.mallaNav = mallaNavigatorInstance;
  }
  return mallaNavigatorInstance;
}

/**
 * Crea e inserta una nueva tarjeta de malla en el chat
 */
async function insertarTarjetaMalla() {
  // Asegurar que el navegador esté inicializado
  const navigator = await inicializarMallaNavigator();
  
  const tarjetaHTML = generarHTMLTarjeta();
  
  // Buscar el contenedor de mensajes
  const chatContainer = document.getElementById('chat') || 
                       document.querySelector('.chat') ||
                       document.querySelector('#messages') ||
                       document.querySelector('.messages');
  
  if (!chatContainer) {
    console.error('❌ No se encontró contenedor de chat');
    return;
  }

  // Crear wrapper del mensaje
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'msg bot-message';
  messageWrapper.innerHTML = `
    <div class="message-content">
      <p>🎓 Aquí tienes la malla curricular interactiva. Puedes navegar por niveles y programas:</p>
      ${tarjetaHTML}
    </div>
  `;

  // Insertar en el chat
  chatContainer.appendChild(messageWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Configurar eventos después de insertar
  setTimeout(() => {
    navigator.setupEventListeners();
    navigator.actualizarTarjeta();
  }, 100);

  console.log('✅ Tarjeta de malla insertada en el chat');
}

/**
 * Genera el HTML de la tarjeta de malla
 */
function generarHTMLTarjeta() {
  return `
    <div class="malla-card">
      <div class="malla-header">
        <h3>🎓 Malla Curricular</h3>
        <button class="maximize-btn" onclick="window.mallaNav?.maximizarMalla()">⛶</button>
      </div>
      
      <div class="malla-content">
        <div class="programa-selector">
          <button class="btn-programa active" data-programa="tecnologia">📱 Tecnología</button>
          <button class="btn-programa" data-programa="ingenieria">⚙️ Ingeniería</button>
        </div>
        
        <div class="nivel-info">
          <h4>📊 Nivel <span id="nivel-actual">1</span> de <span id="total-niveles">6</span></h4>
          <div class="nivel-creditos">20 créditos</div>
        </div>
        
        <div class="materias-container" id="materias-container">
          <ul class="materias-lista">
            <li class="materia-item">
              <div class="materia-info">
                <span class="materia-codigo">TDS101</span>
                <span class="materia-nombre">Matemáticas Básicas</span>
              </div>
              <span class="materia-creditos">4cr</span>
            </li>
            <li class="materia-item">
              <div class="materia-info">
                <span class="materia-codigo">TDS102</span>
                <span class="materia-nombre">Introducción a la Programación</span>
              </div>
              <span class="materia-creditos">4cr</span>
            </li>
          </ul>
        </div>
        
        <div class="navegacion-botones">
          <button id="btn-anterior" class="nav-btn" disabled>⬅️ Anterior</button>
          <button id="btn-siguiente" class="nav-btn">Siguiente ➡️</button>
        </div>
      </div>
    </div>
  `;
}

// ===== EXPORTAR PARA USO EXTERNO =====

// Para uso como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MallaNavigator,
    inicializarMallaNavigator,
    insertarTarjetaMalla,
    generarHTMLTarjeta
  };
}

// Para uso en el navegador
if (typeof window !== 'undefined') {
  window.MallaNavigator = MallaNavigator;
  window.inicializarMallaNavigator = inicializarMallaNavigator;
  window.insertarTarjetaMalla = insertarTarjetaMalla;
  window.generarHTMLTarjeta = generarHTMLTarjeta;
}

console.log('📚 Malla Navigator cargado correctamente');