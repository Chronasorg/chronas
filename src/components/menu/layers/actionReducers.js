export const CHANGE_BASEMAP = 'CHANGE_BASEMAP';
export const SET_AREA = 'SET_AREA';
export const CHANGE_LABEL = 'CHANGE_LABEL';
export const CHANGE_COLOR = 'CHANGE_COLOR';
export const ADD_MARKER = 'ADD_MARKER';
export const REMOVE_MARKER = 'REMOVE_MARKER';
export const SET_MARKER = 'SET_MARKER';
export const TOGGLE_MARKER = 'TOGGLE_MARKER';


/** Actions **/

export const changeBasemap = basemap => ({
  type: CHANGE_BASEMAP,
  payload: basemap,
});

export const setArea = (area, label) => ({
  type: SET_AREA,
  payload: [area, label],
});

export const changeLabel = text => ({
  type: CHANGE_LABEL,
  payload: text,
});

export const changeColor = color => ({
  type: CHANGE_COLOR,
  payload: color,
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

export const areaReducer = (initial = { 'color': 'political', 'label': 'political'}) => (
  (prevArea = initial, { type, payload }) => {
    switch (type) {
      case SET_AREA:
        return {
          color: payload[0],
          label: payload[1]
        }
      case CHANGE_COLOR:
        return {
          ...prevArea,
          color: payload
        }
      case CHANGE_LABEL:
        return {
          ...prevArea,
          label: payload
        };
      default:
        return prevArea;
    }
  }
);

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
