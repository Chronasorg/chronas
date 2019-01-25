/* eslint-disable max-len */
import { CompositeLayer, TextLayer } from 'deck.gl'
import TagMapWrapper from './tagmap-wrapper'

const TEXTCOLOR = [ 0, 0, 0, 200 ]

const defaultProps = {
  getLabel: x => x.label,
  getWeight: x => x.weight || 1,
  getPosition: x => x.position,
  minFontSize: 14,
  maxFontSize: 32,
  weightThreshold: 1
}

const MAX_CACHED_ZOOM_LEVEL = 5

const zoomFontSizes = [
  {
    minFontSize: 0,
    maxFontSize: 0,
    weightThreshold: 0,
  },
  {
    minFontSize: 0,
    maxFontSize: 0,
    weightThreshold: 0,
  },
  {
    minFontSize: 0,
    maxFontSize: 0,
    weightThreshold: 0,
  }, {
    minFontSize: 0,
    maxFontSize: 18,
    weightThreshold: 1.5,
  }, {
    minFontSize: 12,
    maxFontSize: 32,
    weightThreshold: 1,
  }, {
    minFontSize: 24,
    maxFontSize: 38,
    weightThreshold: 1,
  }, {
    minFontSize: 34,
    maxFontSize: 54,
    weightThreshold: 1,
  }
]

export default class TagmapLayer extends CompositeLayer {
  initializeState () {
    this.state = {
      // Cached tags per zoom level
      tagsCache: {},
      tags: []
    }
  }

  shouldUpdateState ({ changeFlags }) {
    return changeFlags.somethingChanged
  }

  updateState ({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags })

    let needsUpdate = changeFlags.viewportChanged

    if (changeFlags.dataChanged) {
      this.updateTagMapData()
      needsUpdate = true
    } else if (
      props.minFontSize !== oldProps.minFontSize ||
      props.maxFontSize !== oldProps.maxFontSize ||
      props.weightThreshold !== oldProps.weightThreshold
    ) {
      this.setState({ tagsCache: {} })
      needsUpdate = true
    }

    if (needsUpdate) {
      this.updateTagMapVis()
    }
  }

  updateTagMapData () {
    const { data, getLabel, getPosition, getWeight } = this.props
    const tagMap = new TagMapWrapper()
    tagMap.setData(data, { getLabel, getPosition, getWeight })
    this.setState({ tagMap, tagsCache: {} })
  }

  updateTagMapVis () {
    const { tagMap, tagsCache } = this.state
    if (!tagMap) {
      return
    }

    const { viewport } = this.context
    const discreteZoomLevel = Math.floor(viewport.zoom)
    let tags = tagsCache[discreteZoomLevel]
    if (tags) {
      this.setState({ tags })
      return
    }

    const { minFontSize, maxFontSize, weightThreshold } = this.props

    let bbox = null

    if (discreteZoomLevel > MAX_CACHED_ZOOM_LEVEL) {
      const { unproject, width, height } = viewport
      const corners = [
        unproject([0, 0]),
        unproject([width, 0]),
        unproject([0, height]),
        unproject([width, height])
      ]

      bbox = {
        minX: Math.min.apply(null, corners.map(p => p[0])),
        minY: Math.min.apply(null, corners.map(p => p[1])),
        maxX: Math.max.apply(null, corners.map(p => p[0])),
        maxY: Math.max.apply(null, corners.map(p => p[1]))
      }
    }

    if (discreteZoomLevel > 2) {
      tags = tagMap.getTags({
        bbox,
        minFontSize: zoomFontSizes[discreteZoomLevel] ? zoomFontSizes[discreteZoomLevel].minFontSize : 0,
        maxFontSize: zoomFontSizes[discreteZoomLevel] ? zoomFontSizes[discreteZoomLevel].maxFontSize : 74,
        weightThreshold: zoomFontSizes[discreteZoomLevel] ? zoomFontSizes[discreteZoomLevel].weightThreshold : 1,
        zoom: discreteZoomLevel
      })

      if (discreteZoomLevel <= MAX_CACHED_ZOOM_LEVEL) {
        tagsCache[discreteZoomLevel] = tags
      }
    }
    else {
      tags = []
    }
    this.setState({ tags })
  }

  renderLayers () {
    const { tags } = this.state
    const { onMarkerClick } = this.props

    return [
      new TextLayer({
        id: 'tagmap-layer',
        data: tags,
        fontFamily: 'Cinzel, serif', //  'Times New Roman, serif',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: d => (d.weight === 4) ? [0, 25] : [0, -10],
        onClick: onMarkerClick,
        getText: d => d.label,
        getPosition: d => d.position,
        // getColor: d => TEXTCOLOR,
        getSize: (d) => d.height, // /*(d.weight === 2) ? (1.2 * d.height) : */
        pickable: false,
      })
    ]
  }
}

TagmapLayer.layerName = 'TagmapLayer'
TagmapLayer.defaultProps = defaultProps
