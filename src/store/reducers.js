import { combineReducers } from 'redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import locationReducer from './location'
import { adminReducer } from 'admin-on-rest'
import reducerLocale from '../components/menu/configuration/reducerLocale'
import { basemapReducer } from '../components/menu/layers/reducers'
import { rightDrawerReducer } from '../components/content/reducers'
import reducerMenuDrawer from '../components/menu/reducerMenuDrawer'
import { reducer as formReducer } from 'redux-form'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    admin: adminReducer([
      { name: 'categories' },
      { name: 'comments' },
      { name: 'customers' },
      { name: 'posts' },
      { name: 'products' },
      { name: 'reviews' },
      { name: 'settings' },
      { name: 'tags' },
      { name: 'users' }
    ]),
    locale: reducerLocale(),
    basemap: basemapReducer(),
    menuDrawerOpen: reducerMenuDrawer(),
    rightDrawerOpen: rightDrawerReducer(),
    form: formReducer,
    routing: routerReducer,
    location: locationReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
