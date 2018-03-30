import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import {cyan500} from 'material-ui/styles/colors';
import ContentCreate from 'material-ui/svg-icons/content/create'
import { setModType as setModTypeAction, setModSelectActive as setModSelectActiveAction } from './actionReducers'
import { translate } from'admin-on-rest';

class ModButton extends Component {
  constructor(props) {
    super(props);
    this.handleModActive = this.handleModActive.bind(this);
  }

  componentWillUnmount() {
    const { setModType } = this.props
    setModType("")
  }

  handleModActive(event) {
    event.preventDefault();
    const { modActive, setModSelectActive } = this.props
    setModSelectActive(!modActive.selectActive)
  }

  render() {
    const { modActive, translate, modType } = this.props
    let modNote = ""
    if (modActive.type === "marker"){
      modNote = "Click on map to place marker"
    } else if (modActive.type === "areas"){
      modNote = "Select provinces to edit"
    }
    return (<div><RaisedButton
      label={translate((modType === "marker") ? 'resources.markers.place_marker' : 'resources.markers.place_area')}
      primary={(!modActive.selectActive)}
      secondary={(modActive.selectActive)}
      onClick={this.handleModActive}
    /><span style={{paddingLeft: '1em'}}>{modNote}</span></div>)
  }
}

ModButton.propTypes = {
    modType: PropTypes.string,
}

ModButton.defaultProps = {
    style: { padding: 0 },
}

function mapStateToProps(state, props) {
  return {
    modActive: state.modActive,
  }
}

export default translate(connect(
  mapStateToProps,
  {
    setModType: setModTypeAction,
    setModSelectActive: setModSelectActiveAction
  },
)(ModButton))
