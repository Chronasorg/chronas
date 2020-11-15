import React, { Component, createElement } from 'react'
import { connect, Provider } from 'react-redux'
import axios from 'axios'
import {defaultTheme, Delete, Restricted, showNotification, TranslationProvider} from 'admin-on-rest'
import decodeJwt from 'jwt-decode'
import 'font-awesome/css/font-awesome.css'
import { Route, Switch } from 'react-router-dom'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import autoprefixer from 'material-ui/utils/autoprefixer'
import { setLoadStatus, setMetadata } from './components/map/data/actionReducers'
import { selectAreaItem, selectCollectionItem, selectMarkerItem, TYPE_AREA, TYPE_COLLECTION, TYPE_MARKER } from './components/map/actionReducers'
import { setArea, setAreaColorLabel, setEpic, setMarker } from './components/menu/layers/actionReducers'
import { setYear } from './components/map/timeline/actionReducers'
import Notification from './components/overwrites/Notification'
import Menu from './components/menu/Menu'
import Map from './components/map/Map'
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
import Voice from './components/menu/voice/Voice'
import Play from './components/menu/play/Play'
import Performance from './components/menu/performanceSelector/PerformanceSelector'
import TOS from './components/menu/tos/TOS'
import Information from './components/menu/information/Information'
import RightDrawerRoutes from './components/content/RightDrawerRoutes'
import Discover from './components/menu/discover/Discover'
import Login from './components/menu/authentication/Login'
import customTheme from './styles/CustomAdminTheme'
import { setUser } from './components/menu/authentication/actionReducers'
import utilsQuery from './components/map/utils/query'
import { ConnectedRouter } from 'connected-react-router'
import { didYouKnows, markerIdNameArray, properties, themes } from './properties'

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

