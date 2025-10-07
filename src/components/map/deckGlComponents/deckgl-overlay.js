import React, { Component } from 'react'
import { rgb } from 'd3-color'
import { easeCubicOut } from 'd3-ease'
import rbush from 'rbush'
import { TYPE_COLLECTION } from '../../map/actionReducers'
import DeckGL, { ArcLayer, IconLayer, ScatterplotLayer, WebMercatorViewport } from 'deck.gl'
import TagmapLayer from './tagmap-layer'
import { iconMapping, iconSize, properties, RGBAtoArray } from '../../../properties'
import utilsQuery from '../utils/query'
import MovementLayerWrapper from './movement-wrapper'

const ROUTEABLETYPES = ["b","h","si","c","ca","l"]

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
  constructor (props) {
    super(props)

    this._tree = rbush(9, ['.x', '.y', '.x', '.y'])
    this.state = {
      animatedFeature: [],
      marker: [],
      texts: [],
      layers: [],
      x: 0,
      y: 0,
      hoveredItems: null
    }
  }

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

  componentWillUnmount () {
    if (interval !== -1) {
      clearInterval(interval)
      interval = -1
      this.props.updateLine([])
      // this.setState({ animatedFeature: [] })
    }
  }

  componentWillReceiveProps (nextProps) {
    const { activeColor, clusterRawData, contentIndex, markerData, arcData, markerTheme, migrationData, selectedYear, selectedItem, geoData, updateLine, goToViewport } = this.props
    const { strokeWidth, onHover, showCluster, theme, metadata, onMarkerClick, sizeScale } = nextProps

    let layers = false
    const { viewport } = nextProps
    const oldViewport = this.props.viewport

    const { animatedFeature, arcs, marker, texts, /* geo */} = this.state
    const z = Math.floor(viewport.zoom)
    const size = /* showCluster ? 1 : */ Math.min(Math.pow(1.55, viewport.zoom - 10), 1)
    const updateTrigger = z * showCluster

    const wasEpic = (selectedItem || {}).type === 'epic'
    const isEpic = (nextProps.selectedItem || {}).type === 'epic'

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
        getStrokeWidth: strokeWidth
      })
    }

    if (viewportChange ||
      this.props.showCluster !== showCluster ||
      nextProps.activeColor !== activeColor ||
      nextProps.markerData.length !== markerData.length ||
      nextProps.migrationData.length !== migrationData.length ||
      nextProps.geoData.length !== geoData.length ||
      nextProps.clusterRawData.length !== clusterRawData.length ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height ||
      nextProps.contentIndex !== contentIndex ||
      nextProps.selectedItem.wiki !== selectedItem.wiki) {
      // let nextIconMarker = nextProps.geoData.length !== 0 ? nextProps.geoData : []
      // if ( nextProps.contentIndex !== contentIndex) {
      let nextIconMarker = (nextProps.geoData.length !== 0 || isEpic) ? ((nextProps.contentIndex === contentIndex) ? nextProps.geoData : nextProps.geoData.map((el) => {
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
      const nextTextMarker = nextProps.markerData.filter(el => el && el.subtype && (el.subtype === 'c' || el.subtype === 'cp'))
      const iconMarker = (geoData.length !== 0 || wasEpic) ? geoData : markerData
      const textMarker = markerData.filter(el => el && el.subtype === 'c')

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
          capitalMarkers = nextIconMarker.filter(el => el && el.subtype && (el.subtype === 'cp' || (el.subtype === 'c' && (el.capital && el.capital.find((ell) => {
            return ell[0] <= +selectedYear && ell[1] >= +selectedYear
          })))))
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
          highlightColor: showCluster ? [0, 50, 0, 1] : RGBAtoArray(theme.highlightColors[0]), // showCluster
          data: this._getMarker({
            ...{
              markerData: (showCluster && nextProps.geoData.length > 0) ? [] : (nextProps.activeColor === 'ruler') ? nextIconMarker.filter(el => el && el.subtype !== 'c').concat(capitalMarkers0).concat(capitalMarkers) : nextIconMarker.filter(el => el && el.subtype && el.subtype[0] !== 'c')
            }, // .filter(el => el.subtype !== 'c')},
            sizeScale,
            viewport,
            geoData: nextProps.geoData,
            showCluster,
          }),
          opacity: 1,
          pickable: true,
          iconAtlas: showCluster
            ? ('/images/themed-cluster-atlas.png')
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
          capitalMarkers = nextIconMarker.filter(el => el && el.subtype && (el.subtype === 'cp' || (el.subtype === 'c' && (el.capital && el.capital.find((ell) => {
            return ell[0] <= +selectedYear && ell[1] >= +selectedYear
          })))))
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
          highlightColor: [0, 0, 0, 0],
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
          getWeight: d => d.subtype === 'cp' ? 4 : d.capital ? 2 : 1,
          // getWeight: x => /*normalize(x.pop) ||*/ Math.random() * 100,
          getLabel: d => d.name,
          // onMarkerClick: onMarkerClick,
          getPosition: d => d.coo,
          minFontSize: 18,
          maxFontSize: 68
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

      // epic and migration movement
      // let eData = nextProps.geoData.filter(el => el.subtype === "b" || el.subtype === "si").map(el => el.coo)
      if (nextProps.migrationData.length !== migrationData.length) {
        // preData =
        // const preData = []
        // for (let i = 0; i < eData.length - 1; i++) {
        //   preData.push([eData[i], eData[i + 1]])
        // }

        const migrationLocations = {}

        nextProps.migrationData.forEach( el => {
          const idLeave = el[0][0] + " " + el[0][1]
          const idAdd = el[1][0] + " " + el[1][1]
          if (typeof migrationLocations[idLeave] === "undefined") migrationLocations[idLeave] = [-1,el[0]]
          else migrationLocations[idLeave][0]--
          if (typeof migrationLocations[idAdd] === "undefined") migrationLocations[idAdd] = [1,el[1]]
          else migrationLocations[idAdd][0]++
        })

        const migrationLocationValues = Object.values(migrationLocations).filter(el => el && Array.isArray(el) && el[0] !== -1)
        const finalMigrationLocation = {
          min: migrationLocationValues.reduce((min, p) => p[0] < min ? p[0] : min, Infinity),
          max: migrationLocationValues.reduce((max, p) => p[0] > max ? p[0] : max, -Infinity),
        }

        const MAXRADIUS = 30000
        const locMin = finalMigrationLocation.min
        const locMax = finalMigrationLocation.max
        const absMax = -1 * locMin + locMax
        const hideThreshold = (0.005 * absMax) + 1

        finalMigrationLocation.data = migrationLocationValues.filter(d => d && Array.isArray(d) && Math.abs(d[0]) > hideThreshold).map(d => {
          const val = d[0] // (Math.sqrt(Math.abs(d[0]) / absMax))
          const color = (val > 0)
            ? [100 - (100 * val / locMax), 100 + (100 * val / locMax), 0, 100 + (155 * val / locMax)]
            : (val < 0)
              ? [100 + (100 * val / locMin), 100 - (100 * val / locMin), 0, 100 + (155 * val / locMin)]
              : [100, 100, 0, 80]

          return [(Math.sqrt(Math.abs(d[0]) / absMax) * MAXRADIUS), d[1], color]
        })

        isDirty = true
        if (!layers) layers = Object.assign([], this.state.layers)
        layers[5] = !nextProps.migrationData.length ? undefined : new MovementLayerWrapper({
          id: 'movement-wrapper',
          preData: {
            data: nextProps.migrationData
          },
          year: nextProps.selectedYear
        })
        layers[6] = !(finalMigrationLocation.data || []).length ? undefined : new ScatterplotLayer({
          id: 'scatterplot-layer',
          data: finalMigrationLocation.data,
          pickable: false,
          opacity: 0.3,
          radiusScale: 6,
          radiusMinPixels: 2,
          radiusMaxPixels: 50,
          getRadius: d => d[0],
          getPosition: d => d[1],
          getColor: d => d[2],
        })
        layers[7] = !(finalMigrationLocation.data || []).length ? undefined : new ScatterplotLayer({
          id: 'scatterplot-outline-layer',
          data: finalMigrationLocation.data,
          pickable: false,
          outline: true,
          opacity: 1,
          radiusScale: 6,
          radiusMinPixels: 2,
          radiusMaxPixels: 50,
          strokeWidth: 3,
          getRadius: d => d[0],
          getPosition: d => d[1],
          getColor: d => d[2],
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
      if (interval !== -1 || typeof nextProps.contentIndex === 'undefined') {
        if (interval !== -1) clearInterval(interval)
        interval = -1
        // this.setState({ animatedFeature: [] })
        if (nextProps.contentIndex - contentIndex !== 1) this.props.updateLine([])
      }

      // animate if currentIndex has feature
      let selectedFeature = nextProps.geoData.find(f => f.index === nextProps.contentIndex)
      if (selectedFeature) {
        let step = 0
        let lineToAnimate
        let preLineCoords = []

        if (((nextProps.selectedItem || {}).data || {}).drawRoute === true || ((nextProps.selectedItem || {}).type !== TYPE_COLLECTION && (selectedFeature.connect !== true && (selectedFeature.coo || []).length === 2 && ROUTEABLETYPES.indexOf(selectedFeature.subtype) !== -1))) {
          let prevCoords
          for (let i = +nextProps.contentIndex - 1; i > -1; i--) {
            const currCoords = (geoData.find(f => f.index === i && ROUTEABLETYPES.indexOf(f.subtype) !== -1) || {}).coo || []
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

          if (((nextProps.selectedItem || {}).data || {}).drawRoute === true) {
            prevCoords = false
            for (let i = 0; i < nextProps.contentIndex; i++) {
              const currCoords = (geoData.find(f => f.index === i && (f.subtype === "b" || f.subtype === "si" || f.subtype === "h")) || {}).coo || []
              if (currCoords.length === 2) {
                if (prevCoords && i > 0) {
                  preLineCoords = preLineCoords.concat(new Arc.GreatCircle({ x: prevCoords[0], y: prevCoords[1] }, { x: currCoords[0], y: currCoords[1] }, {}).Arc(100, { offset: 10 }).geometries[0].coords)
                }
                prevCoords = currCoords
              }
            }
          }

        } else {
          lineToAnimate = selectedFeature.coo
          if (!lineToAnimate) return
        }

        const numSteps = lineToAnimate.length // Change thpoolis to set animation resolution
        let prevIndex = -1

        if (interval !== -1) {
          clearInterval(interval)
          interval = -1
        }
        interval = setInterval(function () {
          if (interval === -1) return
          step += 1
          if (step > numSteps) {
            clearInterval(interval)
            interval = -1
          } else {
            let curDistance = step / numSteps
            let nextIndex = Math.floor(easeCubicOut(curDistance) * numSteps)
            if (nextIndex === numSteps) {
              clearInterval(interval)
              interval = -1
              return
            }
            if (nextIndex !== prevIndex) {
              updateLine(preLineCoords.concat(lineToAnimate.slice(0, nextIndex)))
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

        markerData.filter(el => el && el.subtype !== 'c').forEach(p => {
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

    return arcs
  }

  render () {
    const { viewport } = this.props
    const { layers } = this.state

    return <DeckGL {...viewport}
                   getCursor={() => 'pointer'}
                   layers={layers} />
  }
}
