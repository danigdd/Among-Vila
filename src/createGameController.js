import { findPlayerByID, removePlayerOfGlobalController } from './createPlayer';
import { isDisconnectExpired, validatePlayerCanJoin } from './gameRules';
import {
  cancelDisconnectGrace,
  clearDisconnectGrace,
  deleteGameFromFirebase,
  fetchGame,
  markPlayerDisconnectedNow,
  registerDisconnectGrace,
  saveGame,
} from './gamesFirebase';

export let gamesGlobalController = [];
export let mapsGlobalController = [];

export function syncGameInCache(game) {
  const index = gamesGlobalController.findIndex((g) => g.id == game.id);
  if (index === -1) {
    gamesGlobalController.push(game);
  } else {
    gamesGlobalController[index] = game;
  }
}

export function findGameById(id) {
  return gamesGlobalController.find((element) => element.id == id);
}

export async function persistGame(game) {
  syncGameInCache(game);
  await saveGame(game);
}

export async function addGameToGlobalController(game) {
  await persistGame(game);
}

export async function purgeExpiredPlayers(game) {
  if (!game) return { game: null, gameDeleted: true };

  const expired = [];
  const remaining = [];

  game.currentPlayers.forEach((player) => {
    if (isDisconnectExpired(player.disconnectedAt)) {
      expired.push(player);
    } else {
      remaining.push(player);
    }
  });

  if (expired.length === 0) {
    return { game, gameDeleted: false };
  }

  const hostExpired = expired.some((p) => p.id == game.hostPlayerId);
  expired.forEach((p) => removePlayerOfGlobalController(p.id));
  game.currentPlayers = remaining;

  if (game.currentPlayers.length === 0) {
    await deleteGame(game.id);
    return { game: null, gameDeleted: true };
  }

  if (hostExpired) {
    game.hostPlayerId = pickRandomHost(game);
  }

  await persistGame(game);
  return { game, gameDeleted: false };
}

export async function loadGameWithCleanup(gameId) {
  const remoteGame = await fetchGame(gameId);
  if (!remoteGame) return null;

  syncGameInCache(remoteGame);
  const { game } = await purgeExpiredPlayers(findGameById(gameId));
  return game;
}

export async function findGameByIdRemote(id) {
  return loadGameWithCleanup(id);
}

export async function reconnectPlayer(gameId, playerId) {
  const game = await loadGameWithCleanup(gameId);
  if (!game) return { ok: false, reason: 'missing' };

  const player = game.currentPlayers.find((p) => p.id == playerId);
  if (!player) return { ok: false, reason: 'not_in_room' };

  if (isDisconnectExpired(player.disconnectedAt)) {
    return { ok: false, reason: 'expired' };
  }

  delete player.disconnectedAt;
  await clearDisconnectGrace(gameId, playerId);
  await persistGame(game);
  registerDisconnectGrace(gameId, playerId);
  return { ok: true };
}

export async function softDisconnectPlayer(gameId, playerId) {
  const game = findGameById(gameId);
  if (!game) return;

  const player = game.currentPlayers.find((p) => p.id == playerId);
  if (!player) return;

  player.disconnectedAt = Date.now();
  syncGameInCache(game);
  await markPlayerDisconnectedNow(gameId, playerId);
}

export function isGameHost(gameId, playerId) {
  const game = findGameById(gameId);
  if (!game) return false;
  return game.hostPlayerId == playerId;
}

export async function addPlayerToGame(playerID, gameID) {
  const currentGame = findGameById(gameID);
  const currentPlayer = findPlayerByID(playerID);

  if (!currentGame || !currentPlayer) {
    return { success: false, error: 'No se pudo unir a la sala' };
  }

  const validation = validatePlayerCanJoin(currentGame, currentPlayer);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const alreadyInGame = currentGame.currentPlayers.some(
    (player) => player.id == playerID
  );
  if (!alreadyInGame) {
    currentGame.currentPlayers.push(currentPlayer);
  } else {
    const existing = currentGame.currentPlayers.find(
      (player) => player.id == playerID
    );
    if (existing?.disconnectedAt) {
      delete existing.disconnectedAt;
    }
  }

  if (currentGame.hostPlayerId == null) {
    currentGame.hostPlayerId = playerID;
  }

  await persistGame(currentGame);
  registerDisconnectGrace(gameID, playerID);
  return { success: true };
}

function pickRandomHost(game) {
  if (game.currentPlayers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * game.currentPlayers.length);
  return game.currentPlayers[randomIndex].id;
}

export async function deleteGame(gameId) {
  cancelDisconnectGrace();

  const index = gamesGlobalController.findIndex((game) => game.id == gameId);
  if (index === -1) return false;

  const game = gamesGlobalController[index];
  game.currentPlayers.forEach((player) => {
    removePlayerOfGlobalController(player.id);
  });

  gamesGlobalController.splice(index, 1);
  await deleteGameFromFirebase(gameId);
  return true;
}

export async function deleteGameByHost(gameId, playerId) {
  const game = (await loadGameWithCleanup(gameId)) || findGameById(gameId);
  if (!game || game.hostPlayerId != playerId) return false;
  return deleteGame(gameId);
}

export async function kickPlayerFromGame(gameId, hostPlayerId, targetPlayerId) {
  const game = (await loadGameWithCleanup(gameId)) || findGameById(gameId);

  if (!game || game.hostPlayerId != hostPlayerId) {
    return { success: false };
  }

  if (targetPlayerId == hostPlayerId) {
    return { success: false };
  }

  const originalLength = game.currentPlayers.length;
  game.currentPlayers = game.currentPlayers.filter(
    (player) => player.id != targetPlayerId
  );

  if (game.currentPlayers.length === originalLength) {
    return { success: false };
  }

  removePlayerOfGlobalController(targetPlayerId);
  await persistGame(game);
  return { success: true };
}

export async function leaveGame(gameId, playerId) {
  cancelDisconnectGrace();

  const game = (await loadGameWithCleanup(gameId)) || findGameById(gameId);
  if (!game) {
    return { gameDeleted: true, hostTransferred: false };
  }

  const wasHost = game.hostPlayerId == playerId;

  game.currentPlayers = game.currentPlayers.filter(
    (player) => player.id != playerId
  );
  removePlayerOfGlobalController(playerId);

  if (game.currentPlayers.length === 0) {
    await deleteGame(gameId);
    return { gameDeleted: true, hostTransferred: false };
  }

  if (wasHost) {
    game.hostPlayerId = pickRandomHost(game);
    await persistGame(game);
    return {
      gameDeleted: false,
      hostTransferred: true,
      newHostId: game.hostPlayerId,
    };
  }

  await persistGame(game);
  return { gameDeleted: false, hostTransferred: false };
}