const PLEDGEREMINDERDURATION = 900000 // 1800000
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
    const { setArea, setYear, setMarker, setMetadata, setLoadStatus, setEpic, selectCollectionItem, setAreaColorLabel, selectAreaItem, selectMarkerItem } = this.props

    document.body.classList.add(localStorage.getItem('chs_font') || properties.fontOptions[0].id)

    const selectedPerformance = typeof localStorage.getItem('chs_performance_set') === 'undefined' ? false : +localStorage.getItem('chs_performance_set')

    const selectedYear = (utilsQuery.getURLParameter('year') || Math.floor(Math.random() * 2000))
    const selectedMarker = (utilsQuery.getURLParameter('markers') || (selectedPerformance === false ? 'a,ar,at,b,c,ca,cp,e,l,m,op,p,r,s,si,o' : (+selectedPerformance === 0 ? '' : markerIdNameArray.map(el => el[0]).join(','))))
    const markerLimit = (utilsQuery.getURLParameter('limit') || (selectedPerformance === false ? '2000' : (+selectedPerformance === 2 ? 5500 : 2000)))
    const selectedEpics = (utilsQuery.getURLParameter('epics') || (selectedPerformance === false || selectedPerformance !== 2 ? '' : ('ei,es,ew')))
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

    const fullHost = (((window.location || {}).host || '') || "").split('.') || []
    const potentialLocale = utilsQuery.getURLParameter('locale') || fullHost[0]
    const newLocale = properties.languageOptions.map(el => el.id).includes(potentialLocale) ? potentialLocale : (localStorage.getItem('chs_locale') || 'en')
    // initialize queryparameters
    window.history.pushState('', '',
      '?year=' + selectedYear +
      '&epics=' + selectedEpics +
      '&markers=' + selectedMarker +
      '&limit=' + markerLimit +
      '&type=' + selectedItem.type +
      '&fill=' + activeArea.color +
      '&label=' + activeArea.label +
      // (selectedToken ? ('&token=' + selectedToken) : '') +
      '&value=' + selectedItem.value +
      '&locale=' + newLocale +
      '&position=' + (utilsQuery.getURLParameter('position') || '37,37,2.5') +
      window.location.hash)

    const requestList = [
      axios.get(properties.chronasApiHost + '/metadata?type=g&f=provinces,ruler,culture,religion,capital,province,religionGeneral'),
      axios.get(properties.chronasApiHost + '/areas/' + selectedYear)
    ]

    if (newLocale && newLocale !== "en") {
      requestList.push(axios.get(properties.chronasApiHost + '/metadata?type=g&locale=' + newLocale + '&f=' + ('ruler,culture,religion,capital,province,religionGeneral'.split(',').join('_' + newLocale + ',')) + ('_' + newLocale)))
    }
    axios.all(requestList)
      .then(axios.spread((metadata, areaDefsRequest, metadataLocale) => {
        if (this.state.failAndNotify) return
        setMetadata({ ...metadata.data, locale: (metadataLocale || {}).data })
        const didYouKnowInterval = setInterval(() => {
          let selectedItem
          if (!localStorage.getItem('chs_dyk_timeline')) {
            selectedItem = didYouKnows[0]
            localStorage.setItem('chs_dyk_timeline', true)
          } else if (!localStorage.getItem('chs_dyk_discover')) {
            selectedItem = didYouKnows[1]
            localStorage.setItem('chs_dyk_discover', true)
          } else if (!localStorage.getItem('chs_dyk_coloring')) {
            selectedItem = didYouKnows[2]
            localStorage.setItem('chs_dyk_coloring', true)
          } else if (!localStorage.getItem('chs_dyk_markerlimit')) {
            selectedItem = didYouKnows[3]
            localStorage.setItem('chs_dyk_markerlimit', true)
          } else if (!localStorage.getItem('chs_dyk_province')) {
            selectedItem = didYouKnows[4]
            localStorage.setItem('chs_dyk_province', true)
          } else if (!localStorage.getItem('chs_dyk_question')) {
            selectedItem = didYouKnows[5]
            localStorage.setItem('chs_dyk_question', true)
          } else if (!localStorage.getItem('chs_dyk_distribution')) {
            selectedItem = didYouKnows[6]
            localStorage.setItem('chs_dyk_distribution', true)
          } else if (!localStorage.getItem('chs_dyk_link')) {
            selectedItem = didYouKnows[7]
            localStorage.setItem('chs_dyk_link', true)
          } else if (!localStorage.getItem('chs_dyk_escape')) {
            selectedItem = didYouKnows[8]
            localStorage.setItem('chs_dyk_escape', true)
          }
          if (selectedItem) return showNotification("didYouKnow." + selectedItem)
          else return clearInterval(didYouKnowInterval)
        }, 30000)

        setYear(selectedYear)
        // if (/*!selectedToken && (!window.location.hash || window.location.hash === '#/')*/) {
          if (selectedMarker !== '') setMarker(selectedMarker.split(','))
          if (selectedEpics !== '') setEpic(selectedEpics.split(','))
        // }
        // if (activeArea.color !== 'ruler' || activeArea.label !== 'ruler') setAreaColorLabel(activeArea.color, activeArea.label)
        if (selectedItem.type === TYPE_AREA) {
          selectAreaItem('-1', selectedItem.value)
        } else if (selectedItem.type === TYPE_MARKER) {
          selectMarkerItem(selectedItem.value, selectedItem.value)
        } else if (selectedItem.type === TYPE_COLLECTION) {
          selectCollectionItem(selectedItem.value, false)
          if (window.location.pathname.indexOf('article') === -1) {
            if (((window.location || {}).host || '').substr(0, 4) === "edu.") {
              history.push('/login')
            } else {
              history.push('/article')
            }
          }
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

    setTimeout(() => {
      if (failAndNotify) return
      const selectedIndex = Math.floor(Math.random() * didYouKnows.length)
      localStorage.setItem('chs_dyk_' + didYouKnows[selectedIndex], true)
      showNotification("didYouKnow." + didYouKnows[selectedIndex])
    }, 500)

    if (!localStorage.getItem('chs_pledge_closed')) {
      setTimeout(() => {
        this.setState({ pledgeOpen: true })
        this.forceUpdate()
      }, PLEDGEREMINDERDURATION)
    }

    setTimeout(() => {
      if (failAndNotify) return
      const selectedIndex = Math.floor(Math.random() * didYouKnows.length)
      localStorage.setItem('chs_dyk_' + didYouKnows[selectedIndex], true)
      showNotification("didYouKnow." + didYouKnows[selectedIndex])
    }, 500)

    // const parsedQuery = queryString.parse(location.search)
    let token = (localStorage.getItem('chs_temptoken') !== null) ? localStorage.getItem('chs_temptoken') : undefined

    if (typeof token !== 'undefined') {
      const decodedToken = decodeJwt(token)
      localStorage.setItem('chs_userid', decodedToken.id)
      localStorage.setItem('chs_username', decodedToken.username)
      if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
      if (decodedToken.score) localStorage.setItem('chs_score', decodedToken.score)
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
      if (decodedToken.score) localStorage.setItem('chs_score', decodedToken.score)
      localStorage.setItem('chs_token', token)
      const userScore = decodedToken.score || localStorage.getItem('chs_score') || 1
      setUser(token, (decodedToken.name || {}).first || (decodedToken.name || {}).last || decodedToken.email, decodedToken.privilege, decodedToken.avatar, userScore)
    }

    if (!localStorage.getItem('chs_performance') || localStorage.getItem('chs_performance_set') === null && (!window.location.hash || window.location.hash === '#/')) {
      // show welcome page if user is not logged in and no specific article or other page is specified

      utilsQuery.updateQueryStringParameter('markers', '')
      utilsQuery.updateQueryStringParameter('epics', '')
      utilsQuery.updateQueryStringParameter('limit', 2000)

      history.push('/performance')
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

    if (!prefixedStyles.content.transition) {
      prefixedStyles.content.transition = 'margin-left 350ms cubic-bezier(0.23, 1, 0.32, 1)'
      prefixedStyles.content.overflow = 'hidden'
      prefixedStyles.content.marginLeft = 0
    }

    return (
      <Provider store={store}>
        <TranslationProvider messages={messages}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <div style={prefixedStyles.wrapper}>
                <div style={prefixedStyles.main}>
                  {!isStatic && <LoadingBar history={history} failAndNotify={failAndNotify} theme={theme} />}
                  <div className='body' style={width === 1 ? prefixedStyles.bodySmall : prefixedStyles.body}>
                    {(isLoading || failAndNotify) && !isStatic && <LoadingPage failAndNotify={failAndNotify} />}
                    {!isLoading && !failAndNotify && createElement(Map, { history, isLoading })}
                    {!isLoading && !failAndNotify && !isStatic &&
                    <div style={width === 1 ? prefixedStyles.contentSmall : prefixedStyles.content}>
                      <PledgeDialog theme={theme} open={false} snooze={() => {
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
                        <Route exact path='/play' render={(props) => {
                          return (
                            <Play
                              setFullscreen={this._setFullscreen}
                              setBodyFont={this._setBodyFont}
                              {...props}
                            />
                          )
                        }} />
                        <Route exact path='/performance' render={(props) => {
                          return (
                            <Performance
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
                        <Route path='/info/:id?' render={(props) => {
                          return (
                            <Information activeTab={props.match.params.id} theme={theme} history={history} showNotification={showNotification} />
                          )
                        }} />
                        <Route exact path='/voice' render={(props) => {
                          return (
                            <Voice
                              theme={theme} history={history}
                              {...props}
                            />
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
                    {!isLoading && !failAndNotify && !isStatic && <MenuDrawer muiTheme={customTheme} history={history} />}
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
  selectCollectionItem,
  selectMarkerItem,
  setYear
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
