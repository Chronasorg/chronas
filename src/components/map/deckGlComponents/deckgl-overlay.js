import React, { Component } from 'react'
import { scaleQuantile } from 'd3-scale'

import DeckGL, { GeoJsonLayer, ArcLayer } from 'deck.gl'

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
    this.state = {
      arcs: this._getArcs(props.data)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { data } = this.props
    if (
      nextProps.data !== data || !nextProps.data.every((el, i) => el === data[i])
    ) {
      this.setState({
        arcs: this._getArcs(nextProps.data)
      })
    }
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
    const { viewport, strokeWidth, data } = this.props
    const { arcs } = this.state

    if (!arcs || arcs.length === 0) {
      return null
    }

    const layers = [
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => d.color,
        getTargetColor: d => d.color,
        strokeWidth
      })
    ]

    return <DeckGL {...viewport} layers={layers} />
  }
}
