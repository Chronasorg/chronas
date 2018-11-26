import React from 'react'
import mainLogo from '../../../public/images/logoChronasWhite.png'
import utilsQuery from '../map/utils/query'

const backgroundByYear = [
  { year: -668,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Sculpted_reliefs_depicting_Ashurbanipal%2C_the_last_great_Assyrian_king%2C_hunting_lions%2C_gypsum_hall_relief_from_the_North_Palace_of_Nineveh_%28Irak%29%2C_c._645-635_BC%2C_British_Museum_%2816722368932%29.jpg/1024px-thumbnail.jpg',
    description: '668 BC: Sculpted reliefs depicting Ashurbanipal, the last great Assyrian king, hunting lions' },
  { year: -479,
    image: 'https://i.redd.it/h5juk4rg56w01.jpg',
    description: '479 BC: Greeks storm the Persian encampment at the Battle of Mycale by Peter Dennis' },
  { year: -620,
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Sappho_and_Alcaeus.jpg',
    description: '620-570 BCE: Sappho and Alcaeus' },
  { year: -600,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Striding_Lion.JPG',
    description: '605-562 BCE: Striding Lion, Neo-Babylonian Empire' },
  { year: -600,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Striding_Lion.JPG',
    description: '605-562 BCE: Striding Lion, Neo-Babylonian Empire' },
  { year: 450,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Alma-Tadema_The_Education_of_the_Children_of_Clovis.jpg/1280px-Alma-Tadema_The_Education_of_the_Children_of_Clovis.jpg',
    description: '450-511: Education of the Children of Clovis' },
  { year: 1582,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Surikov_Pokoreniye_Sibiri_Yermakom.jpg/1280px-Surikov_Pokoreniye_Sibiri_Yermakom.jpg',
    description: '1582: Battle of Chuvash Cape' },
  { year: 1627,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Siege_of_La_Rochelle_1881_Henri_Motte.png/1280px-Siege_of_La_Rochelle_1881_Henri_Motte.png',
    description: '1627–1628: Siege of La Rochelle (Kingdom of France)' },
  { year: 1649,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Cromwell_at_Dunbar_Andrew_Carrick_Gow.jpg',
    description: '1649: Cromwell at Dunbar. Oliver Cromwell united the whole of the British Isles by force and created the Commonwealth of England' },
  { year: 218,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/The_Roses_of_Heliogabalus.jpg',
    description: '203-222: Elagabalus, Roman emperor from' },
  { year: 1832,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Le_Pont-Neuf_et_la_Cit%C3%A9_Paris_1832%2C_Giuseppe_Canella%2C_Mus%C3%A9e_Carnavalet_-_Flickr.jpg/1280px-Le_Pont-Neuf_et_la_Cit%C3%A9_Paris_1832%2C_Giuseppe_Canella%2C_Mus%C3%A9e_Carnavalet_-_Flickr.jpg',
    description: '1832: Pont Neuf bridge in Paris' }
]

const styles = {
  parent: {
    width: '100%',
    backgroundBlendMode: 'overlay',

    // https://artsandculture.google.com/partner

    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // backgroundAttachment: 'fixed'
  },
  mainLogo: {
    position: 'absolute',
    left: '10%',
    top: ' calc(80% - 380px)',
    opacity: 0.7
  },
}

const closest = (preArr, closestTo) => {
  const arr = preArr.map(el => el.year)
  const closestYear = arr.reduce(function (prev, curr) {
    return (Math.abs(curr - closestTo) < Math.abs(prev - closestTo) ? curr : prev)
  })
  return preArr.find(el => el.year === closestYear)
}

const LoadingPage = () => {
  const selectedYear = +utilsQuery.getURLParameter('year') || 1000
  const closestImage = closest(backgroundByYear, selectedYear)
  return <div className="loadingPage" style={{ ...styles.parent, background: `url("/images/logoChronasWhite.png") no-repeat 80% 20% fixed, url("${closestImage.image}") center center/cover fixed` }}>
    <div className="splash_description">{closestImage.description}</div>
  </div>
}

export default LoadingPage
