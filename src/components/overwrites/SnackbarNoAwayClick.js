import React, { Component } from 'react'
import PropTypes from 'prop-types'
import transitions from 'material-ui/styles/transitions'
import SnackbarBody from 'material-ui/Snackbar/SnackbarBody'

function getStyles (props, context, state) {
  const {
    muiTheme: {
      baseTheme: {
        spacing: {
          desktopSubheaderHeight,
        },
      },
      zIndex,
    },
  } = context

  const { open } = state

  const styles = {
    root: {
      position: 'fixed',
      left: '50%',
      display: 'flex',
      bottom: 0,
      zIndex: zIndex.snackbar,
      visibility: open ? 'visible' : 'hidden',
      transform: open
        ? 'translate(-50%, 0)'
        : `translate(-50%, ${desktopSubheaderHeight}px)`,
      transition: `${transitions.easeOut('400ms', 'transform')}, ${
        transitions.easeOut('400ms', 'visibility')}`,
    },
  }

  return styles
}

class Snackbar extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static reasons = {
    CLICKAWAY: 'clickaway',
    TIMEOUT: 'timeout'
  }
  componentClickAway = () => {
    if (this.timerTransitionId) {
      // If transitioning, don't close the snackbar.
      return
    }

    if (this.props.open !== null && this.props.onRequestClose) {
      this.props.onRequestClose(Snackbar.reasons.CLICKAWAY)
    } else {
      this.setState({ open: false })
    }
  };

  componentWillMount () {
    this.setState({
      open: this.props.open,
      message: this.props.message,
      action: this.props.action,
    })
  }

  componentDidMount () {
    if (this.state.open) {
      this.setAutoHideTimer()
      this.setTransitionTimer()
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.open && nextProps.open &&
      (nextProps.selectedYear !== this.props.selectedYear || nextProps.action !== this.props.action)) {
      this.setState({
        open: false,
      })

      clearTimeout(this.timerOneAtTheTimeId)
      this.timerOneAtTheTimeId = setTimeout(() => {
        this.setState({
          message: nextProps.message,
          action: nextProps.action,
          open: true,
        })
      }, 400)
    } else {
      const open = nextProps.open

      this.setState({
        open: open !== null ? open : this.state.open,
        message: nextProps.message,
        action: nextProps.action,
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.open !== this.state.open) {
      if (this.state.open) {
        this.setAutoHideTimer()
        this.setTransitionTimer()
      } else {
        clearTimeout(this.timerAutoHideId)
      }
    }
  }

  componentWillUnmount () {
    clearTimeout(this.timerAutoHideId)
    clearTimeout(this.timerTransitionId)
    clearTimeout(this.timerOneAtTheTimeId)
  }

  // Timer that controls delay before snackbar auto hides
  setAutoHideTimer () {
    const autoHideDuration = this.props.autoHideDuration

    if (autoHideDuration > 0) {
      clearTimeout(this.timerAutoHideId)
      this.timerAutoHideId = setTimeout(() => {
        if (this.props.open !== null && this.props.onRequestClose) {
          this.props.onRequestClose(Snackbar.reasons.TIMEOUT)
        } else {
          this.setState({ open: false })
        }
      }, autoHideDuration)
    }
  }

  // Timer that controls delay before click-away events are captured (based on when animation completes)
  setTransitionTimer () {
    this.timerTransitionId = setTimeout(() => {
      this.timerTransitionId = undefined
    }, 400)
  }

  render () {
    const {
      autoHideDuration, // eslint-disable-line no-unused-vars
      contentStyle,
      bodyStyle,
      message: messageProp, // eslint-disable-line no-unused-vars
      onRequestClose, // eslint-disable-line no-unused-vars
      onActionClick,
      style,
      ...other
    } = this.props

    const {
      action,
      message,
      open,
    } = this.state

    const { prepareStyles } = this.context.muiTheme
    const styles = getStyles(this.props, this.context, this.state)

    return (
      <div {...other} style={prepareStyles(Object.assign(styles.root, style))}>
        <SnackbarBody
          action={action}
          contentStyle={contentStyle}
          message={message}
          open={open}
          onActionClick={onActionClick}
          style={bodyStyle}
        />
      </div>
    )
  }
}

export default Snackbar
