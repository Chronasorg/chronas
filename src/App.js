import React, { Component, createElement } from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import 'font-awesome/css/font-awesome.css'
import { Switch, Route } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import autoprefixer from 'material-ui/utils/autoprefixer'
import Menu from './components/menu/Menu'
import Map from './components/map/Map'
import LayerContent from './components/menu/layers/LayersContent'
import RightContent from './components/content/Content'
import authClient from './components/menu/authentication/authClient'
import {
  defaultTheme,
  Delete,
  Notification,
  Restricted,
  TranslationProvider,
} from 'admin-on-rest'
import CrudRoute from './components/restricted/shared/CrudRoute'
import Sidebar from './components/menu/Sidebar'
import MenuDrawer from './components/menu/MenuDrawer'
import RightDrawer from './components/content/RightDrawer'

// translations
import messages from './translations'
import { history } from './store/createStore'
// your app components
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from './components/restricted/users'
import { PostList, PostCreate, PostEdit, PostShow } from './components/menu/posts'
import { CommentList, CommentEdit, CommentCreate } from './components/menu/comments'
import { ProductList, ProductEdit, ProductCreate } from './components/menu/products'
import Configuration from './components/menu/configuration/Configuration'
import Discover from './components/menu/discover/Discover'
import Login from './components/menu/authentication/Login'
import CustomTheme from './styles/CustomAdminTheme'

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
    // remove={UserDelete} icon={UserIcon}     <Resource name="customers" list={UserList} edit={UserEdit} />

    /*
     <Route exact path="/products" hasCreate render={(routeProps) => <ProductList resource="products" {...routeProps} />} />
     <Route exact path="/products/create" render={(routeProps) => <ProductCreate resource="products" {...routeProps} />} />
     <Route exact path="/products/:id" hasDelete render={(routeProps) => <ProductEdit resource="products" {...routeProps} />} />
     <Route exact path="/products/:id/delete" render={(routeProps) => <Delete resource="products" {...routeProps} />} />

     {createElement(Map)} l 150
    */

    const resourceCollection = {
      users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete},
      areas: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete},
      markers: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete},
      images: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete},
      metadata: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete},
    }
    return (
      <Provider store={this.props.store}>
        <TranslationProvider messages={messages}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <div style={prefixedStyles.wrapper}>
                <div style={prefixedStyles.main}>
                  <div className="body" style={width === 1 ? prefixedStyles.bodySmall : prefixedStyles.body}>
                    {createElement(Map)}
                    <div style={width === 1 ? prefixedStyles.contentSmall : prefixedStyles.content}>
                      <Switch>
                        <Route exact path="/"/>
                        <Route exact path="/configuration" component={Configuration} />
                        <Route exact path="/discover" component={Discover} />
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/posts" hasCreate render={(routeProps) => <PostList resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/create" render={(routeProps) => <PostCreate resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id" hasShow hasDelete render={(routeProps) => <PostEdit resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id/show" hasEdit render={(routeProps) => <PostShow resource="posts" {...routeProps} />}/>
                        <Route exact path="/posts/:id/delete" render={(routeProps) => <Delete resource="posts" {...routeProps} />}/>
                        <Route exact path="/comments" hasCreate render={(routeProps) => { console.debug("routeProps",routeProps); return <CommentList resource="comments" {...routeProps} />}} />
                        <Route exact path="/comments/create" render={(routeProps) => <CommentCreate resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/:id" hasDelete render={(routeProps) => <CommentEdit resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/:id/delete" render={(routeProps) => <Delete resource="comments" {...routeProps} />} />
                        <CrudRoute history={history} resources={resourceCollection} />
                      </Switch>
                    </div>
                    <MenuDrawer muiTheme={CustomTheme}>
                      {createElement(LayerContent)}
                    </MenuDrawer>
                    <RightDrawer muiTheme={CustomTheme}>
                      {createElement(RightContent)}
                    </RightDrawer>
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

export default App
