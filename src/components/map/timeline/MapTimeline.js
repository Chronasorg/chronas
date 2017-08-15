import React, {Component} from 'react'
import { connect } from 'react-redux'
import {render} from 'react-dom'
import compose from 'recompose/compose'
// import { toggleRightDrawer as toggleRightDrawerAction } from '../content/actions'

import Timeline from 'react-visjs-timeline'

import './mapTimeline.scss'

class MapTimeline extends Component {

  state = {
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
  }

  componentDidMount() {
  }

  componentWillReceiveProps(prevProps, prevState) {
    // const newMapStyle = this.state.mapStyle.setIn(['layers', basemapLayerIndex, 'source'], prevProps.basemap)
    //
    // this.setState({
    //   mapStyle: newMapStyle,
    // });
    //
    // // if year changed
    // this._resize();
  }

  _onClickTimeline = event => {
    console.debug("_onClickTimeline", event.time);
    this.setState({year: event.time})
  };

  _onRangeChangeTimeline = event => {
    console.debug(event);
  };

  render() {
    const {viewport, mapStyle} = this.state;

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    const timelineOptions = {
      options: {
        width: '100%',
        height: '100px',
        zoomMin: 315360000000,
        // timeAxis: {scale: 'year', step: 1},
        max: '2017-01-01',
        min: '-002000-01-01T00:00:00.000Z',
        stack: false,
        showCurrentTime: false
        // showMajorLabels: false
      },
      customTimes: {
        selectedYear: this.state.year
      }
    }

    return (
      <Timeline
        {...timelineOptions}
        clickHandler={this._onClickTimeline}
        rangeChangeHandler={this._onRangeChangeTimeline}
      />
    );
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
  }), {
    // toggleRightDrawer: toggleRightDrawerAction,
  })
);

export default enhance(MapTimeline);
