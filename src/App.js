import React, { Component, createElement } from 'react'
import { Provider, connect } from 'react-redux'
import PropTypes from 'prop-types'
import decodeJwt from 'jwt-decode'
import 'font-awesome/css/font-awesome.css'
import { Switch, Route } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import autoprefixer from 'material-ui/utils/autoprefixer'
import queryString from 'query-string'
import {
  defaultTheme,
  Delete,
  Notification,
  Restricted,
  TranslationProvider,
} from 'admin-on-rest'
import Menu from './components/menu/Menu'
import Map from './components/map/Map'
import LayerContent from './components/menu/layers/LayersContent'
import CrudRoute from './components/restricted/shared/CrudRoute'
import Sidebar from './components/menu/Sidebar'
import MenuDrawer from './components/menu/MenuDrawer'

// translations
import messages from './translations'
import { history } from './store/createStore'
import Account from './components/menu/account/Account'
import Configuration from './components/menu/configuration/Configuration'
import RightDrawerRoutes from './components/content/RightDrawerRoutes'
import Discover from './components/menu/discover/Discover'
import Login from './components/menu/authentication/Login'
import CustomTheme from './styles/CustomAdminTheme'
import { setUser } from './components/menu/authentication/actionReducers'

const styles = {
  wrapper: {
    // Avoid IE bug with Flexbox, see #467
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  body: {
    backgroundColor: '#edecec',
    display: 'flex',
    flex: 1,
    overflowY: 'hidden',
  },
  bodySmall: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1
  },
  contentSmall: {
    flex: 1,
    paddingTop: '3em',
  },
  loader: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 16,
    zIndex: 1200,
  },
};

const prefixedStyles = {};

class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    // routes: PropTypes.object.isRequired,
  }

  componentDidMount() {
    console.debug(history)
    const parsedQuery = queryString.parse(location.search)
    let token = parsedQuery.token

    if (typeof token !== "undefined") {
      delete parsedQuery.token
      let target = parsedQuery.target
      delete parsedQuery.target

      const decodedToken = decodeJwt(token)
      localStorage.setItem('id', decodedToken.id)
      localStorage.setItem('token', token)
      window.history.pushState(null, null, (target ? (target + '/') : '') + queryString.stringify(parsedQuery) || '/')
      // history.push('/ttt')// + (target ? (target + '/') : '') + queryString.stringify(parsedQuery))
    } else {
      token = localStorage.getItem('token')
    }

    if (token) {
      const decodedToken = decodeJwt(token)
      localStorage.setItem('id', decodedToken.id)
      localStorage.setItem('token', token)
      this.props.setUser(token, (decodedToken.name || {}).first || (decodedToken.name || {}).last || decodedToken.email, decodedToken.privilege)
    }
  }

  shouldComponentUpdate () {
    return false
  }

  constructor(props) {
    super(props);
    this.state = { drawerOpen: false };
  }

  render() {
    const {
      width,
    } = this.props;

    const muiTheme = getMuiTheme(defaultTheme);
    if (!prefixedStyles.main) {
      // do this once because user agent never changes
      const prefix = autoprefixer(muiTheme);
      prefixedStyles.wrapper = prefix(styles.wrapper);
      prefixedStyles.main = prefix(styles.main);
      prefixedStyles.body = prefix(styles.body);
      prefixedStyles.bodySmall = prefix(styles.bodySmall);
      prefixedStyles.content = prefix(styles.content);
      prefixedStyles.contentSmall = prefix(styles.contentSmall);
    }

    prefixedStyles.content.transition = 'margin-left 350ms cubic-bezier(0.23, 1, 0.32, 1)';
    prefixedStyles.content.overflow = 'hidden';

    if (this.state.drawerOpen) {
      prefixedStyles.content.marginLeft = 156
    } else {
      prefixedStyles.content.marginLeft = 0
    }

    return (
      <Provider store={this.props.store}>
        <TranslationProvider messages={messages}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <div style={prefixedStyles.wrapper}>
                <div style={prefixedStyles.main}>
                  <div className="body" style={width === 1 ? prefixedStyles.bodySmall : prefixedStyles.body}>
                    {createElement(Map, {history: history})}
                    <div style={width === 1 ? prefixedStyles.contentSmall : prefixedStyles.content}>
                      <Switch>
                        <Route exact path="/"/>
                        <Route exact path="/configuration" component={Configuration} />
                        <Route exact path="/discover" component={Discover} />
                        <Route exact path="/login" component={Login} />
                      </Switch>
                      <Switch>
                        <CrudRoute history={history}/>
                      </Switch>
                      <Switch>
                        <Account history={history}/>
                      </Switch>
                      <Switch>
                        <RightDrawerRoutes history={history}/>
                      </Switch>
                    </div>
                    <MenuDrawer muiTheme={CustomTheme}>
                      {createElement(LayerContent)}
                    </MenuDrawer>
                    <Sidebar open={true} muiTheme={CustomTheme}>
                      {createElement(Menu)}
                    </Sidebar>
                  </div>
                  <Notification />
                  {/*{isLoading && <CircularProgress*/}
                    {/*className="app-loader"*/}
                    {/*color="#fff"*/}
                    {/*size={width === 1 ? 20 : 30}*/}
                    {/*thickness={2}*/}
                    {/*style={styles.loader}*/}
                  {/*/>}*/}
                </div>
              </div>
            </MuiThemeProvider>
          </ConnectedRouter>
        </TranslationProvider>
      </Provider>
    );
  }
}

const mapDispatchToProps = {
  setUser,
}

export default connect(null, mapDispatchToProps)(App)
