import { renderMain } from './renderMain';
import { findGameById } from './createGameController';
import '../styles/general-styles.css';
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

export function renderGameLobby(id) {
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
  const titleGameLobbyDOM = document.createElement('div');
  titleGameLobbyDOM.id = 'titleGameLobby_id';
  titleGameLobbyDOM.className = 'mainText';
  titleGameLobbyDOM.textContent = 'Comparte el código de sala:';
  root.appendChild(titleGameLobbyDOM);

  // DISPLAY GAME ID
  const gameIDDOM = document.createElement('div');
  gameIDDOM.id = 'gameIDDOM_id';
  gameIDDOM.className = 'mainText';
  gameIDDOM.textContent = id;
  gameIDDOM.style.fontSize = '40px';
  root.appendChild(gameIDDOM);

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

  let currentPlayersOnGame = findGameById(id)['currentPlayers'];
  console.log(currentPlayersOnGame);

  currentPlayersOnGame.forEach((elem) => {
    let name = elem['color'];
    const playerDivDOM = document.createElement('img');
    playerDivDOM.id = `playerDivDOM_id_${name}`;
    playerDivDOM.className = 'playerDivDOM';
    playerDivDOM.src = playerImages[name];
    playerDivDOM.style.objectFit = 'contain';
    playerDivDOM.style.width = '64px';
    playerDivDOM.style.height = '64px';
    playersOnTableGrid.appendChild(playerDivDOM);
  });

  // STARTGAME BUTTON
  const startGameDOM = document.createElement('button');
  startGameDOM.id = 'startGameButton_id';
  startGameDOM.className = 'notReady';
  startGameDOM.textContent = 'Comenzar';
  root.appendChild(startGameDOM);

  console.log(findGameById(id));
  if (currentPlayersOnGame.length > 4) startGameDOM.className = 'ready';
}
