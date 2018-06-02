import React from 'react'
import mainLogo from './logoChronasWhite.png'

const styles = {
  parent: {
    width: '100%',
    background: 'url("https://upload.wikimedia.org/wikipedia/commons/d/d1/Sappho_and_Alcaeus.jpg")', // https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Siege_of_La_Rochelle_1881_Henri_Motte.png/1280px-Siege_of_La_Rochelle_1881_Henri_Motte.png; https://en.wikipedia.org/wiki/File:Alma-Tadema_The_Education_of_the_Children_of_Clovis.jpg; https://upload.wikimedia.org/wikipedia/commons/4/40/Egyptian_chess_players.jpg; https://upload.wikimedia.org/wikipedia/commons/3/33/The_Roses_of_Heliogabalus.jpg; https://artsandculture.google.com/partner
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  },
  mainLogo: {
    position: 'absolute',
    left: '10%',
    top: ' calc(80% - 380px)',
    opacity: 0.7
  }
}

const LoadingPage = () => (
  <div style={styles.parent}>
    some random quote of history -> slack, business insider, wikiquote

    <img src={mainLogo} style={styles.mainLogo} alt='chronas' />
  </div>
)

export default LoadingPage
