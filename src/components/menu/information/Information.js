import React, { PureComponent } from 'react'
import ReactHtmlParser from 'react-html-parser'
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
import { Tab, Tabs } from 'material-ui/Tabs'
import { LoadingCircle } from '../../global/LoadingCircle'
import { Card, CardHeader } from 'material-ui/Card'
import {
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
  ReferenceManyField,
  Restricted,
  TabbedForm,
  TextInput,
  translate,
} from 'admin-on-rest'

import { markerIdNameArray, properties, themes } from '../../../properties'
import axios from 'axios/index'

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
          console.error(err)
          this.props.showNotification('somethingWentWrong')
        })
      this.setState({
        emailAddress: '',
        emailSubject: '',
        emailHtml: ''
      })
    }
  }
  handleChange = (value) => {
    const { translate } = this.props
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
          const userBreakdown = {
            children: statistics.data.user.map(el => {
              return {
                title: (el._id || 'v0 Chronas').toUpperCase(),
                hex: socialColors[el._id],
                size: el.count
              }
            }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size)
          }

          const markerBreakdown = {
            children: statistics.data.marker.map(el => {
              const foundEl = markerIdNameArray.find(m => m[0] === el._id)
              if (foundEl) {
                const toTranslate = "pos.markerIdNameArray." + foundEl[1]
                return {
                  title: translate(toTranslate),
                  hex: foundEl[4],
                  size: el.count
                }
              }
            }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size)
          }

          const mediaBreakdown = {
            children: statistics.data.metadataI.map(el => {
              const foundEl = properties.linkedTypes.find(m => m.id === el._id)
              if (foundEl) {
                return {
                  title: translate("pos.linkedTypes." + el._id),
                  hex: foundEl.color,
                  size: el.count
                }
              }
            }).filter(el => typeof el !== 'undefined').sort((a, b) => b.size - a.size)
          }

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
          welcomeStatistics.lastDataEdit = Moment(welcomeStatistics.lastDataEdit).from(Moment())

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
          welcomeStatistics.lastDataEdit = Moment(welcomeStatistics.lastDataEdit).from(Moment())

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

  constructor (props) {
    super(props)
    this.state = {
      emailAddress: '',
      emailSubject: '',
      emailHtml: '',
      tabForm: props.activeTab || localStorage.getItem('chs_info_section') || 'welcome',
      hiddenElement: true,
      statistics: false,
      welcomeStatistics: false,
      prevValue: false,
      statisticsBreakdown: false
    }
  }

  render () {
    const { translate, theme, history } = this.props
    const { statistics, welcomeStatistics, statisticsBreakdown, tabForm } = this.state
    const highlightColorStyle = { color: themes[theme].highlightColors[0] }
    const statItem = (title, value, tooltip, tooltipPosition) => {
      return <div className='FeedBox_container'>
        <div className='FeedBox_header'>
          <span className='FeedBox_title'>{title}</span>
        </div>
        <div className='FeedBox_discussionsSmall'>
          {tooltip && <IconButton style={{ margin: '-10px 0px -18px', top: -38, left: 12 }} tooltip={tooltip} touch
            tooltipPosition={tooltipPosition}>
            <IconHelp />
          </IconButton>}
          <h3>{value}</h3>
        </div>
      </div>
    }

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
      getColor: (d) => {
        return d.hex
      },
      style: {
        stroke: '#ddd',
        strokeOpacity: 0.3,
        strokeWidth: 2,

      },
      hideRootNode: true,
    }

    return (
      <Dialog bodyStyle={{
        maxHeight: 800,
        background: themes[theme].backColors[0] /* backgroundImage: themes[theme].gradientColors[0] */
      }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal modalMenu'}
        titleStyle={{ overflow: 'auto' }} overlayStyle={{ overflow: 'auto' }} style={{ overflow: 'auto' }}
        contentStyle={{
        transform: '',
        transition: 'opacity 1s',
        opacity: 0,
        height: 680,
        maxHeight: 800,
        minWidth: 900,
        maxWidth: '1024px'
      }} onRequestClose={this.handleClose}>
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
            contentContainerStyle={{ maxHeight: 800 }}
            tabTemplateStyle={{ maxHeight: 801 }}
            value={tabForm}
            onChange={this.handleChange}
          >
            <Tab label={translate('pos.info.tabs.welcome')} value='welcome'>
              <br />
              <div className='modal-header'>
                <h4 className='modal-title' style={{ fontSize: 33, margin: '0 auto' }}>{translate('pos.info.welcomeTo')} <ChronasLogo height={50}
                  vheight={360}
                  width={160}
                  vwidth={1000}
                  color={themes[theme].foreColors[0]}
                  style={{
                    marginLeft: -22,
                    marginTop: -9
                  }} />
                  <span className='modal-title' style={{
                  fontSize: 20,
                  fontWeight: 200,
                  top: 36,
                  marginLeft: -16,
                  position: 'absolute'
                }}>BETA</span></h4>
              </div>
              <br />
              <div style={{
                background: 'url(/images/compass.jpg) center bottom no-repeat #f9f9f9',
                backgroundColor: themes[theme].backColors[0],
                minHeight: 512,
                marginBottom: -40
              }}>
                <p>
                  { ReactHtmlParser(translate('pos.block.welcome11')) }
                  <a className='customLink' style={highlightColorStyle} onClick={() => this.handleChange('statistics')}>{translate('pos.block.welcome12')}</a>
                  { ReactHtmlParser(translate('pos.block.welcome13')) }
                </p>
                <p>
                  { translate('pos.block.welcome21') }
                  <a className='customLink' style={highlightColorStyle} onClick={() => this.handleChange('tutorial')}>{translate('pos.block.welcome22')}</a>
                  { translate('pos.block.welcome23') }
                </p>
                <p>
                  <a className='customLink' style={highlightColorStyle}
                    onClick={() => history.push('/login')}>{translate('pos.block.welcome31')}</a>
                  { ReactHtmlParser(translate('pos.block.welcome32', { dontTranslate: welcomeStatistics ? welcomeStatistics.user : '...' })) }
                  <a
                    className='customLink' style={highlightColorStyle}
                    onClick={() => history.push('/community/general')}>{ translate('pos.block.welcome33') }</a>
                  { translate('pos.block.welcome34') }
                </p>
                <p>
                  { translate('pos.block.welcome41') }<a className='customLink'
                  style={highlightColorStyle}
                  onClick={() => this.handleChange('about')}>
                  { translate('pos.block.welcome42') }</a>
                  { translate('pos.block.welcome43') }<a
                    className='customLink' style={highlightColorStyle}
                    onClick={() => this.handleChange('contact')}>
                  { translate('pos.block.welcome44') }</a>
                  { translate('pos.block.welcome45') }</p>
                <p>
                  { ReactHtmlParser(translate('pos.block.welcome51')) }
                  <a
                    className='customLink' style={highlightColorStyle}
                    onClick={() => this.handleChange('pro')}>
                    { translate('pos.block.welcome52') }</a>
                  { translate('pos.block.welcome53') }</p>
                <div style={{
                  zIndex: 2,
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 50%)',
                  bottom: 0,
                  right: 0,
                  width: 400,
                  height: 200,
                  position: 'absolute'
                }} />
                <div className='nofocus' style={{
                  position: 'absolute',
                  bottom: 36,
                  zIndex: 4,
                  right: 0,
                  fontSize: 'small'
                }}>
                  <div className='signup-button'><a href={'https://twitter.com/Chronasorg'} target={'_blank'}
                    title='Chronas on Twitter'
                    className='btn btn-link-twitter btn-block'><i
                      className='fa fa-twitter-square' /><span className=''>  {translate('pos.info.followUs')} Twitter</span></a></div>
                </div>
                <div className='nofocus' style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 0,
                  zIndex: 4,
                  fontSize: 'small'
                }}>
                  <div className='signup-button'><a href={'https://www.facebook.com/chronasorg'} target={'_blank'}
                    title='Chronas on Facebook'
                    className='btn btn-link-facebook btn-block'><i
                      className='fa fa-facebook-square' /><span className=''>  {translate('pos.info.followUs')} Facebook</span></a></div>
                </div>
                {welcomeStatistics && <div style={{
                  position: 'absolute',
                  bottom: 34,
                  fontSize: 'small'
                }}>build {welcomeStatistics.build} - v{welcomeStatistics.version}</div>}
                {welcomeStatistics && <div style={{
                  position: 'absolute',
                  bottom: 18,
                  fontSize: 'small'
                }}>{translate('pos.info.lastDataEdit')} {welcomeStatistics.lastDataEdit}</div>}
              </div>
            </Tab>
            <Tab label={translate('pos.info.tabs.howTo')} value='tutorial'>
              <br />
              <div>
                <br />
                <h4>{ translate('pos.block.howTo1') }</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height={600}
                    videoId='Ah3qSNJpj4Q'
                    opts={properties.YOUTUBEOPTS}
                  />
                </p>
                <br />
                <h4>{ translate('pos.block.howTo2') }</h4>
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
            <Tab label={translate('pos.info.tabs.about')} value='about'>
              <br />
              <div>
                <br />
                { ReactHtmlParser(translate('pos.block.about1')) }

                <p>{ ReactHtmlParser(translate('pos.block.about2')) }<a className='customLink' style={highlightColorStyle} onClick={() => this.handleChange('tutorial')}>{translate('pos.block.about3')}</a>.</p>
                { ReactHtmlParser(translate('pos.block.about4')) }
                <p>
                  <YouTube
                    className='introVideo'
                    height={400}
                    videoId='0yqcCK66Az4'
                    opts={properties.YOUTUBEOPTS}
                  />
                </p>
                { ReactHtmlParser(translate('pos.block.about5')) }
                <Divider />
                <br />
                <p>
                  <b>World Physical map tiles</b> by <a
                    href='https://www.arcgis.com/home/item.html?id=6cec161c9acc4b9abf97f6b7d65801b3'>ArcGIS Online /
                  ESRI</a>, under <a href='https://www.esri.com/en-us/legal/terms/full-master-agreement'>Esri Master
                  License Agreement</a>. Data by <a href='https://www.usa.gov/federal-agencies/national-park-service'>U.S.
                  National Park Service</a>.
                </p>
                <p>
                  <b>Watercolor map tiles</b> by <a href='http://stamen.com'>Stamen Design</a>, under <a
                    href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a
                      href='http://openstreetmap.org'>OpenStreetMap</a>, under <a
                        href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.
                </p>
                <p>
                  <a className='customLink' style={highlightColorStyle}
                    onClick={() => history.push('/tos')}>{ translate('pos.termsOfService')}</a>
                  <a className='customLink'
                    style={{ paddingLeft: 16, fontWeight: 800, color: themes[theme].highlightColors[0] }}
                    onClick={() => history.push('/privacy')}>{ translate('pos.privacyPolicy') }</a>
                </p>
              </div>
            </Tab>
            <Tab label={translate('pos.info.tabs.statistics')} value='statistics'>
              <br />
              <div>
                <br />
                <p><i>{translate('pos.block.statistics1')}</i></p>
                <br />
                {statistics && <div className='user_stats'>
                  <h4 style={{}}>{translate('pos.block.statistics2')}</h4>
                  {statItem(translate('pos.statistics.area'), statistics.area.areaDatapoints, translate('pos.block.statisticsTooltip1'), 'bottom-right')}
                  {statItem(translate('pos.statistics.markers'), statistics.markerTotal, translate('pos.block.statisticsTooltip2'), 'bottom-right')}
                  {statItem(translate('pos.statistics.media'), statistics.metadataTotal, translate('pos.block.statisticsTooltip3'), 'bottom-left')}
                  {statItem(translate('pos.statistics.entities'), statistics.metadataEntityCount, translate('pos.block.statisticsTooltip4'), 'bottom-left')}
                  <h4>{translate('pos.block.statistics3')}</h4>
                  {statItem(translate('pos.statistics.users'), statistics.userTotal, translate('pos.block.statisticsTooltip5'), 'bottom-right')}
                  {statItem(translate('pos.statistics.edits'), statistics.revisionTotal, translate('pos.block.statisticsTooltip6'), 'bottom-right')}
                  {statItem(translate('pos.statistics.threads'), statistics.threadsTotal, translate('pos.block.statisticsTooltip7'), 'bottom-left')}
                  {statItem(translate('pos.statistics.replies'), statistics.commentsTotal, translate('pos.block.statisticsTooltip8'), 'bottom-left')}
                  <br />
                  <hr />
                  <h4 style={{ marginBottom: '1em' }}>{translate('pos.block.statistics6')}</h4>
                  <div>
                    <div style={{ float: 'right', maxHeight: 40 }}><h4>{translate('pos.block.statistics4')}</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {statisticsBreakdown.markerBreakdown.children.map(el => <li><span
                          style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>)}
                      </ul>
                    </div>
                    {<Treemap {...chartProps} data={statisticsBreakdown.markerBreakdown} />}
                  </div>
                  <div>
                    <div style={{ float: 'right', maxHeight: 40 }}><h4>{translate('pos.block.statistics7')}</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {statisticsBreakdown.mediaBreakdown.children.map(el => <li><span
                          style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>)}
                      </ul>
                    </div>
                    {<Treemap {...chartProps} data={statisticsBreakdown.mediaBreakdown} />}
                  </div>
                  <div>
                    <div style={{ float: 'right', maxHeight: 40 }}><h4>{translate('pos.block.statistics8')}</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {statisticsBreakdown.userBreakdown.children.map(el => <li><span
                          style={{ fontWeight: 'bolder' }}>{el.size}</span>: {el.title}</li>)}
                      </ul>
                    </div>
                    {<Treemap {...chartProps} data={statisticsBreakdown.userBreakdown} />}
                  </div>
                </div>}
                {!statistics &&
                <div style={{ marginBottom: '15%' }}><LoadingCircle theme={theme} title={translate('pos.loading')} />
                </div>}
              </div>
            </Tab>
            <Tab label={translate('pos.info.tabs.rules')} value='rules'>
              <br />
              { ReactHtmlParser(translate('pos.block.rules1')) }
              <br />
            </Tab>
            <Tab label={translate('pos.info.tabs.support')} style={highlightColorStyle} value='pro'>
              <br />
              <div>
                <br />
                <h4>{translate('pos.info.tabs.support')}</h4>
                <p>
                  { ReactHtmlParser(translate('pos.block.support1')) }
                </p>
                <p>
                  { ReactHtmlParser(translate('pos.block.support2')) }
                   <a className='customLink' target='_blank' href='https://www.patreon.com/chronas'><Avatar
                  style={{ marginRight: 8, marginLeft: 6 }} src='/images/240px-Patreon_logo.svg.png' />
                  Patreon</a>
                  { ReactHtmlParser(translate('pos.block.support3')) }
                </p>
                <p>
                  <form className="donateButton" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                    <span>{translate('pos.block.support4')}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <input type="hidden" name="cmd" value="_s-xclick"/>
                    <input type="hidden" name="hosted_button_id" value="DLRUFHZSBTBNN"/>
                    <input type="image" src="/images/button-PayPal.png" style={{ "height": 34 }} border="0" name="submit" alt="Donate with PayPal" title="Donate with PayPal" /><img alt="" border="0" src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif" width="1" height="1"/>
                  </form>
                </p>
                <br />
                <Divider />
                <br />
                <h4>{translate('pos.block.support5')}</h4>
                <p>
                  {translate('pos.block.support6')}
                  <a className='customLink' style={highlightColorStyle} onClick={() => history.push('/community/features')}>{translate('pos.block.support7')}</a>{translate('pos.block.support8')}<a
                  className='customLink' style={highlightColorStyle}
                  onClick={() => this.handleChange('contact')}>{translate('pos.block.support9')}</a>{translate('pos.block.support10')}</p>
                <br />
                <Divider />
                <br />
                <p>
                  {translate('pos.block.support11')}
                  <a className='customLink'
                    style={highlightColorStyle}
                    onClick={() => this.handleChange('contact')}>{translate('pos.block.support12')}</a>{translate('pos.block.support13')}.
                </p>
              </div>
              <br />
            </Tab>
            <Tab label={translate('pos.info.tabs.contact')} value='contact'>
              <br />
              <div className=''>
                <br />
                <h4>{translate('pos.block.contact1')}</h4>
                <Card>
                  <CardHeader
                    title={translate('pos.block.contact2')}
                    subtitle='Dietmar Aumann'
                    avatar={<div style={{ float: 'left' }}><Avatar
                      src='/images/dev_da.jpg'
                      size={48}
                    /><IconButton style={{ cursor: 'help', position: 'absolute', right: 10, top: 12 }}
                      tooltip={'dietmar.aumann [at] gmail.com'} touch tooltipPosition={'center-left'}>
                      <IconEmail />
                    </IconButton></div>}
                    showExpandableButton={false}
                    expandable={false}
                  />
                </Card>
                <Card>
                  <CardHeader
                    title={translate('pos.block.contact3')}
                    subtitle='Joachim Aumann'
                    avatar={<div style={{ float: 'left' }}><Avatar
                      src='/images/dev_ja.jpeg'
                      size={48}
                    /><IconButton style={{ cursor: 'help', position: 'absolute', right: 10, top: 12 }}
                      tooltip={'aumann.joachim [at] gmail.com'} touch tooltipPosition={'center-left'}>
                      <IconEmail />
                    </IconButton></div>}
                    showExpandableButton={false}
                    expandable={false}
                  />
                </Card>
                <br />
                <p>
                  {translate('pos.block.contact4')} Dietmar Aumann (German), ..</p>
                <br />
                <h4>{translate('pos.block.contact5')}</h4>
                <p>{translate('pos.block.contact6')}</p>
                <Paper zDepth={2}>
                  <TextField hintText={translate('pos.block.contact7')} style={styles.form} underlineShow={false}
                    value={this.state.emailAddress}
                    onChange={(e) => this.setState({ emailAddress: e.target.value })}
                  />
                  <Divider />
                  <TextField hintText={translate('pos.block.contact8')} style={styles.form} underlineShow={false}
                    value={this.state.emailSubject}
                    onChange={(e) => this.setState({ emailSubject: e.target.value })}
                  />
                  <Divider />
                  <TextField
                    style={styles.form}
                    hintText={translate('pos.block.contact9')}
                    underlineShow={false}
                    multiLine
                    rows={4}
                    value={this.state.emailHtml} onChange={(e) => this.setState({ emailHtml: e.target.value })}
                  />
                  <Divider />
                  <br />
                  <RaisedButton label={translate('pos.block.contact10')} style={styles.form} onClick={this.sendContactEmail} />
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
          </Tabs>
        </Card>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps, {})(translate(Information))
