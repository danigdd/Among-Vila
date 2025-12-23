import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import logo from '../resources/logofull.webp';

export function renderCreateGame() {
  const oldRoot = document.getElementById('content');

  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation');

  oldRoot.replaceWith(root);

  // MAIN LOGO
  const createGameLogoDOM = document.createElement('img');
  createGameLogoDOM.id = 'createGameLogo_id';
  createGameLogoDOM.src = logo;
  root.appendChild(createGameLogoDOM);

  // CREATE GAME TEXT
  const createGameTextDOM = document.createElement('div');
  createGameTextDOM.id = 'createGameText_id';
  createGameTextDOM.textContent = 'Selecciona tus ajustes';
  root.appendChild(createGameTextDOM);

  // MAIN DIV WRAPPER ROW FLEX
  const settingsWrapperDOM = document.createElement('div');
  settingsWrapperDOM.id = 'settingsWrapper_id';
  root.appendChild(settingsWrapperDOM);

  // INDIVIDUAL SETTINGS
  const numberPlayersDOM = document.createElement('div');
  numberPlayersDOM.id = 'numberPlayers_id';
  numberPlayersDOM.className = 'individualSettingDOM';
  numberPlayersDOM.textContent = 'Jugadores';
  settingsWrapperDOM.appendChild(numberPlayersDOM);

  // SELECTOR

  const numberPlayersSelectorDOM = document.createElement('div');
  numberPlayersSelectorDOM.id = 'numberPlayersSelector_id';
  numberPlayersSelectorDOM.className = 'selectorDOM';
  numberPlayersDOM.appendChild(numberPlayersSelectorDOM);

  // SELECTOR '<'
  const numberPlayersSelectorLessDOM = document.createElement('button');
  numberPlayersSelectorLessDOM.id = 'numberPlayersSelectorLess_id';
  numberPlayersSelectorLessDOM.textContent = '<';
  numberPlayersSelectorDOM.appendChild(numberPlayersSelectorLessDOM);

  // ACTUAL SELECTOR COUNT
  let numberPlayersSelectorCount = 0;
  const numberPlayersSelectorCountDOM = document.createElement('div');
  numberPlayersSelectorCountDOM.id = 'numberPlayersSelectorCount_id';
  numberPlayersSelectorCountDOM.textContent = `${numberPlayersSelectorCount}`;
  numberPlayersSelectorDOM.appendChild(numberPlayersSelectorCountDOM);

  // SELECTOR '>'
  const numberPlayersSelectorMoreDOM = document.createElement('button');
  numberPlayersSelectorMoreDOM.id = 'numberPlayersSelectorMore_id';
  numberPlayersSelectorMoreDOM.textContent = '>';
  numberPlayersSelectorDOM.appendChild(numberPlayersSelectorMoreDOM);

  // INDIVIDUAL SETTING
  const numberImpostorsDOM = document.createElement('div');
  numberImpostorsDOM.id = 'numberImpostors_id';
  numberImpostorsDOM.className = 'individualSettingDOM';
  numberImpostorsDOM.textContent = 'Impostores';
  settingsWrapperDOM.appendChild(numberImpostorsDOM);
}
