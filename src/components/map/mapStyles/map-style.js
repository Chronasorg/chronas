import { fromJS } from 'immutable'
import MAP_STYLE from './map-style-basic-v8.json'
import { properties } from '../../../properties'

// export const topographicBase = {
//   "id": "topographic",
//   "type": "raster",
//   "source": "topographic",
//   "minzoom": 0,
//   "maxzoom": 22,
// }
//
// export const provincesLayer = fromJS({
//   id: 'provinces',
//   source: 'provinces',
//   type: 'fill',
//   // 'source-layer': 'original',
//   interactive: true,
//   paint: {
//     'fill-color': {
//       property: 'color',
//       type: 'identity'
//     },
//     'fill-opacity': 0.4
//   }
// });
//
// export const markerCountLayer = fromJS({
//   id: "cluster-count",
//   type: "symbol",
//   source: "markers",
//   filter: ["has", "point_count"],
//   layout: {
//     "text-field": "{point_count_abbreviated}",
//     "text-font": ["Cinzel Bold"],
//     "text-size": 12
//   }
// })
//
// export const markerLayer = fromJS({
//   id: "markers",
//   type: "circle",
//   source: "markers",
//   filter: ["!has", "point_count"],
//   paint: {
//     "circle-color": "#11b4da",
//     "circle-radius": 4,
//     "circle-stroke-width": 1,
//     "circle-stroke-color": "#fff"
//   }
// })
//
// export const clusterLayer = fromJS({
//   id: "clusters",
//   type: "circle",
//   source: "markers",
//   filter: ["has", "point_count"],
//   paint: {
//     "circle-color": {
//       property: "point_count",
//       type: "interval",
//       stops: [
//         [0, "#51bbd6"],
//         [10, "#f1f075"],
//         [30, "#f28cb1"],
//       ]
//     },
//     "circle-radius": {
//       property: "point_count",
//       type: "interval",
//       stops: [
//         [0, 20],
//         [100, 30],
//         [750, 40]
//       ]
//     }
//   }
// });
//
// export const provincesHighlightedLayer = fromJS({
//   id: 'provinces-highlighted',
//   source: 'provinces',
//   // 'source-layer': 'original',
//   type: 'fill',
//   interactive: true,
//   paint: {
//     'fill-outline-color': '#484896',
//     'fill-color': '#6e599f',
//     'fill-opacity': 0.75
//   },
//   filter: ['in', 'name', '']
// });

export const defaultMapStyle = fromJS(MAP_STYLE)

export const highlightLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'provinces-highlighted')
export const basemapLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'basemap')

export const areaColorLayerIndex = properties.areaColorLayers.reduce(function (acc, cur) {
  acc[cur] = MAP_STYLE.layers.findIndex(layer => layer.id === cur)
  return acc
}, {})

// export const populationColorScale = [0, 3000]
export const populationColorScale = ['rgba(255,255,255,0.1)', 'rgba(199,0,2,1)']
