import React, { Component } from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import axios from 'axios'
import { easeCubic } from 'd3-ease'
import WebMercatorViewport from 'viewport-mercator-project'
import { changeAreaData as changeAreaDataAction } from '../menu/layers/actionReducers'
import { fromJS } from 'immutable'
import _ from 'lodash'
import MapGL, { Marker, Popup, FlyToInterpolator } from 'react-map-gl'
import DeckGLOverlay from './deckGlComponents/deckgl-overlay.js'
import { setRightDrawerVisibility } from '../content/actionReducers'
import { setModData as setModDataAction, setModToUpdate, addModData as addModDataAction, removeModData as removeModDataAction } from './../restricted/shared/buttons/actionReducers'
import {
  TYPE_MARKER, TYPE_METADATA, TYPE_AREA, TYPE_LINKED, TYPE_EPIC, selectValue, setWikiId, setData, selectAreaItem as selectAreaItemAction,
  selectMarkerItem as selectMarkerItemAction, WIKI_PROVINCE_TIMELINE, WIKI_RULER_TIMELINE
} from './actionReducers'
import properties from '../../properties'
import { defaultMapStyle, provincesLayer, markerLayer, clusterLayer, markerCountLayer, provincesHighlightedLayer, highlightLayerIndex, basemapLayerIndex, populationColorScale, areaColorLayerIndex } from './mapStyles/map-style.js'
import utilsMapping from './utils/mapping'
import utilsQuery from './utils/query'
import Timeline from './timeline/MapTimeline'
import BasicInfo from './markers/basic-info'
import BasicPin from './markers/basic-pin'
import utils from './utils/general'
const turf = require('@turf/turf')

const MAPBOX_TOKEN = "pk.eyJ1IjoidmVyZGljbyIsImEiOiJjajVhb3E1MnExeTRpMndvYTdubnQzODU2In0.qU_Ybv3UX70fFGo79pAa0A"

// defines fill-opacity when Population Opacity is switched on
const opacityPopBounds = [0.3, 0.8]
const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

class Map extends Component {
  state = {
    mapStyle: defaultMapStyle,
    mapTimelineContainerClass: 'mapTimeline',
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
    data: null,
    epics: [],
    arcData: [],
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
    this._addGeoJson(TYPE_MARKER, this.props.activeMarkers)
    this._addEpic(this.props.activeEpics)
    window.addEventListener('resize', this._resize)
    this._resize()
  }

  _initializeMap = () => {
    console.log('### initializing map')
    const { metadata, activeArea, changeAreaData, selectedYear, selectedItem } = this.props
    this._loadGeoJson('provinces', metadata.provinces)
    this._updateMetaMapStyle()

    axios.get(properties.chronasApiHost + '/areas/' + selectedYear)
      .then((areaDefsRequest) => {
        changeAreaData(areaDefsRequest.data)
        this._simulateYearChange(areaDefsRequest.data)
        this._changeArea(areaDefsRequest.data, activeArea.label, activeArea.color, selectedItem.value)
      })
  }

