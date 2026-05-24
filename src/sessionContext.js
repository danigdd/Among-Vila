const SESSION_KEY = 'amongVila_session';

function getSessionStore() {
  return window.sessionStorage;
}

export function setCurrentSession(gameId, playerId) {
  const session = {
    gameId: String(gameId),
    playerId: String(playerId),
    savedAt: Date.now(),
  };
  getSessionStore().setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentSession() {
  try {
    const raw = getSessionStore().getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.gameId || !session?.playerId) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearCurrentSession() {
  getSessionStore().removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}
