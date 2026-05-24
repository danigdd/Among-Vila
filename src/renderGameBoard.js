import { renderMain } from './renderMain';
import {
  findGameById,
  purgeExpiredPlayers,
  syncGameInCache,
  togglePlayerMission,
} from './createGameController';
import { clearCurrentSession, getCurrentSession } from './sessionContext';
import {
  cancelDisconnectGrace,
  registerDisconnectGrace,
  subscribeToGame,
} from './gamesFirebase';
import { clearRoomUrl, setRoomUrl } from './roomRouting';
import '../styles/general-styles.css';
import '../styles/gameBoard-styles.css';

let gameBoardUnsubscribe = null;

function unsubscribeFromGameBoard() {
  if (gameBoardUnsubscribe) {
    gameBoardUnsubscribe();
    gameBoardUnsubscribe = null;
  }
}

function getPlayer(game, playerId) {
  return game.currentPlayers.find((player) => player.id == playerId);
}

function getCompletedMissions(game) {
  return game.currentPlayers.reduce((count, player) => {
    if (player.role !== 'innocent') return count;

    const completed = (player.missions || []).filter(
      (mission) => mission.completed
    ).length;
    return count + completed;
  }, 0);
}

function getMissionTarget(game) {
  if (game.missionTarget) return game.missionTarget;

  const innocentCount = game.currentPlayers.filter(
    (player) => player.role === 'innocent'
  ).length;
  return Math.max(innocentCount, innocentCount * 5 - Math.ceil(innocentCount / 2));
}

function createCameraIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute('clip-rule', 'evenodd');
  path.setAttribute(
    'd',
    'M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
  );
  svg.appendChild(path);
  return svg;
}

function createMissionRow(mission, index, gameId, playerId) {
  const rowDOM = document.createElement('div');
  rowDOM.className = mission.completed
    ? 'missionRow missionCompleted'
    : 'missionRow';

  const missionButtonDOM = document.createElement('button');
  missionButtonDOM.type = 'button';
  missionButtonDOM.className = 'missionCodeButton';
  missionButtonDOM.textContent = mission.code;
  missionButtonDOM.addEventListener('click', async () => {
    missionButtonDOM.disabled = true;
    await togglePlayerMission(gameId, playerId, index);
  });
  rowDOM.appendChild(missionButtonDOM);

  const cameraButtonDOM = document.createElement('button');
  cameraButtonDOM.type = 'button';
  cameraButtonDOM.className = 'missionCameraButton';
  cameraButtonDOM.title = 'Abrir cámara';
  cameraButtonDOM.setAttribute('aria-label', 'Abrir cámara');
  cameraButtonDOM.appendChild(createCameraIcon());
  rowDOM.appendChild(cameraButtonDOM);

  return rowDOM;
}

function updateGameBoard(game, playerId, ui) {
  const player = getPlayer(game, playerId);
  if (!player) return;

  const isImpostor = player.role === 'impostor';
  const completedMissions = getCompletedMissions(game);
  const missionTarget = getMissionTarget(game);
  const missionProgress = Math.min(completedMissions, missionTarget);
  const progressPercent = missionTarget
    ? Math.round((missionProgress / missionTarget) * 100)
    : 0;

  ui.titleDOM.textContent = isImpostor ? 'Mata y sabotea!' : 'Haz misiones!';
  ui.missionListDOM.replaceChildren();

  if (isImpostor) {
    ui.missionPanelDOM.style.display = 'none';
  } else {
    ui.missionPanelDOM.style.display = 'block';

    const playerMissions = player.missions || [];
    const playerCompleted = playerMissions.filter(
      (mission) => mission.completed
    ).length;
    ui.personalProgressDOM.textContent = `${playerCompleted}/${playerMissions.length} misiones hechas`;

    playerMissions.forEach((mission, index) => {
      ui.missionListDOM.appendChild(
        createMissionRow(mission, index, game.id, playerId)
      );
    });
  }

  ui.globalMissionCounterDOM.textContent = `${missionProgress}/${missionTarget}`;
  ui.globalMissionBarDOM.style.width = `${progressPercent}%`;
  ui.emergencyCounterDOM.textContent = `${player.emergencyUses || 0}/${game.emergenciesPerPlayer || 0}`;

  ui.innocentActionsDOM.style.display = isImpostor ? 'none' : 'flex';
  ui.impostorActionsDOM.style.display = isImpostor ? 'flex' : 'none';
}

