import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
// import { saveAs } from 'file-saver'
import Checkbox from 'material-ui/Checkbox'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'
import IconPlay from 'material-ui/svg-icons/av/play-arrow'
import IconStop from 'material-ui/svg-icons/av/pause-circle-filled'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconSearch from 'material-ui/svg-icons/action/search'
import IconGif from 'material-ui/svg-icons/action/gif'
import IconAnimation from 'material-ui/svg-icons/image/slideshow'
import IconButton from 'material-ui/IconButton'
import IconArrowUp from 'material-ui/svg-icons/navigation/expand-less'
import IconArrowDown from 'material-ui/svg-icons/navigation/expand-more'
import IconReset from 'material-ui/svg-icons/av/replay'
import IconCamera from 'material-ui/svg-icons/image/camera'
import TextField from 'material-ui/TextField'
import Paper from 'material-ui/Paper'
import { List, ListItem } from 'material-ui/List'
import SearchEpicAutocomplete from '../../overwrites/SearchEpicAutocomplete'
import PortalYear from './PortalYear'
import TimelineSelectedYear from './TimelineSelectedYear'
import { setYear, setSuggestedYear } from './actionReducers'
import { selectEpicItem, selectMarkerItem, deselectItem, setAutoplay, TYPE_AUTOPLAY, TYPE_EPIC } from '../actionReducers'
import TimelinePlus from './TimelinePlus'
import './mapTimeline.scss'
import { red400 } from 'material-ui/styles/colors'
import { themes } from '../../../properties'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { translate } from 'admin-on-rest'

const start = '-000550-01-05',
  min = '-002500-01-01T00:00:00.000Z',
  max = '2500-01-01'

const SMALLTIMELINEHEIGHT = 120
const BIGTIMELINEHEIGHT = 400

const timelineGroups = [{
  id: 1,
  content: 'Wars',
  title: 'EpicS',
  className: 'timelineGroup_wars',
  subgroupStack: false,
}]

const styles = {
  addButton: {
    zIndex: 15000,
    marginTop: '3em',
    marginRight: '3em'
  },
  buttonContainer: {
    width: 70,
    height: 50,
    /* margin-top: -315px; */
    position: 'relative',
    right: 0,
    bottom: 290,
    pointerEvents: 'all'
  },
  closeButton: {
    boxShadow: 'inherit',
    zIndex: 15000,
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,.7)) drop-shadow(0 1px 2px rgba(0,0,0,.3))',
    marginTop: '1em',
    marginRight: '1em'
  },
  listItems: {
    paddingTop: 0,
    paddingBottom: 0
  },
  imageDialog: {
    width: '100%',
    maxWidth: 'none',
  },
  iconButton: { filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))' },
  upArrow: { padding: 0, right: 11, top: -4, position: 'absolute' },
  downArrow: { padding: 0, right: 11, top: 24, position: 'absolute' },
  editButton: { right: 60, top: 1, position: 'absolute' },
  sourceButton: { right: 110, top: 1, position: 'absolute', padding: 0 },
  scoreLabel: {
    width: 38,
    height: 20,
    right: 0,
    top: 14,
    color: 'white',
    position: 'absolute',
    fontSize: 12,
    textAlign: 'center',
    filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))'
  },
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
  discoverDialogStyle: {
    width: '100%',
    // maxWidth: 'none',
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    // display: 'flex',
    // '-ms-flex-direction': 'row',
    // '-webkit-flex-direction': 'row',
    // 'flex-direction': 'row',
    //   '-ms-flex-wrap': 'wrap',
    // '-webkit-flex-wrap': 'wrap',
    // 'flex-wrap': 'wrap',
    maxWidth: '100%',
    backgroundColor: 'transparent'
    // margin-left:auto,margin-right:auto,position:absolute,top:0,right:0,bottom:0,left:0
  },
  overlayStyle: {
    background: 'rgba(0,0,0,.8)',
    pointerEvents: 'none'
  },
  toolbarTitleStyle: {
    pointerEvents: 'none',
    color: 'white',
    textShadow: '1px 1px 1px black',
    zIndex: 15000,
    padding: '1em',
    position: 'fixed',
    left: 64,
    right: 0,
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    overflowY: 'auto',
    maxWidth: '1024px',
    margin: '0 auto'
  },
  subtitle: {
    fontSize: '16px',
    // paddingLeft: '28px',
    // paddingRight: '28px',
    fontWeight: '400',
    lineHeight: '24px',
    color: '#bcbcbc',
    transition: 'all .5s ease',
    bottom: '20px',
    left: '30px',
    paddingRight: '2em',
    pointerEvents: 'none'

  },
  title: {
    pointerEvents: 'none',
    // padding: '36px 28px 0 28px',
    lineHeight: '32px',
    fontWeight: 300,
    color: '#fff',
    fontSize: '24px',
    bottom: '50px',
    position: 'absolute',
    left: '30px',
  },
  selectedIMG: {
    height: 'auto',
    /* transform: translateY(-50%); */
    position: 'relative',
    left: 0,
    width: '100%',
  },
  selectedImageButtonContainer: {
    marginTop: '2.85em'
  },
  buttonOpenArticle: {
    // float: 'left',
    backgroundColor: 'transparent',
    paddingRight: '1em',
    width: 'inherit',
    height: 'inherit',
  },
  selectedImageContent: {
    alignItems: 'flex-start',
    margin: '0 0 0 10%',
    padding: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    maxWidth: '32em',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    bottom: '10%'
  },
  selectedImageTitle: {
    fontWeight: 400,
    fontSize: '3.125em',
    margin: '.4em 0',
    lineHeight: '1.3',
    textAlign: 'left',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    textShadow: '1px 1px 1px black',
    padding: 0
  },
  selectedImageDescription: {
    textShadow: '1px 1px 1px black',
    textAlign: 'left',
    fontSize: '1em',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.87)',
    lineHeight: 1.5,
    margin: 0,
  },
  buttonExpand: {
    // width: '60px',
    position: 'fixed',
    bottom: 0,
    left: 4, // 'calc(50% - 30px)',
    zIndex: 10,
  }
}

