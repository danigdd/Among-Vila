import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import { getFirebaseDatabase, isFirebaseReady } from './firebaseApp';

let activeDisconnectCancel = null;

function playersArrayToMap(players) {
  const map = {};
  (players || []).forEach((player) => {
    const entry = {
      id: player.id,
      name: player.name,
      color: player.color,
    };
    if (player.role) {
      entry.role = player.role;
    }
    if (player.roleRevealed) {
      entry.roleRevealed = player.roleRevealed;
    }
    if (player.disconnectedAt) {
      entry.disconnectedAt = player.disconnectedAt;
    }
    map[player.id] = entry;
  });
  return map;
}

function playersMapToArray(playersMap) {
  if (!playersMap) return [];
  if (Array.isArray(playersMap)) return playersMap;
  return Object.values(playersMap);
}

export function serializeGame(game) {
  return {
    ...game,
    currentPlayers: playersArrayToMap(game.currentPlayers),
  };
}

export function deserializeGame(data) {
  if (!data) return null;
  return {
    ...data,
    currentPlayers: playersMapToArray(data.currentPlayers),
  };
}

function gameRef(gameId) {
  return ref(getFirebaseDatabase(), `games/${gameId}`);
}

function playerDisconnectRef(gameId, playerId) {
  return ref(
    getFirebaseDatabase(),
    `games/${gameId}/currentPlayers/${playerId}/disconnectedAt`
  );
}

export function cancelDisconnectGrace() {
  if (activeDisconnectCancel) {
    activeDisconnectCancel.cancel().catch(() => {});
    activeDisconnectCancel = null;
  }
}

export function registerDisconnectGrace(gameId, playerId) {
  if (!isFirebaseReady()) return;

  cancelDisconnectGrace();

  const disconnectRef = playerDisconnectRef(gameId, playerId);
  activeDisconnectCancel = onDisconnect(disconnectRef);
  activeDisconnectCancel.set(Date.now());
}

export async function clearDisconnectGrace(gameId, playerId) {
  if (!isFirebaseReady()) return;

  cancelDisconnectGrace();

  await update(
    ref(
      getFirebaseDatabase(),
      `games/${gameId}/currentPlayers/${playerId}`
    ),
    { disconnectedAt: null }
  );
}

export async function markPlayerDisconnectedNow(gameId, playerId) {
  if (!isFirebaseReady()) return;
  await update(playerDisconnectRef(gameId, playerId), Date.now());
}

export async function saveGame(game) {
  if (!isFirebaseReady()) return;
  await set(gameRef(game.id), serializeGame(game));
}

export async function fetchGame(gameId) {
  if (!isFirebaseReady()) return null;
  const snapshot = await get(gameRef(gameId));
  if (!snapshot.exists()) return null;
  return deserializeGame(snapshot.val());
}

export async function deleteGameFromFirebase(gameId) {
  if (!isFirebaseReady()) return;
  cancelDisconnectGrace();
  await remove(gameRef(gameId));
}

export function subscribeToGame(gameId, callback) {
  if (!isFirebaseReady()) return () => {};

  return onValue(gameRef(gameId), (snapshot) => {
    callback(snapshot.exists() ? deserializeGame(snapshot.val()) : null);
  });
}
