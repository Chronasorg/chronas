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
const FLYTOANIMATIONDURATION = 2000
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmVyZGljbyIsImEiOiJjajVhb3E1MnExeTRpMndvYTdubnQzODU2In0.qU_Ybv3UX70fFGo79pAa0A'

// defines fill-opacity when Population Opacity is switched on
const opacityPopBounds = [0.3, 0.8]
const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

let animationInterval = -1

class Map extends Component {

  constructor(props) {
    super(props)
    this._onMarkerClick = this._onMarkerClick.bind(this)
    this._onDeckHover = this._onDeckHover.bind(this)
    this.state = {
      mapStyle: defaultMapStyle,
      mapTimelineContainerClass: 'mapTimeline',
      year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
      data: null,
      markerData: [],
      geoData: [],
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
      hoveredItems: [],
      hoverInfo: null,
      popupInfo: null
    }
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
          transitionDuration: FLYTOANIMATIONDURATION,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic
        }

        return { viewport, multiPolygonToOutlines }
      }
    } else {
      // from epic ruler (single entity)
      const activeColorDim = (nextActiveColorDim === 'population' && prevActiveColorDim) ? prevActiveColorDim : nextActiveColorDim
      const activeColorValue = (nextActiveColorDim === 'population' && prevActiveColorValue) ? prevActiveColorValue : nextActiveColorValue

      if (!activeColorValue && activeColorValue === '') return {}

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
          transitionDuration: FLYTOANIMATIONDURATION,
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
          .setIn(['sources', 'entity-outlines', 'data'],
            fromJS({ ...multiPolygonToOutline, properties: { color: (newColor === 'population') ? metadata[prevColor][prevActiveprovinceValue][1] : metadata[newColor][activeprovinceValue][1] } }))

        if (newColor === 'population' && prevColor && prevColor !== 'population') {
          const populationMax = Math.max.apply(Math, Object.values(areaDefs).map(function (provValue) {
            return (provValue !== null && provValue[utils.activeAreaDataAccessor(prevColor)] === prevActiveprovinceValue) ? +provValue[4] : 0
          }))

          newMapStyle = newMapStyle
          .setIn(['layers', areaColorLayerIndex[newColor], 'paint', 'fill-opacity'], fromJS(
            ['interpolate', ['linear'], ['get', 'p'],
              0, opacityPopBounds[0],
              populationMax / 20, opacityPopBounds[1]
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
    const { mapStyles, activeArea, contentIndex, selectedYear, metadata, modActive, history, activeEpics, activeMarkers, selectedItem, selectAreaItem } = this.props
    const rightDrawerOpen = nextProps.rightDrawerOpen

    let mapStyleDirty = false
    console.debug('### MAP componentWillReceiveProps', this.props, nextProps)

    /** Acting on store changes **/
    if (nextProps.history.location.pathname === '/discover') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline discoverActive' })
    }
    else if (nextProps.history.location.pathname !== '/discover' && this.state.mapTimelineContainerClass !== '') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline' })
    }

    // Leaving Epic? -> cleanup
    if (selectedItem.type === TYPE_EPIC && nextProps.selectedItem.type !== TYPE_EPIC) {
      mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, TYPE_EPIC)
        .setIn(['sources', 'epicroute', 'data', 'features'], [])

      this.setState({ arcData: [], geoData: [] })
    }

    // slected item changed?
    if (selectedItem.value !== nextProps.selectedItem.value) {
      console.debug('###### Item changed')
      if (nextProps.selectedItem.wiki === 'random') {
        let dataPool = this.state.mapStyle
          .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.n !== 'undefined')

        console.debug('data pool: ', dataPool)
        const randomItem = dataPool[getRandomInt(0, dataPool.length - 1)]
        const provinceId = randomItem.properties.name
        if (history.location.pathname.indexOf('article') === -1) history.push('/article')

        this.props.selectAreaItem(provinceId, provinceId) // set query url
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

    // selected item is EPIC?
    if (nextProps.selectedItem.type === TYPE_EPIC) {
      // contentIndex changed?
      if (typeof nextProps.contentIndex !== "undefined" &&
        typeof contentIndex !== "undefined" &&
        nextProps.contentIndex !== contentIndex) {
        this._updateEpicGeo(nextProps.contentIndex)
        const content = (((((nextProps.selectedItem || {}).data || {}).data || {}).data || {}).content || [])
        const selectedFeature = content.filter(f => f.index === nextProps.contentIndex)[0]
        let prevFeature
        for (let i = +nextProps.contentIndex -1; i > -1; i--) {
          const currCoords = ((content[i] || {}).geometry || {}).coordinates || []
          if (currCoords.length === 2) {
            prevFeature = content[i]
            break
          }
        }

        if (selectedFeature && selectedFeature.geometry.coordinates && selectedFeature.geometry.coordinates.length > 1) {
          if (prevFeature && prevFeature.geometry.coordinates && prevFeature.geometry.coordinates.length > 1) {

            const bbox = turf.bbox({
              'type': 'FeatureCollection',
              'features': [prevFeature, selectedFeature]
            })

            const webMercatorViewport = new WebMercatorViewport({
              width: this.props.width || (window.innerWidth - 56),
              height: this.props.height || window.innerHeight
            })

            const bounds = webMercatorViewport.fitBounds(
              [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
              { padding: 20, offset: [0, -40] }
            )

            const viewport = {
              ...this.state.viewport,
              ...bounds,
              zoom: Math.min(+bounds.zoom - 1, Math.max(4.5, +this.state.viewport.zoom)),
              transitionDuration: FLYTOANIMATIONDURATION,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic
            }

            this.setState({ viewport })
          } else {
            this._goToViewport({
              longitude: selectedFeature.geometry.coordinates[0],
              latitude: selectedFeature.geometry.coordinates[1]
            })
          }
        }
      }
      if (nextProps.selectedItem.value !== selectedItem.value || ((nextProps.selectedItem.data || {}).id !== (selectedItem.data || {}).id)) {
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
                      const sourceCentroid = turf.nearest(targetCentroid, turf.featureCollection(centroidsParticipants[newRuler]))
                      const rulerColorPr = metadata.ruler[newRuler][1]
                      const rulerColor = (rulerColorPr.indexOf('rgb(') > -1) ? rulerColorPr.substring(4, rulerColorPr.length - 1).split(',').map(el => +el) : [100, 100, 100]

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
              rulerPromises.push(axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:e_' + epicWiki))
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
                  newEpicEntities.data.content = (args[0].data || {}).map
                  newEpicEntities.data.media = (args[0].data || {}).media

                  this._addGeoJson(TYPE_MARKER, TYPE_EPIC, newEpicEntities.data.content)
                  const allEpicFeatures = newEpicEntities.data.content
                    .map((el, index) => {
                      el.index = index
                      el.hidden = false
                      return el
                    })

                  if (allEpicFeatures && allEpicFeatures.length > 0) this.setState({ geoData: allEpicFeatures })
                  args.shift()
                }
                this.props.setData({
                  id: newEpicEntities._id,
                  data: newEpicEntities,
                  rulerEntities: args.map((res, i) => { return { ...res.data, id: flatternedParticipants[i] } }),
                  contentIndex: -1
                })

                this.props.history.push('/article')
                if (!rightDrawerOpen) this.props.setRightDrawerVisibility(true)
              }))
              .catch((err) => console.debug('wer got an error', err))
          })
        }
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
          .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,.2)'))
          .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,.2)'))
          .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,.2)'))
          .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,.2)'))
      } else {
        // hide province borders!
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,0)'))
          .setIn(['layers', areaColorLayerIndex['religion'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,0)'))
          .setIn(['layers', areaColorLayerIndex['religionGeneral'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,0)'))
          .setIn(['layers', areaColorLayerIndex['culture'], 'paint', 'fill-outline-color'], fromJS('rgba(0,0,0,0)'))
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

  _updateLine = (sourceData) => {
    // utilsMapping.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', 'epicroute', 'data', 'features'], [{
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": sourceData
        }
      }])
    this.setState({ mapStyle })
  };

  _loadGeoJson = (sourceId, sourceData) => {
    // utilsMapping.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', sourceId, 'data', 'features'], sourceData.features)
    this.setState({ mapStyle })
  };

  _addGeoJson = (sourceId, entityId, fullData = false, newYear = false) => {
    if (fullData) {
      const mapStyle = this.state.mapStyle
        .updateIn(['sources', TYPE_MARKER, 'data', 'features'], list => list.concat(fullData.map((feature) => {
          feature.properties.isEpic = true
          return feature
        })))
      this.setState({ mapStyle })
    } else if (entityId.toString() !== '') {
      axios.get(properties.chronasApiHost + '/markers?types=' + entityId + '&year=' + (newYear || this.props.selectedYear))
        .then(features => {
          // const mapStyle = this.state.mapStyle
          //   .updateIn(['sources', sourceId, 'data', 'features'], list => list.concat(features.data))
          // this.setState({ mapStyle })
          if (newYear) {
            this.setState({ markerData: features.data })
          } else {
            this.setState({ markerData: this.state.markerData.concat(features.data) })
          }
        })
    }
  }

  _addEpic = (subtype) => {
    if (subtype.toString() !== '') {
      axios.get(properties.chronasApiHost + '/metadata?type=e&end=10000&subtype=' + subtype)
      .then(res => {
        this.setState({
          epics: this.state.epics.concat(res.data.map((el) => { // .filter(el => el.data.participants.length > 0 && el.data.content.length > 0)
            const endYear = el.data.end
            return {
              start: new Date(new Date(0, 1, 1).setFullYear(+el.data.start)),
              className: 'timelineItem_wars',
              editable: false,
              subtype: el.subtype,
              end: endYear ? new Date(new Date(0, 1, 1).setFullYear(+endYear)) : undefined,
              content: el.name || el.data.title,
              title: el.name || el.data.title,
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
      epics: this.state.epics.filter(el => el.subtype !== subtype)
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
      this.setState({ markerData: this.state.markerData.filter(function (obj) {
          return ((obj.properties || {}).t !== entityId)
        })
      })
      return prevMapStyle
    }
  }

  _updateGeoJson = (sourceId, entityId) => {
    setTimeout(() => {
      this._removeGeoJson(sourceId, entityId)
      this._addGeoJson(sourceId, entityId)
    }, 500)
  }

  _updateEpicGeo = (selectedIndex) => {
    this.setState((prevState) => {
      return { geoData: prevState.geoData.map((f) => {
          if (selectedIndex !== -1 && f.index >= selectedIndex) {
            f.hidden = true
          } else {
            f.hidden = false
          }
          return f
        }) }
    })
  }

  _changeYear = (year) => {
    // TODO: reset selected marker pools

    this._addGeoJson(TYPE_MARKER, this.props.activeMarkers, false, year)
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
      zoom: this.state.viewport.zoom, // Math.max(this.state.viewport.zoom + 1, 4.5),
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: FLYTOANIMATIONDURATION
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
    if (event.stopPropagation) event.stopPropagation()

    const { hoveredItems } = this.state

    if (hoveredItems.length > 0) return
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
    if (event.stopPropagation) event.stopPropagation()

    const { modActive, selectedItem } = this.props
    const { hoveredItems } = this.state

    // we want to click on marker and ignore mapgl layer
    if (hoveredItems.length > 0) return

    let itemName = ''
    let wikiId = ''

    if ((modActive.type === TYPE_MARKER || modActive.type === TYPE_METADATA) && modActive.selectActive) {
      this.props.setModData(event.lngLat.map((l) => +l.toFixed(3)))
      return
    }
    else if (modActive.type === TYPE_AREA) {
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
        this._onMarkerClick(layerClicked)
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

  _onDeckHover({x, y, object}) {
    // const {viewState, params} = this.props;
    // const z = Math.floor(viewState.zoom);
    // const showCluster = params.cluster.value;

    // const { viewport } = this.state;

    let hoveredItems = null;

    if (object) {
      if (false /*showCluster*/) {
        // hoveredItems = object.zoomLevels[z].points.sort((m1, m2) => m1.year - m2.year);
      } else {
        delete object.zoomLevels
        hoveredItems = [object]
      }
    } else {
      this.setState({
        hoveredItems: [],
        hoverInfo: null
      })
      return
    }

    const hoverInfo = {
      lngLat: [object.coo[0], object.coo[1]],
      feature: hoveredItems
    }

    // x, y,
    this.setState({ hoveredItems, hoverInfo });
  }

  _onMarkerClick (layerClicked) {
    const itemName = (layerClicked.object || {}).name || layerClicked.properties.n
    const wikiId = (layerClicked.object || {}).wiki || layerClicked.properties.w

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

    if (this.props.selectedItem.type === TYPE_EPIC) {
      utilsQuery.updateQueryStringParameter('type', TYPE_EPIC)
      // utilsQuery.updateQueryStringParameter('wiki', wikiId)
      this.props.setWikiId(wikiId)
    } else {
      utilsQuery.updateQueryStringParameter('type', TYPE_MARKER)
      utilsQuery.updateQueryStringParameter('value', wikiId)
      this.props.selectMarkerItem(wikiId, { ...(layerClicked.object || layerClicked.properties), 'coo': (layerClicked.object || {}).coo || layerClicked.geometry.coordinates })
    }
    if (this.props.modActive.type === TYPE_MARKER) return
    if (layerClicked.object) this.props.history.push('/article')
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
    const { epics, markerData, geoData, mapStyle, mapTimelineContainerClass, viewport, arcData } = this.state
    const { modActive, menuDrawerOpen, rightDrawerOpen, history, contentIndex, mapStyles } = this.props

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
            filter: (history.location.pathname === '/' || (mapTimelineContainerClass === 'mapTimeline' &&
              history.location.pathname !== '/info' &&
              history.location.pathname !== '/login' &&
              history.location.pathname !== '/share' &&
              history.location.pathname !== '/configuration' &&
              history.location.pathname !== '/account' &&
              history.location.pathname.indexOf('/community/') === -1)) ? 'inherit' : 'blur(10px)'
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
            updateLine={this._updateLine}
            geoData={geoData}
            markerData={markerData}
            arcData={arcData}
            onMarkerClick={this._onMarkerClick}
            // setTooltip={this._onHover}
            showCluster={mapStyles.clusterMarkers}
            // selectedFeature={selectedCounty}
            onHover={this._onDeckHover}
            // onClick={this._onClick.bind(this)}
            strokeWidth={20}
            animationInterval={animationInterval}
            contentIndex={contentIndex}
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
// (geoData.length !== 0 || arcData.length !== 0 || markerData.length !== 0)
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
    contentIndex: ((state.selectedItem || {}).data || {}).contentIndex,
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
