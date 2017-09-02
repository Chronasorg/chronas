import { combineReducers } from 'redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import locationReducer from './location'
import { adminReducer } from 'admin-on-rest'
import { localeReducer, themeReducer } from '../components/menu/configuration/actionReducers'
import { basemapReducer, areaReducer, markerReducer } from '../components/menu/layers/actionReducers'
import { rightDrawerReducer } from '../components/content/actionReducers'
import { itemIdReducer } from '../components/map/actionReducers'
import { yearReducer } from '../components/map/timeline/actionReducers'
import { menuDrawerReducer, menuIdReducer } from '../components/menu/actionReducers'
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
    basemap: basemapReducer(),
    menuDrawerOpen: menuDrawerReducer(),
    locale: localeReducer(),
    theme: themeReducer(),
    location: locationReducer,
    menuItemActive: menuIdReducer(),
    activeArea: areaReducer(),
    activeMarkers: markerReducer(),
    selectedItem: itemIdReducer(),
    selectedYear: yearReducer(),
    form: formReducer,
    rightDrawerOpen: rightDrawerReducer(),
    routing: routerReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
