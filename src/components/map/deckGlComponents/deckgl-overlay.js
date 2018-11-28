import React, { Component } from 'react'
import { scaleQuantile } from 'd3-scale'
import { rgb } from 'd3-color'
import { easeCubic } from 'd3-ease'
import rbush from 'rbush'
import DeckGL, {
  WebMercatorViewport,
  IconLayer,
  ScatterplotLayer,
  PathLayer,
  GeoJsonLayer,
  TextLayer,
  ArcLayer
} from 'deck.gl'
import TagmapLayer from './tagmap-layer'
import { properties, RGBAtoArray, iconMapping, iconSize } from '../../../properties'
import utilsQuery from '../utils/query'

const Arc = require('arc')

const fullTime = 4000
let interval = -1

function getIconName (size) {
  if (size === 0) {
    return ''
  }
  if (size < 10) {
    return `${size}`
  }
  if (size < 100) {
    return `${Math.floor(size / 10)}0`
  }
  return '100'
}

function getIconSize (size) {
  return Math.min(100, size) / 100 * 0.5 + 0.5
}

function colorToRGBArray (color) {
  if (Array.isArray(color)) {
    return color.slice(0, 4)
  }

  const c = rgb(color)
  return [c.r, c.g, c.b, 255]
}

export default class DeckGLOverlay extends Component {
  static get defaultViewport () {
    return {
      longitude: -100,
      latitude: 40.7,
      zoom: 3,
      maxZoom: 15,
      pitch: 30,
      bearing: 30
    }
  }

  constructor (props) {
    super(props)

    this._tree = rbush(9, ['.x', '.y', '.x', '.y'])
    this.state = {
      animatedFeature: [],
      marker: [],
      texts: [],
      layers: [],
      // geo: props.geoData || [],
      x: 0,
      y: 0,
      hoveredItems: null
    }
  }

  componentWillUnmount () {
    if (interval !== -1) {
      clearInterval(interval)
      interval = -1
      this.props.updateLine([])
      // this.setState({ animatedFeature: [] })
    }
  }

  componentDidMount () {
  }

