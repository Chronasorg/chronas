import { fromJS } from 'immutable'
import MAP_STYLE from './map-style-basic-v8.json'
import { properties } from '../../../properties'

export const defaultMapStyle = fromJS(MAP_STYLE)
export const highlightLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'provinces-highlighted')
export const basemapLayerIndex = MAP_STYLE.layers.findIndex(layer => layer.id === 'basemap')
export const areaColorLayerIndex = properties.areaColorLayers.reduce(function (acc, cur) {
  acc[cur] = MAP_STYLE.layers.findIndex(layer => layer.id === cur)
  return acc
}, {})

export const populationColorScale = ['rgba(255,255,255,0.1)', 'rgba(199,0,2,1)']
