import '../styles/general-styles.css';
import '../styles/createGamePage-styles.css';
import {
  maxImpostorsForPlayers,
  clampImpostorsToPlayers,
  cleanSettingName,
} from '../utils/utils';
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

  // ==================== INDIVIDUAL SETTINGS ====================

  // ======== NUMBER OF PLAYERS ========
  createNewSetting(settingsWrapperDOM, 'Jugadores');
  const playerSelectorDOM = document.getElementById('jugadoresSelector_id');
  const playerSelectorChildren = playerSelectorDOM.children;
  const selectorLessPlayers = playerSelectorChildren[0];
  const selectorCountPlayers = playerSelectorChildren[1];
  const selectorMorePlayers = playerSelectorChildren[2];

  selectorMorePlayers.addEventListener('click', () => {
    let current = +selectorCountPlayers.textContent;

    if (current === 14) current = 1;
    else current += 1;

    selectorCountPlayers.textContent = current;

    const fixedImpostors = clampImpostorsToPlayers(
      current,
      +selectorCountImpostors.textContent
    );

    selectorCountImpostors.textContent = fixedImpostors;
  });

  selectorLessPlayers.addEventListener('click', () => {
    let current = +selectorCountPlayers.textContent;

    if (current === 1) current = 14;
    else current -= 1;

    selectorCountPlayers.textContent = current;
    const fixedImpostors = clampImpostorsToPlayers(
      current,
      +selectorCountImpostors.textContent
    );

    selectorCountImpostors.textContent = fixedImpostors;

    clampImpostorsToPlayers();
  });

  // ======== NUMBER OF IMPOSTORS ========
  createNewSetting(settingsWrapperDOM, 'Impostores');

  const impostorSelectorDOM = document.getElementById('impostoresSelector_id');
  const impostorSelectorChildren = impostorSelectorDOM.children;
  const selectorLessImpostors = impostorSelectorChildren[0];
  const selectorCountImpostors = impostorSelectorChildren[1];
  const selectorMoreImpostors = impostorSelectorChildren[2];

  selectorMoreImpostors.addEventListener('click', () => {
    const players = +selectorCountPlayers.textContent;
    const max = maxImpostorsForPlayers(players);

    let current = +selectorCountImpostors.textContent;

    if (current === max) current = 1;
    else current += 1;

    selectorCountImpostors.textContent = current;
  });

  selectorLessImpostors.addEventListener('click', () => {
    const players = +selectorCountPlayers.textContent;
    const max = maxImpostorsForPlayers(players);

    let current = +selectorCountImpostors.textContent;

    if (current === 1) current = max;
    else current -= 1;

    selectorCountImpostors.textContent = current;
  });

  // ======== NUMBER OF EMERGENCY MEETINGS PER PERSON ========
  createNewSetting(settingsWrapperDOM, 'Emergencias por jugador');
  const emergenciesSelectorDOM = document.getElementById(
    'emergenciasporjugadorSelector_id'
  );
  const emergenciesSelectorChildren = emergenciesSelectorDOM.children;
  const selectorLessEmergencies = emergenciesSelectorChildren[0];
  const selectorCountEmergencies = emergenciesSelectorChildren[1];
  const selectorMoreEmergencies = emergenciesSelectorChildren[2];

  selectorMoreEmergencies.addEventListener('click', () => {
    let emergencies = +selectorCountEmergencies.textContent;

    if (emergencies == 3) emergencies = 1;
    else emergencies += 1;

    selectorCountEmergencies.textContent = emergencies;
  });

  selectorLessEmergencies.addEventListener('click', () => {
    let emergencies = +selectorCountEmergencies.textContent;

    if (emergencies == 1) emergencies = 3;
    else emergencies -= 1;

    selectorCountEmergencies.textContent = emergencies;
  });

  // ======== IMPOSTOR COOLDOWN ========
  createNewSetting(settingsWrapperDOM, 'Cooldown de Asesinato (s)');
  const murderSelectorDOM = document.getElementById(
    'cooldowndeasesinato(s)Selector_id'
  );
  const murderSelectorChildren = murderSelectorDOM.children;
  const selectorLessmurder = murderSelectorChildren[0];
  const selectorCountmurder = murderSelectorChildren[1];
  selectorCountmurder.textContent = 90;
  const selectorMoremurder = murderSelectorChildren[2];

  selectorMoremurder.addEventListener('click', () => {
    let murder = +selectorCountmurder.textContent;

    if (murder == 120) murder = 60;
    else murder += 30;

    selectorCountmurder.textContent = murder;
  });

  selectorLessmurder.addEventListener('click', () => {
    let murder = +selectorCountmurder.textContent;

    if (murder == 60) murder = 120;
    else murder -= 30;

    selectorCountmurder.textContent = murder;
  });

  // ======== ANONYMOUS VOTES ========
  createNewSetting(settingsWrapperDOM, 'Voto anonimo');
  const AnonymousVoteSelectorDOM = document.getElementById(
    'votoanonimoSelector_id'
  );
  const AnonymousVoteSelectorChildren = AnonymousVoteSelectorDOM.children;
  const selectorLessAnonymousVote = AnonymousVoteSelectorChildren[0];
  const selectorCountAnonymousVote = AnonymousVoteSelectorChildren[1];
  selectorCountAnonymousVote.textContent = 'Sí';
  const selectorMoreAnonymousVote = AnonymousVoteSelectorChildren[2];

  selectorMoreAnonymousVote.addEventListener('click', () => {
    let AnonymousVote = selectorCountAnonymousVote.textContent;

    if (AnonymousVote === 'Sí') AnonymousVote = 'No';
    else AnonymousVote = 'Sí';

    selectorCountAnonymousVote.textContent = AnonymousVote;
  });

  selectorLessAnonymousVote.addEventListener('click', () => {
    let AnonymousVote = selectorCountAnonymousVote.textContent;

    if (AnonymousVote === 'Sí') AnonymousVote = 'No';
    else AnonymousVote = 'Sí';

    selectorCountAnonymousVote.textContent = AnonymousVote;
  });

  // ======== HIDE TASKS ========
  createNewSetting(settingsWrapperDOM, 'Ocultar tareas');
  const OcultarTareasVoteSelectorDOM = document.getElementById(
    'ocultartareasSelector_id'
  );
  const OcultarTareasVoteSelectorChildren =
    OcultarTareasVoteSelectorDOM.children;
  const selectorLessOcultarTareasVote = OcultarTareasVoteSelectorChildren[0];
  const selectorCountOcultarTareasVote = OcultarTareasVoteSelectorChildren[1];
  selectorCountOcultarTareasVote.textContent = 'Sí';
  const selectorMoreOcultarTareasVote = OcultarTareasVoteSelectorChildren[2];

  selectorMoreOcultarTareasVote.addEventListener('click', () => {
    let OcultarTareasVote = selectorCountOcultarTareasVote.textContent;

    if (OcultarTareasVote === 'Sí') OcultarTareasVote = 'No';
    else OcultarTareasVote = 'Sí';

    selectorCountOcultarTareasVote.textContent = OcultarTareasVote;
  });

  selectorLessOcultarTareasVote.addEventListener('click', () => {
    let OcultarTareasVote = selectorCountOcultarTareasVote.textContent;

    if (OcultarTareasVote === 'Sí') OcultarTareasVote = 'No';
    else OcultarTareasVote = 'Sí';

    selectorCountOcultarTareasVote.textContent = OcultarTareasVote;
  });

  // ======== DISCUSS TIME ========
  createNewSetting(settingsWrapperDOM, 'Tiempo de discusion (s)');
  const discussTimeSelectorDOM = document.getElementById(
    'tiempodediscusion(s)Selector_id'
  );
  const discussTimeSelectorChildren = discussTimeSelectorDOM.children;
  const selectorLessdiscussTime = discussTimeSelectorChildren[0];
  const selectorCountdiscussTime = discussTimeSelectorChildren[1];
  selectorCountdiscussTime.textContent = 90;
  const selectorMorediscussTime = discussTimeSelectorChildren[2];

  selectorMorediscussTime.addEventListener('click', () => {
    let discussTime = +selectorCountdiscussTime.textContent;

    if (discussTime == 120) discussTime = 60;
    else discussTime += 30;

    selectorCountdiscussTime.textContent = discussTime;
  });

  selectorLessdiscussTime.addEventListener('click', () => {
    let discussTime = +selectorCountdiscussTime.textContent;

    if (discussTime == 60) discussTime = 120;
    else discussTime -= 30;

    selectorCountdiscussTime.textContent = discussTime;
  });

  // ======== CONTINUE BUTTON ========
  const selectMapButtonDOM = document.createElement('button');
  selectMapButtonDOM.id = 'selectMap_id';
  selectMapButtonDOM.textContent = 'Selección de mapa';
  root.appendChild(selectMapButtonDOM);
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
