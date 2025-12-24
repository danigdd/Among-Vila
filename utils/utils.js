export function settingsRestraints(setting, value, comparator) {
  switch (setting) {
    case 'players':
      if (
        (value - 1 < 0 && comparator == 'less') ||
        (value + 1 > 14 && comparator == 'more')
      )
        return false;
      return true;

    case 'impostors':
      if (
        value + 1 > document.getElementById('numberPlayersSelectorCount_id') &&
        comparator == 'more'
      )
        return false;
      return true;
  }
}

export function cleanSettingName(rawName) {
  let cleanName = rawName.toLowerCase();
  cleanName = cleanName.replace(/\s+/g, '');
  return cleanName;
}
