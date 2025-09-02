const els = {
  totalConversations: document.getElementById('totalConversations'),
  satisfactionRate: document.getElementById('satisfactionRate'),
  satisfactionBar: document.getElementById('satisfactionBar'),
  feedbackTotal: document.getElementById('feedbackTotal'),
  feedbackPos: document.getElementById('feedbackPos'),
  lastConversations: document.getElementById('lastConversations'),
  statusMetrics: document.getElementById('statusMetrics'),
  modelName: document.getElementById('modelName'),
  reloadBtn: document.getElementById('reloadBtn')
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderTable(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    els.lastConversations.innerHTML = `<tr><td colspan="5" class="muted">Sin datos…</td></tr>`;
    return;
  }

  const html = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.tipo_usuario || '—'}</td>
      <td title="${escapeHTML(r.pregunta)}">${truncate(r.pregunta, 70)}</td>
      <td title="${escapeHTML(r.respuesta_preview)}">${truncate(r.respuesta_preview || '', 90)}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
    </tr>
  `).join('');
  els.lastConversations.innerHTML = html;
}

function truncate(text, n) {
  return (text?.length || 0) > n ? text.slice(0, n - 1) + '…' : (text || '');
}
function escapeHTML(s='') { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function loadMetrics() {
  try {
    els.statusMetrics.textContent = 'Cargando…';
    const data = await fetchJSON('/api/admin/metrics');

    if (!data?.success) throw new Error('Respuesta inválida');
    const { totalConversations, lastConversations, feedback } = data.data;

    // Cards
    els.totalConversations.textContent = totalConversations ?? 0;
    const sat = Number(feedback?.satisfaction ?? 0);
    els.satisfactionRate.textContent = `${sat}%`;
    els.satisfactionBar.style.width = `${Math.max(0, Math.min(100, sat))}%`;
    els.feedbackTotal.textContent = feedback?.total ?? 0;
    els.feedbackPos.textContent = `${feedback?.positives ?? 0} positivos`;

    // Tabla
    renderTable(lastConversations);

    // Estado
    els.statusMetrics.textContent = 'OK';
    els.statusMetrics.style.background = 'rgba(34,197,94,.2)';
    els.statusMetrics.style.borderColor = '#22c55e';
  } catch (err) {
    console.error('metrics error:', err);
    els.statusMetrics.textContent = 'ERROR';
    els.statusMetrics.style.background = 'rgba(239,68,68,.2)';
    els.statusMetrics.style.borderColor = '#ef4444';
  }
}

// Recoger el nombre del modelo desde la última respuesta del chat (si quieres)
async function peekModelName() {
  // Este valor depende de que el front del chat te envíe `meta.model`.
  // Como ejemplo, mostramos el valor de USE_LLM si está expuesto en /api/health.
  try {
    const health = await fetchJSON('/api/health');
    // No exponemos USE_LLM allí; deja un texto base para evitar filtraciones de .env
    els.modelName.textContent = 'desde respuestas (meta.model)';
  } catch {
    /* ignore */
  }
}

function start() {
  loadMetrics();
  peekModelName();
  // Auto-refresh cada 10s
  const interval = setInterval(loadMetrics, 10000);
  els.reloadBtn.addEventListener('click', loadMetrics);
  window.addEventListener('beforeunload', () => clearInterval(interval));
}

document.addEventListener('DOMContentLoaded', start);
