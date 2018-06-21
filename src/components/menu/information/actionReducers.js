const CHANGE_THEME = 'CHANGE_THEME'
const CHANGE_LOCALE = 'CHANGE_LOCALE'


/** Actions **/

export const changeTheme = theme => ({
    type: CHANGE_THEME,
    payload: theme,
})

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  payload: locale,
})


/** Reducers **/

export const localeReducer = (initialLocale = 'en') => (
  (previousLocale = initialLocale, { type, payload }) => {
    switch (type) {
      case CHANGE_LOCALE:
        return payload;
      default:
        return previousLocale;
    }
  }
)

export const themeReducer = (initialTheme = 'light') => (
  (previousTheme = initialTheme, { type, payload }) => {
    switch (type) {
      case CHANGE_THEME:
        return payload;
      default:
        return previousTheme;
    }
  }
)
