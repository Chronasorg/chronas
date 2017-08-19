export const CHANGE_BASEMAP = 'CHANGE_BASEMAP';
export const CHANGE_AREA = 'CHANGE_AREA';
export const ADD_MARKER = 'ADD_MARKER';
export const REMOVE_MARKER = 'REMOVE_MARKER';
export const SET_MARKER = 'SET_MARKER';
export const TOGGLE_MARKER = 'TOGGLE_MARKER';


/** Actions **/

export const changeBasemap = basemap => ({
  type: CHANGE_BASEMAP,
  payload: basemap,
});

export const changeArea = area => ({
  type: CHANGE_AREA,
  payload: area,
});

export const addMarker = marker => ({
  type: ADD_MARKER,
  payload: marker,
});

export const removeMarker = marker => ({
  type: REMOVE_MARKER,
  payload: marker,
});

export const setMarker = markers => ({
  type: SET_MARKER,
  payload: markers,
});

export const toggleMarker = marker => ({
  type: TOGGLE_MARKER,
  payload: marker,
})


/** Reducers **/

export const basemapReducer = (initial = 'watercolor') => (
  (initialBasemap = initial, { type, payload }) => {
    switch (type) {
      case CHANGE_BASEMAP:
        return payload;
      default:
        return initialBasemap;
    }
  }
);

export const areaReducer = (initial = 'political') => (
  (prevArea = initial, { type, payload }) => {
    switch (type) {
      case CHANGE_AREA:
        return payload;
      default:
        return prevArea;
    }
  }
)


export const markerReducer = (initial = []) => (
  (prevMarker = initial, { type, payload }) => {
    switch (type) {
      case SET_MARKER:
        return payload
      case TOGGLE_MARKER:
        if (prevMarker.indexOf(payload) > -1) {
          return [
            ...prevMarker.filter(marker =>
            marker !== payload)
          ]
        } else {
          return [
            ...prevMarker,
            payload
          ]
        }
      case ADD_MARKER:
        return [
          ...prevMarker,
          payload
        ]
      case REMOVE_MARKER:
        return [
          ...prevMarker.filter(marker =>
          marker !== payload)
        ]
      default:
        return prevMarker
    }
  }
)
