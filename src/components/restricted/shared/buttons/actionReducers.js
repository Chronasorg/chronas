export const SET_MODACTIVE = 'SET_MODACTIVE';
export const SET_MODDATA = 'SET_MODDATA';
export const SET_MODDATA_LNG = 'SET_MODDATA_LNG';
export const SET_MODDATA_LAT = 'SET_MODDATA_LAT';
export const REMOVE_MODDATA = 'REMOVE_MODDATA';
export const ADD_MODDATA = 'ADD_MODDATA';

/** Actions **/

export const setModType = modType => ({
  type: SET_MODACTIVE,
  payload: modType,
});

export const setModData = modData => ({
  type: SET_MODDATA,
  payload: modData,
});

export const removeModData = modData => ({
  type: REMOVE_MODDATA,
  payload: modData,
});

export const addModData = modData => ({
  type: ADD_MODDATA,
  payload: modData,
});

export const setModDataLng = Lng => ({
  type: SET_MODDATA_LNG,
  payload: Lng,
});

export const setModDataLat = Lat => ({
  type: SET_MODDATA_LAT,
  payload: Lat,
});


/** Reducers **/

export const modActiveReducer = (defaultState = { 'data': [], 'type': ''}) => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_MODACTIVE:
        if (payload === '')
          return {
            data: [],
            type: payload
          };
        else
          return {
            ...previousState,
            type: payload
          };
      case SET_MODDATA:
        return {
          ...previousState,
          data: payload
        };
      case ADD_MODDATA:
        return {
          ...previousState,
          data: previousState.data.concat(payload)
        };
      case REMOVE_MODDATA:
        return {
          ...previousState,
          data: previousState.data.filter((val) => (val !== payload))
        };
      case SET_MODDATA_LNG:
        return {
          ...previousState,
          data: previousState.data.map((s,i) => (i === 0) ? payload : s)
        };
      case SET_MODDATA_LAT:
        return {
          ...previousState,
          data: previousState.data.map((s,i) => (i === 1) ? payload : s)
        };
      default:
        return previousState;
    }
  }
);