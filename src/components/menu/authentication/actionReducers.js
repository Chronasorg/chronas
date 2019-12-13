export const FLUSH_USER = 'FLUSH_USER'
export const SET_USER = 'SET_USER'
export const SET_PRIVILEGE = 'SET_PRIVILEGE'
export const SET_USERNAME = 'SET_USERNAME'
export const SET_TOKEN = 'SET_TOKEN'
export const USER_LOGIN_SUCCESS = 'AOR/USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAILURE = 'AOR/USER_LOGIN_FAILURE'
export const USER_LOGIN = 'AOR/USER_LOGIN'
export const USER_SIGNIN = 'AOR/USER_SIGNIN'
export const USER_SIGNUP = 'USER_SIGNUP'
export const USER_LOGOUT = 'AUTH_LOGOUT'
export const CUSTOM_NOTIFICATION = 'AOR/SHOW_NOTIFICATION'
const UPDATE_USER_SCORE = 'UPDATE_USER_SCORE'
const SET_USER_SCORE = 'SET_USER_SCORE'

/** Actions **/

export const userSignup = (payload, pathName) => ({
  type: USER_LOGIN,
  payload,
  meta: { auth: true, pathName },
})

export const setUser = (token, user, privilege, avatar, score) => ({
  type: SET_USER,
  payload: [token, user, privilege, avatar, score],
})

export const customNotification = message => ({
  type: CUSTOM_NOTIFICATION,
  payload: message,
})

export const setToken = token => ({
  type: SET_TOKEN,
  payload: token,
})

export const setUsername = username => ({
  type: SET_USERNAME,
  payload: username,
})

export const setUserScore = score => ({
  type: SET_USER_SCORE,
  payload: score,
})

export const updateUserScore = delta => ({
  type: UPDATE_USER_SCORE,
  payload: delta,
})

export const setPrivilege = privilege => ({
  type: SET_PRIVILEGE,
  payload: privilege,
})

export const logout = () => ({
  type: USER_LOGOUT,
})

/** Reducers **/

export const userReducer = (initial = { 'token': '', 'username': '', 'privilege': '', 'score':  +localStorage.getItem('chs_score') || 1 }) =>
  (prevUser = initial, { type, payload }) => {
    switch (type) {
      case FLUSH_USER:
      case USER_LOGOUT:
      case USER_LOGIN_FAILURE:
        localStorage.removeItem('chs_token')
        localStorage.removeItem('chs_score')
        return initial
      case SET_USER:
        return {
          token: payload[0],
          username: payload[1],
          privilege: payload[2],
          avatar: payload[3],
          score: payload[4]
        }
      case USER_LOGIN_SUCCESS:
      case SET_TOKEN:
        return {
          ...prevUser,
          token: payload
        }
      case SET_USER_SCORE:
        return {
          ...prevUser,
          score: payload
        }
      case UPDATE_USER_SCORE:
        return {
          ...prevUser,
          score: (prevUser.score + payload)
        }
      case SET_USERNAME:
        return {
          ...prevUser,
          username: payload
        }
      case SET_PRIVILEGE:
        return {
          ...prevUser,
          privilege: payload
        }
      default:
        return prevUser
    }
  }
