export const TOGGLE_RIGHTDRAWER = 'TOGGLE_RIGHTDRAWER'
export const SET_RIGHTDRAWER_VISIBILITY = 'SET_RIGHTDRAWER_VISIBILITY'

/** Actions **/

export const toggleRightDrawer = () => ({
  type: TOGGLE_RIGHTDRAWER,
})

export const setRightDrawerVisibility = isOpen => ({
  type: SET_RIGHTDRAWER_VISIBILITY,
  payload: isOpen,
})

/** Reducers **/

export const rightDrawerReducer = (defaultState = false) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case TOGGLE_RIGHTDRAWER:
        return !previousState
      case SET_RIGHTDRAWER_VISIBILITY:
        return payload
      default:
        return previousState
    }
  }
