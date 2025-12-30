import { findGameById } from './createGameController';
export function joinGame(gameID) {
  const game = findGameById(gameID);
  return game;
}
