import React from 'react'
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import mainLogo from '../../../public/images/logoChronasWhite.png'
import utilsQuery from '../map/utils/query'
import {themes} from "../../properties";

const backgroundByYear = [
{ year: -2000,
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Standard_of_Ur_-_War.jpg/1280px-Standard_of_Ur_-_War.jpg',
  description: '26th century BC: The Standard of Ur, a hollow wooden box with scenes of war and peace' },
  { year: -1400,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Solvognen-00100.tif/lossy-page1-1280px-Solvognen-00100.tif.jpg',
    description: '1400 BC: The Trundholm sun chariot, is a Nordic Bronze Age artifact discovered in Denmark.' },
  { year: -668,
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Siege_of_Paris_%28885%E2%80%93886%29.jpeg',
    description: '668 BC: Sculpted reliefs depicting Ashurbanipal, the last great Assyrian king, hunting lions' },
  { year: -519,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cincinato_abandona_el_arado_para_dictar_leyes_a_Roma%2C_c.1806_de_Juan_Antonio_Ribera.jpg/1280px-Cincinato_abandona_el_arado_para_dictar_leyes_a_Roma%2C_c.1806_de_Juan_Antonio_Ribera.jpg',
    description: '519 BC: Lucius Quinctius became a legendary Roman opponent of the rights of the plebeians (the common citizens)' },
  { year: -620,
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Sappho_and_Alcaeus.jpg',
    description: '620-570 BCE: Sappho and Alcaeus' },
  { year: -600,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Striding_Lion.JPG',
    description: '605-562 BCE: Striding Lion, Neo-Babylonian Empire' },
  { year: -332,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Charles_Le_Brun_-_Entry_of_Alexander_into_Babylon.JPG/1280px-Charles_Le_Brun_-_Entry_of_Alexander_into_Babylon.JPG',
    description: '332 BCE: Alexander the Great\'s uncontested entry into the city of Babylon' },
  { year: -52,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Siege-alesia-vercingetorix-jules-cesar.jpg/1280px-Siege-alesia-vercingetorix-jules-cesar.jpg',
    description: '52 BCE: The surrender of the Gallic chieftain after the Battle of Alesia' },
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
    description: 'Young Roman emperor Elagabalus (203-222 AD) hosting a banquet' },
  { year: 400,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/John_William_Waterhouse_-_The_Favorites_of_the_Emperor_Honorius_-_1883.jpg/1200px-John_William_Waterhouse_-_The_Favorites_of_the_Emperor_Honorius_-_1883.jpg',
    description: 'Honorius, Son of Theodosius I; appointed as junior Augustus for the west by Theodosius in 393' },
  { year: 711,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Mariano_Barbas%C3%A1n_-_Batalla_de_Guadalete.jpg/1380px-Mariano_Barbas%C3%A1n_-_Batalla_de_Guadalete.jpg',
    description: '711: Battle of Guadalete of the Visigoths and the beginning of the Umayyad conquest of Hispania' },
  { year: 881,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Dassy-Invasions_normandes.jpg',
    description: '881: Battle of Danish forces of pagan Viking warriors and the Christian troops of Carolingian' },
  { year: 1121,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Dassy-Invasions_normandes.jpg',
    description: '1121: The aftermath of the Didgori battle portrayed in "Spirit of the Rider" made by Augusto Ferrer-Dalmau' },
  { year: 1331,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Shimo-akasaka-jyo02.jpg/1280px-Shimo-akasaka-jyo02.jpg',
    description: '1331: Siege of Akasaka near Osaka was one of the earlier battles of the Genkō War' },
  { year: 1832,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Le_Pont-Neuf_et_la_Cit%C3%A9_Paris_1832%2C_Giuseppe_Canella%2C_Mus%C3%A9e_Carnavalet_-_Flickr.jpg/1280px-Le_Pont-Neuf_et_la_Cit%C3%A9_Paris_1832%2C_Giuseppe_Canella%2C_Mus%C3%A9e_Carnavalet_-_Flickr.jpg',
    description: '1832: Pont Neuf bridge in Paris' },
  { year: 1862,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Confederate_prisoners_captured_in_the_Battle_of_Front_Royal_being_guarded_in_a_Union_camp_in_the_Shenandoah_Valley%2Cjpg.jpg/1024px-Confederate_prisoners_captured_in_the_Battle_of_Front_Royal_being_guarded_in_a_Union_camp_in_the_Shenandoah_Valley%2Cjpg.jpg',
    description: '1862: Confederate prisoners captured in the Battle of Front Royal' }
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
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
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

const LoadingPage = (props) => {
  const selectedYear = +utilsQuery.getURLParameter('year') || 1000
  const closestImage = closest(backgroundByYear, selectedYear)
  return <div className="loadingPage" style={{ ...styles.parent, background: `url("/images/logoChronasWhite.png") no-repeat 80% 20% fixed, url("${closestImage.image}") center center/cover fixed` }}>
    { !props.failAndNotify && <div className="splash_description">{closestImage.description}</div> }
    { props.failAndNotify && <Dialog bodyStyle={{ backgroundImage: themes['light'].gradientColors[0] }} open={true} contentClassName={"classReveal"} contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}}>
    <Card style={styles.card}>
      <div><h1>There is something wrong...</h1>
        <br/>
        <p>
          Chronas seems to be under too much load right now.
          Please try again in a couple of minutes.
        </p>
      </div>
    </Card>
  </Dialog>}
  </div>
}

export default LoadingPage
