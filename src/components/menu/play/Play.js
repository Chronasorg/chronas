import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Avatar from 'material-ui/Avatar'
import AutoComplete from 'material-ui/AutoComplete'
import HelpIcon from 'material-ui/svg-icons/action/help'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card'
import IconOpenInNew from 'material-ui/svg-icons/action/open-in-new'
import {GridList, GridTile} from 'material-ui/GridList'
import Dialog from 'material-ui/Dialog'
import { List, ListItem } from 'material-ui/List'
import TextField from 'material-ui/TextField'
import Subheader from 'material-ui/Subheader'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import StarIcon from 'material-ui/svg-icons/action/stars'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Restricted, translate } from 'admin-on-rest'
import { GoldCoins } from '../customAssets'
import {iconMapping, properties, themes} from '../../../properties'

import { changeLocale as changeLocaleAction, changeMarkerTheme, changeTheme as changeThemeAction } from './actionReducers'
import utilsQuery from "../../map/utils/query"
import axios from "axios/index"
import {history} from "../../../store/createStore";

import Moment from 'moment';
import classnames from 'classnames';
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
// import appLayout from '../../SharedStyles/appLayout.css';
import styless from '../board/ReForum/Views/Highscore/styles.css';

const LOG_WRONG_GUESS = 'LOG_WRONG_GUESS'
const LIFELINE_BANNER = 'LIFELINE_BANNER'
const LIFELINE_MEDIA = 'LIFELINE_MEDIA'
const LIFELINE_CONTENT = 'LIFELINE_CONTENT'
const LIFELINE_SKIP = 'LIFELINE_SKIP'

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  gridList: {
    width: 500,
    height: 450,
    overflowY: 'auto',
  },
  button: { margin: '1em' },
  minusGold: { color: '#bb0000', width: '14px', display: 'inline-block' },
  plusGold: { color: '#027600', width: '20px', display: 'inline-block', fontWeight: 800 },
  log: {
    position: 'absolute',
    marginTop: '18px',
    background: 'white',
    textTransform: 'uppercase',
    padding: '12px',
    paddingTop: '24px',
    zIndex: -1,
    width: '256px',
    marginLeft: 'calc(50% - 100px)',
    textAlign: 'center',
    transition: '.5s all'
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  statue: {
    position: 'absolute',
    width: '100px',
  },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent',
    overflow: 'auto',
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  },
  goldIcon: {
    marginLeft: '4px',
    marginRight: '4px',
    marginTop: '-4px',
    height: '32px',
    width: 'auto'
  },
  dd: {
    fontWeight: 800
  }
}

