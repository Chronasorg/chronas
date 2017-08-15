export const SET_ITEM_ID = 'SET_ITEM_ID';

/** Actions **/

export const setItemId = id => ({
  type: SET_ITEM_ID,
  payload: id,
});

/** Reducers **/

export const itemIdReducer = (defaultState = "") => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_ITEM_ID:
        return payload;
      default:
        return previousState;
    }
  }
);
