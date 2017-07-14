import { TOGGLE_MENUDRAWER, SET_MENUDRAWER_VISIBILITY } from './actions';

export default (defaultState = false) => (
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
