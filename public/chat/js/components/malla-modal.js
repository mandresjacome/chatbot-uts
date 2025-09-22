/**
 * 🎓 MallaModal - Maneja la vista expandida de la malla curricular
 * 
 * Responsabilidades:
 * - Crear y gestionar el modal expandido
 * - Renderizar toda la malla curricular completa
 * - Manejar zoom y controles del modal
 * - Aplicar colores de líneas de formación
 */

/**
 * Función auxiliar para acceso seguro a documentos en contexto de iframe
 */
function getSafeDocument() {
  const isInIframe = window.self !== window.top;
  
  if (!isInIframe) {
    return document;
  }
  
  // Intentar acceso seguro a window.top.document
  try {
    if (window.top?.document) {
      return window.top.document;
    }
  } catch (error) {
    console.warn('⚠️ Error de seguridad accediendo a window.top.document:', error.message);
  }
  
  // Fallback a documento actual
  console.log('🔄 Fallback a documento actual');
  return document;
}

class MallaModal {
  constructor(mallaNavigator) {
    this.navigator = mallaNavigator;
    this.zoomLevel = 100;
    this.isOpen = false;
    
    // Bind methods
    this.maximizar = this.maximizar.bind(this);
    this.cerrar = this.cerrar.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.generarVistaCompleta = this.generarVistaCompleta.bind(this);
    this.setupEventos = this.setupEventos.bind(this);
    
    console.log('🎯 MallaModal inicializada');
  }

  /**
   * Maximiza y muestra el modal con la malla completa
   */
  maximizar() {
    console.log('🚀 Iniciando maximización del modal...');
    
    // Obtener documento de forma segura
    const targetDocument = getSafeDocument();
    const isInIframe = window.self !== window.top;
    
    console.log(`🔍 Contexto de maximización: ${isInIframe ? 'iframe' : 'ventana principal'}`);
    
    const modal = targetDocument.getElementById('malla-modal');
    if (!modal) {
      console.log('📝 Modal no existe, creando...');
      this.crearModal();
      return;
    }
    
    console.log('👁️ Modal encontrado, mostrando...');
    modal.classList.remove('hidden');
    this.generarVistaCompleta();
    targetDocument.body.style.overflow = 'hidden';
    this.isOpen = true;
    
    console.log('✅ Modal de malla maximizado correctamente');
  }

