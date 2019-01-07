import React, { Component, createElement } from 'react'
import { connect, Provider } from 'react-redux'
import axios from 'axios'
import { defaultTheme, Delete, Restricted, showNotification, TranslationProvider } from 'admin-on-rest'
import decodeJwt from 'jwt-decode'
import 'font-awesome/css/font-awesome.css'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import autoprefixer from 'material-ui/utils/autoprefixer'
import { setLoadStatus, setMetadata } from './components/map/data/actionReducers'
import { selectAreaItem, selectMarkerItem, TYPE_AREA, TYPE_MARKER } from './components/map/actionReducers'
import { setArea, setAreaColorLabel, setEpic, setMarker } from './components/menu/layers/actionReducers'
import { setYear } from './components/map/timeline/actionReducers'
import Notification from './components/overwrites/Notification'
import Menu from './components/menu/Menu'
import Map from './components/map/Map'
import LayerContent from './components/menu/layers/LayersContent'
import Sidebar from './components/menu/Sidebar'
import MenuDrawer from './components/menu/MenuDrawer'
import LoadingBar from './components/global/LoadingBar'
import PledgeDialog from './components/pledgeDialog/PledgeDialog'
import LoadingPage from './components/loadingPage/LoadingPage'
import messages from './translations'
import { history } from './store/createStore'
import Account from './components/menu/account/Account'
import Board from './components/menu/board/Board'
import Configuration from './components/menu/configuration/Configuration'
import TOS from './components/menu/tos/TOS'
import Information from './components/menu/information/Information'
import Share from './components/menu/share/Share'
import RightDrawerRoutes from './components/content/RightDrawerRoutes'
import Discover from './components/menu/discover/Discover'
import Login from './components/menu/authentication/Login'
import customTheme from './styles/CustomAdminTheme'
import { setUser } from './components/menu/authentication/actionReducers'
import utilsQuery from './components/map/utils/query'
import { didYouKnows, properties, themes } from './properties'

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
}

const PLEDGEREMINDERDURATION = 1800000
const prefixedStyles = {}
const isStatic = utilsQuery.getURLParameter('isStatic') === 'true'

