import '../styles/general-styles.css';
import '../styles/createPlayer-styles.css';
import { createPlayer, removePlayerOfGlobalController } from './createPlayer';
import { renderMain } from './renderMain';
import { renderGameLobby } from './renderGameLobby';
import { addPlayerToGame, findGameByIdRemote } from './createGameController';
import {
  getTakenColors,
  getTakenNames,
  getMaxPlayers,
  isRoomFull,
  normalizePlayerName,
} from './gameRules';
import { setCurrentSession } from './sessionContext';
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

const ALL_COLORS = [
  'black',
  'blue',
  'brown',
  'cyan',
  'darkgreen',
  'darkgrey',
  'green',
  'keylime',
  'lightpurple',
  'orange',
  'pink',
  'red',
  'white',
  'yellow',
];

function applyTakenColors(playersOnTableGrid, takenColors, choosenPlayer) {
  playersOnTableGrid.querySelectorAll('[data-color]').forEach((img) => {
    const color = img.dataset.color;
    const isTaken = takenColors.has(color);

    if (isTaken) {
      img.className = 'playerToChoose_taken';
      img.title = 'Color ocupado';
      if (choosenPlayer[0] === img.id) {
        choosenPlayer.length = 0;
      }
    } else {
      img.className =
        choosenPlayer[0] === img.id
          ? 'playerToChoose_Choosen'
          : 'playerToChoose_notChoosen';
      img.title = '';
    }
  });
}

function pickFirstAvailableColor(playersOnTableGrid, takenColors) {
  const firstFree = ALL_COLORS.find((color) => !takenColors.has(color));
  if (!firstFree) return null;

  const img = playersOnTableGrid.querySelector(`[data-color="${firstFree}"]`);
  if (img) {
    playersOnTableGrid.querySelectorAll('[data-color]').forEach((el) => {
      if (!takenColors.has(el.dataset.color)) {
        el.className = 'playerToChoose_notChoosen';
      }
    });
    img.className = 'playerToChoose_Choosen';
    return img.id;
  }
  return null;
}

