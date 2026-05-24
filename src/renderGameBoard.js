import { renderMain } from './renderMain';
import { findGameById } from './createGameController';
import { clearCurrentSession, getCurrentSession } from './sessionContext';
import { clearRoomUrl, setRoomUrl } from './roomRouting';
import '../styles/general-styles.css';
import '../styles/gameBoard-styles.css';

export function renderGameBoard(id) {
  const session = getCurrentSession();
  const game = findGameById(id);

  if (!game || !session?.playerId) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain();
    return;
  }

  const player = game.currentPlayers.find((p) => p.id == session.playerId);
  if (!player) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain('Te han expulsado de la sala');
    return;
  }

  setRoomUrl(id);

  const oldRoot = document.getElementById('content');
  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation', 'gameBoardScreen');
  oldRoot.replaceWith(root);
}
