import React from 'react'

const styles = {
  icon: { color: 'rgba(200, 178, 115, 230)', marginLeft: -16, marginRight: 12 }
}
// <InfoIcon style={styles.icon} />
export const didYouKnows = [
  'timeline',
  'discover',
  'coloring',
  'markerlimit',
  'province',
  'question',
  'distribution',
  'link',
  'escape',
]

function getDefaultCharacterSet(ranges) {
  const charSet = [];
  ranges.forEach(range => {
    for (let i = range[0]; i < range[1]; i++) {
      charSet.push(String.fromCharCode(i));
    }
  })
  return charSet;
}

const arrayToObject = (array, ind = 1) =>
  array.reduce((obj, item) => {
    obj[item[0]] = item[ind]
    return obj
  }, {})

export const markerIdNameArray = [
  ['ar', 'Artifact', 'Artifacts', 'Artifacts', '#6d4b25'],
  ['b', 'Battle', 'Battles', 'Battles', '#eb5047'],
  ['si', 'Siege', 'Sieges', 'Battles', '#eb5047'],
  ['cp', 'Capital', 'Capital', 'Capital', '#035e95'],
  ['c', 'City', 'Cities', 'Cities', '#035e95'],
  ['ca', 'Castle', 'Castles', 'Cities', '#035e95'],
  ['l', 'Landmark', 'Landmark', 'Other', '#035e95'],
  ['m', 'Military', 'Military', 'People', '#55a650'],
  ['p', 'Politician', 'Politicians', 'People', '#55a650'],
  ['e', 'Explorer', 'Explorers', 'People', '#55a650'],
  ['s', 'Scientist', 'Scientists', 'People', '#55a650'],
  ['a', 'Artist', 'Artists', 'People', '#55a650'],
  ['r', 'Religious', 'Religious', 'People', '#55a650'],
  ['at', 'Athlete', 'Athletes', 'People', '#55a650'],
  ['op', 'Unclassified', 'Unclassified', 'People', '#55a650'],
  ['o', 'Unknown', 'Unknown', 'Other', '#5b5b5b']
]

export const charSets = {
  // "western":  getDefaultCharacterSet([[32, 128]]),
  // "el": getDefaultCharacterSet([[32, 128], []]),
}

export const epicIdNameArray = [
  ['ei', 'Discovery', 'rgba(255, 216, 0, 0.5)', false, 'rgb(255, 165, 0)'],
  // ['ee', 'Exploration', 'rgba(0, 0, 255, 0.5)', false, 'rgb(0, 0, 255)'],
  ['es', 'Primary Source', 'rgba(175, 124, 90, 0.5)', false, 'rgb(175, 124, 90)'],
  ['ew', 'War', 'rgba(158, 50, 36, 0.5)', false, 'rgb(158, 50, 36)'],
  // ['eo', 'Other Epic', 'rgba(255, 255, 255, 0.5)', false, 'rgb(255, 255, 255)']
]

export const aeIdNameArray = [
  ['ae|ruler', 'Ruler', 'rgba(0, 128, 0, 0.5)', false, 'rgb(0, 128, 0)'],
  ['ae|culture', 'Culture', 'rgba(255, 165, 0, 0.5)', false, 'rgb(255, 165, 0)'],
  ['ae|religion', 'Religion', 'rgba(0, 0, 255, 0.5)', false, 'rgb(0, 0, 255)'],
  ['ae|religionGeneral', 'Religion General', 'rgba(214, 0, 0, 0.5)', false, 'rgb(214, 0, 0)'],
]

// export const itemTypeToName = arrayToObject(markerIdNameArray.concat(epicIdNameArray).concat(aeIdNameArray).concat([['ps', 'Primary Source', 'rgba(175, 124, 90, 0.5)', false, 'rgb(175, 124, 90)']]))
export const itemTypeToColor = arrayToObject(markerIdNameArray.concat(epicIdNameArray).concat(aeIdNameArray).concat([['ps', 'Primary Source', 'rgba(175, 124, 90, 0.5)', false, 'rgb(175, 124, 90)']]), 4)

