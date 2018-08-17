import React from 'react'
import mainLogo from '../../../public/images/logoChronasWhite.png'
import utilsQuery from "../map/utils/query"

const backgroundByYear = [
  { year: -2000, image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Sappho_and_Alcaeus.jpg', description: '605-562 BCE: Striding Lion, Neo-Babylonian Empire' },
  { year: 2000, image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/The_Roses_of_Heliogabalus.jpg', description: '1881: Siege of La Rochelle' }
]

const styles = {
  parent: {
    width: '100%',
    backgroundBlendMode: 'overlay',

    // https://upload.wikimedia.org/wikipedia/commons/6/61/Striding_Lion.JPG
    // https://upload.wikimedia.org/wikipedia/commons/d/d1/Sappho_and_Alcaeus.jpg
    // https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Siege_of_La_Rochelle_1881_Henri_Motte.png/1280px-Siege_of_La_Rochelle_1881_Henri_Motte.png; https://en.wikipedia.org/wiki/File:Alma-Tadema_The_Education_of_the_Children_of_Clovis.jpg; https://upload.wikimedia.org/wikipedia/commons/4/40/Egyptian_chess_players.jpg; https://upload.wikimedia.org/wikipedia/commons/3/33/The_Roses_of_Heliogabalus.jpg; https://artsandculture.google.com/partner

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
  var arr = preArr.map(el => el.year)
  var closest = Math.max.apply(null, arr);

  for(var i = 0; i < arr.length; i++){
    if(arr[i] >= closestTo && arr[i] < closest) closest = arr[i];
  }

  return closest;
}


const LoadingPage = () => {
  const selectedYear = +utilsQuery.getURLParameter('year') || 1000
  const closestImage = backgroundByYear.find(el => el.year === closest(backgroundByYear, selectedYear))
  console.debug(selectedYear)
  return <div className="loadingPage" style={{ ...styles.parent, background: `url("/images/logoChronasWhite.png") no-repeat 80% 20% fixed, url("${closestImage.image}") center center/cover fixed` }}>
    <div className="splash_description">{closestImage.description}</div>
  </div>
}

export default LoadingPage
