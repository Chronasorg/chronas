import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import IconButton from 'material-ui/IconButton'
import { cyan500 } from 'material-ui/styles/colors'
import OpenNewIcon from 'material-ui/svg-icons/action/open-in-new'

export class OpenFullUrlButton extends Component {
  goToUrl = (redirect) => {
    const { record = {} } = this.props
    window.open(decodeURIComponent(record.fullUrl), '_blank').focus()
  };

  render () {
    const { record = {} } = this.props
    return <IconButton
      tooltip={'Go to URL'}
      tooltipPosition='center-right'
      onClick={this.goToUrl}
      style={{ overflow: 'visible', left: -10 }}>
      {<OpenNewIcon color={cyan500} />}
    </IconButton>
  }
}

const enhance = compose(
  connect(null, {
  }),
)

export default enhance(OpenFullUrlButton)
