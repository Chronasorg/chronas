import utilsQuery from '../../map/utils/query'

const CHANGE_THEME = 'CHANGE_THEME'
const CHANGE_LOCALE = 'CHANGE_LOCALE'
const CHANGE_MARKERTHEME = 'CHANGE_MARKERTHEME'

const INITIALLOCALE = utilsQuery.getURLParameter('locale') || localStorage.getItem('chs_locale') || 'en'
/** Actions **/

export const changeTheme = theme => ({
  type: CHANGE_THEME,
  payload: theme,
})

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  payload: locale,
})

export const changeMarkerTheme = theme => ({
  type: CHANGE_MARKERTHEME,
  payload: theme,
})

/** Reducers **/

export const localeReducer = (initialLocale = INITIALLOCALE) =>
  (previousLocale = initialLocale, { type, payload }) => {
    switch (type) {
      case CHANGE_LOCALE:
        return payload
      default:
        return previousLocale
    }
  }

export const markerThemeReducer = (initialLocale = 'abstract') =>
  (previousLocale = initialLocale, { type, payload }) => {
    switch (type) {
      case CHANGE_MARKERTHEME:
        return payload
      default:
        return previousLocale
    }
  }

export const themeReducer = (initialTheme = 'light') =>
  (previousTheme = initialTheme, { type, payload }) => {
    switch (type) {
      case CHANGE_THEME:
        return payload
      default:
        return previousTheme
    }
  }
