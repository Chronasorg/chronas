import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import Moment from 'moment'
import RaisedButton from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconHelp from 'material-ui/svg-icons/action/help-outline'
import IconEmail from 'material-ui/svg-icons/communication/email'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import { Treemap } from 'react-vis'
import ChronasLogo from './LogoChronas'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tabs, Tab } from 'material-ui/Tabs'
import { LoadingCircle } from '../../global/LoadingCircle'
import nest from '../../../components/content/Charts/utilsNest'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {
  translate,
  BooleanField,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  Edit,
  Filter,
  FormTab,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  Restricted,
  ReferenceManyField,
  TabbedForm,
  TextInput,
} from 'admin-on-rest'

import { properties, markerIdNameArray, themes } from '../../../properties'
import axios from 'axios/index'
import { history } from '../../../store/createStore'

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  form: {
    marginLeft: 20,
  },
  toolbar: {
    height: 46,
    float: 'right',
    background: 'transparent',
    boxShadow: 'none',
  }
}

class Information extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      emailAddress: '',
      emailSubject: '',
      emailHtml: '',
      tabForm: localStorage.getItem('chs_info_section') || 'welcome',
      hiddenElement: true,
      statistics: false,
      welcomeStatistics: false,
      prevValue: false,
      statisticsBreakdown: false
    }
  }

  sendContactEmail = () => {
    const {
      emailAddress,
      emailSubject,
      emailHtml
    } = this.state

    if (!emailAddress || !emailSubject || !emailHtml) {
      alert('All fields are required')
    } else {
      axios.post(properties.chronasApiHost + '/contact', {
        from: emailAddress,
        subject: emailSubject,
        html: emailHtml
      }, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token') } })
        .then(() => {
          this.props.showNotification('Email sent!')
        })
        .catch((err) => {
          this.props.showNotification('Something went wrong...')
        })
      this.setState({
        emailAddress: '',
        emailSubject: '',
        emailHtml: ''
      })
    }
  }

  handleChange = (value) => {
    if (value === 'statistics' && !this.state.statistics) {
      axios.get(properties.chronasApiHost + '/statistics')
        .then((statistics) => {
          const socialColors = {
            facebook: '#4267b2',
            chronas: '#6a6a6a',
            github: '#242a2e',
            twitter: '#1ea1f2',
            google: '#ea4735',
          }
          const userBreakdown = { children: statistics.data.user.map(el => {
            return {
              title: (el._id || 'v0 Chronas').toUpperCase(),
              hex: socialColors[el._id],
              size: el.count
            }
          }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size) }

          const markerBreakdown = { children: statistics.data.marker.map(el => {
            const foundEl = markerIdNameArray.find(m => m[0] === el._id)
            if (foundEl) {
              return {
                title: foundEl[1],
                hex: foundEl[4],
                size: el.count
              }
            }
          }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size) }

          const mediaBreakdown = { children: statistics.data.metadataI.map(el => {
            const foundEl = properties.linkedTypes.find(m => m.id === el._id)
            if (foundEl) {
              return {
                title: foundEl.name,
                hex: foundEl.color,
                size: el.count
              }
            }
          }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size) }

          setTimeout(() => {
            this.setState({
              statistics: statistics.data,
              statisticsBreakdown: {
                markerBreakdown: markerBreakdown,
                userBreakdown: userBreakdown,
                mediaBreakdown: mediaBreakdown,
              }
            })
          }, 500)
        })
    } else if (value === 'welcome' && !this.state.welcomeStatistics) {
      axios.get(properties.chronasApiHost + '/version/welcome')
        .then((welcomeSatistics) => {
          const welcomeStatistics = welcomeSatistics.data
          welcomeStatistics.build = new Date(welcomeStatistics.build).toLocaleDateString()
          welcomeStatistics.lastDataEdit =  Moment(welcomeStatistics.lastDataEdit).from(Moment())

          this.setState({
            welcomeStatistics
          })
        })
    }
    this.setState({
      prevValue: this.state.prevValue ? false : this.state.tabForm,
      tabForm: value,
    })
  }

  componentDidMount = () => {
    const { tabForm } = this.state
    this.setState({ hiddenElement: false })
    if (!tabForm || tabForm === 'welcome') {
      axios.get(properties.chronasApiHost + '/version/welcome')
        .then((welcomeSatistics) => {
          const welcomeStatistics = welcomeSatistics.data
          welcomeStatistics.build = new Date(welcomeStatistics.build).toLocaleDateString()
          welcomeStatistics.lastDataEdit =  Moment(welcomeStatistics.lastDataEdit).from(Moment())

          this.setState({
            welcomeStatistics
          })
        })
    }
  }

  componentWillUnmount = () => {
    localStorage.removeItem('chs_info_section')
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const statItem = (title, value, tooltip, tooltipPosition) => {
      return <div className='FeedBox_container'>
        <div className='FeedBox_header'>
          <span className='FeedBox_title'>{title}</span>
        </div>
        <div className='FeedBox_discussionsSmall'>
          { tooltip && <IconButton style={{ margin: '-10px 0px -18px', top: -38, left: 12 }} tooltip={tooltip} touch tooltipPosition={tooltipPosition}>
            <IconHelp />
          </IconButton>}
          <h3>{ value }</h3>
        </div>
      </div>
    }
    const { translate, theme, history } = this.props
    const { statistics, welcomeStatistics, statisticsBreakdown, tabForm } = this.state

    const chartProps = (!statistics) ? false : {
      animation: {
        damping: 9,
        stiffness: 300
      },
      height: 380,
      mode: 'squarify',
      width: 650,
      colorType: 'literal',
      getSize: d => d.size,
      getColor: (d) => { return d.hex },
      style: {
        stroke: '#ddd',
        strokeOpacity: 0.3,
        strokeWidth: 2,

      },
      hideRootNode: true,
    }

    return (
      <Dialog bodyStyle={{ maxHeight: 800, background: themes[theme].backColors[0] /* backgroundImage: themes[theme].gradientColors[0] */ }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal modalMenu'} titleStyle={{ overflow: 'auto' }} overlayStyle={{ overflow: 'auto' }} style={{ overflow: 'auto' }}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0, height: 680, maxHeight: 800, minWidth: 900, maxWidth: '1024px' }} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={''} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={'Go Back'} touch key={'back'} onClick={() => {
                    const { prevValue } = this.state
                    if (prevValue) {
                      this.handleChange(prevValue)
                    } else {
                      history.goBack()
                    }
                  }}>
                  <IconBack hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={'Close'} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <Tabs
            inkBarContainerStyle={{ width: 'calc(100% - 170px)' }}
            tabItemContainerStyle={{ width: 'calc(100% - 170px)' }}
            inkBarStyle={{
              backgroundColor: themes[theme].highlightColors[0]
            }}
            contentContainerStyle={{ maxHeight: 800}}
            tabTemplateStyle={{ maxHeight: 801}}
            value={tabForm}
            onChange={this.handleChange}
            >
            <Tab label='Welcome' value='welcome'>
              <br />
              <div className='modal-header'>
                <h4 className='modal-title' style={{ fontSize: 33, margin: '0 auto' }}>Welcome to <ChronasLogo height={50} vheight={360} width={160} vwidth={1000} color={themes[theme].foreColors[0]} style={{ marginLeft: -22, marginTop: -9 }} />
                  <span className='modal-title' style={{ fontSize: 20, fontWeight: 200 ,
                    top: 36,
                    marginLeft: -16,
                    position: 'absolute'
                  }}>BETA</span></h4>
              </div>
              <br />
              <div style={{
                background: 'url(/images/compass.jpg) center bottom no-repeat #f9f9f9',
                minHeight: 512,
                marginBottom: -40
              }}>
                <p>
                  <span style={{ fontWeight: 800 }}>Chronas</span> is a history map application with over <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('statistics')}>50 million data points</a> which every registered user can curate and contribute to (just like <a>Wikipedia</a>).
                </p>
                <p>
                  Before you dive in, make sure to watch the short <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('tutorial')}>Tutorial Video</a> in the How To section.
                </p>
                <p>
                  <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => history.push('/login')}>Join</a> our community of <span style={{ fontWeight: 800 }}>{welcomeStatistics ? welcomeStatistics.user : '...'}</span> members to add and edit data, earn points, ask questions about history articles and access our <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => history.push('/community/general')}>Forums</a> to suggest new features and report bugs.
                </p>
                <p>Visit the <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('about')}>About</a> section to read more about the Chronas project and send the developers your inquiries, comments or questions through the <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('contact')}>Contact</a> form.</p>
                <p>We believe in the potential of this project to become a popular history tool alongside Wikipedia. If you share our enthusiasm and want to see the project succeed, please consider becoming a sustainer. For more information on <b>support</b> and the <b>future of Chronas</b>, visit the <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('pro')}>New Features</a> section.</p>
                { welcomeStatistics && <div style={{ position: 'absolute',
                  bottom: 34,
                  fontSize: 'small' }}>build {welcomeStatistics.build} - v{welcomeStatistics.version}</div> }
                { welcomeStatistics && <div style={{ position: 'absolute',
                  bottom: 18,
                  fontSize: 'small' }}>last data edit {welcomeStatistics.lastDataEdit}</div> }
              </div>
            </Tab>
            <Tab label='How To' value='tutorial'>
              <br />
              <div>
                <br />
                <h4>How to use in about 5 minutes</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height={600}
                    videoId='Ah3qSNJpj4Q'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
                <br />
                <h4>How to edit data in about 6 minutes (with commentary)</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height='600px'
                    videoId='r4x4aYfQNp4'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
              </div>
            </Tab>
            <Tab label='About' value='about'>
              <br />
              <div>
                <br />
                <h4>What is Chronas?</h4>
                <br />
                <h5>In Brief</h5>
                <p>Chronas may be described as a mix of <a target='_blank' href='https://www.openstreetmap.org'>Open Street Map</a>, <a target='_blank' href='https://www.wikipedia.org/'>Wikipedia</a> and <a target='_blank' href='https://earth.google.com/web/'>Google Earth</a>. It maps 4000 years of historic rulers (polictical entities), cultures, and religions on a map linking to related Wikipedia articles as well as various kinds of different markers such as people, battles, cities, castles etc. All of those can be linked to express a relation of each other (for example linking the siege of a city to the specific city marker). On top of that, other kinds of media such as videos, images or podcasts can be linked to create an even bigger knowledge web. Users can rate, edit and add new markers, area entities or media items and create links all tracked by a revision history system. They can also ask questions on specific articles and create article collections (called Epics) on major topics such as wars or explorations (all area entities are on default Epics). A video showcasing those features can be found <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('tutorial')}>here</a>.</p>
                <h5>From the beginning</h5>
                <p>The name <b>Chronas</b> is a combination of <b>Chron</b>os and Atl<b>as</b> indicating the chronological and cartographical approach of the history application.</p>
                <p>The initial idea in mid-2014 was to add a time slider to a Google Maps like application, making it possible to travel back in time: watching realms being founded, grow and disappear again. The goal was to get a better understanding of how the world's history is interconnected. <i>What happened in Asia when Rome dominated Europe? What happened in Arabia when Kublai Khan proclaimed himself the emperor of China?</i></p>
                <p>The original version of Chronas was released in 2015 and attracted over 5000 registered users. It was based on a fork of <a target='_blank' href='https://umap.openstreetmap.fr/en'>Open Street Map</a> and used the raster map library <a target='_blank' href='https://leafletjs.com/'>Leaflet</a> with the relational <a target='_blank' href='https://www.postgresql.org/'>PostgreSQL</a> database.
                </p>
                <p>
                  Here is a ~5 min video showing the basic features of the original version:
                </p>
                <p>
                  <YouTube
                    className='introVideo'
                    height={400}
                    videoId='0yqcCK66Az4'
                    opts={properties.YOUTUBEOPTS}
                  />
                </p>
                <p>
                  If you are interested in trying out the original version, it is still available at <a target='_blank' href='http://v0.chronas.org'>http://v0.chronas.org</a>. It also includes the <a target='_blank' href='http://v0.chronas.org/blog'>development blog</a> which explains in more detail the technical approach of the initial version as well as two 3D spin-off apps showing <a target='_blank' href='http://app.chronas.org/castles/#/wikidata'>castles</a> and <a target='_blank' href='http://app.chronas.org/battles/#/wikidata'>battles</a> by wikipedia language.
                </p>
                <br />
                <p>
                  Development of the current version of Chronas began in July 2017 and represented a complete rewrite of logic and architecture focusing on improved performance as well as easy edits, revisions and linking related articles. In place of Leaflet, the WebGL map library <a target='_blank' href='https://www.mapbox.com/mapbox-gl-js/api/'>Mapbox GL</a> was used with a <a target='_blank' href='https://reactjs.org/'>React JS</a> UI. For the backend a dedicated API written in <a target='_blank' href='https://expressjs.com'>Express</a> <a target='_blank' href='https://nodejs.org/'>Node JS</a> uses a NoSQL <a target='_blank' href='https://nodejs.org/'>Mongo</a> database for complex queries and revisioning.
                </p>
                <p>You can find a detailed feature walkthrough of the new Chronas version in the <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('tutorial')}>How To</a> section.</p>
              </div>
            </Tab>
            <Tab label='Statistics' value='statistics'>
              <br />
              <div>
                <br />
                <p><i>The following statistics are live data counts and represent a snapshot of the current Chronas database</i></p>
                <br />
                { statistics && <div className='user_stats'>
                  <h4 style={{ }}>Map Datapoints</h4>
                  { statItem('Area', statistics.area.areaDatapoints, 'Area datapoints: 4000 years mapped with 2479 provinces with 4 dimensions', 'bottom-right') }
                  { statItem('Markers', statistics.markerTotal, 'Markers include people and battle markers, but also cities etc', 'bottom-right') }
                  { statItem('Media', statistics.metadataTotal, 'Media includes media (videos, images...) as well as epics (compilation of articles)', 'bottom-left') }
                  { statItem('Entities', statistics.metadataEntityCount, 'Number of unique area entities for rulers, cultures and religions', 'bottom-left') }
                  <h4>Users and Engagements</h4>
                  { statItem('Users', statistics.userTotal, 'Signed up users', 'bottom-right') }
                  { statItem('Edits', statistics.revisionTotal, 'Edits made to the data by users', 'bottom-right') }
                  { statItem('Threads', statistics.threadsTotal, 'Forum threads (includes auto-generated and migrated threads)', 'bottom-left') }
                  { statItem('Replies', statistics.commentsTotal, 'Forum comments (includes auto-generated and migrated replies)', 'bottom-left') }
                  <br />
                  <hr />
                  <h4 style={{ marginBottom: '1em' }}>Details</h4>
                  <div>
                    <div style={{ float: 'right' }}><h4>Marker Breakdown</h4>
                      <ul style={{ listStyle: 'none' }}>
                        { statisticsBreakdown.markerBreakdown.children.map(el => <li><span style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap {...chartProps} data={statisticsBreakdown.markerBreakdown} /> }
                  </div>
                  <div>
                    <div style={{ float: 'right' }}><h4>Media Breakdown</h4>
                      <ul style={{ listStyle: 'none' }}>
                        { statisticsBreakdown.markerBreakdown.children.map(el => <li><span style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap {...chartProps} data={statisticsBreakdown.mediaBreakdown} /> }
                  </div>
                  <div>
                    <div style={{ float: 'right' }}><h4>Users By Auth Type</h4>
                      <ul style={{ listStyle: 'none' }}>
                        { statisticsBreakdown.userBreakdown.children.map(el => <li><span style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap {...chartProps} data={statisticsBreakdown.userBreakdown} /> }
                  </div>
                </div> }
                { !statistics && <div style={{ marginBottom: '15%' }}><LoadingCircle theme={theme} title={translate('pos.loading')} /></div>}
              </div>
            </Tab>
            <Tab label='Rules' value='rules'>
              <br />
              <div className=''>
                <br />
                <h4>Rules For Data Curation</h4>
                <ol>
                  <li><i>No Vandalism</i>: This is not the place to paint an alternative history map. Vandalism hurts the project immensely (costly backups) and will get you banned.</li>
                  <li><i>Watch the tutorial videos</i> before you start editing. Some controls may lead to <i>unwanted</i> results.</li>
                  <li>Your data inputs should be based on <i>accepted history</i> and you should be ready to cite sources if asked.</li>
                  <li><i>Report</i> Users That Break those Rules.</li>
                </ol>
                <br />
                <h4>Rules For The Forums</h4>
                <ol>
                  <li><i>No Vandalism</i>: No Racism, Bigotry, or Offensive Behavior.</li>
                  <li>Ask <i>Clear and Specific Questions</i>, with <i>Time and Place in Mind</i>.</li>
                  <li>Provide preferably <i>Primary and Secondary Sources</i> If Asked Rather Than Tertiary Sources Like <i>Wikipedia</i>.</li>
                  <li>Serious On-Topic Questions Only: <i>No Jokes</i>, <i>Anecdotes</i>, <i>Clutter</i>, or other <i>Digressions</i>.</li>
                  <li><i>Report</i>  Answers That Break those Rules.</li>
                </ol>
              </div>
              <br />
            </Tab>
            <Tab label='New Features' value='pro'>
              <br />
              <div className=''>
                <br />
                <h4>Support</h4>
                <p>
                  There are a couple of ways to finance the upkeep and the development of new features and fixing of issues. For example Wikipedia or public broadcasters use reoccurring campaigns to raise donations (<b>pledge drives</b>), many web applications use <b>advertisements</b> (which can decrease the useability/ enojoyment of the app). Another way is to introduce a <b>pro version</b> or try to find <b>venture capital investors</b>.</p>
                <p>
                  We decided to try out yet another funding model which gives the <b>sustaining users</b> who ensure the future of Chronas also the ability to decide where the journey is headed. If you believe in our project, please consider supporting us on <a className='customLink'  target='_blank' href='https://www.patreon.com/chronas'>Patreon</a> where we will have regular <b>votes</b> on the priority of proposed <b>new features</b> as well as <b>major design decisions</b>.
                </p>
                  {/*<ol>*/}
                    {/*<li>There will always be a completely free version with at least the amount of features you can use now. Nothing will be cut.</li>*/}
                    {/*<li>The pro version helps to sustain the free version and funds improvements and extensions.</li>*/}
                    {/*<li>The history data this application is based on (and is user contributed/ curated) will never be locked away as a pro feature. Pro features will be advanced or extended features which build on top of free features.</li>*/}
                    {/*<li>There is no pro version yet and its features will depend on demand and requests by the community.</li></ol>*/}
                <br />
                <Divider />
                <br />
                <h4>New Features</h4>
                <p><b>You can propose features in the feature request <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => history.push('/community/features')}>forum</a> or by directly <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('contact')}>contacting</a> the developers.</b> Accepted features will be listed here.</p>
                <ul>
                  <li>New dimension <b>General Ruler</b>: Similar to general religions, it may make sense to have optional general rulers to be able to show umbrella entities like the ancient <b>Delian League</b>, the medieval <b>Holy Roman Empire</b> or the modern <b>European Union</b>. This new dimension will be a new option next to already existing ones <i>(Ruler, Culture, Religion, General Religion)</i>.</li>
                  <li><b>Article lists and collections</b>: Users can create article lists containing any article types (marker, area, media or epics), name them and optional share them with the community.</li>
                  <li><b>Bookmarks and History</b>: Users can bookmark and write notes on selected articles which only they can see. Also, any article which is viewed by the user will be marked as read and a counter of read articles is incremented - if a user visits the same article again it will display the time and date this artilce was last viewed.</li>
                  <li><b>Full database search</b>: Free text search and filters available to find and browse any article in our database</li>
                  <li><b>Managed accounts</b>: This feature allows users to create and manage accounts with limited scope (such as limiting the managed users to a selection of markers and time ranges) as well as viewing articles read by the managed user accounts (classroom setting)</li>
                  <li><b>Full localisation</b>: Chronas in a different language will not only support a complete GUI translation but will also be viewing the articles in its according Wikipedia subsite</li>
                  <li><i>Your feature here...</i></li>
                </ul>
                <br />
                <Divider />
                <br />
                <p>
                  If you are interested in running Chronas on your (or our) server with a complete data replica of which you are in complete control, <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0] }} onClick={() => this.handleChange('contact')}>contact</a> us and we are happy to discuss further.
                </p>
                <br />
              </div>
              <br />
            </Tab>
            <Tab label='Contact' value='contact'>
              <br />
              <div className=''>
                <br />
                <h4>Developers</h4>
                <Card>
                  <CardHeader
                    title='Front and Backend Development'
                    subtitle='Dietmar Aumann'
                    avatar={<div style={{ float: 'left' }}><Avatar
                      src='/images/dev_da.jpg'
                      size={48}
                      /><IconButton style={{ cursor: 'help', position: 'absolute', right: 10, top: 12 }} tooltip={'dietmar.aumann [at] gmail.com'} touch tooltipPosition={'center-left'}>
                        <IconEmail />
                      </IconButton></div>}
                    showExpandableButton={false}
                    expandable={false}
                    />
                </Card>
                <Card>
                  <CardHeader
                    title='DevOps and development support'
                    subtitle='Joachim Aumann'
                    avatar={<div style={{ float: 'left' }}><Avatar
                      src='/images/dev_ja.jpeg'
                      size={48}
                      /><IconButton style={{ cursor: 'help', position: 'absolute', right: 10, top: 12 }} tooltip={'aumann.joachim [at] gmail.com'} touch tooltipPosition={'center-left'}>
                        <IconEmail />
                      </IconButton></div>}
                    showExpandableButton={false}
                    expandable={false}
                    />
                </Card>
                <br />
                <br />
                <h4>Contact</h4>
                <p>Send us an email directly (hover over the email icon to display our email addresses) or use the form below:</p>
                <Paper zDepth={2}>
                  <TextField hintText='Your Email Address*' style={styles.form} underlineShow={false}
                    value={this.state.emailAddress} onChange={(e) => this.setState({ emailAddress: e.target.value })}
                  />
                  <Divider />
                  <TextField hintText='Subject*' style={styles.form} underlineShow={false}
                    value={this.state.emailSubject} onChange={(e) => this.setState({ emailSubject: e.target.value })}
                  />
                  <Divider />
                  <TextField
                    style={styles.form}
                    hintText='Message*'
                    underlineShow={false}
                    multiLine
                    rows={4}
                    value={this.state.emailHtml} onChange={(e) => this.setState({ emailHtml: e.target.value })}
                  />
                  <Divider />
                  <br />
                  <RaisedButton label='Send' style={styles.form} onClick={this.sendContactEmail} />
                  <br />
                </Paper>
                <Divider />
                <br />
                <div>
                  <Divider />
                  <br />
                  © 2018 Dietmar & Joachim Aumann, Chronasorg
                </div>
              </div>
            </Tab>
            {/* <Tab label='Terms of Use' value='impressum'>
              <br />
              <div>
                <p>Impressum here</p>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                  © 2018 Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab> */}
          </Tabs>
        </Card>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps, {
})(translate(Information))
