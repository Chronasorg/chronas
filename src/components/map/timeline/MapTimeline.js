import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { render } from 'react-dom'
import compose from 'recompose/compose'
import update from 'react/lib/update'
import FlatButton from 'material-ui/FlatButton'
import IconArrowUp from 'material-ui/svg-icons/navigation/expand-less'
import IconArrowDown from 'material-ui/svg-icons/navigation/expand-more'
import { setYear as setYearAction } from './actionReducers'
import { selectEpicItem } from '../actionReducers'

import Timeline from 'react-visjs-timeline'
import './mapTimeline.scss'
import {chronasMainColor} from "../../../styles/chronasColors";

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
      timelineHeight: 120,
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
  }

  _onClickTimeline = (event) => {
    const { selectEpicItem, groupItems, setYear } = this.props

    const currentDate = event.time
    const clickedYear = new Date(currentDate).getFullYear()
    const selectedItemId = event.item

    if (selectedItemId) {
      const selectedItem = groupItems.filter(el => el.id === selectedItemId)[0]
      const selectedItemDate = selectedItem.start.getFullYear()
      selectEpicItem(selectedItem.wiki, selectedItemDate || +clickedYear)
    } else {
      setYear(clickedYear)
    }

    this.setState({
      customTimes: {
        selectedYear: event.time
      }
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

  render () {
    const { timelineOptions, timelineHeight, customTimes } = this.state
    const { groupItems } = this.props

    console.debug("rendering maptimeline")

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    return (
      <div>
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
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    selectedYear: state.selectedYear,
  }), {
    setYear: setYearAction,
    selectEpicItem
  })
)

export default enhance(MapTimeline)
