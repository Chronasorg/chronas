import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'admin-on-rest'
import decodeJwt from 'jwt-decode'
import { USER_SIGNUP, setToken } from './actionReducers'
import { properties } from '../../../properties'

export default (type, params) => {
  if (type === AUTH_LOGIN) {
    const { username, password, email, first_name, last_name, education, website, authType } = params;
    if (authType === AUTH_LOGIN) {
      const request = new Request(properties.chronasApiHost + '/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })

      return fetch(request)
        .then(response => {
          if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText)
          }
          return response.json()
        })
        .then(({ token }) => {
          setToken(token)
          // TODO: breadcrumb last login delta
          const decodedToken = decodeJwt(token)
          localStorage.setItem('chs_token', token)
          localStorage.setItem('chs_username', decodedToken.username)
          localStorage.setItem('chs_userid', decodedToken.id)
          localStorage.setItem('chs_privilege', decodedToken.privilege)

          return Promise.resolve(token)
        })
    }
    else if (authType === USER_SIGNUP) {
      const request = new Request(properties.chronasApiHost + '/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password, email, first_name, last_name, education, website }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })

      return fetch(request)
        .then(response => {
          if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText)
          }
          return response.json()
        })
        .then(({ token }) => {
          setToken(token)
          const decodedToken = decodeJwt(token)
          localStorage.setItem('chs_token', token)
          localStorage.setItem('chs_username', decodedToken.username)
          localStorage.setItem('chs_userid', decodedToken.id)
          localStorage.setItem('chs_privilege', decodedToken.privilege)
          return Promise.resolve(token)
        })
    }
  }

  if (type === AUTH_LOGOUT) {
    localStorage.removeItem('chs_token')
    localStorage.removeItem('chs_username')
    localStorage.removeItem('chs_privilege')
    localStorage.removeItem('chs_id')
    return Promise.resolve();
  }

  if (type === AUTH_ERROR) {
    const { status } = params;
    if (status === 401 || status === 403) {
      localStorage.removeItem('chs_token')
      localStorage.removeItem('chs_username')
      localStorage.removeItem('chs_privilege')
      localStorage.removeItem('chs_id')

      return Promise.reject();
    }
    return Promise.resolve();
  }

  if (type === AUTH_CHECK) {
    const { resource } = params;
    return localStorage.getItem('chs_token') ? Promise.resolve() : Promise.reject();
  }

  if (type === AUTH_GET_PERMISSIONS) {
    console.debug("AUTH_GET_PERMISSIONS")
    return Promise.resolve(localStorage.getItem('chs_privilege'));
  }

  return Promise.reject('Unkown method');
}
