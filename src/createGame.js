export function createGameSettings(
  numberPlayers,
  numberImpostors,
  emergenciesPerPlayer,
  murderCooldown,
  anonVote,
  hideTasks,
  discussTime
) {
  const gameSettings = {
    numberPlayers,
    numberImpostors,
    emergenciesPerPlayer,
    murderCooldown,
    anonVote,
    hideTasks,
    discussTime,
    id: Math.floor(Math.random() * 900000) + 100000,
  };

  return gameSettings;
}
