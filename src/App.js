import React, { Component, createElement } from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import 'font-awesome/css/font-awesome.css'
import { Switch, Route } from 'react-router-dom'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import autoprefixer from 'material-ui/utils/autoprefixer'
import Menu from './components/menu/menu'
import fakeRestServer from './dummyRest/restServer'

// prebuilt admin-on-rest features
import {
  authClient,
  adminReducer,
  defaultTheme,
  localeReducer,
  crudSaga,
  simpleRestClient,
  Delete,
  Logout,
  TranslationProvider,
} from 'admin-on-rest';

import Sidebar from './components/menu/Sidebar'
import Sidedrawer from './components/menu/Sidedrawer'

// translations
import messages from './translations';
import { history } from './store/createStore';

// your app components
import { PostList, PostCreate, PostEdit, PostShow } from './components/menu/posts';
import { CommentList, CommentEdit, CommentCreate } from './components/menu/comments';
import { ProductList, ProductEdit, ProductCreate } from './components/menu/products';
import Configuration from './components/menu/configuration/Configuration';
import CustomTheme from './styles/CustomAdminTheme';


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
    flex: 1,
    padding: '2em',
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

const logout = authClient ? createElement(Logout) : null;

class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    // routes: PropTypes.object.isRequired,
  }

  shouldComponentUpdate () {
    return false
  }

  constructor(props) {
    super(props);
    this.state = { drawerOpen: false };
  }
  componentDidMount() {
    this.restoreFetch = fakeRestServer();
  }

  componentWillUnmount() {
    this.restoreFetch();
  }

  render() {
    const {
      authClient,
      customRoutes,
      dashboard,
      isLoading,
      menu,
      resources,
      theme,
      title,
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

    prefixedStyles.content.transition = 'margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1)';

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
                    <div style={width === 1 ? prefixedStyles.contentSmall : prefixedStyles.content}>
                      TEST!!MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                vMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                vMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPvMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP                MAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAPMAP
                      <Switch>
                        <Route exact path="/"/>
                        <Route exact path="/configuration" component={Configuration} />,
                        <Route exact path="/posts" hasCreate render={(routeProps) => <PostList resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/create" render={(routeProps) => <PostCreate resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id" hasShow hasDelete render={(routeProps) => <PostEdit resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id/show" hasEdit render={(routeProps) => <PostShow resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id/delete" render={(routeProps) => <Delete resource="posts" {...routeProps} />}/>
                        <Route exact path="/comments" hasCreate render={(routeProps) => <CommentList resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/create" render={(routeProps) => <CommentCreate resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/:id" hasDelete render={(routeProps) => <CommentEdit resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/:id/delete" render={(routeProps) => <Delete resource="comments" {...routeProps} />} />
                        <Route exact path="/products" hasCreate render={(routeProps) => <ProductList resource="products" {...routeProps} />} />
                        <Route exact path="/products/create" render={(routeProps) => <ProductCreate resource="products" {...routeProps} />} />
                        <Route exact path="/products/:id" hasDelete render={(routeProps) => <ProductEdit resource="products" {...routeProps} />} />
                        <Route exact path="/products/:id/delete" render={(routeProps) => <Delete resource="products" {...routeProps} />} />
                      </Switch>
                    </div>
                    <Sidedrawer muiTheme={CustomTheme}>
                      {createElement(Menu, {
                        logout})}
                    </Sidedrawer>
                    <Sidebar open={true} muiTheme={CustomTheme}>
                      {createElement(Menu, {
                        logout})}
                    </Sidebar>
                  </div>
                  {/*<Notification />*/}
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

export default App
