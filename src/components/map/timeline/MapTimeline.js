import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Portal } from 'react-portal'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Dialog from 'material-ui/Dialog'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconSearch from 'material-ui/svg-icons/action/search'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import IconArrowUp from 'material-ui/svg-icons/navigation/expand-less'
import IconArrowDown from 'material-ui/svg-icons/navigation/expand-more'
import { setYear } from './actionReducers'
import { selectEpicItem, TYPE_EPIC } from '../actionReducers'
import Timeline from 'react-visjs-timeline'
import './mapTimeline.scss'
import { chronasMainColor } from '../../../styles/chronasColors'
import {red400} from "material-ui/styles/colors";
import utilsQuery from "../utils/query";

const start = '-000200-01-05',
  min = '-002000-01-01T00:00:00.000Z',
  max = '2017-01-01'

const SMALLTIMELINEHEIGHT = 120
const BIGTIMELINEHEIGHT = 400

const timelineGroups = [{
  id: 1,
  content: 'Wars',
  title: 'EpicS',
  className: 'timelineGroup_wars',
  subgroupStack: false
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
    color: chronasMainColor,
    width: '60px',
    position: 'fixed',
    bottom: 0,
    left: 'calc(50% - 30px)',
    zIndex: 10,
  }
}

class MapTimeline extends Component {
  constructor (props) {
    super(props)
    this._onClickTimeline = this._onClickTimeline.bind(this)

    this.state = {
      yearDialogVisible: false,
      timelineHeight: 120,
      inputYear: '',
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
      customTimes: {
        selectedYear: new Date(new Date(0, 1, 1).setFullYear(+this.props.selectedYear)).toISOString()
      },
      year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
      groups: [{
        id: 1,
        content: 'Epics',
      }]
    }
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
    }, 1000)
    // this.props.ready();
  }

  _onClickTimeline = (event) => {
    const { selectEpicItem, groupItems, setYear } = this.props

    if (event.event.target.className === "currentYearLabel") {
      // open input
      return
    }
    const currentDate = event.time
    const clickedYear = new Date(currentDate).getFullYear()
    const selectedItemId = event.item

    if (selectedItemId) {
      const selectedItem = groupItems.filter(el => el.id === selectedItemId)[0]
      const selectedItemDate = selectedItem.start.getFullYear()
      selectEpicItem(selectedItem.wiki, selectedItemDate || +clickedYear)
      utilsQuery.updateQueryStringParameter('type', TYPE_EPIC)
      utilsQuery.updateQueryStringParameter('value', selectedItem.wiki)
    } else {
      setYear(clickedYear)
    }

    this.setState({
      customTimes: {
        selectedYear: event.time
      },
      // ready: false
    })
  };

  componentWillReceiveProps = (nextProps) => {
    const { groupItems, selectedYear, selectEpicItem } = this.props
    const { customTimes } = this.state

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear && new Date(customTimes.selectedYear).getFullYear() !== nextProps.selectedYear) {
      this.setState({
        customTimes: {
          selectedYear: new Date(new Date(0, 1, 1).setFullYear(nextProps.selectedYear)).toISOString()
        }
      })
    }
  }
  //
  // shouldComponentUpdate (nextProps) {
  //   return true
  //   // if (nextProps.groupItems.length > this.props.groupItems.length) {
  //   //   return true
  //   // }
  // }

  _toggleTimelineHeight = () => {
    const { timelineHeight, timelineOptions } = this.state
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
  }

  _toggleYearDialog = (isVisible) => this.setState({ yearDialogVisible: isVisible })

  render () {
    const { timelineOptions, timelineHeight, yearDialogVisible, customTimes } = this.state
    const { groupItems, selectedYear, setYear } = this.props

    console.debug("rendering maptimeline")

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    return (
      <div>
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
          <div className="searchForm search-form-kettle">
            <button className="searchForm__close" onClick={() => this._toggleYearDialog(false)}>
              <IconClose color='rgb(255,255,255)' style={{
                height: '48px',
                width: '48px'}} />
            </button>
            <form onSubmit={(e, val) => {
              e.preventDefault();
              setYear(this.state.inputYear);
              this._toggleYearDialog(false);
            }} className="searchForm__form">
              <button type="submit" className="searchForm__icon">
                <IconSearch color='rgb(255,255,255)' style={{
                  height: '32px',
                  width: '32px',
                  marginLeft: '2em'
                }} />
              </button>
              <input className="searchForm__input mt_color--white" placeholder="Year" autocomplete="off" title="search" type="number"  min="-2000" max="2000" step="1" name="y" onChange={(e) => this.setState({inputYear: +e.target.value})}></input>
            </form>
          </div>
        </Dialog>
        <FlatButton
          onClick={() => this._toggleTimelineHeight()} style={styles.buttonExpand}
          icon={(timelineHeight === SMALLTIMELINEHEIGHT) ? <IconArrowUp /> : <IconArrowDown />}
        />
        <Timeline
          options={{ ...timelineOptions, height: timelineHeight }}
          groups={timelineGroups}
          items={groupItems}
          customTimes={customTimes}
          clickHandler={this._onClickTimeline}
        />
        <Portal node={document && document.querySelector('.vis-custom-time.selectedYear')}>
          <button className='currentYearLabel' title='click to select exact year' onClick={(event) => { event.stopPropagation(); this._toggleYearDialog(true); } }>
            {selectedYear}
          </button>
        </Portal>
      </div>
    )
  }
}


const enhance = compose(
  connect(state => ({
    theme: state.theme,
    selectedYear: state.selectedYear,
  }), {
    setYear,
    selectEpicItem
  })
)

export default enhance(MapTimeline)
/*<form action="https://www-s.nationalgeographic.com/search" className="searchForm__form">
  <button type="submit" className="searchForm__icon">SEARCHICON</button>
  <input className="searchForm__input mt_color--white" placeholder="Search" autocomplete="off" title="search" type="text" name="q"></input>
</form>*/
