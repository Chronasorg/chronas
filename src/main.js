import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import createStore,  { history } from './store/createStore'
import 'react-image-gallery/styles/scss/image-gallery.scss'
import './styles/main.scss'
import './styles/videoplayer.scss'
import './styles/login.scss'
// Store Initialization
// ------------------------------------
const store = createStore(window.__INITIAL_STATE__)

// Render Setup
// ------------------------------------
const MOUNT_NODE = document.getElementById('root')

let render = () => {
  const App = require('./App').default
  // const routes = require('./routes/index').default(store)

  ReactDOM.render(
    <Provider store={store}>
      <App store={store} history={history} />
    </Provider>,
    MOUNT_NODE
  )
}

// Development Tools
// ------------------------------------
if (__DEV__) {
  if (module.hot) {
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
    }

    render = () => {
      try {
        renderApp()
      } catch (e) {
        console.error(e)
        renderError(e)
      }
    }

    // Setup hot module replacement
    module.hot.accept([
      './App',
    ], () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    )
  }
}

// Let's Go!
// ------------------------------------
if (!__TEST__) render()
