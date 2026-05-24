const SESSION_KEY = 'amongVila_session';

export function setCurrentSession(gameId, playerId) {
  const session = {
    gameId: String(gameId),
    playerId: String(playerId),
    savedAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.gameId || !session?.playerId) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearCurrentSession() {
  localStorage.removeItem(SESSION_KEY);
}
