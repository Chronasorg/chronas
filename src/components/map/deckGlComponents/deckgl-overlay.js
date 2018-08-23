import React, { Component } from 'react'
import { scaleQuantile } from 'd3-scale'
import { rgb } from 'd3-color'
import { easeCubic } from 'd3-ease'
import rbush from 'rbush'
import DeckGL, { WebMercatorViewport, IconLayer, ScatterplotLayer, PathLayer, GeoJsonLayer, TextLayer, ArcLayer } from 'deck.gl'
const Arc = require('arc')
import TagmapLayer from './tagmap-layer'
import { properties, RGBAtoArray } from '../../../properties'

const iconWidthModern = 128
const iconHeightModern = 169
const iconWidth = 135
const iconHeight = 127

const iconMapping = {
  them: {
    'marker-1': {
      'x': 0,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-2': {
      'x': iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-3': {
      'x': 2 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-4': {
      'x': 3 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-5': {
      'x': 0,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-6': {
      'x': iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-7': {
      'x': 2 * iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-8': {
      'x': 3 * iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-9': {
      'x': 0,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-10': {
      'x': iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-20': {
      'x': 2 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-30': {
      'x': 3 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-40': {
      'x': 0,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-50': {
      'x': iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-60': {
      'x': 2 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'capital': {
      'x': 3 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-80': {
      'x': 0,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-90': {
      'x': iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker-100': {
      'x': 2 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker': {
      'x': 3 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    }
  },
  abst: {
    'marker-1': {
      'x': 0,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-2': {
      'x': iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-3': {
      'x': 2 * iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-4': {
      'x': 3 * iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-5': {
      'x': 0,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-6': {
      'x': iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-7': {
      'x': 2 * iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-8': {
      'x': 3 * iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-9': {
      'x': 0,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-10': {
      'x': iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-20': {
      'x': 2 * iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-30': {
      'x': 3 * iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-40': {
      'x': 0,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-50': {
      'x': iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-60': {
      'x': 2 * iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-70': {
      'x': 3 * iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-80': {
      'x': 0,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-90': {
      'x': iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker-100': {
      'x': 2 * iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'marker': {
      'x': 3 * iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    }
  }
}

const fullTime = 4000
let interval = -1

function getIconName (size) {
  if (size === 0) {
    return ''
  }
  if (size < 10) {
    return `marker-${size}`
  }
  if (size < 100) {
    return `marker-${Math.floor(size / 10)}0`
  }
  return 'marker-100'
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
      arcs: this._getArcs(props.arcData),
      marker: [],
      texts: [],
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
    const { markerData, viewport, sizeScale, showCluster } = this.props
    this._getMarker( {...{markerData: markerData.filter(el => el.subtype !== 'cities')}, sizeScale, viewport, showCluster}) // .filter(el => el.subtype !== 'cities')
    this._getTexts( {...{markerData: markerData.filter(el => el.subtype === 'cities')}, viewport, showCluster})
  }

  componentWillReceiveProps (nextProps) {
    const { contentIndex, markerData, arcData, markerTheme, geoData, updateLine } = this.props
    const { showCluster, sizeScale } = nextProps

    if (
      nextProps.arcData !== arcData || !nextProps.arcData.every((el, i) => el === arcData[i])
    ) {
      this.setState({
        arcs: this._getArcs(nextProps.arcData)
      })
    }

    const { viewport } = nextProps
    const oldViewport = this.props.viewport

    if (this.props.showCluster !== showCluster ||
      nextProps.markerData.length !== markerData.length ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height) {


      const nextIconMarker = nextProps.markerData/*.filter(el => el.subtype !== 'cities')*/
      const nextTextMarker = nextProps.markerData.filter(el => el.subtype === 'cities')
      const iconMarker = markerData/*.filter(el => el.subtype !== 'cities')*/
      const textMarker = markerData.filter(el => el.subtype === 'cities')

      if (this.props.showCluster !== showCluster || nextIconMarker.length !== iconMarker.length) {
        this.setState({ marker: this._getMarker({ ...{markerData: nextIconMarker}, sizeScale, viewport, showCluster}) })
      }
      if (nextTextMarker.length !== textMarker.length) {
        this.setState({ texts: this._getTexts({ ...{markerData: nextTextMarker}, viewport}) })
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
      let selectedFeature = geoData.filter(f => f.index === nextProps.contentIndex)[0]
      if (selectedFeature) {
        let step = 0
        let lineToAnimate

        if (selectedFeature.connect !== true && (selectedFeature.geometry.coordinates || []).length === 2) {
          let prevCoords
          for (let i = +nextProps.contentIndex - 1; i > -1; i--) {
            const currCoords = ((geoData[i] || {}).geometry || {}).coordinates || []
            if (currCoords.length === 2) {
              prevCoords = currCoords
              break
            }
          }
          if (!prevCoords) return
          const end = { x: selectedFeature.geometry.coordinates[0], y: selectedFeature.geometry.coordinates[1] }
          const start = { x: prevCoords[0], y: prevCoords[1] }
          const generator = new Arc.GreatCircle(start, end, {})
          lineToAnimate = generator.Arc(100, { offset:10 }).geometries[0].coords
        } else {
          lineToAnimate = (((selectedFeature.properties || {}).f || {}).geometry || {}).coordinates
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
  }

  _getTexts ({ markerData, viewport }) {
    if (!markerData) {
      return false
    }

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    })

    markerData.forEach(p => {
      const screenCoords = transform.project(p.coo)
      p.x = screenCoords[0]
      p.y = screenCoords[1]
      p.zoomLevels = []
    })

    return markerData
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
      const screenCoords = transform.project(p.coo)
      p.x = screenCoords[0]
      p.y = screenCoords[1]
      p.zoomLevels = []
    })

    tree.clear()
    tree.load(markerData)

    if (showCluster) {
      const sizeScale = properties.markerSize * Math.min(Math.pow(1.5, viewport.zoom - 10), 1) * window.devicePixelRatio
      for (let z = 0; z <= 20; z++) {
        const radius = sizeScale / Math.sqrt(2) / Math.pow(2, z)

        markerData.filter(el => el.subtype !== 'cities').forEach(p => {
          if (p.zoomLevels[z] === undefined) {
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
    const { viewport, strokeWidth, showCluster, geoData, setTooltip, onHover, markerTheme, theme, onMarkerClick } = this.props
    const { animatedFeature, arcs, marker, texts /* geo */ } = this.state
    const z = Math.floor(viewport.zoom)
    const size = /*showCluster ? 1 :*/ Math.min(Math.pow(1.5, viewport.zoom - 10), 1)
    const updateTrigger = z * showCluster

    // console.debug("remder iconlayer with data", iconData)
    const layers = []

    if (texts && texts.length > 0) {
      layers.push(new TagmapLayer({
        id: 'cities-labels',
        data: texts,
        // getWeight: x => /*normalize(x.pop) ||*/ Math.random() * 100,
        getLabel: d => d.name,
        onMarkerClick: onMarkerClick,
        getPosition: d => d.coo,
        minFontSize: 30,
        maxFontSize: 35
      }))

      layers.push(new ScatterplotLayer({
        id: 'cities-dots',
        data: texts.filter(el => !el.capital),
        outline: true,
        // radiusScale: 30,
        opacity: 0.6,
        strokeWidth: 3,
        autoHighlight: true,
        highlightColor: RGBAtoArray(theme.highlightColors[0]),
        getPosition: d => d.coo,
        pickable: true,
        onClick: onMarkerClick,
        getColor: [50, 50, 50, 200], // d => (d[2] === 1 ? maleColor : femaleColor),
        radiusMinPixels: 3,
        radiusMaxPixels: 3,
      }))
    }

    if (marker && marker.length > 0) {
      layers.push(new IconLayer({
        id: 'icon',
        autoHighlight: true,
        highlightColor: RGBAtoArray(theme.highlightColors[0]),
        data: marker,
        pickable: true,
        iconAtlas: showCluster
          ? ('/images/' + markerTheme + '-cluster-atlas.png')
          : ('/images/' + markerTheme + '-atlas.png'),
        iconMapping: iconMapping[markerTheme.substr(0, 4)],
        sizeScale: properties.markerSize * size * window.devicePixelRatio,
        getPosition: d => d.coo,
        getIcon: d => (d.subtype === 'cities') ? 'marker-10' : (showCluster ? d.zoomLevels[z] && d.zoomLevels[z].icon : 'marker'), // should be d.subtype (or type)
        getSize: d => (d.subtype === 'cities') ? 4 : 6 /*(showCluster ? d.zoomLevels[z] && d.zoomLevels[z].size : 10)*/,
        onHover: e => onHover(e),
        onClick: onMarkerClick,
        updateTriggers: {
          getIcon: updateTrigger,
          getSize: updateTrigger
        }
      }))
    }

    if (texts && texts.length > 0) {
      layers.push(new TagmapLayer({
        id: 'cities-layer',
        data: texts,
        getWeight: x => 50,//*normalize(x.pop) ||*/ Math.random()*100,
        getLabel: d => d.name,
        getPosition: d => d.coo,
        minFontSize: 24,
        maxFontSize: 32 * 2 - 14
      }))
    }

    if (arcs && arcs.length > 0) {
      layers.push(new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => d.color,
        getTargetColor: d => d.color,
        strokeWidth
      }))
    }

    return <DeckGL {...viewport} layers={layers} />
  }
}
