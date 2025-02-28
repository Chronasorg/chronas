import { adjacent } from '../data/datadef'
import * as scale from 'd3-scale'
import utilsQuery from "./query";

const turf = require('@turf/turf')

const isLight = utilsQuery.getURLParameter('light') === 'true' || (((window.location || {}).host || '').substr(0, 4) === 'light.')

const utils = {

  activeTextFeat: 'ruler',
  activeAreaFeat: 'ruler',

  rulIsSetup: false,
  culIsSetup: false,
  relIsSetup: false,
  relGenIsSetup: false,

  rulStops: [],
  relStops: [],

  _scaleLogText: scale.scaleLog()
    .domain([1, 100000])
    .range([0, 50000]),

  isTouching: function (array1, array2) {
    for (var i = 0; i < array1.length; i++) {
      for (var j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j]) {
          return true
        }
      }
    }
    return false
  },

  getExtrema2: function (fullpts) {
    var minX = [fullpts[0][0][0], fullpts[0][0][1]]
    var minY = [fullpts[0][0][0], fullpts[0][0][1]]
    var maxX = [fullpts[0][0][0], fullpts[0][0][1]]
    var maxY = [fullpts[0][0][0], fullpts[0][0][1]]

    for (var j = 0; j < fullpts.length; j++) {
      for (var i = 0; i < fullpts[j].length; i++) {
        if (minX[0] > fullpts[j][i][0]) minX = [fullpts[j][i][0], fullpts[j][i][1]]
        if (maxX[0] < fullpts[j][i][0]) maxX = [fullpts[j][i][0], fullpts[j][i][1]]
        if (minY[1] > fullpts[j][i][1]) minY = [fullpts[j][i][0], fullpts[j][i][1]]
        if (maxY[1] < fullpts[j][i][1]) maxY = [fullpts[j][i][0], fullpts[j][i][1]]
      }
    }

    return ([minX, minY, maxX, maxY])
  },

  get_polygon_centroid: function (fullpts) {
    let xSum = 0
    let ySum = 0
    let len = 0

    fullpts.forEach((polys) => {
      polys.forEach((coord) => {
        xSum += coord[0]
        ySum += coord[1]
        len++
      })
    })

    return [xSum / len, ySum / len]
  },

  getCoordsForMultiPolyLine: function (myCoords) {
    var extremas = this.getExtrema2(myCoords)
    var point = this.get_polygon_centroid(myCoords)

    // max x - min x > max y - min y
    if (extremas[2][0] - extremas[0][0] > extremas[3][1] - extremas[1][1]) {
      /*
            currLabelSize = Math.sqrt((  (extremas[0][1] - point[1]) * (extremas[0][1] - point[1])
              + (extremas[0][0] - point[0]) * (extremas[0][0] - point[0]) ))
              +
              Math.sqrt((extremas[2][1] - point[1]) * (extremas[2][1] - point[1])
                + (extremas[2][0] - point[0]) * (extremas[2][0] - point[0]));
      */
      //    minX to  maxX
      return [
        [extremas[0][0], extremas[0][1]],
        [point[0], point[1]],
        [extremas[2][0], extremas[2][1]]
      ] // angle != 0
    }
    //    minX, minY, maxX, maxY
    else {
      /*
            currLabelSize = Math.sqrt((  (extremas[0][1] - point[1]) * (extremas[0][1] - point[1])
              + (extremas[0][0] - point[0]) * (extremas[0][0] - point[0]) ))
              +
              Math.sqrt((extremas[2][1] - point[1]) * (extremas[2][1] - point[1])
                + (extremas[2][0] - point[0]) * (extremas[2][0] - point[0]));
      */
      if (extremas[1][0] - extremas[3][0] < 1) {
        return [
          [extremas[1][0], extremas[1][1]],
          [point[0], point[1]],
          [extremas[3][0], extremas[3][1]]
        ]
      } else {
        return [
          [extremas[3][0], extremas[3][1]],
          [point[0], point[1]],
          [extremas[1][0], extremas[1][1]]
        ]
      }
    }
  }, // probably won't need

  // helper function locates points on bezier curves.
  curveHelper: function (x1, y1, x2, y2, x3, y3, x4, y4) {
    var tx1, ty1, tx2, ty2, tx3, ty3, tx4, ty4
    var a, b, c, u
    var vec, currentPos, currentDist, vec1, vect, quad
    vec = { x: 0, y: 0 }
    vec1 = { x: 0, y: 0 }
    vect = { x: 0, y: 0 }
    quad = false
    currentPos = 0
    currentDist = 0
    if (x4 === undefined || x4 === null) {
      quad = true
      x4 = x3
      y4 = y3
    }
    var estLen = Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1))
    var onePix = 1 / estLen

    function posAtC (c) {
      tx1 = x1
      ty1 = y1
      tx2 = x2
      ty2 = y2
      tx3 = x3
      ty3 = y3
      tx1 += (tx2 - tx1) * c
      ty1 += (ty2 - ty1) * c
      tx2 += (tx3 - tx2) * c
      ty2 += (ty3 - ty2) * c
      tx3 += (x4 - tx3) * c
      ty3 += (y4 - ty3) * c
      tx1 += (tx2 - tx1) * c
      ty1 += (ty2 - ty1) * c
      tx2 += (tx3 - tx2) * c
      ty2 += (ty3 - ty2) * c
      vec.x = tx1 + (tx2 - tx1) * c
      vec.y = ty1 + (ty2 - ty1) * c
      return vec
    }

    function posAtQ (c) {
      tx1 = x1
      ty1 = y1
      tx2 = x2
      ty2 = y2
      tx1 += (tx2 - tx1) * c
      ty1 += (ty2 - ty1) * c
      tx2 += (x3 - tx2) * c
      ty2 += (y3 - ty2) * c
      vec.x = tx1 + (tx2 - tx1) * c
      vec.y = ty1 + (ty2 - ty1) * c
      return vec
    }

    function forward (dist) {
      var step
      helper.posAt(currentPos)

      while (currentDist < dist) {
        vec1.x = vec.x
        vec1.y = vec.y
        currentPos += onePix
        helper.posAt(currentPos)
        currentDist += step = Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y))
      }
      currentPos -= ((currentDist - dist) / step) * onePix
      currentDist -= step
      helper.posAt(currentPos)
      currentDist += Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y))
      return currentPos
    }

    function tangentQ (pos) {
      a = (1 - pos) * 2
      b = pos * 2
      vect.x = a * (x2 - x1) + b * (x3 - x2)
      vect.y = a * (y2 - y1) + b * (y3 - y2)
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y)
      vect.x /= u
      vect.y /= u
    }

    function tangentC (pos) {
      a = (1 - pos)
      b = 6 * a * pos
      a *= 3 * a
      c = 3 * pos * pos
      vect.x = -x1 * a + x2 * (a - b) + x3 * (b - c) + x4 * c
      vect.y = -y1 * a + y2 * (a - b) + y3 * (b - c) + y4 * c
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y)
      vect.x /= u
      vect.y /= u
    }

    var helper = {
      vec: vec,
      vect: vect,
      forward: forward,
    }
    if (quad) {
      helper.posAt = posAtQ
      helper.tangent = tangentQ
    } else {
      helper.posAt = posAtC
      helper.tangent = tangentC
    }
    return helper
  },

  fillCollectionId: function (myId, addTo, postfix, metadata) {
    // addto = d3 gActiveCouLabels
    var tmpName = ''
    var groups = {}
    var polyGroups = {}
    var polyArray = []
    var myColl = {
      'type': 'FeatureCollection',
      'features': []
    }
    var myLineColl = {
      'type': 'FeatureCollection',
      'features': []
    }

    for (var key in myId) {

      const hasLocaleMetadata = typeof ((metadata || {}).locale || {}).ruler !== "undefined"

      const metadataRuler = hasLocaleMetadata ? metadata.locale['ruler'] : metadata['ruler']
      const metadataReligion = hasLocaleMetadata ? metadata.locale['religion'] : metadata['religion']
      const metadataReligionGeneral = hasLocaleMetadata ? metadata.locale['religionGeneral'] : metadata['religionGeneral']
      const metadataCulture = hasLocaleMetadata ? metadata.locale['culture'] : metadata['culture']

      if (postfix === 'r') {
        if (hasLocaleMetadata) tmpName = metadataRuler[key] || (metadata['ruler'][key] || {})[0] || ''
        else tmpName = (metadata['ruler'][key] || {})[0] || ''
      } else if (postfix === 'e') {
        if (hasLocaleMetadata) tmpName = metadataReligion[key] || (metadata['religion'][key] || {})[0] || ''
        else tmpName = (metadata['religion'][key] || {})[0] || ''
      } else if (postfix === 'g') {
        if (hasLocaleMetadata) tmpName = metadataReligionGeneral[key] || (metadata['religionGeneral'][key] || {})[0] || ''
        else tmpName = (metadata['religionGeneral'][key] || {})[0] || ''
      } else if (postfix === 'c') {
        if (hasLocaleMetadata) tmpName = metadataCulture[key] || (metadata['culture'][key] || {})[0] || ''
        else tmpName = (metadata['culture'][key] || {})[0] || ''
      }

      for (var j1 = 1; j1 < myId[key].length; j1++) {
        loop1:
        for (var j2 = 0; j2 < myId[key].length; j2++) {
          for (var j3 = 0; j3 < myId[key][j1].length; j3++) {
            if (j1 !== j2 && this.isTouching(adjacent[myId[key][j1][j3]], myId[key][j2])) {
              Array.prototype.push.apply(myId[key][j2], myId[key][j1])
              myId[key].splice(j1, 1)
              j1--
              break loop1
            }
          }
        }
      }

      for (var i1 = 0, tot1 = myId[key].length; i1 < tot1; i1++) {
        for (var i2 = 0, tot2 = myId[key][i1].length; i2 < tot2; i2++) {
          if (groups.hasOwnProperty(key)) {
            if (groups[key][i1] === undefined) {
              groups[key][i1] = []
              polyGroups[key][i1] = []
            }
            groups[key][i1].push(metadata.provinces.features[myId[key][i1][i2]].geometry.coordinates[0])
            polyGroups[key][i1].push(metadata.provinces.features[myId[key][i1][i2]])
          } else {
            groups[key] = [
              [metadata.provinces.features[myId[key][i1][i2]].geometry.coordinates[0]]
            ]
            polyGroups[key] = [
              [metadata.provinces.features[myId[key][i1][i2]]]
            ]
          }
        }
      }

      for (var i = 0; i < groups[key].length; i++) { // tmpLength
        var lineCoordinates = this.getCoordsForMultiPolyLine(groups[key][i])

        var point = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': lineCoordinates[1]
          },
          'properties': {}
        }

        const bareLine = turf.lineString(lineCoordinates, { sharpness: 1, resolution: 3 })
        try {
          var multiLine = turf.bezier(bareLine) // EXTREMACENTROIDLINE    200MS
        } catch (err) {

        }

        multiLine.properties.n = tmpName
        multiLine.properties.d = ((turf.lineDistance(bareLine)) / Math.pow(tmpName.length, 0.2))
        myLineColl.features.push(multiLine)
        myColl.features.push(point)
      }
    }

    return [myColl, polyArray, myLineColl]
  },

  addTextFeat: function (areaDefs, setActiveFeat, metadata) {
    this.activeTextFeat = setActiveFeat

    if ((this.activeTextFeat === 'ruler' && !this.rulIsSetup) ||
      (this.activeTextFeat === 'culture' && !this.culIsSetup) ||
      (this.activeTextFeat === 'religion' && !this.relIsSetup) ||
      (this.activeTextFeat === 'religionGeneral' && !this.relGenIsSetup)) {
      var rulCollection = {}
      var relCollection = {}
      var relGenCollection = {}
      var culCollection = {}
      var popCollection = {}

      var tmpProv, tmpRul, tmpRel, tmpRelGen, tmpCul, tmpPop, tmpCap, tmpCoo

      for (var i = 0; i < metadata.provinces.features.length; i++) { // tmpLength
        tmpCoo = undefined
        tmpRul = undefined
        tmpRel = undefined
        tmpRelGen = undefined
        tmpCul = undefined
        tmpPop = undefined
        tmpCap = undefined

        tmpProv = metadata.provinces.features[i].properties.name
        tmpCoo = metadata.provinces.features[i].geometry.coordinates[0]

        if (areaDefs.hasOwnProperty(tmpProv)) {
          // TODO: remove again + add security check when updating
          if (areaDefs[tmpProv] === null) {
            areaDefs[tmpProv] = ['SWE', null, null, null, null]
          }
          tmpRul = areaDefs[tmpProv][0]
          tmpCul = areaDefs[tmpProv][1]
          tmpRel = areaDefs[tmpProv][2]
          tmpRelGen = (metadata['religion'][tmpRel] || [])[3]
          tmpCap = areaDefs[tmpProv][3]
          tmpPop = areaDefs[tmpProv][4]

          // metadata.provinces.features[i].properties.c = tmpCul
          // metadata.provinces.features[i].properties.e = tmpRel
          // metadata.provinces.features[i].properties.g = tmpPop
          // metadata.provinces.features[i].properties.a = tmpCap

          // if (this.activeTextFeat === 'ruler' && metadata['ruler'][tmpRul]) {
          //   metadata.provinces.features[i].properties.nameLabel = metadata['ruler'][tmpRul][0]
          // } else if (this.activeTextFeat === 'religion' && metadata['religion'][tmpRel]) {
          //   metadata.provinces.features[i].properties.nameLabel = (metadata['religion'][tmpRel] || {})[0]
          // } else if (this.activeTextFeat === 'religionGeneral' && metadata['religionGeneral'][tmpRelGen]) {
          //   metadata.provinces.features[i].properties.nameLabel = (metadata['religionGeneral'][tmpRelGen] || {})[0]
          // } else if (this.activeTextFeat === 'culture' && metadata['culture'][tmpCul]) {
          //   metadata.provinces.features[i].properties.nameLabel = metadata['culture'][tmpCul][0]
          // }
        }

        if (this.activeTextFeat === 'ruler' && !this.rulIsSetup) {
          this.prepareCollectionIDs(rulCollection, tmpRul, i)
        }
        if (this.activeTextFeat === 'religion' && !this.relIsSetup) {
          this.prepareCollectionIDs(relCollection, tmpRel, i)
        }
        if (this.activeTextFeat === 'religionGeneral' && !this.relGenIsSetup) {
          this.prepareCollectionIDs(relGenCollection, tmpRelGen, i)
        }
        if (this.activeTextFeat === 'culture' && !this.culIsSetup) {
          this.prepareCollectionIDs(culCollection, tmpCul, i)
        }
      }

      if (!this.rulIsSetup && (this.activeTextFeat === 'ruler')) {
        // this.rulIsSetup = true;
        return this.fillCollectionId(rulCollection, null, 'r', metadata)
      } else if (!this.culIsSetup && (this.activeTextFeat === 'culture')) {
        // this.culIsSetup = true;
        return this.fillCollectionId(culCollection, null, 'c', metadata)
      } else if (!this.relIsSetup && (this.activeTextFeat === 'religion')) {
        // this.relIsSetup = true;
        return this.fillCollectionId(relCollection, null, 'e', metadata)
      } else if (!this.relGenIsSetup && (this.activeTextFeat === 'religionGeneral')) {
        // this.relGenIsSetup = true;
        return this.fillCollectionId(relGenCollection, null, 'g', metadata)
      } else {
        return []
      }
    }

    // activeLoaded = false;

    return [{
      'type': 'FeatureCollection',
      'features': []
    }, [], {
      'type': 'FeatureCollection',
      'features': []
    }]
  },

  prepareCollectionIDs: function (targetC, attr, provId) {
    if (attr && attr !== 'na') {
      if (targetC.hasOwnProperty(attr)) {
        if (targetC[attr][0].length === 0 || this.isTouching(targetC[attr][0], adjacent[provId])) {
          targetC[attr][0].push(provId)
        } else {
          let it = 1
          while ((targetC[attr][it] !== undefined) && (!this.isTouching(targetC[attr][it], adjacent[provId]))) {
            it++
          }
          if (targetC[attr][it] === undefined) targetC[attr][it] = []
          targetC[attr][it].push(provId)
        }
      } else {
        targetC[attr] = [
          [provId]
        ]
      }
    }
  },

  updatePercentiles: function (featureCollection, accessor) {
    const { features } = featureCollection
    features.forEach(f => {
      f.properties.value = accessor(f)
    })
  }

}

export default utils

