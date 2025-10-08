// chat.js
import { getUserType, resetUserType, showModal } from '../components/modal-user.js';
import advancedSearchUI from '../components/advanced-search.js';

const $ = s => document.querySelector(s);
const chat = $('#chat');
const ta = $('#msg');
const btn = $('#send');
const themeToggle = $('#themeToggle');

function newSessionId(){
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}
// Generar nuevo sessionId cada vez que se carga la página (sin localStorage)
let sessionId = newSessionId();

/* ====== Tema ====== */
const THEME_KEY = 'uts_theme';
const htmlEl = document.documentElement;
function applyTheme(mode){
  htmlEl.setAttribute('data-theme', mode);
  localStorage.setItem(THEME_KEY, mode);
  themeToggle.textContent = mode === 'dark' ? '🌙' : '☀️';
}
(function initTheme(){
  let saved = localStorage.getItem(THEME_KEY) || 'light';
  // Migrar usuarios que tenían tema automático a tema claro
  if (saved === 'auto') {
    saved = 'light';
    localStorage.setItem(THEME_KEY, saved);
  }
  applyTheme(saved);
})();
themeToggle.addEventListener('click', () => {
  const cur = htmlEl.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

/* ====== Util ====== */
function autoGrow(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight, 120)+'px'; }
ta.addEventListener('input', () => autoGrow(ta));

// Función para procesar Markdown básico
function processMarkdown(text) {
  if (!text) return '';
  
  // Escapar HTML para seguridad
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  let processed = escapeHtml(text);
  
  // Procesar negritas con asteriscos **texto** y *texto*
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  
  // Procesar cursivas con guiones bajos (opcional)
  processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Preservar saltos de línea
  processed = processed.replace(/\n/g, '<br>');
  
  return processed;
}

function bubble(text, me=false, extras={}){
  const wrap = document.createElement('div');
  const b = document.createElement('div');
  b.className = 'msg' + (me ? ' me' : '');
  
  if (me) {
    // Para mensajes del usuario, usar textContent (sin formateo)
    b.textContent = text;
  } else {
    // Para mensajes del bot, verificar si contiene componente de malla curricular
    if (text.includes('**MALLA_CURRICULAR_COMPONENT**')) {
      // Dividir el texto en partes antes y después del componente
      const parts = text.split('**MALLA_CURRICULAR_COMPONENT**');
      const textoBefore = parts[0] || '';
      const textoAfter = parts[1] || '';
      
      // Procesar la parte antes del componente
      if (textoBefore.trim()) {
        b.innerHTML = processMarkdown(textoBefore.trim());
      }
      
      // Crear y añadir el componente de malla curricular
      createMallaComponent(wrap);
      
      // Procesar la parte después del componente
      if (textoAfter.trim()) {
        const afterDiv = document.createElement('div');
        afterDiv.innerHTML = processMarkdown(textoAfter.trim());
        afterDiv.style.marginTop = '15px';
        wrap.appendChild(afterDiv);
      }
    } else {
      // Para mensajes normales, procesar Markdown
      b.innerHTML = processMarkdown(text);
    }
  }
  
  wrap.appendChild(b);
  
  // Referencias como enlaces clicables
  if (extras.references && extras.references.length > 0) {
    const refsDiv = document.createElement('div');
    refsDiv.className = 'references';
    refsDiv.innerHTML = '📚 Fuentes: ';
    
    extras.references.forEach((ref, i) => {
      if (i > 0) refsDiv.appendChild(document.createTextNode(' | '));
      
      if (ref.url) {
        const link = document.createElement('a');
        link.href = ref.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `[${i+1}] ${ref.nombreRecurso || 'Ver más'}`;
        link.title = ref.titulo;
        refsDiv.appendChild(link);
      } else {
        const span = document.createElement('span');
        span.textContent = `[${i+1}] ${ref.titulo}`;
        refsDiv.appendChild(span);
      }
    });
    
    wrap.appendChild(refsDiv);
  }
  
  if (extras.ref) { const ref=document.createElement('div'); ref.className='ref'; ref.textContent=extras.ref; wrap.appendChild(ref); }
  if (extras.feedback) {
    const actions=document.createElement('div'); actions.className='actions';
    const up=document.createElement('button'); up.textContent='👍 Útil';
    const dn=document.createElement('button'); dn.textContent='👎 No útil';
    
    let hasVoted = false; // Variable para controlar si ya se votó
    
    up.onclick = () => {
      if (hasVoted) return; // Prevenir votos múltiples
      hasVoted = true;
      sendFeedback(extras.conversationId, true);
      
      // Actualizar UI para mostrar el voto
      up.classList.add('voted-positive');
      dn.disabled = true;
      dn.classList.add('disabled');
    };
    
    dn.onclick = () => {
      if (hasVoted) return; // Prevenir votos múltiples
      hasVoted = true;
      sendFeedback(extras.conversationId, false);
      
      // Actualizar UI para mostrar el voto
      dn.classList.add('voted-negative');
      up.disabled = true;
      up.classList.add('disabled');
    };
    
    actions.append(up,dn); wrap.appendChild(actions);
  }
  
  // Botón de búsqueda web si es necesario
  if (extras.webSearchButton) {
    const webSearchDiv = document.createElement('div');
    webSearchDiv.className = 'web-search-action';
    webSearchDiv.innerHTML = `
      <div class="web-search-info">
        <span class="web-search-text">💡 ¿Buscamos en toda la web de UTS?</span>
      </div>
      <button class="web-search-btn" data-query="${extras.webSearchButton.originalQuery}">
        🔍 Buscar en el sitio web de UTS
      </button>
    `;
    
    // Agregar evento al botón
    const searchBtn = webSearchDiv.querySelector('.web-search-btn');
    searchBtn.onclick = () => {
      const query = searchBtn.getAttribute('data-query');
      performWebSearch(query, wrap);
    };
    
    wrap.appendChild(webSearchDiv);
  }
  
  chat.appendChild(wrap); chat.scrollTop=chat.scrollHeight;
}
function typing(on=true){
  let t=document.querySelector('.typing');
  if(on && !t){ t=document.createElement('div'); t.className='msg typing'; t.textContent='Escribiendo…'; chat.appendChild(t); chat.scrollTop=chat.scrollHeight; }
  else if(!on && t){ t.remove(); }
}

/* ====== Perfil obligatorio ====== */
let currentUserType = getUserType();
function setInputEnabled(on){ ta.disabled=!on; btn.disabled=!on; if(on) ta.focus(); }
setInputEnabled(!!currentUserType);

// Solo mostrar mensaje de bienvenida si ya hay un perfil seleccionado
if (currentUserType) {
  showWelcomeMessage(currentUserType);
}

function showWelcomeMessage(userType) {
  let welcomeMessage = '';
  
  switch(userType) {
    case 'visitante':
      welcomeMessage = '👋 ¡Bienvenido! Estoy aquí para darte información sobre la Pagina de Ingenieria de Sistemas UTS.';
      break;
    case 'estudiante':
      welcomeMessage = '👋 ¡Hola estudiante! ¿En qué tema te puedo ayudar?';
      break;
    case 'docente':
      welcomeMessage = '👋 ¡Hola! Como docente, ¿qué información necesitas?';
      break;
    case 'aspirante':
      welcomeMessage = '👋 ¡Hola futuro Uteista! ¿Qué quieres saber?';
      break;
    default:
      welcomeMessage = `👋 ¡Hola! Como ${userType}, ¿en qué te puedo ayudar?`;
  }
  
  bubble(welcomeMessage, false);
}

document.addEventListener('uts:userTypeChanged', (ev) => {
  currentUserType = ev.detail?.type || null;
  setInputEnabled(!!currentUserType);
  
  if (currentUserType) {
    showWelcomeMessage(currentUserType);
  }
});

/* ====== NUEVO: "Nueva conversación" desde el widget ====== */
function clearChatUI(){
  chat.replaceChildren(); // borra todas las burbujas
}
function startNewConversation(){
  // 1) nuevo sessionId
  sessionId = newSessionId();

  // 2) limpiar UI, bloquear input
  clearChatUI();
  setInputEnabled(false);

  // 3) olvidar tipo de usuario y mostrar modal de nuevo
  resetUserType();   // borra tipo y emite uts:userTypeChanged con null
  showModal();       // abre modal

  // 4) No mostrar mensaje redundante - el modal y el mensaje personalizado son suficientes
}
window.addEventListener('message', (ev) => {
  if (!ev?.data) return;
  if (ev.data.type === 'UTS_NEW_CHAT') startNewConversation();
});

/* ====== API ====== */
async function sendFeedback(conversationId, useful){
  try {
    await fetch('/api/feedback',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ conversationId, useful })
    });
  } catch {}
}

