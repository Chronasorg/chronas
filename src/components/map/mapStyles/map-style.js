import {fromJS} from 'immutable';
import MAP_STYLE from './map-style-basic-v8.json';

export const watercolorBase = {
  "id": "basemap",
  "type": "raster",
  "source": "watercolor",
  "minzoom": 0,
  "maxzoom": 22,
}

// export const topographicBase = {
//   "id": "topographic",
//   "type": "raster",
//   "source": "topographic",
//   "minzoom": 0,
//   "maxzoom": 22,
// }

// Add the vector tile source for counties
MAP_STYLE.layers.splice(0, 0,
  watercolorBase,
  // topographicBase
);

// Insert custom layers before city labels
// MAP_STYLE.layers.splice(
//   MAP_STYLE.layers.findIndex(layer => layer.id === 'place_label_city'), 0,
//   // Counties polygons
//   {
//     id: 'counties',
//     interactive: true,
//     type: 'fill',
//     source: 'counties',
//     'source-layer': 'original',
//     paint: {
//       'fill-outline-color': 'rgba(0,0,0,0.1)',
//       'fill-color': 'rgba(0,0,0,0.1)'
//     }
//   },
//   // Highlighted county polygons
//   {
//     id: 'counties-highlighted',
//     type: 'fill',
//     source: 'counties',
//     'source-layer': 'original',
//     paint: {
//       'fill-outline-color': '#484896',
//       'fill-color': '#6e599f',
//       'fill-opacity': 0.75
//     },
//     filter: ['in', 'COUNTY', '']
//   }
// );

export const provincesLayer = fromJS({
  id: 'provinces',
  source: 'provinces',
  type: 'fill',
  // 'source-layer': 'original',
  interactive: true,
  paint: {
    'fill-color': {
      property: 'color',
      type: 'identity'
    },
    'fill-opacity': 0.4
  }
});

export const markerCountLayer = fromJS({
  id: "cluster-count",
  type: "symbol",
  source: "markers",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["Cinzel Bold"],
    "text-size": 12
  }
})

export const markerLayer = fromJS({
  id: "markers",
  type: "circle",
  source: "markers",
  filter: ["!has", "point_count"],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff"
  }
})

export const clusterLayer = fromJS({
  id: "clusters",
  type: "circle",
  source: "markers",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": {
      property: "point_count",
      type: "interval",
      stops: [
        [0, "#51bbd6"],
        [10, "#f1f075"],
        [30, "#f28cb1"],
      ]
    },
    "circle-radius": {
      property: "point_count",
      type: "interval",
      stops: [
        [0, 20],
        [100, 30],
        [750, 40]
      ]
    }
  }
});

export const provincesHighlightedLayer = fromJS({
  id: 'provinces-highlighted',
  source: 'provinces',
  // 'source-layer': 'original',
  type: 'fill',
  interactive: true,
  paint: {
    'fill-outline-color': '#484896',
    'fill-color': '#6e599f',
    'fill-opacity': 0.75
  },
  filter: ['in', 'name', '']
});

export const defaultMapStyle = fromJS(MAP_STYLE);

export const highlightLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'provinces-highlighted');
export const basemapLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'basemap');