  componentWillReceiveProps (nextProps) {
    const { activeColor, clusterRawData, contentIndex, markerData, arcData, markerTheme, selectedYear, selectedItem, geoData, updateLine, goToViewport } = this.props
    const { strokeWidth, onHover, showCluster, theme, metadata, onMarkerClick, sizeScale } = nextProps
    // const { layers } = this.state

    let layers = false
    const { viewport } = nextProps
    const oldViewport = this.props.viewport

    const { animatedFeature, arcs, marker, texts, /* geo */} = this.state
    const z = Math.floor(viewport.zoom)
    const size = /* showCluster ? 1 : */ Math.min(Math.pow(1.5, viewport.zoom - 10), 1)
    const updateTrigger = z * showCluster

    const viewportChange = viewport.latitude !== oldViewport.latitude || viewport.longitude !== oldViewport.longitude || viewport.zoom !== oldViewport.zoom
    let isDirty = viewportChange

    if (viewportChange || nextProps.arcData !== arcData || !nextProps.arcData.every((el, i) => el === arcData[i])) {
      if (viewportChange) {
        utilsQuery.updateQueryStringParameter('position', viewport.latitude + ',' + viewport.longitude + ',' + viewport.zoom)
      }

      isDirty = true
      if (!layers) layers = Object.assign([], this.state.layers)
      layers[3] = new ArcLayer({
        id: 'arc',
        data: this._getArcs(nextProps.arcData),
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => d.color,
        getTargetColor: d => d.color2,
        strokeWidth
      })
    }

    if (viewportChange ||
      this.props.showCluster !== showCluster ||
      nextProps.activeColor !== activeColor ||
      nextProps.markerData.length !== markerData.length ||
      nextProps.geoData.length !== geoData.length ||
      nextProps.clusterRawData.length !== clusterRawData.length ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height ||
      nextProps.contentIndex !== contentIndex ||
      nextProps.selectedItem.wiki !== selectedItem.wiki) {
      // let nextIconMarker = nextProps.geoData.length !== 0 ? nextProps.geoData : []
      // if ( nextProps.contentIndex !== contentIndex) {
      let nextIconMarker = nextProps.geoData.length !== 0 ? ((nextProps.contentIndex === contentIndex) ? nextProps.geoData : nextProps.geoData.map((el) => {
        if (el.index === nextProps.contentIndex) {
          el.isActive = true
          if (el.coo && el.coo.length > 0) goToViewport({ longitude: el.coo[0], latitude: el.coo[1], zoomIn: true })
          return el
        } else {
          el.isActive = false
          return el
        }
      })) : nextProps.markerData
      // }
      const nextTextMarker = nextProps.markerData.filter(el => el.subtype === 'c')
      const iconMarker = geoData.length !== 0 ? geoData : markerData
      const textMarker = markerData.filter(el => el.subtype === 'c')

      let capitalMarkers = []
      let capitalMarkers0 = []

      if ((viewportChange || this.props.showCluster !== showCluster || nextIconMarker.length !== iconMarker.length || nextProps.activeColor !== activeColor || nextProps.contentIndex !== contentIndex || nextProps.selectedItem.wiki !== selectedItem.wiki) && (clusterRawData.length === nextProps.clusterRawData.length) || ((clusterRawData.length !== nextProps.clusterRawData.length && nextProps.clusterRawData.length === 0))) {
        if (nextProps.selectedItem.wiki !== selectedItem.wiki || nextIconMarker.length !== iconMarker.length) {
          const activeWiki = nextProps.selectedItem.wiki
          nextIconMarker = nextIconMarker.map((el) => {
            if (el._id === activeWiki) {
              el.isActive = true
              // if (el.coo && el.coo.length > 0) goToViewport({longitude: el.coo[0], latitude: el.coo[1]})
              return el
            } else {
              el.isActive = false
              return el
            }
          })
        }

        capitalMarkers = []
        if (!showCluster && nextProps.activeColor === 'ruler') {
          capitalMarkers = nextIconMarker.filter(el => el.subtype === 'cp' || (el.subtype === 'c' && (el.capital && el.capital.find((ell) => {
            return ell[0] <= +selectedYear && ell[1] >= +selectedYear
          }))))
        }

        capitalMarkers0 = []
        if (!showCluster && nextProps.activeColor === 'ruler') {
          capitalMarkers.forEach(el => {
            el.subtype = 'cp'
            capitalMarkers0.push({ ...el, subtype: 'c0' })
          })
        }

        isDirty = true
        if (!layers) layers = Object.assign([], this.state.layers)
        layers[4] = new IconLayer({
          id: 'icon',
          autoHighlight: true,
          highlightColor: showCluster ? [0, 0, 0, 0] : RGBAtoArray(theme.highlightColors[0]), // showCluster
            // ? [0,0,0,0] : RGBAtoArray(theme.highlightColors[0]),
          data: this._getMarker({
            ...{
              markerData: (showCluster && nextProps.geoData.length > 0) ? [] : (nextProps.activeColor === 'ruler') ? nextIconMarker.filter(el => el.subtype !== 'c').concat(capitalMarkers0).concat(capitalMarkers) : nextIconMarker.filter(el => el.subtype[0] !== 'c')
            }, // .filter(el => el.subtype !== 'c')},
            sizeScale,
            viewport,
            geoData: nextProps.geoData,
            showCluster,
          }),
          opacity: 1,
          pickable: true,
          iconAtlas: showCluster
            ? ('/images/themed-cluster-atlas.png')// ('/images/' + markerTheme + '-cluster-atlas.png')
            : ('/images/' + markerTheme + '-atlas.png'),
          iconMapping: iconMapping[showCluster ? 'cluster' : markerTheme.substr(0, 4)],
          sizeScale: properties.markerSize * size * window.devicePixelRatio,
          getPosition: d => d.coo,
          getIcon: d => showCluster ? (d.zoomLevels[z] && d.zoomLevels[z].icon) : d.subtype, // should be d.subtype (or type)
          getSize: d => showCluster ? (d.zoomLevels[z] && d.zoomLevels[z].size * 20) : (d.isActive) ? ((iconSize[d.subtype] || 4) + 10) : iconSize[d.subtype] || 4,
          getColor: (d) => {
            return d.subtype === 'cp' ? RGBAtoArray((metadata['ruler'][(d.capital.find((ell) => {
              return ell[0] <= +selectedYear && ell[1] >= +selectedYear
            }) || [])[2]] || [])[1]) || [0, 0, 0, 255] : [0, 0, 0, 255]
          },
          onHover: e => onHover(e),
          onClick: onMarkerClick,
          updateTriggers: {
            getIcon: updateTrigger,
            getSize: updateTrigger
          }
        })
      }

      if ((clusterRawData.length !== nextProps.clusterRawData.length && (nextProps.clusterRawData !== -1 || nextProps.clusterRawData.length === 0)) || (showCluster && nextProps.clusterRawData !== -1)) {
        isDirty = true
        if (!layers) layers = Object.assign([], this.state.layers)

        capitalMarkers = []
        if (showCluster && nextProps.activeColor === 'ruler') {
          capitalMarkers = nextIconMarker.filter(el => el.subtype === 'cp' || (el.subtype === 'c' && (el.capital && el.capital.find((ell) => {
            return ell[0] <= +selectedYear && ell[1] >= +selectedYear
          }))))
        }

        capitalMarkers0 = []
        if (showCluster && nextProps.activeColor === 'ruler') {
          capitalMarkers.forEach(el => {
            el.subtype = 'cp'
            capitalMarkers0.push({ ...el, subtype: 'c0' })
          })
        }

        layers[1] = new IconLayer({ // 4
          id: 'clusterIcon',
          autoHighlight: false,
          data: this._getMarker({
            ...{
              markerData: (showCluster && nextProps.geoData.length > 0) ? nextProps.geoData.concat(capitalMarkers0).concat(capitalMarkers) : nextProps.clusterRawData.concat(capitalMarkers0).concat(capitalMarkers)
            }, // .filter(el => el.subtype !== 'c')},
            sizeScale,
            viewport,
            geoData: nextProps.geoData,
            // geoData: [],
            showCluster: false,
          }),
          opacity: 1,
          pickable: true,
          iconAtlas: '/images/' + markerTheme + '-atlas.png',
          iconMapping: iconMapping[markerTheme.substr(0, 4)],
          sizeScale: properties.markerSize * size * window.devicePixelRatio,
          getPosition: d => d.coo,
          getIcon: d => d.subtype, // should be d.subtype (or type)
          getSize: d => d.isActive ? ((iconSize[d.subtype] || 4) + 10) : iconSize[d.subtype] || 4,
          getColor: (d) => {
            return d.subtype === 'cp' ? RGBAtoArray((metadata['ruler'][(d.capital.find((ell) => {
              return ell[0] <= +selectedYear && ell[1] >= +selectedYear
            }) || [])[2]] || [])[1]) || [0, 0, 0, 255] : [0, 0, 0, 255]
          },
          onHover: e => onHover(e),
          onClick: onMarkerClick,
          updateTriggers: {
            getIcon: updateTrigger,
            getSize: updateTrigger
          }
        })
      }

      if (nextTextMarker.length !== textMarker.length) {
        const myTexts = this._getTexts({ ...{ textData: nextTextMarker }, viewport })
        isDirty = true
        if (!layers) layers = Object.assign([], this.state.layers)
        layers[2] = new TagmapLayer({
          id: 'cities-labels',
          data: myTexts,
          pickable: false,
          getWeight: d => d.capital ? 2 : 1,
          // getWeight: x => /*normalize(x.pop) ||*/ Math.random() * 100,
          getLabel: d => d.name,
          // onMarkerClick: onMarkerClick,
          getPosition: d => d.coo,
          minFontSize: 18,
          maxFontSize: 24
        })
        layers[0] = new ScatterplotLayer({
          id: 'cities-dots',
          data: myTexts.filter(el => !(el.capital && el.capital.find((ell) => {
            return ell[0] <= +selectedYear && ell[1] >= +selectedYear
          })
          )),
          // outline: true,
          radiusScale: 10000,
          opacity: 1,
          // strokeWidth: 3,
          autoHighlight: true,
          highlightColor: RGBAtoArray(theme.highlightColors[0]),
          getPosition: d => d.coo,
          pickable: true,
          onHover: e => onHover(e),
          onClick: onMarkerClick,
          getColor: [50, 50, 50, 200], // d => (d[2] === 1 ? maleColor : femaleColor),
          radiusMinPixels: 0,
          radiusMaxPixels: 10,
        })
      }
    }

    if (interval !== -1 && (nextProps.geoData || []).length === 0) {
      clearInterval(interval)
      interval = -1
      // this.setState({ animatedFeature: [] })
      this.props.updateLine([])
    }
    if (nextProps.contentIndex !== contentIndex) {
      if (interval !== -1) {
        clearInterval(interval)
        interval = -1
        // this.setState({ animatedFeature: [] })
        this.props.updateLine([])
      }

      // animate if currentIndex has feature
      let selectedFeature = nextProps.geoData.find(f => f.index === nextProps.contentIndex)
      if (selectedFeature) {
        let step = 0
        let lineToAnimate

        if (selectedFeature.connect !== true && (selectedFeature.coo || []).length === 2) {
          let prevCoords
          for (let i = +nextProps.contentIndex - 1; i > -1; i--) {
            const currCoords = (geoData[i] || {}).coo || []
            if (currCoords.length === 2) {
              prevCoords = currCoords
              break
            }
          }
          if (!prevCoords) return
          const end = { x: selectedFeature.coo[0], y: selectedFeature.coo[1] }
          const start = { x: prevCoords[0], y: prevCoords[1] }
          const generator = new Arc.GreatCircle(start, end, {})
          lineToAnimate = generator.Arc(100, { offset: 10 }).geometries[0].coords
        } else {
          lineToAnimate = selectedFeature.coo
          if (!lineToAnimate) return
        }

        const numSteps = lineToAnimate.length // Change this to set animation resolution
        let prevIndex = -1

        const self = this
        if (interval !== -1) {
          clearInterval(interval)
          interval = -1
        }
        interval = setInterval(function () {
          step += 1
          if (step > numSteps) {
            clearInterval(interval)
            interval = -1
          } else {
            let curDistance = step / numSteps
            let nextIndex = Math.floor(easeCubic(curDistance) * numSteps)
            if (nextIndex === numSteps) {
              clearInterval(interval)
              interval = -1
              return
            }
            if (nextIndex !== prevIndex) {
              updateLine(lineToAnimate.slice(0, nextIndex))
            }
            prevIndex = nextIndex
          }
        }, fullTime / numSteps)
      }
    }

    if (isDirty) {
      this.setState({ layers: layers })
    }
  }

