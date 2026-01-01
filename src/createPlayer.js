const globalPlayerController = [];

export function createPlayer(name, color) {
  let player = {
    name,
    color,
    id: Math.floor(Math.random() * 900000) + 100000,
  };

  addPlayerToGlobalController(player);
  return player;
}

export function addPlayerToGlobalController(player) {
  globalPlayerController.push(player);
}

export function removePlayerOfGlobalController(player_id) {
  const index = globalPlayerController.findIndex(
    (player) => player.id === player_id
  );

  if (index !== -1) {
    globalPlayerController.splice(index, 1);
  }
}
