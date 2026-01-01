import { findPlayerByID } from './createPlayer';

export let gamesGlobalController = [];
export let mapsGlobalController = [];

export function addGameToGlobalController(game) {
  gamesGlobalController.push(game);
}

export function findGameById(id) {
  const game = gamesGlobalController.find((element) => element.id == id);
  return game;
}

export function addPlayerToGame(playerID, gameID) {
  const currentGame = findGameById(gameID);
  const currentPlayer = findPlayerByID(playerID);
  currentGame['currentPlayers'].push(currentPlayer);
}