function buildCreatePlayerScreen(game, idGame) {
  const oldRoot = document.getElementById('content');
  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation');
  oldRoot.replaceWith(root);

  const takenColors = getTakenColors(game);
  const takenNames = getTakenNames(game);
  const maxPlayers = getMaxPlayers(game);

  const returnMainPageDOM = document.createElement('img');
  returnMainPageDOM.id = 'returnMainPage_id';
  returnMainPageDOM.src = arrowLeft;
  returnMainPageDOM.style.objectFit = 'contain';
  root.appendChild(returnMainPageDOM);

  returnMainPageDOM.addEventListener('click', () => {
    renderMain();
  });

  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  const titlePlayerCreationDOM = document.createElement('div');
  titlePlayerCreationDOM.id = 'titlePlayerCreation_id';
  titlePlayerCreationDOM.className = 'mainText';
  titlePlayerCreationDOM.textContent = 'Elige tu nombre e ícono:';
  root.appendChild(titlePlayerCreationDOM);

  const roomInfoDOM = document.createElement('div');
  roomInfoDOM.className = 'secondaryText';
  roomInfoDOM.style.marginTop = '10px';
  roomInfoDOM.textContent = `Jugadores en sala: ${game.currentPlayers.length}/${maxPlayers}`;
  root.appendChild(roomInfoDOM);

  const playerNameInputDOM = document.createElement('input');
  playerNameInputDOM.id = 'textArea_id';
  playerNameInputDOM.placeholder = 'Introduce tu nombre...';
  root.appendChild(playerNameInputDOM);

  const errorMessageDOM = document.createElement('div');
  errorMessageDOM.id = 'createPlayerError_id';
  errorMessageDOM.className = 'secondaryText';
  errorMessageDOM.style.marginTop = '10px';
  errorMessageDOM.style.minHeight = '24px';
  errorMessageDOM.style.color = '#e74c3c';
  root.appendChild(errorMessageDOM);

  playerNameInputDOM.addEventListener('input', () => {
    const nameNorm = normalizePlayerName(playerNameInputDOM.value);
    if (nameNorm && takenNames.has(nameNorm)) {
      errorMessageDOM.textContent = 'Ese nombre ya está en la sala';
    } else {
      errorMessageDOM.textContent = '';
    }
  });

  const playersOnTableGrid = document.createElement('div');
  playersOnTableGrid.id = 'playersOnTableGrid';
  playersOnTableGrid.className = 'colorPickerGrid';
  root.appendChild(playersOnTableGrid);

  const choosenPlayer = [];

  ALL_COLORS.forEach((color) => {
    const playerToChoose = document.createElement('img');
    playerToChoose.id = `playerToChoose_id_${color}`;
    playerToChoose.dataset.color = color;
    playerToChoose.src = playerImages[color];
    playerToChoose.style.objectFit = 'contain';
    playerToChoose.style.width = '50px';
    playerToChoose.style.height = '50px';
    playersOnTableGrid.appendChild(playerToChoose);

    playerToChoose.addEventListener('click', () => {
      if (getTakenColors(game).has(color)) return;

      playersOnTableGrid.querySelectorAll('[data-color]').forEach((el) => {
        if (!getTakenColors(game).has(el.dataset.color)) {
          el.className = 'playerToChoose_notChoosen';
        }
      });

      playerToChoose.className = 'playerToChoose_Choosen';
      choosenPlayer.length = 0;
      choosenPlayer.push(playerToChoose.id);
      errorMessageDOM.textContent = '';
    });
  });

  const firstPick = pickFirstAvailableColor(playersOnTableGrid, takenColors);
  if (firstPick) choosenPlayer.push(firstPick);
  applyTakenColors(playersOnTableGrid, takenColors, choosenPlayer);

  const loadLobbyDOM = document.createElement('button');
  loadLobbyDOM.id = 'loadLobbyDOM_id';
  loadLobbyDOM.className = 'createButtons';
  loadLobbyDOM.textContent = 'Unirse';
  root.appendChild(loadLobbyDOM);

  loadLobbyDOM.addEventListener('click', async () => {
    errorMessageDOM.textContent = '';

    const selectedFinalColorDOM = playersOnTableGrid.querySelector(
      '.playerToChoose_Choosen'
    );
    if (!selectedFinalColorDOM) {
      errorMessageDOM.textContent = 'Elige un color libre';
      return;
    }

    const selectedFinalColorValue = selectedFinalColorDOM.dataset.color;
    const selectedUsername = playerNameInputDOM.value.trim();

    if (!selectedUsername) {
      errorMessageDOM.textContent = 'Introduce un nombre válido';
      return;
    }

    const nameNorm = normalizePlayerName(selectedUsername);
    if (takenNames.has(nameNorm)) {
      errorMessageDOM.textContent = 'Ese nombre ya está en la sala';
      return;
    }

    if (getTakenColors(game).has(selectedFinalColorValue)) {
      errorMessageDOM.textContent = 'Ese color ya está en la sala';
      return;
    }

    const latestGame = await findGameByIdRemote(idGame);
    if (!latestGame) {
      errorMessageDOM.textContent = 'La sala ya no existe';
      return;
    }

    if (isRoomFull(latestGame)) {
      errorMessageDOM.textContent = `La sala está llena (${getMaxPlayers(latestGame)} jugadores máximo)`;
      return;
    }

    const playerObject = createPlayer(selectedUsername, selectedFinalColorValue);

    loadLobbyDOM.disabled = true;
    loadLobbyDOM.textContent = 'Entrando...';

    try {
      const result = await addPlayerToGame(playerObject.id, idGame);

      if (!result.success) {
        removePlayerOfGlobalController(playerObject.id);
        errorMessageDOM.textContent = result.error;
        return;
      }

      setCurrentSession(idGame, playerObject.id);
      renderGameLobby(idGame);
    } finally {
      loadLobbyDOM.disabled = false;
      loadLobbyDOM.textContent = 'Unirse';
    }
  });
}

export async function renderCreatePlayer(idGame) {
  const oldRoot = document.getElementById('content');
  const loadingRoot = document.createElement('div');
  loadingRoot.id = 'content';
  loadingRoot.className = 'mainText';
  loadingRoot.textContent = 'Cargando sala...';
  oldRoot.replaceWith(loadingRoot);

  const game = await findGameByIdRemote(idGame);

  if (!game) {
    renderMain();
    return;
  }

  if (isRoomFull(game)) {
    const fullRoot = document.createElement('div');
    fullRoot.id = 'content';
    fullRoot.className = 'mainText';
    fullRoot.textContent = `La sala está llena (${getMaxPlayers(game)} jugadores máximo)`;
    loadingRoot.replaceWith(fullRoot);
    setTimeout(() => renderMain(), 2500);
    return;
  }

  buildCreatePlayerScreen(game, idGame);
}
