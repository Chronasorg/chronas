import React, { Component } from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import axios from 'axios'
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from '../content/actionReducers'
import { setModData as setModDataAction, addModData as addModDataAction, removeModData as removeModDataAction } from './../restricted/shared/buttons/actionReducers'
import { TYPE_MARKER, selectAreaItem as selectAreaItemAction, selectMarkerItem as selectMarkerItemAction } from './actionReducers'
import { changeAreaData as changeAreaDataAction } from '../menu/layers/actionReducers'
import { fromJS } from 'immutable'
import MapGL, { Marker, Popup } from 'react-map-gl'
import properties from '../../properties'
import { defaultMapStyle, provincesLayer, markerLayer, clusterLayer, markerCountLayer, provincesHighlightedLayer, highlightLayerIndex, basemapLayerIndex, populationColorScale, areaColorLayerIndex } from './mapStyles/map-style.js'
import utilsMapping from './utils/mapping'
import utilsQuery from './utils/query'
import _ from 'lodash'

import Timeline from './timeline/MapTimeline'
import BasicInfo from './markers/basic-info'
import BasicPin from './markers/basic-pin'

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

class Map extends Component {
  state = {
    mapStyle: defaultMapStyle,
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
    data: null,
    viewport: {
      latitude: 30.88,
      longitude: 0,
      zoom: 2,
      minZoom: 2,
      bearing: 0,
      pitch: 0,
      width: 500,
      height: 500
    },
    hoverInfo: null,
    popupInfo: null
  }

  componentDidMount = () => {
    window.addEventListener('resize', this._resize)
    this._resize()
  }

  _initializeMap = () => {
    console.log('### initializing map')
    const { metadata } = this.props
    this._loadGeoJson('provinces', metadata.provinces)
    this._updateMetaMapStyle()

    fetch(properties.chronasApiHost + '/areas/' + this.props.selectedYear).then(response => response.json())
      .then((areaDefsRequest) => {
        this.props.changeAreaData(areaDefsRequest)
        this._simulateYearChange(areaDefsRequest)
        this._changeArea(areaDefsRequest, this.props.activeArea.label, this.props.activeArea.color)
      })
  }

