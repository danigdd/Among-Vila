export function settingsRestraints(setting, value, comparator) {
  switch (setting) {
    case 'players':
      console.log('entered');
      if (
        (value - 1 < 0 && comparator == 'less') ||
        (value + 1 > 14 && comparator == 'more')
      )
        return false;
      return true;
  }
}
