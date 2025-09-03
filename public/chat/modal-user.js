// modal-user.js
const STORAGE_KEY = 'uts_user_type';
const TYPES = {
  estudiante:{ emoji:'🎓' }, aspirante:{ emoji:'🌟' },
  docente:{ emoji:'👨‍🏫' },  visitante:{ emoji:'👋' }, todos:{ emoji:'💬' }
};

const modal = document.getElementById('userModal');
const avatar = document.getElementById('avatar');

export function getUserType(){ return localStorage.getItem(STORAGE_KEY) || null; }
export function setUserType(type){
  if (!TYPES[type]) return;
  localStorage.setItem(STORAGE_KEY, type);
  updateAvatar(type);
  hideModal();
  document.dispatchEvent(new CustomEvent('uts:userTypeChanged', { detail:{ type } }));
}
export function showModal(){ modal.hidden = false; }
export function hideModal(){ modal.hidden = true; }
export function resetUserType(){
  localStorage.removeItem(STORAGE_KEY);
  updateAvatar('todos');
  showModal();
  document.dispatchEvent(new CustomEvent('uts:userTypeChanged', { detail:{ type: null } }));
}

function updateAvatar(type){
  if (!avatar) return;
  avatar.className = `avatar avatar--${type || 'todos'}`;
  const emoji = TYPES[type]?.emoji || '💬';
  avatar.textContent = emoji;
}

function attachHandlers(){
  modal.querySelectorAll('.card').forEach(btn => {
    btn.addEventListener('click', () => setUserType(btn.getAttribute('data-type')));
  });
}

function init(){
  const saved = getUserType();
  if (saved) { updateAvatar(saved); hideModal(); setTimeout(()=> {
    document.dispatchEvent(new CustomEvent('uts:userTypeChanged', { detail:{ type: saved } }));
  }, 0); }
  else { showModal(); }
  attachHandlers();
}

document.addEventListener('DOMContentLoaded', init);

// También en window por si necesitas en otras vistas
window.UTSUser = { getUserType, setUserType, showModal, resetUserType };
