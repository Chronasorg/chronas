import React, { Component } from 'react'

import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { defaultTheme, showNotification, translate } from 'admin-on-rest'
import { Step, StepButton, Stepper, } from 'material-ui/Stepper'
import Snackbar from '../overwrites/SnackbarNoAwayClick'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import ClusterIcon from 'material-ui/svg-icons/action/view-headline'
import IconMenu from 'material-ui/IconMenu'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import ContentFilter from 'material-ui/svg-icons/content/filter-list'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip'
import axios from 'axios'
import { easeCubic } from 'd3-ease'
import { fromJS } from 'immutable'
import _ from 'lodash'
import MapGL, { FlyToInterpolator, Marker, Popup } from 'react-map-gl'
import WebMercatorViewport from 'viewport-mercator-project'
import { setYear } from './timeline/actionReducers'
import DeckGLOverlay from './deckGlComponents/deckgl-overlay.js'
import { setMarker, changeAreaData as changeAreaDataAction } from '../menu/layers/actionReducers'
import { setRightDrawerVisibility } from '../content/actionReducers'
import {
  addModData as addModDataAction,
  removeModData as removeModDataAction,
  setModData as setModDataAction,
  setModToUpdate
} from './../restricted/shared/buttons/actionReducers'
import { CultureIcon, ProvinceIcon, ReligionGeneralIcon, RulerIcon } from './assets/placeholderIcons'
import {
  selectAreaItem as selectAreaItemAction,
  selectEpicItem,
  selectMarkerItem as selectMarkerItemAction,
  selectValue,
  setData,
  setEpicContentIndex,
  setWikiId,
  TYPE_AREA,
  TYPE_COLLECTION,
  TYPE_EPIC,
  TYPE_AUTOPLAY,
  TYPE_LINKED,
  TYPE_MARKER,
  TYPE_METADATA,
  WIKI_PROVINCE_TIMELINE,
  WIKI_RULER_TIMELINE, deselectItem
} from './actionReducers'
import { getFullIconURL, getPercent, languageToFont, iconMapping, markerIdNameArray, properties, themes } from '../../properties'
import {
  areaColorLayerIndex,
  basemapLayerIndex,
  clusterLayer,
  defaultMapStyle,
  markerCountLayer,
  markerLayer,
  provincesHighlightedLayer,
  provincesLayer
} from './mapStyles/map-style.js'
import utilsMapping from './utils/mapping'
import utilsQuery from './utils/query'
import MapTimeline from './timeline/MapTimeline'
import MapGallery from './gallery/MapGallery'
import BasicPin from './markers/basic-pin'
import utils from './utils/general'
import {updateSingleMetadata} from "./data/actionReducers";

const turf = require('@turf/turf')
const FLYTOANIMATIONDURATION = 2000
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmVyZGljbyIsImEiOiJjajVhb3E1MnExeTRpMndvYTdubnQzODU2In0.qU_Ybv3UX70fFGo79pAa0A'

const isStatic = utilsQuery.getURLParameter('isStatic') === 'true'

// defines fill-opacity when Population Opacity is switched on
const opacityPopBounds = [0.3, 0.8]
const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

let animationInterval = -1
let areaActive = true
let rememberedMarker

const styles = {
  chip: {},
  stepLabel: {
    fontWeight: 'bold',
    background: '#9e9e9e',
    padding: ' 5px',
    borderRadius: '15px',
    color: 'white',
    marginLeft: '-5px',
    // whiteSpace: 'nowrap'
  },
  stepContainer: {
    // whiteSpace: 'nowrap',
    // textOverflow: 'ellipsis',
    // overflow: 'hidden'
  },
  yearNotificationBody: {
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    width: 105,
    maxWidth: 105,
    minWidth: 105,
    padding: '0px 12px',
    textAlign: 'center'
  },
  yearNotificationContent: {
    backgroundColor: 'transparent',
    marginTop: -54,
    fontSize: 28,
    pointerEvents: 'none'
  },
  yearNotification: {
    top: 0,
    zIndex: 100000,
    bottom: 'auto',
    left: 'calc(50% - 20px)',
    width: 105,
    height: 134,
    border: 'medium none',
    visibility: 'visible',
    color: '#fff',
    paddingTop: '60px',
    textShadow: 'none',
  }
}

const defaultFilters = markerIdNameArray.map(el => el[0])

const messageYearNotification = (year, isBC, foreColor) => <div><span style={{
  fontSize: 14,
  color: foreColor,
  opacity: 1,
  position: 'relative',
  top: 24
}}>{isBC ? '(BC)' : '(AD)'}</span><br /><span style={{ color: foreColor }}>{year}</span></div>

class Map extends Component {
  componentDidMount = () => {
    const { selectedYear, location } = this.props
    const fromPerformance = ((location || {}).pathname || "").indexOf('performance') > -1
      this._addGeoJson(TYPE_MARKER, fromPerformance ? [] : this.props.activeMarkers.list, false, +(utilsQuery.getURLParameter('year') || selectedYear))
      this._addEpic(fromPerformance ? [] : this.props.activeEpics)
    window.addEventListener('resize', this._resize, {passive: true})
    this._resize()
  }
  _initializeMap = () => {
    // console.log('### initializing map')
    const { metadata, activeArea, changeAreaData, selectedYear, selectedItem, locale } = this.props

    this._loadGeoJson('provinces', metadata.provinces)
    this._updateMetaMapStyle(false, true)
    this._simulateYearChange(activeArea.data)
    this._changeArea(activeArea.data, activeArea.label, activeArea.color, selectedItem.value)

    const { selectEpicItem } = this.props
    if ((utilsQuery.getURLParameter('type') || '') === TYPE_EPIC) {
      selectEpicItem((utilsQuery.getURLParameter('value') || ''), +(utilsQuery.getURLParameter('year') || selectedYear), (utilsQuery.getURLParameter('value') || ''))
    }
  }
  _updateMetaMapStyle = (shouldReset = false, fromInit = false) => {
    // console.log('### updating metadata mapstyles')
    const { metadata, setModToUpdate, isLight, locale } = this.props

    const metadataRuler = metadata['ruler']
    const metadataReligion = metadata['religion']
    const metadataReligionGeneral = metadata['religionGeneral']
    const metadataCulture = metadata['culture']

    const rulStops = []
    const relStops = []
    const relGenStops = []
    const culStops = []

    const rulKeys = Object.keys(metadataRuler)
    for (let i = 0; i < rulKeys.length; i++) {
      rulStops.push([rulKeys[i], metadataRuler[rulKeys[i]][1]])
    }

    if (!isLight) {
      const relKeys = Object.keys(metadataReligion)
      for (let i = 0; i < relKeys.length; i++) {
        relStops.push([relKeys[i], metadataReligion[relKeys[i]][1]])
      }

      const relGenKeys = Object.keys(metadataReligionGeneral)
      for (let i = 0; i < relGenKeys.length; i++) {
        relGenStops.push([relGenKeys[i], metadataReligionGeneral[relGenKeys[i]][1]])
      }

      const culKeys = Object.keys(metadataCulture)
      for (let i = 0; i < culKeys.length; i++) {
        culStops.push([culKeys[i], metadataCulture[culKeys[i]][1]])
      }
    }
    let mapStyle
    if (isLight) {
      mapStyle = this.state.mapStyle
        .setIn(['layers', areaColorLayerIndex['ruler'], 'paint', 'fill-color'], fromJS(
          {
            'property': 'r',
            'type': 'categorical',
            'stops': rulStops,
            'default': 'rgba(1,1,1,0.3)'
          }
        ))
    }
    else {
      mapStyle = this.state.mapStyle
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
    }

    if (shouldReset) setModToUpdate('')
    if (fromInit && languageToFont[locale] !== "Cinzel Regular") {
      mapStyle = mapStyle.setIn(['layers', areaColorLayerIndex['area-labels'], 'layout', 'text-font'], fromJS([languageToFont[locale]]))
    }
    this.setState({ mapStyle })
  }
  _getAreaViewportAndOutlines = (nextActiveColorDim, nextActiveColorValue, prevActiveColorDim = false, prevActiveColorValue = false, teams = false) => {
    if (this.props.isLight || ((!teams || teams.length === 0) && (!nextActiveColorValue || nextActiveColorValue === 'na'))) {
      return {}
    }

    const webMercatorViewport = new WebMercatorViewport({
      width: this.props.width || (window.innerWidth - 56),
      height: this.props.height || window.innerHeight
    })

    if (teams && teams.length > 0) {
      // from epic war (multiple entities)

      const geometryToOutlines = teams.map((team) => this.state.mapStyle
        .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => team.indexOf(el.properties.r) > -1))

      if (typeof geometryToOutlines !== 'undefined' && geometryToOutlines.length !== 0 && geometryToOutlines.some(el => el.length !== 0)) {
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
  _changeArea = (areaDefs, newLabel, newColor, selectedProvince, prevColor = false, prevDimValue = false) => {
    const { activeArea, isLight, mapStyles, metadata, selectedItem } = this.props

    let mapStyle = this.state.mapStyle

    if (mapStyles.popOpacity || newColor === 'population') {
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

    if (!isLight && typeof newLabel !== 'undefined') {
      const plCol = utilsMapping.addTextFeat(areaDefs, newLabel, metadata)
      mapStyle = mapStyle
        .setIn(['sources', 'area-labels', 'data'], fromJS(plCol[0]))
        .setIn(['sources', 'area-outlines', 'data'], fromJS(plCol[2]))
    }

    if (selectedItem.type === TYPE_AREA && newColor !== '' && selectedProvince) {
      // prev active refers to color change
      let activeprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(newColor)]
      let prevActiveprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(prevColor)]
      // TODO: do this async!

      if (newColor === 'religionGeneral') {
        activeprovinceValue = (metadata['religion'][activeprovinceValue] || {})[3]
        prevActiveprovinceValue = (metadata['religion'][prevActiveprovinceValue] || {})[3]
      }

      const { viewport, multiPolygonToOutline } = this._getAreaViewportAndOutlines(newColor, prevDimValue || activeprovinceValue, prevColor, prevActiveprovinceValue, false)

      if (typeof multiPolygonToOutline !== 'undefined') {
        let newMapStyle = mapStyle
          .setIn(['sources', 'entity-outlines', 'data'],
            fromJS({
              ...multiPolygonToOutline,
              properties: {
                color: (newColor === 'population')
                  ? (metadata[prevColor][prevActiveprovinceValue] || [])[1]
                  : (metadata[newColor][prevDimValue || activeprovinceValue] || [])[1]
              }
            }))

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

        const stateToUpdate = {
          viewport,
          mapStyle: newMapStyle
        }

        const content = ((selectedItem || {}).data || {}).content || []
        let selectedIndex = ((selectedItem || {}).data || {}).contentIndex
        if (typeof selectedIndex === 'undefined') selectedIndex = -1
        const selectedFeature = content.find(f => f.index === selectedIndex)

        if ((((selectedFeature || {}).geometry || {}).coordinates || []).length > 0) {
          delete stateToUpdate.viewport
        }
        this.setState(stateToUpdate)
      } else {
        this.setState({
          mapStyle: mapStyle.setIn(['sources', 'entity-outlines', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': []
          }))
        })
      }
    } else {
      this.setState({ mapStyle })
    }
  }

