import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import IconButton from 'material-ui/IconButton'
import { cyan500 } from 'material-ui/styles/colors'
import UndoIcon from 'material-ui/svg-icons/navigation/check'
import RedoIcon from 'material-ui/svg-icons/content/redo'
import { crudUpdate, } from './actionReducers'

export class ResolvedButton extends Component {
  save = (redirect) => {
    const { basePath = '/resources/flags', record = {}, isRedo = false } = this.props
    this.props.crudUpdate(
      this.props.resource,
      encodeURIComponent(record.fullUrl),
      record,
      record,
      basePath,
      'list'
    )
  }

  render () {
    const { record = {} } = this.props
    return <IconButton
      tooltip={record['fixed'] ? 'Unresolve' : 'Resolve'}
      tooltipPosition='center-right'
      onClick={this.save}
      style={{ overflow: 'visible', left: -10 }}>
      {record['fixed'] ? <RedoIcon color={cyan500} /> : <UndoIcon color={cyan500} />}
    </IconButton>
  }
}

const enhance = compose(
  connect(null, {
    crudUpdate,
  }),
)

export default enhance(ResolvedButton)
