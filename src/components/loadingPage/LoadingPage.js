import React from 'react'
import mainLogo from '../../../public/images/logoChronasWhite.png'
import utilsQuery from '../map/utils/query'

const backgroundByYear = [
  { year: -2000,
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Egyptian_chess_players.jpg',
    description: 'Egyptian chess players' },
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
  { year: 1627,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Siege_of_La_Rochelle_1881_Henri_Motte.png/1280px-Siege_of_La_Rochelle_1881_Henri_Motte.png',
    description: '1627–1628: Siege of La Rochelle (Kingdom of France)' },
  { year: 218,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/The_Roses_of_Heliogabalus.jpg',
    description: '203-222: Elagabalus, Roman emperor from' }
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