  _getTexts ({ textData, viewport }) {
    if (!textData) {
      return false
    }

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    })

    textData.forEach(p => {
      try {
        const screenCoords = transform.project(p.coo)
        p.x = screenCoords[0]
        p.y = screenCoords[1]
        p.zoomLevels = []
      } catch (e) {
        // console.error('error parsing marker coordinates',e)
      }
    })

    return textData
  }

  _getMarker ({ markerData, viewport, showCluster }) {
    if (!markerData) {
      return false
    }

    const tree = this._tree

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    })

    markerData.forEach(p => {
      try {
        const screenCoords = transform.project(p.coo)
        p.x = screenCoords[0]
        p.y = screenCoords[1]
        p.zoomLevels = []
      } catch (e) {
        // console.error('error parsing marker coordinates',e)
      }
    })

    tree.clear()
    tree.load(markerData)

    if (showCluster) {
      const sizeScale = 20 * properties.markerSize * Math.min(Math.pow(1.5, viewport.zoom - 10), 1) * window.devicePixelRatio
      for (let z = 0; z <= 20; z++) {
        const radius = sizeScale / Math.sqrt(2) / Math.pow(2, z)

        markerData.filter(el => el.subtype !== 'c').forEach(p => {
          if (p.zoomLevels && p.zoomLevels[z] === undefined) {
            // this point does not belong to a cluster
            const { x, y } = p

            // find all points within radius that do not belong to a cluster
            const neighbors = tree
              .search({
                minX: x - radius,
                minY: y - radius,
                maxX: x + radius,
                maxY: y + radius
              })
              .filter(neighbor => neighbor.zoomLevels[z] === undefined)

            // only show the center point at this zoom level
            neighbors.forEach(neighbor => {
              if (neighbor === p) {
                p.zoomLevels[z] = {
                  icon: getIconName(neighbors.length),
                  size: getIconSize(neighbors.length),
                  points: neighbors
                }
              } else {
                neighbor.zoomLevels[z] = null
              }
            })
          }
        })
      }
    }
    return markerData
  }

  _getArcs (data) {
    if (!data) {
      return null
    }

    // const { flows, centroid } = selectedFeature.properties

    // const flows = [42]
    const arcs = data.map(el => {
      return {
        source: el[0],
        target: el[1],
        color: el[2],
        color2: el[3],
        value: 200
      }
    })

    // const scale = scaleQuantile()
    //   .domain(arcs.map(a => Math.abs(a.value)))
    //   .range(inFlowColors.map((c, i) => i))
    //
    // arcs.forEach(a => {
    //   a.gain = Math.sign(a.value)
    //   a.quantile = [255, 0, 204]
    // })

    return arcs
  }

  // _onClick (event, s) {
  //   console.debug('onclick marker', event, s)
  //   return true
  // }

  /*

    typeToDescriptedType: {
    'ae|r': '[Area Entity] Ruler',
    // 'ae|capital': '[Area Entity] Capital',
    'ae|c': '[Area Entity] Culture',
    'ae|re': '[Area Entity] Religion',
    'ae|reg': '[Area Entity] General Religion',
    'a': '[Podcast & Audio]',
    'e': '[Epic]',
    't': '[External Article or Primary Source]',
    'h': '[HTML or Text]',
    'i|a': '[Image] Artefact',
    'i|b': '[Image] Battle',
    'i|c': '[Image] City & Building',
    'i|p': '[Image] Person',
    'i|m': '[Image] Other',
    'ps': '[Primary Source]',
    'v': '[Video]',
    'w|ar': '[Wiki Article] Artifacts',
    'w|b': '[Wiki Article] Battles -> Battles',
    'w|si': '[Wiki Article] Battles -> Sieges',
    'w|c': '[Wiki Article] Cities -> Cities',
    'w|ca': '[Wiki Article] Cities -> Castles',
    'w|m': '[Wiki Article] People -> Military',
    'w|p': '[Wiki Article] People -> Politicians',
    'w|e': '[Wiki Article] People -> Explorers',
    'w|s': '[Wiki Article] People -> Scientists',
    'w|a': '[Wiki Article] People -> Artists',
    'w|r': '[Wiki Article] People -> Religious',
    'w|at': '[Wiki Article] People -> Athletes',
    'w|op': '[Wiki Article] People -> Unclassified',
    'w|ai': '[Wiki Article] Other -> Area Info',
    'w|o': '[Wiki Article] Other -> Unknown',
    'o': 'Other'

   */

  render () {
    const { viewport, markerData, selectedYear, theme } = this.props
    const { layers } = this.state

    return <DeckGL {...viewport}
      getCursor={() => 'pointer'}
      layers={layers} />
  }
}
