import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { render } from 'react-dom'
import compose from 'recompose/compose'
import update from 'react/lib/update'
import { setYear as setYearAction } from './actionReducers'

import Timeline from 'react-visjs-timeline'

import './mapTimeline.scss'

const start = '0000-01-01',
  min = '-002000-01-01T00:00:00.000Z',
  max = '2017-01-01'

class MapTimeline extends Component {
  constructor (props) {
    super(props)

    this.state = {
      timelineOptions: {
        width: '100%',
        height: '100px',
        zoomMin: 315360000000,
        min: min,
        max: max,
        start: start,
        stack: false,
        showCurrentTime: false
          // showMajorLabels: false
      },
      customTimes: {
        selectedYear: new Date(new Date().setYear(this.props.selectedYear)).toISOString()
      },
      year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
    }
  }

  componentDidMount () {
    // Hack for issue https://github.com/Lighthouse-io/react-visjs-timeline/issues/40
    ReactDOM.findDOMNode(this).children[0].style.visibility = 'visible'
    ReactDOM.findDOMNode(this).children[0].style.width = '100%'

    let timelineOptions = this.state.timelineOptions
    delete timelineOptions.start

    this.setState({ timelineOptions })
  }

  _onClickTimeline = event => {
    const currentDate = event.time
    console.debug('_onClickTimeline currentYear', currentDate)
    // this.setState({year: event.time})

    this.props.setYear(new Date(currentDate).getFullYear())
    this.setState({
      customTimes: {
        selectedYear: currentDate
      }
    })
  };

  _onRangeChangeTimeline = event => {
    console.debug(event)
  };

  render () {
    const { timelineOptions, customTimes } = this.state

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    return (
      <Timeline
        options={timelineOptions}
        customTimes={customTimes}
        clickHandler={this._onClickTimeline}
        rangeChangeHandler={this._onRangeChangeTimeline}
      />
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    selectedYear: state.selectedYear,
  }), {
    setYear: setYearAction,
  })
)

export default enhance(MapTimeline)
