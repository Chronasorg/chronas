import React, { Component } from 'react'
import { scaleQuantile } from 'd3-scale'
import {rgb} from 'd3-color';

import rbush from 'rbush'

import DeckGL, { WebMercatorViewport, IconLayer, GeoJsonLayer, ArcLayer } from 'deck.gl'
const ICON_SIZE = 100
const iconMapping = {
  'marker-1': {
    'x': 0,
    'y': 0,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-2': {
    'x': 128,
    'y': 0,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-3': {
    'x': 256,
    'y': 0,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-4': {
    'x': 384,
    'y': 0,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-5': {
    'x': 0,
    'y': 128,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-6': {
    'x': 128,
    'y': 128,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-7': {
    'x': 256,
    'y': 128,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-8': {
    'x': 384,
    'y': 128,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-9': {
    'x': 0,
    'y': 256,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-10': {
    'x': 128,
    'y': 256,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-20': {
    'x': 256,
    'y': 256,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-30': {
    'x': 384,
    'y': 256,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-40': {
    'x': 0,
    'y': 384,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-50': {
    'x': 128,
    'y': 384,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-60': {
    'x': 256,
    'y': 384,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-70': {
    'x': 384,
    'y': 384,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-80': {
    'x': 0,
    'y': 512,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-90': {
    'x': 128,
    'y': 512,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker-100': {
    'x': 256,
    'y': 512,
    'width': 128,
    'height': 128,
    'anchorY': 128
  },
  'marker': {
    'x': 384,
    'y': 512,
    'width': 128,
    'height': 128,
    'anchorY': 128
  }
}
export const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]
]

export const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38]
]

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
      arcs: this._getArcs(props.arcData),
      marker: this._getMarker(props),
      // geo: props.geoData || [],
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    }
  }

  componentWillReceiveProps (nextProps) {
    const { markerData, arcData, /*geoData*/ } = this.props

    if (
      nextProps.arcData !== arcData || !nextProps.arcData.every((el, i) => el === arcData[i])
    ) {
      this.setState({
        arcs: this._getArcs(nextProps.arcData)
      })
    }

    const { viewport } = nextProps
    const oldViewport = this.props.viewport

    if (
      (nextProps.showCluster || (this.props.showCluster !== nextProps.showCluster)) &&
      nextProps.markerData.length !== markerData.length ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height
    ) {
      this.setState({ marker: this._getMarker(nextProps) })
    }
    //
    // if (
    //   nextProps.geoData !== geoData || !nextProps.geoData.every((el, i) => el === geoData[i])
    // ) {
    //   this.setState({
    //     geo: nextProps.geoData
    //   })
    // }
  }

  _getMarker ({ markerData, viewport }) {
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

    for (let z = 0; z <= 20; z++) {
      const radius = ICON_SIZE / 2 / Math.pow(2, z)

      markerData.forEach(p => {
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

  render () {
    const { viewport, strokeWidth, showCluster, geoData } = this.props
    const { arcs, marker /*geo*/ } = this.state

    const z = Math.floor(viewport.zoom)
    const size = showCluster ? 1 : Math.min(Math.pow(1.5, viewport.zoom - 10), 1)
    const updateTrigger = z * showCluster

    // console.debug("remder iconlayer with data", iconData)
    const layers = []

    if (marker && marker.length > 0) {
      layers.push(new IconLayer({
        id: 'icon',
        data: marker,
        pickable: this.props.onHover || this.props.onClick,
        iconAtlas: 'http://uber.github.io/deck.gl/images/location-icon-atlas.png',
        iconMapping,
        sizeScale: ICON_SIZE * size * window.devicePixelRatio,
        getPosition: d => d.coo,
        getIcon: d => (showCluster ? d.zoomLevels[z] && d.zoomLevels[z].icon : 'marker'),
        getSize: d => (showCluster ? d.zoomLevels[z] && d.zoomLevels[z].size : 1),
        onHover: this.props.onHover,
        onClick: this.props.onClick,
        updateTriggers: {
          getIcon: updateTrigger,
          getSize: updateTrigger
        }
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

    if (geoData && geoData.length > 0) {
      layers.push(new GeoJsonLayer({
        id: 'geo',
        data: geoData.filter(f => (f || {}).hidden),
        pickable: true,
        stroked: false,
        filled: true,
        extruded: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 4,
        getFillColor: [255, 160, 180, 200],
        getLineColor: d => colorToRGBArray(d.properties.color),
        getRadius: 100,
        getLineWidth: 10,
        getElevation: 30,
        onHover: this.props.onHover,
        onClick: this.props.onClick,
        // onHover: ({object}) => setTooltip(object.properties.name || object.properties.station)
      }))
    }

    return <DeckGL {...viewport} layers={layers} />
  }
}
