import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import { settingsRestraints } from '../utils/utils';
import { cleanSettingName } from '../utils/utils';
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
  createNewSetting(settingsWrapperDOM, 'Jugadores');

  // ======== NUMBER OF IMPOSTORS ========
  createNewSetting(settingsWrapperDOM, 'Impostores');

  // ======== NUMBER OF EMERGENCY MEETINGS PER PERSON ========
  createNewSetting(settingsWrapperDOM, 'Emergencias por jugador');

  // ======== IMPOSTOR COOLDOWN ========
  createNewSetting(settingsWrapperDOM, 'Cooldown de Asesinato');

  // ======== ANONYMOUS VOTES ========
  createNewSetting(settingsWrapperDOM, 'Voto anonimo');

  // ======== HIDE TASKS ========
  createNewSetting(settingsWrapperDOM, 'Ocultar tareas');

  // ======== DISCUSS TIME ========
  createNewSetting(settingsWrapperDOM, 'Tiempo de discusion');
}

function createNewSetting(settingsWrapperDOM, settingsRawName) {
  let settingsName = cleanSettingName(settingsRawName);

  const numberDOM = document.createElement('div');
  numberDOM.id = `${settingsName}_id`;
  numberDOM.className = 'individualSettingDOM';
  settingsWrapperDOM.appendChild(numberDOM);

  // TEXT
  const numberText = document.createElement('div');
  numberText.id = `${settingsName}Text_id`;
  numberText.textContent = settingsRawName;
  numberText.className = 'settingName';
  numberDOM.appendChild(numberText);

  // SELECTOR

  const numberSelectorDOM = document.createElement('div');
  numberSelectorDOM.id = `${settingsName}Selector_id`;
  numberSelectorDOM.className = 'selectorDOM';
  numberDOM.appendChild(numberSelectorDOM);

  // SELECTOR '<'
  const numberSelectorLessDOM = document.createElement('button');
  numberSelectorLessDOM.id = `${settingsName}SelectorLess_id`;
  numberSelectorLessDOM.textContent = '<';
  numberSelectorDOM.appendChild(numberSelectorLessDOM);

  // ACTUAL SELECTOR COUNT
  let numberSelectorCount = 0;
  const numberSelectorCountDOM = document.createElement('div');
  numberSelectorCountDOM.id = `${settingsName}SelectorCount_id`;
  numberSelectorCountDOM.textContent = `${numberSelectorCount}`;
  numberSelectorDOM.appendChild(numberSelectorCountDOM);

  // SELECTOR '>'
  const numberSelectorMoreDOM = document.createElement('button');
  numberSelectorMoreDOM.id = `${settingsName}SelectorMore_id`;
  numberSelectorMoreDOM.textContent = '>';
  numberSelectorDOM.appendChild(numberSelectorMoreDOM);
}
