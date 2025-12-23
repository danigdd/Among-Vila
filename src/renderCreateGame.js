import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import { settingsRestraints } from '../utils/utils';
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

  // ======== NUMBER OF PLAYERS ========
  const numberPlayersDOM = document.createElement('div');
  numberPlayersDOM.id = 'numberPlayers_id';
  numberPlayersDOM.className = 'individualSettingDOM';
  settingsWrapperDOM.appendChild(numberPlayersDOM);

  // TEXT
  const numberPlayersText = document.createElement('div');
  numberPlayersText.id = 'numberPlayersText_id';
  numberPlayersText.textContent = 'Jugadores';
  numberPlayersText.className = 'settingName';
  numberPlayersDOM.appendChild(numberPlayersText);

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

  // EVENT LISTENERS FOR EACH BUTTON
  numberPlayersSelectorLessDOM.addEventListener('click', () => {
    if (!settingsRestraints('players', numberPlayersSelectorCount, 'less'))
      return;
    numberPlayersSelectorCount -= 1;
    numberPlayersSelectorCountDOM.textContent = `${numberPlayersSelectorCount}`;
  });

  numberPlayersSelectorMoreDOM.addEventListener('click', () => {
    if (!settingsRestraints('players', numberPlayersSelectorCount, 'more'))
      return;
    numberPlayersSelectorCount += 1;
    numberPlayersSelectorCountDOM.textContent = `${numberPlayersSelectorCount}`;
  });

  // ======== NUMBER OF IMPOSTORS ========
  const numberImpostorsDOM = document.createElement('div');
  numberImpostorsDOM.id = 'numberImpostors_id';
  numberImpostorsDOM.className = 'individualSettingDOM';
  settingsWrapperDOM.appendChild(numberImpostorsDOM);

  // TEXT
  const numberImpostorsText = document.createElement('div');
  numberImpostorsText.id = 'numberImpostorsText_id';
  numberImpostorsText.textContent = 'Impostores';
  numberImpostorsText.className = 'settingName';
  numberImpostorsDOM.appendChild(numberImpostorsText);

  // SELECTOR

  const numberImpostorsSelectorDOM = document.createElement('div');
  numberImpostorsSelectorDOM.id = 'numberImpostorsSelector_id';
  numberImpostorsSelectorDOM.className = 'selectorDOM';
  numberImpostorsDOM.appendChild(numberImpostorsSelectorDOM);

  // SELECTOR '<'
  const numberImpostorsSelectorLessDOM = document.createElement('button');
  numberImpostorsSelectorLessDOM.id = 'numberImpostorsSelectorLess_id';
  numberImpostorsSelectorLessDOM.textContent = '<';
  numberImpostorsSelectorDOM.appendChild(numberImpostorsSelectorLessDOM);

  // ACTUAL SELECTOR COUNT
  let numberImpostorsSelectorCount = 0;
  const numberImpostorsSelectorCountDOM = document.createElement('div');
  numberImpostorsSelectorCountDOM.id = 'numberImpostorsSelectorCount_id';
  numberImpostorsSelectorCountDOM.textContent = `${numberImpostorsSelectorCount}`;
  numberImpostorsSelectorDOM.appendChild(numberImpostorsSelectorCountDOM);

  // SELECTOR '>'
  const numberImpostorsSelectorMoreDOM = document.createElement('button');
  numberImpostorsSelectorMoreDOM.id = 'numberImpostorsSelectorMore_id';
  numberImpostorsSelectorMoreDOM.textContent = '>';
  numberImpostorsSelectorDOM.appendChild(numberImpostorsSelectorMoreDOM);

  // EVENT LISTENERS FOR EACH BUTTON
  numberImpostorsSelectorLessDOM.addEventListener('click', () => {
    numberImpostorsSelectorCount -= 1;
    numberImpostorsSelectorCountDOM.textContent = `${numberImpostorsSelectorCount}`;
  });

  numberImpostorsSelectorMoreDOM.addEventListener('click', () => {
    numberImpostorsSelectorCount += 1;
    numberImpostorsSelectorCountDOM.textContent = `${numberImpostorsSelectorCount}`;
  });
}
