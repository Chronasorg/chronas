export const properties = {
  // defines the zoom level to toggle provinces
  areaColorLayers: ['ruler', 'religion', 'religionGeneral', 'culture', 'population'],
  areaLabelLayers: ['ruler', 'religion', 'religionGeneral', 'culture'],
  provinceThreshold: 4,
  chronasApiHost: 'http://localhost:4040/v1',
  markersTypes: ['w', 'w|battles', 'w|sieges', 'w|cities', 'w|castles', 'w|military', 'w|politicians', 'w|politician', 'w|explorers', 'w|scientists', 'w|artists', 'w|religious', 'w|athletes', 'w|unclassified', 'w|areainfo', 'w|unknown'],
  metadataTypes: ['ae|ruler', 'ae|capital', 'ae|culture', 'ae|religion', 'ae|religionGeneral', 'a', 'e', 't', 'h', 'i|artefacts', 'i|battles', 'i|cities', 'i|people', 'i|misc', 'i|siege', 'i|war', 'ps', 'v'],
  linkedTypes: [
    { name: '[Audio]', id: 'a' },
    { name: '[Epic]', id: 'e' },
    { name: '[HTML or Text]', id: 'h' },
    { name: '[HTML or Text] Primary Source', id: 'ps' },
    { name: '[Image] Artefact', id: 'i|artefacts' },
    { name: '[Image] Battle', id: 'i|battles' },
    { name: '[Image] City & Building', id: 'i|cities' },
    { name: '[Image] Person', id: 'i|people' },
    { name: '[Image] Other', id: 'i|misc' },
    { name: '[Podcast & Audio]', id: 'a' },
    { name: '[Video]', id: 'v' },
    { name: '[Wiki Article] Artifacts', id: 'w|artifacts' },
    { name: '[Wiki Article] Battles -> Battles', id: 'w|battles' },
    { name: '[Wiki Article] Battles -> Sieges', id: 'w|sieges' },
    { name: '[Wiki Article] Cities -> Cities', id: 'w|cities' },
    { name: '[Wiki Article] Cities -> Castles', id: 'w|castles' },
    { name: '[Wiki Article] People -> Military', id: 'w|military' },
    { name: '*deprecared [Wiki Article] People -> Politician', id: 'w|politician' },
    { name: '[Wiki Article] People -> Politicians', id: 'w|politicians' },
    { name: '[Wiki Article] People -> Explorers', id: 'w|explorers' },
    { name: '[Wiki Article] People -> Scientists', id: 'w|scientists' },
    { name: '[Wiki Article] People -> Artists', id: 'w|artists' },
    { name: '[Wiki Article] People -> Religious', id: 'w|religious' },
    { name: '[Wiki Article] People -> Athletes', id: 'w|athletes' },
    { name: '[Wiki Article] People -> Unclassified', id: 'w|unclassified' },
    { name: '[Wiki Article] Other -> Area Info', id: 'w|areainfo' },
    { name: '[Wiki Article] Other -> Unknown', id: 'w|unknown' },
    { name: 'Other', id: 'meta_other' }
  ],
  QAID: 'questions',
  typeToDescriptedType: {
    'ae|ruler': '[Area Entity] Ruler',
    'ae|capital': '[Area Entity] Capital',
    'ae|culture': '[Area Entity] Culture',
    'ae|religion': '[Area Entity] Religion',
    'ae|religionGeneral': '[Area Entity] General Religion',
    'a': '[Podcast & Audio]',
    'e': '[Epic]',
    't': '[External Article or Primary Source]',
    'h': '[HTML or Text]',
    'i|artefacts': '[Image] Artefact',
    'i|battles': '[Image] Battle',
    'i|cities': '[Image] City & Building',
    'i|people': '[Image] Person',
    'i|misc': '[Image] Other',
    'ps': '[Primary Source]',
    'v': '[Video]',
    'w|artefacts': '[Wiki Article] Artifacts',
    'w|battles': '[Wiki Article] Battles -> Battles',
    'w|sieges': '[Wiki Article] Battles -> Sieges',
    'w|cities': '[Wiki Article] Cities -> Cities',
    'w|castles': '[Wiki Article] Cities -> Castles',
    'w|military': '[Wiki Article] People -> Military',
    'w|politicians': '[Wiki Article] People -> Politicians',
    'w|politician': '*deprecared [Wiki Article] People -> Politicians',
    'w|explorers': '[Wiki Article] People -> Explorers',
    'w|scientists': '[Wiki Article] People -> Scientists',
    'w|artists': '[Wiki Article] People -> Artists',
    'w|religious': '[Wiki Article] People -> Religious',
    'w|athletes': '[Wiki Article] People -> Athletes',
    'w|otherpeople': '[Wiki Article] People -> Unclassified',
    'w|areainfo': '[Wiki Article] Other -> Area Info',
    'w|other': '[Wiki Article] Other -> Unknown',
    'o': 'Other'
  },
  fontOptions: [
    { name: 'Cinzel', id: 'cinzelFont' },
    { name: 'Tahoma', id: 'tahomaFont' },
    { name: 'Times New Roman', id: 'timesnewromanFont' }
  ],
  markerSize: 500,
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
