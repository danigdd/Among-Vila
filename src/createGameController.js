export let gamesGlobalController = [];
export let mapsGlobalController = [];

export function addGameToGlobalController(game) {
  gamesGlobalController.push(game);
}

export function findGameById(id) {
  const game = gamesGlobalController.find((element) => element.id == id);
  return game;
}
