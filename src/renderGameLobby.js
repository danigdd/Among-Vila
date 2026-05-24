import { renderMain } from './renderMain';
import {
  findGameById,
  isGameHost,
  leaveGame,
  deleteGameByHost,
  syncGameInCache,
} from './createGameController';
import { getCurrentSession, clearCurrentSession } from './sessionContext';
import { subscribeToGame } from './gamesFirebase';
import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import '../styles/renderGameLobbyPage-styles.css';
import arrowLeft from '../resources/back-arrow-icon.svg';
import logo from '../resources/logofull.webp';
import black from '../resources/PLAYERS/black.png';
import blue from '../resources/PLAYERS/blue.png';
import brown from '../resources/PLAYERS/brown.png';
import cyan from '../resources/PLAYERS/cyan.png';
import darkgreen from '../resources/PLAYERS/darkgreen.png';
import darkgrey from '../resources/PLAYERS/darkgrey.png';
import green from '../resources/PLAYERS/green.png';
import keylime from '../resources/PLAYERS/keylime.png';
import lightpurple from '../resources/PLAYERS/lightpurple.png';
import orange from '../resources/PLAYERS/orange.png';
import pink from '../resources/PLAYERS/pink.png';
import purple from '../resources/PLAYERS/purple.png';
import red from '../resources/PLAYERS/red.png';
import white from '../resources/PLAYERS/white.png';
import yellow from '../resources/PLAYERS/yellow.png';

const playerImages = {
  black,
  blue,
  brown,
  cyan,
  darkgreen,
  darkgrey,
  green,
  keylime,
  lightpurple,
  orange,
  pink,
  purple,
  red,
  white,
  yellow,
};

let lobbyUnsubscribe = null;

export function unsubscribeFromLobby() {
  if (lobbyUnsubscribe) {
    lobbyUnsubscribe();
    lobbyUnsubscribe = null;
  }
}

async function exitLobby(gameId, playerId) {
  unsubscribeFromLobby();
  if (gameId && playerId) {
    await leaveGame(gameId, playerId);
  }
  clearCurrentSession();
  renderMain();
}

function paintPlayersGrid(playersOnTableGrid, game, currentPlayerId) {
  playersOnTableGrid.replaceChildren();

  game.currentPlayers.forEach((player) => {
    const color = player.color;
    const playerWrapperDOM = document.createElement('div');
    playerWrapperDOM.className = 'lobbyPlayerWrapper';
    playerWrapperDOM.id = `playerWrapper_id_${player.id}`;

    const playerDivDOM = document.createElement('img');
    playerDivDOM.id = `playerDivDOM_id_${color}_${player.id}`;
    playerDivDOM.className = 'playerDivDOM';
    playerDivDOM.src = playerImages[color];
    playerDivDOM.style.objectFit = 'contain';
    playerDivDOM.style.width = '64px';
    playerDivDOM.style.height = '64px';
    playerWrapperDOM.appendChild(playerDivDOM);

    const playerNameDOM = document.createElement('div');
    playerNameDOM.className = 'lobbyPlayerName';
    playerNameDOM.textContent = player.name?.trim() || `Jugador ${color}`;
    if (player.id == currentPlayerId) {
      playerNameDOM.textContent += ' (tú)';
    }
    if (player.id == game.hostPlayerId) {
      playerNameDOM.textContent += ' ★';
    }
    playerWrapperDOM.appendChild(playerNameDOM);

    playersOnTableGrid.appendChild(playerWrapperDOM);
  });
}

function updateLobbyFromGame(game, currentPlayerId, ui) {
  ui.hostBadgeDOM.textContent = isGameHost(game.id, currentPlayerId)
    ? 'Eres el host de la sala'
    : 'Estás en la sala';

  paintPlayersGrid(ui.playersOnTableGrid, game, currentPlayerId);

  if (game.currentPlayers.length > 4) {
    ui.startGameDOM.className = 'ready';
  } else {
    ui.startGameDOM.className = 'notReady';
  }
}