export function renderGameBoard(id) {
  const session = getCurrentSession();
  const game = findGameById(id);
  const currentPlayerId = session?.playerId;

  if (!game || !currentPlayerId) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain();
    return;
  }

  const player = getPlayer(game, currentPlayerId);
  if (!player) {
    clearCurrentSession();
    clearRoomUrl();
    renderMain('Te han expulsado de la sala');
    return;
  }

  unsubscribeFromGameBoard();
  setRoomUrl(id);
  registerDisconnectGrace(id, currentPlayerId);

  const oldRoot = document.getElementById('content');
  const root = document.createElement('div');
  root.id = 'content';
  root.classList.add('fast-animation', 'gameBoardScreen');
  oldRoot.replaceWith(root);

  const titleDOM = document.createElement('div');
  titleDOM.id = 'gameBoardTitle_id';
  titleDOM.className = 'mainText';
  root.appendChild(titleDOM);

  const missionPanelDOM = document.createElement('section');
  missionPanelDOM.id = 'missionPanel_id';
  root.appendChild(missionPanelDOM);

  const missionHeaderDOM = document.createElement('div');
  missionHeaderDOM.id = 'missionHeader_id';
  missionPanelDOM.appendChild(missionHeaderDOM);

  const missionPanelTitleDOM = document.createElement('div');
  missionPanelTitleDOM.className = 'missionPanelTitle';
  missionPanelTitleDOM.textContent = 'Misiones';
  missionHeaderDOM.appendChild(missionPanelTitleDOM);

  const personalProgressDOM = document.createElement('div');
  personalProgressDOM.id = 'personalMissionProgress_id';
  missionHeaderDOM.appendChild(personalProgressDOM);

  const missionListDOM = document.createElement('div');
  missionListDOM.id = 'missionList_id';
  missionPanelDOM.appendChild(missionListDOM);

  const globalProgressDOM = document.createElement('section');
  globalProgressDOM.id = 'globalMissionProgress_id';
  root.appendChild(globalProgressDOM);

  const globalProgressTopDOM = document.createElement('div');
  globalProgressTopDOM.id = 'globalProgressTop_id';
  globalProgressDOM.appendChild(globalProgressTopDOM);

  const globalProgressLabelDOM = document.createElement('div');
  globalProgressLabelDOM.textContent = 'Progreso global';
  globalProgressTopDOM.appendChild(globalProgressLabelDOM);

  const globalMissionCounterDOM = document.createElement('div');
  globalMissionCounterDOM.id = 'globalMissionCounter_id';
  globalProgressTopDOM.appendChild(globalMissionCounterDOM);

  const globalMissionTrackDOM = document.createElement('div');
  globalMissionTrackDOM.id = 'globalMissionTrack_id';
  globalProgressDOM.appendChild(globalMissionTrackDOM);

  const globalMissionBarDOM = document.createElement('div');
  globalMissionBarDOM.id = 'globalMissionBar_id';
  globalMissionTrackDOM.appendChild(globalMissionBarDOM);

  const actionZoneDOM = document.createElement('section');
  actionZoneDOM.id = 'actionZone_id';
  root.appendChild(actionZoneDOM);

  const emergencyButtonDOM = document.createElement('button');
  emergencyButtonDOM.type = 'button';
  emergencyButtonDOM.id = 'emergencyButton_id';
  emergencyButtonDOM.textContent = '!';
  emergencyButtonDOM.title = 'Reunión de emergencia';
  actionZoneDOM.appendChild(emergencyButtonDOM);

  const emergencyCounterDOM = document.createElement('div');
  emergencyCounterDOM.id = 'emergencyCounter_id';
  actionZoneDOM.appendChild(emergencyCounterDOM);

  const innocentActionsDOM = document.createElement('div');
  innocentActionsDOM.className = 'playerActionButtons';
  actionZoneDOM.appendChild(innocentActionsDOM);

  const reportButtonDOM = document.createElement('button');
  reportButtonDOM.type = 'button';
  reportButtonDOM.className = 'roundActionButton reportButton';
  reportButtonDOM.textContent = 'Reportar';
  innocentActionsDOM.appendChild(reportButtonDOM);

  const impostorActionsDOM = document.createElement('div');
  impostorActionsDOM.className = 'playerActionButtons';
  actionZoneDOM.appendChild(impostorActionsDOM);

  const killButtonDOM = document.createElement('button');
  killButtonDOM.type = 'button';
  killButtonDOM.className = 'roundActionButton killButton';
  killButtonDOM.textContent = 'Matar';
  impostorActionsDOM.appendChild(killButtonDOM);

  const sabotageButtonDOM = document.createElement('button');
  sabotageButtonDOM.type = 'button';
  sabotageButtonDOM.className = 'roundActionButton sabotageButton';
  sabotageButtonDOM.textContent = 'Sabotear';
  impostorActionsDOM.appendChild(sabotageButtonDOM);

  const ui = {
    emergencyCounterDOM,
    globalMissionBarDOM,
    globalMissionCounterDOM,
    impostorActionsDOM,
    innocentActionsDOM,
    missionListDOM,
    missionPanelDOM,
    personalProgressDOM,
    titleDOM,
  };
  updateGameBoard(game, currentPlayerId, ui);

  gameBoardUnsubscribe = subscribeToGame(id, async (remoteGame) => {
    if (!remoteGame) {
      unsubscribeFromGameBoard();
      clearCurrentSession();
      clearRoomUrl();
      renderMain();
      return;
    }

    syncGameInCache(remoteGame);
    const { game: cleanedGame, gameDeleted } = await purgeExpiredPlayers(
      findGameById(id)
    );

    if (gameDeleted || !cleanedGame) {
      unsubscribeFromGameBoard();
      clearCurrentSession();
      clearRoomUrl();
      renderMain();
      return;
    }

    if (!getPlayer(cleanedGame, currentPlayerId)) {
      unsubscribeFromGameBoard();
      cancelDisconnectGrace();
      clearCurrentSession();
      clearRoomUrl();
      renderMain('Te han expulsado de la sala');
      return;
    }

    updateGameBoard(cleanedGame, currentPlayerId, ui);
  });
}
