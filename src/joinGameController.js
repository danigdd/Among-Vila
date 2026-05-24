import { findGameByIdRemote } from './createGameController';

export async function joinGame(gameID) {
  return findGameByIdRemote(gameID);
}
