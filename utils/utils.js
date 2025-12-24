export function maxImpostorsForPlayers(players) {
  if (players <= 6) return 1;
  if (players <= 9) return 2;
  if (players <= 13) return 3;
  return 4; // 14
}

export function clampImpostorsToPlayers(players, impostors) {
  const max = maxImpostorsForPlayers(players);
  if (impostors > max) return max;
  return impostors;
}

export function cleanSettingName(rawName) {
  let cleanName = rawName.toLowerCase();
  cleanName = cleanName.replace(/\s+/g, '');
  return cleanName;
}
