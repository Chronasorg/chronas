import { applyMiddleware, compose, createStore as createReduxStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import makeRootReducer from './reducers'
import { updateLocation } from './location'
import createHistory from 'history/createHashHistory'
import { authClient, crudSaga, simpleRestClient } from 'admin-on-rest';
import { routerMiddleware } from 'react-router-redux'
export const history = createHistory();

const createStore = (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk]

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = []
  let composeEnhancers = compose

  if (__DEV__) {
    if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================

  const sagaMiddleware = createSagaMiddleware();

  const store = createReduxStore(
    makeRootReducer(),
    initialState,
    compose(
      applyMiddleware(sagaMiddleware, routerMiddleware(history)),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    )
  );

  const restClient = simpleRestClient('http://localhost:3000');

  sagaMiddleware.run(crudSaga(restClient, authClient));
  store.asyncReducers = {}

  // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
  store.unsubscribeHistory = browserHistory.listen(updateLocation(store))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  return store
}

export default createStore
