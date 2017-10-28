import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'admin-on-rest';
import decodeJwt from 'jwt-decode';
import { setToken } from './actionReducers'

export default (type, params) => {
  if (type === AUTH_LOGIN) {
    const { username, password } = params;
    const request = new Request('http://localhost:4040/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    return fetch(request)
      .then(response => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(({ token }) => {
        setToken(token)
        const decodedToken = decodeJwt(token)
        localStorage.setItem('token', token)
        localStorage.setItem('username', decodedToken.username)
        localStorage.setItem('privilege', decodedToken.privilege)

        return Promise.resolve(token);
      });
  }

  if (type === AUTH_LOGOUT) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('privilege')
    return Promise.resolve();
  }

  if (type === AUTH_ERROR) {
    const { status } = params;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('privilege')
      return Promise.reject();
    }
    return Promise.resolve();
  }

  if (type === AUTH_CHECK) {
    const { resource } = params;
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  }

  if (type === AUTH_GET_PERMISSIONS) {
    console.debug("AUTH_GET_PERMISSIONS")
    return Promise.resolve(localStorage.getItem('privilege'));
  }

  return Promise.reject('Unkown method');
}
