export const SET_LOAD_STATUS = 'SET_LOAD_STATUS'
export const SET_METADATA = 'SET_METADATA'
export const UPDATE_SINGLE_METADATA = 'SET_METADATA'

/** Actions **/

export const setLoadStatus = status => ({
  type: SET_LOAD_STATUS,
  payload: status,
})

export const setMetadata = data => ({
  type: SET_METADATA,
  payload: data,
})

export const updateSingleMetadata = (accessor, data) => ({
  type: UPDATE_SINGLE_METADATA,
  payload: [accessor, data],
})

/** Reducers **/

export const loadingReducer = (defaultState = true) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_LOAD_STATUS:
        return payload
      default:
        return previousState
    }
  }

export const metadataReducer = (defaultState = {}) =>
  (previousState = defaultState, { type, payload }) => {
    switch (type) {
      case SET_METADATA:
        return payload
      case UPDATE_SINGLE_METADATA:
        return { ...previousState, [payload[0]]: payload[1] }
      default:
        return previousState
    }
  }
