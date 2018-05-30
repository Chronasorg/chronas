import React from 'react'
import mainLogo from './logoChronasWhite.png'

const styles = {
  parent: {
    width: '100%',
    background: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Siege_of_La_Rochelle_1881_Henri_Motte.png/1280px-Siege_of_La_Rochelle_1881_Henri_Motte.png")',
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
