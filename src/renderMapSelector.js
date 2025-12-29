import '../styles/general-styles.css';
import '../styles/mapSelector-styles.css';
import { renderCreateGame } from './renderCreateGame';
import { blocks } from '../utils/constants';
import { renderGameLobby } from './renderGameLobby';
import { findGameById } from './createGameController';
import arrowLeft from '../resources/back-arrow-icon.svg';

import logo from '../resources/logofull.webp';

export function renderMapSelector(id) {
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
    renderCreateGame();
  });

  // MAIN LOGO
  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  // CREATE GAME TEXT
  const mapSelectorTextDOM = document.createElement('div');
  mapSelectorTextDOM.id = 'mapSelectorText_id';
  mapSelectorTextDOM.textContent = 'Selecciona el mapa';
  mapSelectorTextDOM.className = 'mainText';
  root.appendChild(mapSelectorTextDOM);

  // MAP GRID
  const mapSelectorGrid = document.createElement('div');
  mapSelectorGrid.id = 'mapSelectorGrid';

  mapSelectorGrid.style.display = 'grid';
  mapSelectorGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  mapSelectorGrid.style.gridTemplateRows = 'repeat(6, auto)';
  mapSelectorGrid.style.gap = '10px';
  mapSelectorGrid.style.padding = '10px';

  root.appendChild(mapSelectorGrid);

  blocks.forEach((name, index) => {
    const blockDiv = document.createElement('div');
    blockDiv.id = `blockSelector_${index}`;
    blockDiv.className = 'blockDiv';

    const text = document.createElement('span');
    text.className = 'blockName';
    text.textContent = name;

    blockDiv.appendChild(text);

    mapSelectorGrid.appendChild(blockDiv);

    blockDiv.addEventListener('click', () => {
      blockDiv.classList.toggle('selected');
    });
  });

  // ======== CONTINUE BUTTON ========
  const createFinalGameDOM = document.createElement('button');
  createFinalGameDOM.id = 'createFinalGame_id';
  createFinalGameDOM.className = 'createButtons';
  createFinalGameDOM.textContent = 'Crear sala';
  root.appendChild(createFinalGameDOM);

  createFinalGameDOM.addEventListener('click', () => {
    let gameSettings = findGameById(id);
    const selectedMaps = [];

    // get only selected maps
    blocks.forEach((name, index) => {
      const blockDiv = document.getElementById(`blockSelector_${index}`);
      if (blockDiv.classList.contains('selected')) {
        const text = blockDiv.querySelector('.blockName').textContent;
        selectedMaps.push(text);
      }
    });

    gameSettings['maps'] = selectedMaps;
    renderGameLobby(id);
  });
}