class App extends Component {
  _launchFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }
  _exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
  _setFullscreen = () => {
    const goFullscreen = typeof (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) === 'undefined'
    if (goFullscreen) {
      this._launchFullscreen(document.documentElement)
    } else {
      this._exitFullscreen()
    }
    localStorage.setItem('chs_fullscreen', goFullscreen)
    this.setState({ isFullScreen: goFullscreen })
  }
  _setBodyFont = (newFont) => {
    if (properties.fontOptions.map(el => el.id).includes(newFont)) {
      const currBodyClasses = Array.from(document.body.classList)
      properties.fontOptions.forEach((el) => {
        if (currBodyClasses.includes(el.id)) {
          document.body.classList.remove(el.id)
        }
      })
      document.body.classList.add(newFont)
      localStorage.setItem('chs_font', newFont)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      drawerOpen: false,
      failAndNotify: false,
      pledgeOpen: false,
      isFullScreen: localStorage.getItem('chs_fullscreen') === 'true' || false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.theme !== nextProps.theme) {
      this.forceUpdate()
    }
  }

  componentWillMount () {
    const { setArea, setYear, setMarker, setMetadata, setLoadStatus, setEpic, setAreaColorLabel, selectAreaItem, selectMarkerItem } = this.props

    document.body.classList.add(localStorage.getItem('chs_font') || properties.fontOptions[0].id)

    const selectedYear = (utilsQuery.getURLParameter('year') || Math.floor(Math.random() * 2000))
    const selectedMarker = (utilsQuery.getURLParameter('markers') || 'a,ar,at,b,c,ca,cp,e,m,op,p,r,s,si')
    const selectedEpics = (utilsQuery.getURLParameter('epics') || 'ei,es,ew')
    const activeArea = {
      data: {},
      color: (utilsQuery.getURLParameter('fill') || 'ruler'),
      label: (utilsQuery.getURLParameter('label') || 'ruler')
    }
    const selectedItem = {
      wiki: '',
      type: (utilsQuery.getURLParameter('type') || ''),
      value: (utilsQuery.getURLParameter('value') || ''),
    }

    const selectedToken = utilsQuery.getURLParameter('token')
    if (selectedToken) localStorage.setItem('chs_temptoken', selectedToken)
    else localStorage.removeItem('chs_temptoken')

    // initialize queryparameters
    window.history.pushState('', '',
      '?year=' + selectedYear +
      '&epics=' + selectedEpics +
      '&markers=' + selectedMarker +
      '&type=' + selectedItem.type +
      '&fill=' + activeArea.color +
      '&label=' + activeArea.label +
      // (selectedToken ? ('&token=' + selectedToken) : '') +
      '&value=' + selectedItem.value +
      '&position=' + (utilsQuery.getURLParameter('position') || '37,37,2.5') +
      window.location.hash)

    axios.all([
      axios.get(properties.chronasApiHost + '/metadata?type=g&f=provinces,ruler,culture,religion,capital,province,religionGeneral'),
      axios.get(properties.chronasApiHost + '/areas/' + selectedYear)
    ])
      .then(axios.spread((metadata, areaDefsRequest) => {
        if (this.state.failAndNotify) return
        setMetadata(metadata.data)

        const didYouKnowInterval = setInterval(() => {
          let selectedItem
          if (!localStorage.getItem('chs_dyk_timeline')) {
            selectedItem = didYouKnows[0][1]
            localStorage.setItem('chs_dyk_timeline', true)
          } else if (!localStorage.getItem('chs_dyk_discover')) {
            selectedItem = didYouKnows[1][1]
            localStorage.setItem('chs_dyk_discover', true)
          } else if (!localStorage.getItem('chs_dyk_coloring')) {
            selectedItem = didYouKnows[2][1]
            localStorage.setItem('chs_dyk_coloring', true)
          } else if (!localStorage.getItem('chs_dyk_markerlimit')) {
            selectedItem = didYouKnows[3][1]
            localStorage.setItem('chs_dyk_markerlimit', true)
          } else if (!localStorage.getItem('chs_dyk_province')) {
            selectedItem = didYouKnows[4][1]
            localStorage.setItem('chs_dyk_province', true)
          } else if (!localStorage.getItem('chs_dyk_question')) {
            selectedItem = didYouKnows[5][1]
            localStorage.setItem('chs_dyk_question', true)
          } else if (!localStorage.getItem('chs_dyk_distribution')) {
            selectedItem = didYouKnows[6][1]
            localStorage.setItem('chs_dyk_distribution', true)
          } else if (!localStorage.getItem('chs_dyk_link')) {
            selectedItem = didYouKnows[7][1]
            localStorage.setItem('chs_dyk_link', true)
          }
          if (selectedItem) return showNotification(selectedItem)
          else return clearInterval(didYouKnowInterval)
        }, 30000)

        setYear(selectedYear)
        if (selectedMarker !== '') setMarker(selectedMarker.split(','))
        if (selectedEpics !== '') setEpic(selectedEpics.split(','))
        // if (activeArea.color !== 'ruler' || activeArea.label !== 'ruler') setAreaColorLabel(activeArea.color, activeArea.label)
        if (selectedItem.type === TYPE_AREA) {
          selectAreaItem('-1', selectedItem.value)
        } else if (selectedItem.type === TYPE_MARKER) {
          selectMarkerItem(selectedItem.value, selectedItem.value)
        }
        setArea(areaDefsRequest.data, activeArea.color, activeArea.label)

        setLoadStatus(false)
        this.forceUpdate()
      }))
      .catch(() => {
        this.setState({ failAndNotify: true })
        this.forceUpdate()
      })
  }

  componentDidMount () {
    const { setUser, showNotification } = this.props
    const { failAndNotify } = this.state

    // enable for time based error out
    //
    // setTimeout(() => {
    //   if (this.props.isLoading) {
    //     this.setState({ failAndNotify: true })
    //     this.forceUpdate()
    //   }
    // }, 25000)

    setTimeout(() => {
      if (failAndNotify) return
      const selectedIndex = Math.floor(Math.random() * didYouKnows.length)
      localStorage.setItem('chs_dyk_' + didYouKnows[selectedIndex][0], true)
      showNotification(didYouKnows[selectedIndex][1])
    }, 500)

    if (!localStorage.getItem('chs_pledge_closed')) {
      setTimeout(() => {
        this.setState({ pledgeOpen: true })
        // this.forceUpdate();
      }, PLEDGEREMINDERDURATION)
    }

    setTimeout(() => {
      if (failAndNotify) return
      const selectedIndex = Math.floor(Math.random() * didYouKnows.length)
      localStorage.setItem('chs_dyk_' + didYouKnows[selectedIndex][0], true)
      showNotification(didYouKnows[selectedIndex][1])
    }, 500)

    // const parsedQuery = queryString.parse(location.search)
    let token = (localStorage.getItem('chs_temptoken') !== null) ? localStorage.getItem('chs_temptoken') : undefined

    if (typeof token !== 'undefined') {
      // delete parsedQuery.token
      // let target = parsedQuery.target
      // delete parsedQuery.target

      const decodedToken = decodeJwt(token)
      localStorage.setItem('chs_userid', decodedToken.id)
      localStorage.setItem('chs_username', decodedToken.username)
      if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
      localStorage.setItem('chs_token', token)
      // window.history.pushState(null, null, (target ? (target + '/') : '') + queryString.stringify(parsedQuery) || '/')
    } else {
      token = localStorage.getItem('chs_token')
    }

    if (token) {
      const decodedToken = decodeJwt(token)
      localStorage.setItem('chs_userid', decodedToken.id)
      localStorage.setItem('chs_username', decodedToken.username)
      if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
      localStorage.setItem('chs_token', token)
      setUser(token, (decodedToken.name || {}).first || (decodedToken.name || {}).last || decodedToken.email, decodedToken.privilege, decodedToken.avatar)
    } else if (!window.location.hash || window.location.hash === '#/') {
      // show welcome page if user is not logged in and no specific article or other page is specified
      history.push('/info')
    }
  }

  shouldComponentUpdate () {
    return false
  }

  // componentDidCatch(error, info) {
  //   alert('we got an error app')
  //   console.debug(error, info)
  //   // showNotification(selectedItem)
  // }

  render () {
    const {
      width,
      showNotification,
      isLoading,
      store,
      theme
    } = this.props

    const {
      drawerOpen,
      pledgeOpen,
      failAndNotify,
      isFullScreen,
      selectedFontClass
    } = this.state

    // console.debug(customTheme, defaultTheme)
    customTheme.fontFamily = 'inherit'

    customTheme.palette.accent1Color = themes[theme].highlightColors[0]
    customTheme.palette.primary1Color = themes[theme].foreColors[0]
    customTheme.palette.primary2Color = themes[theme].backColors[0]
    customTheme.palette.textColor = themes[theme].foreColors[0]
    customTheme.palette.alternateTextColor = themes[theme].backColors[0]
    customTheme.palette.canvasColor = themes[theme].backColors[1]
    customTheme.palette.accent1Color = themes[theme].highlightColors[0]

    customTheme.tabs = {
      backgroundColor: 'transparent',
      selectedTextColor: themes[theme].foreColors[1],
      textColor: themes[theme].foreColors[0]
    }

    delete customTheme.drawer

    const muiTheme = getMuiTheme(customTheme) // customTheme

    muiTheme.baseTheme.palette.primary1Color = themes[theme].backColors[0]
    muiTheme.baseTheme.palette.accent1Color = themes[theme].highlightColors[0]
    muiTheme.menuItem.selectedTextColor = themes[theme].highlightColors[0]
    muiTheme.tabs.selectedTextColor = themes[theme].highlightColors[0]

    // console.debug(JSON.stringify(muiTheme))
    if (!prefixedStyles.main) {
      // do this once because user agent never changes
      const prefix = autoprefixer(muiTheme)
      prefixedStyles.wrapper = prefix(styles.wrapper)
      prefixedStyles.main = prefix(styles.main)
      prefixedStyles.body = prefix(styles.body)
      prefixedStyles.bodySmall = prefix(styles.bodySmall)
      prefixedStyles.content = prefix(styles.content)
      prefixedStyles.contentSmall = prefix(styles.contentSmall)
    }

    prefixedStyles.content.transition = 'margin-left 350ms cubic-bezier(0.23, 1, 0.32, 1)'
    prefixedStyles.content.overflow = 'hidden'

    if (drawerOpen) {
      prefixedStyles.content.marginLeft = 156
    } else {
      prefixedStyles.content.marginLeft = 0
    }

    return (
      <Provider store={store}>
        <TranslationProvider messages={messages}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <div style={prefixedStyles.wrapper}>
                <div style={prefixedStyles.main}>
                  {!isStatic && <LoadingBar failAndNotify={failAndNotify} theme={theme} />}
                  <div className='body' style={width === 1 ? prefixedStyles.bodySmall : prefixedStyles.body}>
                    {(isLoading || failAndNotify) && !isStatic && <LoadingPage failAndNotify={failAndNotify} />}
                    {!isLoading && !failAndNotify && createElement(Map, { history, isLoading })}
                    {!isLoading && !failAndNotify && !isStatic &&
                    <div style={width === 1 ? prefixedStyles.contentSmall : prefixedStyles.content}>
                      <PledgeDialog theme={theme} open={pledgeOpen} snooze={() => {
                        setTimeout(() => {
                          this.setState({ pledgeOpen: true })
                          this.forceUpdate()
                        }, PLEDGEREMINDERDURATION)
                        this.setState({ pledgeOpen: false })
                        this.forceUpdate()
                      }} closePledge={() => {
                        localStorage.setItem('chs_pledge_closed', 'true')
                        this.setState({ pledgeOpen: false })
                        this.forceUpdate()
                      }} />
                      <Switch>
                        <Route exact path='/' />
                        <Route exact path='/configuration' render={(props) => {
                          return (
                            <Configuration
                              setFullscreen={this._setFullscreen}
                              setBodyFont={this._setBodyFont}
                              {...props}
                            />
                          )
                        }} />
                        <Route exact path='/tos' render={() => {
                          return (
                            <TOS
                              history={history}
                              theme={theme}
                              activeSection={'tos'}
                            />
                          )
                        }} />
                        <Route exact path='/privacy' render={() => {
                          return (
                            <TOS
                              history={history}
                              theme={theme}
                              activeSection={'privacy'}
                            />
                          )
                        }} />
                        <Route exact path='/discover' component={Discover} />
                        <Route exact path='/login' component={Login} />
                        <Route exact path='/share' component={Share} />
                        <Route exact path='/info' render={(props) => {
                          return (
                            <Information theme={theme} history={history} showNotification={showNotification} />
                          )
                        }} />
                      </Switch>
                      <Switch>
                        <Board theme={theme} history={history} />
                      </Switch>
                      <Switch>
                        <Account theme={theme} history={history} />
                      </Switch>
                      <Switch>
                        <RightDrawerRoutes history={history} />
                      </Switch>
                    </div>}
                    {!isLoading && !failAndNotify && !isStatic && <MenuDrawer muiTheme={customTheme}>
                      {createElement(LayerContent)}
                    </MenuDrawer>}
                    {!isLoading && !failAndNotify && !isStatic && <Sidebar open muiTheme={customTheme}>
                      {createElement(Menu)}
                    </Sidebar>}
                  </div>
                  {!isStatic && <div className='notifications'>
                    <Notification />
                  </div>}
                </div>
              </div>
            </MuiThemeProvider>
          </ConnectedRouter>
        </TranslationProvider>
      </Provider>
    )
  }
}

const mapStateToProps = (state, props) => ({
  isLoading: state.isLoading,
  theme: state.theme
})

const mapDispatchToProps = {
  showNotification,
  setArea,
  setUser,
  setLoadStatus,
  setMetadata,
  setMarker,
  setEpic,
  setAreaColorLabel,
  selectAreaItem,
  selectMarkerItem,
  setYear
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
