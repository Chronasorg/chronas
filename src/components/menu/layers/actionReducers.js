import utilsQuery from '../../map/utils/query'

export const CHANGE_BASEMAP = 'CHANGE_BASEMAP'
export const SET_AREA = 'SET_AREA'
export const SET_AREA_COLOR_LABEL = 'SET_AREA_COLOR_LABEL'
export const CHANGE_AREA_DATA = 'CHANGE_AREA_DATA'
export const CHANGE_LABEL = 'CHANGE_LABEL'
export const CHANGE_COLOR = 'CHANGE_COLOR'
export const SET_POPOPACITY = 'SET_POPOPACITY'
export const SET_PROVINCEBORDERS = 'SET_PROVINCEBORDERS'

export const ADD_MARKER = 'ADD_MARKER'
export const REMOVE_MARKER = 'REMOVE_MARKER'
export const SET_MARKER = 'SET_MARKER'
export const SET_CLUSTER = 'SET_CLUSTER'
export const TOGGLE_MARKER = 'TOGGLE_MARKER'
export const SET_MARKERLIMIT = 'SET_MARKERLIMIT'

export const ADD_EPIC = 'ADD_EPIC'
export const REMOVE_EPIC = 'REMOVE_EPIC'
export const SET_EPIC = 'SET_EPIC'
export const TOGGLE_EPIC = 'TOGGLE_EPIC'

export const TOGGLE_MIGRATION = 'TOGGLE_MIGRATION'
export const SET_MIGRATION = 'SET_MIGRATION'

/** Actions **/

export const changeBasemap = basemap => ({
  type: CHANGE_BASEMAP,
  payload: basemap,
})

export const setPopOpacity = popopacityActive => ({
  type: SET_POPOPACITY,
  payload: popopacityActive,
})

export const setProvinceBorders = borderActive => ({
  type: SET_PROVINCEBORDERS,
  payload: borderActive,
})

export const setClusterMarkers = clusterActive => {
  localStorage.setItem('chs_cluster', clusterActive)
  return {
    type: SET_CLUSTER,
    payload: clusterActive,
  }
}

export const setArea = (data, color, label) => ({
  type: SET_AREA,
  payload: [data, color, label],
})

export const setAreaColorLabel = (color, label) => ({
  type: SET_AREA_COLOR_LABEL,
  payload: [color, label],
})

export const changeAreaData = data => ({
  type: CHANGE_AREA_DATA,
  payload: data,
})

export const changeLabel = text => ({
  type: CHANGE_LABEL,
  payload: text,
})

export const changeColor = color => ({
  type: CHANGE_COLOR,
  payload: color,
})

export const setMarkerLimit = limit => ({
  type: SET_MARKERLIMIT,
  payload: limit,
})

export const addMarker = marker => ({
  type: ADD_MARKER,
  payload: marker,
})

export const removeMarker = marker => ({
  type: REMOVE_MARKER,
  payload: marker,
})

export const setMarker = markers => ({
  type: SET_MARKER,
  payload: markers,
})

export const toggleMarker = marker => ({
  type: TOGGLE_MARKER,
  payload: marker,
})

export const addEpic = epic => ({
  type: ADD_EPIC,
  payload: epic,
})

export const removeEpic = epic => ({
  type: REMOVE_EPIC,
  payload: epic,
})

export const setEpic = epics => ({
  type: SET_EPIC,
  payload: epics,
})

export const toggleEpic = epic => ({
  type: TOGGLE_EPIC,
  payload: epic,
})

export const setMigration = migrationActive => ({
  type: SET_MIGRATION,
  payload: migrationActive,
})

export const toggleMigration = () => ({
  type: TOGGLE_MIGRATION,
})

/** Reducers **/

export const mapStylesReducer = (initial = {
  basemap: 'topographic',
  showProvinceBorders: true,
  'popOpacity': false,
  'clusterMarkers': (localStorage.getItem('chs_cluster') === 'true') || false
}) =>
  (prevMapStyle = initial, { type, payload }) => {
    switch (type) {
      case SET_POPOPACITY:
        return {
          ...prevMapStyle,
          popOpacity: payload
        }
      case CHANGE_BASEMAP:
        return {
          ...prevMapStyle,
          basemap: payload
        }
      case SET_PROVINCEBORDERS:
        return {
          ...prevMapStyle,
          showProvinceBorders: payload
        }
      case SET_CLUSTER:
        return {
          ...prevMapStyle,
          clusterMarkers: payload
        }
      default:
        return prevMapStyle
    }
  }

export const areaReducer = (initial = { 'data': {}, 'color': 'ruler', 'label': 'ruler' }) =>
  (prevArea = initial, { type, payload }) => {
    switch (type) {
      case SET_AREA:
        localStorage.setItem('chs_dyk_coloring', true)
        return {
          ...prevArea,
          data: payload[0],
          color: payload[1],
          label: payload[2]
        }
      case SET_AREA_COLOR_LABEL:
        localStorage.setItem('chs_dyk_coloring', true)
        return {
          ...prevArea,
          color: payload[0],
          label: payload[1],
        }
      case CHANGE_COLOR:
        localStorage.setItem('chs_dyk_coloring', true)
        return {
          ...prevArea,
          color: payload
        }
      case CHANGE_LABEL:
        return {
          ...prevArea,
          label: payload
        }
      case CHANGE_AREA_DATA:
        return {
          ...prevArea,
          data: payload
        }
      default:
        return prevArea
    }
  }

export const markerReducer = (initial = {
  list: [],
  limit: utilsQuery.getURLParameter('limit') || '2000' // (localStorage.getItem('chs_markerLimit') ? +localStorage.getItem('chs_markerLimit') : 2000)
}) =>
  (prevMarker = initial, { type, payload }) => {
    switch (type) {
      case SET_MARKERLIMIT:
        localStorage.setItem('chs_dyk_markerlimit', true)
        return {
          ...prevMarker,
          limit: payload,
        }
      case SET_MARKER:
        return {
          ...prevMarker,
          list: payload,
        }
      case TOGGLE_MARKER:
        if (prevMarker.list.indexOf(payload) > -1) {
          return {
            ...prevMarker,
            list: [
              ...prevMarker.list.filter(marker =>
                marker !== payload)
            ],
          }
        } else {
          return {
            ...prevMarker,
            list: [
              ...prevMarker.list,
              payload
            ],
          }
        }
      case ADD_MARKER:
        return {
          ...prevMarker,
          list: [
            ...prevMarker.list,
            payload
          ],
        }
      case REMOVE_MARKER:
        return {
          ...prevMarker,
          list: [
            ...prevMarker.list.filter(marker =>
              marker !== payload)
          ],
        }
      default:
        return prevMarker
    }
  }

export const epicReducer = (initial = []) =>
  (prevEpic = initial, { type, payload }) => {
    switch (type) {
      case SET_EPIC:
        return payload
      case TOGGLE_EPIC:
        if (prevEpic.indexOf(payload) > -1) {
          return [
            ...prevEpic.filter(epic =>
              epic !== payload)
          ]
        } else {
          return [
            ...prevEpic,
            payload
          ]
        }
      case ADD_EPIC:
        return [
          ...prevEpic,
          payload
        ]
      case REMOVE_EPIC:
        return [
          ...prevEpic.filter(epic =>
            epic !== payload)
        ]
      default:
        return prevEpic
    }
  }

export const migrationReducer = (defaultState = false) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case TOGGLE_MIGRATION:
        return !previousState
      case SET_MIGRATION:
        return payload
      default:
        return previousState
    }
  }
