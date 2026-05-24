import { renderGameBoard } from './renderGameBoard';
import { renderMain } from './renderMain';
import {
  findGameById,
  purgeExpiredPlayers,
  revealPlayerRole,
  syncGameInCache,
} from './createGameController';
import { clearCurrentSession, getCurrentSession } from './sessionContext';
import {
  cancelDisconnectGrace,
  registerDisconnectGrace,
  subscribeToGame,
} from './gamesFirebase';
import { clearRoomUrl, setRoomUrl } from './roomRouting';
import '../styles/general-styles.css';
import '../styles/roleReveal-styles.css';

let roleRevealUnsubscribe = null;

function unsubscribeFromRoleReveal() {
  if (roleRevealUnsubscribe) {
    roleRevealUnsubscribe();
    roleRevealUnsubscribe = null;
  }
}

function getPlayer(game, playerId) {
  return game.currentPlayers.find((player) => player.id == playerId);
}

function updateRoleRevealScreen(game, playerId, ui) {
  const player = getPlayer(game, playerId);
  const revealedCount = game.currentPlayers.filter(
    (currentPlayer) => currentPlayer.roleRevealed
  ).length;
  const totalPlayers = game.currentPlayers.length;

  ui.progressDOM.textContent = `${revealedCount}/${totalPlayers}`;

  if (!player?.roleRevealed) {
    ui.roleDOM.textContent = '';
    ui.roleDOM.className = 'roleResultText roleHidden';
    ui.revealButtonDOM.style.display = 'block';
    ui.revealButtonDOM.disabled = false;
    return;
  }

  const isImpostor = player.role === 'impostor';
  ui.roleDOM.textContent = isImpostor ? 'Impostor' : 'Inocente';
  ui.roleDOM.className = isImpostor
    ? 'roleResultText roleImpostor'
    : 'roleResultText roleInnocent';
  ui.revealButtonDOM.style.display = 'none';
}

export function renderRoleReveal(id) {
  const session = getCurrentSession();
  const currentPlayerId = session?.playerId;
  const game = findGameById(id);

  if (!game || !currentPlayerId) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain();
    return;
  }

  const player = getPlayer(game, currentPlayerId);
  if (!player) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain('Te han expulsado de la sala');
    return;
  }

  if (game.phase === 'inGame') {
    renderGameBoard(id);
    return;
  }

  unsubscribeFromRoleReveal();
  setRoomUrl(id);
  registerDisconnectGrace(id, currentPlayerId);

  const oldRoot = document.getElementById('content');
  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation', 'roleRevealScreen');
  oldRoot.replaceWith(root);

  const titleDOM = document.createElement('div');
  titleDOM.id = 'roleRevealTitle_id';
  titleDOM.className = 'mainText';
  titleDOM.textContent = 'Revela tu rol';
  root.appendChild(titleDOM);

  const roleDOM = document.createElement('div');
  roleDOM.id = 'roleResult_id';
  roleDOM.className = 'roleResultText';
  root.appendChild(roleDOM);

  const revealButtonDOM = document.createElement('button');
  revealButtonDOM.id = 'revealRoleButton_id';
  revealButtonDOM.className = 'createButtons';
  revealButtonDOM.textContent = 'Revelar';
  root.appendChild(revealButtonDOM);

  const progressDOM = document.createElement('div');
  progressDOM.id = 'roleRevealProgress_id';
  progressDOM.className = 'secondaryText';
  root.appendChild(progressDOM);

  const ui = { progressDOM, revealButtonDOM, roleDOM };
  updateRoleRevealScreen(game, currentPlayerId, ui);

  revealButtonDOM.addEventListener('click', async () => {
    revealButtonDOM.disabled = true;
    await revealPlayerRole(id, currentPlayerId);
  });

  roleRevealUnsubscribe = subscribeToGame(id, async (remoteGame) => {
    if (!remoteGame) {
      unsubscribeFromRoleReveal();
      clearCurrentSession();
      clearRoomUrl();
      renderMain();
      return;
    }

    syncGameInCache(remoteGame);
    const { game: cleanedGame, gameDeleted } = await purgeExpiredPlayers(
      findGameById(id)
    );

    if (gameDeleted || !cleanedGame) {
      unsubscribeFromRoleReveal();
      clearCurrentSession();
      clearRoomUrl();
      renderMain();
      return;
    }

    const currentPlayer = getPlayer(cleanedGame, currentPlayerId);
    if (!currentPlayer) {
      unsubscribeFromRoleReveal();
      cancelDisconnectGrace();
      clearCurrentSession();
      clearRoomUrl();
      renderMain('Te han expulsado de la sala');
      return;
    }

    if (cleanedGame.phase === 'inGame') {
      unsubscribeFromRoleReveal();
      renderGameBoard(id);
      return;
    }

    updateRoleRevealScreen(cleanedGame, currentPlayerId, ui);
  });
}
