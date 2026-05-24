import { findPlayerByID, removePlayerOfGlobalController } from './createPlayer';
import { validatePlayerCanJoin } from './gameRules';
import {
  deleteGameFromFirebase,
  fetchGame,
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

export async function findGameByIdRemote(id) {
  const cached = findGameById(id);
  if (cached) return cached;

  const remoteGame = await fetchGame(id);
  if (remoteGame) syncGameInCache(remoteGame);
  return remoteGame || null;
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
  }

  if (currentGame.hostPlayerId == null) {
    currentGame.hostPlayerId = playerID;
  }

  await persistGame(currentGame);
  return { success: true };
}

function pickRandomHost(game) {
  if (game.currentPlayers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * game.currentPlayers.length);
  return game.currentPlayers[randomIndex].id;
}

export async function deleteGame(gameId) {
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
  const game = findGameById(gameId);
  if (!game || game.hostPlayerId != playerId) return false;
  return deleteGame(gameId);
}

export async function leaveGame(gameId, playerId) {
  const game = findGameById(gameId);
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
