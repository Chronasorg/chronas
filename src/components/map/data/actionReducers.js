export const SET_LOAD_STATUS = 'SET_LOAD_STATUS';

/** Actions **/

export const setLoadStatus = status => ({
  type: SET_LOAD_STATUS,
  payload: status,
});

/** Reducers **/

export const loadingReducer = (defaultState = true) => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_LOAD_STATUS:
        return payload;
      default:
        return previousState;
    }
  }
);
