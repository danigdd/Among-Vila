import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import '../styles/createPlayer-styles.css';
import { renderMain } from './renderMain';
import { renderCreatePlayer } from './renderCreatePlayer';
import { isRoomFull, getMaxPlayers } from './gameRules';
import { joinGame } from './joinGameController';
import { tryRestoreRoomSession } from './roomSession';
import { getCurrentSession } from './sessionContext';
import { clearRoomUrl } from './roomRouting';
import arrowLeft from '../resources/back-arrow-icon.svg';
import logo from '../resources/logofull.webp';

export function renderJoinGame(prefilledGameId = null) {
  const oldRoot = document.getElementById('content');

  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation');

  oldRoot.replaceWith(root);

  const returnMainPageDOM = document.createElement('img');
  returnMainPageDOM.id = 'returnMainPage_id';
  returnMainPageDOM.src = arrowLeft;
  returnMainPageDOM.style.objectFit = 'contain';
  root.appendChild(returnMainPageDOM);

  returnMainPageDOM.addEventListener('click', () => {
    clearRoomUrl();
    renderMain();
  });

  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  const titleJoinGameDOM = document.createElement('div');
  titleJoinGameDOM.id = 'titleJoinGame_id';
  titleJoinGameDOM.className = 'mainText';
  titleJoinGameDOM.textContent = 'Introduce el código de sala:';
  root.appendChild(titleJoinGameDOM);

  const gameCodeInputDOM = document.createElement('input');
  gameCodeInputDOM.id = 'textArea_id';
  gameCodeInputDOM.type = 'text';
  gameCodeInputDOM.inputMode = 'numeric';
  gameCodeInputDOM.maxLength = 6;
  gameCodeInputDOM.placeholder = 'Ej: 123456';
  if (prefilledGameId) {
    gameCodeInputDOM.value = String(prefilledGameId);
  }
  root.appendChild(gameCodeInputDOM);

  const errorMessageDOM = document.createElement('div');
  errorMessageDOM.id = 'joinGameError_id';
  errorMessageDOM.className = 'secondaryText';
  errorMessageDOM.style.marginTop = '10px';
  errorMessageDOM.style.minHeight = '30px';
  errorMessageDOM.style.color = '#e74c3c';
  root.appendChild(errorMessageDOM);

  const joinRoomButtonDOM = document.createElement('button');
  joinRoomButtonDOM.id = 'joinRoomButton_id';
  joinRoomButtonDOM.className = 'createButtons';
  joinRoomButtonDOM.textContent = 'Unirse';
  root.appendChild(joinRoomButtonDOM);

  joinRoomButtonDOM.addEventListener('click', async () => {
    const gameId = gameCodeInputDOM.value.trim();
    errorMessageDOM.textContent = '';

    if (!gameId) {
      errorMessageDOM.textContent = 'Introduce un código de sala válido';
      return;
    }

    joinRoomButtonDOM.disabled = true;
    joinRoomButtonDOM.textContent = 'Buscando sala...';

    try {
      const session = getCurrentSession();
      if (session?.gameId == gameId) {
        const restored = await tryRestoreRoomSession(gameId);
        if (restored) return;
      }

      const game = await joinGame(gameId);

      if (!game) {
        errorMessageDOM.textContent =
          'No se encontró ninguna sala con ese código';
        return;
      }

      if (game.phase && game.phase !== 'lobby') {
        errorMessageDOM.textContent = 'La partida ya ha empezado';
        return;
      }

      if (isRoomFull(game)) {
        errorMessageDOM.textContent = `La sala está llena (${getMaxPlayers(game)} jugadores máximo)`;
        return;
      }

      renderCreatePlayer(gameId);
    } finally {
      joinRoomButtonDOM.disabled = false;
      joinRoomButtonDOM.textContent = 'Unirse';
    }
  });
}