const iconWidthModern = 128
const iconHeightModern = 169
const iconWidth = 135
const iconHeight = 127
const iconHeightCluster = 117
const iconWidthCluster = 125

export const iconSize = {
  'cp': 7,
  'ca': 4,
  'b': 5,
  'si': 5,
  'c0': 7,
}

export const iconMapping = {
  them: {
    '1': {
      'x': 0,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'r': {
      'x': iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'p': {
      'x': 2 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'e': {
      'x': 3 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'a': {
      'x': 0,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '6': {
      'x': iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    's': {
      'x': 2 * iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'op': {
      'x': 3 * iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '9': {
      'x': 0,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'at': {
      'x': iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'm': {
      'x': 2 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '12': {
      'x': 3 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'ar': {
      'x': 0,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'b': {
      'x': iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'si': {
      'x': 2 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'c': {
      'x': 0,
      'y': 5 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight,
    },
    'eb1': {
      'x': iconWidth,
      'y': 5 * iconHeight,
      'width': iconWidth / 2,
      'height': iconHeight,
      'anchorY': iconHeight,
    },
    'eb2': {
      'x': iconWidth,
      'y': 5 * iconHeight,
      'width': iconWidth / 2,
      'height': iconHeight,
      'anchorX': iconWidth / 2,
      'anchorY': iconHeight,
    },
    'cp': {
      'x': 3 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight,
      'mask': true
    },
    'c0': {
      'x': iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight,
    },
    'ca': {
      'x': 0,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '18': {
      'x': iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'l': {
      'x': 2 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'h': {
      'x': 2 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'o': {
      'x': 3 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    }
  },
  abst: {
    '1': {
      'x': 0,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'r': {
      'x': iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'p': {
      'x': 2 * iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'e': {
      'x': 3 * iconWidthModern,
      'y': 0,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'a': {
      'x': 0,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    '6': {
      'x': iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    's': {
      'x': 2 * iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'op': {
      'x': 3 * iconWidthModern,
      'y': iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    '9': {
      'x': 0,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'at': {
      'x': iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'm': {
      'x': 2 * iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    '12': {
      'x': 3 * iconWidthModern,
      'y': 2 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'ar': {
      'x': 0,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'b': {
      'x': iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'si': {
      'x': 2 * iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    '16': {
      'x': 3 * iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'c': {
      'x': 0,
      'y': 5 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern,
    },
    'eb1': {
      'x': iconWidthModern,
      'y': 5 * iconHeightModern,
      'width': iconWidthModern / 2,
      'height': iconHeightModern,
      'anchorY': iconHeightModern,
    },
    'eb2': {
      'x': 1.5 * iconWidthModern,
      'y': 5 * iconHeightModern,
      'width': iconWidthModern / 2,
      'height': iconHeightModern,
      'anchorY': iconHeightModern,
    },
    'cp': {
      'x': 3 * iconWidthModern,
      'y': 3 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern,
      'mask': true
    },
    'c0': {
      'x': iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern,
    },
    'ca': {
      'x': 0,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    '18': {
      'x': iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'l': {
      'x': 2 * iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'h': {
      'x': 2 * iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    },
    'o': {
      'x': 3 * iconWidthModern,
      'y': 4 * iconHeightModern,
      'width': iconWidthModern,
      'height': iconHeightModern,
      'anchorY': iconHeightModern
    }
  },
  cluster: {
    '1': {
      'x': 0,
      'y': 0,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '2': {
      'x': iconWidthCluster,
      'y': 0,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '3': {
      'x': 2 * iconWidthCluster,
      'y': 0,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '4': {
      'x': 3 * iconWidthCluster,
      'y': 0,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '5': {
      'x': 0,
      'y': iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '6': {
      'x': iconWidthCluster,
      'y': iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '7': {
      'x': 2 * iconWidthCluster,
      'y': iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '8': {
      'x': 3 * iconWidthCluster,
      'y': iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '9': {
      'x': 0,
      'y': 2 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '10': {
      'x': iconWidthCluster,
      'y': 2 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '20': {
      'x': 2 * iconWidthCluster,
      'y': 2 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '30': {
      'x': 3 * iconWidthCluster,
      'y': 2 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '40': {
      'x': 0,
      'y': 3 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '50': {
      'x': iconWidthCluster,
      'y': 3 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '60': {
      'x': 2 * iconWidthCluster,
      'y': 3 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '70': {
      'x': 3 * iconWidthCluster,
      'y': 3 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '80': {
      'x': 0,
      'y': 4 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '90': {
      'x': iconWidthCluster,
      'y': 4 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    '100': {
      'x': 2 * iconWidthCluster,
      'y': 4 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    },
    'marker': {
      'x': 3 * iconWidthCluster,
      'y': 4 * iconHeightCluster,
      'width': iconWidthCluster,
      'height': iconHeightCluster,
      'anchorY': iconHeightCluster
    }
  }
}

// export const markerIdNameObject = arrayToObject(markerIdNameArray)

// export const epicIdNameObject = arrayToObject(epicIdNameArray)

export const properties = {
  // defines the zoom level to toggle provinces
  areaColorLayers: ['ruler', 'religion', 'religionGeneral', 'culture', 'population'],
  areaLabelLayers: ['ruler', 'religion', 'religionGeneral', 'culture'],
  provinceThreshold: 4,
  chronasApiHost: 'https://api.chronas.org/v1', //    -  http://localhost:4040/v1              https://api.chronas.org/v1
  markersTypes: ['w', 'w|b', 'w|si', 'w|c', 'w|h', 'w|ca', 'w|m', 'w|p', 'w|e', 'w|s', 'w|a', 'w|r', 'w|at', 'w|op', 'w|l', 'w|o'],
  // metadataTypes: ['ae|ruler', /*'ae|ca',*/ 'ae|culture', 'ae|religion', 'ae|religionGeneral', 'a', 'e', 't', 'h', 'i|a', 'i|b', 'i|c', 'i|p', 'i|m', 'i|siege', 'i|war', 'ps', 'v'],

  linkedTypes: [
    { name: '[Collection]', id: 'cc', color: '#99a600' },
    { name: '[EduCollection]', id: 'ce', color: '#99a600' },
    { name: '[Epic] Biography', id: 'eb', color: '#a63932' },
    { name: '[Epic] Explorations', id: 'ee', color: '#a63932' },
    { name: '[Epic] Wars', id: 'ew', color: '#a63932' },
    { name: '[Epic] Discoveries', id: 'ei', color: 'rgb(175, 124, 90)' },
    { name: '[Epic] Other', id: 'eo', color: '#a63932' },
    { name: '[HTML or Text]', id: 'w|h', color: '#005386' },
    { name: '[Link] Primary Source', id: 'ps', color: '#005386' },
    { name: '[Image] Artefact', id: 'artefacts', color: '#ae7000' },
    { name: '[Image] Battle', id: 'battles', color: '#ae7000' },
    { name: '[Image] City & Building', id: 'cities', color: '#ae7000' },
    { name: '[Image] Person', id: 'people', color: '#ae7000' },
    { name: '[Image] Other', id: 'misc', color: '#ae7000' },
    { name: '[Podcast & Audio]', id: 'audios', color: '#2d4c00' },
    { name: '[Video]', id: 'v', color: '#2d4c00' },
    { name: '[Wiki Article] Artifacts', id: 'w|ar' },
    { name: '[Wiki Article] Battles -> Battles', id: 'w|b' },
    { name: '[Wiki Article] Battles -> Sieges', id: 'w|si' },
    { name: '[Wiki Article] Cities -> Cities', id: 'w|c' },
    { name: '[Wiki Article] Cities -> Castles', id: 'w|ca' },
    { name: '[Wiki Article] People -> Military', id: 'w|m' },
    { name: '[Wiki Article] People -> Politicians', id: 'w|p' },
    { name: '[Wiki Article] People -> Explorers', id: 'w|e' },
    { name: '[Wiki Article] People -> Scientists', id: 'w|s' },
    { name: '[Wiki Article] People -> Artists', id: 'w|a' },
    { name: '[Wiki Article] People -> Religious', id: 'w|r' },
    { name: '[Wiki Article] People -> Athletes', id: 'w|at' },
    { name: '[Wiki Article] People -> Unclassified', id: 'w|op' },
    { name: '[Wiki Article] Other -> Landmark', id: 'w|l' },
    { name: '[Wiki Article] Other -> Unknown', id: 'w|o' },
    { name: 'Other', id: 'o', color: '#555555' },
  ],
  QAID: 'questions',
  typeToDescriptedType: {
    'ae|ruler': '[Area Entity] Ruler',
    'ae|r': '[Area Entity] Ruler',
    // 'ae|ca': '[Area Entity] Capital',
    'ae|c': '[Area Entity] Culture',
    'ae|culture': '[Area Entity] Culture',
    'ae|re': '[Area Entity] Religion',
    'ae|religion': '[Area Entity] Religion',
    'ae|reg': '[Area Entity] General Religion',
    'ae|religionGeneral': '[Area Entity] General Religion',
    'a': '[Podcast & Audio]',
    'audios': '[Podcast & Audio]',
    'e': '[Epic]',
    'e|ei': '[Discovery]',
    'e|ew': '[War Epic]',
    't': '[External Article or Primary Source]',
    'i|a': '[Image] Artefact',
    'i|artefacts': '[Image] Artefact',
    'i|b': '[Image] Battle',
    'i|battles': '[Image] Battle',
    'i|battle': '[Image] Battle',
    'i|c': '[Image] City & Building',
    'i|cities': '[Image] City & Building',
    'i|p': '[Image] Person',
    'i|people': '[Image] Person',
    'i|m': '[Image] Other',
    'i|misc': '[Image] Other',
    'i|v': '[Video]',
    'i|ps': '[Primary Source]',
    'ps': '[Primary Source]',
    'v': '[Video]',
    'w|ar': '[Wiki Article] Artifacts',
    'w|b': '[Wiki Article] Battles -> Battles',
    'w|si': '[Wiki Article] Battles -> Sieges',
    'w|c': '[Wiki Article] Cities -> Cities',
    'w|ca': '[Wiki Article] Cities -> Castles',
    'w|m': '[Wiki Article] People -> Military',
    'w|p': '[Wiki Article] People -> Politicians',
    'w|e': '[Wiki Article] People -> Explorers',
    'w|s': '[Wiki Article] People -> Scientists',
    'w|a': '[Wiki Article] People -> Artists',
    'w|r': '[Wiki Article] People -> Religious',
    'w|at': '[Wiki Article] People -> Athletes',
    'w|op': '[Wiki Article] People -> Unclassified',
    'w|l': '[Wiki Article] Other -> Landmark',
    'w|o': '[Wiki Article] Other -> Unknown',
    'w|h': '[HTML or Text]',
    'o': 'Other'
  },
  languageOptions: [
    { id: 'ar', name: ' (no UI translation yet)العربية' },
    { id: 'ca', name: 'Català (no UI translation yet)' },
    { id: 'de', name: 'Deutsch' },
    { id: 'el', name: 'Ελληνικά (no UI translation yet)' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
    { id: 'nl', name: 'Nederlands (no UI translation yet)' },
    { id: 'hi', name: 'हिन्दी (no UI translation yet)' },
    { id: 'it', name: 'Italiano (no UI translation yet)' },
    { id: 'tr', name: 'Türkçe (no UI translation yet)' },
    { id: 'ja', name: '日本語 (no UI translation yet)' },
    { id: 'pl', name: 'Polski (no UI translation yet)' },
    { id: 'pt', name: 'Português (no UI translation yet)' },
    { id: 'ru', name: 'Русский' },
    { id: 'sv', name: 'Svenska (no UI translation yet)' },
    { id: 'vi', name: 'Tiếng Việt (no UI translation yet)' },
    { id: 'zh', name: '中文 (no UI translation yet)' },
  ],
  fontOptions: [
    { name: 'Cinzel', id: 'cinzelFont' },
    { name: 'Tahoma', id: 'tahomaFont' },
    { name: 'Times New Roman', id: 'timesnewromanFont' }
  ],
  markerOptions: [
    { name: 'Abstract', id: 'abstract' },
    // { name: 'Abstract (Painted)', id: 'abstract-painted' },
    { name: 'Themed', id: 'themed' },
    // { name: 'Themed (Painted)', id: 'themed-painted' }
  ],
  markerSize: 100,
  YOUTUBEOPTS: {
    height: '100%',
    width: '100%',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 0
    }
  }
}

export const themes = {
  light: {
    foreColors: ['#6a6a6a',
      '#494949',
      '#383B32'],
    backColors: ['#ffffff',
      '#F2F2F2',
      '#cbcbcb'],
    borderColors: ['rgba(200,200,200,100)'],
    highlightColors: ['rgb(173, 135, 27)'],
    gradientColors: ['linear-gradient(180deg,#fff 0,#F2F2F2)'],
    className: 'lightTheme'
  },
  dark: {
    foreColors: ['#F2F2F2',
      '#e2e2e2',
      '#cbcbcb'],
    backColors: ['#333',
      '#171717',
      '#000'],
    borderColors: ['rgba(200,200,200,100)'],
    highlightColors: ['rgba(173, 135, 27)'],
    gradientColors: ['linear-gradient(180deg,#333 0,#000)'],
    className: 'darkTheme'
  },
  luther: {
    foreColors: ['#fff3d3',
      '#e9caab',
      '#e9caab'],
    backColors: ['#011c31',
      '#451c2e',
      '#451c2e'],
    borderColors: ['rgba(200,200,200,100)'],
    highlightColors: ['rgba(69,28,46,200)'],
    gradientColors: ['linear-gradient(180deg,#011c31 0,#451c2e)'],
    className: 'lutherTheme'
  },
  // golden: {
  //   foreColors: ['#a69867',
  //     '#000',
  //     '#e9caab'],
  //   backColors: ['#3a2931',
  //     '#F2F2F2',
  //     '#451c2e'],
  //   borderColors: ['rgba(200,200,200,100)'],
  //   highlightColors: ['rgba(166,152,103,255)'],
  //   gradientColors: ['linear-gradient(180deg,#3a2931 0,#3e2931)', 'linear-gradient(180deg,#a3886e 0,#967757)'],
  //   className: 'goldenTheme'
  // }
}

export const languageToFont = {
  ar: "Cairo",
  fr: "Cinzel Regular",
  en: "Cinzel Regular",
  tr: "Cinzel Regular",
  zh: "Noto Sans SC",
  nl: "Cinzel Regular",
  de: "Cinzel Regular",
  el: "Noto Sans",
  hi: "Noto Sans",
  it: "Cinzel Regular",
  ja: "Noto Sans SC",
  pl: "Cinzel Regular",
  pt: "Cinzel Regular",
  ru: "Noto Sans",
  es: "Cinzel Regular",
  ca: "Cinzel Regular",
  sv: "Cinzel Regular",
  vi: "Noto Sans SC",
}

export const getPercent = (min, max, val) => {
  var range = max - min
  return (val - min) / range
}

export const RGBAtoArray = (str) => {
  const match = (str || "empty").match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d{1,3})\))?/)
  return match ? [+match[1], +match[2], +match[3], +(match[4] || 255)] : [0, 0, 0, 0]
}

export const getFullIconURL = (iconPath) => {
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + iconPath + '/40px-' + iconPath.substr(iconPath.lastIndexOf('/') + 1) + ((iconPath.toLowerCase().indexOf('svg') > -1) ? '.PNG' : '')
}

export const getYoutubeId = (url) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = (url || "empty").match(regExp)
  if (match && match[2].length === 11) {
    return match[2]
  } else {
    return false
  }
}