  _updateMetaMapStyle = (shouldReset = false) => {
    console.log('### updating metadata mapstyles')
    const { metadata, setModToUpdate } = this.props

    const rulStops = []
    const relStops = []
    const relGenStops = []
    const culStops = []

    const rulKeys = Object.keys(metadata['ruler'])
    for (let i = 0; i < rulKeys.length; i++) {
      rulStops.push([rulKeys[i], metadata['ruler'][rulKeys[i]][1]])
    }

    const relKeys = Object.keys(metadata['religion'])
    for (let i = 0; i < relKeys.length; i++) {
      relStops.push([relKeys[i], metadata['religion'][relKeys[i]][1]])
    }

    const relGenKeys = Object.keys(metadata['religionGeneral'])
    for (let i = 0; i < relGenKeys.length; i++) {
      relGenStops.push([relGenKeys[i], metadata['religionGeneral'][relGenKeys[i]][1]])
    }

    const culKeys = Object.keys(metadata['culture'])
    for (let i = 0; i < culKeys.length; i++) {
      culStops.push([culKeys[i], metadata['culture'][culKeys[i]][1]])
    }

    const mapStyle = this.state.mapStyle
      .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-color'], fromJS(
        {
          'property': 'r',
          'type': 'categorical',
          'stops': rulStops,
          'default': 'rgba(1,1,1,0.3)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-color'], fromJS(
        {
          'property': 'e',
          'type': 'categorical',
          'stops': relStops,
          'default': 'rgba(1,1,1,0.3)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-color'], fromJS(
        {
          'property': 'g',
          'type': 'categorical',
          'stops': relGenStops,
          'default': 'rgba(1,1,1,0.3)'
        }
      ))
      .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-color'], fromJS(
        {
          'property': 'c',
          'type': 'categorical',
          'stops': culStops,
          'default': 'rgba(1,1,1,0.3)'
          }
      ))

    if (shouldReset) setModToUpdate('')
    this.setState({ mapStyle })
  }

  _getAreaViewportAndOutlines = (nextActiveColorDim, nextActiveColorValue, prevActiveColorDim = false, prevActiveColorValue = false, teams = false) => {
    const webMercatorViewport = new WebMercatorViewport({
      width: this.props.width || (window.innerWidth - 56),
      height: this.props.height || window.innerHeight
    })

    if (teams && teams.length > 0) {
      // from epic war (multiple entities)

      const geometryToOutlines = teams.map((team) => this.state.mapStyle
        .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => team.indexOf(el.properties.r) > -1))

      if (typeof geometryToOutlines !== 'undefined' && geometryToOutlines.length !== 0 && geometryToOutlines[0].length !== 0) {
        const multiPolygonToOutlines = geometryToOutlines.filter((geometryToOutline) => (geometryToOutline && geometryToOutline.length !== 0)).map((geometryToOutline) => turf.union.apply(null, geometryToOutline.map((f) => turf.unkinkPolygon(f).features).reduce((acc, val) => acc.concat(val), [])))

        const bbox = turf.bbox({
          'type': 'FeatureCollection',
          'features': multiPolygonToOutlines
        })

        const bounds = webMercatorViewport.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: 20, offset: [0, -40] }
        )

        const viewport = {
          ...this.state.viewport,
          ...bounds,
          zoom: Math.min(+bounds.zoom - 1, Math.max(4.5, +this.state.viewport.zoom)),
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic
        }

        return { viewport, multiPolygonToOutlines }
      }
    } else {
      // from epic ruler (single entity)
      const activeColorDim = (nextActiveColorDim === 'population' && prevActiveColorDim) ? prevActiveColorDim : nextActiveColorDim
      const activeColorValue = (nextActiveColorDim === 'population' && prevActiveColorValue) ? prevActiveColorValue : nextActiveColorValue

      let geometryToOutline
      if (activeColorValue && typeof activeColorValue !== 'undefined' && activeColorValue !== '' && activeColorValue !== 'undefined' && activeColorValue !== 'null') {
        if (activeColorDim === 'ruler') {
          geometryToOutline = this.state.mapStyle
              .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.r === activeColorValue)
        } else if (activeColorDim === 'culture') {
          geometryToOutline = this.state.mapStyle
              .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.c === activeColorValue)
        } else if (activeColorDim === 'religion') {
          geometryToOutline = this.state.mapStyle
              .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.e === activeColorValue)
        } else if (activeColorDim === 'religionGeneral') {
          geometryToOutline = this.state.mapStyle
              .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.g === activeColorValue)
        }
      }
          // turf.unkinkPolygon.apply(null,geometryToOutline)
      if (typeof geometryToOutline !== 'undefined' && geometryToOutline.length !== 0) {
        const multiPolygonToOutline = turf.union.apply(null, geometryToOutline.map((f) => turf.unkinkPolygon(f).features).reduce((acc, val) => acc.concat(val), []))

        const bbox = turf.bbox(multiPolygonToOutline)

        const bounds = webMercatorViewport.fitBounds(
              [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
              { padding: 20, offset: [0, -40] }
            )

        const viewport = {
          ...this.state.viewport,
          ...bounds,
          zoom: Math.min(+bounds.zoom - 1, Math.max(4.5, +this.state.viewport.zoom)),
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic
        }

        return { viewport, multiPolygonToOutline }
      }
    }
    console.error('We got something wrong with the turf.union or turf.unkinkPolygon')
    return {}
  }

  _changeArea = (areaDefs, newLabel, newColor, selectedProvince, prevColor = false) => {
    const { activeArea, mapStyles, metadata, selectedItem } = this.props
    let mapStyle = this.state.mapStyle

    if (mapStyles.popOpacity) {
      const populationMax = Math.max.apply(Math, Object.values(areaDefs).map(function (provValue) {
        return (provValue !== null) ? +provValue[4] : 0
      }))
      mapStyle = mapStyle
        .setIn(['layers', areaColorLayerIndex[newColor], 'paint', 'fill-opacity'], fromJS(
          ['interpolate', ['linear'], ['get', 'p'],
            0, opacityPopBounds[0],
            populationMax / 20, opacityPopBounds[1]
          ]
        ))
    }

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
      const plCol = utilsMapping.addTextFeat(areaDefs, newLabel, metadata)
      mapStyle = mapStyle
        .setIn(['sources', 'area-labels', 'data'], fromJS(plCol[0]))
        .setIn(['sources', 'area-outlines', 'data'], fromJS(plCol[2]))
    }

    if (selectedItem.type === TYPE_AREA && newColor !== '' && selectedProvince) {
      const activeprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(newColor)]
      const prevActiveprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(prevColor)]
      const { viewport, multiPolygonToOutline } = this._getAreaViewportAndOutlines(newColor, activeprovinceValue, prevColor, prevActiveprovinceValue)

      if (typeof multiPolygonToOutline !== 'undefined') {
        let newMapStyle = mapStyle
          .setIn(['sources', 'entity-outlines', 'data'], fromJS({ ...multiPolygonToOutline, properties: { color: metadata[newColor][activeprovinceValue][1] } }))

        if (newColor === 'population' && prevColor && prevColor !== 'population') {
          const populationMax = Math.max.apply(Math, Object.values(areaDefs).map(function (provValue) {
            return (provValue !== null && provValue[utils.activeAreaDataAccessor(prevColor)] === prevActiveprovinceValue) ? +provValue[4] : 0
          }))

          newMapStyle = newMapStyle
          .setIn(['layers', areaColorLayerIndex[newColor], 'paint', 'fill-opacity'], fromJS(
            ['interpolate', ['linear'], ['get', 'p'],
              0, opacityPopBounds[0],
              populationMax/20, opacityPopBounds[1]
            ]
          ))
        }
        this.setState({
          viewport,
          mapStyle: newMapStyle
        })
      } else {
        this.setState({ mapStyle: mapStyle.setIn(['sources', 'entity-outlines', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': [ ]
        })) })
      }
    } else {
      this.setState({ mapStyle })
    }
  }

  _simulateYearChange = (areaDefs) => {
    const { religionGeneral, religion } = this.props.metadata
    const { activeArea, mapStyles } = this.props

    const sourceId = 'provinces'
    const prevMapStyle = this.state.mapStyle
    const populationMax = Math.max.apply(Math, Object.values(areaDefs).map(function (provValue) {
      return (provValue !== null) ? +provValue[4] : 0
    }))

    let mapStyle = prevMapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function (feature) {
        const provValue = areaDefs[feature.properties.name] || []
        feature.properties.r = provValue[0]
        feature.properties.c = provValue[1]
        feature.properties.e = provValue[2]
        feature.properties.g = (religionGeneral[(religion[provValue[2]] || [])[3]] || 'undefined')[0]
        feature.properties.p = provValue[4]
        return feature
      })) // areaColorLayerIndex['ruler']

    if (mapStyles.popOpacity || activeArea.color === 'population') {
      mapStyle = mapStyle.setIn(['layers', areaColorLayerIndex[activeArea.color], 'paint', 'fill-opacity'], fromJS(
        ['interpolate', ['linear'], ['get', 'p'],
          0, opacityPopBounds[0],
          populationMax / 20, opacityPopBounds[1]
        ]
      ))
    }

    this.setState({ mapStyle })
  }

  _getDirtyOrOriginalMapStyle = (mapStyleDirty) => {
    if (mapStyleDirty) {
      return mapStyleDirty
    } else {
      return this.state.mapStyle
    }
  }

  componentWillReceiveProps (nextProps) {
    // TODO: move all unneccesary logic to specific components (this gets executed a lot!)
    const { mapStyles, activeArea, selectedYear, metadata, modActive, history, activeEpics, activeMarkers, selectedItem, selectAreaItem } = this.props
    const rightDrawerOpen = nextProps.rightDrawerOpen

    let mapStyleDirty = false
    console.debug('### MAP componentWillReceiveProps', this.props, nextProps)

    /** Acting on store changes **/
    if (nextProps.history.location.pathname === '/discover') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline discoverActive' })
    } else if (nextProps.history.location.pathname !== '/discover' && this.state.mapTimelineContainerClass !== '') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline' })
    }

    // Leaving Epic? -> cleanup
    if (selectedItem.type === TYPE_EPIC && nextProps.selectedItem.type !== TYPE_EPIC) {
      mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, TYPE_EPIC)
      this.setState({ arcData: [] })
    }

    if (selectedItem.value !== nextProps.selectedItem.value) {
      console.debug('###### Item changed')
      if (nextProps.selectedItem.wiki === 'random') {
        let dataPool = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.n !== 'undefined')

        console.debug('data pool: ', dataPool)
        const randomItem = dataPool[getRandomInt(0, dataPool.length - 1)]
        const provinceId = randomItem.properties.name
        if (history.location.pathname.indexOf('article') === -1) history.push('/article')

        this.props.selectAreaItem('', provinceId) // set query url
      } else if ((nextProps.selectedItem.type === TYPE_AREA &&
          nextProps.selectedItem.value !== '' &&
          nextProps.activeArea.color !== '' &&
          nextProps.activeArea.color === activeArea.color)) {
        const nextActiveprovinceValue = (nextProps.activeArea.data[nextProps.selectedItem.value] || {})[utils.activeAreaDataAccessor(nextProps.activeArea.color)]
        const prevActiveprovinceValue = (activeArea.data[selectedItem.value] || {})[utils.activeAreaDataAccessor(activeArea.color)]
        const { viewport, multiPolygonToOutline } = this._getAreaViewportAndOutlines(nextProps.activeArea.color, nextActiveprovinceValue, activeArea.color, prevActiveprovinceValue)

        if (typeof multiPolygonToOutline !== 'undefined') {
          mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
            .setIn(['sources', 'entity-outlines', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': [ ]
            }))
            .setIn(['sources', 'entity-outlines', 'data'], fromJS({ ...multiPolygonToOutline, properties: { color: metadata[nextProps.activeArea.color][nextActiveprovinceValue][1] } }))
          this.setState({
            viewport,
            hoverInfo: null
          })
        } else {
          this.setState({
            mapStyle: this.state.mapStyle.setIn(['sources', 'area-hover', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': [ ]
            })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': [ ]
            })),
            hoverInfo: null
          })
        }
      } else if (nextProps.selectedItem.type !== TYPE_EPIC) {
        // setTimeout(() => {
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': [ ]
          })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': [ ]
          }))
        this.setState({
          hoverInfo: null
        })
      }
    }

    if (nextProps.selectedItem.type === TYPE_EPIC && (nextProps.selectedItem.value !== selectedItem.value || ((nextProps.selectedItem.data || {}).id !== (selectedItem.data || {}).id))) {

      // TODO: only go ahead if selectedYear is starting year

      // setup new epic!
      if (selectedItem.type === TYPE_EPIC && !nextProps.selectedItem.data) {
        // remove old geoJson // TODO: this could complicate with sequential wars
        mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, TYPE_EPIC)
      }

      if ((nextProps.selectedItem.data || {}).id !== (selectedItem.data || {}).id) {
        // draw outlines after main
        const participants = (((nextProps.selectedItem.data || {}).data || {}).data || {}).participants
        if (!participants) return
        const { viewport, multiPolygonToOutlines } = this._getAreaViewportAndOutlines('ruler', '', false, false, participants)

        if (typeof multiPolygonToOutlines !== 'undefined') {
          const warEndYear = (((nextProps.selectedItem.data || {}).data || {}).data || {}).end
          if (!isNaN(warEndYear)) {
            axios.get(properties.chronasApiHost + '/areas/' + warEndYear)
              .then((endYearDataRes) => {
                const endYearData = endYearDataRes.data
                const participantFlatList = participants.reduce((acc, val) => acc.concat(val), [])
                const centroidsParticipants = {}
                const arcData = []
                const nextData = nextProps.activeArea.data

                Object.keys(nextData).map(provId => {
                  const provinceGeojsonArr = metadata.provinces.features
                  let currRuler = nextData[provId][0]
                  if (participantFlatList.indexOf(currRuler) > -1) {
                    let newRuler = endYearData[provId][0]
                    if (newRuler !== currRuler && participantFlatList.indexOf(newRuler) > -1) {
                      if (!centroidsParticipants[newRuler]) {
                        // centroids not set up for this ruler
                        const ownedProvIds = Object.keys(nextData).filter(prov => nextData[prov][0] === newRuler)
                        centroidsParticipants[newRuler] = provinceGeojsonArr.filter(prov => ownedProvIds.indexOf(prov.properties.name) > -1).map(prov => turf.centroid(prov))
                      }

                      const provInQuestion = provinceGeojsonArr.find(prov => prov.properties.name === provId)
                      const targetCentroid = turf.centroid(provInQuestion)
                      const sourceCentroid = turf.nearest(targetCentroid,  turf.featureCollection(centroidsParticipants[newRuler]))
                      const rulerColorPr = metadata.ruler[newRuler][1]
                      const rulerColor = (rulerColorPr.indexOf("rgb(") > -1) ? rulerColorPr.substring(4, rulerColorPr.length - 1).split(",").map(el => +el) : [100, 100, 100]

                      arcData.push([sourceCentroid.geometry.coordinates, targetCentroid.geometry.coordinates, rulerColor])
                    }
                  }
                })
                this.setState({ arcData })
              })
          }

          // Todo: multiPolygonToOutlines[0] has properties! does that slow things down?
          this.setState({
            mapStyle: this._getDirtyOrOriginalMapStyle(mapStyleDirty)
              .setIn(['sources', 'entity-outlines', 'data'], fromJS({
                'type': 'FeatureCollection',
                'features': [ ]
              }))
              .setIn(['sources', 'entity-outlines', 'data'], fromJS({
                'type': 'FeatureCollection',
                'features': [{ ...multiPolygonToOutlines[0], properties: { color: 'red' } }, { ...multiPolygonToOutlines[1], properties: { color: 'blue' } }]
              })),
            viewport,
            hoverInfo: null
          })
        } else {
          this.setState({
            mapStyle: this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['sources', 'area-hover', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': [ ]
            })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': [ ]
            })),
            hoverInfo: null
          })
        }
      } else {
        // load initial epic data object
        const epicWiki = nextProps.selectedItem.value
        axios.get(properties.chronasApiHost + '/metadata/e_' + window.encodeURIComponent(epicWiki))
          .then((newEpicEntitiesRes) => {
            const newEpicEntities = newEpicEntitiesRes.data

            if (!newEpicEntities.data) return

            const participants = (newEpicEntities.data.participants || [])
            const teamMapping = {}
            const rulerPromises = []
            const flatternedParticipants = []

            if (epicWiki) {
              rulerPromises.push(axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:' + epicWiki))
            }

            participants.forEach((team, teamIndex) => {
              team.forEach((participant) => {
                teamMapping[participant] = teamIndex
                rulerPromises.push(axios.get(properties.chronasApiHost + '/metadata/a_ruler_' + participant))
                flatternedParticipants.push(participant)
              })
            })

            axios.all(rulerPromises)
              .then(axios.spread((...args) => {
                if (epicWiki && args.length > 0) {
                  newEpicEntities.data.content = (args[0].data || {}).map //TODO: it should be this way later on with proper linked items
                  this._addGeoJson(TYPE_MARKER, TYPE_EPIC, newEpicEntities.data.content)
                  args.shift()
                }
                this.props.setData({
                  id: newEpicEntities._id,
                  data: newEpicEntities,
                  rulerEntities: args.map((res, i) => { return { ...res.data, id: flatternedParticipants[i] } })
                })

                this.props.history.push('/article')
                if (!rightDrawerOpen) this.props.setRightDrawerVisibility(true)
              }))
              .catch((err) => console.debug('wer got an error', err))
          })
      }
    }

    // Leaving Area Mod?
    if (modActive.type === TYPE_AREA && nextProps.modActive.type === '') {
      // reload
      if (nextProps.modActive.toUpdate === 'area') {
        // refresh this year data
        this._changeYear(nextProps.selectedYear)
      }
    } else if (modActive.type === TYPE_MARKER && nextProps.modActive.type === '') {
      // Leaving Metadata Mod
      if (nextProps.modActive.toUpdate !== '') {
        // refresh mapstyles and links
        this._updateGeoJson(TYPE_MARKER, nextProps.modActive.toUpdate)
      }
    }

    if (modActive.toUpdate === '' && nextProps.modActive.toUpdate !== '') {
      // refresh mapstyles and links
      this._updateMetaMapStyle(nextProps.modActive.toUpdate)
    }

    // Highlight mod area
    if (nextProps.modActive.type === TYPE_AREA && !_.isEqual(modActive.data, nextProps.modActive.data)) {
      // reload
      const removedProvinces = _.difference(modActive.data, nextProps.modActive.data)
      const addedProvinces = _.difference(nextProps.modActive.data, modActive.data)

      removedProvinces.forEach((removedProv) => {
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .updateIn(['sources', 'area-hover', 'data', 'features'], list => list.filter((obj) => (obj.properties.n !== removedProv)))
      })

      addedProvinces.forEach((addedProv) => {
        // add province
        const provGeometry = (this._getDirtyOrOriginalMapStyle(mapStyleDirty).getIn(['sources', 'provinces', 'data']).toJS().features.find((prov) => prov.properties.name === addedProv) || {}).geometry
        if (typeof provGeometry !== 'undefined') {
          mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
            .updateIn(['sources', 'area-hover', 'data', 'features'], list => list.concat({
              'type': 'Feature', 'properties': { n: addedProv }, 'geometry': provGeometry
            }))
        }
      })
    } else if (nextProps.modActive.type === TYPE_LINKED && !_.isEqual(modActive.data, nextProps.modActive.data)) {
      // new linked item clicked with linked marker coordinates
      const newCoords = nextProps.modActive.data
      if (typeof newCoords[1] !== 'undefined') {
        this._goToViewport({
          longitude: newCoords[0],
          latitude: newCoords[1]
        })
      }
    }

    if (nextProps.modActive.type === TYPE_AREA) {
      if (modActive.type === '') {
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': [ ]
          }))
        this.setState({
          hoverInfo: null
        })
      }

      // Mod Provinces changed?
      if (!_.isEqual(modActive.data.sort(), nextProps.modActive.data.sort())) {
        const removedProvinces = _.difference(modActive.data, nextProps.modActive.data)
        const addedProvinces = _.difference(nextProps.modActive.data, modActive.data)

        for (const provinceName of removedProvinces) {
            // remove province
          mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
                .updateIn(['sources', 'area-mod', 'data', 'features'], list => list.filter((obj) => (obj.properties.name !== provinceName)))
        }

        for (const provinceName of addedProvinces) {
            // add province
          mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
                .updateIn(['sources', 'area-mod', 'data', 'features'], list => list.concat({
                  'type': 'Feature',
                  'properties': { name: provinceName },
                  'geometry': ((this.state.mapStyle
                    .getIn(['sources', 'provinces', 'data']).toJS().features
                    .filter((el) => el.properties.name === provinceName) || {})[0] || {}).geometry
                }))
        }
      }
    } else if (modActive.type === TYPE_AREA) {
      // clean up mod select
      mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['sources', 'area-mod', 'data', 'features'], [])
    }

    // Year changed?
    if (selectedYear !== nextProps.selectedYear) {
      console.debug('###### Year changed from ' + selectedYear + ' to ' + nextProps.selectedYear)
      this._changeYear(nextProps.selectedYear)
    }

    // Basemap changed?
    if (mapStyles.basemap !== nextProps.mapStyles.basemap) {
      console.debug('###### Basemap changed')
      mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['layers', basemapLayerIndex, 'source'], nextProps.mapStyles.basemap)
    }

    // Province Borders Display changed?
    if (mapStyles.showProvinceBorders !== nextProps.mapStyles.showProvinceBorders) {
      console.debug('###### Show Province Borders changed')
      if (nextProps.mapStyles.showProvinceBorders) {
        // display province borders!
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,.2)"))
          .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,.2)"))
          .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,.2)"))
          .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,.2)"))
      } else {
        // hide province borders!
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,0)"))
          .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,0)"))
          .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,0)"))
          .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-outline-color'], fromJS("rgba(0,0,0,0)"))
      }
    }

    // Area Label and Color changed?
    if (activeArea.label !== nextProps.activeArea.label && activeArea.color !== nextProps.activeArea.color) {
      console.debug('###### Area Color and Label changed' + nextProps.activeArea.label)
      this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Label changed?
    else if (activeArea.label !== nextProps.activeArea.label) {
      console.debug('###### Area Label changed' + nextProps.activeArea.label)
      this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, undefined, undefined, activeArea.color)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Color changed?
    else if (activeArea.color !== nextProps.activeArea.color) {
      console.debug('###### Area Color changed' + nextProps.activeArea.color)
      this._changeArea(nextProps.activeArea.data, undefined, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
    } else if (nextProps.activeArea.color === 'ruler' && nextProps.selectedItem.type === 'areas' && nextProps.selectedItem.value !== '' && activeArea.data[nextProps.selectedItem.value] && activeArea.data[nextProps.selectedItem.value][0] !== (nextProps.activeArea.data[nextProps.selectedItem.value] || {})[0]) {
      // year changed while ruler article open and new ruler in province, ensure same ruler is kept if possible
      const rulerToHold =
        activeArea.data[selectedItem.value][0]
      const nextData = nextProps.activeArea.data
      const provinceWithOldRuler = Object.keys(nextData).filter(key => nextData[key][0] === rulerToHold)[0]
      if (provinceWithOldRuler) selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
    }

    if (mapStyles.popOpacity !== nextProps.mapStyles.popOpacity) {
      // popOpacity changed
      const populationMax = Math.max.apply(Math, Object.values(nextProps.activeArea.data).map(function (provValue) {
        return (provValue !== null) ? +provValue[4] : 0
      }))

      if (nextProps.mapStyles.popOpacity) {
        // was switched on
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['layers', areaColorLayerIndex[activeArea.color], 'paint', 'fill-opacity'], fromJS(
          ['interpolate', ['linear'], ['get', 'p'],
            0, opacityPopBounds[0],
            populationMax / 20, opacityPopBounds[1]
          ]
        ))
      } else {
        // was switched off -- revert
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-opacity'], fromJS(0.6))
          .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-opacity'], fromJS(0.6))
          .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-opacity'], fromJS(0.6))
          .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-opacity'], fromJS(0.6))
      }
    }
    // Markers changed?
    if (!_.isEqual(activeMarkers.sort(), nextProps.activeMarkers.sort())) {
      console.debug('###### Markers changed')
      utilsQuery.updateQueryStringParameter('markers', nextProps.activeMarkers)
      const removedMarkers = _.difference(activeMarkers, nextProps.activeMarkers)
      const addedMarkers = _.difference(nextProps.activeMarkers, activeMarkers)

      // iterate to remove
      for (const removedMarker of removedMarkers) {
        console.log('removing Marker', removedMarker)
        mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, removedMarker)
      }

      // iterate to add
      for (const addedMarker of addedMarkers) {
        console.log('addedMarker', addedMarker)
        this._addGeoJson(TYPE_MARKER, addedMarker)
      }
    }

    // Epics changed?
    if (!_.isEqual(activeEpics.sort(), nextProps.activeEpics.sort())) {
      console.debug('###### Epics changed')
      utilsQuery.updateQueryStringParameter('epics', nextProps.activeEpics)
      const removedEpics = _.difference(activeEpics, nextProps.activeEpics)
      const addedEpics = _.difference(nextProps.activeEpics, activeEpics)

      // iterate to remove
      for (const removedEpic of removedEpics) {
        console.log('removing Epic', removedEpic)
        mapStyleDirty = this._removeEpic(removedEpic)
      }

      // iterate to add
      for (const addedEpic of addedEpics) {
        console.log('addedEpic', addedEpic)
        this._addEpic(addedEpic)
      }
    }

    if (mapStyleDirty) {
      this.setState({ mapStyle: mapStyleDirty })
    }
    // if drawer changed
    // this._resize() // TODO: is this necessary?
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
    this.setState({ mapStyle })
  };

  _addGeoJson = (sourceId, entityId, fullData = false) => {
    if (fullData) {
      const mapStyle = this.state.mapStyle
        .updateIn(['sources', TYPE_MARKER, 'data', 'features'], list => list.concat(fullData.map((feature) => {
          feature.properties.isEpic = true
          return feature
        })))
      this.setState({ mapStyle })
    } else if (entityId.toString() !== '') {
      axios.get(properties.chronasApiHost + '/markers?types=' + entityId + '&year=' + this.props.selectedYear)
        .then(features => {
          const mapStyle = this.state.mapStyle
            .updateIn(['sources', sourceId, 'data', 'features'], list => list.concat(features.data))
          this.setState({ mapStyle })
        })
    }
  }

  _addEpic = (subtype) => {
    if (subtype.toString() !== '') {
      axios.get(properties.chronasApiHost + '/metadata?type=e&end=10000&subtype=' + subtype)
      .then(res => {
        this.setState({
          epics: this.state.epics.concat(res.data.filter(el => el.data.participants.length > 0 && el.data.content.length > 0).map((el) => {
            const endYear = el.data.end
            return {
              start: new Date(new Date(0, 1, 1).setFullYear(+el.data.start)),
              className: 'timelineItem_wars',
              editable: false,
              end: endYear ? new Date(new Date(0, 1, 1).setFullYear(+endYear)) : undefined,
              content: el.data.title,
              title: el.data.title,
              wiki: el.data.wiki,
              group: 1
            }
          }))
        })
      })
    }
  }

  _removeEpic = (subtype) => {
    this.setState({
      epics: _.omit(this.state.epics, subtype)
    })
  }
  _removeGeoJson = (prevMapStyle, sourceId, entityId) => {
    if (entityId === TYPE_EPIC) {
      return prevMapStyle
        .updateIn(['sources', TYPE_MARKER, 'data', 'features'], list => list.filter(function (obj) {
          return (obj.properties.isEpic !== true)
        })).setIn(['sources', 'area-hover', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': [ ]
        })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': [ ]
        }))
    } else {
      return prevMapStyle
        .updateIn(['sources', sourceId, 'data', 'features'], list => list.filter(function (obj) {
          return (obj.properties.t !== entityId)
        }))
    }
  }

  _updateGeoJson = (sourceId, entityId) => {
    setTimeout(() => {
      this._removeGeoJson(sourceId, entityId)
      this._addGeoJson(sourceId, entityId)
    }, 500)
  }

  _changeYear = (year) => {
    // TODO: reset selected marker pools
    axios.get(properties.chronasApiHost + '/areas/' + year)
      .then((areaDefsRequest) => {
        this.props.changeAreaData(areaDefsRequest.data)
        this._simulateYearChange(areaDefsRequest.data)
        this._changeArea(areaDefsRequest.data, this.props.activeArea.label, this.props.activeArea.color, this.props.selectedItem.value)
        utilsQuery.updateQueryStringParameter('year', year)
      })
  }

  _goToViewport = ({ longitude, latitude }) => {
    this._onViewportChange({
      ...this.state.viewport,
      longitude,
      latitude,
      zoom: Math.max(this.state.viewport.zoom + 1, 4.5),
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000
    })
  };

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
      if (layerHovered.layer.id === TYPE_MARKER) {

      } else {

      }
      hoverInfo = {
        lngLat: event.lngLat,
        feature: layerHovered.properties
      }
      provinceName = layerHovered.properties.name

      this.setState({ mapStyle: this.state.mapStyle
          .setIn(['sources', 'area-hover', 'data', 'features'], [{
            'type': 'Feature', 'properties': {}, 'geometry': layerHovered.geometry
          }])
      })
    } else {
      const prevMapStyle = this.state.mapStyle
      let mapStyle = prevMapStyle
        .setIn(['sources', 'area-hover', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': [ ]
        }))
      this.setState({ mapStyle })
    }

    this.setState({
      hoverInfo
    })
  }

  _onClick = event => {
    event.stopPropagation()

    const { modActive, selectedItem } = this.props
    let itemName = ''
    let wikiId = ''

    if ((modActive.type === TYPE_MARKER || modActive.type === TYPE_METADATA)&& modActive.selectActive) {
      this.props.setModData(event.lngLat.map((l) => +l.toFixed(3)))
      return
    } else if (modActive.type === TYPE_AREA) {
      let provinceName = ''
      const province = event.features && event.features[0]
      const prevModData = modActive.data

      if (province) {
        provinceName = province.properties.name
        if (prevModData.indexOf(provinceName) > -1) {
          // remove province
          this.props.removeModData(provinceName)
          this.setState({ mapStyle: this.state.mapStyle
            .updateIn(['sources', 'area-outlines', 'data', 'features'], list => list.filter((obj) => (obj.properties.n !== provinceName)))
          })
        } else {
          // add province
          this.props.addModData(provinceName)
          this.setState({ mapStyle: this.state.mapStyle
            .updateIn(['sources', 'area-outlines', 'data', 'features'], list => list.concat({
              'type': 'Feature', 'properties': { n: provinceName }, 'geometry': province.geometry
            }))
          })
        }
      }
      return
    }

    const layerClicked = event.features && event.features[0]

    if (layerClicked) {
      if (layerClicked.layer.id === TYPE_MARKER) {
        itemName = layerClicked.properties.n
        wikiId = layerClicked.properties.w

        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': [ ]
          }))
        this.setState({
          hoverInfo: null,
          mapStyle
        })
        // setWikiId

        if (selectedItem.type === TYPE_EPIC) {
          utilsQuery.updateQueryStringParameter('type', TYPE_EPIC)
          // utilsQuery.updateQueryStringParameter('wiki', wikiId)
          this.props.setWikiId(wikiId)
        } else {
          utilsQuery.updateQueryStringParameter('type', TYPE_MARKER)
          utilsQuery.updateQueryStringParameter('value', wikiId)
          this.props.selectMarkerItem(wikiId, { ...layerClicked.properties, 'coo': layerClicked.geometry.coordinates })
        }
        if (this.props.modActive.type === TYPE_MARKER) return
      } else {
        itemName = layerClicked.properties.name
        wikiId = layerClicked.properties.wikiUrl
        utilsQuery.updateQueryStringParameter('type', TYPE_AREA)
        utilsQuery.updateQueryStringParameter('value', itemName)

        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': [ ]
          }))
        this.setState({
          hoverInfo: null,
          mapStyle
        })

        if (selectedItem.wiki === WIKI_PROVINCE_TIMELINE || selectedItem.wiki === WIKI_RULER_TIMELINE) {
          this.props.selectValue(itemName)
        } else {
          this.props.selectAreaItem(wikiId, itemName)
        }
      }
      this.props.history.push('/article')
    }
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

  render () {
    const { epics, mapStyle, mapTimelineContainerClass, viewport, arcData } = this.state
    const { modActive, menuDrawerOpen, rightDrawerOpen } = this.props

    let leftOffset = (menuDrawerOpen) ? 156 : 56
    if (rightDrawerOpen) leftOffset -= viewport.width * 0.24

    let modMarker = ((modActive.type === TYPE_MARKER || modActive.type === TYPE_LINKED) && typeof modActive.data[0] !== 'undefined') ? <Marker
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
          style={{
            transition: 'filter 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            filter: (mapTimelineContainerClass === 'mapTimeline') ? 'inherit' : 'blur(10px)'
          }}
          ref={(map) => { this.map = map }}
          {...viewport}
          mapStyle={mapStyle}
          // mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onHover={this._onHover}
          onClick={this._onClick}
          onLoad={this._initializeMap}
        >
          <DeckGLOverlay
            viewport={viewport}
            data={[
              {
                "coordinates": [
                  28.96,
                  13.66033
                ],
                "name": "Al Zarnkh",
                "class": "LL5",
                "mass": "700",
                "year": 2001
              },
              {
                "coordinates": [
                  6.01533,
                  45.82133
                ],
                "name": "Alby sur Chéran",
                "class": "Eucrite-mmict",
                "mass": "252",
                "year": 2002
              },
              {
                "coordinates": [
                  32.41275,
                  20.74575
                ],
                "name": "Almahata Sitta",
                "class": "Ureilite-an",
                "mass": "3950",
                "year": 2008
              },
              {
                "coordinates": [
                  -97.01,
                  31.805
                ],
                "name": "Ash Creek",
                "class": "L6",
                "mass": "9500",
                "year": 2009
              },
              {
                "coordinates": [
                  -5.9,
                  15.78333
                ],
                "name": "Bassikounou",
                "class": "H5",
                "mass": "29560",
                "year": 2006
              },
              {
                "coordinates": [
                  -117.18913,
                  40.66813
                ],
                "name": "Battle Mountain",
                "class": "L6",
                "mass": "2900",
                "year": 2012
              },
              {
                "coordinates": [
                  -8.15,
                  32.25
                ],
                "name": "Benguerir",
                "class": "LL6",
                "mass": "25000",
                "year": 2004
              },
              {
                "coordinates": [
                  10.8,
                  32.86667
                ],
                "name": "Beni M'hira",
                "class": "L6",
                "mass": "19000",
                "year": 2001
              },
              {
                "coordinates": [
                  -7,
                  30
                ],
                "name": "Bensour",
                "class": "LL6",
                "mass": "45000",
                "year": 2002
              },
              {
                "coordinates": [
                  -58.32833,
                  -31.91
                ],
                "name": "Berduc",
                "class": "L6",
                "mass": "270",
                "year": 2008
              },
              {
                "coordinates": [
                  -105.02325,
                  40.30583
                ],
                "name": "Berthoud",
                "class": "Eucrite-mmict",
                "mass": "960",
                "year": 2004
              },
              {
                "coordinates": [
                  73.11528,
                  26.50833
                ],
                "name": "Bhawad",
                "class": "LL6",
                "mass": "678",
                "year": 2002
              },
              {
                "coordinates": [
                  -11.3715,
                  17.71067
                ],
                "name": "Boumdeid (2003)",
                "class": "L6",
                "mass": "190",
                "year": 2003
              },
              {
                "coordinates": [
                  -11.34133,
                  17.17493
                ],
                "name": "Boumdeid (2011)",
                "class": "L6",
                "mass": "3599",
                "year": 2011
              },
              {
                "coordinates": [
                  64.60035,
                  39.77978
                ],
                "name": "Bukhara",
                "class": "CV3",
                "mass": "5300",
                "year": 2001
              },
              {
                "coordinates": [
                  129.19,
                  -31.35
                ],
                "name": "Bunburra Rockhole",
                "class": "Eucrite",
                "mass": "324",
                "year": 2007
              },
              {
                "coordinates": [
                  -109.84817,
                  52.996
                ],
                "name": "Buzzard Coulee",
                "class": "H4",
                "mass": "41000",
                "year": 2008
              },
              {
                "coordinates": [
                  -76.51,
                  3.405
                ],
                "name": "Cali",
                "class": "H/L4",
                "mass": "478",
                "year": 2007
              },
              {
                "coordinates": [
                  -69.04389,
                  -16.66444
                ],
                "name": "Carancas",
                "class": "H4-5",
                "mass": "342",
                "year": 2007
              },
              {
                "coordinates": [
                  61.11667,
                  54.81667
                ],
                "name": "Chelyabinsk",
                "class": "LL5",
                "mass": "100000",
                "year": 2013
              },
              {
                "coordinates": [
                  -5.01472,
                  23.69639
                ],
                "name": "Chergach ",
                "class": "H5",
                "mass": "100000",
                "year": 2007
              },
              {
                "coordinates": [
                  -79.95756,
                  -1.87089
                ],
                "name": "Daule",
                "class": "L5",
                "mass": "6580",
                "year": 2008
              },
              {
                "coordinates": [
                  93.86667,
                  26.68333
                ],
                "name": "Dergaon",
                "class": "H5",
                "mass": "12500",
                "year": 2001
              },
              {
                "coordinates": [
                  81,
                  19
                ],
                "name": "Devgaon",
                "class": "H3.8",
                "mass": "12000",
                "year": 2001
              },
              {
                "coordinates": [
                  27.32997,
                  37.35172
                ],
                "name": "Didim",
                "class": "H3-5",
                "mass": "3396",
                "year": 2007
              },
              {
                "coordinates": [
                  -2.04167,
                  14.15083
                ],
                "name": "Gasseltepaoua",
                "class": "H5",
                "mass": "",
                "year": 2000
              },
              {
                "coordinates": [
                  -79.61667,
                  43.2
                ],
                "name": "Grimsby",
                "class": "H5",
                "mass": "215",
                "year": 2009
              },
              {
                "coordinates": [
                  132.38333,
                  34.45
                ],
                "name": "Hiroshima",
                "class": "H5",
                "mass": "414",
                "year": 2003
              },
              {
                "coordinates": [
                  31.47278,
                  1.345
                ],
                "name": "Hoima",
                "class": "H6",
                "mass": "167.7",
                "year": 2003
              },
              {
                "coordinates": [
                  106.63241,
                  26.46469
                ],
                "name": "Huaxi",
                "class": "H5",
                "mass": "1600",
                "year": 2010
              },
              {
                "coordinates": [
                  14.05217,
                  46.42137
                ],
                "name": "Jesenice",
                "class": "L6",
                "mass": "3667",
                "year": 2009
              },
              {
                "coordinates": [
                  70.31333,
                  22.68
                ],
                "name": "Jodiya",
                "class": "L5",
                "mass": "100",
                "year": 2006
              },
              {
                "coordinates": [
                  73.22329,
                  20.33916
                ],
                "name": "Kaprada",
                "class": "L5/6",
                "mass": "1600",
                "year": 2004
              },
              {
                "coordinates": [
                  77.58333,
                  29.58333
                ],
                "name": "Kasauli",
                "class": "H4",
                "mass": "16820",
                "year": 2003
              },
              {
                "coordinates": [
                  75.81333,
                  25.14333
                ],
                "name": "Kavarpura",
                "class": "Iron, IIE-an",
                "mass": "6800",
                "year": 2006
              },
              {
                "coordinates": [
                  29.41822,
                  36.54194
                ],
                "name": "Kemer",
                "class": "L4",
                "mass": "5760",
                "year": 2008
              },
              {
                "coordinates": [
                  86.70278,
                  20.4625
                ],
                "name": "Kendrapara",
                "class": "H4-5",
                "mass": "6669.2",
                "year": 2003
              },
              {
                "coordinates": [
                  9.8,
                  12.76667
                ],
                "name": "Kilabo",
                "class": "LL6",
                "mass": "19000",
                "year": 2002
              },
              {
                "coordinates": [
                  21.17633,
                  48.76367
                ],
                "name": "Košice",
                "class": "H5",
                "mass": "4300",
                "year": 2010
              },
              {
                "coordinates": [
                  -77.21163,
                  38.70066
                ],
                "name": "Lorton",
                "class": "L6",
                "mass": "329.7",
                "year": 2010
              },
              {
                "coordinates": [
                  95.78333,
                  27.66667
                ],
                "name": "Mahadevpur",
                "class": "H4/5",
                "mass": "70500",
                "year": 2007
              },
              {
                "coordinates": [
                  9.38333,
                  12.83333
                ],
                "name": "Maigatari-Danduma",
                "class": "H5/6",
                "mass": "4629",
                "year": 2004
              },
              {
                "coordinates": [
                  11.46745,
                  54.76183
                ],
                "name": "Maribo",
                "class": "CM2",
                "mass": "25.81",
                "year": 2009
              },
              {
                "coordinates": [
                  48.1,
                  -14.2
                ],
                "name": "Maromandia",
                "class": "L6",
                "mass": "6000",
                "year": 2002
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Mason Gully",
                "class": "H5",
                "mass": "24.54",
                "year": 2010
              },
              {
                "coordinates": [
                  -90.36556,
                  42.9075
                ],
                "name": "Mifflin",
                "class": "L5",
                "mass": "3584",
                "year": 2010
              },
              {
                "coordinates": [
                  18.53333,
                  49.6
                ],
                "name": "Morávka",
                "class": "H5",
                "mass": "633",
                "year": 2000
              },
              {
                "coordinates": [
                  10.7,
                  59.43333
                ],
                "name": "Moss",
                "class": "CO3.6",
                "mass": "3763",
                "year": 2006
              },
              {
                "coordinates": [
                  10.80833,
                  47.525
                ],
                "name": "Neuschwanstein",
                "class": "EL6",
                "mass": "6189",
                "year": 2002
              },
              {
                "coordinates": [
                  -90.10976,
                  29.94718
                ],
                "name": "New Orleans",
                "class": "H5",
                "mass": "19256",
                "year": 2003
              },
              {
                "coordinates": [
                  -81.36222,
                  28.5475
                ],
                "name": "Orlando",
                "class": "Eucrite",
                "mass": "180",
                "year": 2004
              },
              {
                "coordinates": [
                  0.08,
                  12.9
                ],
                "name": "Ouadangou",
                "class": "L5",
                "mass": "4440",
                "year": 2003
              },
              {
                "coordinates": [
                  -13.1,
                  24.3
                ],
                "name": "Oum Dreyga",
                "class": "H3-5",
                "mass": "17000",
                "year": 2003
              },
              {
                "coordinates": [
                  -87.67917,
                  41.48472
                ],
                "name": "Park Forest",
                "class": "L5",
                "mass": "18000",
                "year": 2003
              },
              {
                "coordinates": [
                  26.70972,
                  45.275
                ],
                "name": "Pleşcoi",
                "class": "L5-6",
                "mass": "6913",
                "year": 2008
              },
              {
                "coordinates": [
                  -3.51667,
                  39.35
                ],
                "name": "Puerto Lápice",
                "class": "Eucrite-br",
                "mass": "500",
                "year": 2007
              },
              {
                "coordinates": [
                  -119.75812,
                  38.13742
                ],
                "name": "Red Canyon Lake",
                "class": "H5",
                "mass": "18.41",
                "year": 2007
              },
              {
                "coordinates": [
                  13,
                  43.66667
                ],
                "name": "San Michele",
                "class": "L6",
                "mass": "237",
                "year": 2002
              },
              {
                "coordinates": [
                  -68.48944,
                  -31.53556
                ],
                "name": "Santa Lucia (2008)",
                "class": "L6",
                "mass": "4000",
                "year": 2008
              },
              {
                "coordinates": [
                  22.005,
                  54.00883
                ],
                "name": "Sołtmany",
                "class": "L6",
                "mass": "1066",
                "year": 2011
              },
              {
                "coordinates": [
                  78.03333,
                  12.66667
                ],
                "name": "Sulagiri",
                "class": "LL6",
                "mass": "110000",
                "year": 2008
              },
              {
                "coordinates": [
                  -120.90806,
                  38.80389
                ],
                "name": "Sutter's Mill",
                "class": "C",
                "mass": "992.5",
                "year": 2012
              },
              {
                "coordinates": [
                  -134.20139,
                  59.70444
                ],
                "name": "Tagish Lake",
                "class": "C2-ung",
                "mass": "10000",
                "year": 2000
              },
              {
                "coordinates": [
                  -7.015,
                  31.16333
                ],
                "name": "Tamdakht",
                "class": "H5",
                "mass": "100000",
                "year": 2008
              },
              {
                "coordinates": [
                  37.15028,
                  -1.00278
                ],
                "name": "Thika",
                "class": "L6",
                "mass": "14200",
                "year": 2011
              },
              {
                "coordinates": [
                  27.58333,
                  -29.33333
                ],
                "name": "Thuathe",
                "class": "H4/5",
                "mass": "45300",
                "year": 2002
              },
              {
                "coordinates": [
                  -7.61123,
                  29.48195
                ],
                "name": "Tissint",
                "class": "Martian (shergottite)",
                "mass": "7000",
                "year": 2011
              },
              {
                "coordinates": [
                  -41.73356,
                  -20.85001
                ],
                "name": "Varre-Sai",
                "class": "L5",
                "mass": "2500",
                "year": 2010
              },
              {
                "coordinates": [
                  -4.66667,
                  42.8
                ],
                "name": "Villalbeto de la Peña",
                "class": "L6",
                "mass": "3500",
                "year": 2004
              },
              {
                "coordinates": [
                  21.78713,
                  32.79732
                ],
                "name": "Werdama",
                "class": "H5",
                "mass": "4000",
                "year": 2006
              },
              {
                "coordinates": [
                  -110.43418,
                  31.96185
                ],
                "name": "Whetstone Mountains",
                "class": "H5",
                "mass": "2138.7399999999998",
                "year": 2009
              },
              {
                "coordinates": [
                  45.17,
                  13.71111
                ],
                "name": "Yafa",
                "class": "H5",
                "mass": "5700",
                "year": 2000
              },
              {
                "coordinates": [
                  48.95937,
                  22.72192
                ],
                "name": "Abar al' Uj 001",
                "class": "H3.8",
                "mass": "194.34",
                "year": 2008
              },
              {
                "coordinates": [
                  4.06117,
                  27.5455
                ],
                "name": "Acfer 321",
                "class": "H5",
                "mass": "157",
                "year": 2001
              },
              {
                "coordinates": [
                  4.093,
                  27.55917
                ],
                "name": "Acfer 322",
                "class": "L5",
                "mass": "25",
                "year": 2001
              },
              {
                "coordinates": [
                  3.8795,
                  27.503
                ],
                "name": "Acfer 323",
                "class": "LL5",
                "mass": "117",
                "year": 2001
              },
              {
                "coordinates": [
                  3.86983,
                  27.50083
                ],
                "name": "Acfer 324",
                "class": "CR2",
                "mass": "69",
                "year": 2001
              },
              {
                "coordinates": [
                  4.43333,
                  27.73333
                ],
                "name": "Acfer 327",
                "class": "H5",
                "mass": "745.22",
                "year": 2001
              },
              {
                "coordinates": [
                  4.21667,
                  27.73333
                ],
                "name": "Acfer 328",
                "class": "CV3",
                "mass": "180.07",
                "year": 2001
              },
              {
                "coordinates": [
                  4.1,
                  27.58333
                ],
                "name": "Acfer 329",
                "class": "L4/5",
                "mass": "30000",
                "year": 2001
              },
              {
                "coordinates": [
                  4.03333,
                  27.65
                ],
                "name": "Acfer 330",
                "class": "L6",
                "mass": "490",
                "year": 2001
              },
              {
                "coordinates": [
                  4.01667,
                  27.58333
                ],
                "name": "Acfer 331",
                "class": "CM2",
                "mass": "750",
                "year": 2001
              },
              {
                "coordinates": [
                  4.13333,
                  27.73333
                ],
                "name": "Acfer 332",
                "class": "CO3",
                "mass": "115.02",
                "year": 2001
              },
              {
                "coordinates": [
                  4.06667,
                  27.56667
                ],
                "name": "Acfer 333",
                "class": "CO3",
                "mass": "489",
                "year": 2001
              },
              {
                "coordinates": [
                  4.38333,
                  27.65
                ],
                "name": "Acfer 334",
                "class": "L6",
                "mass": "211.25",
                "year": 2002
              },
              {
                "coordinates": [
                  4.43333,
                  27.73333
                ],
                "name": "Acfer 335",
                "class": "H4",
                "mass": "261",
                "year": 2002
              },
              {
                "coordinates": [
                  4.06667,
                  27.61667
                ],
                "name": "Acfer 336",
                "class": "L3.8",
                "mass": "19400",
                "year": 2002
              },
              {
                "coordinates": [
                  4.26667,
                  27.68333
                ],
                "name": "Acfer 337",
                "class": "L3.8",
                "mass": "360",
                "year": 2002
              },
              {
                "coordinates": [
                  4.26667,
                  27.71667
                ],
                "name": "Acfer 338",
                "class": "H6",
                "mass": "377.6",
                "year": 2002
              },
              {
                "coordinates": [
                  4.2,
                  27.55
                ],
                "name": "Acfer 339",
                "class": "H5",
                "mass": "400",
                "year": 2002
              },
              {
                "coordinates": [
                  4.3,
                  27.58333
                ],
                "name": "Acfer 340",
                "class": "L5",
                "mass": "173.15",
                "year": 2002
              },
              {
                "coordinates": [
                  3.83333,
                  27.46667
                ],
                "name": "Acfer 341",
                "class": "L3",
                "mass": "132",
                "year": 2002
              },
              {
                "coordinates": [
                  4.66278,
                  27.59056
                ],
                "name": "Acfer 342",
                "class": "L6",
                "mass": "1276",
                "year": 2002
              },
              {
                "coordinates": [
                  4.265,
                  27.61972
                ],
                "name": "Acfer 343",
                "class": "H3-5",
                "mass": "140",
                "year": 2002
              },
              {
                "coordinates": [
                  4.19833,
                  27.73333
                ],
                "name": "Acfer 344",
                "class": "H3",
                "mass": "410",
                "year": 2002
              },
              {
                "coordinates": [
                  3.81417,
                  27.46472
                ],
                "name": "Acfer 345",
                "class": "LL5",
                "mass": "53",
                "year": 2002
              },
              {
                "coordinates": [
                  4.66278,
                  27.59056
                ],
                "name": "Acfer 346",
                "class": "LL6",
                "mass": "546",
                "year": 2002
              },
              {
                "coordinates": [
                  4.3,
                  27.68333
                ],
                "name": "Acfer 347",
                "class": "L3",
                "mass": "1165",
                "year": 2001
              },
              {
                "coordinates": [
                  4.27817,
                  27.97933
                ],
                "name": "Acfer 348",
                "class": "L5",
                "mass": "8750",
                "year": 2001
              },
              {
                "coordinates": [
                  4.31433,
                  27.84067
                ],
                "name": "Acfer 349",
                "class": "H6",
                "mass": "298",
                "year": 2001
              },
              {
                "coordinates": [
                  4.52633,
                  27.672
                ],
                "name": "Acfer 350",
                "class": "H4",
                "mass": "128",
                "year": 2001
              },
              {
                "coordinates": [
                  4.13333,
                  27.7
                ],
                "name": "Acfer 351",
                "class": "L6",
                "mass": "211",
                "year": 2001
              },
              {
                "coordinates": [
                  4.01667,
                  27.76667
                ],
                "name": "Acfer 352",
                "class": "L5",
                "mass": "873",
                "year": 2001
              },
              {
                "coordinates": [
                  3.89,
                  27.48917
                ],
                "name": "Acfer 353",
                "class": "Eucrite-cm",
                "mass": "11935",
                "year": 2001
              },
              {
                "coordinates": [
                  3.88233,
                  27.5005
                ],
                "name": "Acfer 354",
                "class": "LL5",
                "mass": "252",
                "year": 2001
              },
              {
                "coordinates": [
                  3.781,
                  27.58967
                ],
                "name": "Acfer 355",
                "class": "LL5",
                "mass": "161",
                "year": 2002
              },
              {
                "coordinates": [
                  4.5285,
                  27.61233
                ],
                "name": "Acfer 356",
                "class": "EL6",
                "mass": "120",
                "year": 2002
              },
              {
                "coordinates": [
                  4.87467,
                  27.50083
                ],
                "name": "Acfer 357",
                "class": "LL5",
                "mass": "62",
                "year": 2001
              },
              {
                "coordinates": [
                  4.41667,
                  27.76667
                ],
                "name": "Acfer 358",
                "class": "H6",
                "mass": "70",
                "year": 2002
              },
              {
                "coordinates": [
                  4.48333,
                  27.7
                ],
                "name": "Acfer 359",
                "class": "H6",
                "mass": "67",
                "year": 2002
              },
              {
                "coordinates": [
                  3.76667,
                  27.48333
                ],
                "name": "Acfer 360",
                "class": "Ureilite",
                "mass": "68",
                "year": 2002
              },
              {
                "coordinates": [
                  3.87135,
                  27.42958
                ],
                "name": "Acfer 361",
                "class": "H4",
                "mass": "138",
                "year": 2002
              },
              {
                "coordinates": [
                  3.70165,
                  27.4778
                ],
                "name": "Acfer 362",
                "class": "H5",
                "mass": "242.8",
                "year": 2002
              },
              {
                "coordinates": [
                  4.29388,
                  27.58163
                ],
                "name": "Acfer 363",
                "class": "LL4",
                "mass": "389.9",
                "year": 2002
              },
              {
                "coordinates": [
                  4.51667,
                  27.7
                ],
                "name": "Acfer 364",
                "class": "LL6",
                "mass": "656",
                "year": 2002
              },
              {
                "coordinates": [
                  3.93567,
                  27.60933
                ],
                "name": "Acfer 365",
                "class": "L5",
                "mass": "1456",
                "year": 2002
              },
              {
                "coordinates": [
                  3.93567,
                  26.60933
                ],
                "name": "Acfer 366",
                "class": "CH3",
                "mass": "1456",
                "year": 2002
              },
              {
                "coordinates": [
                  4.42917,
                  27.68433
                ],
                "name": "Acfer 367",
                "class": "H5",
                "mass": "410",
                "year": 2002
              },
              {
                "coordinates": [
                  4.386,
                  27.68883
                ],
                "name": "Acfer 368",
                "class": "H4",
                "mass": "126",
                "year": 2002
              },
              {
                "coordinates": [
                  4.64833,
                  27.667
                ],
                "name": "Acfer 369",
                "class": "H4",
                "mass": "122",
                "year": 2002
              },
              {
                "coordinates": [
                  4.35667,
                  27.6725
                ],
                "name": "Acfer 370",
                "class": "Chondrite-ung",
                "mass": "129",
                "year": 2002
              },
              {
                "coordinates": [
                  4.46533,
                  27.67817
                ],
                "name": "Acfer 371",
                "class": "L5",
                "mass": "9608",
                "year": 2002
              },
              {
                "coordinates": [
                  3.887,
                  26.61167
                ],
                "name": "Acfer 372",
                "class": "LL6",
                "mass": "238",
                "year": 2002
              },
              {
                "coordinates": [
                  3.94433,
                  26.62583
                ],
                "name": "Acfer 373",
                "class": "H5",
                "mass": "128",
                "year": 2002
              },
              {
                "coordinates": [
                  4.053,
                  26.60867
                ],
                "name": "Acfer 374",
                "class": "CO3",
                "mass": "118",
                "year": 2002
              },
              {
                "coordinates": [
                  3.76383,
                  27.5085
                ],
                "name": "Acfer 375",
                "class": "LL6",
                "mass": "495",
                "year": 2002
              },
              {
                "coordinates": [
                  3.935,
                  27.6395
                ],
                "name": "Acfer 376",
                "class": "H6",
                "mass": "132",
                "year": 2002
              },
              {
                "coordinates": [
                  3.97683,
                  27.6625
                ],
                "name": "Acfer 377",
                "class": "L4",
                "mass": "132",
                "year": 2002
              },
              {
                "coordinates": [
                  3.75,
                  27.4
                ],
                "name": "Acfer 378",
                "class": "LL6",
                "mass": "1320",
                "year": 2003
              },
              {
                "coordinates": [
                  3.70467,
                  27.4114
                ],
                "name": "Acfer 379",
                "class": "H4",
                "mass": "14764",
                "year": 2004
              },
              {
                "coordinates": [
                  4.41667,
                  27.76667
                ],
                "name": "Acfer 380",
                "class": "H5",
                "mass": "849",
                "year": 2002
              },
              {
                "coordinates": [
                  4.45,
                  27.7
                ],
                "name": "Acfer 381",
                "class": "L6",
                "mass": "292",
                "year": 2002
              },
              {
                "coordinates": [
                  3.93333,
                  27.63333
                ],
                "name": "Acfer 382",
                "class": "H5",
                "mass": "101",
                "year": 2002
              },
              {
                "coordinates": [
                  3.7,
                  27.36017
                ],
                "name": "Acfer 386",
                "class": "L5",
                "mass": "200",
                "year": 2004
              },
              {
                "coordinates": [
                  4.015,
                  27.558
                ],
                "name": "Acfer 387",
                "class": "H4-6",
                "mass": "177",
                "year": 2004
              },
              {
                "coordinates": [
                  3.86667,
                  27.61667
                ],
                "name": "Acfer 388",
                "class": "H4",
                "mass": "1072",
                "year": 2004
              },
              {
                "coordinates": [
                  3.68167,
                  27.504
                ],
                "name": "Acfer 389",
                "class": "H5",
                "mass": "397",
                "year": 2004
              },
              {
                "coordinates": [
                  3.693,
                  27.5025
                ],
                "name": "Acfer 390",
                "class": "H4",
                "mass": "578",
                "year": 2004
              },
              {
                "coordinates": [
                  4.172,
                  27.59617
                ],
                "name": "Acfer 391",
                "class": "H4",
                "mass": "388",
                "year": 2004
              },
              {
                "coordinates": [
                  3.88033,
                  27.51867
                ],
                "name": "Acfer 394",
                "class": "CR2",
                "mass": "364",
                "year": 2001
              },
              {
                "coordinates": [
                  3.88767,
                  27.50917
                ],
                "name": "Acfer 395",
                "class": "CR2",
                "mass": "394",
                "year": 2001
              },
              {
                "coordinates": [
                  3.89783,
                  27.512
                ],
                "name": "Acfer 396",
                "class": "CR2",
                "mass": "148",
                "year": 2001
              },
              {
                "coordinates": [
                  3.89583,
                  27.509
                ],
                "name": "Acfer 397",
                "class": "CR2",
                "mass": "105",
                "year": 2001
              },
              {
                "coordinates": [
                  3.86083,
                  27.50217
                ],
                "name": "Acfer 398",
                "class": "CR2",
                "mass": "97",
                "year": 2001
              },
              {
                "coordinates": [
                  3.8725,
                  27.50267
                ],
                "name": "Acfer 399",
                "class": "CR2",
                "mass": "89",
                "year": 2001
              },
              {
                "coordinates": [
                  3.86617,
                  27.50083
                ],
                "name": "Acfer 400",
                "class": "CR2",
                "mass": "101",
                "year": 2001
              },
              {
                "coordinates": [
                  4.44267,
                  27.68917
                ],
                "name": "Acfer 401",
                "class": "L5",
                "mass": "9",
                "year": 2002
              },
              {
                "coordinates": [
                  -10.15367,
                  22.9935
                ],
                "name": "Adam Talha",
                "class": "LL3.2",
                "mass": "259.3",
                "year": 2005
              },
              {
                "coordinates": [
                  9,
                  20.5
                ],
                "name": "Adrar Bous",
                "class": "EL5",
                "mass": "360",
                "year": 2001
              },
              {
                "coordinates": [
                  9.35545,
                  19.64008
                ],
                "name": "Adrar Chiriet",
                "class": "L6",
                "mass": "926",
                "year": 2003
              },
              {
                "coordinates": [
                  10.4941,
                  18.61042
                ],
                "name": "Adrar Madet 002",
                "class": "LL3",
                "mass": "2200",
                "year": 2002
              },
              {
                "coordinates": [
                  10.03503,
                  17.67987
                ],
                "name": "Adrar Yaouelt",
                "class": "H5",
                "mass": "2730",
                "year": 2002
              },
              {
                "coordinates": [
                  -5.51528,
                  31.98457
                ],
                "name": "Agoudal",
                "class": "Iron, IIAB",
                "mass": "100000",
                "year": 2000
              },
              {
                "coordinates": [
                  -4.9,
                  30.55
                ],
                "name": "Agoult",
                "class": "Eucrite",
                "mass": "82",
                "year": 2000
              },
              {
                "coordinates": [
                  4.35,
                  27.4
                ],
                "name": "Aguemour 017",
                "class": "L6",
                "mass": "1000",
                "year": 2001
              },
              {
                "coordinates": [
                  28.9698,
                  30.70952
                ],
                "name": "Al Alamayn",
                "class": "H5",
                "mass": "13.31",
                "year": 2005
              },
              {
                "coordinates": [
                  -12.5,
                  27.5
                ],
                "name": "Al Haggounia 001",
                "class": "Aubrite",
                "mass": "3000000",
                "year": 2006
              },
              {
                "coordinates": [
                  57.18833,
                  19.42
                ],
                "name": "Al Huqf 001",
                "class": "L4",
                "mass": "41.5",
                "year": 2000
              },
              {
                "coordinates": [
                  57.38667,
                  19.27167
                ],
                "name": "Al Huqf 002",
                "class": "H5",
                "mass": "81.400000000000006",
                "year": 2000
              },
              {
                "coordinates": [
                  57.11952,
                  19.50695
                ],
                "name": "Al Huqf 003",
                "class": "L4",
                "mass": "115.42",
                "year": 2002
              },
              {
                "coordinates": [
                  57.09807,
                  19.54482
                ],
                "name": "Al Huqf 004",
                "class": "L5",
                "mass": "260.22000000000003",
                "year": 2002
              },
              {
                "coordinates": [
                  57.00848,
                  19.84057
                ],
                "name": "Al Huqf 005",
                "class": "L6",
                "mass": "763.29",
                "year": 2002
              },
              {
                "coordinates": [
                  57.00842,
                  19.84067
                ],
                "name": "Al Huqf 006",
                "class": "L6",
                "mass": "1861.21",
                "year": 2002
              },
              {
                "coordinates": [
                  57.00953,
                  19.84128
                ],
                "name": "Al Huqf 007",
                "class": "L5",
                "mass": "1042.7",
                "year": 2002
              },
              {
                "coordinates": [
                  57.00747,
                  19.84203
                ],
                "name": "Al Huqf 008",
                "class": "L6",
                "mass": "1074.3",
                "year": 2002
              },
              {
                "coordinates": [
                  57.00013,
                  19.8423
                ],
                "name": "Al Huqf 009",
                "class": "H4",
                "mass": "39.83",
                "year": 2002
              },
              {
                "coordinates": [
                  57.0028,
                  19.86785
                ],
                "name": "Al Huqf 010",
                "class": "L6",
                "mass": "41539.300000000003",
                "year": 2002
              },
              {
                "coordinates": [
                  57.0032,
                  19.86607
                ],
                "name": "Al Huqf 011",
                "class": "L6",
                "mass": "8056",
                "year": 2002
              },
              {
                "coordinates": [
                  57.32137,
                  19.80252
                ],
                "name": "Al Huqf 012",
                "class": "L6",
                "mass": "402.75",
                "year": 2003
              },
              {
                "coordinates": [
                  57.03332,
                  19.60308
                ],
                "name": "Al Huqf 050",
                "class": "H4",
                "mass": "1066.2",
                "year": 2002
              },
              {
                "coordinates": [
                  57.32137,
                  19.80252
                ],
                "name": "Al Huqf 051",
                "class": "L6",
                "mass": "402.75",
                "year": 2003
              },
              {
                "coordinates": [
                  57.0433,
                  19.65675
                ],
                "name": "Al Huqf 052",
                "class": "H~5",
                "mass": "1319.4",
                "year": 2001
              },
              {
                "coordinates": [
                  57.27038,
                  19.61287
                ],
                "name": "Al Huqf 053",
                "class": "H~5",
                "mass": "854.7",
                "year": 2001
              },
              {
                "coordinates": [
                  57.2698,
                  19.61612
                ],
                "name": "Al Huqf 054",
                "class": "L~6",
                "mass": "2936.5",
                "year": 2001
              },
              {
                "coordinates": [
                  57.28857,
                  19.64073
                ],
                "name": "Al Huqf 055",
                "class": "H4",
                "mass": "1865.6",
                "year": 2001
              },
              {
                "coordinates": [
                  57.3334,
                  19.66453
                ],
                "name": "Al Huqf 056",
                "class": "H5",
                "mass": "124",
                "year": 2001
              },
              {
                "coordinates": [
                  57.08427,
                  19.53112
                ],
                "name": "Al Huqf 057",
                "class": "H5",
                "mass": "105.3",
                "year": 2001
              },
              {
                "coordinates": [
                  57.1693,
                  19.3421
                ],
                "name": "Al Huqf 058",
                "class": "L~6",
                "mass": "97.7",
                "year": 2001
              },
              {
                "coordinates": [
                  57.27343,
                  19.31468
                ],
                "name": "Al Huqf 059",
                "class": "L~3",
                "mass": "362.7",
                "year": 2001
              },
              {
                "coordinates": [
                  57.26818,
                  19.40518
                ],
                "name": "Al Huqf 060",
                "class": "L~6",
                "mass": "913.1",
                "year": 2001
              },
              {
                "coordinates": [
                  57.29878,
                  19.40772
                ],
                "name": "Al Huqf 062",
                "class": "H~4",
                "mass": "50.7",
                "year": 2001
              },
              {
                "coordinates": [
                  57.02345,
                  19.44533
                ],
                "name": "Al Huqf 063",
                "class": "L6",
                "mass": "591.79999999999995",
                "year": 2006
              },
              {
                "coordinates": [
                  57.27497,
                  19.40412
                ],
                "name": "Al Huqf 064",
                "class": "H4",
                "mass": "12834",
                "year": 2002
              },
              {
                "coordinates": [
                  57.22977,
                  19.32092
                ],
                "name": "Al Huqf 065",
                "class": "L6",
                "mass": "2084.16",
                "year": 2007
              },
              {
                "coordinates": [
                  57.1292,
                  19.51053
                ],
                "name": "Al Huqf 066",
                "class": "L4",
                "mass": "150.05699999999999",
                "year": 2007
              },
              {
                "coordinates": [
                  57.54063,
                  19.22597
                ],
                "name": "Al Huqf 067",
                "class": "H4",
                "mass": "61.6",
                "year": 2009
              },
              {
                "coordinates": [
                  57.58427,
                  19.14025
                ],
                "name": "Al Huqf 068",
                "class": "L3",
                "mass": "165.4",
                "year": 2009
              },
              {
                "coordinates": [
                  57.13412,
                  19.26795
                ],
                "name": "Al Huqf 069",
                "class": "H4/5",
                "mass": "250.5",
                "year": 2009
              },
              {
                "coordinates": [
                  57.10978,
                  19.18798
                ],
                "name": "Al Huqf 070",
                "class": "L4",
                "mass": "2632.8",
                "year": 2009
              },
              {
                "coordinates": [
                  55.32742,
                  22.80487
                ],
                "name": "Al Huwaysah 001",
                "class": "LL6",
                "mass": "3150.5",
                "year": 2009
              },
              {
                "coordinates": [
                  55.31673,
                  22.79853
                ],
                "name": "Al Huwaysah 002",
                "class": "LL6",
                "mass": "690.5",
                "year": 2009
              },
              {
                "coordinates": [
                  55.37323,
                  22.74862
                ],
                "name": "Al Huwaysah 003",
                "class": "L4-6",
                "mass": "273.05",
                "year": 2010
              },
              {
                "coordinates": [
                  55.39522,
                  22.74733
                ],
                "name": "Al Huwaysah 004",
                "class": "H5",
                "mass": "141.51",
                "year": 2010
              },
              {
                "coordinates": [
                  55.33122,
                  22.73342
                ],
                "name": "Al Huwaysah 005",
                "class": "L(LL)3.5-3.7",
                "mass": "1228.0999999999999",
                "year": 2010
              },
              {
                "coordinates": [
                  55.3191,
                  22.73743
                ],
                "name": "Al Huwaysah 006",
                "class": "L6",
                "mass": "16.41",
                "year": 2010
              },
              {
                "coordinates": [
                  55.3204,
                  22.73393
                ],
                "name": "Al Huwaysah 007",
                "class": "L6",
                "mass": "1.56",
                "year": 2010
              },
              {
                "coordinates": [
                  55.32125,
                  22.73797
                ],
                "name": "Al Huwaysah 008",
                "class": "H4",
                "mass": "356.2",
                "year": 2010
              },
              {
                "coordinates": [
                  55.41402,
                  22.75747
                ],
                "name": "Al Huwaysah 009",
                "class": "H6",
                "mass": "3407.8",
                "year": 2010
              },
              {
                "coordinates": [
                  55.47218,
                  22.74868
                ],
                "name": "Al Huwaysah 010",
                "class": "Achondrite-ung",
                "mass": "1411.8",
                "year": 2010
              },
              {
                "coordinates": [
                  55.3908,
                  22.75978
                ],
                "name": "Al Huwaysah 011",
                "class": "L4-5",
                "mass": "112.76",
                "year": 2010
              },
              {
                "coordinates": [
                  55.34027,
                  22.67752
                ],
                "name": "Al Huwaysah 012",
                "class": "H5",
                "mass": "4694.8999999999996",
                "year": 2010
              },
              {
                "coordinates": [
                  55.33652,
                  22.68423
                ],
                "name": "Al Huwaysah 013",
                "class": "H6",
                "mass": "55.51",
                "year": 2010
              },
              {
                "coordinates": [
                  55.32092,
                  22.68598
                ],
                "name": "Al Huwaysah 014",
                "class": "H6",
                "mass": "45.52",
                "year": 2010
              },
              {
                "coordinates": [
                  55.32087,
                  22.68922
                ],
                "name": "Al Huwaysah 015",
                "class": "H6",
                "mass": "35.299999999999997",
                "year": 2010
              },
              {
                "coordinates": [
                  55.3336,
                  22.69813
                ],
                "name": "Al Huwaysah 016",
                "class": "H5",
                "mass": "1330.9",
                "year": 2010
              },
              {
                "coordinates": [
                  55.36247,
                  22.73852
                ],
                "name": "Al Huwaysah 017",
                "class": "L6",
                "mass": "439.58",
                "year": 2010
              },
              {
                "coordinates": [
                  81.25,
                  40.33333
                ],
                "name": "Alaer 001",
                "class": "LL5",
                "mass": "1.7",
                "year": 2007
              },
              {
                "coordinates": [
                  81.25,
                  40.33333
                ],
                "name": "Alaer 002",
                "class": "LL5",
                "mass": "1.1",
                "year": 2007
              },
              {
                "coordinates": [
                  -108.9038,
                  32.306
                ],
                "name": "Alkali Flat",
                "class": "L5",
                "mass": "28",
                "year": 2011
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 03541",
                "class": "H5",
                "mass": "1053.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 03542",
                "class": "L6",
                "mass": "20.399999999999999",
                "year": 2003
              },
              {
                "coordinates": [
                  158.76862,
                  -76.71695
                ],
                "name": "Allan Hills 06001",
                "class": "H5",
                "mass": "128.1",
                "year": 2006
              },
              {
                "coordinates": [
                  158.84305,
                  -76.74253
                ],
                "name": "Allan Hills 06002",
                "class": "H~5",
                "mass": "119.2",
                "year": 2006
              },
              {
                "coordinates": [
                  158.79283,
                  -76.71128
                ],
                "name": "Allan Hills 06003",
                "class": "H~5",
                "mass": "25",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77838,
                  -76.70522
                ],
                "name": "Allan Hills 06004",
                "class": "H~5",
                "mass": "61.7",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77838,
                  -76.70522
                ],
                "name": "Allan Hills 06005",
                "class": "H~5",
                "mass": "6",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77587,
                  -76.70558
                ],
                "name": "Allan Hills 06006",
                "class": "H~5",
                "mass": "280.89999999999998",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77583,
                  -76.70552
                ],
                "name": "Allan Hills 06007",
                "class": "H5",
                "mass": "226.3",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77485,
                  -76.70552
                ],
                "name": "Allan Hills 06008",
                "class": "H~5",
                "mass": "120",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77527,
                  -76.71215
                ],
                "name": "Allan Hills 06009",
                "class": "H~5",
                "mass": "28.6",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77862,
                  -76.71263
                ],
                "name": "Allan Hills 06010",
                "class": "H~5",
                "mass": "1.08",
                "year": 2006
              },
              {
                "coordinates": [
                  158.7786,
                  -76.71255
                ],
                "name": "Allan Hills 06011",
                "class": "H~5",
                "mass": "24.3",
                "year": 2006
              },
              {
                "coordinates": [
                  158.77398,
                  -76.71733
                ],
                "name": "Allan Hills 06012",
                "class": "H5",
                "mass": "91",
                "year": 2006
              },
              {
                "coordinates": [
                  159.37238,
                  -76.74403
                ],
                "name": "Allan Hills 09001",
                "class": "L5/6",
                "mass": "0.5",
                "year": 2009
              },
              {
                "coordinates": [
                  159.37458,
                  -76.74245
                ],
                "name": "Allan Hills 09002",
                "class": "L6",
                "mass": "71.599999999999994",
                "year": 2009
              },
              {
                "coordinates": [
                  159.37458,
                  -76.74245
                ],
                "name": "Allan Hills 09003",
                "class": "L6",
                "mass": "15.5",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09004",
                "class": "Howardite",
                "mass": "221.7",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09005",
                "class": "L5",
                "mass": "122.3",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09006",
                "class": "H5",
                "mass": "104.3",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09008",
                "class": "H5",
                "mass": "31.3",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09009",
                "class": "L6",
                "mass": "24.8",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09010",
                "class": "L3.4",
                "mass": "2.6",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09011",
                "class": "LL6",
                "mass": "14.2",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09012",
                "class": "L6",
                "mass": "18.100000000000001",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09013",
                "class": "L6",
                "mass": "25.5",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 09014",
                "class": "L5",
                "mass": "30.2",
                "year": 2009
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 10910",
                "class": "L5",
                "mass": "444.1",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 10911",
                "class": "L6",
                "mass": "218.9",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Allan Hills 10912",
                "class": "H6",
                "mass": "60.3",
                "year": 2010
              },
              {
                "coordinates": [
                  159.45252,
                  -76.76098
                ],
                "name": "Allan Hills 99101",
                "class": "LL3",
                "mass": "103.4",
                "year": 2000
              },
              {
                "coordinates": [
                  -2.95797,
                  32.73458
                ],
                "name": "Anoual",
                "class": "Lunar",
                "mass": "5.92",
                "year": 2006
              },
              {
                "coordinates": [
                  -118.54465,
                  40.90183
                ],
                "name": "Antelope",
                "class": "H4",
                "mass": "754",
                "year": 2012
              },
              {
                "coordinates": [
                  -106.56028,
                  32.00584
                ],
                "name": "Anthony Gap",
                "class": "L6",
                "mass": "347.36",
                "year": 2011
              },
              {
                "coordinates": [
                  -4.06667,
                  31.66667
                ],
                "name": "Aoufous",
                "class": "Eucrite-mmict",
                "mass": "195",
                "year": 2000
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 001",
                "class": "Diogenite",
                "mass": "145",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 002",
                "class": "Eucrite",
                "mass": "54",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 003",
                "class": "Diogenite",
                "mass": "56",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 004",
                "class": "Diogenite",
                "mass": "31",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 005",
                "class": "Eucrite-mmict",
                "mass": "146",
                "year": 2005
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Arabian Peninsula 006",
                "class": "Eucrite-mmict",
                "mass": "67",
                "year": 2005
              },
              {
                "coordinates": [
                  74.44,
                  29.06
                ],
                "name": "Ararki",
                "class": "L5",
                "mass": "4460",
                "year": 2001
              },
              {
                "coordinates": [
                  -109.58517,
                  38.68867
                ],
                "name": "Arches",
                "class": "L5",
                "mass": "534",
                "year": 2001
              },
              {
                "coordinates": [
                  7.34225,
                  18.673
                ],
                "name": "Arlit",
                "class": "H5",
                "mass": "20.100000000000001",
                "year": 2002
              },
              {
                "coordinates": [
                  14.25528,
                  29.35944
                ],
                "name": "Ashuwairif 001",
                "class": "H4",
                "mass": "14566",
                "year": 2008
              },
              {
                "coordinates": [
                  14.26972,
                  29.37972
                ],
                "name": "Ashuwairif 002",
                "class": "L5/6",
                "mass": "11953",
                "year": 2008
              },
              {
                "coordinates": [
                  14.24833,
                  29.35833
                ],
                "name": "Ashuwairif 003",
                "class": "H4",
                "mass": "2900",
                "year": 2008
              },
              {
                "coordinates": [
                  14.27611,
                  29.36583
                ],
                "name": "Ashuwairif 004",
                "class": "L6",
                "mass": "15750",
                "year": 2008
              },
              {
                "coordinates": [
                  14.29233,
                  29.3945
                ],
                "name": "Ashuwairif 005",
                "class": "H4",
                "mass": "335",
                "year": 2010
              },
              {
                "coordinates": [
                  5.91667,
                  19.26667
                ],
                "name": "Assamakka",
                "class": "Iron, IVA-an",
                "mass": "4400",
                "year": 2002
              },
              {
                "coordinates": [
                  -114.16705,
                  34.38063
                ],
                "name": "Aubrey Hills",
                "class": "H6",
                "mass": "560.79999999999995",
                "year": 2010
              },
              {
                "coordinates": [
                  53.99032,
                  17.75793
                ],
                "name": "Aybut 001",
                "class": "H6",
                "mass": "442.26",
                "year": 2002
              },
              {
                "coordinates": [
                  113.28333,
                  46.7
                ],
                "name": "Baruun Urt",
                "class": "H5",
                "mass": "25.9",
                "year": 2002
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00300",
                "class": "Eucrite-unbr",
                "mass": "124.6",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00301",
                "class": "H3.3",
                "mass": "33.799999999999997",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00302",
                "class": "H3.3",
                "mass": "37.1",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00303",
                "class": "H3.3",
                "mass": "15.8",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00304",
                "class": "L6",
                "mass": "709",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00305",
                "class": "H5",
                "mass": "316.39999999999998",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00306",
                "class": "L5",
                "mass": "66.95",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00307",
                "class": "H6",
                "mass": "130.05000000000001",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00308",
                "class": "L5",
                "mass": "10.7",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00309",
                "class": "L5",
                "mass": "24.1",
                "year": 2000
              },
              {
                "coordinates": [
                  153.5,
                  -80.25
                ],
                "name": "Bates Nunataks 00310",
                "class": "LL6",
                "mass": "20.61",
                "year": 2000
              },
              {
                "coordinates": [
                  35.2995,
                  55.54867
                ],
                "name": "Batyushkovo",
                "class": "L5",
                "mass": "4620",
                "year": 2007
              },
              {
                "coordinates": [
                  14.63333,
                  49.76667
                ],
                "name": "Benešov (a)",
                "class": "LL3.5",
                "mass": "9.720000000000001",
                "year": 2011
              },
              {
                "coordinates": [
                  14.63333,
                  49.76667
                ],
                "name": "Benešov (b)",
                "class": "H5",
                "mass": "1.54",
                "year": 2011
              },
              {
                "coordinates": [
                  -95.52937,
                  50.43845
                ],
                "name": "Bernic Lake",
                "class": "Iron, IAB-MG",
                "mass": "9162",
                "year": 2002
              },
              {
                "coordinates": [
                  55.23497,
                  45.4633
                ],
                "name": "Beyneu",
                "class": "H6",
                "mass": "45",
                "year": 2001
              },
              {
                "coordinates": [
                  131.31667,
                  -31.01667
                ],
                "name": "Biduna Blowhole 001",
                "class": "L4",
                "mass": "103.4",
                "year": 2009
              },
              {
                "coordinates": [
                  131.28547,
                  -31.03297
                ],
                "name": "Biduna Blowhole 002",
                "class": "L4",
                "mass": "13",
                "year": 2011
              },
              {
                "coordinates": [
                  131.30394,
                  -31.01964
                ],
                "name": "Biduna Blowhole 003",
                "class": "L6",
                "mass": "0.4",
                "year": 2011
              },
              {
                "coordinates": [
                  131.28553,
                  -31.03278
                ],
                "name": "Biduna Blowhole 004",
                "class": "H5",
                "mass": "114.5",
                "year": 2011
              },
              {
                "coordinates": [
                  -113.275,
                  33.71333
                ],
                "name": "Big Horn Mountains",
                "class": "H4",
                "mass": "91.9",
                "year": 2006
              },
              {
                "coordinates": [
                  9.84069,
                  31.481
                ],
                "name": "Bir Zar 001",
                "class": "H6",
                "mass": "627",
                "year": 2008
              },
              {
                "coordinates": [
                  10.28403,
                  31.93833
                ],
                "name": "Bir Zar 002",
                "class": "L4/5",
                "mass": "331",
                "year": 2008
              },
              {
                "coordinates": [
                  9.87722,
                  31.49972
                ],
                "name": "Bir Zar 003",
                "class": "H3",
                "mass": "39",
                "year": 2008
              },
              {
                "coordinates": [
                  10.19361,
                  31.87164
                ],
                "name": "Bir Zar 004",
                "class": "H6",
                "mass": "19",
                "year": 2008
              },
              {
                "coordinates": [
                  10.19572,
                  31.89689
                ],
                "name": "Bir Zar 005",
                "class": "H4",
                "mass": "17",
                "year": 2008
              },
              {
                "coordinates": [
                  10.19528,
                  31.89831
                ],
                "name": "Bir Zar 006",
                "class": "H6",
                "mass": "21",
                "year": 2008
              },
              {
                "coordinates": [
                  10.1875,
                  31.92181
                ],
                "name": "Bir Zar 007",
                "class": "L6",
                "mass": "5.2",
                "year": 2008
              },
              {
                "coordinates": [
                  10.18961,
                  31.92644
                ],
                "name": "Bir Zar 008",
                "class": "H6",
                "mass": "200",
                "year": 2008
              },
              {
                "coordinates": [
                  10.18961,
                  31.92644
                ],
                "name": "Bir Zar 009",
                "class": "H5-6",
                "mass": "21",
                "year": 2008
              },
              {
                "coordinates": [
                  -119.18352,
                  40.86717
                ],
                "name": "Black Rock 001",
                "class": "L6",
                "mass": "152",
                "year": 2003
              },
              {
                "coordinates": [
                  -69.5,
                  -25
                ],
                "name": "Blanca Estela",
                "class": "Iron, IAB complex",
                "mass": "15600",
                "year": 2002
              },
              {
                "coordinates": [
                  -115.51833,
                  38.66167
                ],
                "name": "Blue Eagle",
                "class": "R3-6",
                "mass": "70",
                "year": 2006
              },
              {
                "coordinates": [
                  -114.19167,
                  35.8675
                ],
                "name": "Bluebird",
                "class": "L6",
                "mass": "3650",
                "year": 2002
              },
              {
                "coordinates": [
                  -118.93683,
                  40.2495
                ],
                "name": "Bluewing 001",
                "class": "Eucrite-mmict",
                "mass": "6.1",
                "year": 2000
              },
              {
                "coordinates": [
                  -118.94642,
                  40.27957
                ],
                "name": "Bluewing 008",
                "class": "H5",
                "mass": "451.7",
                "year": 2001
              },
              {
                "coordinates": [
                  -118.95912,
                  40.2628
                ],
                "name": "Bluewing 029",
                "class": "H6",
                "mass": "83.8",
                "year": 2006
              },
              {
                "coordinates": [
                  -118.94693,
                  40.2819
                ],
                "name": "Bluewing 037",
                "class": "H5",
                "mass": "37.200000000000003",
                "year": 2009
              },
              {
                "coordinates": [
                  -5.15262,
                  31.15643
                ],
                "name": "Bou Azarif",
                "class": "H5",
                "mass": "100000",
                "year": 2010
              },
              {
                "coordinates": [
                  -12.81025,
                  26.6325
                ],
                "name": "Bou Kra",
                "class": "H6",
                "mass": "130",
                "year": 2001
              },
              {
                "coordinates": [
                  -12.70978,
                  26.74853
                ],
                "name": "Bou Kra 002",
                "class": "L5",
                "mass": "606",
                "year": 2010
              },
              {
                "coordinates": [
                  -12.71864,
                  26.81089
                ],
                "name": "Bou Kra 003",
                "class": "L6",
                "mass": "50",
                "year": 2010
              },
              {
                "coordinates": [
                  -12.759,
                  26.707
                ],
                "name": "Bou Kra 004",
                "class": "Eucrite-mmict",
                "mass": "272.75",
                "year": 2010
              },
              {
                "coordinates": [
                  -12.724,
                  26.819
                ],
                "name": "Bou Kra 005",
                "class": "CM2",
                "mass": "31.14",
                "year": 2010
              },
              {
                "coordinates": [
                  -3.2,
                  31.98333
                ],
                "name": "Bouanane",
                "class": "L6",
                "mass": "1395",
                "year": 2009
              },
              {
                "coordinates": [
                  -114.323,
                  34.685
                ],
                "name": "Boulder Mine",
                "class": "L5",
                "mass": "1560",
                "year": 2008
              },
              {
                "coordinates": [
                  -114.06667,
                  33.96667
                ],
                "name": "Bouse",
                "class": "L4-6",
                "mass": "147.4",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.20883,
                  34.72453
                ],
                "name": "Buck Mountain Wash",
                "class": "H3-5",
                "mass": "798",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.22257,
                  34.73245
                ],
                "name": "Buck Mountains 001",
                "class": "H6",
                "mass": "50",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.20783,
                  34.71933
                ],
                "name": "Buck Mountains 002",
                "class": "L6",
                "mass": "18.399999999999999",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.21717,
                  34.7345
                ],
                "name": "Buck Mountains 003",
                "class": "L6",
                "mass": "34200",
                "year": 2005
              },
              {
                "coordinates": [
                  -114.18845,
                  34.70108
                ],
                "name": "Buck Mountains 004",
                "class": "H3-6",
                "mass": "145.80000000000001",
                "year": 2005
              },
              {
                "coordinates": [
                  -114.19097,
                  34.70337
                ],
                "name": "Buck Mountains 005",
                "class": "L6",
                "mass": "859.7",
                "year": 2007
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10930",
                "class": "L6",
                "mass": "374.5",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10932",
                "class": "L6",
                "mass": "879.9",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10933",
                "class": "CR2",
                "mass": "486",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10934",
                "class": "L6",
                "mass": "472.2",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10935",
                "class": "L6",
                "mass": "362.4",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10936",
                "class": "L5",
                "mass": "335.2",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10937",
                "class": "L6",
                "mass": "234.6",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10938",
                "class": "L5",
                "mass": "288",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10939",
                "class": "L6",
                "mass": "143.9",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10940",
                "class": "H6",
                "mass": "161.69999999999999",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10941",
                "class": "L6",
                "mass": "118.8",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10942",
                "class": "L6",
                "mass": "95.4",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10943",
                "class": "CO3",
                "mass": "27.8",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10944",
                "class": "CK4",
                "mass": "39.700000000000003",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10945",
                "class": "H6",
                "mass": "80.3",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10946",
                "class": "L5",
                "mass": "28.3",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10947",
                "class": "H5",
                "mass": "47.2",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10948",
                "class": "L6",
                "mass": "41.6",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10949",
                "class": "L6",
                "mass": "22.6",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10950",
                "class": "H6",
                "mass": "10.3",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10951",
                "class": "L6",
                "mass": "26.1",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10952",
                "class": "L6",
                "mass": "5.8",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10953",
                "class": "H4",
                "mass": "7.9",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10954",
                "class": "L6",
                "mass": "22.7",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10955",
                "class": "L6",
                "mass": "15.1",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10956",
                "class": "H5",
                "mass": "20.399999999999999",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10957",
                "class": "L6",
                "mass": "4.9",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10958",
                "class": "LL6",
                "mass": "0.1",
                "year": 2010
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Buckley Island 10959",
                "class": "H6",
                "mass": "0.3",
                "year": 2010
              },
              {
                "coordinates": [
                  -99.99306,
                  32.24611
                ],
                "name": "Buffalo Gap",
                "class": "Iron, IAB-ung",
                "mass": "9300",
                "year": 2003
              },
              {
                "coordinates": [
                  -98.72383,
                  38.84833
                ],
                "name": "Bunker Hill",
                "class": "L6",
                "mass": "28000",
                "year": 2002
              },
              {
                "coordinates": [
                  -106.88333,
                  39.86667
                ],
                "name": "Burns",
                "class": "Iron, IIIAB",
                "mass": "18400",
                "year": 2003
              },
              {
                "coordinates": [
                  -70.03333,
                  -24.266
                ],
                "name": "Caleta el Cobre 001",
                "class": "H6",
                "mass": "9",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 002",
                "class": "H6",
                "mass": "18",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 003",
                "class": "H5",
                "mass": "338",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 004",
                "class": "H5",
                "mass": "254",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 005",
                "class": "H5",
                "mass": "193",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 006",
                "class": "L6",
                "mass": "179",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 007",
                "class": "L6",
                "mass": "24",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 008",
                "class": "H6",
                "mass": "15",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 009",
                "class": "L4",
                "mass": "95",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 010",
                "class": "L4",
                "mass": "47",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 011",
                "class": "L6",
                "mass": "32",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 012",
                "class": "L4",
                "mass": "17",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 013",
                "class": "L4",
                "mass": "105",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 014",
                "class": "H4",
                "mass": "20",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 015",
                "class": "L6",
                "mass": "115",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 016",
                "class": "H5",
                "mass": "34",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 017",
                "class": "H5",
                "mass": "41",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 018",
                "class": "H5",
                "mass": "6",
                "year": 2010
              },
              {
                "coordinates": [
                  -70.51667,
                  -24.25
                ],
                "name": "Caleta el Cobre 019",
                "class": "H6",
                "mass": "1.1",
                "year": 2010
              },
              {
                "coordinates": [
                  126.61667,
                  -30.31667
                ],
                "name": "Camel Donga 053",
                "class": "LL5-6",
                "mass": "579",
                "year": 2008
              },
              {
                "coordinates": [
                  -111.78558,
                  33.88098
                ],
                "name": "Camp Creek",
                "class": "H4",
                "mass": "3016",
                "year": 2009
              },
              {
                "coordinates": [
                  10.2056,
                  20.12593
                ],
                "name": "Capot Rey",
                "class": "H5",
                "mass": "38000",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.76718,
                  32.91745
                ],
                "name": "Cargo Muchacho Mountains",
                "class": "CO3",
                "mass": "2860",
                "year": 2000
              },
              {
                "coordinates": [
                  11.35556,
                  44.495
                ],
                "name": "Castenaso",
                "class": "L5",
                "mass": "120",
                "year": 2003
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 002",
                "class": "LL3",
                "mass": "61.1",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 004",
                "class": "Mesosiderite",
                "mass": "37.5",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 005",
                "class": "H4",
                "mass": "228",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 006",
                "class": "H5/6",
                "mass": "19.5",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 007",
                "class": "H4",
                "mass": "11.9",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 008",
                "class": "CO3",
                "mass": "98",
                "year": 2011
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 009",
                "class": "CR2",
                "mass": "5.2",
                "year": 2012
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 010",
                "class": "L~5",
                "mass": "329",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 011",
                "class": "H~5",
                "mass": "573",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 012",
                "class": "H6",
                "mass": "225",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 013",
                "class": "H4",
                "mass": "428",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 014",
                "class": "H4",
                "mass": "191",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 015",
                "class": "L5",
                "mass": "239",
                "year": 2009
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 016",
                "class": "H4",
                "mass": "647",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 017",
                "class": "H5",
                "mass": "426",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 018",
                "class": "L6",
                "mass": "1018",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 019",
                "class": "H4",
                "mass": "3191",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 020",
                "class": "L6",
                "mass": "2084",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 023",
                "class": "H~6",
                "mass": "53.5",
                "year": 2009
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 024",
                "class": "H4",
                "mass": "312",
                "year": 2009
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 025",
                "class": "L~6",
                "mass": "39",
                "year": 2009
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 026",
                "class": "H~5",
                "mass": "845",
                "year": 2009
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 027",
                "class": "L6",
                "mass": "2408",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 028",
                "class": "H5",
                "mass": "4993",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 029",
                "class": "H~5",
                "mass": "169",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 030",
                "class": "H~5",
                "mass": "214",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 031",
                "class": "L~6",
                "mass": "1178",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 032",
                "class": "H4",
                "mass": "1107",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 033",
                "class": "L~6",
                "mass": "211",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 034",
                "class": "LL5",
                "mass": "20",
                "year": 2010
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 035",
                "class": "H~5",
                "mass": "904",
                "year": 2011
              },
              {
                "coordinates": [
                  -69.71667,
                  -25.23333
                ],
                "name": "Catalina 036",
                "class": "H~5",
                "mass": "42",
                "year": 2011
              },
              {
                "coordinates": [
                  -75.77511,
                  -14.53321
                ],
                "name": "Cerro La Tiza",
                "class": "H4",
                "mass": "3740",
                "year": 2002
              },
              {
                "coordinates": [
                  -111.89633,
                  33.24558
                ],
                "name": "Chandler",
                "class": "L6",
                "mass": "350.4",
                "year": 2009
              },
              {
                "coordinates": [
                  94.6,
                  51.53333
                ],
                "name": "Cheder",
                "class": "Iron, IID",
                "mass": "5390",
                "year": 2003
              },
              {
                "coordinates": [
                  -116.19633,
                  36.00217
                ],
                "name": "Chicago Valley",
                "class": "L5",
                "mass": "26",
                "year": 2004
              },
              {
                "coordinates": [
                  -114.86667,
                  33.01222
                ],
                "name": "Chocolate Mountains",
                "class": "Ureilite",
                "mass": "699",
                "year": 2004
              },
              {
                "coordinates": [
                  -95.66667,
                  37.01667
                ],
                "name": "Coffeyville",
                "class": "H5",
                "mass": "35900",
                "year": 2006
              },
              {
                "coordinates": [
                  -94.68333,
                  40.26667
                ],
                "name": "Conception Junction",
                "class": "Pallasite, PMG-an",
                "mass": "17000",
                "year": 2006
              },
              {
                "coordinates": [
                  -1.31667,
                  44.08333
                ],
                "name": "Contis-Plage",
                "class": "H5",
                "mass": "44",
                "year": 2000
              },
              {
                "coordinates": [
                  130.90386,
                  -30.91378
                ],
                "name": "Cook 012",
                "class": "H4",
                "mass": "6.6",
                "year": 2010
              },
              {
                "coordinates": [
                  130.90858,
                  -30.94775
                ],
                "name": "Cook 013",
                "class": "H6",
                "mass": "46.8",
                "year": 2010
              },
              {
                "coordinates": [
                  -105.7015,
                  38.46483
                ],
                "name": "Cotopaxi",
                "class": "Iron, IAB-ung",
                "mass": "243",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.7502,
                  35.06917
                ],
                "name": "Coyote Dry Lake 129",
                "class": "H5",
                "mass": "140",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.7494,
                  35.06785
                ],
                "name": "Coyote Dry Lake 130",
                "class": "H4",
                "mass": "6.1",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.74847,
                  35.07028
                ],
                "name": "Coyote Dry Lake 132",
                "class": "H4",
                "mass": "17.399999999999999",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.76083,
                  35.0925
                ],
                "name": "Coyote Dry Lake 134",
                "class": "H5",
                "mass": "117.5",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.76645,
                  35.05283
                ],
                "name": "Coyote Dry Lake 138",
                "class": "H5",
                "mass": "18.3",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.76538,
                  35.05283
                ],
                "name": "Coyote Dry Lake 139",
                "class": "H4",
                "mass": "10.4",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.74853,
                  35.06725
                ],
                "name": "Coyote Dry Lake 142",
                "class": "H4",
                "mass": "32.22",
                "year": 2000
              },
              {
                "coordinates": [
                  -116.72368,
                  35.05602
                ],
                "name": "Coyote Dry Lake 151",
                "class": "H6",
                "mass": "90.04",
                "year": 2001
              },
              {
                "coordinates": [
                  -116.72365,
                  35.05607
                ],
                "name": "Coyote Dry Lake 152",
                "class": "H5",
                "mass": "10.84",
                "year": 2001
              },
              {
                "coordinates": [
                  -116.76372,
                  35.07362
                ],
                "name": "Coyote Dry Lake 153",
                "class": "H5",
                "mass": "13.87",
                "year": 2001
              },
              {
                "coordinates": [
                  -116.76905,
                  35.06847
                ],
                "name": "Coyote Dry Lake 155",
                "class": "H4",
                "mass": "17.02",
                "year": 2001
              },
              {
                "coordinates": [
                  -116.76872,
                  35.05865
                ],
                "name": "Coyote Dry Lake 159",
                "class": "H5",
                "mass": "17.7",
                "year": 2001
              },
              {
                "coordinates": [
                  -116.76295,
                  35.06152
                ],
                "name": "Coyote Dry Lake 160",
                "class": "H5",
                "mass": "76.88",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.76777,
                  35.07802
                ],
                "name": "Coyote Dry Lake 162",
                "class": "H5",
                "mass": "9.869999999999999",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.77,
                  35.07
                ],
                "name": "Coyote Dry Lake 163",
                "class": "H5",
                "mass": "16.66",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.77403,
                  35.05835
                ],
                "name": "Coyote Dry Lake 164",
                "class": "H5",
                "mass": "43",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.76197,
                  35.06888
                ],
                "name": "Coyote Dry Lake 165",
                "class": "L6",
                "mass": "42.57",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.75432,
                  35.05475
                ],
                "name": "Coyote Dry Lake 175",
                "class": "H6",
                "mass": "36.35",
                "year": 2002
              },
              {
                "coordinates": [
                  -116.73005,
                  35.05452
                ],
                "name": "Coyote Dry Lake 176",
                "class": "H6",
                "mass": "187.55",
                "year": 2003
              },
              {
                "coordinates": [
                  -116.75283,
                  35.08838
                ],
                "name": "Coyote Dry Lake 194",
                "class": "L6",
                "mass": "1.47",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.7205,
                  35.05717
                ],
                "name": "Coyote Dry Lake 221",
                "class": "H4",
                "mass": "54.31",
                "year": 2003
              },
              {
                "coordinates": [
                  -116.75553,
                  35.04008
                ],
                "name": "Coyote Dry Lake 222",
                "class": "L5",
                "mass": "22.5",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.75818,
                  35.03842
                ],
                "name": "Coyote Dry Lake 223",
                "class": "L6",
                "mass": "512",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.75007,
                  35.08958
                ],
                "name": "Coyote Dry Lake 230",
                "class": "H6",
                "mass": "16.36",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.73377,
                  35.05628
                ],
                "name": "Coyote Dry Lake 235",
                "class": "LL6",
                "mass": "81.400000000000006",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.74603,
                  35.08758
                ],
                "name": "Coyote Dry Lake 249",
                "class": "H4",
                "mass": "71.8",
                "year": 2004
              },
              {
                "coordinates": [
                  -116.76892,
                  35.05902
                ],
                "name": "Coyote Dry Lake 274",
                "class": "H4",
                "mass": "7.5",
                "year": 2006
              },
              {
                "coordinates": [
                  -116.76742,
                  35.05122
                ],
                "name": "Coyote Dry Lake 275",
                "class": "H4",
                "mass": "16.2",
                "year": 2006
              },
              {
                "coordinates": [
                  -116.77162,
                  35.07118
                ],
                "name": "Coyote Dry Lake 276",
                "class": "H6",
                "mass": "47.2",
                "year": 2006
              },
              {
                "coordinates": [
                  -116.7637,
                  35.0742
                ],
                "name": "Coyote Dry Lake 277",
                "class": "H5",
                "mass": "21.3",
                "year": 2006
              },
              {
                "coordinates": [
                  -116.75038,
                  35.0751
                ],
                "name": "Coyote Dry Lake 318",
                "class": "H5",
                "mass": "7.2",
                "year": 2009
              },
              {
                "coordinates": [
                  -114.99367,
                  36.99367
                ],
                "name": "Coyote Spring",
                "class": "H5",
                "mass": "240",
                "year": 2005
              },
              {
                "coordinates": [
                  -117.47833,
                  35.2755
                ],
                "name": "Cuddeback Dry Lake 002",
                "class": "L6",
                "mass": "95",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.47067,
                  35.29183
                ],
                "name": "Cuddeback Dry Lake 003",
                "class": "L6",
                "mass": "7.5",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.46017,
                  35.30233
                ],
                "name": "Cuddeback Dry Lake 004",
                "class": "H6",
                "mass": "40",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.45315,
                  35.31232
                ],
                "name": "Cuddeback Dry Lake 005",
                "class": "H5",
                "mass": "35",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.453,
                  35.31227
                ],
                "name": "Cuddeback Dry Lake 006",
                "class": "H6",
                "mass": "0.5",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.45342,
                  35.3114
                ],
                "name": "Cuddeback Dry Lake 007",
                "class": "L4",
                "mass": "96.7",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.48333,
                  35.28333
                ],
                "name": "Cuddeback Dry Lake 008",
                "class": "L6",
                "mass": "18.02",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.46667,
                  35.31833
                ],
                "name": "Cuddeback Dry Lake 009",
                "class": "H5",
                "mass": "19",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.45465,
                  35.3112
                ],
                "name": "Cuddeback Dry Lake 010",
                "class": "L5",
                "mass": "10.5",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.47877,
                  35.2758
                ],
                "name": "Cuddeback Dry Lake 011",
                "class": "L6",
                "mass": "10.69",
                "year": 2000
              },
              {
                "coordinates": [
                  -117.453,
                  35.31217
                ],
                "name": "Cuddeback Dry Lake 012",
                "class": "H5",
                "mass": "0.72",
                "year": 2002
              },
              {
                "coordinates": [
                  -117.45303,
                  35.31218
                ],
                "name": "Cuddeback Dry Lake 013",
                "class": "H4",
                "mass": "1.6",
                "year": 2008
              },
              {
                "coordinates": [
                  -117.48305,
                  35.28528
                ],
                "name": "Cuddeback Dry Lake 017",
                "class": "H6",
                "mass": "23.1",
                "year": 2008
              },
              {
                "coordinates": [
                  -117.48305,
                  35.28638
                ],
                "name": "Cuddeback Dry Lake 018",
                "class": "H4",
                "mass": "8.5",
                "year": 2008
              },
              {
                "coordinates": [
                  -117.45817,
                  35.30455
                ],
                "name": "Cuddeback Dry Lake 019",
                "class": "L6",
                "mass": "10.1",
                "year": 2008
              },
              {
                "coordinates": [
                  -117.4605,
                  35.3
                ],
                "name": "Cuddeback Dry Lake 021",
                "class": "L6",
                "mass": "31.72",
                "year": 2004
              },
              {
                "coordinates": [
                  -117.472,
                  35.296
                ],
                "name": "Cuddeback Dry Lake 028",
                "class": "L5",
                "mass": "19.5",
                "year": 2008
              },
              {
                "coordinates": [
                  -117.472,
                  35.296
                ],
                "name": "Cuddeback Dry Lake 029",
                "class": "H4",
                "mass": "22.2",
                "year": 2008
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04001",
                "class": "L5",
                "mass": "406.2",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04002",
                "class": "LL6",
                "mass": "219.7",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04003",
                "class": "LL6",
                "mass": "461.3",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04004",
                "class": "LL6",
                "mass": "493.1",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04005",
                "class": "H5",
                "mass": "491.4",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04006",
                "class": "LL5",
                "mass": "185.4",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04007",
                "class": "L5",
                "mass": "100.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04008",
                "class": "LL5",
                "mass": "167.4",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04009",
                "class": "LL5",
                "mass": "183.3",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04010",
                "class": "LL5",
                "mass": "184.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04011",
                "class": "LL5",
                "mass": "118.7",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04012",
                "class": "LL5",
                "mass": "145.9",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04013",
                "class": "L5",
                "mass": "203.6",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04014",
                "class": "LL5",
                "mass": "138.19999999999999",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04015",
                "class": "LL5",
                "mass": "121.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04016",
                "class": "L3",
                "mass": "162.1",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04017",
                "class": "LL5",
                "mass": "56.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04018",
                "class": "LL5",
                "mass": "167.4",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04019",
                "class": "H6",
                "mass": "134.9",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04020",
                "class": "LL6",
                "mass": "97.8",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04021",
                "class": "Mesosiderite",
                "mass": "61.3",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04022",
                "class": "L5",
                "mass": "197.3",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04023",
                "class": "L5",
                "mass": "22.7",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04024",
                "class": "LL5",
                "mass": "152.6",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04025",
                "class": "L5",
                "mass": "12.8",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04026",
                "class": "LL6",
                "mass": "114",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04027",
                "class": "LL6",
                "mass": "82.3",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04028",
                "class": "L5",
                "mass": "116.6",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04029",
                "class": "H6",
                "mass": "96",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04030",
                "class": "L5",
                "mass": "117.6",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04031",
                "class": "L5",
                "mass": "32.4",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04032",
                "class": "Mesosiderite",
                "mass": "84.9",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04033",
                "class": "L5",
                "mass": "35.1",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04034",
                "class": "L5",
                "mass": "14.6",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04035",
                "class": "L5",
                "mass": "6.7",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04036",
                "class": "L5",
                "mass": "19.399999999999999",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04037",
                "class": "H5",
                "mass": "56",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04038",
                "class": "H6",
                "mass": "28",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04039",
                "class": "L5",
                "mass": "43.2",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04040",
                "class": "L5",
                "mass": "30.4",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04041",
                "class": "LL5",
                "mass": "20.7",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04042",
                "class": "LL5",
                "mass": "14.6",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04043",
                "class": "L6",
                "mass": "28.6",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04044",
                "class": "Ureilite",
                "mass": "20.2",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04045",
                "class": "L6",
                "mass": "31.6",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04046",
                "class": "L5",
                "mass": "9",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04047",
                "class": "LL5",
                "mass": "49.5",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04048",
                "class": "Ureilite",
                "mass": "30.3",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04049",
                "class": "Eucrite-unbr",
                "mass": "90.2",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04050",
                "class": "H6",
                "mass": "3908",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04051",
                "class": "H5",
                "mass": "1789.9",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04052",
                "class": "LL5",
                "mass": "1511.2",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04053",
                "class": "L5",
                "mass": "1310.5999999999999",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04054",
                "class": "LL6",
                "mass": "1113.5999999999999",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04055",
                "class": "LL6",
                "mass": "1715",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04056",
                "class": "L6",
                "mass": "2291.6",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04057",
                "class": "L6",
                "mass": "2403.1999999999998",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04058",
                "class": "LL6",
                "mass": "1006.1",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04059",
                "class": "L5",
                "mass": "1858",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04060",
                "class": "LL5",
                "mass": "320.7",
                "year": 2004
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04061",
                "class": "Pallasite",
                "mass": "8465",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04062",
                "class": "Pallasite",
                "mass": "15315",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04063",
                "class": "Pallasite",
                "mass": "6188.3",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04064",
                "class": "Pallasite",
                "mass": "19195",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04065",
                "class": "Pallasite",
                "mass": "5738",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04066",
                "class": "Pallasite",
                "mass": "5877",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04067",
                "class": "Pallasite",
                "mass": "7561.9",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04068",
                "class": "Pallasite",
                "mass": "20425",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04069",
                "class": "Pallasite",
                "mass": "44700",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04070",
                "class": "Pallasite",
                "mass": "3515.8",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04071",
                "class": "Pallasite",
                "mass": "2110.1",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04072",
                "class": "Pallasite",
                "mass": "2312.9",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04073",
                "class": "Pallasite",
                "mass": "928.2",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04074",
                "class": "Pallasite",
                "mass": "325.7",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04075",
                "class": "Pallasite",
                "mass": "9.6",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04076",
                "class": "Pallasite",
                "mass": "8.300000000000001",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04077",
                "class": "Pallasite",
                "mass": "9625",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04078",
                "class": "Pallasite",
                "mass": "5695.2",
                "year": 2003
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "Cumulus Hills 04079",
                "class": "Pallasite",
                "mass": "12550",
                "year": 2003
              },
              {
                "coordinates": [
                  -115.05,
                  34.21667
                ],
                "name": "Danby Dry Lake",
                "class": "H6",
                "mass": "8991",
                "year": 2000
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "D'Angelo Bluff 06001",
                "class": "L6",
                "mass": "26.7",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "D'Angelo Bluff 06002",
                "class": "LL6",
                "mass": "4.4",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "D'Angelo Bluff 06003",
                "class": "L6",
                "mass": "12.5",
                "year": 2006
              },
              {
                "coordinates": [
                  0,
                  0
                ],
                "name": "D'Angelo Bluff 06004",
                "class": "CM2",
                "mass": "47.4",
                "year": 2006
              },
              {
                "coordinates": [
                  16.38767,
                  27.04133
                ],
                "name": "Dar al Gani 1010",
                "class": "Ureilite",
                "mass": "119",
                "year": 2000
              },
              {
                "coordinates": [
                  16.9575,
                  27.92472
                ],
                "name": "Dar al Gani 1020",
                "class": "H5",
                "mass": "55.8",
                "year": 2000
              },
              {
                "coordinates": [
                  16.18167,
                  27.01083
                ],
                "name": "Dar al Gani 1021",
                "class": "H5",
                "mass": "101.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.25,
                  27.08333
                ],
                "name": "Dar al Gani 1022",
                "class": "LL7",
                "mass": "33.6",
                "year": 2001
              },
              {
                "coordinates": [
                  16.06633,
                  27.07567
                ],
                "name": "Dar al Gani 1028",
                "class": "CO3",
                "mass": "131",
                "year": 2000
              },
              {
                "coordinates": [
                  16.684,
                  27.919
                ],
                "name": "Dar al Gani 1029",
                "class": "LL5",
                "mass": "68",
                "year": 2000
              },
              {
                "coordinates": [
                  16.38133,
                  27.035
                ],
                "name": "Dar al Gani 1032",
                "class": "H3/4",
                "mass": "321",
                "year": 2000
              },
              {
                "coordinates": [
                  16.40833,
                  27.28133
                ],
                "name": "Dar al Gani 1040",
                "class": "CV3",
                "mass": "781",
                "year": 2001
              },
              {
                "coordinates": [
                  16,
                  27.43333
                ],
                "name": "Dar al Gani 1043",
                "class": "LL6",
                "mass": "32.1",
                "year": 2005
              },
              {
                "coordinates": [
                  16.19167,
                  27.45056
                ],
                "name": "Dar al Gani 1044",
                "class": "LL5",
                "mass": "235",
                "year": 2006
              },
              {
                "coordinates": [
                  16.25833,
                  27.49583
                ],
                "name": "Dar al Gani 1045",
                "class": "L6",
                "mass": "955",
                "year": 2005
              },
              {
                "coordinates": [
                  16.31117,
                  27.20167
                ],
                "name": "Dar al Gani 1048",
                "class": "Lunar (feldsp. breccia)",
                "mass": "0.8",
                "year": 2001
              },
              {
                "coordinates": [
                  16.35783,
                  27.26633
                ],
                "name": "Dar al Gani 1049 ",
                "class": "H5",
                "mass": "88",
                "year": 2007
              },
              {
                "coordinates": [
                  15.55083,
                  28.21417
                ],
                "name": "Dar al Gani 1050 ",
                "class": "H6",
                "mass": "265",
                "year": 2007
              },
              {
                "coordinates": [
                  16.13533,
                  27.16917
                ],
                "name": "Dar al Gani 1051",
                "class": "Martian (shergottite)",
                "mass": "40.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.21867,
                  27.32833
                ],
                "name": "Dar al Gani 1052",
                "class": "LL5",
                "mass": "280",
                "year": 2008
              },
              {
                "coordinates": [
                  16.23267,
                  27.24167
                ],
                "name": "Dar al Gani 1053",
                "class": "CV3",
                "mass": "98",
                "year": 2006
              },
              {
                "coordinates": [
                  16.469,
                  27.38
                ],
                "name": "Dar al Gani 1055",
                "class": "Eucrite-pmict",
                "mass": "305",
                "year": 2007
              },
              {
                "coordinates": [
                  15.49467,
                  28.28767
                ],
                "name": "Dar al Gani 1059",
                "class": "H6",
                "mass": "1470",
                "year": 2010
              },
              {
                "coordinates": [
                  16.657,
                  26.9195
                ],
                "name": "Dar al Gani 1060",
                "class": "Eucrite",
                "mass": "310",
                "year": 2010
              },
              {
                "coordinates": [
                  16.48833,
                  27.23017
                ],
                "name": "Dar al Gani 1061",
                "class": "Ureilite",
                "mass": "207",
                "year": 2010
              },
              {
                "coordinates": [
                  16.40833,
                  27.27417
                ],
                "name": "Dar al Gani 1063",
                "class": "CV3",
                "mass": "410.3",
                "year": 2002
              },
              {
                "coordinates": [
                  16.2,
                  27.6
                ],
                "name": "Dar al Gani 659",
                "class": "H5",
                "mass": "15",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.23333
                ],
                "name": "Dar al Gani 664",
                "class": "L4",
                "mass": "137",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.23333
                ],
                "name": "Dar al Gani 673",
                "class": "L4/5",
                "mass": "96",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43333,
                  26.75
                ],
                "name": "Dar al Gani 678",
                "class": "H5/6",
                "mass": "162",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43717,
                  26.98717
                ],
                "name": "Dar al Gani 780",
                "class": "H5",
                "mass": "56.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.468,
                  27.01617
                ],
                "name": "Dar al Gani 781",
                "class": "L6",
                "mass": "13.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.469,
                  26.9705
                ],
                "name": "Dar al Gani 782",
                "class": "H5",
                "mass": "89.9",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46083,
                  26.47667
                ],
                "name": "Dar al Gani 783",
                "class": "H5",
                "mass": "84",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44,
                  26.98333
                ],
                "name": "Dar al Gani 784",
                "class": "H5",
                "mass": "50.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44283,
                  26.99883
                ],
                "name": "Dar al Gani 785",
                "class": "LL3",
                "mass": "278",
                "year": 2000
              },
              {
                "coordinates": [
                  16.434,
                  27.01883
                ],
                "name": "Dar al Gani 786",
                "class": "L6",
                "mass": "243",
                "year": 2000
              },
              {
                "coordinates": [
                  16.40083,
                  27.0415
                ],
                "name": "Dar al Gani 787",
                "class": "Ureilite",
                "mass": "32.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46967,
                  26.97017
                ],
                "name": "Dar al Gani 788",
                "class": "H5",
                "mass": "36.799999999999997",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4475,
                  26.99017
                ],
                "name": "Dar al Gani 789",
                "class": "L6",
                "mass": "52.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.431,
                  26.99933
                ],
                "name": "Dar al Gani 790",
                "class": "L6",
                "mass": "241",
                "year": 2000
              },
              {
                "coordinates": [
                  16.23717,
                  27.27767
                ],
                "name": "Dar al Gani 791",
                "class": "H4",
                "mass": "148",
                "year": 2000
              },
              {
                "coordinates": [
                  16.465,
                  26.91383
                ],
                "name": "Dar al Gani 792",
                "class": "LL3",
                "mass": "202",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1465,
                  27.46367
                ],
                "name": "Dar al Gani 793",
                "class": "LL6",
                "mass": "109",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4505,
                  26.99333
                ],
                "name": "Dar al Gani 794",
                "class": "H5",
                "mass": "166",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43733,
                  26.98717
                ],
                "name": "Dar al Gani 795",
                "class": "H5",
                "mass": "27.8",
                "year": 2000
              },
              {
                "coordinates": [
                  16.24017,
                  27.3695
                ],
                "name": "Dar al Gani 796",
                "class": "L6",
                "mass": "41.4",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44617,
                  27.00033
                ],
                "name": "Dar al Gani 797",
                "class": "H5",
                "mass": "56.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.452,
                  26.9945
                ],
                "name": "Dar al Gani 798",
                "class": "H5",
                "mass": "76.400000000000006",
                "year": 2000
              },
              {
                "coordinates": [
                  16.48967,
                  27.03283
                ],
                "name": "Dar al Gani 799",
                "class": "H6",
                "mass": "107",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46,
                  27.00883
                ],
                "name": "Dar al Gani 800",
                "class": "H6",
                "mass": "96.4",
                "year": 2000
              },
              {
                "coordinates": [
                  16.40883,
                  27.04683
                ],
                "name": "Dar al Gani 801",
                "class": "Ureilite",
                "mass": "25.2",
                "year": 2000
              },
              {
                "coordinates": [
                  16.47283,
                  27.0055
                ],
                "name": "Dar al Gani 802",
                "class": "H6",
                "mass": "230",
                "year": 2000
              },
              {
                "coordinates": [
                  16.38867,
                  27.0145
                ],
                "name": "Dar al Gani 803",
                "class": "L6",
                "mass": "37",
                "year": 2000
              },
              {
                "coordinates": [
                  16.437,
                  26.98717
                ],
                "name": "Dar al Gani 804",
                "class": "H5",
                "mass": "10.5",
                "year": 2000
              },
              {
                "coordinates": [
                  16.15783,
                  27.54083
                ],
                "name": "Dar al Gani 805",
                "class": "L6",
                "mass": "51.9",
                "year": 2000
              },
              {
                "coordinates": [
                  16.50283,
                  26.966
                ],
                "name": "Dar al Gani 806",
                "class": "H5",
                "mass": "48.4",
                "year": 2000
              },
              {
                "coordinates": [
                  16.445,
                  27.057
                ],
                "name": "Dar al Gani 807",
                "class": "H5",
                "mass": "187",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44017,
                  26.98683
                ],
                "name": "Dar al Gani 808",
                "class": "L6",
                "mass": "69",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43967,
                  26.99817
                ],
                "name": "Dar al Gani 809",
                "class": "L6",
                "mass": "97.8",
                "year": 2000
              },
              {
                "coordinates": [
                  16.39017,
                  26.97483
                ],
                "name": "Dar al Gani 810",
                "class": "L6",
                "mass": "64",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45183,
                  26.99417
                ],
                "name": "Dar al Gani 811",
                "class": "H5",
                "mass": "60",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4555,
                  26.95867
                ],
                "name": "Dar al Gani 812",
                "class": "H5",
                "mass": "2022",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45217,
                  26.994
                ],
                "name": "Dar al Gani 813",
                "class": "H5",
                "mass": "37.799999999999997",
                "year": 2000
              },
              {
                "coordinates": [
                  16.39783,
                  26.99
                ],
                "name": "Dar al Gani 814",
                "class": "L4",
                "mass": "102",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46167,
                  26.98333
                ],
                "name": "Dar al Gani 815",
                "class": "H5",
                "mass": "214",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45367,
                  26.9945
                ],
                "name": "Dar al Gani 816",
                "class": "H5",
                "mass": "71.2",
                "year": 2000
              },
              {
                "coordinates": [
                  16.2795,
                  27.41317
                ],
                "name": "Dar al Gani 817",
                "class": "H6",
                "mass": "196",
                "year": 2000
              },
              {
                "coordinates": [
                  16.467,
                  26.97583
                ],
                "name": "Dar al Gani 818",
                "class": "H4/5",
                "mass": "110",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44683,
                  26.99533
                ],
                "name": "Dar al Gani 819",
                "class": "L4/5",
                "mass": "688",
                "year": 2000
              },
              {
                "coordinates": [
                  15.93233,
                  27.77117
                ],
                "name": "Dar al Gani 820",
                "class": "L6",
                "mass": "560",
                "year": 2000
              },
              {
                "coordinates": [
                  16.44683,
                  26.99533
                ],
                "name": "Dar al Gani 821",
                "class": "H4/5",
                "mass": "1103",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4675,
                  26.97633
                ],
                "name": "Dar al Gani 822",
                "class": "H5",
                "mass": "44.2",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43117,
                  26.98183
                ],
                "name": "Dar al Gani 823",
                "class": "L6",
                "mass": "47.3",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45217,
                  26.99517
                ],
                "name": "Dar al Gani 824",
                "class": "H5",
                "mass": "112",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43717,
                  26.98683
                ],
                "name": "Dar al Gani 825",
                "class": "H5",
                "mass": "6",
                "year": 2000
              },
              {
                "coordinates": [
                  16.3975,
                  27.05683
                ],
                "name": "Dar al Gani 826",
                "class": "L5/6",
                "mass": "23",
                "year": 2000
              },
              {
                "coordinates": [
                  16.437,
                  26.987
                ],
                "name": "Dar al Gani 827",
                "class": "H5",
                "mass": "107",
                "year": 2000
              },
              {
                "coordinates": [
                  16.468,
                  26.972
                ],
                "name": "Dar al Gani 828",
                "class": "L6",
                "mass": "7.4",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13933,
                  27.479
                ],
                "name": "Dar al Gani 829",
                "class": "H5/6",
                "mass": "23.7",
                "year": 2000
              },
              {
                "coordinates": [
                  16.38433,
                  27.04833
                ],
                "name": "Dar al Gani 830",
                "class": "Ureilite",
                "mass": "53.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46867,
                  26.96533
                ],
                "name": "Dar al Gani 831",
                "class": "H5",
                "mass": "54.5",
                "year": 2000
              },
              {
                "coordinates": [
                  16.14817,
                  27.447
                ],
                "name": "Dar al Gani 832",
                "class": "L4/5",
                "mass": "166",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4375,
                  26.9865
                ],
                "name": "Dar al Gani 833",
                "class": "H5",
                "mass": "9",
                "year": 2000
              },
              {
                "coordinates": [
                  16.50283,
                  26.966
                ],
                "name": "Dar al Gani 834",
                "class": "H6",
                "mass": "12.9",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45717,
                  26.97033
                ],
                "name": "Dar al Gani 835",
                "class": "H5",
                "mass": "68.8",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43717,
                  26.98867
                ],
                "name": "Dar al Gani 836",
                "class": "L6",
                "mass": "35.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.24017,
                  27.2735
                ],
                "name": "Dar al Gani 837",
                "class": "L6",
                "mass": "113",
                "year": 2000
              },
              {
                "coordinates": [
                  16.468,
                  26.972
                ],
                "name": "Dar al Gani 838",
                "class": "H5",
                "mass": "27.1",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45617,
                  26.9915
                ],
                "name": "Dar al Gani 839",
                "class": "H5",
                "mass": "12.6",
                "year": 2000
              },
              {
                "coordinates": [
                  16,
                  28
                ],
                "name": "Dar al Gani 868",
                "class": "Ureilite",
                "mass": "40",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45683,
                  26.911
                ],
                "name": "Dar al Gani 870",
                "class": "H3/4",
                "mass": "262",
                "year": 2000
              },
              {
                "coordinates": [
                  16.22633,
                  27.21917
                ],
                "name": "Dar al Gani 872",
                "class": "Eucrite-mmict",
                "mass": "885",
                "year": 2001
              },
              {
                "coordinates": [
                  16.405,
                  27.04183
                ],
                "name": "Dar al Gani 874",
                "class": "Ureilite",
                "mass": "64.599999999999994",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.08333
                ],
                "name": "Dar al Gani 877",
                "class": "H5",
                "mass": "211",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.23333
                ],
                "name": "Dar al Gani 878",
                "class": "L4",
                "mass": "58",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46667,
                  27.13333
                ],
                "name": "Dar al Gani 879",
                "class": "Ureilite",
                "mass": "26",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.08333
                ],
                "name": "Dar al Gani 880",
                "class": "H6",
                "mass": "131",
                "year": 2000
              },
              {
                "coordinates": [
                  16.2,
                  27.43333
                ],
                "name": "Dar al Gani 881",
                "class": "Howardite",
                "mass": "86",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1,
                  27.23333
                ],
                "name": "Dar al Gani 882",
                "class": "LL5-6",
                "mass": "42",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.08333
                ],
                "name": "Dar al Gani 883",
                "class": "H5-6",
                "mass": "100",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1,
                  27.1
                ],
                "name": "Dar al Gani 884",
                "class": "H4",
                "mass": "100",
                "year": 2000
              },
              {
                "coordinates": [
                  16.06667,
                  26.1
                ],
                "name": "Dar al Gani 885",
                "class": "H6",
                "mass": "102",
                "year": 2000
              },
              {
                "coordinates": [
                  16.08333,
                  26.1
                ],
                "name": "Dar al Gani 886",
                "class": "H5",
                "mass": "74",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1,
                  27.15
                ],
                "name": "Dar al Gani 887",
                "class": "H5/6",
                "mass": "156",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13333,
                  27.16667
                ],
                "name": "Dar al Gani 888",
                "class": "H5/6",
                "mass": "44",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.18333
                ],
                "name": "Dar al Gani 889",
                "class": "H6",
                "mass": "58",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13333,
                  27.18333
                ],
                "name": "Dar al Gani 890",
                "class": "H5",
                "mass": "68",
                "year": 2000
              },
              {
                "coordinates": [
                  16.18333,
                  27.25
                ],
                "name": "Dar al Gani 891",
                "class": "L5",
                "mass": "58",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1,
                  27.11667
                ],
                "name": "Dar al Gani 892",
                "class": "H6",
                "mass": "48",
                "year": 2000
              },
              {
                "coordinates": [
                  16.06667,
                  27.11667
                ],
                "name": "Dar al Gani 893",
                "class": "H6",
                "mass": "132",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1,
                  27.23333
                ],
                "name": "Dar al Gani 894",
                "class": "L3/4",
                "mass": "78",
                "year": 2000
              },
              {
                "coordinates": [
                  16.11667,
                  27.13333
                ],
                "name": "Dar al Gani 895",
                "class": "H4",
                "mass": "286",
                "year": 2000
              },
              {
                "coordinates": [
                  16.88333,
                  27.75
                ],
                "name": "Dar al Gani 896",
                "class": "H-imp melt",
                "mass": "22.6",
                "year": 2000
              },
              {
                "coordinates": [
                  16.35,
                  27.66667
                ],
                "name": "Dar al Gani 897",
                "class": "Ureilite",
                "mass": "73",
                "year": 2000
              },
              {
                "coordinates": [
                  16.14283,
                  27.0345
                ],
                "name": "Dar al Gani 898",
                "class": "H4",
                "mass": "828",
                "year": 2001
              },
              {
                "coordinates": [
                  16.50617,
                  27.12267
                ],
                "name": "Dar al Gani 903",
                "class": "H3-6",
                "mass": "114",
                "year": 2000
              },
              {
                "coordinates": [
                  16.1455,
                  27.13683
                ],
                "name": "Dar al Gani 904",
                "class": "H6",
                "mass": "144",
                "year": 2000
              },
              {
                "coordinates": [
                  16.05833,
                  27.10833
                ],
                "name": "Dar al Gani 905",
                "class": "H6",
                "mass": "141",
                "year": 2000
              },
              {
                "coordinates": [
                  16.12717,
                  27.09283
                ],
                "name": "Dar al Gani 906",
                "class": "L6",
                "mass": "112",
                "year": 2000
              },
              {
                "coordinates": [
                  16.4475,
                  27.05383
                ],
                "name": "Dar al Gani 907",
                "class": "H6",
                "mass": "142",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13983,
                  27.06517
                ],
                "name": "Dar al Gani 908",
                "class": "H6",
                "mass": "204",
                "year": 2000
              },
              {
                "coordinates": [
                  16.18333,
                  27.35
                ],
                "name": "Dar al Gani 915",
                "class": "Howardite",
                "mass": "740",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13333,
                  27.25
                ],
                "name": "Dar al Gani 916",
                "class": "L4/5",
                "mass": "183",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13333,
                  27.25
                ],
                "name": "Dar al Gani 917",
                "class": "H4/5",
                "mass": "52",
                "year": 2000
              },
              {
                "coordinates": [
                  16.08333,
                  27.2
                ],
                "name": "Dar al Gani 918",
                "class": "H3-5",
                "mass": "200",
                "year": 2000
              },
              {
                "coordinates": [
                  16.13333,
                  27.21667
                ],
                "name": "Dar al Gani 919",
                "class": "H5",
                "mass": "106",
                "year": 2000
              },
              {
                "coordinates": [
                  16.15,
                  27.21667
                ],
                "name": "Dar al Gani 920",
                "class": "H4",
                "mass": "106",
                "year": 2000
              },
              {
                "coordinates": [
                  16.2,
                  27.13333
                ],
                "name": "Dar al Gani 921",
                "class": "H5",
                "mass": "123",
                "year": 2000
              },
              {
                "coordinates": [
                  16.38333,
                  26.95
                ],
                "name": "Dar al Gani 922",
                "class": "L6",
                "mass": "253",
                "year": 2000
              },
              {
                "coordinates": [
                  16.35,
                  27
                ],
                "name": "Dar al Gani 923",
                "class": "Ureilite",
                "mass": "255",
                "year": 2000
              },
              {
                "coordinates": [
                  16.35,
                  27.03333
                ],
                "name": "Dar al Gani 924",
                "class": "L6",
                "mass": "54",
                "year": 2000
              },
              {
                "coordinates": [
                  16.25,
                  27.08333
                ],
                "name": "Dar al Gani 925",
                "class": "H4",
                "mass": "93",
                "year": 2000
              },
              {
                "coordinates": [
                  16.26667,
                  27.18333
                ],
                "name": "Dar al Gani 926",
                "class": "H6",
                "mass": "243",
                "year": 2000
              },
              {
                "coordinates": [
                  16.58333,
                  26.98333
                ],
                "name": "Dar al Gani 927",
                "class": "H6",
                "mass": "367",
                "year": 2000
              },
              {
                "coordinates": [
                  16.6,
                  26.9
                ],
                "name": "Dar al Gani 928",
                "class": "H3/4",
                "mass": "96",
                "year": 2000
              },
              {
                "coordinates": [
                  16.45,
                  26.95
                ],
                "name": "Dar al Gani 929",
                "class": "H3",
                "mass": "119",
                "year": 2000
              },
              {
                "coordinates": [
                  16.43333,
                  27.03333
                ],
                "name": "Dar al Gani 930",
                "class": "H5",
                "mass": "560",
                "year": 2000
              },
              {
                "coordinates": [
                  16.46667,
                  27.11667
                ],
                "name": "Dar al Gani 931",
                "class": "L6",
                "mass": "140",
                "year": 2000
              },
              {
                "coordinates": [
                  16.23333,
                  27.4
                ],
                "name": "Dar al Gani 932",
                "class": "Howardite",
                "mass": "23",
                "year": 2000
              },
              {
                "coordinates": [
                  16.06667,
                  27.08333
                ],
                "name": "Dar al Gani 933",
                "class": "H4",
                "mass": "170",
                "year": 2000
              },
              {
                "coordinates": [
                  16.01667,
                  27.08333
                ],
                "name": "Dar al Gani 934",
                "class": "H6",
                "mass": "54",
                "year": 2000
              },
              {
                "coordinates": [
                  16.01667,
                  27.13333
                ],
                "name": "Dar al Gani 935",
                "class": "H5",
                "mass": "376",
                "year": 2000
              }
            ]}
            arcData
            showCluster={true}
            // selectedFeature={selectedCounty}
            // onHover={this._onHover.bind(this)}
            // onClick={this._onClick.bind(this)}
            strokeWidth={20}
          />

          {modMarker}
          {this._renderPopup()}
        </MapGL>
        <div className={mapTimelineContainerClass}>
          <Timeline groupItems={epics} />
        </div>
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
    mapStyles: state.mapStyles,
    activeArea: state.activeArea,
    activeEpics: state.activeEpics,
    activeMarkers: state.activeMarkers,
    selectedYear: state.selectedYear,
    selectedItem: state.selectedItem,
    metadata: state.metadata,
    menuDrawerOpen: state.menuDrawerOpen,
    modActive: state.modActive,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    setData,
    setRightDrawerVisibility,
    selectAreaItem: selectAreaItemAction,
    selectValue,
    setWikiId,
    setModToUpdate,
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
