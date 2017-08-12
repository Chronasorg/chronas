import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from '../content/actions'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import {render} from 'react-dom'
import {fromJS} from 'immutable'
import MapGL, {Popup} from 'react-map-gl'
import {json as requestJson} from 'd3-request'
import {defaultMapStyle, provincesLayer, provincesHighlightedLayer, highlightLayerIndex, basemapLayerIndex} from './map-style.js'
import {updatePercentiles} from './utils'
import fakeRestServer from '../../dummyRest/restServer'
import ControlPanel from './control-panel'

class Map extends Component {

  state = {
    mapStyle: defaultMapStyle,
    year: 2015,
    data: null,
    viewport: {
      latitude: 38.88,
      longitude: -98,
      zoom: 3,
      minZoom: 2,
      bearing: 0,
      pitch: 0,
      width: 500,
      height: 500
    },
    hoverInfo: null
  };

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();

    this.restoreFetch = fakeRestServer();
    fetch('http://fakeapi/provinces')
      .then(res => res.text())
      .then(res => this._loadData(JSON.parse(res)));
  }

  componentWillReceiveProps(prevProps, prevState) {
    const newMapStyle = this.state.mapStyle.setIn(['layers', basemapLayerIndex, 'source'], prevProps.basemap)

    this.setState({
      mapStyle: newMapStyle,
    });

    // if drawer changed
    this._resize();

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {

    const marginLeft = (this.props.menuDrawerOpen) ? 100 : 0
    const marginRight =(this.props.menuDrawerOpen) ? 100 : 0

    this.setState({
      viewport: {
        ...this.state.viewport,
        width: (this.props.width || window.innerWidth) - (marginLeft + marginRight),
        height: this.props.height || window.innerHeight
      }
    });
  };

  _loadData = data => {

    // updatePercentiles(data, f => f.properties.income[this.state.year]);

    let mapStyle = defaultMapStyle
    // Add geojson source to map
      .setIn(['sources', 'incomeByState'], fromJS({type: 'geojson', data}))
      // Add default province fill
      .set('layers', defaultMapStyle.get('layers').push(provincesLayer));

    mapStyle = mapStyle
      // Add highlighted province fill
      .set('layers', mapStyle.get('layers').push(provincesHighlightedLayer));

    this.setState({data, mapStyle});
  };

  _onViewportChange = viewport => this.setState({viewport});

  _updateSettings = (name, value) => {
    if (name === 'year') {
      this.setState({year: value});

      const {data, mapStyle} = this.state;
      if (data) {
        // updatePercentiles(data, f => f.properties.income[value]);
        const newMapStyle = mapStyle.setIn(['sources', 'incomeByState', 'data'], fromJS(data));
        this.setState({mapStyle: newMapStyle});
      }
    }
  };

  _onHover = event => {
    let countyName = '';
    let hoverInfo = null;

    const county = event.features && event.features.find(f => f.layer.id === 'provinces');
    if (county) {
      hoverInfo = {
        lngLat: event.lngLat,
        county: county.properties
      };
      countyName = county.properties.name;
    }

    this.setState({
      hoverInfo
    });

  };

  _onClick = event => {
    let countyName = '';
    let hoverInfo = null;

    const county = event.features && event.features.find(f => f.layer.id === 'provinces');
    if (county) {
      hoverInfo = {
        lngLat: event.lngLat,
        county: county.properties
      };
      countyName = county.properties.name;
    }

    this.props.toggleRightDrawer()
  };

  _renderPopup() {
    const {hoverInfo} = this.state;
    if (hoverInfo) {
      return (
        <Popup longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]} closeButton={false}>
          <div className="county-info">{JSON.stringify(hoverInfo)}</div>
        </Popup>
      );
    }
    return null;
  }

  _renderTooltip() {
    const {hoveredFeature, year, x, y} = this.state;

    return hoveredFeature && (
        <div className="tooltip" style={{left: x, top: y}}>
          <div>State: {hoveredFeature.properties.name}</div>
          <div>Median Household Income: {hoveredFeature.properties.value}</div>
          <div>Percentile: {hoveredFeature.properties.percentile / 8 * 100}</div>
        </div>
      );
  }

  render() {
    const {viewport, mapStyle} = this.state;
    console.debug("menuDrawerOpen: this.state this.props",this.state, this.props)

    return (
      <div style={{
        marginLeft: (this.props.menuDrawerOpen) ? '100px' : '0px',
        marginRight: (this.props.menuDrawerOpen) ? '100px' : '0px',
        transition: 'all 300ms'
      }}>
        <MapGL
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          onClick={this._onClick}
        >

          {this._renderPopup()}
        </MapGL>

        <ControlPanel containerComponent={this.props.containerComponent}
                      settings={this.state} onChange={this._updateSettings} />
      </div>
    );
  }

}

Map.propTypes = {
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuTap: PropTypes.func,
  // resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
};

Map.defaultProps = {
  onMenuTap: () => null,
};

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    basemap: state.basemap,
    menuDrawerOpen: state.menuDrawerOpen,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
  }),
  pure,
  translate,
);

export default enhance(Map);
