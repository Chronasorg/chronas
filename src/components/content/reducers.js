import { TOGGLE_RIGHTDRAWER, SET_RIGHTDRAWER_VISIBILITY } from './actions';

export const rightDrawerReducer = (defaultState = false) => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case TOGGLE_RIGHTDRAWER:
        return !previousState;
      case SET_RIGHTDRAWER_VISIBILITY:
        return payload;
      default:
        return previousState;
    }
  }
);