  /**
   * Crea el modal HTML si no existe
   */
  crearModal() {
    // Obtener documento de forma segura
    const targetDocument = getSafeDocument();
    const isInIframe = window.self !== window.top;
    const targetWindow = isInIframe ? window.top : window;
    
    // Crear estilos CSS en la ventana principal si estamos en iframe
    if (isInIframe && !targetDocument.getElementById('malla-modal-styles')) {
      const styleLink = targetDocument.createElement('link');
      styleLink.id = 'malla-modal-styles';
      styleLink.rel = 'stylesheet';
      styleLink.href = '/chat/css/components/malla-curricular.css';
      targetDocument.head.appendChild(styleLink);
      
      // También cargar el CSS de conexiones
      const connectionsStyleLink = targetDocument.createElement('link');
      connectionsStyleLink.id = 'malla-connections-styles';
      connectionsStyleLink.rel = 'stylesheet';
      connectionsStyleLink.href = '/chat/css/components/malla-connections.css';
      targetDocument.head.appendChild(connectionsStyleLink);
    }
    
    const modalHTML = `
      <div id="malla-modal" class="malla-modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>🎓 Malla Curricular Completa - Ingeniería de Sistemas UTS</h2>
            <div class="modal-controls">
              <button id="zoom-out-btn" class="modal-control-btn">🔍−</button>
              <span id="zoom-level">100%</span>
              <button id="zoom-in-btn" class="modal-control-btn">🔍+</button>
              <button id="close-modal-btn" class="modal-control-btn">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="malla-completa" id="malla-zoom-container">
              <div class="programa-info">
                <div class="programa-descripcion">
                  <p><strong>Tecnología:</strong> Niveles I-VI (6 semestres)</p>
                  <p><strong>Ingeniería:</strong> Niveles VII-X (4 semestres adicionales)</p>
                  <p><strong>Total:</strong> 10 semestres académicos</p>
                </div>
                <div class="conexiones-legend">
                  <h4>🔗 Conexiones de Prerrequisitos:</h4>
                  <div class="conexiones-info">
                    <div class="conexion-item">
                      <div class="conexion-color amarillo"></div>
                      <span>Materia Seleccionada</span>
                    </div>
                    <div class="conexion-item">
                      <div class="conexion-color verde"></div>
                      <span>Prerrequisitos</span>
                    </div>
                    <div class="conexion-item">
                      <div class="conexion-color azul"></div>
                      <span>Dependientes</span>
                    </div>
                    <small class="conexiones-instruccion">💡 Haz clic en cualquier materia para ver sus conexiones</small>
                  </div>
                </div>
                <div class="lineas-formacion-legend">
                  <h4>📚 Líneas de Formación:</h4>
                  <div class="legend-grid" id="legend-container"></div>
                </div>
              </div>
              <div class="malla-horizontal-grid" id="malla-horizontal-grid">
                <div class="titulos-container">
                  <h3 class="titulo-tecnologico">📚 NIVEL TECNOLÓGICO</h3>
                  <h3 class="titulo-universitario">🎓 NIVEL UNIVERSITARIO</h3>
                </div>
                <div class="niveles-horizontal" id="niveles-tecnologicos"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insertar en la ventana principal
    targetDocument.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Asegurar que el CSS de conexiones esté cargado
    if (!targetDocument.getElementById('malla-connections-styles')) {
      const connectionsStyleLink = targetDocument.createElement('link');
      connectionsStyleLink.id = 'malla-connections-styles';
      connectionsStyleLink.rel = 'stylesheet';
      connectionsStyleLink.href = '/chat/css/components/malla-connections.css';
      targetDocument.head.appendChild(connectionsStyleLink);
    }
    
    // Configurar eventos en el contexto correcto
    this.setupEventos(targetDocument, targetWindow);
    
    // Exponer la instancia del modal en ambos contextos
    if (isInIframe) {
      targetWindow.mallaModal = this;
      window.mallaModal = this; // También en iframe
      // Exponer función de conexiones en ventana principal
      targetWindow.toggleMateriaConnections = window.toggleMateriaConnections;
    } else {
      window.mallaModal = this;
    }
    
    console.log(`🎯 Modal creado en: ${isInIframe ? 'ventana principal' : 'documento actual'}`);
    
    // Mostrar modal después de crear
    setTimeout(() => this.maximizar(), 100);
  }

  /**
   * Configura los eventos del modal
   */
  setupEventos(targetDocument = document, targetWindow = window) {
    const modal = targetDocument.getElementById('malla-modal');
    if (!modal) return;

    // Cerrar con backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.cerrar());
    }

    // Botones de control
    const zoomOutBtn = targetDocument.getElementById('zoom-out-btn');
    const zoomInBtn = targetDocument.getElementById('zoom-in-btn');
    const closeBtn = targetDocument.getElementById('close-modal-btn');

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('🔴 Botón cerrar clickeado');
        this.cerrar();
      });
      console.log('✅ Event listener del botón cerrar agregado');
    } else {
      console.error('❌ No se encontró el botón de cerrar');
    }

    // Cerrar con ESC
    targetDocument.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.cerrar();
      }
    });

    console.log('🎮 Eventos del modal configurados');
  }

  /**
   * Genera la leyenda de líneas de formación
   */
  generarLeyenda() {
    // Detectar contexto
    const isInIframe = window.self !== window.top;
    const targetDocument = isInIframe ? window.top.document : document;
    
    const legendContainer = targetDocument.getElementById('legend-container');
    if (!legendContainer) return;

    const colores = this.navigator.getColoresLineaFormacion();
    
    let html = '';
    Object.entries(colores).forEach(([key, config]) => {
      if (key !== 'default') {
        html += `
          <div class="legend-item" style="background-color: ${config.color}; color: ${config.textColor};">
            <span class="legend-dot"></span>
            <span class="legend-text">${config.nombre}</span>
          </div>
        `;
      }
    });
    
    legendContainer.innerHTML = html;
  }

  /**
   * Genera la vista completa de toda la malla curricular
   */
  generarVistaCompleta() {
    console.log('🎨 Generando vista horizontal como la gráfica oficial...');
    
    // Detectar contexto
    const isInIframe = window.self !== window.top;
    const targetDocument = isInIframe ? window.top.document : document;
    
    console.log(`🔍 Contexto: ${isInIframe ? 'iframe' : 'ventana principal'}`);
    
    const nivelesTeconlogicos = targetDocument.getElementById('niveles-tecnologicos');
    
    console.log('📊 Grid tecnológicos encontrado:', !!nivelesTeconlogicos);
    console.log('🗃️ Datos del navigator:', !!this.navigator.mallaDatos);
    
    if (!nivelesTeconlogicos) {
      console.error('❌ No se encontró el elemento de niveles');
      return;
    }
    
    if (!this.navigator.mallaDatos) {
      console.error('❌ No hay datos de malla disponibles');
      return;
    }

    // Generar leyenda
    this.generarLeyenda();

    // Los datos del API vienen directamente como el programa completo
    const programaData = this.navigator.mallaDatos;
    console.log('📋 Datos del programa:', !!programaData);
    
    if (!programaData?.niveles) {
      console.error('❌ No se encontraron niveles en los datos del programa');
      return;
    }

    const niveles = Object.keys(programaData.niveles).sort((a, b) => parseInt(a) - parseInt(b));
    console.log('📊 Niveles encontrados:', niveles.length, niveles);
    
    // Generar HTML para todos los niveles en una sola fila horizontal
    let htmlTodosNiveles = '';
    
    niveles.forEach(nivel => {
      const nivelData = programaData.niveles[nivel];
      const materias = nivelData.materias || [];
      
      // Determinar si es tecnológico (1-6) o universitario (7-10)
      const esTecnologico = parseInt(nivel) <= 6;
      const tipoClase = esTecnologico ? 'tecnologico' : 'universitario';
      
      htmlTodosNiveles += `
        <div class="nivel-columna ${tipoClase}">
          <div class="nivel-header-horizontal">
            <h4>${nivelData.nivel_romano}</h4>
            <div class="nivel-totals">
              <span class="htd">HTD: ${nivelData.htd_total || 0}</span>
              <span class="hti">HTI: ${nivelData.hti_total || 0}</span>
              <span class="creditos">CR: ${nivelData.creditos || 0}</span>
            </div>
          </div>
          <div class="materias-columna">
            ${materias.map(materia => {
              const colorInfo = this.navigator.getColorLineaFormacion(materia.linea_formacion);
              
              // Función para generar ID único a partir de nombre
              const generateUniqueId = (nombre) => {
                return nombre?.toLowerCase()
                  .replace(/[áäàâ]/g, 'a')
                  .replace(/[éëèê]/g, 'e')
                  .replace(/[íïìî]/g, 'i')
                  .replace(/[óöòô]/g, 'o')
                  .replace(/[úüùû]/g, 'u')
                  .replace(/ñ/g, 'n')
                  .replace(/[^a-z0-9]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/(^_)|(_$)/g, '');
              };
              
              // FORZAR ID único basado en el nombre de la materia
              const materiaId = generateUniqueId(materia.nombre) || `materia_${nivel}_${Math.random().toString(36).substring(2, 11)}`;
              
              // Convertir prerrequisitos a IDs únicos también
              const prerequisitosIds = (materia.prerequisitos || []).map(prereqNombre => {
                // Mapeo especial para nombres conocidos que pueden tener variaciones
                const nombreMappings = {
                  // Mapeos de programación
                  'programacion_orientada_objetos': 'programacion_orientada_a_objetos',
                  'programacion_java': 'programacion_en_java',
                  'fundamentos_poo': 'fundamentos_de_poo',
                  
                  // Mapeos de bases de datos
                  'motores_bases_datos': 'motores_de_bases_de_datos',
                  'diseño_bases_datos': 'diseno_de_bases_de_datos',
                  'diseno_bases_datos': 'diseno_de_bases_de_datos',
                  'administracion_bases_datos': 'administracion_de_bases_de_datos',
                  'base_datos': 'bases_de_datos',
                  
                  // Mapeos de ingeniería de software
                  'ingenieria_software': 'ingenieria_del_software',
                  'ingenieria_de_software': 'ingenieria_del_software',
                  'arquitectura_software': 'arquitectura_de_software',
                  'desarrollo_software': 'desarrollo_de_software',
                  'calidad_software': 'calidad_de_software',
                  'gestion_proyectos': 'gestion_de_proyectos',
                  'gestion_proyectos_software': 'gestion_de_proyectos_de_software',
                  'patrones_software': 'patrones_de_software',
                  
                  // Mapeos de sistemas y hardware
                  'estructura_computadores': 'estructura_de_computadores',
                  'sistemas_operativos': 'sistemas_operativos',
                  'administracion_servicios': 'administracion_de_servicios',
                  'estructura_datos': 'estructuras_de_datos',
                  
                  // Mapeos de matemáticas y ciencias
                  'matematicas_i_calculo_diferencial': 'calculo_diferencial',
                  'matematicas_ii_calculo_integral': 'calculo_integral',
                  'algebra_lineal': 'algebra_lineal',
                  'estadistica_probabilidad': 'estadistica_y_probabilidad',
                  'fisica_mecanica': 'fisica_i_mecanica',
                  'fisica_electromagnetismo': 'fisica_ii_electromagnetismo',
                  
                  // Mapeos de gestión y administración
                  'gestion_y_gobierno_de_ti': 'gestion_y_gobierno_de_ti',
                  'gestion_gobierno_ti': 'gestion_y_gobierno_de_ti',
                  'administracion_servicios': 'administracion_de_servicios',
                  
                  // Mapeos de investigación y metodología
                  'metodologia_investigacion_i': 'metodologia_de_la_investigacion_i',
                  'metodologia_investigacion_ii': 'metodologia_de_la_investigacion_ii',
                  'analisis_datos_gran_escala': 'analisis_de_datos_a_gran_escala',
                  'mineria_datos': 'mineria_de_datos',
                  
                  // Mapeos de redes y seguridad
                  'redes_comunicaciones': 'redes_y_comunicaciones',
                  'seguridad_informatica': 'seguridad_de_la_informacion',
                  
                  // Mapeos de inteligencia artificial y automatas
                  'inteligencia_artificial': 'fundamentos_de_inteligencia_artificial',
                  'automatas_lenguajes_formales': 'automatas_y_lenguajes_formales',
                  
                  // Mapeos de simulación y gráficos
                  'computacion_grafica': 'computacion_y_grafica',
                  'simulacion_digital': 'simulacion_digital',
                  
                  // Mapeos de ética y sistemas
                  'etica_legislacion_informatica': 'etica_y_legislacion_informatica',
                  'dinamica_sistemas': 'dinamica_de_sistemas',
                  'analisis_diseño': 'analisis_y_diseno'
                };
                
                // Generar ID base
                let foundId = generateUniqueId(prereqNombre);
                
                // Aplicar mapeo si existe
                if (nombreMappings[foundId]) {
                  foundId = nombreMappings[foundId];
                }
                
                // Si no se puede generar ID, intentar con el código original
                if (!foundId) {
                  foundId = prereqNombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
                
                console.log(`🔧 Convirtiendo prerrequisito: "${prereqNombre}" -> "${foundId}"`);
                return foundId;
              }).filter(id => id); // Filtrar IDs vacíos
              
              return `
                <div class="materia-horizontal" 
                     style="background-color: ${colorInfo.color}; color: ${colorInfo.textColor};" 
                     data-materia-id="${materiaId}"
                     data-prerequisitos="${prerequisitosIds.join(',')}"
                     data-original-name="${materia.nombre}"
                     onclick="toggleMateriaConnections('${materiaId}')">
                  <div class="materia-codigo">${materia.codigo || ''}${(materia.prerequisitos && materia.prerequisitos.length > 0) ? ' 🔗' : ''}</div>
                  ${(materia.prerequisitos && materia.prerequisitos.length > 0) ? 
                    `<div class="prerequisitos-info-top" title="Prerrequisitos: ${materia.prerequisitos.join(', ')}">
                       <small>� ${materia.prerequisitos.length} prerreq.</small>
                     </div>` : ''}
                  <div class="materia-nombre">${materia.nombre}</div>
                  <div class="materia-stats">
                    <span>${materia.htd || 0}</span>
                    <span>${materia.hti || 0}</span>
                    <span>${materia.creditos || 0}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });
    
    // Listo, sin contenedores extra
    
    // Mostrar todos los niveles en el contenedor principal (ahora todos juntos)
    nivelesTeconlogicos.innerHTML = htmlTodosNiveles;
    
    console.log(`🎨 Vista horizontal generada: ${niveles.length} niveles en una sola fila horizontal`);
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
    // Detectar contexto
    const isInIframe = window.self !== window.top;
    const targetDocument = isInIframe ? window.top.document : document;
    
    const container = targetDocument.getElementById('malla-zoom-container');
    const zoomDisplay = targetDocument.getElementById('zoom-level');
    
    if (container) {
      container.style.transform = `scale(${this.zoomLevel / 100})`;
      container.style.transformOrigin = 'top left';
    }
    
    if (zoomDisplay) {
      zoomDisplay.textContent = `${this.zoomLevel}%`;
    }
    
    console.log(`🔍 Zoom actualizado: ${this.zoomLevel}%`);
  }

  /**
   * Cierra el modal
   */
  cerrar() {
    console.log('🔴 Intentando cerrar modal...');
    
    // Obtener documento de forma segura
    const targetDocument = getSafeDocument();
    const isInIframe = window.self !== window.top;
    
    console.log(`🔍 Contexto: ${isInIframe ? 'iframe' : 'ventana principal'}`);
    
    const modal = targetDocument.getElementById('malla-modal');
    if (modal) {
      modal.classList.add('hidden');
      targetDocument.body.style.overflow = '';
      this.isOpen = false;
      this.zoomLevel = 100;
      console.log('✅ Modal cerrado correctamente');
    } else {
      console.error('❌ No se encontró el modal para cerrar');
    }
  }

  /**
   * Verifica si el modal está abierto
   */
  estaAbierto() {
    return this.isOpen;
  }
}

// Función para manejar conexiones de prerrequisitos
window.toggleMateriaConnections = function(materiaId) {
  console.log('🔍 Mostrando conexiones para:', materiaId);
  
  // Obtener documento de forma segura
  const targetDocument = getSafeDocument();
  
  console.log(`🎯 Documento obtenido: ${targetDocument === window.top?.document ? 'ventana principal' : 'documento actual'}`);
  
  // Validar que targetDocument esté disponible
  if (!targetDocument) {
    console.error('❌ No hay documento disponible para mostrar conexiones');
    return;
  }
  
  // Verificar si ya está en modo conexión para esta materia
  const materiaActual = targetDocument.querySelector(`[data-materia-id="${materiaId}"]`);
  const yaEstaSeleccionada = materiaActual?.classList.contains('highlighted');
  
  // Si ya está seleccionada, salir del modo conexión
  if (yaEstaSeleccionada) {
    console.log('🔄 Saliendo del modo conexión...');
    targetDocument.querySelectorAll('.materia-horizontal').forEach(el => {
      el.classList.remove('highlighted', 'prerequisito', 'dependiente', 'connection-mode', 'animate');
    });
    removeLegend(targetDocument);
    return;
  }
  
  // Limpiar todas las conexiones previas
  targetDocument.querySelectorAll('.materia-horizontal').forEach(el => {
    el.classList.remove('highlighted', 'prerequisito', 'dependiente', 'animate');
    // Activar modo conexión (blanco y negro) para todas las materias
    el.classList.add('connection-mode');
  });
  
  // Obtener la materia seleccionada
  const materiaSeleccionada = targetDocument.querySelector(`[data-materia-id="${materiaId}"]`);
  if (!materiaSeleccionada) {
    console.error('❌ No se encontró materia:', materiaId);
    return;
  }
  
  console.log('✅ Materia encontrada:', materiaId);
  const nombreMateria = materiaSeleccionada.querySelector('.materia-nombre')?.textContent;
  console.log('📝 Nombre completo:', nombreMateria);
  
  // Marcar la materia actual (quitar modo conexión y agregar highlighted)
  materiaSeleccionada.classList.remove('connection-mode');
  materiaSeleccionada.classList.add('highlighted', 'animate');
  
  // Obtener prerrequisitos
  const prerequisitos = materiaSeleccionada.dataset.prerequisitos?.split(',').filter(p => p) || [];
  
  console.log('🔍 DEBUG - Prerrequisitos encontrados:', prerequisitos);
  console.log('🔍 DEBUG - Todos los IDs disponibles:');
  targetDocument.querySelectorAll('.materia-horizontal').forEach(el => {
    const id = el.dataset.materiaId;
    const nombre = el.querySelector('.materia-nombre')?.textContent;
    console.log(`  - ID: "${id}" -> ${nombre}`);
  });
  
  // Marcar prerrequisitos en color verde
  prerequisitos.forEach(prereqId => {
    console.log(`🔍 Buscando prerrequisito: "${prereqId}"`);
    const prereqElement = targetDocument.querySelector(`[data-materia-id="${prereqId}"]`);
    if (prereqElement) {
      prereqElement.classList.remove('connection-mode');
      prereqElement.classList.add('prerequisito', 'animate');
      console.log('🟢 Prerrequisito marcado:', prereqId);
    } else {
      console.error('❌ No se encontró prerrequisito:', prereqId);
      // Buscar por nombre similar
      const similarElement = Array.from(targetDocument.querySelectorAll('.materia-horizontal')).find(el => {
        const nombre = el.querySelector('.materia-nombre')?.textContent.toLowerCase();
        return nombre?.includes(prereqId.replace(/_/g, ' '));
      });
      if (similarElement) {
        console.log('🔍 Elemento similar encontrado:', similarElement.dataset.materiaId, similarElement.querySelector('.materia-nombre')?.textContent);
      }
    }
  });
  
  // Buscar materias que dependan de esta (que la tengan como prerrequisito)
  const dependientes = [];
  targetDocument.querySelectorAll('.materia-horizontal').forEach(el => {
    const susPrerequisitos = el.dataset.prerequisitos?.split(',').filter(p => p) || [];
    if (susPrerequisitos.includes(materiaId)) {
      el.classList.remove('connection-mode');
      el.classList.add('dependiente', 'animate');
      dependientes.push(el.dataset.materiaId);
      console.log('🔵 Dependiente marcado:', el.dataset.materiaId);
    }
  });
  
  // Mostrar leyenda de conexiones
  showConnectionsLegend(targetDocument, nombreMateria, prerequisitos.length, dependientes.length);
  
  console.log(`📊 Conexiones de ${materiaId}:`, {
    prerrequisitos: prerequisitos.length,
    dependientes: dependientes.length
  });
};

// Función para mostrar leyenda de conexiones
function showConnectionsLegend(targetDocument, nombreMateria, numPrereqs, numDeps) {
  // Remover leyenda existente
  removeLegend(targetDocument);
  
  const legend = targetDocument.createElement('div');
  legend.id = 'connections-legend';
  legend.className = 'connections-legend active';
  legend.innerHTML = `
    <h4>🔗 Conexiones: ${nombreMateria}</h4>
    <div class="legend-item">
      <div class="legend-color highlighted"></div>
      <span>Materia Seleccionada</span>
    </div>
    <div class="legend-item">
      <div class="legend-color prerequisito"></div>
      <span>Prerrequisitos (${numPrereqs})</span>
    </div>
    <div class="legend-item">
      <div class="legend-color dependiente"></div>
      <span>Dependientes (${numDeps})</span>
    </div>
    <small style="margin-top: 8px; display: block; color: #666;">
      Haz clic en la materia nuevamente para salir del modo conexión
    </small>
  `;
  
  targetDocument.body.appendChild(legend);
}

// Función para remover leyenda
function removeLegend(targetDocument) {
  const existingLegend = targetDocument.getElementById('connections-legend');
  if (existingLegend) {
    existingLegend.remove();
  }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MallaModal;
} else {
  window.MallaModal = MallaModal;
}