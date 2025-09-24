(function(){
  const CHAT_URL = '/chat';

  // Temas para cada tipo de usuario
  const USER_THEMES = {
    estudiante: {
      gradient: 'linear-gradient(135deg, #1976D2 0%, #1565C0 50%, #0D47A1 100%)',
      border: '#1976D2',
      textColor: '#ffffff',
      label: 'Estudiantes'
    },
    aspirante: {
      gradient: 'linear-gradient(135deg, #388E3C 0%, #2E7D32 50%, #1B5E20 100%)',
      border: '#388E3C',
      textColor: '#ffffff',
      label: 'Aspirantes'
    },
    docente: {
      gradient: 'linear-gradient(135deg, #F57C00 0%, #EF6C00 50%, #E65100 100%)',
      border: '#F57C00',
      textColor: '#ffffff',
      label: 'Docentes'
    },
    visitante: {
      gradient: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 50%, #4A148C 100%)',
      border: '#7B1FA2',
      textColor: '#ffffff',
      label: 'Visitantes'
    },
    default: {
      gradient: 'linear-gradient(135deg, #C9D72F 0%, #0b4a75 100%)',
      border: '#2C3E50',
      textColor: '#ffffff',
      label: ''
    }
  };

  const btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Abrir AvaUTS - Asistente Virtual Académico UTS');
  btn.className = 'chat-widget-button';
  
  // Crear el GIF para el botón
  const btnIcon = document.createElement('img');
  btnIcon.src = '/assets/animations/ChatbotVerdeUTS.gif';
  btnIcon.alt = 'AvaUTS';
  Object.assign(btnIcon.style, {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  });
  btn.appendChild(btnIcon);
  document.body.appendChild(btn);

  let open = false, shell = null, iframe = null, title = null;
  let currentUserType = null;
  let isMinimized = false; // Estado de minimizado

  function openChat(){
    if (open) return;
    shell = document.createElement('div');
    shell.className = 'chat-widget-shell';

    // Barra superior con Cerrar + Nueva
    const top = document.createElement('div');
    top.className = 'chat-widget-header';

    title = document.createElement('div');
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '8px';
    title.style.fontWeight = '700';
    
    const icon = document.createElement('img');
    icon.src = '/assets/animations/ChatbotVerdeUTS.gif';
    icon.alt = 'AvaUTS';
    Object.assign(icon.style, {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover'
    });
    
    const text = document.createElement('span');
    text.textContent = 'AvaUTS';
    
    title.appendChild(icon);
    title.appendChild(text);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '6px';

    const newBtn = document.createElement('button');
    Object.assign(newBtn.style, {
      background:'rgba(255,255,255,0.2)', color:'white',
      border:'1px solid rgba(255,255,255,0.3)', borderRadius:'8px', 
      cursor:'pointer', fontSize:'12px', padding:'6px 12px',
      fontWeight: '600', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', gap: '6px'
    });
    
    // Ícono SVG para nueva conversación
    newBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Nueva</span>
    `;
    newBtn.onmouseenter = () => {
      newBtn.style.background = 'rgba(255,255,255,0.3)';
    };
    newBtn.onmouseleave = () => {
      newBtn.style.background = 'rgba(255,255,255,0.2)';
    };
    newBtn.onclick = () => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type:'UTS_NEW_CHAT' }, '*');
      }
    };

    // Botón Minimizar
    const minimize = document.createElement('button');
    Object.assign(minimize.style, {
      background:'rgba(255,255,255,0.2)', color:'white',
      border:'1px solid rgba(255,255,255,0.3)', borderRadius:'8px',
      cursor:'pointer', fontSize:'14px', padding:'6px 8px',
      fontWeight: '600', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    
    minimize.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    minimize.title = 'Minimizar (preserva conversación)';
    minimize.onmouseenter = () => {
      minimize.style.background = 'rgba(255,255,255,0.3)';
    };
    minimize.onmouseleave = () => {
      minimize.style.background = 'rgba(255,255,255,0.2)';
    };
    minimize.onclick = minimizeChat;

    // Botón Cerrar
    const close = document.createElement('button');
    Object.assign(close.style, {
      background:'rgba(255,255,255,0.2)', color:'white',
      border:'1px solid rgba(255,255,255,0.3)', borderRadius:'8px',
      cursor:'pointer', fontSize:'14px', padding:'6px 8px',
      fontWeight: '600', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    
    close.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    close.title = 'Cerrar completamente';
    close.onmouseenter = () => {
      close.style.background = 'rgba(255,0,0,0.3)';
    };
    close.onmouseleave = () => {
      close.style.background = 'rgba(255,255,255,0.2)';
    };
    close.onclick = closeChat;

    right.appendChild(newBtn);
    right.appendChild(minimize);
    right.appendChild(close);
    top.appendChild(title);
    top.appendChild(right);

    iframe = document.createElement('iframe');
    iframe.src = CHAT_URL;
    iframe.className = 'chat-widget-iframe';

    shell.appendChild(top);
    shell.appendChild(iframe);
    document.body.appendChild(shell);
    open = true;
    
    // Cambiar el botón a X cuando está abierto
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  function minimizeChat(){
    if (!open || !shell) return;
    isMinimized = true;
    shell.style.display = 'none';
    
    // Restaurar el GIF cuando está minimizado
    btn.innerHTML = '';
    btn.appendChild(btnIcon);
    console.log('💬 Chat minimizado (conversación preservada)');
  }

  function maximizeChat(){
    if (!shell) {
      // Si no existe, crear por primera vez
      openChat();
      return;
    }
    
    isMinimized = false;
    shell.style.display = 'block';
    
    // Cambiar el botón a X cuando está maximizado
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    console.log('💬 Chat maximizado (conversación mantenida)');
  }

  function closeChat(){
    if (!open) return;
    shell.remove(); shell = null; iframe = null; open = false;
    isMinimized = false;
    
    // Restaurar el GIF cuando está cerrado
    btn.innerHTML = '';
    btn.appendChild(btnIcon);
    console.log('💬 Chat cerrado completamente');
  }

  btn.addEventListener('click', () => {
    if (!open) {
      openChat();
    } else if (isMinimized) {
      maximizeChat();
    } else {
      minimizeChat();
    }
  });

  // Escuchar mensajes del iframe para actualizar el avatar y tema
  window.addEventListener('message', (event) => {
    if (event.data.type === 'UTS_UPDATE_AVATAR') {
      updateWidgetAvatar(event.data);
      updateWidgetTheme(event.data.userType);
    }
  });

  function updateWidgetAvatar(data) {
    if (!open || !title) return;
    
    const icon = title.querySelector('img');
    if (icon && data.gif) {
      icon.src = data.gif;
      icon.alt = data.userType || 'AvaUTS';
    }
  }

  function updateWidgetTheme(userType) {
    if (!open || !shell) return;
    
    currentUserType = userType;
    const theme = USER_THEMES[userType] || USER_THEMES.default;
    
    // Remover clases de tema previas
    shell.className = shell.className.replace(/chat-widget-shell--\w+/g, '');
    
    // Agregar nueva clase de tema
    if (userType && userType !== 'default') {
      shell.classList.add(`chat-widget-shell--${userType}`);
    }
    
    // Actualizar el header también
    const top = shell.querySelector('.chat-widget-header');
    if (top) {
      top.className = top.className.replace(/chat-widget-header--\w+/g, '');
      if (userType && userType !== 'default') {
        top.classList.add(`chat-widget-header--${userType}`);
      }
    }
    
    // Actualizar el texto del título
    const textSpan = title?.querySelector('span');
    if (textSpan) {
      if (theme.label) {
        textSpan.textContent = `AvaUTS - ${theme.label}`;
      } else {
        textSpan.textContent = 'AvaUTS';
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      open ? closeChat() : openChat();
    }
  });
})();
