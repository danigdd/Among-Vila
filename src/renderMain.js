import '../styles/general-styles.css';
import '../styles/mainPage-styles.css';
import { renderCreateGame } from './renderCreateGame';
import logo from '../resources/logofull.webp';

export function renderMain() {
  const oldRoot = document.getElementById('content');
  const root = document.createElement('div');
  root.id = 'content';
  oldRoot.replaceWith(root);

  // MAIN LOGO
  const mainLogoDom = document.createElement('img');
  mainLogoDom.id = 'mainLogo_id';
  mainLogoDom.src = logo;
  root.appendChild(mainLogoDom);

  // MAIN TITLE
  const titleGameDescriptionDOM = document.createElement('div');
  titleGameDescriptionDOM.id = 'titleGameDescription_id';
  titleGameDescriptionDOM.textContent = 'Empieza a jugar por la Vila';
  root.appendChild(titleGameDescriptionDOM);

  // PLAY BUTTON
  const playButtonDOM = document.createElement('button');
  playButtonDOM.id = 'playButton_id';
  playButtonDOM.textContent = 'Juega ya';
  root.appendChild(playButtonDOM);
  let optionsAlreadyDisplayed = false;
  // LISTENER FOR DEPLOYING GAME TABLE OPTIONS
  playButtonDOM.addEventListener('click', () => {
    if (optionsAlreadyDisplayed) return;
    // FLEX HORITZONTAL DIV SETTINGS
    const tableOptionsWrapperDOM = document.createElement('div');
    tableOptionsWrapperDOM.id = 'tableOptionsWrapper_id';
    root.appendChild(tableOptionsWrapperDOM);

    // CREATE GAME BUTTON
    const createGameDOM = document.createElement('button');
    createGameDOM.id = 'createGame_id';
    createGameDOM.textContent = 'Crear partida';
    tableOptionsWrapperDOM.appendChild(createGameDOM);

    createGameDOM.addEventListener('click', () => {
      renderCreateGame();
    });

    // JOIN GAME BUTTON
    const joinGameDOM = document.createElement('button');
    joinGameDOM.id = 'joinGame_id';
    joinGameDOM.textContent = 'Unirse a partida';
    tableOptionsWrapperDOM.appendChild(joinGameDOM);

    optionsAlreadyDisplayed = true;
  });
}
