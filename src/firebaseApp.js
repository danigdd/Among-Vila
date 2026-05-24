import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from '@app/firebase-config';

let database = null;
let initialized = false;

export function initFirebase() {
  if (initialized) return isFirebaseReady();

  if (!firebaseConfig?.apiKey || firebaseConfig.apiKey === 'TU_API_KEY') {
    console.warn(
      'Firebase: copia config.example.js a config.js y pon tus credenciales.'
    );
    return false;
  }

  if (!firebaseConfig.databaseURL) {
    console.warn('Firebase: falta databaseURL en config.js');
    return false;
  }

  try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    initialized = true;
    return true;
  } catch (error) {
    console.error('Firebase init failed', error);
    return false;
  }
}

export function isFirebaseReady() {
  return initialized && database !== null;
}

export function getFirebaseDatabase() {
  return database;
}
