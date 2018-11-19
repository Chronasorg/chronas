import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import {cyan500} from 'material-ui/styles/colors';
import UndoIcon from 'material-ui/svg-icons/content/undo';
import RedoIcon from 'material-ui/svg-icons/content/redo';
import {
  crudUpdate as crudUpdateAction,
} from './actionReducers'

export class RevertButton extends Component {
  constructor(props) {
    super(props);
  }

  getBasePath() {
    const { location } = this.props;
    return location.pathname
      .split('/')
      .slice(0, -1)
      .join('/');
  }

  save = (redirect) => {
    const { basePath = '/resources/revisions', record = {}, isRedo = false } = this.props;
    console.debug(record, this.props)
    this.props.crudUpdate(
      this.props.resource,
      record.id,
      record,
      record,
      basePath,
      'list'
    );
  };

  componentWillReceiveProps(nextProps) {
    console.debug(nextProps,this.props.data)
    /*
    if (this.props.data !== nextProps.data) {
      this.setState({ record: nextProps.data }); // FIXME: erases user entry when fetch response arrives late
      if (this.fullRefresh) {
        this.fullRefresh = false;
        this.setState({ key: this.state.key + 1 });
      }
    }
    if (
      this.props.id !== nextProps.id ||
      nextProps.version !== this.props.version
    ) {
      this.updateData(nextProps.resource, nextProps.id);
    }
    */
  }

  render() {
    const { record = {} } = this.props;
    return <IconButton
      tooltip={record["reverted"] ? "Redo This Edit" : "Revert This Edit"}
      tooltipPosition='center-right'
      onClick={this.save}
      style={{ overflow: 'visible', left: -10 }}>
      {record["reverted"] ? <RedoIcon color={cyan500} /> : <UndoIcon color={cyan500} />}
        </IconButton>
  }
}

const enhance = compose(
  connect(null, {
    crudUpdate: crudUpdateAction,
  }),
);

export default enhance(RevertButton);
