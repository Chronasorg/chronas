export const markerIdNameArray = [
  ['ar', 'Artifacts', 'Artifacts', 'Artifacts'],
  ['b', 'Battles -> Battles', 'Battles', 'Battles'],
  ['si', 'Battles -> Sieges', 'Sieges', 'Battles'],
  ['c', 'Cities -> Cities', 'Cities', 'Cities'],
  ['ca', 'Cities -> Castles', 'Castles', 'Cities'],
  ['m', 'People -> Military', 'Military', 'People'],
  ['p', 'People -> Politicians', 'Politicians', 'People'],
  ['e', 'People -> Explorers', 'Explorers', 'People'],
  ['s', 'People -> Scientists', 'Scientists', 'People'],
  ['a', 'People -> Artists', 'Artists', 'People'],
  ['r', 'People -> Religious', 'Religious', 'People'],
  ['at', 'People -> Athletes', 'Athletes', 'People'],
  ['op', 'People -> Unclassified', 'Unclassified', 'People'],
  ['ai', 'Other -> Area Info', 'Area Info', 'Other'],
  ['o', 'Other -> Unknown', 'Artifacts', 'Other']
]

export const epicIdNameArray = [
    ['bio', 'Biography', 'rgba(0, 128, 0, 0.5)'],
    ['c', 'Conflicts', 'rgba(255, 165, 0, 0.5)'],
    ['e', 'Exploration', 'rgba(0, 0, 255, 0.5)'],
    ['w', 'War', 'rgba(214, 0, 0, 0.5)'],
    ['o', 'Other Epic', 'rgba(255, 255, 255, 0.5)']
]

const iconWidthModern = 128
const iconHeightModern = 169
const iconWidth = 135
const iconHeight = 127

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
    'capital': {
      'x': 3 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
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
    'ai': {
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
    'ai': {
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
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '2': {
      'x': iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '3': {
      'x': 2 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '4': {
      'x': 3 * iconWidth,
      'y': 0,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '5': {
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
    '7': {
      'x': 2 * iconWidth,
      'y': iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '8': {
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
    '10': {
      'x': iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '20': {
      'x': 2 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '30': {
      'x': 3 * iconWidth,
      'y': 2 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '40': {
      'x': 0,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '50': {
      'x': iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '60': {
      'x': 2 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '70': {
      'x': 3 * iconWidth,
      'y': 3 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '80': {
      'x': 0,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '90': {
      'x': iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    '100': {
      'x': 2 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    },
    'marker': {
      'x': 3 * iconWidth,
      'y': 4 * iconHeight,
      'width': iconWidth,
      'height': iconHeight,
      'anchorY': iconHeight
    }
  }
}

const arrayToObject = (array) =>
  array.reduce((obj, item) => {
    obj[item[0]] = item[1]
    return obj
  }, {})

export const markerIdNameObject = arrayToObject(markerIdNameArray)

export const epicIdNameObject = arrayToObject(epicIdNameArray)

export const properties = {
  // defines the zoom level to toggle provinces
  areaColorLayers: ['ruler', 'religion', 'religionGeneral', 'culture', 'population'],
  areaLabelLayers: ['ruler', 'religion', 'religionGeneral', 'culture'],
  provinceThreshold: 4,
  chronasApiHost: 'http://localhost:4040/v1',
  markersTypes: ['w', 'w|b', 'w|si', 'w|c', 'w|ca', 'w|m', 'w|p', 'w|e', 'w|s', 'w|a', 'w|r', 'w|at', 'w|op', 'w|ai', 'w|o'],
  metadataTypes: ['ae|r', /*'ae|ca',*/ 'ae|c', 'ae|re', 'ae|reg', 'a', 'e', 't', 'h', 'i|a', 'i|b', 'i|c', 'i|p', 'i|m', 'i|siege', 'i|war', 'ps', 'v'],
  linkedTypes: [
    { name: '[Audio]', id: 'a' },
    { name: '[Epic]', id: 'e' },
    { name: '[HTML or Text]', id: 'h' },
    { name: '[HTML or Text] Primary Source', id: 'ps' },
    { name: '[Image] Artefact', id: 'i|a' },
    { name: '[Image] Battle', id: 'i|b' },
    { name: '[Image] City & Building', id: 'i|c' },
    { name: '[Image] Person', id: 'i|p' },
    { name: '[Image] Other', id: 'i|m' },
    { name: '[Podcast & Audio]', id: 'a' },
    { name: '[Video]', id: 'v' },
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
    { name: '[Wiki Article] Other -> Area Info', id: 'w|ai' },
    { name: '[Wiki Article] Other -> Unknown', id: 'w|o' },
    { name: 'Other', id: 'o' }
  ],
  QAID: 'questions',
  typeToDescriptedType: {
    'ae|r': '[Area Entity] Ruler',
    // 'ae|ca': '[Area Entity] Capital',
    'ae|c': '[Area Entity] Culture',
    'ae|re': '[Area Entity] Religion',
    'ae|reg': '[Area Entity] General Religion',
    'a': '[Podcast & Audio]',
    'e': '[Epic]',
    't': '[External Article or Primary Source]',
    'h': '[HTML or Text]',
    'i|a': '[Image] Artefact',
    'i|b': '[Image] Battle',
    'i|c': '[Image] City & Building',
    'i|p': '[Image] Person',
    'i|m': '[Image] Other',
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
    'w|ai': '[Wiki Article] Other -> Area Info',
    'w|o': '[Wiki Article] Other -> Unknown',
    'o': 'Other'
  },
  fontOptions: [
    { name: 'Cinzel', id: 'cinzelFont' },
    { name: 'Tahoma', id: 'tahomaFont' },
    { name: 'Times New Roman', id: 'timesnewromanFont' }
  ],
  markerOptions: [
    { name: 'Abstract', id: 'abstract' },
    { name: 'Abstract (Painted)', id: 'abstract-painted' },
    { name: 'Themed', id: 'themed' },
    { name: 'Themed (Painted)', id: 'themed-painted' }
  ],
  markerSize: 200,
  YOUTUBEOPTS: {
    height: '100%',
    width: '100%',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 0
    }
  }
}

export const themes = {
  default: {
    foreColors: ['#110617',
      '#383B32',
      '#383B32'],
    backColors: ['#ababab',
      '#cfcfcf',
      '#cfcfcf'],
    borderColors: ['rgba(200,200,200,100)'],
    highlightColors: ['rgba(255,204,0,200)'],
    gradientColors: ['linear-gradient(180deg,#fff 0,#F2F2F2)'],
    className: 'defaultTheme'
  },
  light: {
    foreColors: ['#6a6a6a',
      '#494949',
      '#383B32'],
    backColors: ['#ffffff',
      '#F2F2F2',
      '#cbcbcb'],
    borderColors: ['rgba(200,200,200,100)'],
    highlightColors: ['rgba(255,204,0,200)'],
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
    highlightColors: ['rgba(255,204,0,200)'],
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
  }
}

export const RGBAtoArray = (str) => {
  const match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d{1,3})\))?/)
  return match ? [+match[1], +match[2], +match[3], +(match[4] || 255)] : [0, 0, 0, 0]
}

export const getYoutubeId = (url) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    false
  }
}
