export const SET_ACTIVE_MENU = 'SET_ACTIVE_MENU';
export const TOGGLE_MENUDRAWER = 'TOGGLE_MENUDRAWER';
export const SET_MENUDRAWER_VISIBILITY = 'SET_MENUDRAWER_VISIBILITY';

/** Actions **/

export const setActiveMenu = id => ({
  type: SET_ACTIVE_MENU,
  payload: id,
});

export const toggleMenuDrawer = () => ({
  type: TOGGLE_MENUDRAWER,
});


export const setMenuDrawerVisibility = isOpen => ({
  type: SET_MENUDRAWER_VISIBILITY,
  payload: isOpen,
});

/** Reducers **/

export const menuIdReducer = (defaultState = "") => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_ACTIVE_MENU:
        return payload;
      default:
        return previousState;
    }
  }
);

export const menuDrawerReducer = (defaultState = false) => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case TOGGLE_MENUDRAWER:
        return !previousState;
      case SET_MENUDRAWER_VISIBILITY:
        return payload;
      default:
        return previousState;
    }
  }
);