export function renderGameLobby(id) {
  const session = getCurrentSession();
  const currentPlayerId = session?.playerId;

  const game = findGameById(id);
  if (!game || !currentPlayerId) {
    clearCurrentSession();
    renderMain();
    return;
  }

  unsubscribeFromLobby();

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
    exitLobby(id, currentPlayerId);
  });

  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  const titleGameLobbyDOM = document.createElement('div');
  titleGameLobbyDOM.id = 'titleGameLobby_id';
  titleGameLobbyDOM.className = 'mainText';
  titleGameLobbyDOM.textContent = 'Comparte el código de sala:';
  root.appendChild(titleGameLobbyDOM);

  const gameIDDOM = document.createElement('div');
  gameIDDOM.id = 'gameIDDOM_id';
  gameIDDOM.className = 'mainText';
  gameIDDOM.textContent = id;
  gameIDDOM.style.fontSize = '40px';
  root.appendChild(gameIDDOM);

  const hostBadgeDOM = document.createElement('div');
  hostBadgeDOM.id = 'hostBadge_id';
  hostBadgeDOM.className = 'secondaryText';
  hostBadgeDOM.style.marginTop = '10px';
  root.appendChild(hostBadgeDOM);

  const playersOnTableGrid = document.createElement('div');
  playersOnTableGrid.id = 'playersOnTableGrid';
  playersOnTableGrid.style.display = 'grid';
  playersOnTableGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  playersOnTableGrid.style.gridTemplateRows = 'repeat(4, auto)';
  playersOnTableGrid.style.gap = '25px';
  playersOnTableGrid.style.padding = '10px';
  playersOnTableGrid.style.marginTop = '40px';
  root.appendChild(playersOnTableGrid);

  const lobbyActionsDOM = document.createElement('div');
  lobbyActionsDOM.id = 'lobbyActions_id';
  root.appendChild(lobbyActionsDOM);

  const leaveRoomButtonDOM = document.createElement('button');
  leaveRoomButtonDOM.id = 'leaveRoomButton_id';
  leaveRoomButtonDOM.className = 'createButtons lobbyActionButton';
  leaveRoomButtonDOM.textContent = 'Abandonar sala';
  lobbyActionsDOM.appendChild(leaveRoomButtonDOM);

  leaveRoomButtonDOM.addEventListener('click', () => {
    exitLobby(id, currentPlayerId);
  });

  if (isGameHost(id, currentPlayerId)) {
    const deleteRoomButtonDOM = document.createElement('button');
    deleteRoomButtonDOM.id = 'deleteRoomButton_id';
    deleteRoomButtonDOM.className =
      'createButtons lobbyActionButton lobbyDangerButton';
    deleteRoomButtonDOM.textContent = 'Borrar sala';
    lobbyActionsDOM.appendChild(deleteRoomButtonDOM);

    deleteRoomButtonDOM.addEventListener('click', async () => {
      unsubscribeFromLobby();
      await deleteGameByHost(id, currentPlayerId);
      clearCurrentSession();
      renderMain();
    });
  }

  const startGameDOM = document.createElement('button');
  startGameDOM.id = 'startGameButton_id';
  startGameDOM.className = 'notReady';
  startGameDOM.textContent = 'Comenzar';
  root.appendChild(startGameDOM);

  const ui = { hostBadgeDOM, playersOnTableGrid, startGameDOM };
  updateLobbyFromGame(game, currentPlayerId, ui);

  lobbyUnsubscribe = subscribeToGame(id, (remoteGame) => {
    if (!remoteGame) {
      unsubscribeFromLobby();
      clearCurrentSession();
      renderMain();
      return;
    }

    syncGameInCache(remoteGame);
    updateLobbyFromGame(remoteGame, currentPlayerId, ui);
  });
}
