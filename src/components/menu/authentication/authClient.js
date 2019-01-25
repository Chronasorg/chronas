import { AUTH_CHECK, AUTH_GET_PERMISSIONS, AUTH_ERROR, AUTH_LOGIN, AUTH_LOGOUT } from 'admin-on-rest'
import decodeJwt from 'jwt-decode'
import { setToken, USER_SIGNUP } from './actionReducers'
import { properties } from '../../../properties'

export default (type, params) => {
  if (type === AUTH_LOGIN) {
    const { username, avatar, bio, password, email, first_name, last_name, education, website, authType } = params
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
          if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
          localStorage.setItem('chs_username', decodedToken.username)
          localStorage.setItem('chs_userid', decodedToken.id)
          localStorage.setItem('chs_privilege', decodedToken.privilege)

          return Promise.resolve(token)
        })
    } else if (authType === USER_SIGNUP) {
      const request = new Request(properties.chronasApiHost + '/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password, avatar, email, first_name, last_name, education, bio, website }),
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
          if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
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
    localStorage.removeItem('chs_avatar')
    localStorage.removeItem('chs_privilege')
    localStorage.removeItem('chs_id')
    return Promise.resolve()
  }

  if (type === AUTH_ERROR) {
    const { status } = params
    if (status === 401 || status === 403) {
      localStorage.removeItem('chs_token')
      localStorage.removeItem('chs_avatar')
      localStorage.removeItem('chs_username')
      localStorage.removeItem('chs_privilege')
      localStorage.removeItem('chs_id')

      return Promise.reject(type)
    }
    return Promise.resolve()
  }

  if (type === AUTH_CHECK) {
    const { resource } = params
    return localStorage.getItem('chs_token') ? Promise.resolve() : Promise.reject(new Error('no token stored'))
  }

  if (type === AUTH_GET_PERMISSIONS) {
    return Promise.resolve(localStorage.getItem('chs_privilege'))
  }

  return Promise.reject(new Error('Unkown method'))
}
