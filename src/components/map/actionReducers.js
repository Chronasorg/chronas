export const SET_WIKI_ID = 'SET_WIKI_ID'
export const SET_AREA_ITEM = 'SET_AREA_ITEM'
export const SET_MARKER_ITEM = 'SET_MARKER_ITEM'

export const DESELECT_ITEM = 'DESELECT_ITEM'

export const TYPE_AREA = 'areas'
export const TYPE_MARKER = 'markers'

/** Actions **/

export const setWikiId = id => ({
  type: SET_WIKI_ID,
  payload: id,
})

export const selectAreaItem = (wiki, province) => ({
  type: SET_AREA_ITEM,
  payload: [wiki, province],
})

export const selectMarkerItem = (wiki) => ({
  type: SET_MARKER_ITEM,
  payload: [wiki],
})

export const deselectItem = () => ({
  type: DESELECT_ITEM
})

/** Reducers **/

export const selectedItemReducer = (defaultState = { 'wiki': '', 'type': '', 'province': '' }) => (
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_WIKI_ID:
        return {
          ...previousState,
          wiki: payload
        }
      case SET_AREA_ITEM:
        return {
          wiki: payload[0],
          province: payload[1],
          type: TYPE_AREA
        }
      case SET_MARKER_ITEM:
        return {
          wiki: payload[0],
          province: '',
          type: TYPE_MARKER
        }
      case DESELECT_ITEM:
        return defaultState
      default:
        return previousState
    }
  }
)
