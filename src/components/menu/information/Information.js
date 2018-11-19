import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import { Card, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconHelp from 'material-ui/svg-icons/action/help-outline'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { Treemap } from 'react-vis'
import ChronasLogo from './LogoChronas';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tabs, Tab } from 'material-ui/Tabs'
import { LoadingCircle } from '../../global/LoadingCircle'
import nest from '../../../components/content/Charts/utilsNest'

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
  TextField,
  TextInput,
} from 'admin-on-rest'

import { properties, markerIdNameArray, themes } from '../../../properties'
import axios from "axios/index";

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
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
      tabForm: localStorage.getItem('chs_info_section') || 'welcome',
      hiddenElement: true,
      statistics: false,
      welcomeStatistics: false,
      statisticsBreakdown: false
    }
  }

  handleChange = (value) => {
    if (value === "statistics" && !this.state.statistics) {
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
                title: el._id.toUpperCase(),
                hex: socialColors[el._id],
                size: el.count
              }
            }).filter( el => typeof el !== "undefined").sort((a, b) => b.size - a.size)}

          const markerBreakdown = { children: statistics.data.marker.map(el => {
            const foundEl = markerIdNameArray.find(m => m[0] === el._id)
              if (foundEl) return {
                                    title: foundEl[1],
                                    hex: foundEl[4],
                                    size: el.count
                                  }
          }).filter( el => typeof el !== "undefined").sort((a, b) => b.size - a.size)}

          const mediaBreakdown = { children: statistics.data.metadataI.map(el => {
              const foundEl = properties.linkedTypes.find(m => m.id === el._id)
              if (foundEl) return {
                title: foundEl.name,
                hex: foundEl.color,
                size: el.count
              }
            }).filter( el => typeof el !== "undefined").sort((a, b) => b.size - a.size)}

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
    }
    else if (value === "welcome" && !this.state.welcomeStatistics) {
      axios.get(properties.chronasApiHost + '/version/welcome')
        .then((welcomeSatistics) => {
            this.setState({
              welcomeStatistics: welcomeSatistics.data,
            })
        })
    }
    this.setState({
      tabForm: value,
    })
  }

  componentDidMount = () => {
    const { tabForm } = this.state
    this.setState({ hiddenElement: false })
    if (!tabForm || tabForm === "welcome") {
      axios.get(properties.chronasApiHost + '/version/welcome')
        .then((welcomeSatistics) => {
          this.setState({
            welcomeStatistics: welcomeSatistics.data,
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
          { tooltip && <IconButton style={{ marginTop: -10, top: -4 }} tooltip={tooltip} touch={true} tooltipPosition={tooltipPosition}>
            <IconHelp />
          </IconButton>}
          <br />
          <br />
          <h3>{ value }</h3>
        </div>
      </div>
    }
    const { translate, theme } = this.props
    const { statistics, welcomeStatistics, statisticsBreakdown } = this.state

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
      // onValueMouseOver: this._handleMouseOver,
      // onValueMouseOut: () => this.setState({
      //   pathValue: defaultPathValue,
      //   finalValue: false,
      //   data: updateData(this.state.data, false)
      // }),
      // onLeafMouseOver: this._handleMouseOver,
      // onLeafMouseOut: () => this.setState({
      //   pathValue: defaultPathValue,
      //   finalValue: false,
      //   data: updateData(this.state.data, false)
      // }),
    }


    return (
      <Dialog bodyStyle={{ background: themes[theme].backColors[0] /*backgroundImage: themes[theme].gradientColors[0]*/ }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal modalMenu'}  titleStyle={{ overflow: 'auto'}} overlayStyle={{ overflow: 'auto'}} style={{ overflow: 'auto'}}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0, maxWidth: '1024px' }} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={''} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton
                  tooltipPosition="bottom-left"
                  tooltip={'Go Back'} touch key={'back'} onClick={() => this.props.history.goBack()}>
                  <IconBack hoverColor={themes[theme].highlightColors[0]}  />
                </IconButton>
                <IconButton
                  tooltipPosition="bottom-left"
                  tooltip={'Close'} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <Tabs
            inkBarContainerStyle ={{ width: 'calc(100% - 170px)' }}
            tabItemContainerStyle ={{ width: 'calc(100% - 170px)' }}
            inkBarStyle={{
              backgroundColor: themes[theme].highlightColors[0]
            }}
            value={this.state.tabForm}
            onChange={this.handleChange}
            >
            <Tab label='Welcome' value='welcome'>
              <br />
              <div className='modal-header'>
                <h4 className='modal-title' style={{ fontSize: 33, margin: '0 auto' }}>Welcome to <ChronasLogo height={50} vheight={360} width={160} vwidth={1000} color={themes[theme].foreColors[0]} style={{ marginLeft: -22, marginTop: -9 }} /></h4>
              </div>
              <br />
              <div style={{
                  background: 'url(/images/compass.jpg) center bottom no-repeat #f9f9f9',
                  minHeight: 436,
                  marginBottom: -40
                }}>
                <p>
                  <span style={{ fontWeight: 800 }}>Chronas</span> is a history map application with over 50 million data points which every registered user can curate and contribute to (just like <a>Wikipedia</a>).
                </p>
                <p>
                  Before you dive in, make sure to watch the short <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0]}} onClick={ () => this.handleChange('tutorial') }>Tutorial Video</a> in the How To section.
                </p>
                <p>
                  <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0]}} onClick={ () => this.handleChange('tutorial') }>Join</a> our community of <span style={{ fontWeight: 800 }}>{welcomeStatistics ? welcomeStatistics.user : "..."}</span> members to add and edit data, earn points, ask questions about history articles and access our <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0]}} onClick={ () => this.handleChange('tutorial') }>Forums</a> to suggest new features and report bugs.
                </p>
                <p>Visit the <a className='customLink' style={{ fontWeight: 800, color: themes[theme].highlightColors[0]}} onClick={ () => this.handleChange('about') }>About</a> section to read more about the Chronas project and how to contact the developers.</p>
                { welcomeStatistics && <div style={{ position: 'absolute',
                  bottom: 18,
                  fontSize: 'small' }}>build {welcomeStatistics.build} - v{welcomeStatistics.version}</div> }
              </div>
            </Tab>
            <Tab label='How To' value='tutorial'>
              <br />
              <div>
                <br />
                <h4>Watch 30 sec intro video</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height={600}
                    videoId='5mJliez-Jlw'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
                <br />
                <h4>Watch 3 min in depth video</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height='600px'
                    videoId='5mJliez-Jlw'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
              </div>
            </Tab>
            <Tab label='About' value='about'>
              <br />
              <div>
                <br />
                <p>Chronas is an initiative to collect all military history contributed and edited by volunteers - amateur and professional historians from all corners of the world. We return the entered facts
                  to all Internet users in visualizations, i.e. on digital maps of witch the world map you see is an example, as an on-line encyclopedia for history enthusiasts and - in time - as an analysis tool and discussion forum for history experts.</p>
                <p>We aim to support the largest and most active community of history enthusiasts in the world. Register as a volunteer and add your military history to our knowledge base as an editor, validate and correct the
                  registered facts and moderate on-line discussions as an expert. Help us perfect our concepts, our data and our website. If your want to join our community, <a href="/login">sign up!</a></p>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                    In development by Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab>
            <Tab label='Statistics' value='statistics'>
              <br />
              <div>
                <br />
                { statistics && <div className='user_stats'>
                  <h4 style={{  }}>Map Datapoints</h4>
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
                      <ul style={{ listStyle: 'none'}}>
                        { statisticsBreakdown.markerBreakdown.children.map(el => <li><span style={{fontWeight: 'bolder'}}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap { ...chartProps} data={statisticsBreakdown.markerBreakdown} /> }
                  </div>
                  <div>
                    <div style={{ float: 'right' }}><h4>Media Breakdown</h4>
                      <ul style={{ listStyle: 'none'}}>
                        { statisticsBreakdown.markerBreakdown.children.map(el => <li><span style={{fontWeight: 'bolder'}}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap { ...chartProps} data={statisticsBreakdown.mediaBreakdown} /> }
                  </div>
                  <div>
                    <div style={{ float: 'right' }}><h4>Users By Auth Type</h4>
                      <ul style={{ listStyle: 'none'}}>
                        { statisticsBreakdown.userBreakdown.children.map(el => <li><span style={{fontWeight: 'bolder'}}>{el.size}</span>: {el.title}</li>) }
                      </ul>
                    </div>
                    { <Treemap { ...chartProps} data={statisticsBreakdown.userBreakdown} /> }
                  </div>
                </div> }
                { !statistics && <div style={{ marginBottom: '15%' }}><LoadingCircle theme={theme} title={translate('pos.loading')} /></div>}
              </div>
            </Tab>
            <Tab label='Rules' value='rules'>
              <br />
              <div className=''>
                <br />
                <h4>The Rules For Data Curation</h4>
                <ol>
                  <li><i>No Vandalism</i>: This is not the place to paint an alternative history map. Vandalism hurts the project immensely (costly backups) and will get you banned.</li>
                  <li><i>Watch the tutorial videos</i> before you start editing. Some controls may lead to <i>unwanted</i> results.</li>
                  <li>Your data inputs should be based on <i>accepted history</i> and you should be ready to cite sources if asked.</li>
                  <li><i>Report</i> Users That Break those Rules.</li>
                </ol>
                <br />
                <h4>The Rules For The Forums</h4>
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
            {/*<Tab label='Terms of Use' value='impressum'>
              <br />
              <div>
                <p>Impressum here</p>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                  In development by Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab>*/}
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