let freeToChange = true

class MapTimeline extends Component {

  constructor (props) {
    super(props)
    this._onClickTimeline = this._onClickTimeline.bind(this)

    this.state = {
      animation: [1, 2000, 25, true, 1],
      customTimes: {
        selectedYear: new Date(new Date(0, 1, 1).setFullYear(+this.props.selectedYear)).toISOString()
      },
      epicSearchOptions: [],
      isReset: true,
      inputYear: '',
      showSubMenu: false,
      showNextYear: true,
      timelineHeight: SMALLTIMELINEHEIGHT,
      timelineOptions: {
        width: '100%',
        zoomMin: 315360000000,
        min: min,
        max: max,
        start: start,
        stack: false, // true
        // stackSubgroups: true,
        showCurrentTime: false
        // showMajorLabels: false
      },
      year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
      groups: [{
        id: 1,
        content: 'Epics',
      }],
      nextYear: '',
      yearDialogVisible: false,
    }
  }

  _onClickTimeline = (event) => {
    const { selectEpicItem, selectMarkerItem, groupItems, setYear, history } = this.props

    if (event.event.target.className === 'currentYearLabel') {
      // open input
      return
    }
    const currentDate = event.time
    const clickedYear = new Date(currentDate).getFullYear()
    const selectedItemId = event.item

    if (selectedItemId) {
      const selectedItem = groupItems.find((el) => el.id === selectedItemId)
      const selectedItemDate = selectedItem.start.getFullYear()

      if (selectedItem.subtype === 'ei' || selectedItem.subtype === 'ps') {
        selectMarkerItem(selectedItem.wiki, selectedItem)
        setYear(selectedItem.start.getFullYear())
      } else {
        let s = new Date(selectedItem.start)
        let e = new Date(selectedItem.end)
        s.setFullYear(s.getFullYear() - 100)
        e.setFullYear(e.getFullYear() + 100)
        this._flyTo(s, e, false, selectedItemId)

        selectEpicItem(selectedItem.wiki, selectedItemDate || +clickedYear, selectedItem.id)
      }
      // utilsQuery.updateQueryStringParameter('type', TYPE_EPIC)
      // utilsQuery.updateQueryStringParameter('value', selectedItem.wiki)

      history.push('/article')
    } else {
      setYear(clickedYear)
      const selectedYear = event.time.getFullYear()
      if (selectedYear < 2001 && selectedYear > -2001) {
        this.setState({
          customTimes: {
            selectedYear: new Date(new Date(0, 1, 1).setFullYear(selectedYear)).toISOString()
          }
        })
      }
    }
  };
  componentWillReceiveProps = (nextProps) => {
    const { selectedItemType, groupItems, selectedYear } = this.props
    const { customTimes } = this.state

    if (nextProps.selectedItemType !== selectedItemType && selectedItemType === TYPE_EPIC) {
      this.refs.timeline.$el.setSelection()
    }

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear && new Date(customTimes.selectedYear).getFullYear() !== nextProps.selectedYear) {
      this.setState({
        customTimes: {
          selectedYear: new Date(new Date(0, 1, 1).setFullYear(nextProps.selectedYear)).toISOString()
        }
      })
    }

