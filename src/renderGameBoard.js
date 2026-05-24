import { renderMain } from './renderMain';
import {
  findGameById,
  purgeExpiredPlayers,
  syncGameInCache,
  completePlayerMission,
} from './createGameController';
import { clearCurrentSession, getCurrentSession } from './sessionContext';
import {
  cancelDisconnectGrace,
  registerDisconnectGrace,
  subscribeToGame,
} from './gamesFirebase';
import { clearRoomUrl, setRoomUrl } from './roomRouting';
import { createWorker, PSM } from 'tesseract.js';
import '../styles/general-styles.css';
import '../styles/gameBoard-styles.css';

let gameBoardUnsubscribe = null;
let ocrWorkerPromise = null;

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

function normalizeMissionText(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function normalizeOcrText(text) {
  return normalizeMissionText(text)
    .replaceAll('O', '0')
    .replaceAll('Q', '0')
    .replaceAll('I', '1')
    .replaceAll('L', '1')
    .replaceAll('S', '5')
    .replaceAll('Z', '2');
}

function getDoorCodes(text) {
  return normalizeOcrText(text).match(/[A-HK][0-3][0-1][0-9]/g) || [];
}

function isMissionTextDetected(detectedText, missionCode) {
  const missionNorm = normalizeMissionText(missionCode);

  if (missionNorm === 'PISCINA' || missionNorm === 'FUTBOL') {
    return normalizeMissionText(detectedText).includes(missionNorm);
  }

  return getDoorCodes(detectedText).includes(missionNorm);
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

function stopCameraStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getCameraErrorMessage(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return 'Brave ha bloqueado la cámara. Activa el permiso de cámara para este sitio.';
  }

  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
    return 'No encuentro una cámara disponible en este dispositivo.';
  }

  if (error?.name === 'NotReadableError') {
    return 'La cámara está ocupada por otra app. Ciérrala y vuelve a intentarlo.';
  }

  return 'Tienes que activar la cámara para jugar';
}

async function readTextFromImage(canvas) {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker('eng').then(async (worker) => {
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHK0123456789PISCNAFUTBOL',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });
      return worker;
    });
  }

  const worker = await ocrWorkerPromise;
  const { data } = await worker.recognize(canvas);
  return data.text;
}

