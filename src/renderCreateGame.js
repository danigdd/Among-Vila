import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import { cleanSettingName } from '../utils/utils';
import { allSettings } from './settingsRestraints';
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
  const playerSelectorDOM = document.getElementById('jugadoresSelector_id');
  const playerSelectorChildren = playerSelectorDOM.children;
  const selectorLessPlayers = playerSelectorChildren[0];
  const selectorCountPlayers = playerSelectorChildren[1];
  const selectorMorePlayers = playerSelectorChildren[2];

  selectorLessPlayers.addEventListener('click', () => {
    let currentIndex = +selectorCountPlayers.textContent - 1;
    if (currentIndex - 1 == -1) currentIndex = allSettings[0].length - 1;
    else currentIndex -= 1;

    selectorCountPlayers.textContent = currentIndex + 1;
  });

  selectorMorePlayers.addEventListener('click', () => {
    let currentIndex = +selectorCountPlayers.textContent - 1;
    if (currentIndex + 1 == 14) currentIndex = 0;
    else currentIndex += 1;

    selectorCountPlayers.textContent = currentIndex + 1;
  });

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
  let numberSelectorCount = 1;
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
