/* eslint-disable max-len */
import {CompositeLayer, TextLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';
import TagMapWrapper from './tagmap-wrapper';

const TEXTCOLOR = [
  [51, 51, 51, 80],
]

const defaultProps = {
  getLabel: x => x.label,
  getWeight: x => x.weight || 1,
  getPosition: x => x.position,
  minFontSize: 14,
  maxFontSize: 32,
  weightThreshold: 1
};

const MAX_CACHED_ZOOM_LEVEL = 5;

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
    maxFontSize: 16,
    weightThreshold: 3,
  },{
    minFontSize: 0,
    maxFontSize: 22,
    weightThreshold: 1.5,
  },{
    minFontSize: 12,
    maxFontSize: 28,
    weightThreshold: 1,
  },{
    minFontSize: 24,
    maxFontSize: 34,
    weightThreshold: 1,
  },{
    minFontSize: 34,
    maxFontSize: 50,
    weightThreshold: 1,
  }
]

export default class TagmapLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      // Cached tags per zoom level
      tagsCache: {},
      tags: []
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    let needsUpdate = changeFlags.viewportChanged;

    if (changeFlags.dataChanged) {
      this.updateTagMapData();
      needsUpdate = true;
    } else if (
      props.minFontSize !== oldProps.minFontSize ||
      props.maxFontSize !== oldProps.maxFontSize ||
      props.weightThreshold !== oldProps.weightThreshold
    ) {
      this.setState({tagsCache: {}});
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.updateTagMapVis();
    }
  }

  updateTagMapData() {
    const {data, getLabel, getPosition, getWeight} = this.props;
    const tagMap = new TagMapWrapper();
    tagMap.setData(data, {getLabel, getPosition, getWeight});
    this.setState({tagMap, tagsCache: {}});
  }

  updateTagMapVis() {
    const {tagMap, tagsCache} = this.state;
    if (!tagMap) {
      return;
    }

    const {viewport} = this.context;
    const discreteZoomLevel = Math.floor(viewport.zoom);
    let tags = tagsCache[discreteZoomLevel];
    if (tags) {
      this.setState({tags});
      return;
    }

    const {minFontSize, maxFontSize, weightThreshold} = this.props;

    let bbox = null;

    if (discreteZoomLevel > MAX_CACHED_ZOOM_LEVEL) {
      const {unproject, width, height} = viewport;
      const corners = [
        unproject([0, 0]),
        unproject([width, 0]),
        unproject([0, height]),
        unproject([width, height])
      ];

      bbox = {
        minX: Math.min.apply(null, corners.map(p => p[0])),
        minY: Math.min.apply(null, corners.map(p => p[1])),
        maxX: Math.max.apply(null, corners.map(p => p[0])),
        maxY: Math.max.apply(null, corners.map(p => p[1]))
      };
    }

    console.debug(discreteZoomLevel)
    tags = tagMap.getTags({
      bbox,
      minFontSize: (zoomFontSizes[discreteZoomLevel] || {}).minFontSize || 0,
      maxFontSize: (zoomFontSizes[discreteZoomLevel] || {}).maxFontSize || 74,
      weightThreshold: (zoomFontSizes[discreteZoomLevel] || {}).weightThreshold || 1,
      zoom: discreteZoomLevel
    });

    if (discreteZoomLevel <= MAX_CACHED_ZOOM_LEVEL) {
      tagsCache[discreteZoomLevel] = tags;
    }
    this.setState({tags});
  }

  renderLayers() {
    const {tags} = this.state;
    const { onMarkerClick } = this.props;

    return [
      new TextLayer({
        id: 'tagmap-layer',
        data: tags,
        fontFamily: 'Cinzel, serif',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [0,-10],
        onClick: onMarkerClick,
        getText: d => d.label,
        getPosition: d => d.position,
        getColor: d => TEXTCOLOR,
        getSize: (d) => { /*console.debug(d);*/ return d.capital ? (1.5*d.height) : d.height },
        pickable: false,
      })
    ];
  }
}

TagmapLayer.layerName = 'TagmapLayer';
TagmapLayer.defaultProps = defaultProps;