class Play extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      customName: '',
      identified: 0,
      difficulty: 'easy',
      gameType: 'tutorial',
      log: '',
      logStatus: 'info',
      highscoreData: false,
      highscoreAmount: 0,
      hiddenElement: true,
      timeStart: 0,
      loading: false,
      toFind: {},
      isFetchingHighscore: true,
      prevCountries: [],
      mediaBlacklist: [],
      lifelineContentPerson: true,
      lifelineContentBattle: true,
      lifelineMediaOpen: true,
      isF: false,
      isRanking: true,
      isHighscore: false,
      lifelines: {
        avatar: false,
        media: false,
        person: false,
        battle: false,
      },
      currentGold: 50
    }
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }
  handleClose = () => {
    this.props.history.push('/')
  }

  generateNewCountryToFind = () => {
    const yearToFindEntity = Math.floor(Math.random() * 2000)
    axios.get(properties.chronasApiHost + '/areas/' + yearToFindEntity)
      .then((areaDefsRequest) => {
        const nextData = Object.values(areaDefsRequest.data)
        const rankedCountries = (Object.entries(nextData.reduce((res, val) => {
          if (res[val[0]]) {
            res[val[0]] = res[val[0]] + val[4]
          } else {
            res[val[0]] = val[4]
          }
          return res
        }, {}))
          .sort((a, b) => b[1] - a[1])
          .map(v => v[0]) || [])
          .filter(el => el && el !== "undefined" && el !== "null" && this.state.prevCountries.indexOf(el) === -1)
          .slice(0, 20) || []

        this.tryToFindSuitableCountry(rankedCountries)
      })
  }

  tryToFindSuitableCountry = (rankedCountries) => {
    if ((rankedCountries || []).length === 0) {
      this.generateNewCountryToFind()
    }

    const potentialCountry = rankedCountries[Math.floor(Math.random() * (rankedCountries.length))]
    rankedCountries.splice(rankedCountries.indexOf(potentialCountry), 1)
    axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:ae|ruler|' + potentialCountry)
      .then((res) => {
        if (res.status === 200) {
          const linked = res.data
          if (linked.map.length && linked.media.length) {
            axios.get(properties.chronasApiHost + '/metadata/a_ruler_' + potentialCountry)
              .then(influenceData => {
                const { metadata } = this.props
                const influence = (((influenceData || {}).data || {}).data || {}).influence
                const peakObj = (influence.sort((a, b) => Object.values(b)[0][2] - Object.values(a)[0][2]) || [])[0] || {}
                this.setState({
                  isFetchingHighscore: true,
                  loading: false,
                  toFind: {
                    id: potentialCountry,
                    rulerObj: metadata['ruler'][potentialCountry],
                    influence: {
                      peak: [Object.keys(peakObj)[0], Object.values(peakObj)[0][2]],
                      range: [Object.keys(influence[1])[0], Object.keys(influence[influence.length-1])[0]]
                    },
                    linked: {
                      map: linked.map,
                      media: linked.media.filter(el => el.properties.t !== 'v').sort((a,b) => (a.properties.t === 'cities' && b.properties.t !== 'cities') ? -1 : ((a.properties.t !== 'cities' && b.properties.t === 'cities') ? 1 : 0)),
                    },
                  },
                  gameType: "active",
                  log: '',
                  logStatus: 'info',
                  mediaBlacklist: [],
                  lifelines: {
                    avatar: false,
                    media: false,
                    content: false,
                    person: false,
                    battle: false,
                  },
                })
              })
              .catch(() => {
                this.tryToFindSuitableCountry(rankedCountries)
              })
          } else {
            this.tryToFindSuitableCountry(rankedCountries)
          }
        }
      })
      .catch(() => {
        this.tryToFindSuitableCountry(rankedCountries)
      })
  }

  addAnotherMediaAndBlacklist (idToBlackList) {
    const { mediaBlacklist } = this.state
    const { lifelines, toFind, identified } = this.state

    if (toFind.linked.media.length <= ((lifelines.media || []).length + 1)) return
    this.setState({
      lifelines: {
        ...lifelines,
        media: toFind.linked.media.slice(0, ((lifelines.media || []).length + 1))
      },
      mediaBlacklist: [...mediaBlacklist, idToBlackList]
    })
  }

  _getFullIconURL (iconPath) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + iconPath + '/100px-' + iconPath.substr(iconPath.lastIndexOf('/') + 1) + ((iconPath.toLowerCase().indexOf('svg') > -1) ? '.PNG' : '')
  }

  componentDidUpdate (prevProps, prevState) {
    const { customName, currentGold, gameType, identified, timeStart, popupOpen, isF, highscoreData } = this.state

    if ((prevState.gameType === 'active' && gameType === 'review' && !prevState.popupOpen && !isF) ||
      (prevState.gameType === 'active' && gameType === 'active' && prevState.currentGold >= 0 && currentGold < 0)) {
      this.setState({
        gameType: 'review',
        popupOpen: true,
        isRanking: true,
        isF: true,
      })

      axios.post(properties.chronasApiHost + '/game', {
        avatar: localStorage.getItem('chs_avatar'),
        name: customName || localStorage.getItem('chs_username'),
        gold: currentGold,
        identified: identified,
        duration: ((new Date().getTime() - timeStart) / 60000).toFixed(2)
      })
        .then((savedEntry) => {
          axios.get(properties.chronasApiHost + '/game/highscore?top=10')
            .then(response => {
              const rawDefault = response.data
              const isHighscore = rawDefault.some(el => el._id === savedEntry.data._id)
              this.setState({
                isRanking: false,
                isFetchingHighscore: false,
                isF: false,
                isHighscore,
                highscoreData: rawDefault,
                highscoreAmount: parseInt(response.headers['x-total-count'])
              })
            })
        })
        .catch((err) => {
          console.error(err)
          this.props.showNotification('somethingWentWrong')
        })
    }
    if (prevState.gameType !== 'highscore' && gameType === 'highscore' && !highscoreData) {
      axios.get(properties.chronasApiHost + '/game/highscore?top=10')
        .then(response => {
          const rawDefault = response.data
          this.setState({
            isFetchingHighscore: false,
            highscoreData: rawDefault,
            highscoreAmount: parseInt(response.headers['x-total-count'])
          })
        })
    }
  }

  render () {
    const { theme, metadata, translate } = this.props
    const { currentGold, customName, lifelineMediaOpen, highscoreData, highscoreAmount, lifelineContentPerson, lifelineContentBattle, loading, log, logStatus, identified, timeStart, isFetchingHighscore, toFind, lifelines, gameType, isRanking, isHighscore } = this.state

    const customLogObj = {
      'LOG_WRONG_GUESS': <div><span style={styles.minusGold}>{-(2 + (identified * 2))} </span> <GoldCoins style={styles.goldIcon} /> Wrong Guess</div>,
      'LIFELINE_BANNER': <div><span style={styles.minusGold}>{-(6 + (identified * 6))} </span> <GoldCoins style={styles.goldIcon} /> Reveal Banner</div>,
      'LIFELINE_CONTENT': <div><span style={styles.minusGold}>{-(2 + (identified * 2))} </span> <GoldCoins style={styles.goldIcon} /> Reveal Content</div>,
      'LIFELINE_MEDIA': <div><span style={styles.minusGold}>{-(4 + (identified * 4))} </span> <GoldCoins style={styles.goldIcon} /> Reveal Media</div>,
      'LIFELINE_SKIP': <div><span style={styles.minusGold}>{-40} </span> <GoldCoins style={styles.goldIcon} /> Skip Country</div>

    }

    const logColor = logStatus === 'info' ? themes[theme].foreColors[0] : logStatus === 'success' ? '#027600' : '#bb0000'
    const customLog = customLogObj[log] || log
    return (
      <Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0], overflow: 'auto', paddingLeft: 32, paddingRight: 32 }} open style={{top: '50px'}}
        contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }} onRequestClose={() => {}}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                  text={<h4><b>play</b>Chronas</h4>} />
              </ToolbarGroup>
              <ToolbarGroup>
                { gameType === 'highscore' ? <RaisedButton label="Play" primary={false}  onClick={() => {
                  this.setState({ gameType: 'tutorial' })
                }} /> : gameType === 'active' ? <RaisedButton label="Surrender" primary={false}  onClick={() => {
                  this.setState({ gameType: 'review', isRanking: true, popupOpen: true })
                }} /> : <RaisedButton label="Highscore" primary={false}  onClick={() => {
                  this.setState({ gameType: 'highscore' })
                }} />}
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={translate("aor.action.close")} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          { gameType === "highscore" && isFetchingHighscore && <div className={classnames('appLayout_constraintWidth', 'UP_loadingMsg')}>
            <br/>
            <br/>
            <br/>
            Loading highest ranked players ...
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
          </div>}
          { gameType === "tutorial" && <div>
          <CardText>
            <Card initiallyExpanded={true}>
              <CardHeader
                title="Game Rules"
                subtitle={<b style={{ color: themes[theme].highlightColors[0]}}>Identify as many historic countries before your Gold runs out...</b>}
                actAsExpander={true}
                showExpandableButton={true}
              />
              <CardText expandable={true}>
                <dl style={{ marginTop: -18 }}>
                  You can use the following <b>Lifelines</b> to help you (but it will cost you gold):
                  <dd style={styles.dd}><span style={styles.minusGold}>-6</span> <GoldCoins style={styles.goldIcon} />  Reveal banner</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-4</span> <GoldCoins style={styles.goldIcon} />  Reveal media entity of country</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-2</span> <GoldCoins style={styles.goldIcon} />  Reveal person of country</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-2</span> <GoldCoins style={styles.goldIcon} />  Reveal battle of country</dd>
                  {/*<dd style={styles.dd}><span style={styles.minusGold}>-12</span> <GoldCoins style={styles.goldIcon} />  Reveal borders at peak extension</dd>*/}
                </dl>
                <Divider />
                <dl style={{ marginTop: 8 }}>
                  <dd style={styles.dd}><span style={styles.minusGold}>-2</span> <GoldCoins style={styles.goldIcon} /> for every wrong guess</dd>
                    <StarIcon /> Every country you identify earns you <span style={styles.plusGold}>+20</span> <GoldCoins style={styles.goldIcon} />
              </dl>
              <p><i>For every identified country, lifeline and guess costs <b>increase</b></i></p>
              <p>You will start with <GoldCoins style={styles.goldIcon} /> <b style={{fontSize: 20}}>50</b></p>
              </CardText>
            </Card>
          </CardText>
          <CardActions>
            <RaisedButton
              onClick={() => {
                if (customName || localStorage.getItem('chs_username')) {
                  this.setState({
                    loading: true,
                    timeStart: new Date().getTime(),
                    identified: 0,
                    prevCountries: [],
                    currentGold: 50
                  })
                  this.generateNewCountryToFind()
                } else {
                  this.setState({ popupOpen: true })
                }
                }
              }
              disabled={loading}
              primary
              label={loading ? translate('pos.loading') : translate('pos.play.start')}
              fullWidth
            />
          </CardActions>
          </div>}
          { gameType === "highscore" && !isFetchingHighscore && <div className={classnames('appLayout_constraintWidth', 'UP_container')}>
            <div className={'appLayout_primaryContent'}>
              <div className='FeedBox_container'>
                <div className='FeedBox_header' style={{ marginBottom: '12px', background: themes[theme].highlightColors[0]}}>
                  <span className='FeedBox_title'>Highscore</span><span className='FeedBox_subtitle'> of <b>{highscoreAmount}</b> games played</span>
                </div>
                <div className='FeedBox_discussions'>
                  <div className='Opinion_game_container'>
                    <div className='Opinion_infoContainer'>
                      <div className='Opinion_avatar' style={{
                        textAlign: 'center',
                        width: 10,
                        height: 'inherit',
                        marginLeft: -52,
                        flex: 1,
                        display: 'block', }} >Rank</div>
                      <div className='Opinion_userInfo' style={{ marginLeft: '-22px' }}>
                        { 'Username' }
                      </div>
                      <div className='Opinion_userInfo'>
                        <b>{ `Identified` }</b>
                      </div>
                      <div className='Opinion_userInfo'>
                        { `Duration` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `Date` }
                      </div>
                    </div>
                  </div>

                  { highscoreData && highscoreData.map((user, index) => {
                    const finalAvatarUrl = user.avatar ? <img className='Opinion_avatar_game' src={user.avatar} alt={`${name} avatar`} /> : <AccountIcon className='Opinion_avatar' />

                    return (
                      <div className='Opinion_game_container'>
                        <div className='Opinion_infoContainer'>
                          <div className='Opinion_avatar'><h4>{ index + 1 }</h4></div>
                          { finalAvatarUrl }
                          <div className='Opinion_userInfo'>
                            { user.avatar ? <Link to={`/community/user/${user.name}`} className='Opinion_name'>{user.name}</Link> : user.name }
                          </div>
                          <div className='Opinion_userInfo'>
                            <b style={{ fontSize: '16px' }}>{ `${user.identified}` }</b>
                          </div>
                          <div className='Opinion_userInfo'>
                            { `${user.duration}` } min
                          </div>
                          <div className='Opinion_userInfo'>{ Moment(user.createdAt).from(Moment()) }</div>
                        </div>
                      </div>
                    )
                  }) }
                </div>
              </div>
            </div>
          </div>}
          { (gameType === "active" || gameType === "review") && (typeof toFind.influence !== "undefined") && <div>
            <BottomNavigation>
              <BottomNavigationItem
                style={{ pointerEvents: 'none' }}
                label={<span style={{ fontWeight: 800 }}>Gold</span>}
                icon={<div><GoldCoins style={styles.goldIcon} /> <span style={{ fontWeight: 800, fontSize: 18 }}>{currentGold}</span></div>}
              />
              <BottomNavigationItem
                style={{ pointerEvents: 'none' }}
                label={<span style={{ fontWeight: 800 }}>Identified</span>}
                icon={<div><StarIcon style={styles.goldIcon} /> <span style={{ fontWeight: 800, fontSize: 18 }}>{identified}</span></div>}
              />
            </BottomNavigation>
            <p style={{ paddingTop: '1em', paddingLeft: '1em', paddingRight: '1em' }}>We are looking for a country that controlled about <b>{this.state.toFind.influence.peak[1].toFixed(2)}%</b> of world population in the year <b>{this.state.toFind.influence.peak[0]}</b>...</p>
            <Paper style={{ marginTop: '1em', marginBottom: '1em'}}>
              <div className={'lifelinePaper'}>
                <List>
                  <Subheader style={{ marginBottom: '-12px' }}>Lifelines</Subheader>
                  <ListItem
                    innerDivStyle={{ padding: '12px 56px 12px 72px' }}
                    style={{ pointerEvents: 'none' }}
                    leftAvatar={<div><span style={{ ...styles.minusGold, position: 'absolute', top: 30, left: 10, fontWeight: 600 }}>{-(6+(6*identified))}</span> <GoldCoins style={styles.goldIcon} /> </div>}
                    primaryText={<RaisedButton
                      disabled={lifelines.avatar || !toFind.rulerObj[3] || currentGold < (6+(6*identified))}
                      style={{ pointerEvents: 'all' }}
                      onClick={() => {
                        const { lifelines, currentGold, identified } = this.state
                        this.setState({ searchText: '', currentGold: +currentGold-(6+(6*identified)), log: LIFELINE_BANNER, logStatus: 'error', lifelines: { ...lifelines, avatar: true } })
                        setTimeout(() => {
                          this.setState({ log: '', logStatus: 'info' })
                        }, 2000)
                        }
                      }
                      primary
                      label={'Reveal banner'}
                    />}
                    rightAvatar={lifelines.avatar ? <Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]} style={{top: 10}}
                                                            src={this._getFullIconURL(decodeURIComponent(toFind.rulerObj[3]))} /> : <Avatar style={{top: 10}} color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                    >?</Avatar>}
                  />
                  <Divider inset={true} />
                  <ListItem
                    innerDivStyle={{ padding: '12px 56px 12px 72px' }}
                    style={{ pointerEvents: 'none' }}
                    leftAvatar={<div><span style={{ ...styles.minusGold, position: 'absolute', top: 30, left: 10, fontWeight: 600 }}>{-(4+(4*identified))}</span> <GoldCoins style={styles.goldIcon} /> </div>}
                    primaryText={<RaisedButton
                      style={{ pointerEvents: 'all' }}
                      onClick={() => {
                        const { lifelines, currentGold, identified } = this.state
                        this.setState({
                          searchText: '',
                          currentGold: +currentGold - (4 + (4 * identified)),
                          log: LIFELINE_MEDIA,
                          logStatus: 'error',
                          lifelines: {
                            ...lifelines,
                            media: toFind.linked.media.slice(0, ((lifelines.media || []).length + 1))
                          }
                        })
                        setTimeout(() => {
                          this.setState({ log: '', logStatus: 'info' })
                        }, 2000)
                      }
                      }
                      primary
                      disabled={((lifelines.media || []).length === (toFind.linked.media || []).length) || currentGold < (4+(4*identified))}
                      label={'Reveal media of country'}
                    />}
                    rightAvatar={lifelines.media ? null : <Avatar style={{top: 10}} color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                    >?</Avatar>}
                    open={lifelineMediaOpen}
                    onNestedListToggle={() => { this.setState({ lifelineMediaOpen: !lifelineMediaOpen}) }}
                    initiallyOpen={!(lifelines.media === false)}
                    primaryTogglesNestedList={false}
                    nestedItems={lifelines.media
                      ? [<ListItem value={"mediaContainer"}
                                   disabled={true}
                                  key={"mediaContainer"}
                                         innerDivStyle={{ padding: 0 }}
                                         primaryText={
                                           <GridList
                                             cols={1}
                                             cellHeight={400}
                                             padding={1}
                                             style={styles.gridList}
                                           >
                                             {lifelines.media.filter(el => this.state.mediaBlacklist.indexOf(el.properties.id) === -1).map(el => {
                                               return <GridTile
                                                 key={el.properties.id}
                                                 title={el.properties.n}
                                                 actionPosition="left"
                                                 titlePosition="top"
                                                 titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                                                 cols={1}
                                                 rows={1}
                                               >
                                                 <img
                                                   onError={() => this.addAnotherMediaAndBlacklist(el.properties.id)}
                                                   src={el.properties.id} />
                                               </GridTile>
                                             })}
                                           </GridList>
                                         }
                        />] : []}
                  />
                  <Divider inset={true} />
                  <ListItem
                    innerDivStyle={{ padding: '12px 56px 12px 72px' }}
                    style={{ pointerEvents: 'none' }}
                    leftAvatar={<div><span style={{ ...styles.minusGold, position: 'absolute', top: 30, left: 10, fontWeight: 600 }}>{-(2+(2*identified))}</span> <GoldCoins style={styles.goldIcon} /> </div>}
                    primaryText={<RaisedButton
                      style={{ pointerEvents: 'all' }}
                      onClick={() => {
                        const { lifelines, currentGold, identified } = this.state
                        this.setState({
                          searchText: '',
                          currentGold: +currentGold-(2+(2*identified)),
                          log: LIFELINE_CONTENT,
                          logStatus: 'error',
                          lifelines: { ...lifelines, person: (toFind.linked.map || []).filter(el => el.properties.t !== 'b' && el.properties.t !== 'si').slice(0, ((lifelines.person || []).length + 1)) }
                        })
                        setTimeout(() => {
                          this.setState({ log: '', logStatus: 'info' })
                        }, 2000)
                        }
                      }
                      primary
                      disabled={(lifelines.person || []).length === ((toFind.linked.map || []).filter(el => el.properties.t !== 'b' && el.properties.t !== 'si').length) || currentGold < (2+(2*identified))}
                      label={'Reveal person of country'}
                    />}
                    rightAvatar={lifelines.person ? null : <Avatar style={{top: 10}} color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                    >?</Avatar>}
                    open={lifelineContentPerson}
                    onNestedListToggle={() => { this.setState({ lifelineContentPerson: !lifelineContentPerson }) }}
                    initiallyOpen={!(lifelines.person === false)}
                    primaryTogglesNestedList={false}
                    nestedItems={lifelines.person
                      ? lifelines.person.map(el => {
                        const cofficient = 40 / 169
                        const backgroundPosition = 'url(/images/abstract-atlas.png) -' + (Math.round((iconMapping['abst'][el.properties.t] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping['abst'][el.properties.t] || {}).y * cofficient)) + 'px'
                        const backgroundSize = '121px 278px'
                        return <ListItem value={"markerIdNameArray-" + el.properties.w}
                                         key={"markerIdNameArray-" + el.properties.w}
                                         innerDivStyle={{ padding: 0 }}
                                         disabled={true}
                                         primaryText={<div className='listAvatar'><img style={{
                                           borderRadius: '50%',
                                           marginRight: '1em',
                                           height: 30,
                                           width: 30,
                                           background: backgroundPosition,
                                           backgroundSize: backgroundSize,
                                           opacity: 1
                                         }} src='/images/transparent.png' />{el.properties.y} <b>{el.properties.n}</b><FlatButton
                                           style={{ margin: '0px 0px 0px 12px', left: 4, lineHeight: '16px', height: 'inherit', minWidth: 'inherit' }}
                                           label={''}
                                           primary
                                           onClick={() => window.open(decodeURIComponent("https://en.wikipedia.org/wiki/" + el.properties.w), '_blank').focus()}
                                           icon={<IconOpenInNew hoverColor={themes[theme].highlightColors[0]} />}
                                         /></div>}
                        />
                      })
                      : []}
                  />
                  <Divider inset={true} />
                  <ListItem
                    innerDivStyle={{ padding: '12px 56px 12px 72px' }}
                    style={{ pointerEvents: 'none' }}
                    leftAvatar={<div><span style={{ ...styles.minusGold, position: 'absolute', top: 30, left: 10, fontWeight: 600 }}>{-(2+(2*identified))}</span> <GoldCoins style={styles.goldIcon} /> </div>}
                    primaryText={<RaisedButton
                      style={{ pointerEvents: 'all' }}
                      onClick={() => {
                        const { lifelines, currentGold, identified } = this.state
                        this.setState({
                          searchText: '',
                          currentGold: +currentGold-(2+(2*identified)),
                          log: LIFELINE_CONTENT,
                          logStatus: 'error',
                          lifelines: { ...lifelines, battle: (toFind.linked.map || []).filter(el => el.properties.t === 'b' || el.properties.t === 'si').slice(0, ((lifelines.battle || []).length + 1)) }
                        })
                        setTimeout(() => {
                          this.setState({ log: '', logStatus: 'info' })
                        }, 2000)
                      }
                      }
                      primary
                      disabled={(lifelines.battle || []).length === ((toFind.linked.map || []).filter(el => el.properties.t === 'b' || el.properties.t === 'si').length) || currentGold < (2+(2*identified))}
                      label={'Reveal battle of country'}
                    />}
                    rightAvatar={lifelines.battle ? null : <Avatar style={{top: 10}} color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                    >?</Avatar>}
                    open={lifelineContentBattle}
                    onNestedListToggle={() => { this.setState({ lifelineContentBattle: !lifelineContentBattle }) }}
                    initiallyOpen={!(lifelines.battle === false)}
                    primaryTogglesNestedList={false}
                    nestedItems={lifelines.battle
                      ? lifelines.battle.map(el => {
                          const cofficient = 40 / 169
                          const backgroundPosition = 'url(/images/abstract-atlas.png) -' + (Math.round((iconMapping['abst'][el.properties.t] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping['abst'][el.properties.t] || {}).y * cofficient)) + 'px'
                          const backgroundSize = '121px 278px'
                          return <ListItem value={"markerIdNameArray-" + el.properties.w}
                                           key={"markerIdNameArray-" + el.properties.w}
                                           innerDivStyle={{ padding: 0 }}
                                           disabled={true}
                                           primaryText={<div className='listAvatar'><img
                                             style={{
                                             borderRadius: '50%',
                                             marginRight: '1em',
                                             height: 30,
                                             width: 30,
                                             background: backgroundPosition,
                                             backgroundSize: backgroundSize,
                                             opacity: 1
                                           }} src='/images/transparent.png' />{el.properties.y} <b>{el.properties.n}</b><FlatButton
                                             style={{ margin: '0px 0px 0px 12px', left: 4, lineHeight: '16px', height: 'inherit', minWidth: 'inherit' }}
                                             label={''}
                                             primary
                                             onClick={() => window.open(decodeURIComponent("https://en.wikipedia.org/wiki/" + el.properties.w), '_blank').focus()}
                                             icon={<IconOpenInNew hoverColor={themes[theme].highlightColors[0]} />}
                                           /></div>}
                          />
                        })
                      : []}
                  />
                  <Divider inset={true} />
                  <ListItem
                    innerDivStyle={{ padding: '12px 56px 12px 72px' }}
                    style={{ pointerEvents: 'none' }}
                    leftAvatar={<div><span style={{ ...styles.minusGold, position: 'absolute', top: 30, left: 10, fontWeight: 600 }}>-40</span> <GoldCoins style={styles.goldIcon} /> </div>}
                    primaryText={<RaisedButton
                      style={{ pointerEvents: 'all' }}
                      onClick={() => {
                        this.setState({ popupOpen: true })
                        }
                      }
                      primary
                      disabled={currentGold < 40}
                      label={'Skip country'}
                    />}
                  />
                </List>
              </div>
            </Paper>

            <h5 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              paddingTop: '2px'
            }}>Take a guess:</h5>

            <img style={{ ...styles.statue, width: 78, position: 'initial', float: 'left', left: 10, bottom: 0 }} src="/images/pointer.png" />
            <AutoComplete
              style={{paddingLeft: '1em', paddingRight: '1em', width: 'calc(100% - 212px)'}}
              hintText="Click and start typing..."
              filter={AutoComplete.caseInsensitiveFilter}
              searchText={this.state.searchText}
              onUpdateInput={(searchText) => {
                this.setState({
                  searchText: searchText,
                });
              }}
              onNewRequest={(val) => {
                const { toFind, identified, currentGold, prevCountries } = this.state
                if (val === toFind.rulerObj[0]) {
                  this.setState({ prevCountries: [...prevCountries, val], searchText: '', currentGold: +currentGold+20, identified: identified+1, log: 'Correct!', logStatus: 'success' })
                  this.generateNewCountryToFind()
                  setTimeout(() => {
                    this.setState({ log: '', logStatus: 'info' })
                  }, 2000)
                } else {
                  this.setState({ searchText: '', currentGold: +currentGold-(2 + (identified * 2)), log: LOG_WRONG_GUESS, logStatus: 'error' })
                  setTimeout(() => {
                    this.setState({ log: '', logStatus: 'info' })
                  }, 2000)
                }
              }}
              fullWidth={true}
              dataSource={Object.keys(metadata['ruler']).map((rulerId) => metadata['ruler'][rulerId][0]) || []}
              label='pos.play.takeGuess' />
          </div> }
        </Card>
        <img style={{ ...styles.statue, left: -49, bottom: 0 }} src="/images/statueLeft1.png" />
        <img style={{ ...styles.statue, left: -49, top: -50 }} src="/images/statueRight2.png" />
        <img style={{ ...styles.statue, right: -50, bottom: 0 }} src="/images/statueRight1.png" />
        <img style={{ ...styles.statue, right: -53, top: -50 }} src="/images/statueLeft2.png" />
        <span style={{ ...styles.log, color: logColor, bottom: (log === "") ? '0' : '-46px' }}>{customLog}</span>
        <Dialog
          onRequestClose={() => { if (gameType === 'tutorial') this.setState({ popupOpen: false })}}
          title={(gameType === 'active') ? 'Skipping Country' : ((gameType === 'tutorial') ? 'Username' : 'Game Over')}
          actions={gameType === 'active' ? [
            <FlatButton
              label={'Continue'}
              primary={true}
              keyboardFocused={true}
              onClick={() => {
                const { gameType } = this.state
                if (gameType === 'active') {
                  const { lifelines, currentGold, toFind, prevCountries, identified } = this.state
                  this.setState({ searchText: '', currentGold: +currentGold-40, log: LIFELINE_SKIP, logStatus: 'error', prevCountries: [...prevCountries, toFind.rulerObj[0]], popupOpen: false, lifelines: { ...lifelines } })
                  this.generateNewCountryToFind()
                  setTimeout(() => {
                    this.setState({ log: '', popupOpen: false, logStatus: 'info' })
                  }, 2000)
                } else {
                  this.setState({popupOpen: false})
                }
              }}
            />
          ] : ((gameType === 'tutorial')
            ? [
              <RaisedButton
                label={'Start'}
                primary={true}
                disabled={customName === ''}
                keyboardFocused={true}
                onClick={() => {
                  this.setState({
                    loading: true,
                    timeStart: new Date().getTime(),
                    identified: 0,
                    prevCountries: [],
                    currentGold: 50,
                    popupOpen: false
                  })
                  this.generateNewCountryToFind()
                }}
              />
          ]
            : [
            <FlatButton
              label={'Play again'}
              primary={true}
              keyboardFocused={!isHighscore}
              onClick={() => {
                this.setState({
                  loading: true,
                  timeStart: new Date().getTime(),
                  identified: 0,
                  prevCountries: [],
                  currentGold: 50,
                  popupOpen: false
                })
                this.generateNewCountryToFind()
              }}
            />,
            <FlatButton
              label={'Highscore List'}
              primary={true}
              keyboardFocused={isHighscore}
              onClick={() => {
                this.setState({ gameType: 'highscore', popupOpen: false })
              }}
            />,
            <FlatButton
              label={'Exit Game'}
              primary={true}
              keyboardFocused={false}
              onClick={() => {
                this.setState({ popupOpen: false })
                this.props.history.push('/')
              }}
            />
          ])}
          onClick={() => {
            this.setState({
              loading: true,
              timeStart: new Date().getTime(),
              identified: 0,
              prevCountries: [],
              currentGold: 50,
              popupOpen: false
            })
            this.generateNewCountryToFind()
          }}
          modal={false}
          open={this.state.popupOpen}
        >
          { (gameType === 'active')
            ? <div><p>
            The country to identify was: <br />
            <b>{this.state.toFind.rulerObj[0]}</b>
          </p></div>
            : (gameType === 'tutorial')
              ? <div>

                <TextField
                  hintText="Username for highscore list?"
                  underlineStyle={{
                    borderColor: themes[theme].foreColors[0]
                  }}
                  fullWidth={true}
                  onChange={(event, newValue) => this.setState({ customName: newValue })}
                />
                <br /> <br />

            </div>
              : <div>
                <p>Identified: <StarIcon style={styles.goldIcon} /> <span style={{ fontWeight: 800, fontSize: 18 }}><b>{identified}</b></span><br />
                  Total Duration: <b>{((new Date().getTime() - timeStart) / 60000).toFixed(2)} min</b><br />
                  <b>{currentGold > 0 ? currentGold : 0}</b> <GoldCoins style={styles.goldIcon} /> left</p>
                <Divider/>
                <br/>
                { isRanking && <p>Calculating highscore rank...</p>}
                { !isRanking && isHighscore && <p><b>Congratulations! You made it in the highscore top 10!</b></p>}
                { !isRanking && !isHighscore && <p><i>Unfortunately this round did not make it in the top 10.</i></p>}
                </div> }
        </Dialog>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  locale: state.locale,
  metadata: state.metadata,
  markerTheme: state.markerTheme,
  theme: state.theme,
})

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
  changeMarkerTheme
})(translate(Play))