/**
 * Determina si mostrar botón de búsqueda web - VERSIÓN SIMPLIFICADA
 * Confía en el análisis inteligente del backend
 * @param {Object} data - Respuesta completa del backend
 * @returns {boolean}
 */
function shouldShowWebSearchButton(data) {
  // PRIORIDAD 1: Si el backend dice explícitamente que muestre búsqueda web
  if (data.suggestWebSearch === true) {
    console.log('[WebSearch] Backend sugiere búsqueda web - mostrando botón');
    return true;
  }
  
  // PRIORIDAD 2: Si no encontró evidencia en la base de datos local
  if (data.evidenceCount === 0) {
    console.log('[WebSearch] Sin evidencia encontrada - mostrando botón');
    return true;
  }
  
  // Si llegamos aquí, el backend determinó que no es necesario
  console.log('[WebSearch] Backend considera que la respuesta es adecuada - sin botón');
  return false;
}

/* ====== Funciones de búsqueda web ====== */

/**
 * Ejecuta búsqueda web cuando el usuario hace clic en el botón
 * @param {string} query - Consulta original
 * @param {HTMLElement} messageWrap - Contenedor del mensaje
 */
async function performWebSearch(query, messageWrap) {
  try {
    console.log('[WebSearch] Usuario solicitó búsqueda web para:', query);
    
    // Deshabilitar el botón para evitar múltiples clics
    const searchBtn = messageWrap.querySelector('.web-search-btn');
    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.textContent = '🔄 Buscando...';
    }
    
    // Mostrar indicador de búsqueda
    advancedSearchUI.showSearchIndicator(messageWrap, query);
    advancedSearchUI.updateSearchStatus('searching');
    
    // Realizar búsqueda híbrida
    const res = await fetch('/api/web-search/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question: query, 
        userType: currentUserType,
        useWebSearch: true 
      })
    });
    
    const data = await res.json();
    
    // Ocultar indicador
    advancedSearchUI.hideSearchIndicator();
    
    if (!data.success) {
      throw new Error(data.error || 'Error en búsqueda web');
    }
    
    const result = data || {};
    console.log('[WebSearch] Respuesta híbrida recibida:', result);
    
    // Crear nueva burbuja con resultado híbrido
    bubble(result.response || 'No se encontró información específica.', false, {
      feedback: true,
      conversationId: result.meta?.conversationId || sessionId
    });
    
    // Agregar indicadores de fuentes al último mensaje
    const lastMessage = chat.lastElementChild;
    if (lastMessage && result.sources && result.sources.length > 0) {
      advancedSearchUI.addResponseSources(
        lastMessage, 
        result.sources, 
        result.confidence
      );
    }
    
  } catch (error) {
    console.error('[WebSearch] Error en búsqueda:', error);
    
    // Limpiar interfaz
    advancedSearchUI.hideSearchIndicator();
    
    // Restaurar botón
    const searchBtn = messageWrap.querySelector('.web-search-btn');
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = '🔍 Buscar en el sitio web de UTS';
    }
    
    // Mostrar mensaje de error
    bubble('❌ No se pudo realizar la búsqueda web en este momento. Por favor intenta de nuevo.', false, {
      ref: 'Error de búsqueda web'
    });
  }
}

