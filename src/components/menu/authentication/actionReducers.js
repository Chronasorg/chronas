export const FLUSH_USER = 'FLUSH_USER'
export const SET_USER = 'SET_USER'
export const SET_ROLE = 'SET_ROLE'
export const SET_USERNAME = 'SET_USERNAME'
export const SET_TOKEN = 'SET_TOKEN'
export const USER_LOGIN_SUCCESS = 'AOR/USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAILURE = 'AOR/USER_LOGIN_FAILURE'
export const USER_LOGOUT = 'AUTH_LOGOUT'
export const CUSTOM_NOTIFICATION = 'AOR/SHOW_NOTIFICATION'


/** Actions **/

export const setUser = (token, user, role) => ({
  type: SET_USER,
  payload: [token, user, role],
});

export const customNotification = message => ({
  type: CUSTOM_NOTIFICATION,
  payload: message,
});

export const setToken = token => ({
  type: SET_TOKEN,
  payload: token,
});

export const setUsername = username => ({
  type: SET_USERNAME,
  payload: username,
});

export const setRole = role => ({
  type: SET_ROLE,
  payload: role,
});

export const logout = () => ({
  type: USER_LOGOUT,
})

/** Reducers **/

export const userReducer = (initial = { 'token': '', 'username': '', 'role': '' }) => (
  (prevUser = initial, { type, payload }) => {
    console.debug(type,payload)
    switch (type) {
      case FLUSH_USER:
      case USER_LOGOUT:
      case USER_LOGIN_FAILURE:
        localStorage.removeItem('token');
        return initial
      case SET_USER:
        return {
          token: payload[0],
          username: payload[1],
          role: payload[2]
        }
      case USER_LOGIN_SUCCESS:
      case SET_TOKEN:
        return {
          ...prevUser,
          token: payload
        }
      case SET_USERNAME:
        return {
          ...prevUser,
          username: payload
        }
      case SET_ROLE:
        return {
          ...prevUser,
          role: payload
        };
      default:
        return prevUser;
    }
  }
);
