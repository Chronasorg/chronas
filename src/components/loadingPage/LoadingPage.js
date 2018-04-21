import React from 'react'
import mainLogo from './logoChronasWhite.png'

const styles = {
  parent: {
    width: '100%',
    backgroundImage: 'linear-gradient(rgb(56, 59, 50) 0px, rgb(17, 6, 23))'
  },
  mainLogo: {
    position: 'absolute',
    left: '10%',
    top: '40%',
  }
}

const LoadingPage = () => (
  <div style={styles.parent}>
    some random quote of history -> slack, business insider, wikiquote
    <img src={mainLogo} style={styles.mainLogo} alt='chronas' />
  </div>
)

export default LoadingPage
