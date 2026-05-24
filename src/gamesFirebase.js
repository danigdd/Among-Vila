import { get, onValue, ref, remove, set } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseReady } from './firebaseApp';

function playersArrayToMap(players) {
  const map = {};
  (players || []).forEach((player) => {
    map[player.id] = {
      id: player.id,
      name: player.name,
      color: player.color,
    };
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
  await remove(gameRef(gameId));
}

export function subscribeToGame(gameId, callback) {
  if (!isFirebaseReady()) return () => {};

  return onValue(gameRef(gameId), (snapshot) => {
    callback(snapshot.exists() ? deserializeGame(snapshot.val()) : null);
  });
}
