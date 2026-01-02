import '../styles/general-styles.css';
import '../styles/createPlayer-styles.css';
import { createPlayer } from './createPlayer';
import { renderMain } from './renderMain';
import { renderGameLobby } from './renderGameLobby';
import { addPlayerToGame } from './createGameController';
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

export function renderCreatePlayer(idGame) {
  const oldRoot = document.getElementById('content');

  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation');

  oldRoot.replaceWith(root);

  // RETURN BUTTON
  const returnMainPageDOM = document.createElement('img');
  returnMainPageDOM.id = 'returnMainPage_id';
  returnMainPageDOM.src = arrowLeft;
  returnMainPageDOM.style.objectFit = 'contain';
  root.appendChild(returnMainPageDOM);

  // EVENT LISTENER FOR RETURNING TO MAIN PAGE
  returnMainPageDOM.addEventListener('click', () => {
    renderMain();
  });

  // MAIN LOGO
  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  // CREATE GAME TEXT
  const titlePlayerCreationDOM = document.createElement('div');
  titlePlayerCreationDOM.id = 'titlePlayerCreation_id';
  titlePlayerCreationDOM.className = 'mainText';
  titlePlayerCreationDOM.textContent = 'Elige tu nombre e ícono:';
  root.appendChild(titlePlayerCreationDOM);

  // INPUT PLAYER NAME
  const playerNameInputDOM = document.createElement('input');
  playerNameInputDOM.id = 'textArea_id';
  playerNameInputDOM.placeholder = 'Introduce tu nombre...';
  root.appendChild(playerNameInputDOM);

  // PLAYERS ON TABLE DISPLAY GRID
  const playersOnTableGrid = document.createElement('div');
  playersOnTableGrid.id = 'playersOnTableGrid';

  playersOnTableGrid.style.display = 'grid';
  playersOnTableGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  playersOnTableGrid.style.gridTemplateRows = 'repeat(4, auto)';
  playersOnTableGrid.style.gap = '25px';
  playersOnTableGrid.style.padding = '10px';
  playersOnTableGrid.style.marginTop = '40px';

  root.appendChild(playersOnTableGrid);

  // not current real players
  let playersToChoose = [
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

  let choosenPlayer = ['playerToChoose_id_black'];

  const playerBlack = document.createElement('img');
  playerBlack.id = `playerToChoose_id_black`;
  playerBlack.className = 'playerToChoose_notChoosen';
  playerBlack.src = playerImages['black'];
  playerBlack.style.objectFit = 'contain';
  playerBlack.style.width = '50px';
  playerBlack.style.height = '50px';
  playerBlack.className = 'playerToChoose_Choosen';
  playersOnTableGrid.appendChild(playerBlack);
  playerBlack.addEventListener('click', () => {
    let prevID = choosenPlayer.pop();
    const prevChoosenPlayer = document.getElementById(prevID);
    prevChoosenPlayer.className = 'playerToChoose_notChoosen';

    playerBlack.className = 'playerToChoose_Choosen';
    choosenPlayer.push(playerBlack.id);
  });

  playersToChoose.forEach((name) => {
    const playerToChoose = document.createElement('img');
    playerToChoose.id = `playerToChoose_id_${name}`;
    playerToChoose.className = 'playerToChoose_notChoosen';
    playerToChoose.src = playerImages[name];
    playerToChoose.style.objectFit = 'contain';
    playerToChoose.style.width = '50px';
    playerToChoose.style.height = '50px';
    playersOnTableGrid.appendChild(playerToChoose);
    playerToChoose.addEventListener('click', () => {
      if (!choosenPlayer.includes(playerToChoose.id)) {
        let prevID = choosenPlayer.pop();
        const prevChoosenPlayer = document.getElementById(prevID);
        prevChoosenPlayer.className = 'playerToChoose_notChoosen';

        playerToChoose.className = 'playerToChoose_Choosen';
        choosenPlayer.push(playerToChoose.id);
      }
    });
  });

  // STARTGAME BUTTON
  const loadLobbyDOM = document.createElement('button');
  loadLobbyDOM.id = 'loadLobbyDOM_id';
  loadLobbyDOM.className = 'createButtons';
  loadLobbyDOM.textContent = 'Unirse';
  root.appendChild(loadLobbyDOM);

  loadLobbyDOM.addEventListener('click', () => {
    // get color
    const selectedFinalColorDOM = document.getElementsByClassName(
      'playerToChoose_Choosen'
    )[0];
    const selectedFinalColorValue =
      selectedFinalColorDOM.id.split('playerToChoose_id_')[1];

    // get username
    const selectedUsername = playerNameInputDOM.value;

    const playerObject = createPlayer(
      selectedUsername,
      selectedFinalColorValue
    );

    addPlayerToGame(playerObject['id'], idGame);

    renderGameLobby(idGame);
  });
}
