import '../styles/general-styles.css';
import { initFirebase } from './firebaseApp';
import { renderMain } from './renderMain';
import { parseGameIdFromPath } from './roomRouting';
import {
  handleRoomUrlOnLoad,
  setupPageDisconnectHandlers,
  setupPopstateHandler,
} from './roomSession';

initFirebase();
setupPageDisconnectHandlers();
setupPopstateHandler();

async function bootstrap() {
  const gameId = parseGameIdFromPath();

  if (gameId) {
    await handleRoomUrlOnLoad(gameId);
    return;
  }

  renderMain();
}

bootstrap();
