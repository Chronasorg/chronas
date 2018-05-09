export const SET_WIKI_ID = 'SET_WIKI_ID'
export const SET_AREA_ITEM = 'SET_AREA_ITEM'
export const SET_MARKER_ITEM = 'SET_MARKER_ITEM'
export const SET_LINKED_ITEM = 'SET_LINKED_ITEM'
export const SET_VALUE = 'SET_VALUE'
export const SET_FULL_ITEM = 'SET_FULL_ITEM'
export const SET_EPIC_ITEM = 'SET_EPIC_ITEM'
export const DESELECT_ITEM = 'DESELECT_ITEM'

export const TYPE_AREA = 'areas'
export const TYPE_MARKER = 'markers'
export const TYPE_LINKED = 'linked'
export const TYPE_EPIC = 'epic'

export const WIKI_RULER_TIMELINE = 'WIKI_RULER_TIMELINE'
export const WIKI_PROVINCE_TIMELINE = 'WIKI_PROVINCE_TIMELINE'

/** Actions **/

export const setWikiId = id => ({
  type: SET_WIKI_ID,
  payload: id,
})

export const selectValue = value => ({
  type: SET_VALUE,
  payload: value,
})

export const setFullItem = (wiki, province, type) => ({
  type: SET_FULL_ITEM,
  payload: [wiki, province, type],
})

export const selectAreaItem = (wiki, province) => ({
  type: SET_AREA_ITEM,
  payload: [wiki, province],
})

export const selectEpicItem = (wiki, province) => ({
  type: SET_EPIC_ITEM,
  payload: [wiki, province],
})

export const selectLinkedItem = (value) => ({
  type: SET_LINKED_ITEM,
  payload: [value, value],
})

export const selectMarkerItem = (wiki, value) => ({
  type: SET_MARKER_ITEM,
  payload: [wiki, value],
})

export const deselectItem = () => ({
  type: DESELECT_ITEM
})

/** Reducers **/

export const selectedItemReducer = (defaultState = { 'wiki': '', 'type': '', 'value': '' }) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_VALUE:
        return {
          ...previousState,
          value: payload
        }
      case SET_WIKI_ID:
        return {
          ...previousState,
          wiki: payload
        }
      case SET_FULL_ITEM:
        return {
          wiki: payload[0],
          value: payload[1],
          type: payload[2]
        }
      case SET_AREA_ITEM:
        return {
          wiki: payload[0],
          value: payload[1],
          type: TYPE_AREA
        }
      case SET_EPIC_ITEM:
        return {
          wiki: payload[0],
          value: payload[1],
          type: TYPE_EPIC
        }
      case SET_LINKED_ITEM:
        return {
          wiki: payload[0],
          value: payload[1],
          type: TYPE_LINKED
        }
      case SET_MARKER_ITEM:
        return {
          wiki: payload[0],
          value: payload[1],
          type: TYPE_MARKER
        }
      case DESELECT_ITEM:
        return defaultState
      default:
        return previousState
    }
  }
