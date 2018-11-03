import React from 'react'
import PropTypes from 'prop-types'
import Snackbar from 'material-ui/Snackbar'
import { connect } from 'react-redux'
import { hideNotification as hideNotificationAction, translate } from 'admin-on-rest'
import { themes } from '../../properties'

class Notification extends React.Component {
  handleRequestClose = () => {
    this.props.hideNotification()
  };

  render() {
    const style = {}
    const { type, translate, theme, message, doTranslate = true } = this.props
    const primary1Color = themes[theme].foreColors[0]
    const primary2Color = themes[theme].backColors[0]
    const accent1Color = themes[theme].highlightColors[0]

    style.backgroundColor = primary2Color
    style.color = primary1Color
    if (type === 'warning') {
      style.backgroundColor = accent1Color
    }
    if (type === 'confirm') {
      style.color = primary2Color
      style.backgroundColor = primary1Color
    }
    return (
      <Snackbar
        open={!!message}
        message={!!message && (doTranslate ? translate(message) : message)}
        autoHideDuration={4000}
        onRequestClose={this.handleRequestClose}
        bodyStyle={{ ...style,
          maxWidth: '100%',
        }}
        contentStyle={style}
        style={{ ...style,
          boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 45px, rgba(0, 0, 0, 0.22) 0px 10px 18px',
          maxWidth: '70%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      />
    );
  }
}

Notification.propTypes = {
  message: PropTypes.string,
  theme: PropTypes.object,
  doTranslate: PropTypes.bool,
  type: PropTypes.string.isRequired,
  hideNotification: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

Notification.defaultProps = {
  type: 'info',
};

Notification.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  message: state.admin.notification.text,
  type: state.admin.notification.type,
  theme: state.theme
});

export default translate(
  connect(mapStateToProps, {
    hideNotification: hideNotificationAction
  })(Notification)
)
