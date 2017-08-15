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
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from '../content/actions'
import { setItemId as setItemIdAction } from './actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import {render} from 'react-dom'
import {fromJS} from 'immutable'
import MapGL, {Marker, Popup} from 'react-map-gl'
import {json as requestJson} from 'd3-request'
import {defaultMapStyle, provincesLayer, markerLayer, clusterLayer, markerCountLayer, provincesHighlightedLayer, highlightLayerIndex, basemapLayerIndex} from './mapStyles/map-style.js'
import {updatePercentiles} from './utils'
import fakeRestServer from '../../dummyRest/restServer'
import Timeline from './timeline/MapTimeline'

import BasicInfo from './markers/basic-info'
import BasicPin from './markers/basic-pin'


class Map extends Component {

  state = {
    mapStyle: defaultMapStyle,
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
    data: null,
    viewport: {
      latitude: 0.88,
      longitude: -0,
      zoom: 1,
      minZoom: 2,
      bearing: 0,
      pitch: 0,
      width: 500,
      height: 500
    },
    hoverInfo: null,
    popupInfo: null
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();

    this.restoreFetch = fakeRestServer();


    window.addEventListener('load', function(){

      fetch('http://fakeapi/provinces')
        .then(res => res.text())
        .then(res => this._loadGeoJson(
          fromJS({
            type: 'geojson',
            data: JSON.parse(res)
          }),
          'provinces',
          [provincesLayer]));

      fetch('http://fakeapi/markersExample')
        .then(res => res.text())
        .then(res => this._loadGeoJson(
          fromJS({
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50),
            type: 'geojson',
            data: JSON.parse(res)
          }),
          'markers',
          [markerLayer, clusterLayer, markerCountLayer]));

    }.bind(this));
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
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || (window.innerWidth - 56),
        height: (this.props.height || window.innerHeight) - 38
      }
    });
  };

  _loadGeoJson = (sourceData, sourceId, layers) => {
    // updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
    // Add source
      .setIn(['sources', sourceId], sourceData)
    // /fromJS({
        // cluster: true,
        // clusterMaxZoom: 14, // Max zoom to cluster points on
        // clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50),
        // type: 'geojson', data}))
      // Add layer
      .set('layers', prevMapStyle.get('layers').concat(layers));
      /*
       mapStyle = mapStyle
       // Add highlighted province fill
       .set('layers', mapStyle.get('layers').push(provincesHighlightedLayer));
       */
      //data, m
      this.setState({mapStyle});

  };


  _loadMarkerData = data => {
    data.features.map((markerData, iter) => (
      this._renderBasicMarker(markerData, iter)
    ))
  };

  _renderBasicMarker = (markerData, index) => {
    return (
      <Marker key={`marker-${index}`}
              longitude={markerData.geometry.coordinates[0]}
              latitude={markerData.geometry.coordinates[1]}>
        <BasicPin size={20} onClick={() => this.setState({popupInfo: markerData.properties})} />
      </Marker>
    );
  }

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
    let itemName = '';
    let itemId = '';

    const item = event.features && event.features.find(f => f.layer.id === 'provinces');
    if (item) {
      itemName = item.properties.name;
      itemId = item.properties.wikiUrl;
    }

    console.debug(event)

    this.props.setRightDrawerVisibility(itemName !== '')
    this.props.setItemId(itemId)
  };

  _renderPopup() {
    const {hoverInfo, popupInfo} = this.state;
    if (hoverInfo) {
      return (
        <Popup longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]} closeButton={false}>
          <div className="county-info">{JSON.stringify(hoverInfo)}</div>
        </Popup>
      );
    }
    if (popupInfo) {
      return (
        <Popup tipSize={5}
               anchor="top"
               longitude={popupInfo.longitude}
               latitude={popupInfo.latitude}
               onClose={() => this.setState({popupInfo: null})} >
          <BasicInfo info={popupInfo} />
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

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    return (
      <div style={{
        left: leftOffset,
        position: 'absolute',
        top: 0,
        width: 'calc(100% - 56px)',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), right 300ms cubic-bezier(0.4, 0, 0.2, 1)'
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
        <Timeline/>
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
    selectedItem: state.selectedItem,
    menuDrawerOpen: state.menuDrawerOpen,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    setRightDrawerVisibility: setRightDrawerVisibilityAction,
    setItemId: setItemIdAction
  }),
  pure,
  translate,
);

export default enhance(Map);
