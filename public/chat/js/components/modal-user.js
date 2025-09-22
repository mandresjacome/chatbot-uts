// modal-user.js
const TYPES = {
  estudiante: { emoji:'🎓', gif: '/assets/animations/ChatbotAzulEstudiante.gif' }, 
  aspirante: { emoji:'🌟', gif: '/assets/animations/ChatbotVerdeAspirante.gif' },
  docente: { emoji:'👨‍🏫', gif: '/assets/animations/ChatbotNaranjaDocente.gif' },  
  visitante: { emoji:'👋', gif: '/assets/animations/ChatbotGrisTodos.gif' }, 
  todos: { emoji:'💬', gif: '/assets/animations/ChatbotVerdeUTS.gif' }
};

const modal = document.getElementById('userModal');
// El avatar ahora estará en el widget, no en el header de la página

export function getUserType(){ 
  // No usar localStorage para persistir entre recargas
  return window.currentUserType || null; 
}
export function setUserType(type){
  if (!TYPES[type]) return;
  window.currentUserType = type; // Guardar en memoria, no en localStorage
  
  // Aplicar tema de usuario al documento
  document.documentElement.setAttribute('data-user', type);
  
  updateWidgetAvatar(type);
  hideModal();
  document.dispatchEvent(new CustomEvent('uts:userTypeChanged', { detail:{ type } }));
}
export function showModal(){ modal.hidden = false; }
export function hideModal(){ modal.hidden = true; }
export function resetUserType(){
  window.currentUserType = null; // Limpiar de memoria
  
  // Remover tema de usuario del documento
  document.documentElement.removeAttribute('data-user');
  
  updateWidgetAvatar('todos');
  showModal();
  document.dispatchEvent(new CustomEvent('uts:userTypeChanged', { detail:{ type: null } }));
}

function updateWidgetAvatar(type){
  // Comunicar al widget para que actualice su avatar
  const config = TYPES[type] || TYPES['todos'];
  window.parent.postMessage({ 
    type: 'UTS_UPDATE_AVATAR', 
    userType: type,
    gif: config.gif,
    emoji: config.emoji 
  }, '*');
}

function attachHandlers(){
  modal.querySelectorAll('.card').forEach(btn => {
    btn.addEventListener('click', () => setUserType(btn.getAttribute('data-type')));
  });
}

function init(){
  // Siempre iniciar sin tipo de usuario al cargar la página
  window.currentUserType = null;
  updateWidgetAvatar('todos');
  showModal(); // Siempre mostrar el modal al cargar
  attachHandlers();
}

document.addEventListener('DOMContentLoaded', init);

// También en window por si necesitas en otras vistas
window.UTSUser = { getUserType, setUserType, showModal, resetUserType };
