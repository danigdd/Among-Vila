export const MIN_PLAYERS_TO_START = 4;

export function getMaxPlayers(game) {
  const max = parseInt(game?.numberPlayers, 10);
  return Number.isNaN(max) ? 14 : max;
}

export function normalizePlayerName(name) {
  return (name || '').trim().toLowerCase();
}

export function isRoomFull(game) {
  if (!game) return true;
  return game.currentPlayers.length >= getMaxPlayers(game);
}

export function getTakenColors(game) {
  return new Set((game?.currentPlayers || []).map((player) => player.color));
}

export function getTakenNames(game) {
  return new Set(
    (game?.currentPlayers || []).map((player) => normalizePlayerName(player.name))
  );
}

export function canStartGame(game) {
  if (!game) return false;
  return game.currentPlayers.length >= MIN_PLAYERS_TO_START;
}

export function validatePlayerCanJoin(game, player) {
  if (!game) {
    return { ok: false, error: 'La sala no existe' };
  }

  const alreadyInGame = game.currentPlayers.some((p) => p.id == player.id);

  if (!alreadyInGame && isRoomFull(game)) {
    const max = getMaxPlayers(game);
    return {
      ok: false,
      error: `La sala está llena (${max} jugadores máximo)`,
    };
  }

  const nameNorm = normalizePlayerName(player.name);
  if (!nameNorm) {
    return { ok: false, error: 'Introduce un nombre válido' };
  }

  const duplicateName = game.currentPlayers.some(
    (p) => p.id != player.id && normalizePlayerName(p.name) === nameNorm
  );
  if (duplicateName) {
    return { ok: false, error: 'Ese nombre ya está en la sala' };
  }

  const duplicateColor = game.currentPlayers.some(
    (p) => p.id != player.id && p.color === player.color
  );
  if (duplicateColor) {
    return { ok: false, error: 'Ese color ya está en la sala' };
  }

  return { ok: true };
}
