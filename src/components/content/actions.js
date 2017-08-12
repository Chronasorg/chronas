export const TOGGLE_RIGHTDRAWER = 'TOGGLE_RIGHTDRAWER';
export const SET_RIGHTDRAWER_VISIBILITY = 'SET_RIGHTDRAWER_VISIBILITY';

export const toggleRightDrawer = () => ({
  type: TOGGLE_RIGHTDRAWER,
});

export const setRightDrawerVisibility = isOpen => ({
  type: SET_RIGHTDRAWER_VISIBILITY,
  payload: isOpen,
});
