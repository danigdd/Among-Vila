export function createGameSettings(
  numberPlayers,
  numberImpostors,
  emergenciesPerPlayer,
  murderCooldown,
  anonVote,
  hideTasks,
  discussTime,
  map
) {
  const gameSettings = {
    numberPlayers,
    numberImpostors,
    emergenciesPerPlayer,
    murderCooldown,
    anonVote,
    hideTasks,
    discussTime,
    map,
  };

  return gameSettings;
}
