/**
 * Navegador Interactivo de Malla Curricular
 * Maneja la navegación por niveles y programas de manera visual e interactiva
 */

class MallaNavigator {
  constructor() {
    this.nivelActual = 1;
    this.programaActual = 'programa_completo'; // Programa por defecto
    this.zoomLevel = 100;
    this.mallaDatos = null;
    this.isInitialized = false;
    this.modal = null; // Instancia del modal separado
    
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
      
      // Inicializar modal separado
      if (typeof MallaModal !== 'undefined') {
        this.modal = new MallaModal(this);
        window.mallaModal = this.modal; // Acceso global para botones
        console.log('🎯 Modal separado inicializado');
      }
      
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
        console.log('🎯 Estructura de datos recibida:', this.mallaDatos);
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
    console.log('🔧 Configurando eventos...');
    
    // Botones de programa
    const programBtns = document.querySelectorAll('.program-btn');
    console.log('📱 Botones de programa encontrados:', programBtns.length);
    
    programBtns.forEach(btn => {
      console.log('🔗 Configurando evento para:', btn.dataset.program);
      btn.addEventListener('click', (e) => {
        const programa = e.target.dataset.program;
        console.log('🔄 Cambiando a programa:', programa);
        this.cambiarPrograma(programa);
      });
    });

    // CONFIGURACIÓN LIMPIA DE NAVEGACIÓN
    this.configurarNavegacionLimpia();

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
    
    // Configurar eventos después de crear el contenido
    setTimeout(() => {
      this.configurarEventos();
      this.actualizarTarjeta();
    }, 100);
  }

  /**
   * Crea el contenido inicial de la malla
   */
  crearContenidoMalla() {
    const mallaContent = document.querySelector('.malla-content');
    if (!mallaContent) {
      console.error('❌ No se encontró .malla-content');
      return;
    }

    console.log('🏗️ Creando contenido de malla...');

    // Solo reemplazar el spinner, preservar la estructura original
    mallaContent.innerHTML = `
      <div class="nivel-info">
        <h4 class="nivel-titulo">📊 Nivel <span id="nivel-actual">I (1)</span> de <span id="total-niveles">10</span></h4>
        <div class="nivel-creditos"><strong>0 créditos</strong> • HTD: 0 • HTI: 0</div>
      </div>
      
      <div id="materias-container" class="materias-container">
        <ul class="materias-lista">
          <li class="materia-item">Cargando materias...</li>
        </ul>
      </div>
    `;

    console.log('✅ Contenido de malla creado (sin botones duplicados)');
  }