  _updateMetaMapStyle = () => {
    console.log('### updating metadata mapstyles')
    const { metadata } = this.props

    var rulStops = [],
      relStops = [],
      relGenStops = [],
      culStops = []

    var rulKeys = Object.keys(metadata['ruler'])
    for (var i = 0; i < rulKeys.length; i++) {
      rulStops.push([rulKeys[i], metadata['ruler'][rulKeys[i]][1]])
    }

    var relKeys = Object.keys(metadata['religion'])
    for (var i = 0; i < relKeys.length; i++) {
      relStops.push([relKeys[i], metadata['religion'][relKeys[i]][1]])
    }

    var relGenKeys = Object.keys(metadata['religionGeneral'])
    for (var i = 0; i < relGenKeys.length; i++) {
      relGenStops.push([relGenKeys[i], metadata['religionGeneral'][relGenKeys[i]][1]])
    }

    var culKeys = Object.keys(metadata['culture'])
    for (var i = 0; i < culKeys.length; i++) {
      culStops.push([culKeys[i], metadata['culture'][culKeys[i]][1]])
    }

    const mapStyle = this.state.mapStyle
      .setIn(['layers', areaColorLayerIndex['ruler'], 'paint'], fromJS(
        {
          'fill-color': {
            'property': 'r',
            'type': 'categorical',
            'stops': rulStops,
            'default': 'rgba(1,1,1,0.3)'
          },
          'fill-opacity': 0.6,
          'fill-outline-color': 'rgba(0,0,0,.2)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['religion'], 'paint'], fromJS(
        {
          'fill-color': {
            'property': 'e',
            'type': 'categorical',
            'stops': relStops,
            'default': 'rgba(1,1,1,0.3)'
          },
          'fill-opacity': 0.6,
          'fill-outline-color': 'rgba(0,0,0,.2)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint'], fromJS(
        {
          'fill-color': {
            'property': 'g',
            'type': 'categorical',
            'stops': relGenStops,
            'default': 'rgba(1,1,1,0.3)'
          },
          'fill-opacity': 0.6,
          'fill-outline-color': 'rgba(0,0,0,.2)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['culture'], 'paint'], fromJS(
        {
          'fill-color': {
            'property': 'c',
            'type': 'categorical',
            'stops': culStops,
            'default': 'rgba(1,1,1,0.3)'
          },
          'fill-opacity': 0.6,
          'fill-outline-color': 'rgba(0,0,0,.2)'
        }
      ))

    this.setState({ mapStyle })
  }

  _changeArea = (areaDefs, newLabel, newColor) => {
    let mapStyle = this.state.mapStyle

    if (typeof newColor !== 'undefined') {
      for (let areaColorLayer of properties.areaColorLayers) {
        if (areaColorLayer !== newColor) {
          mapStyle = mapStyle
            .setIn(['layers', areaColorLayerIndex[areaColorLayer], 'layout', 'visibility'], 'none')
        } else {
          mapStyle = mapStyle
            .setIn(['layers', areaColorLayerIndex[areaColorLayer], 'layout', 'visibility'], 'visible')
        }
      }
    }

    if (typeof newLabel !== 'undefined') {
      const plCol = utilsMapping.addTextFeat(areaDefs, newLabel, this.props.metadata)
      mapStyle = mapStyle
        .setIn(['sources', 'area-labels', 'data'], fromJS(plCol[0]))
        .setIn(['sources', 'area-outlines', 'data'], fromJS(plCol[2]))
    }

    this.setState({ mapStyle })
  }

  _simulateYearChange = (areaDefs) => {
    const { religionGeneral, religion } = this.props.metadata
    const sourceId = 'provinces'
    const prevMapStyle = this.state.mapStyle
    const populationStops = [[0, populationColorScale[0]]]
    let geojson = prevMapStyle
      .getIn(['sources', sourceId, 'data']).toJS()

    populationStops.push([Math.max.apply(Math, Object.keys(areaDefs).map(function (key) {
      return (areaDefs[key] !== null) ? +areaDefs[key][4] : 0
    })), populationColorScale[1]])

    let mapStyle = prevMapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function (feature) {
        feature.properties.r = (areaDefs[feature.properties.name] || [])[0]
        feature.properties.c = (areaDefs[feature.properties.name] || [])[1]
        feature.properties.e = (areaDefs[feature.properties.name] || [])[2]
        feature.properties.g = (religionGeneral[(religion[(areaDefs[feature.properties.name] || [])[2]] || [])[3]] || 'undefined')[0]
        feature.properties.p = (areaDefs[feature.properties.name] || [])[4]
        return feature
      }))
      .setIn(['layers', areaColorLayerIndex['population'], 'paint'], fromJS(
        {
          'fill-color': ['interpolate', ['linear'], ['get', 'p'],
            populationStops[0][0], populationStops[0][1],
            populationStops[1][0], populationStops[1][1]
          ],
          'fill-opacity': 0.6,
          'fill-outline-color': 'rgba(0,0,0,.2)'
        }
      ))
/*
{
            'property': 'p',
            'type': 'exponential',
            'stops': populationStops,
            'default': populationColorScale[0]
          }
 */
    this.setState({ mapStyle })
  }

  componentWillReceiveProps (nextProps) {
    // TODO: move all unneccesary logic to specific components (this gets executed a lot!)
    const { basemap, activeArea, selectedYear, metadata, modActive, activeMarkers, selectedItem } = this.props
    console.debug('### MAP componentWillReceiveProps', this.props, nextProps)

    /** Acting on store changes **/
    if (selectedItem !== nextProps.selectedItem) {
      console.debug('###### Item changed')
      if (nextProps.selectedItem.wiki === 'random') {
        const selectedDim = activeArea.color
        const prevMapStyle = this.state.mapStyle
        let dataPool = prevMapStyle
          .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.n !== 'undefined')

        console.debug('data pool: ', dataPool)
        const randomItem = dataPool[getRandomInt(0, dataPool.length - 1)]
        const provinceId = randomItem.properties.name
        // const itemId = metadata[selectedDim][randomItem.properties.n][2]

        this.map.getMap().flyTo({
          center: [
            (randomItem.geometry.coordinates[0][0].length === 2) ? randomItem.geometry.coordinates[0][0][0] : randomItem.geometry.coordinates[0][0],
            (randomItem.geometry.coordinates[0][0].length === 2) ? randomItem.geometry.coordinates[0][0][1] : randomItem.geometry.coordinates[0][1],
          ]
        })

        this.props.setRightDrawerVisibility(true)
        this.props.selectAreaItem('', provinceId) // set query url
        this.props.history.push('/article')
      } else if (selectedItem === '') {
        // clicked on item!
        this.setState({
          mapStyle: this.state.mapStyle.setIn(['sources', 'area-hover', 'data', 'features'], []),
          hoverInfo: null
        })
      }
    }

    // Leaving Area Mod?
    if (modActive.type === 'areas' && nextProps.modActive.type === '') {
      // reload
      if (nextProps.modActive.toUpdate === 'area') {
        // refresh this year data
        this._changeYear(nextProps.selectedYear)
      }
    } else if (modActive.type === 'metadata' && nextProps.modActive.type === '') {
      // Leaving Metadata Mod
      if (nextProps.modActive.toUpdate !== '') {
        // refresh mapstyles and links
        this._updateMetaMapStyle(modActive.toUpdate)
      }
    }

    // Highlight mod area
    if (nextProps.modActive.type === 'areas' && !_.isEqual(modActive.data, nextProps.modActive.data)) {
      // reload
      const removedProvinces = _.difference(modActive.data, nextProps.modActive.data)
      const addedProvinces = _.difference(nextProps.modActive.data, modActive.data)

      removedProvinces.forEach((removedProv) => {
        this.setState({ mapStyle: this.state.mapStyle
          .updateIn(['sources', 'area-hover', 'data', 'features'], list => list.filter((obj) => (obj.properties.n !== removedProv)))
        })
      })

      addedProvinces.forEach((addedProv) => {
        // add province
        const provGeometry = (this.state.mapStyle.getIn(['sources', 'provinces', 'data']).toJS().features.find((prov) => prov.properties.name === addedProv) || {}).geometry
        if (typeof provGeometry !== 'undefined') {
          this.setState({ mapStyle: this.state.mapStyle
            .updateIn(['sources', 'area-hover', 'data', 'features'], list => list.concat({
              'type': 'Feature', 'properties': { n: addedProv }, 'geometry': provGeometry
            }))
          })
        }
      })
    }

    if (nextProps.modActive.type === 'areas') {
      if (modActive.type === '') {
        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data', 'features'], [])
        this.setState({
          hoverInfo: null
        })
        this.setState({ mapStyle })
      }

      // Mod Provinces changed?
      if (!_.isEqual(modActive.data.sort(), nextProps.modActive.data.sort())) {
        const removedProvinces = _.difference(modActive.data, nextProps.modActive.data)
        const addedProvinces = _.difference(nextProps.modActive.data, modActive.data)

        for (const provinceName of removedProvinces) {
            // remove province
          this.setState({
            mapStyle: this.state.mapStyle
                .updateIn(['sources', 'area-mod', 'data', 'features'], list => list.filter((obj) => (obj.properties.name !== provinceName)))
          })
        }

        for (const provinceName of addedProvinces) {
            // add province
          this.setState({
            mapStyle: this.state.mapStyle
                .updateIn(['sources', 'area-mod', 'data', 'features'], list => list.concat({
                  'type': 'Feature',
                  'properties': { name: provinceName },
                  'geometry': ((this.state.mapStyle
                    .getIn(['sources', 'provinces', 'data']).toJS().features
                    .filter((el) => el.properties.name === provinceName) || {})[0] || {}).geometry
                }))
          })
        }
      }
    } else if (modActive.type === 'areas') {
      // clean up mod select
      const prevMapStyle = this.state.mapStyle
      let mapStyle = prevMapStyle
        .setIn(['sources', 'area-mod', 'data', 'features'], [])
      this.setState({ mapStyle })
    }

    // Year changed?
    if (selectedYear !== nextProps.selectedYear) {
      console.debug('###### Year changed from ' + selectedYear + ' to ' + nextProps.selectedYear)
      this._changeYear(nextProps.selectedYear)
    }

    // Basemap changed?
    if (basemap !== nextProps.basemap) {
      console.debug('###### Basemap changed')
      const newMapStyle = this.state.mapStyle.setIn(['layers', basemapLayerIndex, 'source'], nextProps.basemap)
      this.setState({
        mapStyle: newMapStyle,
      })
    }

    // Area Label and Color changed?
    if (activeArea.label !== nextProps.activeArea.label && activeArea.color !== nextProps.activeArea.color) {
      console.debug('###### Area Color and Label changed' + nextProps.activeArea.label)
      this._changeArea(activeArea.data, nextProps.activeArea.label, nextProps.activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Label changed?
    else if (activeArea.label !== nextProps.activeArea.label) {
      console.debug('###### Area Label changed' + nextProps.activeArea.label)
      this._changeArea(activeArea.data, nextProps.activeArea.label, undefined)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Color changed?
    else if (activeArea.color !== nextProps.activeArea.color) {
      console.debug('###### Area Color changed' + nextProps.activeArea.color)
      this._changeArea(activeArea.data, undefined, nextProps.activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
    }

    // Markers changed?
    if (!_.isEqual(activeMarkers.sort(), nextProps.activeMarkers.sort())) { // expensive comparison! // TODO
      console.debug('###### Markers changed')
      utilsQuery.updateQueryStringParameter('marker', nextProps.activeMarkers)
      const removedMarkers = _.difference(activeMarkers, nextProps.activeMarkers)
      const addedMarkers = _.difference(nextProps.activeMarkers, activeMarkers)

      // iterate to remove
      for (const removedMarker of removedMarkers) {
        console.log('removing Marker', removedMarker)
        this._removeGeoJson('markers', removedMarker)
      }

      // iterate to add
      for (const addedMarker of addedMarkers) {
        console.log('addedMarker', addedMarker)
        fetch(properties.chronasApiHost + '/markers?types=' + addedMarker + '&year=' + selectedYear) // TODO: change to markers after API endpoint is ready
          .then(res => res.json())
          .then(features => this._addGeoJson('markers', features || []))
      }
    }

    // if drawer changed
    this._resize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._resize)
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || (window.innerWidth - 56),
        height: (this.props.height || window.innerHeight)
      }
    })
  };

