import { renderMain } from './renderMain';
import '../styles/general-styles.css';
import '../styles/renderGameLobbyPage-styles.css';
import arrowLeft from '../resources/back-arrow-icon.svg';
import logo from '../resources/logofull.webp';
import { findGameById } from './createGameController';

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

  console.log(findGameById(id));
}
