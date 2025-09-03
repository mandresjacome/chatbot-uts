(function(){
  const CHAT_URL = '/chat';
  const BTN_TEXT = '💬 UTS';
  const BTN_SIZE = 56;
  const WIDTH = 380;
  const HEIGHT = 560;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const btn = document.createElement('button');
  btn.textContent = BTN_TEXT;
  btn.setAttribute('aria-label', 'Abrir chat UTS');
  Object.assign(btn.style, {
    position:'fixed', right:'16px', bottom:'16px', zIndex: 99999,
    width: BTN_SIZE + 'px', height: BTN_SIZE + 'px',
    border:'none', borderRadius:'999px', cursor:'pointer',
    background:'#22c55e', color:'#04120a', fontWeight:'800', boxShadow:'0 10px 30px rgba(0,0,0,.35)'
  });
  document.body.appendChild(btn);

  let open = false, shell = null, iframe = null;

  function borderColor(){ return prefersDark ? '#334155' : '#e2e8f0'; }

  function openChat(){
    if (open) return;
    shell = document.createElement('div');
    Object.assign(shell.style, {
      position:'fixed', right:'16px', bottom:(16 + BTN_SIZE + 8) + 'px',
      width: WIDTH + 'px', height: HEIGHT + 'px',
      border:`1px solid ${borderColor()}`, borderRadius:'12px',
      boxShadow:'0 20px 60px rgba(0,0,0,.55)', overflow:'hidden',
      zIndex: 99998, background:'#0f172a'
    });

    // Barra superior con Cerrar + Nueva
    const top = document.createElement('div');
    Object.assign(top.style, {
      height:'40px', display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 8px', background: prefersDark ? '#0b1220' : '#ffffff',
      color: prefersDark ? '#e5e7eb' : '#0f172a', fontSize:'14px',
      borderBottom:`1px solid ${borderColor()}`
    });

    const title = document.createElement('div');
    title.textContent = 'Chatbot UTS v1.2.0';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '6px';

    const newBtn = document.createElement('button');
    newBtn.textContent = 'Nueva';
    Object.assign(newBtn.style, {
      background:'transparent', color: prefersDark ? '#e5e7eb' : '#0f172a',
      border:'1px solid ' + borderColor(), borderRadius:'8px', cursor:'pointer', fontSize:'12px', padding:'4px 8px'
    });
    newBtn.onclick = () => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type:'UTS_NEW_CHAT' }, '*');
      }
    };

    const close = document.createElement('button');
    close.textContent = '✖';
    Object.assign(close.style, {
      background:'transparent', color: prefersDark ? '#e5e7eb' : '#0f172a',
      border:'none', cursor:'pointer', fontSize:'16px'
    });
    close.onclick = closeChat;

    right.appendChild(newBtn);
    right.appendChild(close);
    top.appendChild(title);
    top.appendChild(right);

    iframe = document.createElement('iframe');
    iframe.src = CHAT_URL;
    Object.assign(iframe.style, { width:'100%', height:`calc(100% - 40px)`, border:'0' });

    shell.appendChild(top);
    shell.appendChild(iframe);
    document.body.appendChild(shell);
    open = true;
    btn.textContent = '✖';
  }

  function closeChat(){
    if (!open) return;
    shell.remove(); shell = null; iframe = null; open = false;
    btn.textContent = BTN_TEXT;
  }

  btn.addEventListener('click', () => open ? closeChat() : openChat());

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      open ? closeChat() : openChat();
    }
  });
})();
