export function parseGameIdFromPath() {
  const match = window.location.pathname.match(/^\/(\d{6})\/?$/);
  return match ? match[1] : null;
}

export function setRoomUrl(gameId) {
  const path = `/${gameId}`;
  if (window.location.pathname !== path) {
    window.history.pushState({ gameId: String(gameId) }, '', path);
  }
}

export function clearRoomUrl() {
  if (window.location.pathname !== '/') {
    window.history.pushState({}, '', '/');
  }
}
