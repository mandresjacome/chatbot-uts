export function ensureSessionId(sessionId) {
  if (sessionId && String(sessionId).trim()) return String(sessionId).trim();
  // pseudo-uuid simple
  const r = Math.random().toString(36).slice(2, 8);
  return `sess_${Date.now()}_${r}`;
}
