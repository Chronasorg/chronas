import React from 'react'
import { connect } from "react-redux"
import ReactDOM from 'react-dom'
import { deselectItem, selectEpicItem, selectMarkerItem, setAutoplay } from "../actionReducers"
import { translate } from "admin-on-rest"
import { setSuggestedYear, setYear } from "./actionReducers"
import compose from 'recompose/compose'
import ArrowUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up'

let yearTimeout

class TimelineSelectedYear extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      emergencyLeft: false,
      suggestedYearState: false
    }
  }
  componentDidUpdate () {
    // setTimeout(() => {
    if (this.isLocked === true) return
      const timelineElement = document.getElementsByClassName('body')[0]
      const yearElement = document.getElementsByClassName('currentYearLabel')[0]
      if (timelineElement && yearElement) {
        const availableWidth = timelineElement.offsetWidth
        const { left, width } = yearElement.getBoundingClientRect()
        let leftWidth = availableWidth - left - width
        if (this.state.emergencyLeft) leftWidth = leftWidth - 80
        const emergencyLeft = leftWidth < 140
    // eslint-disable-next-line react/no-did-update-set-state
        if (this.state.emergencyLeft !== emergencyLeft) {
          this.isLocked = true
          this.setState({ emergencyLeft })
          setTimeout(() => {
            this.isLocked = false
          }, 400)
        }
      }
    // }, 400)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.suggestedYear !== nextProps.suggestedYear) {
      this.setState({ suggestedYearState: nextProps.suggestedYear })
      if (yearTimeout) {
        clearTimeout(yearTimeout)
        yearTimeout = false
      }
      yearTimeout = setTimeout(() => { this.setState({ suggestedYearState: false }) }, 1000)
    }
  }

  render() {
    const { emergencyLeft, suggestedYearState } = this.state
    const { _toggleYearDialog, selectedYear, suggestedYear } = this.props
    return <button
      className='currentYearLabel'
      title='click to select exact year'
      onClick={(event) => {
        event.stopPropagation()
        _toggleYearDialog(true)
      }}
      style={{
        right: emergencyLeft ? '4px' : ''
      }}>
      { <div style={{
        transition: '1s',
        opacity: (suggestedYearState !== false) ? 1 : 0,
        position: 'fixed',
        marginTop: '-36px',

      }}>
        <ArrowUpIcon color='rgb(255,255,255)' style={{
          height: '32px',
          width: '32px',
          position: 'absolute',
          top: '5px',
          left: '-6px',
        }} />
        <span style={{
          fontSize: '18px',
          position: 'absolute',
          left: '0px',
          top: '-8px'
        }}>
          { suggestedYear }
        </span>
      </div> }

      { selectedYear }
    </button>
  }
}

const enhance = compose(
  connect(state => ({
    suggestedYear: state.suggestedYear,
  }), {
  }),
  translate
)

export default enhance(TimelineSelectedYear)
