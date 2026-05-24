const GAME_ID_KEY = 'amongVila_currentGameId';
const PLAYER_ID_KEY = 'amongVila_currentPlayerId';

export function setCurrentSession(gameId, playerId) {
  sessionStorage.setItem(GAME_ID_KEY, String(gameId));
  sessionStorage.setItem(PLAYER_ID_KEY, String(playerId));
}

export function getCurrentSession() {
  const gameId = sessionStorage.getItem(GAME_ID_KEY);
  const playerId = sessionStorage.getItem(PLAYER_ID_KEY);

  if (!gameId || !playerId) return null;

  return { gameId, playerId };
}

export function clearCurrentSession() {
  sessionStorage.removeItem(GAME_ID_KEY);
  sessionStorage.removeItem(PLAYER_ID_KEY);
}
