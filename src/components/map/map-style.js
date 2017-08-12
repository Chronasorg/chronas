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
  source: 'incomeByState',
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

export const provincesHighlightedLayer = fromJS({
  id: 'provinces-highlighted',
  source: 'incomeByState',
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
/*
// Insert custom layers before city labels
MAP_STYLE.layers.splice(0, 0,
  // Counties polygons
  {
    id: 'counties',
    interactive: true,
    type: 'fill',
    source: 'incomeByState',
    'source-layer': 'original',
    paint: {
      'fill-outline-color': 'rgba(0,0,0,0.1)',
      'fill-color': 'rgba(0,0,0,0.1)'
    }
  },
  {
    id: 'provinces-highlighted',
    type: 'fill',
    source: 'incomeByState',
    'source-layer': 'original',
    paint: {
      'fill-outline-color': '#484896',
      'fill-color': '#6e599f',
      'fill-opacity': 0.75
    },
    filter: ['in', 'COUNTY', '']
  }
);
*/
export const defaultMapStyle = fromJS(MAP_STYLE);

export const highlightLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'provinces-highlighted');
export const basemapLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'basemap');
