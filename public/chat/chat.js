// chat.js
import { getUserType, resetUserType, showModal } from './modal-user.js';

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
  themeToggle.textContent = mode === 'dark' ? '🌙' : (mode === 'light' ? '☀️' : '🌓');
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
  const cur = htmlEl.getAttribute('data-theme') || 'auto';
  applyTheme(cur === 'auto' ? 'dark' : cur === 'dark' ? 'light' : 'auto');
});

/* ====== Util ====== */
function autoGrow(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight, 120)+'px'; }
ta.addEventListener('input', () => autoGrow(ta));

function bubble(text, me=false, extras={}){
  const wrap = document.createElement('div');
  const b = document.createElement('div');
  b.className = 'msg' + (me ? ' me' : '');
  b.textContent = text;
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

// Siempre mostrar mensaje de bienvenida al cargar la página
bubble('👋 ¡Hola! Soy AvaUTS, tu Asistente Virtual Académico. 🎓 Selecciona tu perfil para comenzar.');

document.addEventListener('uts:userTypeChanged', (ev) => {
  currentUserType = ev.detail?.type || null;
  setInputEnabled(!!currentUserType);
  if (currentUserType) bubble(`✅ Perfil seleccionado: ${currentUserType}. 💬 ¿En qué te ayudo?`, false);
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

  // 4) mensaje inicial
  bubble('🔄 Nueva conversación iniciada. 🎓 Selecciona tu perfil para continuar.');
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

async function send(){
  const text = ta.value.trim();
  if (!text || !currentUserType) return;
  bubble(text, true);
  ta.value=''; autoGrow(ta);
  typing(true);
  try{
    const res = await fetch('/api/chat/message',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message:text, userType: currentUserType, sessionId })
    });
    const data = await res.json(); typing(false);
    if(!data.success) throw new Error(data.error||'Error');
    
    const fecha = data.meta?.fechasDetectadas ? ` · Fechas: ${data.meta.fechasDetectadas}` : '';
    const modelRef = `Modelo: ${data.meta?.model || 'n/a'}${fecha}`;
    
    bubble(data.response, false, { 
      references: data.references || [], 
      ref: modelRef, 
      feedback: true, 
      conversationId: data.conversationId 
    });
  }catch(e){
    typing(false);
    bubble('❌ Ocurrió un error al procesar tu mensaje.', false, { ref:'Error' });
  }
}

btn.addEventListener('click', send);
ta.addEventListener('keydown', e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
