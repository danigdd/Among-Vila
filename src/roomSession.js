import {
  findGameByIdRemote,
  reconnectPlayer,
  softDisconnectPlayer,
} from './createGameController';
import { isDisconnectExpired, isPlayerInGrace } from './gameRules';
import { renderGameLobby } from './renderGameLobby';
import { renderJoinGame } from './renderJoinGame';
import { renderMain } from './renderMain';
import { clearRoomUrl, setRoomUrl } from './roomRouting';
import { clearCurrentSession, getCurrentSession } from './sessionContext';

export async function tryRestoreRoomSession(gameId) {
  const session = getCurrentSession();
  if (!session || session.gameId != gameId) {
    return false;
  }

  const game = await findGameByIdRemote(gameId);
  if (!game) {
    clearCurrentSession();
    return false;
  }

  const player = game.currentPlayers.find((p) => p.id == session.playerId);
  if (!player) {
    clearCurrentSession();
    return false;
  }

  if (isDisconnectExpired(player.disconnectedAt)) {
    clearCurrentSession();
    return false;
  }

  const result = await reconnectPlayer(gameId, session.playerId);
  if (!result.ok) {
    clearCurrentSession();
    return false;
  }

  setRoomUrl(gameId);
  renderGameLobby(gameId);
  return true;
}

export async function handleRoomUrlOnLoad(gameId) {
  const restored = await tryRestoreRoomSession(gameId);
  if (restored) return true;

  renderJoinGame(gameId);
  return false;
}

export async function handleSoftLeaveFromRoom() {
  const session = getCurrentSession();
  if (!session) return;

  await softDisconnectPlayer(session.gameId, session.playerId);
  clearRoomUrl();
  renderMain();
}

export function setupPageDisconnectHandlers() {
  window.addEventListener('pagehide', () => {
    const session = getCurrentSession();
    if (!session) return;

    const gameId = session.gameId;
    const playerId = session.playerId;

    softDisconnectPlayer(gameId, playerId);
  });
}

export function setupPopstateHandler() {
  window.addEventListener('popstate', async () => {
    const pathGameId = window.location.pathname.match(/^\/(\d{6})\/?$/)?.[1];
    const session = getCurrentSession();

    if (pathGameId && session?.gameId == pathGameId) {
      const game = await findGameByIdRemote(pathGameId);
      const player = game?.currentPlayers.find((p) => p.id == session.playerId);
      if (player && (isPlayerInGrace(player) || !player.disconnectedAt)) {
        await reconnectPlayer(pathGameId, session.playerId);
        renderGameLobby(pathGameId);
      }
      return;
    }

    if (!pathGameId && session) {
      await handleSoftLeaveFromRoom();
    }
  });
}