  _simulateYearChange = (areaDefs) => {
    const { religionGeneral, religion } = this.props.metadata
    const { activeArea, mapStyles, isLight } = this.props

    const sourceId = 'provinces'
    const prevMapStyle = this.state.mapStyle
    const populationMax = Math.max.apply(Math, Object.values(areaDefs).map(function (provValue) {
      return (provValue !== null) ? +provValue[4] : 0
    }))

    let mapStyle
    if (isLight) {
      mapStyle = prevMapStyle
        .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function (feature) {
          const provValue = areaDefs[feature.properties.name] || []
          feature.properties.r = provValue[0]
          return feature
        })) // areaColorLayerIndex['ruler']
    } else {
      mapStyle = prevMapStyle
        .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function (feature) {
          const provValue = areaDefs[feature.properties.name] || []
          feature.properties.r = provValue[0]
          feature.properties.c = provValue[1]
          feature.properties.e = provValue[2]
          feature.properties.g = (religionGeneral[(religion[provValue[2]] || [])[3]] || [])[0]
          feature.properties.p = provValue[4]
          return feature
        })) // areaColorLayerIndex['ruler']
    }

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
  _resize = () => {
    const newWidth = (isStatic) ? window.innerWidth : (this.props.width || (window.innerWidth - 56))
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: newWidth,
        height: (this.props.height || window.innerHeight)
      }
    })
  };
  _updateLine = (sourceData) => {
    // utilsMapping.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', 'epicroute', 'data', 'features'], [{
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': sourceData
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
  _addGeoJson = (sourceId, entityId, fullData = false, newYear = false, newLimit) => {
    if (fullData) {
      // const mapStyle = this.state.mapStyle
      //   .updateIn(['sources', TYPE_MARKER, 'data', 'features'], list => list.concat(fullData.map((feature) => {
      //     feature.properties.isEpic = true
      //     return feature
      //   })))
      // this.setState({ mapStyle })
    } else if (entityId.toString() !== '') {
      axios.get(properties.chronasApiHost + '/markers?types=' + entityId + '&year=' + ((!newYear || isNaN(newYear)) ? this.props.selectedYear : newYear) + '&count=' + ((typeof newLimit !== "undefined" && !isNaN(newLimit)) ? newLimit : this.props.activeMarkers.limit))
        .then(features => {
          // const mapStyle = this.state.mapStyle
          //   .updateIn(['sources', sourceId, 'data', 'features'], list => list.concat(features.data))
          // this.setState({ mapStyle })
          if (typeof newYear !== "undefined" && newYear !== false && !isNaN(newYear)) {
            this.setState({ markerData: features.data.filter(p => (p.coo || []).length === 2) })
          } else {
            this.setState({ markerData: this.state.markerData.concat(features.data.filter(p => (p.coo || []).length === 2)) })
          }
        })
    }
  }
  _addEpic = (subtype) => {
    if (subtype.toString() !== '') {
      axios.get(properties.chronasApiHost + '/metadata?type=e&end=3000&subtype=' + subtype)
        .then(res => {
          const { markerTheme } = this.props
          const resData = res.data
          const battlesByWars = (subtype.includes('ew')) ? resData.shift() : ''
          this.setState({
            epics: this.state.epics.concat(resData.map((el, index) => {
              let divBlocks = ''
              const pEndYear = +el.data.end
              const startYear = +el.data.start || +el.year
              const endYear = (!pEndYear || isNaN(pEndYear)) ? (startYear + 1) : pEndYear

              if (subtype.includes('ew')) {
                battlesByWars[el._id] && battlesByWars[el._id].forEach((bEl, index) => {
                  const iconType = (index % 3) ? 'battleIcon1' : 'battleIcon2'

                  const rawNext = getPercent(startYear, endYear, bEl[1])
                  const percentage = (rawNext) * 100 + '%'

                  divBlocks = divBlocks + "<img class='tsTicks " + iconType + "' src='/images/transparent.png' title='" + bEl[0] + "'; style='margin-left: " + percentage + "; ' />"
                })
              }

              const elsubtype = el.subtype
              const elTitle = el.name || el.data.title

              return {
                start: new Date(new Date(0, 1, 1).setFullYear(startYear)),
                className: 'timelineItem_' + elsubtype,
                editable: false,
                subtype: el.subtype,
                end: (typeof pEndYear !== "undefined" && !isNaN(pEndYear)) ? new Date(new Date(0, 1, 1).setFullYear(+pEndYear)) : undefined, // new Date(new Date(0, 1, 1).setFullYear(+startYear+1)),
                content: '<div class="warContainer">' + ((elsubtype === 'ei') ? '<img class="tsTicks discoveryIcon" src="/images/transparent.png">' : (elsubtype === 'ps') ? '<img class="tsTicks esIcon' + ((index % 3 === 0) ? 1 : 2) + '" src="/images/transparent.png">' : elTitle) + divBlocks + '</div>',
                title: ((elsubtype === 'ew') ? ('<img class="tsTicks warIcon timelineTooltipIcon" src="/images/transparent.png"><span style="padding-left: 20px">' + startYear + '-' + pEndYear + ' </span>: ') : (elsubtype === 'ei') ? ('<img class="tsTicks discoveryIcon timelineTooltipIcon" src="/images/transparent.png"><span style="padding-left: 20px">' + startYear + '</span>: ') : (elsubtype === 'ps') ? ('<img class="tsTicks esIcon timelineTooltipIcon" src="/images/transparent.png"><span style="padding-left: 20px">' + startYear + '</span>: ') : '') + '<b>' + elTitle + '</b>',
                wiki: el.data.wiki || el.wiki,
                source: el.data.source,
                id: el._id,
                group: 1
              }
            }))
          })
        })
    }
  }
  _removeEpic = (preSuptype) => {
    const subtype = (preSuptype === 'es') ? 'ps' : preSuptype
    this.setState({
      epics: this.state.epics.filter(el => el.subtype !== subtype)
    })
  }
  _removeGeoJson = (prevMapStyle, sourceId, entityId) => {
    const isArray = typeof entityId === "object"
    if (entityId === TYPE_EPIC) {
      return prevMapStyle
        .updateIn(['sources', TYPE_MARKER, 'data', 'features'], list => list.filter(function (obj) {
          return (obj.properties.isEpic !== true)
        })).setIn(['sources', 'area-hover', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': []
        })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': []
        }))
    } else {
      if (isArray) {
        this.setState({
          markerData: this.state.markerData.filter(function (obj) {
            return !entityId.includes((obj.properties || {}).t) && !entityId.includes((obj.subtype))
            // return ((obj.properties || {}).t !== entityId)
          })
        })
      } else {
        this.setState({
          markerData: this.state.markerData.filter(function (obj) {
            return ((obj.properties || {}).t !== entityId) && (obj.subtype !== entityId)
            // return ((obj.properties || {}).t !== entityId)
          })
        })
      }
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
      return {
        geoData: prevState.geoData.map((f) => {
          if (selectedIndex !== -1 && f.index >= selectedIndex) {
            f.hidden = true
          } else {
            f.hidden = false
          }
          return f
        })
      }
    })
  }
  _changeYear = (year, migrationActive) => {
    const { activeArea, activeMarkers, changeAreaData, deselectItem, selectedItem, setYear, metadata } = this.props
    let prevActiveprovinceValue = (activeArea.data[selectedItem.value] || {})[utils.activeAreaDataAccessor(activeArea.color)]

    if (activeArea.color === 'religionGeneral') {
      prevActiveprovinceValue = (metadata['religion'][prevActiveprovinceValue] || {})[3]
    }
    // TODO: reset selected marker pools
    if (year > 2000) {
      return setYear(2000)
    } else if (year < -2000) {
      return setYear(-2000)
    }

    if (migrationActive) {
      // api call here
      this._queryMigrationData(year)
    }

    this._addGeoJson(TYPE_MARKER, activeMarkers.list, false, year)
    axios.get(properties.chronasApiHost + '/areas/' + year)
      .then((areaDefsRequest) => {
        changeAreaData(areaDefsRequest.data)
        this._simulateYearChange(areaDefsRequest.data)
        this._changeArea(areaDefsRequest.data, activeArea.label, activeArea.color, selectedItem.value, false, prevActiveprovinceValue)
        utilsQuery.updateQueryStringParameter('year', year)
        this.setState({ showYear: true })

        if (this.props.selectedItem.type === TYPE_AUTOPLAY) {
          const autoplayData = this.props.selectedItem.data
          const nextYear = +year + autoplayData[2]
          if (nextYear <= autoplayData[1]) {
            setTimeout(() => {
              setYear(nextYear)
            }, autoplayData[4]*1000)
          } else if (autoplayData[3]) {
            // go back to the beginning if repeat is on
            setTimeout(() => {
              setYear(autoplayData[0])
            }, autoplayData[4]*1000)
          } else {
            // stop if not
            deselectItem()
          }
        }
      })
  }
  _goToViewport = ({ longitude, latitude, zoomIn }) => {
    this._onViewportChange({
      ...this.state.viewport,
      longitude,
      latitude,
      zoom: zoomIn ? 5 : this.state.viewport.zoom, // Math.max(this.state.viewport.zoom + 1, 4.5),
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

    const { expanded, hoveredItems } = this.state

    // console.debug('mapboxgl hover')
    if (/* expanded || */ hoveredItems.length > 0 || this.props.modActive.type !== '') return

    let provinceName = ''
    let hoverInfo = null

    const layerHovered = event.features && event.features[0]
    if (layerHovered) {
      hoverInfo = {
        lngLat: event.lngLat,
        feature: layerHovered.properties
      }
      provinceName = layerHovered.properties.name

      this.setState({
        mapStyle: this.state.mapStyle
          .setIn(['sources', 'area-hover', 'data', 'features'], [{
            'type': 'Feature', 'properties': {}, 'geometry': layerHovered.geometry
          }])
      })
    } else {
      const prevMapStyle = this.state.mapStyle
      let mapStyle = prevMapStyle
        .setIn(['sources', 'area-hover', 'data'], fromJS({
          'type': 'FeatureCollection',
          'features': []
        }))
      this.setState({ mapStyle })
    }

    this.setState({
      hoverInfo
    })
  }
  _onClick = event => {
    if (event.stopPropagation) event.stopPropagation()

    if (!areaActive) return

    const { activeArea, modActive, selectedItem } = this.props
    const { expanded, hoveredItems } = this.state

    // we want to click on marker and ignore mapgl layer
    if (/* expanded || */hoveredItems.length > 0 || activeArea.color === 'population') return

    let itemName = ''
    let wikiId = ''

    if ((modActive.type === TYPE_MARKER || modActive.type === TYPE_METADATA) && modActive.selectActive) {
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
          this.setState({
            mapStyle: this.state.mapStyle
              .updateIn(['sources', 'area-outlines', 'data', 'features'], list => list.filter((obj) => (obj.properties.n !== provinceName)))
          })
        } else {
          // add province
          this.props.addModData(provinceName)
          this.setState({
            mapStyle: this.state.mapStyle
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
        // utilsQuery.updateQueryStringParameter('type', TYPE_AREA)
        // utilsQuery.updateQueryStringParameter('value', itemName)

        const prevMapStyle = this.state.mapStyle
        let mapStyle = prevMapStyle
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': []
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
  handleChangeFilter = (event, value) => {
    this.setState({
      filtered: value,
    })
  }

  constructor (props) {
    super(props)
    this._onMarkerClick = this._onMarkerClick.bind(this)
    this._onDeckHover = this._onDeckHover.bind(this)
    this.state = {
      categories: markerIdNameArray,
      filtered: defaultFilters,
      mapStyle: defaultMapStyle,
      mapTimelineContainerClass: 'mapTimeline',
      mapGalleryContainerClass: 'mapGallery',
      year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
      searchMarkerText: '',
      data: null,
      showYear: true,
      expanded: false,
      markerData: [],
      geoData: [],
      migrationData: [],
      clusterRawData: [],
      galleryMarker: [],
      epics: [],
      arcData: [],
      viewport: {
        latitude: utilsQuery.getURLParameter('position') ? +utilsQuery.getURLParameter('position').split(',')[0] : '37',
        longitude: utilsQuery.getURLParameter('position') ? +utilsQuery.getURLParameter('position').split(',')[1] : '37',
        zoom: utilsQuery.getURLParameter('position') ? +utilsQuery.getURLParameter('position').split(',')[2] : '2.5',
        minZoom: 2,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500
      },
      hoveredItems: [],
      activatedTooltip: true,
      hoverInfo: null,
    }
  }

  componentDidCatch(error, info) {
    this.props.showNotification('somethingWentWrong', 'confirm')
  }

  componentWillReceiveProps (nextProps) {
    // TODO: move all unneccesary logic to specific components (this gets executed a lot!)
    const { activeEpics, activeMarkers, activeArea, location, isLight, selectedYear, mapStyles, metadata, modActive, history, migrationActive, selectedItem, setMarker, setYear, selectAreaItem, selectMarkerItem, updateSingleMetadata, locale } = this.props

    const contentIndex = ((selectedItem || {}).data || {}).contentIndex
    const stepIndex = ((selectedItem || {}).data || {}).stepIndex
    const nextContentIndex = ((nextProps.selectedItem || {}).data || {}).contentIndex
    const nextStepIndex = ((nextProps.selectedItem || {}).data || {}).stepIndex
    const rightDrawerOpen = nextProps.rightDrawerOpen

    let mapStyleDirty = false

    /** Acting on store changes **/
    if ((nextProps.location || {}).pathname === '/discover') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline discoverActive' })
    } else if ((nextProps.location || {}).pathname !== '/discover' && this.state.mapTimelineContainerClass !== '' && this.state.mapTimelineContainerClass !== 'mapTimeline') {
      this.setState({ mapTimelineContainerClass: 'mapTimeline' })
    }

    // Locale changed?
    if (locale !== nextProps.locale) {
      const newLocale = nextProps.locale

      mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
        .setIn(['layers', areaColorLayerIndex['area-labels'], 'layout', 'text-font'], fromJS([languageToFont[newLocale]]))

      if (newLocale && newLocale !== "en") {
        axios.get(properties.chronasApiHost + '/metadata?type=g&locale=' + newLocale + '&f=' + ('ruler,culture,religion,capital,province,religionGeneral'.split(',').join('_' + newLocale + ',')) + ('_' + newLocale))
          .then(localeMetadata => {
            updateSingleMetadata('locale', localeMetadata.data)
            setTimeout(() => {
              this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
            }, 500)
          })
      }

      if (newLocale === "en" || ((metadata || {}).locale || {}).ruler) {
        updateSingleMetadata('locale', {})
        setTimeout(() => {
          this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
        }, 500)
      }
    }
    // Migration changed?
    if (migrationActive !== nextProps.migrationActive) {
      if (nextProps.migrationActive) {
        rememberedMarker = activeMarkers.list.slice(0)
        setMarker(['c', 'cp'])
        // api call here
        this._queryMigrationData(nextProps.selectedYear)
      }
      else {
        if (rememberedMarker) setMarker(rememberedMarker)
        rememberedMarker = false
        this.setState({ migrationData: [] })
      }
    }

    // entering AUTOPLAY
    if (selectedItem.type !== TYPE_AUTOPLAY && nextProps.selectedItem.type === TYPE_AUTOPLAY) {
      rememberedMarker = activeMarkers.list.slice(0)
      setMarker([])

      setTimeout(() => {
        const autoplayData = nextProps.selectedItem.data
        if (autoplayData[0] !== nextProps.selectedYear) {
          setYear(autoplayData[0])
        } else {
          setYear(+nextProps.selectedYear + autoplayData[2])
        }
      }, 500)
    }

    // leaving AUTOPLAY
    if (nextProps.selectedItem.type !== TYPE_AUTOPLAY && selectedItem.type === TYPE_AUTOPLAY) {
      if (rememberedMarker) setMarker(rememberedMarker)
      rememberedMarker = false
    }
    // Leaving Epic? -> cleanup
    if (selectedItem.type === TYPE_EPIC && nextProps.selectedItem.type !== TYPE_EPIC) {
      mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, TYPE_EPIC)
        .setIn(['sources', 'epicroute', 'data', 'features'], [])

      this.setState({ arcData: [], geoData: [] })
    }

    // slected item changed?
    if (selectedItem.value !== nextProps.selectedItem.value) {
      // console.debug('###### Item changed')
      const isRulerHold = (activeArea.data[selectedItem.value] &&
        activeArea.data[selectedItem.value][utils.activeAreaDataAccessor(nextProps.activeArea.color)] === (nextProps.activeArea.data[nextProps.selectedItem.value] || {})[utils.activeAreaDataAccessor(nextProps.activeArea.color)])
      if (nextProps.selectedItem.wiki === 'random') {
        const { markerData } = this.state
        const markerDataArray = (markerData.filter(el => el.subtype !== 'c' && el.subtype !== 'cp') || [])
        if (markerDataArray.length > 0) {
          const toSelectMarker = markerDataArray[getRandomInt(0, markerDataArray.length - 1)]
          selectMarkerItem(toSelectMarker._id, toSelectMarker)
          history.push('/article')
        } else {
          let dataPool = this.state.mapStyle
            .getIn(['sources', 'provinces', 'data']).toJS().features.filter((el) => el.properties.r !== 'undefined' && el.properties.r !== '' && el.properties.r !== 'na')

          const randomItem = dataPool[getRandomInt(0, dataPool.length - 1)]
          const provinceId = randomItem.properties.name
          if ((location || {}).pathname.indexOf('article') === -1) history.push('/article')

          selectAreaItem(provinceId, provinceId) // set query url
        }
      }
      else if (
        !isRulerHold &&
        nextProps.selectedItem.type === TYPE_AREA &&
        nextProps.selectedItem.value !== '' &&
        nextProps.activeArea.color !== '' &&
        nextProps.activeArea.color === activeArea.color) {
        let nextActiveprovinceValue = (nextProps.activeArea.data[nextProps.selectedItem.value] || {})[utils.activeAreaDataAccessor(nextProps.activeArea.color)]
        let prevActiveprovinceValue = (activeArea.data[selectedItem.value] || {})[utils.activeAreaDataAccessor(activeArea.color)]

        if (nextProps.activeArea.color === 'religionGeneral') {
          nextActiveprovinceValue = (metadata['religion'][nextActiveprovinceValue] || {})[3]
          prevActiveprovinceValue = (metadata['religion'][prevActiveprovinceValue] || {})[3]
        }
        const { viewport, multiPolygonToOutline } = this._getAreaViewportAndOutlines(nextProps.activeArea.color, nextActiveprovinceValue, activeArea.color, prevActiveprovinceValue, false)
        // const { viewport, multiPolygonToOutline } = this._getAreaViewportAndOutlines(nextProps.activeArea.color, false, activeArea.color, prevActiveprovinceValue, false)

        if (typeof multiPolygonToOutline !== 'undefined' && metadata[nextProps.activeArea.color][nextActiveprovinceValue]) {
          mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
            .setIn(['sources', 'entity-outlines', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': []
            }))
            .setIn(['sources', 'entity-outlines', 'data'], fromJS({
              ...multiPolygonToOutline,
              properties: { color: metadata[nextProps.activeArea.color][nextActiveprovinceValue][1] }
            }))
          this.setState({
            viewport,
            hoverInfo: null
          })
        } else {
          this.setState({
            mapStyle: this.state.mapStyle.setIn(['sources', 'area-hover', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': []
            })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
              'type': 'FeatureCollection',
              'features': []
            })),
            hoverInfo: null
          })
        }
      } else if (!isRulerHold && nextProps.selectedItem.type !== TYPE_EPIC) {
        // setTimeout(() => {
        mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty)
          .setIn(['sources', 'area-hover', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': []
          })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
            'type': 'FeatureCollection',
            'features': []
          }))
        this.setState({
          hoverInfo: null
        })
      }
    }

    if (nextProps.selectedItem.type === TYPE_MARKER) {
      if (((nextProps.selectedItem.value || {}).coo || []).length === 2) {
        this._goToViewport({
          longitude: nextProps.selectedItem.value.coo[0],
          latitude: nextProps.selectedItem.value.coo[1]
        })
      }
    }
    // selected item is COLLECTION and stepIndex changed?
    if (nextProps.selectedItem.type === TYPE_COLLECTION) {
      if (selectedItem.type === TYPE_COLLECTION && ((nextProps.selectedItem || {}).data || {}).content && ((((nextProps.selectedItem || {}).data || {})._id !== ((selectedItem || {}).data || {})._id) || (((nextProps.selectedItem || {}).data || {}).content || []).length !== (((selectedItem || {}).data || {}).content || []).length)) {
        if (((nextProps.selectedItem || {}).data || {}).year && +nextProps.selectedYear !== +((nextProps.selectedItem || {}).data || {}).year) this.props.setYear(((nextProps.selectedItem || {}).data || {}).year)
        const allEpicFeatures = ((nextProps.selectedItem || {}).data || {}).content.filter(el => ((el.geometry || {}).coordinates || []).length === 2)
          .map((el, index) => {
            return {
              'index': index,
              'hidden': false,
              'subtype': el.properties.t,
              '_id': el.properties.w,
              'name': el.properties.n,
              'coo': el.geometry.coordinates,
              'type': 'w',
              'year': el.properties.y,
            }
          })

        if (allEpicFeatures && allEpicFeatures.length > 0) {
          if (allEpicFeatures.length > 1) {
            const bbox = turf.bbox({
              'type': 'FeatureCollection',
              'features': allEpicFeatures.map((el => turf.point(el.coo)))
            })

            const webMercatorViewport = new WebMercatorViewport({
              width: this.props.width || (window.innerWidth - 56),
              height: this.props.height || window.innerHeight
            })

            const bounds = webMercatorViewport.fitBounds(
              [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
              {padding: 20, offset: [0, -40]}
            )

            const viewport = {
              ...this.state.viewport,
              ...bounds,
              zoom: Math.min(+bounds.zoom, Math.max(4.5, +this.state.viewport.zoom)),
              transitionDuration: FLYTOANIMATIONDURATION,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic
            }
            this.setState({ geoData: allEpicFeatures, viewport })
          }
          else {
            this.setState({ geoData: allEpicFeatures })
          }
        }
      }
      if (nextStepIndex !== stepIndex && ((nextProps.selectedItem || {}).data || {}).content) {
        const selectedFeature = nextProps.selectedItem.data.content[nextStepIndex] || {}
        if (selectedFeature && (selectedFeature.coo || selectedFeature.geometry.coordinates)) {
          this._goToViewport({
            longitude: (selectedFeature.coo || {})[0] || selectedFeature.geometry.coordinates[0],
            latitude: (selectedFeature.coo || {})[1] || selectedFeature.geometry.coordinates[1]
          })
        }
        else if (selectedFeature && (((selectedFeature || {}).properties || {}).ct === 'area')) {
          const {aeId} = selectedFeature.properties
          const aeIDArr = aeId.split('|')
          const {viewport, multiPolygonToOutline} = this._getAreaViewportAndOutlines(aeIDArr[1], aeIDArr[2])

          if (typeof multiPolygonToOutline !== 'undefined') {
            this.setState({
              viewport,
              mapStyle: this.state.mapStyle
                .setIn(['sources', 'entity-outlines', 'data'],
                  fromJS({
                    ...multiPolygonToOutline,
                    properties: {
                      color: (aeIDArr[1] === 'population')
                        ? 'red'
                        : (metadata[aeIDArr[1]][aeIDArr[2]] || [])[1]
                    }
                  }))
            })
          }
        }
      }
    }

    // leaving COLLECTION? Cleanup
    if (selectedItem.type === TYPE_COLLECTION && nextProps.selectedItem.type !== TYPE_COLLECTION) {
      this.setState({ geoData: [] })
    }

    // selected item is EPIC?
    if (nextProps.selectedItem.type === TYPE_EPIC ||
      (nextProps.selectedItem.type === TYPE_AREA && (nextProps.selectedItem || {}).data)) {
      // contentIndex changed?
      if (typeof nextContentIndex !== 'undefined' &&
        typeof contentIndex !== 'undefined' &&
        nextContentIndex !== contentIndex) {
        this._updateEpicGeo(nextContentIndex)
        const content = this.state.geoData// ((nextProps.selectedItem || {}).data || {}).content || ((((nextProps.selectedItem || {}).data || {}).data || {}).data || {}).content || []
        const selectedFeature = content.find(f => f.index === nextContentIndex)
        let prevFeature
        for (let i = +nextContentIndex - 1; i > -1; i--) {
          const currCoords = (content[i] || {}).coo || ((content[i] || {}).geometry || {}).coordinates || []
          if (currCoords.length === 2) {
            prevFeature = content[i]
            break
          }
        }

        if (selectedFeature && ((selectedFeature.coo && selectedFeature.coo.length > 1) || (selectedFeature.geometry && selectedFeature.geometry.coordinates && selectedFeature.geometry.coordinates.length > 1))) {
          if (prevFeature && ((prevFeature.coo && prevFeature.coo.length > 1) || (prevFeature.geometry.coordinates && prevFeature.geometry.coordinates.length > 1))) {
            const bbox = (prevFeature.coo) ? turf.bbox({
              'type': 'FeatureCollection',
              'features': [{
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': prevFeature.coo
                },
                'properties': {}
              }, {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': selectedFeature.coo
                },
                'properties': {}
              }]
            }) : turf.bbox({
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
              zoom: Math.min(+bounds.zoom + 2, Math.max(5.5, +this.state.viewport.zoom)),
              transitionDuration: FLYTOANIMATIONDURATION,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic
            }

            this.setState({ viewport })
          } else {
            this._goToViewport({
              longitude: (selectedFeature.coo || {})[0] || selectedFeature.geometry.coordinates[0],
              latitude: (selectedFeature.coo || {})[1] || selectedFeature.geometry.coordinates[1]
            })
          }
        }
      }

      if (nextProps.selectedItem.type !== TYPE_AREA && nextProps.selectedItem.value !== selectedItem.value || ((nextProps.selectedItem.data || {})._id !== (selectedItem.data || {})._id)) {

        if (isLight) return
        // setup new epic!
        if (selectedItem.type === TYPE_EPIC && !nextProps.selectedItem.data) {
          // remove old geoJson // TODO: this could complicate with sequential wars
          mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, TYPE_EPIC)
        }

        if (nextProps.selectedItem.data && (nextProps.selectedItem.data || {})._id !== (selectedItem.data || {})._id) {
          // draw outlines after main
          const participants = ((nextProps.selectedItem.data || {}).data || {}).participants
          if (!participants) return
          const { viewport, multiPolygonToOutlines } = this._getAreaViewportAndOutlines('ruler', '', false, false, participants)

          if (typeof multiPolygonToOutlines !== 'undefined') {
            const warEndYear = ((nextProps.selectedItem.data || {}).data || {}).end
            if (typeof warEndYear !== "undefined" && !isNaN(warEndYear)) {
              axios.get(properties.chronasApiHost + '/areas/' + (+warEndYear + 10))
                .then((endYearDataRes) => {
                  const endYearData = endYearDataRes.data
                  const participantFlatList = participants.reduce((acc, val) => acc.concat(val), [])
                  const centroidsParticipants = {}
                  const arcData = []
                  const nextData = nextProps.activeArea.data

                  Object.keys(nextData).forEach(provId => {
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
                        const rulerColor = participants[0].includes(newRuler) ? [255, 0, 0, 200] : [0, 0, 255, 200]
                        const rulerColor2 = (rulerColorPr.indexOf('rgb(') > -1) ? rulerColorPr.substring(4, rulerColorPr.length - 1).split(',').map(el => +el).concat([100]) : [100, 100, 100]

                        if (sourceCentroid && targetCentroid) {
                          arcData.push([sourceCentroid.geometry.coordinates, targetCentroid.geometry.coordinates, rulerColor2, rulerColor])
                        }
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
                  'features': []
                }))
                .setIn(['sources', 'entity-outlines', 'data'], fromJS({
                  'type': 'FeatureCollection',
                  'features': [{
                    ...multiPolygonToOutlines[0],
                    properties: { color: 'red' }
                  }, { ...multiPolygonToOutlines[1], properties: { color: 'blue' } }]
                })),
              viewport,
              hoverInfo: null
            })
          } else {
            this.setState({
              mapStyle: this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['sources', 'area-hover', 'data'], fromJS({
                'type': 'FeatureCollection',
                'features': []
              })).setIn(['sources', 'entity-outlines', 'data'], fromJS({
                'type': 'FeatureCollection',
                'features': []
              })),
              hoverInfo: null
            })
          }
        } else {
          // TODO: this gets called too much!
          // load initial epic data object
          const epicWiki = nextProps.selectedItem.value
          const isForMod = nextProps.selectedItem.wiki === 'modOnly'
          axios.get(properties.chronasApiHost + '/metadata/' + window.encodeURIComponent(epicWiki))
            .then((newEpicEntitiesRes) => {
              const newEpicEntities = newEpicEntitiesRes.data

              if (!newEpicEntities.data) return

              const participants = isForMod ? [] : (newEpicEntities.data.participants || [])
              const teamMapping = {}
              const rulerPromises = []
              const flatternedParticipants = []

              if (epicWiki && !isForMod) {
                rulerPromises.push(axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:' + window.encodeURIComponent(epicWiki)))
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
                  if (epicWiki && !isForMod && args.length > 0) {
                    newEpicEntities.content = (args[0].data || {}).map.sort((a, b) => {
                      return +(a.properties.y || -5000) - +(b.properties.y || -5000)
                    })
                    newEpicEntities.media = (args[0].data || {}).media

                    // this._addGeoJson(TYPE_MARKER, TYPE_EPIC, newEpicEntities.data.content)
                    const allEpicFeatures = newEpicEntities.content
                      .map((el, index) => {
                        return {
                          'index': index,
                          'hidden': false,
                          'subtype': el.properties.t,
                          '_id': el.properties.w,
                          'name': el.properties.n,
                          'coo': el.geometry.coordinates,
                          'type': 'w',
                          'year': el.properties.y,
                        }
                        // return {
                        //   index: index,
                        //   hidden: false,
                        //
                        // }

                        // el.index = index
                        // el.hidden = false
                        // return el
                      })

                    if (allEpicFeatures && allEpicFeatures.length > 0) this.setState({ geoData: allEpicFeatures.filter(el => (el.coo || []).length === 2) })
                    args.shift()
                  }
                  this.props.setData({
                    ...newEpicEntities,
                    id: newEpicEntities._id,
                    // epicData: newEpicEntities,
                    rulerEntities: args.map((res, i) => {
                      return { ...res.data, id: flatternedParticipants[i] }
                    }),
                    contentIndex: -1
                  })

                  if (!isForMod) this.props.history.push('/article')
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
        this._changeYear(nextProps.selectedYear, nextProps.migrationActive)
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
            'features': []
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
            .updateIn(['sources', 'area-mod', 'data', 'features'], list => list.concat(
              (this.state.mapStyle
                .getIn(['sources', 'provinces', 'data']).toJS().features
                .filter((el) => el.properties.name === provinceName) || {}).map((province) => {
                  return {
                    'type': 'Feature',
                    'properties': { name: provinceName },
                    'geometry': province.geometry
                  }
                })
              ))
        }
      }
    } else if (modActive.type === TYPE_AREA) {
      // clean up mod select
      mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['sources', 'area-mod', 'data', 'features'], [])
    }

    // Year changed?
    if (selectedYear !== nextProps.selectedYear) {
      // console.debug('###### Year changed from ' + selectedYear + ' to ' + nextProps.selectedYear)
      this._changeYear(nextProps.selectedYear, nextProps.migrationActive)
    }

    // Basemap changed?
    if (mapStyles.basemap !== nextProps.mapStyles.basemap) {
      // console.debug('###### Basemap changed')
      mapStyleDirty = this._getDirtyOrOriginalMapStyle(mapStyleDirty).setIn(['layers', basemapLayerIndex, 'source'], nextProps.mapStyles.basemap)
    }

    // Province Borders Display changed?
    if (mapStyles.showProvinceBorders !== nextProps.mapStyles.showProvinceBorders) {
      // console.debug('###### Show Province Borders changed')
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
      // console.debug('###### Area Color and Label changed' + nextProps.activeArea.label)
      this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Label changed?
    else if (activeArea.label !== nextProps.activeArea.label) {
      // console.debug('###### Area Label changed' + nextProps.activeArea.label)
      this._changeArea(nextProps.activeArea.data, nextProps.activeArea.label, undefined, undefined, activeArea.color)
      utilsQuery.updateQueryStringParameter('label', nextProps.activeArea.label)
    }

    // Area Color changed?
    else if (activeArea.color !== nextProps.activeArea.color) {
      // console.debug('###### Area Color changed' + nextProps.activeArea.color)
      this._changeArea(nextProps.activeArea.data, undefined, nextProps.activeArea.color, nextProps.selectedItem.value, activeArea.color)
      utilsQuery.updateQueryStringParameter('fill', nextProps.activeArea.color)
    }

    // Area Color not changed and is ruler area and not leaving and provinceruler would change
    else if (nextProps.activeArea.color === 'ruler' && nextProps.selectedItem.type === 'areas' && nextProps.selectedItem.value !== '' &&
      (activeArea.data[nextProps.selectedItem.value] &&
        activeArea.data[nextProps.selectedItem.value][0] !== (nextProps.activeArea.data[nextProps.selectedItem.value] || {})[0])) {
      // year changed while ruler article open and new ruler in province, ensure same ruler is kept if possible
      const rulerToHold = activeArea.data[selectedItem.value][0]
      const nextData = nextProps.activeArea.data
      const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][0] === rulerToHold)
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
    if (!_.isEqual(activeMarkers.list.sort(), nextProps.activeMarkers.list.sort())) {
      // console.debug('###### Markers changed')
      utilsQuery.updateQueryStringParameter('markers', nextProps.activeMarkers.list)
      const removedMarkers = _.difference(activeMarkers.list, nextProps.activeMarkers.list)
      const addedMarkers = _.difference(nextProps.activeMarkers.list, activeMarkers.list)

      // iterate to remove
      // for (const removedMarker of removedMarkers) {
      if (removedMarkers && (typeof removedMarkers === "string" || (removedMarkers || []).length !== 0)) {
        // console.log('removing Marker', removedMarkers)
        mapStyleDirty = this._removeGeoJson(this._getDirtyOrOriginalMapStyle(mapStyleDirty), TYPE_MARKER, removedMarkers)
      }

      if (addedMarkers && (typeof addedMarkers === "string" || (addedMarkers || []).length !== 0)) {
        // console.log('adding Marker', addedMarkers)
        this._addGeoJson(TYPE_MARKER, addedMarkers, false, false, nextProps.activeMarkers.limit)
      }
      // iterate to add
      // for (const addedMarker of addedMarkers) {
      //   console.log('addedMarker', addedMarker)
      //   this._addGeoJson(TYPE_MARKER, addedMarker)
      // }
    }

    // Markers Limit changed?
    if (activeMarkers.limit !== nextProps.activeMarkers.limit) {
      this._addGeoJson(TYPE_MARKER, nextProps.activeMarkers.list, false, nextProps.selectedYear, nextProps.activeMarkers.limit)
    }

    // Epics changed?
    if (!_.isEqual(activeEpics.sort(), nextProps.activeEpics.sort())) {
      // console.debug('###### Epics changed')
      utilsQuery.updateQueryStringParameter('epics', nextProps.activeEpics)
      const removedEpics = _.difference(activeEpics, nextProps.activeEpics)
      const addedEpics = _.difference(nextProps.activeEpics, activeEpics)

      // iterate to remove
      for (const removedEpic of removedEpics) {
        // console.log('removing Epic', removedEpic)
        mapStyleDirty = this._removeEpic(removedEpic)
      }

      // iterate to add
      for (const addedEpic of addedEpics) {
        // console.log('addedEpic', addedEpic)
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

  _queryMigrationData (year) {
    axios.get(properties.chronasApiHost + '/markers?migration=true&year=' + ((!year || isNaN(year)) ? this.props.selectedYear : year))
      .then(migrationRes => {
          this.setState({ migrationData: migrationRes.data })
      })
      .catch(() => {
        this.props.showNotification('Migration query failed')
      })
  }

  _onDeckHover ({ x, y, object }) {
    const { viewport, expanded } = this.state
    const activeCluster = this.props.mapStyles.clusterMarkers
    // don;t reset on mouseleave if expanded
    if (expanded) return

    let hoveredItems = null
    let clusterRawData

    if (object) {
      if (((object || {}).zoomLevels || []).length > 0) {
        const z = Math.floor(viewport.zoom)
        hoveredItems = ((object.zoomLevels[z] || {}).points || []).sort((a, b) => a.name.localeCompare(b.name))
        if (activeCluster) clusterRawData = hoveredItems
      } else {
        delete object.zoomLevels
        hoveredItems = [object]
      }
    } else {
      this.setState({
        clusterRawData: [],
        hoveredItems: [],
        hoverInfo: null
      })
      return
    }
    // if (this.state.clusterRawData.length === 0 && content && content.length > 0) this.setState({ clusterRawData: content })

    const hoverInfo = {
      lngLat: [object.coo[0], object.coo[1]],
      feature: hoveredItems
    }

    // x, y,
    const toUpdate = {
      clusterRawData,
      hoveredItems,
      hoverInfo
    }
    if ((!clusterRawData || !activeCluster)) delete toUpdate.clusterRawData
    this.setState(toUpdate)
  }

  _onMarkerClick (layerClicked) {
    const { selectedItem, setWikiId, setData, selectMarkerItem, modActive, history, setEpicContentIndex } = this.props
    const { markerData, clusterRawData, viewport } = this.state

    areaActive = false
    setTimeout(() => { areaActive = true }, 500)

    if (clusterRawData.length > 0) {
      // cluster on
      this.setState({ expanded: true, filtered: defaultFilters, searchMarkerText: '' })
      return
    }

    const itemName = (layerClicked.object || {}).name || layerClicked.properties.n
    const wikiId = (layerClicked.object || {}).wiki || (layerClicked.properties || {}).w || (layerClicked.object || {})._id

    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', 'area-hover', 'data'], fromJS({
        'type': 'FeatureCollection',
        'features': []
      }))
    this.setState({
      hoverInfo: null,
      mapStyle
    })

    // scan area (get lat lng from click event) and filter markerData with it)
    // markerData
    if (selectedItem.type === TYPE_EPIC) {
      const foundIndex = ((((selectedItem || {}).data || {}).content || []).findIndex(el => (el.properties || {}).w === wikiId))
      if (foundIndex !== -1) {
        utilsQuery.updateQueryStringParameter('wiki', wikiId)
        setEpicContentIndex(foundIndex)
        // setWikiId(wikiId)
      }
    } else if (selectedItem.type === TYPE_COLLECTION) {
      const foundIndex = ((((selectedItem || {}).data || {}).content || []).findIndex(el => (el.properties || {}).w === wikiId))
      if (foundIndex !== -1) {
        utilsQuery.updateQueryStringParameter('wiki', wikiId)
        setData({ ...selectedItem.data, stepIndex: foundIndex })
      }
    } else {
      // utilsQuery.updateQueryStringParameter('type', TYPE_MARKER)
      // utilsQuery.updateQueryStringParameter('value', wikiId)

      // scan area
      const centerCoo = (layerClicked.object || {}).coo || layerClicked.geometry.coordinates || layerClicked.lngLat
      const radius = properties.markerSize * Math.min(Math.pow(1.5, viewport.zoom - 10), 1) * window.devicePixelRatio / Math.sqrt(2) / Math.pow(2, viewport.zoom)

      const neighbors = markerData.filter(neighbor => {
        return (
          (Math.abs((neighbor.coo || {})[0] - centerCoo[0]) < radius) &&
          (Math.abs((neighbor.coo || {})[1] - centerCoo[1]) < radius)
        )
      })

      if (neighbors.length > 1) {
        const hoverInfo = {
          lngLat: centerCoo,
          feature: neighbors
        }
        this.setState({
          expanded: true,
          hoverInfo
        })
        return
      } else {
        // TODO: check a good marker against a bad one go on
        selectMarkerItem(wikiId, {
          ...(layerClicked.object || layerClicked.properties),
          'coo': (layerClicked.object || {}).coo || layerClicked.geometry.coordinates
        })
      }
    }

    if (modActive.type === TYPE_MARKER) return
    if (layerClicked.object) history.push('/article')
  }

  _renderPopup () {
    const { activeArea, metadata, markerTheme, mapStyles, selectMarkerItem, history, isLight, theme, translate } = this.props
    const { categories, clusterRawData, filtered, hoverInfo, expanded, searchMarkerText } = this.state
    const isCluster = mapStyles.clusterMarkers

    if (hoverInfo /* || isCluster */) {
      const content = isCluster ? ((clusterRawData.length === 0 && hoverInfo.feature) ? hoverInfo.feature : clusterRawData) : (hoverInfo.feature || [])
      if (Array.isArray(content) && content.length > 0) {
        if (expanded) {
          const menuRow = <div style={styles.rootMenu}>
            <TextField
              style={{ width: 160, marginRight: 20, marginTop: -16 /*, height: 48 */}}
              hintText={translate('pos.search')}
              value={searchMarkerText}
              floatingLabelText={translate('pos.searchMarkers')}
              onChange={(event, newValue) => this.setState({ searchMarkerText: newValue })}
            />
            <IconMenu
              style={{ /* top: -16, */float: 'right' }}
              iconButtonElement={<IconButton tooltip={translate('aor.action.close')}><CloseIcon hoverColor={themes[theme].highlightColors[0]} /></IconButton>}
              onClick={() => this.setState({
                expanded: false,
                clusterRawData: [],
                hoverInfo: null,
                filtered: defaultFilters,
                searchMarkerText: ''
              })} />
            <IconMenu
              iconButtonElement={<IconButton tooltip={translate('pos.filter')}><ContentFilter
                hoverColor={themes[theme].highlightColors[0]} /></IconButton>}
              onChange={this.handleChangeFilter}
              // value={filtered}
              style={{ /* top: -16, */float: 'right' }}
              clickCloseDelay={0}
              // selectedMenuItemStyle={{ fontWeight: 'bolder', color: themes[theme].highlightColors[0], paddingLeft: 0 }}
              value={filtered}
              multiple
            >
              {categories.map((category, i) => <MenuItem key={'categoriesMenuItem' + i} value={category[0]}
                primaryText={category[1]}
                disabled={!content.some(linkedItem => linkedItem.subtype === category[0])} />)}
            </IconMenu>
          </div>

          return (
            <Popup className='mapHoverTooltip interactive' longitude={hoverInfo.lngLat[0]}
              latitude={hoverInfo.lngLat[1]} closeButton={false}>
              <div className='county-info'
                onMouseLeave={() => { /* this.setState({ expanded: false, hoverInfo: null }) */
                }}>
                {menuRow}
                <Stepper linear={false} connector={null} activeStep={-1} orientation='vertical'
                  style={{
                    float: 'left',
                    maxHeight: 400, /* background: 'rgb(245, 245, 245)', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset', overflow: 'auto', */
                    placeContent: 'center space-between',
                    alignItems: 'stretch',
                    width: 'calc(100% + 20px)',
                    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset',
                    overflow: 'auto',
                    display: 'inline-block',
                    paddingLeft: '12px',
                    paddingRight: '10px',
                    marginLeft: '-10px',
                    marginBottom: '-15px',
                    marginRight: '-10px',
                    paddingBottom: '12px',
                    background: 'linear-gradient(rgb(255, 255, 255) 0px, rgb(228, 228, 228))'
                  }}>
                  {content.filter(linkedItem => (filtered.includes(linkedItem.subtype)) && ((linkedItem.name + linkedItem.year).indexOf(searchMarkerText) > -1 || searchMarkerText === '')).map(({ name, year, wiki, _id, type, subtype }, i) => {
                    const fSubtype = (subtype === 'cp' || subtype === 'c0') ? 'cp' : subtype
                    const cofficient = 40 / (markerTheme.substr(0, 4) === 'abst' ? 169 : 135)
                    const backgroundPosition = 'url(/images/' + markerTheme + '-atlas.png) -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][fSubtype] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][fSubtype] || {}).y * cofficient)) + 'px'
                    const backgroundSize = markerTheme.substr(0, 4) === 'abst' ? '121px 278px' : '154px 224px'
                    return (<Step key={i} style={styles.stepContainer}>
                      <StepButton
                        iconContainerStyle={{ background: 'inherit' }}
                        icon={
                          <div className='listAvatar'><img style={{
                            borderRadius: '50%',
                            marginRight: '0em',
                            height: 30,
                            width: 30,
                            background: backgroundPosition + ' / ' + backgroundSize,
                          }} src='/images/transparent.png' /></div>
                        }
                        onClick={() => {
                          delete content[i].zoomLevels
                          selectMarkerItem(content[i].wiki || content[i]._id, content[i])
                          history.push('/article')
                          this.setState({
                            expanded: false,
                            clusterRawData: [],
                            hoverInfo: null,
                            filtered: defaultFilters,
                            searchMarkerText: ''
                          })
                        }}>
                        <div style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          position: 'absolute',
                          width: '20$',
                          left: '60px',
                          top: '16px',
                          fontSize: '15px'
                        }}>
                          {decodeURIComponent(name || wiki || _id)}
                        </div>
                        <div style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          position: 'absolute',
                          width: '20$',
                          left: '60px',
                          top: '32px',
                          fontSize: '12px',
                          fontWeight: 'bolder'
                        }}>
                          {year}
                        </div>
                      </StepButton>
                    </Step>
                    )
                  })}
                </Stepper>
              </div>
            </Popup>
          )
        }

        const showClustExpandButton = isCluster && Array.isArray(content) && content.length > 1
        return (
          <Popup className='mapHoverTooltip inactive' longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]}
            closeButton={false}>
            <div className='county-info' style={showClustExpandButton ? { height: 20, marginTop: -10 } : {}}
              onClick={() => {
                this.setState({ expanded: true })
              }}>
              {showClustExpandButton ? <div><FlatButton
                style={{ minWidth: 22 }}
                label=''
                icon={<ClusterIcon />}
              /></div> : content.map(({ name, year, wiki, _id, type, subtype }) => {
                const fSubtype = (subtype === 'cp' || subtype === 'c0') ? 'cp' : subtype
                const cofficient = 80 / (markerTheme.substr(0, 4) === 'abst' ? 169 : 135)
                const backgroundPosition = 'url(/images/' + markerTheme + '-atlas.png) -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][fSubtype] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][fSubtype] || {}).y * cofficient)) + 'px'
                const backgroundSize = markerTheme.substr(0, 4) === 'abst' ? '242px 556px' : '308px 448px'
                const isCity = ['c', 'cp'].includes(fSubtype)
                return (
                  <div key={name}>
                    <Stepper linear={false} connector={null} activeStep={-1} orientation='vertical'
                      style={{
                        pointerEvents: 'none',
                        width: '100%'
                      }}>
                      <Step key={1} style={styles.stepContainer}>
                        <StepButton
                          iconContainerStyle={{ background: 'inherit' }}
                          icon={<div className='listAvatar'><img style={{
                            borderRadius: '50%',
                            marginRight: '0em',
                            height: 60,
                            width: 60,
                            background: backgroundPosition,
                            backgroundSize: backgroundSize
                          }} src='/images/transparent.png' /></div>}
                          onClick={() => {
                            selectMarkerItem(wiki || _id, {
                              name,
                              year,
                              wiki,
                              _id,
                              type,
                              subtype: (fSubtype === 'cp') ? 'c' : fSubtype
                            })
                            history.push('/article')
                            this.setState({ expanded: false, hoverInfo: null, clusterRawData: [], })
                          }}>
                          <div style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            // position: 'absolute',
                            // width: '20$',
                            marginTop: '-18px',
                            left: '60px',
                            top: '-46px',
                            fontSize: '16px'
                          }}>
                            {decodeURIComponent(name || wiki || _id)}
                          </div>
                          <div style={{
                            // overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            position: 'absolute',
                            // width: '20$',
                            left: '86px',
                            top: '34px',
                            fontSize: '20px',
                            fontWeight: 'bolder'
                          }}>
                            { isCity && <span style={{ marginLeft: -10, marginRight: 2, fontSize: '12px', fontWeight: 400 }}>{translate('pos.founded')} </span>}
                            {year}
                          </div>
                        </StepButton>
                      </Step>
                    </Stepper>
                  </div>
                )
              })}
            </div>
          </Popup>
        )
      }

      const properties = (hoverInfo || {}).feature
      if (properties) {
        let selectedValues = {}

        if (isLight) {
          selectedValues = {
          'r': metadata.ruler[properties.r] || []
          }
        } else {
          selectedValues = {
            'r': metadata.ruler[properties.r] || [],
            'c': metadata.culture[properties.c] || [],
            'e': metadata.religion[properties.e] || [],
            'g': metadata.religionGeneral[properties.g] || [],
            'p': properties.name || ''
          }
        }

        const hasLocaleMetadata = typeof ((metadata || {}).locale || {}).ruler !== "undefined"

        if (isLight) {
          const rulerIcon = selectedValues['r'][3]
          return (
            <Popup className='dimsTooltip' longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]}
                   closeButton={false}>
              <div className='county-info'>
                <Chip
                  className='chipAvatar'
                  labelColor={'rgba(0, 0, 0, 0.87)'}
                  backgroundColor={(activeArea.color === 'ruler') ? (selectedValues['r'][1] || '#fff') : '#fff'}
                >
                  <Avatar color={themes[theme].backColors[0]}
                          backgroundColor={rulerIcon ? '#fff' : '#6a6a6a'}
                          {...(rulerIcon ? (rulerIcon[0] === '/' ? { src: rulerIcon } : { src: getFullIconURL(decodeURIComponent(rulerIcon)) }) : {
                            icon: <RulerIcon viewBox={'0 0 64 64'} />
                          })}
                  />
                  {hasLocaleMetadata ? (metadata.locale['ruler'][properties.r] || selectedValues['r'][0] || 'n/a') : (selectedValues['r'][0] || 'n/a')}
                </Chip>
              </div>
            </Popup>
          )
        }

        // TODO: only color if selected
        const rulerIcon = selectedValues['r'][3]
        const cultureIcon = selectedValues['c'][3]
        const religionIcon = selectedValues['e'][4]
        const religionGeneralIcon = selectedValues['g'][3]

        return (
          <Popup className='dimsTooltip' longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]}
            closeButton={false}>
            <div className='county-info'>
              <Chip
                className='chipAvatar'
                labelColor={'rgba(0, 0, 0, 0.87)'}
                backgroundColor={(activeArea.color === 'ruler') ? (selectedValues['r'][1] || '#fff') : '#fff'}
              >
                <Avatar color={themes[theme].backColors[0]}
                  backgroundColor={rulerIcon ? '#fff' : '#6a6a6a'}
                  {...(rulerIcon ? (rulerIcon[0] === '/' ? { src: rulerIcon } : { src: getFullIconURL(decodeURIComponent(rulerIcon)) }) : {
                    icon: <RulerIcon viewBox={'0 0 64 64'} />
                  })}
                />
                {hasLocaleMetadata ? (metadata.locale['ruler'][properties.r] || selectedValues['r'][0] || 'n/a') : (selectedValues['r'][0] || 'n/a')}
              </Chip>
              <Chip
                className='chipAvatar'
                labelColor={'rgba(0, 0, 0, 0.87)'}
                backgroundColor={(activeArea.color === 'culture') ? (selectedValues['c'][1] || '#ffffff') : '#ffffff'}
              >
                <Avatar color={themes[theme].backColors[0]}
                  backgroundColor={cultureIcon ? '#fff' : '#6a6a6a'}
                  {...(cultureIcon ? (cultureIcon[0] === '/' ? { src: cultureIcon } : { src: getFullIconURL(decodeURIComponent(cultureIcon)) }) : {
                    icon: <CultureIcon viewBox={'0 0 64 64'} />
                  })}
                />
                {hasLocaleMetadata ? (metadata.locale['culture'][properties.c] || selectedValues['c'][0] || 'n/a') : (selectedValues['c'][0] || 'n/a')}
              </Chip>
              <Chip
                className='chipAvatar'
                labelColor={'rgba(0, 0, 0, 0.87)'}
                backgroundColor={(activeArea.color === 'religion') ? (selectedValues['e'][1] || '#fff') : '#fff'}
              >
                <Avatar color={themes[theme].backColors[0]}
                  backgroundColor={religionIcon ? '#fff' : '#6a6a6a'}
                  {...(religionIcon ? (religionIcon[0] === '/' ? { src: religionIcon } : { src: getFullIconURL(decodeURIComponent(religionIcon)) }) : {
                    icon: <ReligionGeneralIcon style={{ height: 32, width: 32, margin: 0 }}
                      viewBox={'0 0 200 168'} />
                  })}
                />
                {hasLocaleMetadata ? (metadata.locale['religion'][properties.e] || selectedValues['e'][0] || 'n/a') : (selectedValues['e'][0] || 'n/a')}
              </Chip>
              <Chip
                className='chipAvatar'
                labelColor={'rgba(0, 0, 0, 0.87)'}
                backgroundColor={(activeArea.color === 'religionGeneral') ? (selectedValues['g'][1] || '#fff') : '#fff'}
              >
                <Avatar color={themes[theme].backColors[0]}
                  backgroundColor={religionGeneralIcon ? '#fff' : '#6a6a6a'}
                  {...(religionGeneralIcon ? (religionGeneralIcon[0] === '/' ? { src: religionGeneralIcon } : { src: getFullIconURL(decodeURIComponent(religionGeneralIcon)) }) : {
                    icon: <ReligionGeneralIcon style={{ height: 32, width: 32, margin: 0 }}
                      viewBox={'0 0 200 168'} />
                  })}
                />
                {hasLocaleMetadata ? (metadata.locale['religionGeneral'][properties.g] || selectedValues['g'][0] || 'n/a') : (selectedValues['g'][0] || 'n/a')}
              </Chip>
              <Chip
                className='chipAvatar'
                labelColor={'rgba(0, 0, 0, 0.87)'}
                backgroundColor={'#fff'}
                style={styles.chip}
              >
                <Avatar color={themes[theme].backColors[0]}
                  backgroundColor={'#6a6a6a'}
                  {...({ icon: <ProvinceIcon viewBox={'0 0 64 64'} /> })}
                />
                  {hasLocaleMetadata ? ((metadata.locale['province'] || {})[properties.name] || selectedValues['p']) : selectedValues['p']} ({properties.p > 1000000 ? (properties.p / 1000000 + ' M') : (properties.p > 1000 ? (properties.p / 1000 + ' k') : properties.p)})
              </Chip>
            </div>
          </Popup>
        )
      } else {
        return null
      }
    }
    return null
  }

  __createLine = (x1, y1, x2, y2, lineId) => {
    let distance = Math.sqrt( ((x1-x2) * (x1-x2)) + ((y1-y2) * (y1-y2)))
    let xMid = (x1+x2)/2
    let yMid = (y1+y2)/2
    let slopeInRadian = Math.atan2(y1 - y2, x1 - x2)
    let slopeInDegrees = (slopeInRadian * 180) / Math.PI

    let line = document.getElementById(lineId)
    const customMarker = document.getElementById('customMarker')
    if (!line || !customMarker) return
    line.style.width = distance + "px"
    line.style.top = yMid + "px"
    line.style.left = (xMid - (distance / 2)) + "px"
    line.style.transform =  "rotate(" + slopeInDegrees + "deg)"
    customMarker.style.opacity = "1"
  }

  _setGalleryMarker = coo => {
    this.setState({ galleryMarker: coo.length === 3 ? [coo[0], coo[1]] : [] })
    if (coo.length === 3) {
      setTimeout(() => {
        try {
          const source = document.getElementById(coo[2])
          const customMarker = document.getElementById("customMarker")
          if (!source || !customMarker) return
          const sourceRect = source.getBoundingClientRect()
          const customMarkerRect = customMarker.getBoundingClientRect()
          this.__createLine(sourceRect.left + Math.round(sourceRect.width / 2) - 56, sourceRect.top + 123, customMarkerRect.left - 36, customMarkerRect.top + 39, 'galleryLine')
        }
        catch (e) {
          console.debug(e)
        }
      }, 100)
    }
  }

  render () {
    const { arcData, clusterRawData, epics, galleryMarker, markerData, geoData, hoverInfo, mapStyle, mapTimelineContainerClass, mapGalleryContainerClass, migrationData, viewport } = this.state
    const { activeArea, modActive, menuDrawerOpen, metadata, rightDrawerOpen, history, isLight, location, theme, mapStyles, markerTheme, selectedItem, selectedYear } = this.props

    let leftOffset = isStatic ? 0 : (menuDrawerOpen) ? 156 : 56
    if (rightDrawerOpen) leftOffset -= viewport.width * 0.25

    const infoOpen = ((location || {}).pathname || '').indexOf('/info') > -1 || ((window.location || {}).href || '').indexOf('/info') > -1
    const playOpen = ((location || {}).pathname || '').indexOf('/play') > -1 || ((window.location || {}).href || '').indexOf('/play') > -1
    const performanceOpen = ((location || {}).pathname || '').indexOf('/performance') > -1 || ((window.location || {}).href || '').indexOf('/performance') > -1

    let possibleHiglightedAREAitem = selectedItem.type === TYPE_AREA && ((selectedItem.data || {}).content || [])[(selectedItem.data || {}).contentIndex]

    possibleHiglightedAREAitem = possibleHiglightedAREAitem && {
      coo: possibleHiglightedAREAitem.geometry.coordinates,
      wiki: (possibleHiglightedAREAitem.properties || {}).w || possibleHiglightedAREAitem.wiki
    }

    let modMarker = (
      !isLight &&
      (((modActive.type === TYPE_MARKER || modActive.type === TYPE_LINKED) && typeof modActive.data[0] !== 'undefined') ||
      ((selectedItem || {}).type === TYPE_LINKED && ((selectedItem.value || {}).coo || []).length > 0) ||
      ((selectedItem || {}).type === TYPE_EPIC && (selectedItem.coo || []).length > 0) ||
      (galleryMarker.length > 1))) ? <Marker
        captureClick={false}
        captureDrag={false}
        latitude={(galleryMarker || {})[1] || ((modActive || {}).data || {})[1] ||
      (selectedItem.coo || {})[1] ||
      ((selectedItem.value || {}).coo || {})[1]}
        longitude={(galleryMarker || {})[0] || ((modActive || {}).data || {})[0] ||
      (selectedItem.coo || {})[0] ||
      ((selectedItem.value || {}).coo || {})[0]}
        offsetLeft={0}
        offsetTop={0}>
        <BasicPin hideInit={(galleryMarker.length > 1)} size={60} />
      </Marker> : null

    const activeCluster = mapStyles.clusterMarkers
    let possibleClusterRaw = []
    if (activeCluster) possibleClusterRaw = clusterRawData

    return (
      <div style={{
        left: leftOffset,
        position: 'absolute',
        top: 0,
        width: !isStatic ? 'calc(100% - 56px)' : '100%',
        height: '100%',
        overflow: 'hidden',
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), right 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {(galleryMarker.length > 1) && <div id={'galleryLine'}></div>}
        <Snackbar
          selectedYear={+selectedYear}
          open={!infoOpen && !performanceOpen && !playOpen}// this.state.showYear}
          message={messageYearNotification(selectedYear, (selectedYear < 1), themes[theme].foreColors[2])}
          contentStyle={{ ...styles.yearNotificationContent, transition: (selectedItem.type === TYPE_AUTOPLAY) ? 'opacity 100ms' : 'opacity 500ms cubic-bezier(0.23, 1, 0.32, 1) 100ms' }}
          bodyStyle={styles.yearNotificationBody}
          style={{
            ...styles.yearNotification,
            left: rightDrawerOpen ? 'calc(25% - 20px)' : 'calc(50% - 20px)',
            background: theme === 'dark' ? 'url(/images/year-dark.png) no-repeat scroll center top transparent' : 'url(/images/year-light.png) no-repeat scroll center top transparent',
            transform: (this.state.showYear && !infoOpen && !performanceOpen && !playOpen)
              ? 'translate3d(0, 0, 0)' : 'translate3d(0, -150px, 0)'
          }}
          autoHideDuration={6000}
          onRequestClose={() => this.setState({ showYear: false })}
        />
        <MapGL
          style={{
            transition: 'filter 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            filter: ((location || {}).pathname === '/' || (mapTimelineContainerClass === 'mapTimeline' &&
              (location || {}).pathname !== '/info' &&
              (location || {}).pathname !== '/login' &&
              (location || {}).pathname !== '/configuration' &&
              (location || {}).pathname !== '/account' &&
              ((location || {}).pathname || '').indexOf('/community/') === -1)) ? 'inherit' : 'blur(10px)'
          }}
          ref={(map) => {
            this.map = map
          }}
          {...viewport}
          mapStyle={mapStyle}
          // getCursor={({isDragging, isHovering}) => { return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'}}
          // mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onHover={this._onHover}
          onClick={this._onClick}
          onLoad={this._initializeMap}
        >
          { !isLight && <DeckGLOverlay
            activeColor={activeArea.color}
            goToViewport={this._goToViewport}
            theme={themes[theme]}
            viewport={viewport}
            selectedItem={selectedItem.type === TYPE_MARKER || selectedItem.type === TYPE_EPIC || selectedItem.type === TYPE_COLLECTION
              ? selectedItem
              : (selectedItem.type === TYPE_AREA && possibleHiglightedAREAitem)
                ? possibleHiglightedAREAitem
                : {}}
            updateLine={this._updateLine}
            geoData={geoData}
            migrationData={migrationData}
            clusterRawData={activeCluster ? Array.isArray(possibleClusterRaw) ? possibleClusterRaw.length === 1 ? -1 : possibleClusterRaw : [] : []}
            markerData={markerData}
            metadata={metadata}
            selectedYear={selectedYear}
            markerTheme={markerTheme}
            arcData={arcData}
            onMarkerClick={this._onMarkerClick}
            // setTooltip={this._onHover}
            showCluster={activeCluster}
            // selectedFeature={selectedCounty}
            onHover={this._onDeckHover}
            // onClick={this._onClick.bind(this)}
            strokeWidth={15}
            animationInterval={animationInterval}
            contentIndex={(selectedItem.data || {}).contentIndex || (selectedItem.data || {}).stepIndex}
          />}
          {modMarker}
          {this._renderPopup()}
        </MapGL>
        {!isStatic && <div className={mapTimelineContainerClass}>
          <MapTimeline history={history} groupItems={(mapTimelineContainerClass !== 'mapTimeline discoverActive' && selectedItem.type !== TYPE_AUTOPLAY) ? epics : []} />
        </div>}
        {!isStatic && <div className={'mapGallery'}>
          <MapGallery setGalleryMarker={this._setGalleryMarker} viewport={viewport} history={history} refMap={this.map} />
        </div>}
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    location: state.location,
    locale: state.locale,
    mapStyles: state.mapStyles,
    activeArea: state.activeArea,
    activeEpics: state.activeEpics,
    activeMarkers: state.activeMarkers,
    selectedYear: state.selectedYear,
    selectedItem: state.selectedItem,
    markerTheme: state.markerTheme,
    metadata: state.metadata,
    migrationActive: state.migrationActive,
    menuDrawerOpen: state.menuDrawerOpen,
    modActive: state.modActive,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    changeAreaData: changeAreaDataAction,
    deselectItem,
    setData,
    setRightDrawerVisibility,
    selectAreaItem: selectAreaItemAction,
    selectValue,
    setMarker,
    setWikiId,
    setModToUpdate,
    selectEpicItem,
    selectMarkerItem: selectMarkerItemAction,
    setYear,
    setEpicContentIndex,
    setModData: setModDataAction,
    removeModData: removeModDataAction,
    updateSingleMetadata,
    addModData: addModDataAction,
    showNotification
  }),
  pure,
  translate,
)

export default enhance(Map)