  /**
   * Obtiene los datos del nivel actual
   */
  getNivelData() {
    if (!this.mallaDatos) return null;
    return this.mallaDatos.niveles?.[this.nivelActual];
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
   * Configuración limpia de navegación - sin eventos duplicados
   */
  configurarNavegacionLimpia() {
    console.log('🧹 Configurando navegación limpia...');
    
    // Buscar botones con delay para asegurar que existen
    setTimeout(() => {
      const btnAnterior = document.getElementById('prevLevel');
      const btnSiguiente = document.getElementById('nextLevel');
      
      console.log('Botones encontrados:', {
        anterior: !!btnAnterior,
        siguiente: !!btnSiguiente
      });
      
      // REMOVER eventos existentes clonando elementos
      if (btnAnterior) {
        const nuevoAnterior = btnAnterior.cloneNode(true);
        btnAnterior.parentNode.replaceChild(nuevoAnterior, btnAnterior);
        
        nuevoAnterior.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🔙 ANTERIOR: ${this.nivelActual} → ${this.nivelActual - 1}`);
          this.cambiarNivel(-1);
        });
        console.log('✅ Botón anterior configurado correctamente');
      }
      
      if (btnSiguiente) {
        const nuevoSiguiente = btnSiguiente.cloneNode(true);
        btnSiguiente.parentNode.replaceChild(nuevoSiguiente, btnSiguiente);
        
        nuevoSiguiente.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`▶️ SIGUIENTE: ${this.nivelActual} → ${this.nivelActual + 1}`);
          this.cambiarNivel(1);
        });
        console.log('✅ Botón siguiente configurado correctamente');
      }
    }, 200);
  }

  /**
   * Cambia el nivel actual (I-X)
   */
  cambiarNivel(direccion) {
    if (!this.mallaDatos?.niveles) {
      console.warn('No hay datos de niveles disponibles');
      return;
    }

    const maxNivel = this.getMaxNivel();
    const nivelAnterior = this.nivelActual;
    const nuevoNivel = this.nivelActual + direccion;
    
    console.log(`� [CAMBIO NIVEL] ${nivelAnterior} → ${nuevoNivel} (máx: ${maxNivel})`);
    
    if (nuevoNivel >= 1 && nuevoNivel <= maxNivel) {
      this.nivelActual = nuevoNivel;
      
      console.log(`✅ nivelActual actualizado a: ${this.nivelActual}`);
      
      // Solo una actualización para evitar conflictos
      this.actualizarTarjeta();
      this.animarCambio();
      
      const nivelRomano = this.convertirARomano(nuevoNivel);
      console.log(`🎯 CAMBIO COMPLETADO: ${nivelRomano} (${nuevoNivel}/${maxNivel})`);
    } else {
      console.log(`❌ Nivel ${nuevoNivel} fuera de rango (1-${maxNivel})`);
    }
  }

  /**
   * Obtiene el número máximo de niveles (ahora son 10 niveles en total)
   */
  getMaxNivel() {
    if (!this.mallaDatos?.niveles) return 10;
    return Object.keys(this.mallaDatos.niveles).length;
  }

  /**
   * Actualiza el contenido de la tarjeta
   */
  actualizarTarjeta() {
    console.log('🎯 [DEBUG] actualizarTarjeta iniciado');
    console.log('🔍 Estado:', {
      isInitialized: this.isInitialized,
      hasMallaDatos: !!this.mallaDatos,
      nivelActual: this.nivelActual,
      containerExists: !!this.container
    });
    
    if (!this.isInitialized || !this.mallaDatos) {
      console.warn('⚠️ MallaNavigator no está inicializado o no hay datos');
      return;
    }

    // IMPORTANTE: Los niveles en mallaDatos van de 1 a 10, no de 0 a 9
    const nivelIndex = this.nivelActual; // Ya debería ser 1-10
    const nivelData = this.mallaDatos.niveles?.[nivelIndex];
    
    console.log(`🔄 Buscando nivel ${nivelIndex} en mallaDatos`);
    console.log('📋 Nivel data encontrado:', nivelData);
    console.log('�️ Claves disponibles:', Object.keys(this.mallaDatos.niveles || {}));
    
    if (!nivelData) {
      console.error(`❌ Nivel ${nivelIndex} no encontrado en datos`);
      console.log('📊 Estructura completa:', this.mallaDatos);
      return;
    }

    console.log(`✅ Datos del nivel ${nivelIndex} encontrados:`, {
      nivel_romano: nivelData.nivel_romano,
      creditos: nivelData.creditos,
      htd_total: nivelData.htd_total,
      hti_total: nivelData.hti_total,
      materias: nivelData.materias?.length || 0
    });

    // Actualizar información del nivel SIN DELAY para evitar conflictos
    this.actualizarInfoNivel(nivelData, this.mallaDatos);
    
    // Actualizar lista de materias
    console.log('📚 Actualizando materias:', nivelData.materias?.length || 0);
    this.actualizarMaterias(nivelData.materias || []);
    
    // Actualizar botones de navegación
    this.actualizarBotonesNavegacion();
    
    console.log('✅ actualizarTarjeta completado');
  }

  /**
   * Actualiza la información del nivel actual
   */
  actualizarInfoNivel(nivelData, programaData) {
    // Verificación silenciosa del DOM
    const mallaContent = document.querySelector('.malla-content');
    if (!mallaContent) {
      return; // Salir silenciosamente si no hay contenido
    }
    
    // FORZAR actualización usando múltiples selectores
    const selectores = [
      '#nivel-actual',
      '.nivel-titulo span',
      '.nivel-info span#nivel-actual',
      '.malla-content .nivel-info span'
    ];
    
    let elementoEncontrado = null;
    for (const selector of selectores) {
      elementoEncontrado = document.querySelector(selector);
      if (elementoEncontrado) {
        console.log(`✅ Elemento encontrado con selector: ${selector}`);
        break;
      }
    }
    
    if (!elementoEncontrado) {
      console.error('❌ NO SE ENCONTRÓ ningún elemento de nivel');
      console.log('🔍 DOM actual:', {
        spans: document.querySelectorAll('span').length,
        h4s: document.querySelectorAll('h4').length,
        mallaContent: document.querySelector('.malla-content')?.innerHTML || 'NO EXISTE'
      });
      return;
    }
    
    // Calcular valores
    const nivelRomano = nivelData.nivel_romano || this.convertirARomano(this.nivelActual);
    const nivelTexto = `${nivelRomano} (${this.nivelActual})`;
    const maxNivel = this.getMaxNivel();
    const creditos = nivelData.creditos || 0;
    const htd = nivelData.htd_total || 0;
    const hti = nivelData.hti_total || 0;
    
    console.log(`🏛️ Actualizando: "${nivelTexto}" de ${maxNivel}`);
    
    // MARCAR el elemento para identificarlo
    elementoEncontrado.setAttribute('data-nivel-updated', Date.now());
    elementoEncontrado.setAttribute('data-nivel-text', nivelTexto);
    
    // FORZAR actualización del nivel actual
    elementoEncontrado.textContent = nivelTexto;
    elementoEncontrado.style.fontWeight = 'bold';
    elementoEncontrado.style.color = '#1a365d';
    elementoEncontrado.style.background = '#e3f2fd';
    elementoEncontrado.style.padding = '2px 6px';
    elementoEncontrado.style.borderRadius = '4px';
    
    // Actualizar total de niveles
    const totalSpan = document.getElementById('total-niveles') || document.querySelector('.nivel-titulo span:last-child');
    if (totalSpan && totalSpan !== elementoEncontrado) {
      totalSpan.textContent = maxNivel;
    }
    
    // Actualizar créditos
    const creditosDiv = document.querySelector('.nivel-creditos');
    if (creditosDiv) {
      creditosDiv.innerHTML = `<strong>${creditos} créditos</strong> • HTD: ${htd} • HTI: ${hti}`;
    }
    
    console.log(`✅ NIVEL FORZADO A: ${nivelTexto}`);
    
    // VERIFICAR si el elemento sigue existiendo después de 1 segundo
    setTimeout(() => {
      const elementoVerificacion = document.getElementById('nivel-actual');
      if (!elementoVerificacion) {
        console.error('🚨 ELEMENTO ELIMINADO - La malla fue recreada');
      } else if (elementoVerificacion.getAttribute('data-nivel-updated')) {
        console.log('✅ Elemento sigue existiendo y actualizado');
      } else {
        console.warn('⚠️ Elemento existe pero fue RECREADO (perdió atributos)');
      }
    }, 1000);
  }

  /**
   * Convierte número a romano
   */
  convertirARomano(num) {
    const valores = [10, 9, 5, 4, 1];
    const romanos = ['X', 'IX', 'V', 'IV', 'I'];
    let resultado = '';
    
    for (let i = 0; i < valores.length; i++) {
      while (num >= valores[i]) {
        resultado += romanos[i];
        num -= valores[i];
      }
    }
    return resultado;
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
      const htd = materia.htd || 0;
      const hti = materia.hti || 0;
      const lineaFormacion = materia.linea_formacion || 'default';
      const prerequisitos = materia.prerequisitos || [];
      
      // Obtener color por línea de formación
      const colorInfo = this.getColorLineaFormacion(lineaFormacion);
      
      // Preparar información de prerrequisitos
      const tienePrerequisitos = prerequisitos && prerequisitos.length > 0;
      const prerequisitosInfo = tienePrerequisitos ? 
        `<div class="materia-prerequisitos">
           <small class="prerequisitos-badge" title="Prerrequisitos: ${prerequisitos.join(', ')}">
             🔗 ${prerequisitos.length} prerreq.
           </small>
         </div>` : '';
      
      return `
        <li class="materia-item ${tienePrerequisitos ? 'con-prerequisitos' : ''}" style="border-left: 4px solid ${colorInfo.color};">
          <div class="materia-info">
            <span class="materia-codigo" style="background-color: ${colorInfo.color}; color: ${colorInfo.textColor};">
              ${codigo}${tienePrerequisitos ? ' 🔗' : ''}
            </span>
            <div class="materia-detalles">
              <span class="materia-nombre">${nombre}</span>
              ${prerequisitosInfo}
              <small class="materia-linea" style="color: ${colorInfo.color};">
                ${colorInfo.nombre}
              </small>
            </div>
          </div>
          <div class="materia-stats">
            <small class="materia-horas">HTD: ${htd} • HTI: ${hti} • CR: ${creditos}</small>
          </div>
        </li>
      `;
    }).join('');

    materiasLista.innerHTML = materiasHTML;
  }

  /**
   * Obtiene información de color para una línea de formación
   */
  getColorLineaFormacion(linea) {
    const colores = {
      amarillo_matematicas: { 
        color: '#FFD700', 
        textColor: 'black', 
        nombre: 'Matemáticas/Física' 
      },
      naranja_programacion: { 
        color: '#EA580C', 
        textColor: 'white', 
        nombre: 'Programación' 
      },
      mostaza_investigacion: { 
        color: '#CA8A04', 
        textColor: 'white', 
        nombre: 'Investigación' 
      },
      morado_datos: { 
        color: '#7C3AED', 
        textColor: 'white', 
        nombre: 'Bases de Datos' 
      },
      azul_sistemas: { 
        color: '#0284C7', 
        textColor: 'white', 
        nombre: 'Sistemas/Hardware' 
      },
      verde_electivas_profundizacion: { 
        color: '#16A34A', 
        textColor: 'white', 
        nombre: 'Electivas Prof.' 
      },
      celeste_humanidades: { 
        color: '#00BFFF', 
        textColor: 'white', 
        nombre: 'Humanidades' 
      },
      rosa_electivas: { 
        color: '#EC4899', 
        textColor: 'white', 
        nombre: 'Optativas' 
      },
      amarillo_pastel_algoritmos: { 
        color: '#FFED4E', 
        textColor: 'black', 
        nombre: 'Algoritmos/Teoría' 
      },
      default: { 
        color: '#64748B', 
        textColor: 'white', 
        nombre: 'General' 
      }
    };
    
    return colores[linea] || colores.default;
  }

  /**
   * Obtiene todos los colores de líneas de formación
   */
  getColoresLineaFormacion() {
    const colores = {
      amarillo_matematicas: { 
        color: '#FFD700', 
        textColor: 'black', 
        nombre: 'Matemáticas/Física' 
      },
      naranja_programacion: { 
        color: '#EA580C', 
        textColor: 'white', 
        nombre: 'Programación' 
      },
      mostaza_investigacion: { 
        color: '#CA8A04', 
        textColor: 'white', 
        nombre: 'Investigación' 
      },
      morado_datos: { 
        color: '#7C3AED', 
        textColor: 'white', 
        nombre: 'Bases de Datos' 
      },
      azul_sistemas: { 
        color: '#0284C7', 
        textColor: 'white', 
        nombre: 'Sistemas/Hardware' 
      },
      verde_electivas_profundizacion: { 
        color: '#16A34A', 
        textColor: 'white', 
        nombre: 'Electivas Prof.' 
      },
      celeste_humanidades: { 
        color: '#00BFFF', 
        textColor: 'white', 
        nombre: 'Humanidades' 
      },
      rosa_electivas: { 
        color: '#EC4899', 
        textColor: 'white', 
        nombre: 'Optativas' 
      },
      amarillo_pastel_algoritmos: { 
        color: '#FFED4E', 
        textColor: 'black', 
        nombre: 'Algoritmos/Teoría' 
      },
      default: { 
        color: '#64748B', 
        textColor: 'white', 
        nombre: 'General' 
      }
    };
    
    return colores;
  }

  /**
   * Actualiza el estado de los botones de navegación
   */
  actualizarBotonesNavegacion() {
    const btnAnterior = document.getElementById('prevLevel') || document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('nextLevel') || document.getElementById('btn-siguiente');
    const maxNivel = this.getMaxNivel();
    
    console.log(`🔄 Actualizando botones - Nivel actual: ${this.nivelActual}/${maxNivel}`);
    
    if (btnAnterior) {
      btnAnterior.disabled = this.nivelActual <= 1;
      console.log(`⬅️ Botón anterior ${this.nivelActual <= 1 ? 'deshabilitado' : 'habilitado'}`);
    }
    
    if (btnSiguiente) {
      btnSiguiente.disabled = this.nivelActual >= maxNivel;
      console.log(`➡️ Botón siguiente ${this.nivelActual >= maxNivel ? 'deshabilitado' : 'habilitado'}`);
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
    if (this.modal) {
      this.modal.maximizar();
    } else {
      console.warn('⚠️ Modal no inicializado');
    }
  }





  /**
   * Cierra el modal (delegado)
   */
  cerrarModal() {
    if (this.modal) {
      this.modal.cerrar();
    }
  }

  /**
   * Aumenta el zoom del modal
   */
  zoomIn() {
    if (this.modal) {
      this.modal.zoomIn();
    }
  }

  /**
   * Disminuye el zoom del modal
   */
  zoomOut() {
    if (this.modal) {
      this.modal.zoomOut();
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
  try {
    console.log('🚀 Inicializando MallaNavigator...');
    
    if (!mallaNavigatorInstance) {
      mallaNavigatorInstance = new MallaNavigator();
      await mallaNavigatorInstance.inicializar();
      
      // Exponer globalmente para uso desde HTML
      window.mallaNav = mallaNavigatorInstance;
      console.log('✅ MallaNavigator inicializado y expuesto globalmente');
    } else {
      console.log('♻️ Reutilizando instancia existente de MallaNavigator');
    }
    
    return mallaNavigatorInstance;
  } catch (error) {
    console.error('❌ Error inicializando MallaNavigator:', error);
    throw error;
  }
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
          <h4>📊 Nivel <span id="nivel-actual">I (1)</span> de <span id="total-niveles">10</span></h4>
          <div class="nivel-creditos"><strong>19 créditos</strong> • HTD: 27 • HTI: 30</div>
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
  
  // Función de prueba para forzar actualización
  window.testMallaNavegador = async function() {
    console.log('🧪 Probando navegador de malla...');
    try {
      const nav = await inicializarMallaNavigator();
      console.log('📊 Datos cargados:', nav.mallaDatos);
      console.log('🎯 Nivel actual:', nav.nivelActual);
      console.log('🎪 Programa actual:', nav.programaActual);
      
      // Forzar actualización
      nav.actualizarTarjeta();
      
      return nav;
    } catch (error) {
      console.error('❌ Error en prueba:', error);
    }
  };

  // Función de debug para elemento nivel
  window.debugNivelElemento = function() {
    // Buscar TODOS los elementos con ID nivel-actual
    const elementos = document.querySelectorAll('#nivel-actual');
    const elementosSpan = document.querySelectorAll('span');
    const elementosH4 = document.querySelectorAll('h4');
    
    console.log('🔍 ELEMENTOS ENCONTRADOS:');
    console.log(`   - #nivel-actual: ${elementos.length}`);
    console.log(`   - spans totales: ${elementosSpan.length}`);
    console.log(`   - h4 totales: ${elementosH4.length}`);
    
    // Mostrar cada elemento nivel-actual
    elementos.forEach((el, index) => {
      console.log(`   [${index}] Elemento:`, el);
      console.log(`   [${index}] Contenido:`, el.textContent);
      console.log(`   [${index}] Visible:`, el.offsetParent !== null);
      
      // Forzar cambio en TODOS
      const nuevoTexto = `VI (6) [DEBUG ${index}-${new Date().getSeconds()}]`;
      el.textContent = nuevoTexto;
      el.style.background = 'red';
      el.style.color = 'white';
      el.style.padding = '4px';
      el.style.border = '2px solid blue';
    });
    
    // También buscar spans dentro de .nivel-titulo
    const spansNivelTitulo = document.querySelectorAll('.nivel-titulo span');
    console.log(`🎯 Spans en .nivel-titulo: ${spansNivelTitulo.length}`);
    spansNivelTitulo.forEach((span, index) => {
      console.log(`   Span [${index}]:`, span.textContent);
      span.style.background = 'orange';
      span.textContent = `VIII (8) [SPAN-${index}]`;
    });
  };

  // Función para probar navegación
  window.testNavegacion = function(direccion = 1) {
    if (window.mallaNavigator) {
      console.log(`🧪 Probando navegación: ${direccion > 0 ? 'Siguiente' : 'Anterior'}`);
      window.mallaNavigator.cambiarNivel(direccion);
    } else {
      console.error('❌ mallaNavigator no disponible');
    }
  };
}

console.log('📚 Malla Navigator cargado correctamente');