  _loadGeoJson = (sourceId, sourceData) => {
    // utilsMapping.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', sourceId, 'data', 'features'], sourceData.features)
    // let mapStyle = prevMapStyle
    //   .setIn(['sources', sourceId, 'data', 'features'], sourceData.features)
    this.setState({ mapStyle })
  };

  _addGeoJson = (sourceId, features) => {
    // utilsMapping.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const mapStyle = this.state.mapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.concat(features))
    this.setState({ mapStyle })
  };

  _removeGeoJson = (sourceId, entityId) => {
    // let mapStyle = prevMapStyle
    //   .setIn(['sources', sourceId, 'data'],
    //     fromJS({

    // this.setState({ mapStyle: this.state.mapStyle
    //     .updateIn(['sources', 'area-hover', 'data', 'features'], list => list.concat({
    //       'type': 'Feature', 'properties': { n: addedProv }, 'geometry': provGeometry
    //     }))
    // })

    //       "type": "FeatureCollection",
    //       "features": geojson.features.filter(function(obj) {
    //       return (-1 === obj.properties._storage_options.iconUrl.indexOf("/static/i/b"))
    //       }) }
    //     ))

    const mapStyle = this.state.mapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.filter(function (obj) {
        return (obj.properties.t !== entityId)
      }))

    this.setState({ mapStyle })
  };

  _loadMarkerData = data => {
    data.features.map((markerData, iter) => (
      this._renderBasicMarker(markerData, iter)
    ))
  };

  _changeYear = (year) => {
    axios.get(properties.chronasApiHost + '/areas/' + year)
      .then((areaDefsRequest) => {
        this.props.changeAreaData(areaDefsRequest.data)
        this._simulateYearChange(areaDefsRequest.data)
        this._changeArea(areaDefsRequest.data, this.props.activeArea.label, this.props.activeArea.color)
        utilsQuery.updateQueryStringParameter('year', year)
      })
  }

  _renderBasicMarker = (markerData, index) => {
    return (
      <Marker key={`marker-${index}`}
        longitude={markerData.geometry.coordinates[0]}
        latitude={markerData.geometry.coordinates[1]}>
        <BasicPin size={20} onClick={() => this.setState({ popupInfo: markerData.properties })} />
      </Marker>
    )
  }

  _onViewportChange = viewport => this.setState({ viewport });

  _updateSettings = (name, value) => {
    if (name === 'year') {
      this.setState({ year: value })

      const { data, mapStyle } = this.state
      if (data) {
        // utilsMapping.updatePercentiles(data, f => f.properties.income[value]);
        const newMapStyle = mapStyle.setIn(['sources', 'incomeByState', 'data'], fromJS(data))
        this.setState({ mapStyle: newMapStyle })
      }
    }
  };

  _onHover = event => {
    event.stopPropagation()
    if (this.props.modActive.type !== '') return

    let provinceName = ''
    let hoverInfo = null

    const layerHovered = event.features && event.features[0]
    if (layerHovered) {
      if (layerHovered.layer.id === "markers") {
        hoverInfo = {
          lngLat: event.lngLat,
          feature: layerHovered.properties
        }
        provinceName = layerHovered.properties.name

        this.setState({ mapStyle: this.state.mapStyle
            .setIn(['sources', 'area-hover', 'data', 'features'], [{
              'type': 'Feature', 'properties': {}, 'geometry': layerHovered.geometry
            }]) })
      } else {
        hoverInfo = {
          lngLat: event.lngLat,
          feature: layerHovered.properties
        }
        provinceName = layerHovered.properties.name

        this.setState({ mapStyle: this.state.mapStyle
            .setIn(['sources', 'area-hover', 'data', 'features'], [{
              'type': 'Feature', 'properties': {}, 'geometry': layerHovered.geometry
            }]) })
      }
    } else {
      const prevMapStyle = this.state.mapStyle
      let mapStyle = prevMapStyle
        .setIn(['sources', 'area-hover', 'data', 'features'], [])
      this.setState({ mapStyle })
    }

    this.setState({
      hoverInfo
    })
  }

  _onClick = event => {
    event.stopPropagation()
    let itemName = ''
    let wikiId = ''

    if (this.props.modActive.type === TYPE_MARKER) {
      this.props.setModData(event.lngLat.map((l) => +l.toFixed(3)))
      return
    }
    else if (this.props.modActive.type === 'areas') {
      let provinceName = ''
      const province = event.features && event.features[0]
      const prevModData = this.props.modActive.data

      if (province) {
        provinceName = province.properties.name

        if (prevModData.indexOf(provinceName) > -1) {
          // remove province
          this.props.removeModData(provinceName)
          this.setState({ mapStyle: this.state.mapStyle
            .updateIn(['sources', 'area-outline', 'data', 'features'], list => list.filter((obj) => (obj.properties.n !== provinceName)))
          })
        } else {
          // add province
          this.props.addModData(provinceName)
          this.setState({ mapStyle: this.state.mapStyle
            .updateIn(['sources', 'area-outline', 'data', 'features'], list => list.concat({
              'type': 'Feature', 'properties': { n: provinceName }, 'geometry': province.geometry
            }))
          })
        }
      }
      return
    }

    const layerClicked = event.features && event.features[0]

    if (layerClicked) {
      if (layerClicked.layer.id === "markers") {
        itemName = layerClicked.properties.n
        wikiId = layerClicked.properties.w
        utilsQuery.updateQueryStringParameter('type', 'marker')
        utilsQuery.updateQueryStringParameter('province', '')

        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data', 'features'], [])
        this.setState({
          hoverInfo: null,
          mapStyle
        })

        this.props.selectMarkerItem(wikiId)
      } else {
        itemName = layerClicked.properties.name
        wikiId = layerClicked.properties.wikiUrl
        utilsQuery.updateQueryStringParameter('type', 'areas')
        utilsQuery.updateQueryStringParameter('province', itemName)

        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data', 'features'], [])
        this.setState({
          hoverInfo: null,
          mapStyle
        })

        this.props.selectAreaItem(wikiId, itemName)
      }
    }

    if (itemName !== '') {
      this.map.getMap().flyTo({
        center: [
          event.lngLat[0],
          event.lngLat[1]
        ]
      })
    }

    // this.props.setRightDrawerVisibility(itemName !== '')
    this.props.history.push('/article')
  }

  _renderPopup () {
    const { hoverInfo, popupInfo } = this.state
    if (hoverInfo) {
      return (
        <Popup longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]} closeButton={false}>
          <div className='county-info'>{JSON.stringify(hoverInfo)}</div>
        </Popup>
      )
    }
    if (popupInfo) {
      return (
        <Popup tipSize={5}
          anchor='top'
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => this.setState({ popupInfo: null })} >
          <BasicInfo info={popupInfo} />
        </Popup>
      )
    }
    return null
  }

  _renderTooltip () {
    const { hoveredFeature, year, x, y } = this.state

    return hoveredFeature && (
    <div className='tooltip' style={{ left: x, top: y }}>
      <div>State: {hoveredFeature.properties.name}</div>
      <div>Median Household Income: {hoveredFeature.properties.value}</div>
      <div>Percentile: {hoveredFeature.properties.percentile / 8 * 100}</div>
    </div>
      )
  }

  render () {
    const { viewport, mapStyle } = this.state
    const { modActive } = this.props

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    let modMarker = (modActive.type === TYPE_MARKER && typeof modActive.data[0] !== 'undefined') ? <Marker
      captureClick={false}
      captureDrag={false}
      latitude={modActive.data[1]}
      longitude={modActive.data[0]}
      offsetLeft={0}
      offsetTop={0}>
      <BasicPin size={40} />
    </Marker> : null

    return (
      <div style={{
        left: leftOffset,
        position: 'absolute',
        top: 0,
        width: 'calc(100% - 56px)',
        height: '100%',
        overflow: 'hidden',
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), right 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <MapGL
          ref={(map) => { this.map = map }}
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          onClick={this._onClick}
          onLoad={this._initializeMap}
        >
          {modMarker}

          {this._renderPopup()}
        </MapGL>
        <Timeline />
      </div>
    )
  }
}

Map.propTypes = {
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuTap: PropTypes.func,
  // resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
}

Map.defaultProps = {
  onMenuTap: () => null,
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    location: state.location,
    basemap: state.basemap,
    activeArea: state.activeArea,
    activeMarkers: state.activeMarkers,
    selectedYear: state.selectedYear,
    selectedItem: state.selectedItem,
    metadata: state.metadata,
    menuDrawerOpen: state.menuDrawerOpen,
    modActive: state.modActive,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    setRightDrawerVisibility: setRightDrawerVisibilityAction,
    selectAreaItem: selectAreaItemAction,
    selectMarkerItem : selectMarkerItemAction,
    setModData: setModDataAction,
    removeModData: removeModDataAction,
    addModData: addModDataAction,
    changeAreaData: changeAreaDataAction,
  }),
  pure,
  translate,
)

export default enhance(Map)