async function send(){
  const text = ta.value.trim();
  if (!text || !currentUserType) return;
  bubble(text, true);
  ta.value=''; autoGrow(ta);
  typing(true);
  
  try{
    // Siempre usar búsqueda tradicional primero
    const res = await fetch('/api/chat/message',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message:text, userType: currentUserType, sessionId })
    });
    const data = await res.json(); typing(false);
    if(!data.success) throw new Error(data.error||'Error');
    
    const fecha = data.meta?.fechasDetectadas ? ` · Fechas: ${data.meta.fechasDetectadas}` : '';
    const modelRef = `Modelo: ${data.meta?.model || 'n/a'}${fecha}`;
    
    // Verificar si la respuesta necesita botón de búsqueda web
    const needsWebSearch = shouldShowWebSearchButton(data);
    
    bubble(data.response, false, { 
      references: data.references || [], 
      ref: modelRef, 
      feedback: true, 
      conversationId: data.conversationId,
      webSearchButton: needsWebSearch ? { originalQuery: text } : null
    });
  }catch(e){
    typing(false);
    bubble('❌ Ocurrió un error al procesar tu mensaje.', false, { ref:'Error' });
  }
}

/* ====== Componente Malla Curricular ====== */
async function createMallaComponent(parentElement) {
  try {
    // Cargar CSS si no está cargado
    if (!document.querySelector('link[href*="malla-curricular.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/chat/css/components/malla-curricular.css';
      document.head.appendChild(cssLink);
    }

    // Cargar JavaScript de malla completo
    if (!window.MallaNavigator) {
      const script = document.createElement('script');
      script.src = '/chat/js/modules/malla-navigator.js';
      document.head.appendChild(script);
      
      // Esperar a que el script se cargue
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    // Crear contenedor del componente
    const mallaContainer = document.createElement('div');
    mallaContainer.className = 'malla-container';
    mallaContainer.innerHTML = `
      <div class="malla-card">
        <div class="malla-header">
          <h3>🎓 Ingeniería de Sistemas</h3>
        </div>
        
        <div class="malla-content">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando malla curricular...</p>
          </div>
        </div>
        
        <div class="malla-controls">
          <div class="nav-buttons-group">
            <button class="nav-btn" id="prevLevel">← Anterior</button>
            <button class="nav-btn" id="nextLevel">Siguiente →</button>
          </div>
          <div class="zoom-container">
            <button class="zoom-btn" id="expandMalla">🔍 Expandir</button>
          </div>
        </div>
      </div>
    `;

    parentElement.appendChild(mallaContainer);

    // Inicializar el navegador de malla
    setTimeout(async () => {
      try {
        console.log('🔧 Intentando inicializar MallaNavigator...');
        
        if (window.MallaNavigator) {
          console.log('✅ MallaNavigator encontrado, creando instancia...');
          const navigator = new window.MallaNavigator();
          console.log('🔧 Navigator creado:', navigator);
          
          console.log('🔧 Llamando a initialize()...');
          await navigator.initialize();
          console.log('🔧 Initialize completado');
          
          console.log('🔧 Asignando a window.mallaNavigator...');
          window.mallaNavigator = navigator;
          
          // MONITOR para detectar cuándo se elimina
          let checkCount = 0;
          const monitor = setInterval(() => {
            checkCount++;
            if (!window.mallaNavigator) {
              console.error(`🚨 window.mallaNavigator ELIMINADO después de ${checkCount} segundos!`);
              console.error('🔍 Propiedades de window con "malla":', 
                Object.keys(window).filter(k => k.toLowerCase().includes('malla')));
              clearInterval(monitor);
            } else if (checkCount >= 20) {
              console.log('✅ window.mallaNavigator sigue existiendo después de 20 segundos');
              clearInterval(monitor);
            }
          }, 1000);
          
          // También usar múltiples referencias
          window._mallaNavigatorBackup = navigator;
          window.debugMallaNavigator = navigator;
          
          // Función helper que siempre funciona
          window.getMallaNavigator = function() {
            return window.mallaNavigator || window._mallaNavigatorBackup || window.debugMallaNavigator;
          };
          
          // Función de test que siempre funciona
          window.testMallaNivel = function(direccion = 1) {
            const nav = window.getMallaNavigator();
            if (nav) {
              console.log(`🧪 Cambiando nivel desde ${nav.nivelActual} con dirección ${direccion}`);
              nav.cambiarNivel(direccion);
            } else {
              console.error('❌ No se puede encontrar mallaNavigator en ninguna referencia');
            }
          };
          
          console.log('✅ Verificación final:');
          console.log('   - window.mallaNavigator existe:', !!window.mallaNavigator);
          console.log('   - Nivel actual:', window.mallaNavigator?.nivelActual);
          console.log('   - IsInitialized:', window.mallaNavigator?.isInitialized);
          
        } else {
          console.error('❌ MallaNavigator no está disponible en window');
          throw new Error('MallaNavigator no cargado');
        }
      } catch (error) {
        console.error('❌ Error inicializando MallaNavigator:', error);
        const spinner = mallaContainer.querySelector('.loading-spinner');
        if (spinner) {
          spinner.innerHTML = `
            <div class="malla-error">
              <p>❌ Error cargando la malla curricular</p>
              <p>Detalles: ${error.message}</p>
              <button onclick="location.reload()">🔄 Recargar página</button>
            </div>
          `;
        }
      }
    }, 500);

  } catch (error) {
    console.error('Error creando componente de malla:', error);
    
    // Mostrar error en el componente
    const errorDiv = document.createElement('div');
    errorDiv.className = 'malla-error';
    errorDiv.innerHTML = `
      <p>❌ Error cargando la malla curricular</p>
      <button onclick="this.parentElement.style.display='none'">Cerrar</button>
    `;
    parentElement.appendChild(errorDiv);
  }
}

btn.addEventListener('click', send);
ta.addEventListener('keydown', e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });

// Integrar componente de sugerencias después de que el chat se inicialice
document.addEventListener('DOMContentLoaded', () => {
  // Crear y insertar el contenedor de sugerencias después del chat
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.id = 'suggestions-component';
  
  // Insertar las sugerencias entre el chat y la barra de entrada
  const footer = document.querySelector('.bar');
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(suggestionsContainer, footer);
  }
  
  // El componente de sugerencias se inicializará automáticamente
  console.log('✅ Contenedor de sugerencias agregado al DOM');
});

// Función para enviar sugerencia desde el componente de sugerencias
window.sendSuggestion = function(suggestionText) {
  if (suggestionText && suggestionText.trim()) {
    // Establecer el texto en el textarea
    ta.value = suggestionText.trim();
    
    // Ajustar la altura del textarea
    autoGrow(ta);
    
    // Enviar automáticamente
    send();
  }
};