function createProcessedTextCanvas(sourceCanvas) {
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width * scale;
  canvas.height = sourceCanvas.height * scale;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrast = gray > 145 ? 255 : 0;
    data[index] = contrast;
    data[index + 1] = contrast;
    data[index + 2] = contrast;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function captureVideoFrame(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas
    .getContext('2d')
    .drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function startCameraStream(ui) {
  const constraints = {
    audio: false,
    video: { facingMode: { exact: ui.cameraFacingMode } },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    if (error?.name !== 'OverconstrainedError') throw error;
    return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
  }
}

async function attachCameraStream(stream, ui) {
  ui.cameraVideoDOM.srcObject = stream;
  ui.cameraVideoDOM.muted = true;
  await ui.cameraVideoDOM.play();
}

function closeCamera(ui) {
  stopCameraStream(ui.cameraStream);
  ui.cameraStream = null;
  ui.cameraVideoDOM.srcObject = null;
  ui.cameraModalDOM.style.display = 'none';
  ui.cameraMessageDOM.textContent = '';
}

async function switchCamera(ui) {
  ui.cameraFacingMode = ui.cameraFacingMode === 'environment' ? 'user' : 'environment';
  stopCameraStream(ui.cameraStream);

  try {
    ui.cameraStream = await startCameraStream(ui);
    await attachCameraStream(ui.cameraStream, ui);
  } catch (error) {
    ui.cameraMessageDOM.textContent = getCameraErrorMessage(error);
  }
}

async function openMissionCamera(mission, index, gameId, playerId, ui) {
  if (mission.completed) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    ui.cameraMessageDOM.textContent =
      'Este navegador no permite pedir cámara desde aquí. Prueba Safari/Chrome o revisa permisos de Brave.';
    return;
  }

  let stream;
  try {
    stream = await startCameraStream(ui);
  } catch (error) {
    ui.cameraMessageDOM.textContent = getCameraErrorMessage(error);
    return;
  }

  ui.cameraMessageDOM.textContent = '';
  ui.cameraModalDOM.style.display = 'flex';
  ui.cameraStream = stream;

  try {
    await attachCameraStream(stream, ui);
  } catch (error) {
    stopCameraStream(stream);
    ui.cameraStream = null;
    ui.cameraVideoDOM.srcObject = null;
    ui.cameraModalDOM.style.display = 'none';
    ui.cameraMessageDOM.textContent = getCameraErrorMessage(error);
    return;
  }

  ui.closeCameraButtonDOM.onclick = () => {
    closeCamera(ui);
  };

  ui.switchCameraButtonDOM.onclick = async () => {
    await switchCamera(ui);
  };

  ui.captureCameraButtonDOM.onclick = async () => {
    ui.captureCameraButtonDOM.disabled = true;
    ui.captureCameraButtonDOM.textContent = 'Leyendo...';

    const canvas = captureVideoFrame(ui.cameraVideoDOM);
    const processedCanvas = createProcessedTextCanvas(canvas);

    let detectedText;
    try {
      detectedText = await readTextFromImage(processedCanvas);
    } catch {
      detectedText = '';
    } finally {
      ui.captureCameraButtonDOM.disabled = false;
      ui.captureCameraButtonDOM.textContent = 'Hacer foto';
    }

    if (!detectedText) {
      ui.cameraMessageDOM.textContent =
        'No puedo leer texto en esta foto. Acércate más y centra el número.';
      return;
    }

    if (!isMissionTextDetected(detectedText, mission.code)) {
      ui.cameraMessageDOM.textContent = 'Misión errónea';
      return;
    }

    await completePlayerMission(gameId, playerId, index);
    closeCamera(ui);
  };
}

function createMissionRow(mission, index, gameId, playerId, ui) {
  const rowDOM = document.createElement('div');
  rowDOM.className = mission.completed
    ? 'missionRow missionCompleted'
    : 'missionRow';

  const missionButtonDOM = document.createElement('button');
  missionButtonDOM.type = 'button';
  missionButtonDOM.className = 'missionCodeButton';
  missionButtonDOM.textContent = mission.code;
  missionButtonDOM.disabled = true;
  rowDOM.appendChild(missionButtonDOM);

  const cameraButtonDOM = document.createElement('button');
  cameraButtonDOM.type = 'button';
  cameraButtonDOM.className = 'missionCameraButton';
  cameraButtonDOM.disabled = mission.completed;
  cameraButtonDOM.title = 'Abrir cámara';
  cameraButtonDOM.setAttribute('aria-label', 'Abrir cámara');
  cameraButtonDOM.appendChild(createCameraIcon());
  cameraButtonDOM.addEventListener('click', () => {
    openMissionCamera(mission, index, gameId, playerId, ui);
  });
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
        createMissionRow(mission, index, game.id, playerId, ui)
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

  const emergencyLabelDOM = document.createElement('div');
  emergencyLabelDOM.id = 'emergencyLabel_id';
  emergencyLabelDOM.textContent = '¡Emergencia!';
  actionZoneDOM.appendChild(emergencyLabelDOM);

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

  const cameraMessageDOM = document.createElement('div');
  cameraMessageDOM.id = 'cameraMessage_id';
  root.appendChild(cameraMessageDOM);

  const cameraModalDOM = document.createElement('div');
  cameraModalDOM.id = 'cameraModal_id';
  cameraModalDOM.style.display = 'none';
  root.appendChild(cameraModalDOM);

  const cameraPanelDOM = document.createElement('div');
  cameraPanelDOM.id = 'cameraPanel_id';
  cameraModalDOM.appendChild(cameraPanelDOM);

  const cameraVideoDOM = document.createElement('video');
  cameraVideoDOM.id = 'cameraVideo_id';
  cameraVideoDOM.autoplay = true;
  cameraVideoDOM.muted = true;
  cameraVideoDOM.playsInline = true;
  cameraPanelDOM.appendChild(cameraVideoDOM);

  const cameraActionsDOM = document.createElement('div');
  cameraActionsDOM.id = 'cameraActions_id';
  cameraPanelDOM.appendChild(cameraActionsDOM);

  const captureCameraButtonDOM = document.createElement('button');
  captureCameraButtonDOM.type = 'button';
  captureCameraButtonDOM.className = 'roundActionButton reportButton';
  captureCameraButtonDOM.textContent = 'Hacer foto';
  cameraActionsDOM.appendChild(captureCameraButtonDOM);

  const switchCameraButtonDOM = document.createElement('button');
  switchCameraButtonDOM.type = 'button';
  switchCameraButtonDOM.className = 'roundActionButton switchCameraButton';
  switchCameraButtonDOM.textContent = 'Girar';
  cameraActionsDOM.appendChild(switchCameraButtonDOM);

  const closeCameraButtonDOM = document.createElement('button');
  closeCameraButtonDOM.type = 'button';
  closeCameraButtonDOM.className = 'roundActionButton sabotageButton';
  closeCameraButtonDOM.textContent = 'Cerrar';
  cameraActionsDOM.appendChild(closeCameraButtonDOM);

  const ui = {
    emergencyCounterDOM,
    cameraMessageDOM,
    cameraModalDOM,
    cameraVideoDOM,
    captureCameraButtonDOM,
    closeCameraButtonDOM,
    switchCameraButtonDOM,
    cameraFacingMode: 'environment',
    cameraStream: null,
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
