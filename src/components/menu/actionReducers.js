export const SET_ACTIVE_MENU = 'SET_ACTIVE_MENU'
export const TOGGLE_MENUDRAWER = 'TOGGLE_MENUDRAWER'
export const SET_MENUDRAWER_VISIBILITY = 'SET_MENUDRAWER_VISIBILITY'
export const USER_LOGIN = 'USER_LOGIN'
export const USER_LOGIN_LOADING = 'USER_LOGIN_LOADING'
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE'
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_CHECK = 'USER_CHECK'
export const USER_LOGOUT = 'USER_LOGOUT'

/** Actions **/

export const setActiveMenu = id => ({
  type: SET_ACTIVE_MENU,
  payload: id,
})

export const toggleMenuDrawer = () => ({
  type: TOGGLE_MENUDRAWER,
})

export const setMenuDrawerVisibility = isOpen => ({
  type: SET_MENUDRAWER_VISIBILITY,
  payload: isOpen,
})

export const userLogin = (payload, pathName) => ({
  type: USER_LOGIN,
  payload,
  meta: { auth: true, pathName },
})

export const userLogout = () => ({
  type: USER_LOGOUT,
  meta: { auth: true },
})

/** Reducers **/

export const menuIdReducer = (defaultState = '') =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_ACTIVE_MENU:
        return payload
      default:
        return previousState
    }
  }

export const menuDrawerReducer = (defaultState = false) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case TOGGLE_MENUDRAWER:
        return !previousState
      case SET_MENUDRAWER_VISIBILITY:
        return payload
      default:
        return previousState
    }
  }
