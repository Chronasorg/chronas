export const CHANGE_THEME = 'CHANGE_THEME';
export const CHANGE_LOCALE = 'CHANGE_LOCALE';

export const changeTheme = theme => ({
    type: CHANGE_THEME,
    payload: theme,
});

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  payload: locale,
});
