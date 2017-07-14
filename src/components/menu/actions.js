export const TOGGLE_MENUDRAWER = 'TOGGLE_MENUDRAWER';

export const toggleMenuDrawer = () => ({
  type: TOGGLE_MENUDRAWER,
});

export const SET_MENUDRAWER_VISIBILITY = 'SET_MENUDRAWER_VISIBILITY';

export const setMenuDrawerVisibility = isOpen => ({
  type: SET_MENUDRAWER_VISIBILITY,
  payload: isOpen,
});
