import React from 'react'
import PropTypes from 'prop-types'
import Snackbar from 'material-ui/Snackbar'
import { connect } from 'react-redux'
import { hideNotification as hideNotificationAction, translate } from 'admin-on-rest'
import { themes } from '../../properties'

class Notification extends React.Component {
  handleRequestClose = () => {
  };

  render () {
  
    return (
      <div>test</div>
    )
  }
}

// Notification.propTypes = {
//   message: PropTypes.string,
//   theme: PropTypes.object,
//   doTranslate: PropTypes.bool,
//   type: PropTypes.string.isRequired,
//   hideNotification: PropTypes.func.isRequired,
//   translate: PropTypes.func.isRequired,
// }

Notification.defaultProps = {
  type: 'info',
}

Notification.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  message: state.admin.notification.text,
  type: state.admin.notification.type,
  theme: state.theme
})

export default translate(
  connect(mapStateToProps, {
    hideNotification: hideNotificationAction
  })(Notification)
)