    if (groupItems.length !== nextProps.groupItems) {
      this.setState({
        epicSearchOptions: nextProps.groupItems.map(el => {
          return {
            value: el.id,
            text: el.wiki.replace(/_/g, ' ') + ' (' + el.start.getFullYear() + ')',
            wiki: el.wiki,
            start: el.start,
            end: el.end
          }
        })
      })
    }
  }
  _toggleTimelineHeight = () => {
    const { timelineHeight, timelineOptions } = this.state
    // timelineOptions.start = '500-01-01'
    // timelineOptions.end = '510-01-01'

    if (timelineHeight !== SMALLTIMELINEHEIGHT) {
      timelineOptions.stack = false
      this.setState({
        timelineHeight: SMALLTIMELINEHEIGHT,
        timelineOptions
      })
    } else {
      timelineOptions.stack = true
      this.setState({
        timelineHeight: BIGTIMELINEHEIGHT,
        timelineOptions
      })
    }
    this.forceUpdate()
  }
  _toggleYearDialog = (isVisible = true) => {
    this.setState({ yearDialogVisible: isVisible })
    this.forceUpdate()
  }
  _flyTo = (s, e, doReset, optId) => {
    if (isNaN(new Date(e).getFullYear())) return
    if (optId) {
      setTimeout(() => {
        this.refs.timeline.$el.setSelection(optId)
      }, 2000)
    }
    setTimeout(() => {
      this.refs.timeline.$el.setWindow(s, e)
      setTimeout(() => {
        this.setState({ isReset: doReset })
      }, 1000)
    }, 10)
    // this.refs.timeline.$el.setWindow('1050-04-01', '2050-04-01')
  }
  componentDidMount () {
    // Hack for issue https://github.com/Lighthouse-io/react-visjs-timeline/issues/40
    ReactDOM.findDOMNode(this).children[1].style.visibility = 'visible'
    ReactDOM.findDOMNode(this).children[1].style.width = '100%'

    // http://localhost:4040/v1/metadata?type=e&end=10000&subtype=war add wars

    let timelineOptions = this.state.timelineOptions
    delete timelineOptions.start
    this.setState({ timelineOptions })

    setTimeout(() => {
      this.setState({ timelineHeight: SMALLTIMELINEHEIGHT })
      this.forceUpdate()
    }, 1000)
    // this.props.ready();
  }

  shouldComponentUpdate (nextProps) {
    // return false;
    if (nextProps.groupItems.length !== this.props.groupItems.length || nextProps.selectedYear !== this.props.selectedYear) {
      return true
    } else return false
  }

  render () {
    const { customTimes, timelineOptions, timelineHeight, nextYear, yearDialogVisible, isReset, showSubMenu, epicSearchOptions, animation, showNextYear } = this.state
    const { groupItems, history, deselectItem, selectedYear, selectMarkerItem, selectedItemType, selectEpicItem, setAutoplay, setYear, theme, translate } = this.props
    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228
    return (
      <div className={timelineHeight === BIGTIMELINEHEIGHT ? 'extendedTimeline' : ''}>
        <Dialog open={yearDialogVisible}
          autoDetectWindowHeight={false}
          modal={false}
          // onRequestClose={this.handleClose}
          contentClassName={(!yearDialogVisible) ? '' : 'classReveal dialogBackgroundHack'}
          contentStyle={styles.discoverDialogStyle}
          bodyStyle={{ backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          overlayStyle={styles.overlayStyle}
          style={{ backgroundColor: 'transparent', overflow: 'auto' }}
          titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
          autoScrollBodyContent={false}>
          <div className='searchForm search-form-kettle'>
            <button className='searchForm__close' onClick={() => this._toggleYearDialog(false)}>
              <IconClose color='rgb(255,255,255)' style={{
                height: '48px',
                width: '48px'
              }} />
            </button>
            <form onSubmit={(e, val) => {
              e.preventDefault()
              setYear(this.state.inputYear)
              this._toggleYearDialog(false)
            }} className='searchForm__form'>
              <button type='submit' className='searchForm__icon'>
                <IconSearch color='rgb(255,255,255)' style={{
                  height: '32px',
                  width: '32px',
                  marginLeft: '2em'
                }} />
              </button>
              <input className='searchForm__input mt_color--white' placeholder={translate('influence.year')} autoComplete='off' title={translate('pos.search')}
                type='number' min='-2000' max='2000' step='1' name='y'
                onChange={(e) => this.setState({ inputYear: +e.target.value })} />
            </form>
          </div>
        </Dialog>

        <IconButton
          key={'expand'}
          style={{
            zIndex: 1,
            width: 48,
            height: 48,
            bottom: 52,
            left: 64,
            position: 'fixed'
          }}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.timeline.expand')}
          tooltipStyles={tooltip}
          onClick={() => this._toggleTimelineHeight()}
          iconStyle={{ color: themes[theme].foreColors[0], background: themes[theme].backColors[0], borderRadius: '50%' }}
        >
          {(timelineHeight === SMALLTIMELINEHEIGHT) ? <IconArrowUp hoverColor={themes[theme].highlightColors[0]} />
            : <IconArrowDown hoverColor={themes[theme].highlightColors[0]} />}
        </IconButton>

        <IconButton
          key={'reset'}
          style={{
            zIndex: 1,
            width: 48,
            height: 48,
            bottom: 24,
            left: 64,
            position: 'fixed'
          }}
          disabled={isReset}
          className={'mapTimelineIcons'}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.timeline.reset')}
          tooltipStyles={tooltip}
          onClick={() => {
            this._flyTo(start, '2050-04-01', true)
          }}
          iconStyle={{
            color: themes[theme].foreColors[0],
            background: themes[theme].backColors[0],
            borderRadius: '50%',
            padding: 2
          }}
        >
          <IconReset hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>
        <div className={'searchEpicContainer'}>
          <IconButton
            key={'search'}
            style={{
              zIndex: 1,
              width: 48,
              height: 48,
              bottom: 80,
              left: 64,
              position: 'fixed'
            }}
            className={'mapTimelineIcons'}
            tooltipPosition='bottom-right'
            tooltip={translate('pos.timeline.searchEpics')}
            tooltipStyles={tooltip}
            onClick={() => {
              this.setState({ showSubMenu: (this.state.showSubMenu !== 'showEpicSearch') ? 'showEpicSearch' : false })
              this.forceUpdate()
            }}
            iconStyle={{
              color: themes[theme].foreColors[0],
              background: themes[theme].backColors[0],
              borderRadius: '50%',
              padding: 2
            }}
          >
            <IconSearch hoverColor={themes[theme].highlightColors[0]} />
          </IconButton>
          {(showSubMenu === 'showEpicSearch') && <SearchEpicAutocomplete
            key={'searchInput'}
            // targetOrigin={'top'}
            hintText={translate('pos.timeline.searchEpics')}
            maxSearchResults={200}
            onNewRequest={(val) => {
              if (val.subtype === 'ei') {
                selectMarkerItem(val.wiki, val)
              } else {
                selectEpicItem(val.wiki, val.start.getFullYear(), val.value)
              }
              selectEpicItem(val.wiki, val.start.getFullYear(), val.value)
              this.setState({ showSubMenu: false })
              history.push('/article')
              let s = new Date(val.start)
              let e = new Date(val.end)
              s.setFullYear(s.getFullYear() - 100)
              e.setFullYear(e.getFullYear() + 100)

              this._flyTo(s, e, false, val.value)
              this.forceUpdate()
            }}
            filter={SearchEpicAutocomplete.caseInsensitiveFilter}
            dataSource={epicSearchOptions}
            textFieldStyle={{
              borderRadius: 14,
              paddingLeft: 12,
              height: 26,
              overflow: 'hidden',
              backgroundColor: themes[theme].backColors[0],
              foreColor: themes[theme].foreColors[0]
            }}
            style={{
              zIndex: 1,
              width: 48,
              height: 48,
              bottom: 69,
              left: 105,
              position: 'fixed'
            }}
          />}
        </div>
        <div className={'screenshotAnimation'}>
          <IconButton
            key={'screenshotAnimation'}
            style={{
              zIndex: 1,
              width: 48,
              height: 48,
              bottom: (selectedItemType === TYPE_AUTOPLAY) ? 135 : 109,
              left: 64,
              position: 'fixed'
            }}
            className={'mapTimelineIcons'}
            tooltipPosition='bottom-right'
            tooltip={(selectedItemType === TYPE_AUTOPLAY) ? translate('pos.timeline.stopAutoplay') : translate('pos.timeline.openAutoplayMenu')}
            tooltipStyles={tooltip}
            onClick={() => {
              if ((selectedItemType === TYPE_AUTOPLAY)) {
                deselectItem()
                this.setState({ showSubMenu: false })
              } else {
                this.setState({ showSubMenu: (this.state.showSubMenu !== 'showAnimation') ? 'showAnimation' : false })
              }
              this.forceUpdate()
            }}
            iconStyle={{
              color: themes[theme].foreColors[0],
              background: themes[theme].backColors[0],
              borderRadius: '50%',
              padding: (selectedItemType === TYPE_AUTOPLAY) ? 0 : 2,
              width: (selectedItemType === TYPE_AUTOPLAY) ? 48 : 24,
              height: (selectedItemType === TYPE_AUTOPLAY) ? 48 : 24
            }}
          >
            {(selectedItemType === TYPE_AUTOPLAY) ? <IconStop color={themes[theme].highlightColors[0]} /> : <IconAnimation hoverColor={themes[theme].highlightColors[0]} />}
          </IconButton>
          {(showSubMenu === 'showAnimation') && <Paper style={{
            zIndex: 1,
            // width: 280,
            // height: 380,
            bottom: 118,
            left: 105,
            width: 330,
            position: 'fixed',
            display: 'inline-block',
            // margin: '16px 32px 16px 0',
          }}>
            <List autoWidth>
              {/* <ListItem */}
              {/* primaryText="Take Screenshot" */}
              {/* rightIcon={<IconCamera />} */}
              {/* onClick={() => { */}
              {/* // html2canvas(document.querySelector(".body > div")).then(canvas => { */}
              {/* const canvas = document.querySelector(".mapboxgl-canvas") */}

              {/* canvas.toBlob(function(blob) { */}
              {/* saveAs(blob, "chronas-" + selectedYear + ".png"); */}
              {/* }); */}
              {/* // */}
              {/* // const img = canvas.toDataURL('image/png').replace(/^data:image\/[^;]+/, 'data:application/octet-stream') */}
              {/* // window.open(img) */}
              {/* // window.location.href = img */}
              {/* // const a = document.createElement('a'); */}
              {/* // document.body.appendChild(a); */}
              {/* // a.download = "chronas.png"; */}
              {/* // a.href =  canvas.toDataURL(); */}
              {/* // a.click(); */}
              {/* // }); */}
              {/* }} */}
              {/* /> */}
              {/* <Divider /> */}
              <ListItem
                primaryText={translate('pos.timeline.autoplay')}
                secondaryText={translate('pos.timeline.autoplaySubtitle')}
                disabled
                />
              <ListItem
                innerDivStyle={{ ...styles.listItems }}
                primaryText={<TextField
                  type='number'
                  defaultValue={animation[0]}
                  onChange={(e, val) => {
                    console.debug(val)
                    const { animation } = this.state
                    animation[0] = +val
                    this.setState({ animation })
                  }}
                  min={-2000}
                  max={2000}
                  step={1}
                  floatingLabelText={translate('resources.markers.fields.capitalStart')}
                  style={{ width: 'calc(50% - 2px)', float: 'left', zIndex: 10, marginRight: 4 }}
                />} />
              <ListItem
                innerDivStyle={styles.listItems}
                primaryText={<TextField
                  type='number'
                  defaultValue={animation[1]}
                  onChange={(e, val) => {
                    const { animation } = this.state
                    animation[1] = +val
                    this.setState({ animation })
                  }}
                  min={-2000}
                  max={2000}
                  step={1}
                  floatingLabelText={translate('resources.markers.fields.capitalEnd')}
                  style={{ width: 'calc(50% - 2px)' }}
                />} />
              <ListItem
                innerDivStyle={styles.listItems}
                primaryText={<TextField
                  type='number'
                  defaultValue={animation[2]}
                  onChange={(e, val) => {
                      const { animation } = this.state
                      animation[2] = +val
                      this.setState({ animation })
                    }}
                  min={1}
                  max={4000}
                  step={1}
                  floatingLabelText={translate('pos.timeline.stepSize')}
                  style={{ width: 'calc(50% - 2px)', float: 'left', zIndex: 10, marginRight: 4 }}
                  />} />
              <ListItem
                innerDivStyle={styles.listItems}
                primaryText={<TextField
                  type='number'
                  defaultValue={animation[4]}
                  onChange={(e, val) => {
                      const { animation } = this.state
                      animation[4] = +val
                      this.setState({ animation })
                    }}
                  min={0.1}
                  max={100}
                  step={0.1}
                  floatingLabelText={translate('pos.timeline.delay')}
                  style={{ width: 'calc(50% - 2px)' }}
                  />} />
              <ListItem
                innerDivStyle={{ ...styles.listItems, paddingTop: 4, zIndex: 11 }}
                onClick={() => {
                    const { animation } = this.state
                    animation[3] = !animation[3]
                    this.setState({ animation })
                    this.forceUpdate()
                  }}
                primaryText={<Checkbox
                    // onCheck={() => {
                    //   const { animation } = this.state
                    //   animation[3] = !animation[3]
                    //   this.setState({ animation })
                    // }}
                  checked={animation[3]}
                  label={translate('pos.timeline.repeat')}
                  />} />
              {/* <ListItem leftIcon={<Checkbox */}
              {/* />} secondaryText="Generate GIF" rightIcon={<IconGif />} /> */}
              <ListItem primaryText={translate('pos.timeline.startSlideshow')} rightIcon={<IconPlay />}
                onClick={() => {
                  setAutoplay(this.state.animation)
                  this.setState({ showSubMenu: false })
                  this.forceUpdate()
                }} />
            </List>
            </Paper>}
        </div>
        <TimelinePlus
          ref='timeline'
          options={{ ...timelineOptions, height: timelineHeight }}
          groups={timelineGroups}
          items={groupItems}
          customTimes={customTimes}
          // selectHandler={(items) => {
          //   const toFind = items.items[0]
          //   // console.debug(toFind,this.props.groupItems[0].id)
          //   const selectedItem = this.props.groupItems.find((el) => el.id === toFind)
          //   if (selectedItem) {
          //     let s = new Date(selectedItem.start)
          //     let e = new Date(selectedItem.end)
          //     s.setFullYear(s.getFullYear() - 100)
          //     e.setFullYear(e.getFullYear() + 100)
          //     this._flyTo(s, e, false, toFind)
          //   }
          // }}
          rangechangeHandler={() => {
            if (freeToChange) freeToChange = false
          }}
          rangechangedHandler={() => {
            if (isReset) this.setState({ isReset: false })
            setTimeout(() => {
              freeToChange = true
            }, 200)
          }}
          clickHandler={(event) => {
            if (freeToChange) this._onClickTimeline(event)
          }}
          mouseMoveHandler={(event) => {
            const { suggestedYear, selectedYear } = this.props
            const nextYear = new Date(event.time).getFullYear()
            if (+suggestedYear !== nextYear && selectedYear !== nextYear) {
              this.props.setSuggestedYear(+nextYear)
            }
          }}
        />
        <PortalYear node={document && document.querySelector('.vis-custom-time.selectedYear')}>
          <TimelineSelectedYear
            _toggleYearDialog={this._toggleYearDialog}
            selectedYear={selectedYear}
          />
        </PortalYear>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    selectedItemType: (state.selectedItem || {}).type,
    selectedYear: state.selectedYear,
    suggestedYear: state.suggestedYear,
  }), {
    setYear,
    setSuggestedYear,
    setAutoplay,
    deselectItem,
    selectEpicItem,
    selectMarkerItem
  }),
  translate
)

export default enhance(MapTimeline)
