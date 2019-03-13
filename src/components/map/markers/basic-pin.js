import React, { PureComponent } from 'react'

export default class BasicPin extends PureComponent {
  render () {
    const { size = 20, onClick, hideInit } = this.props
    return <img id={"customMarker"} style={{ zIndex: 2, opacity: hideInit ? 0 : 1, transform: `translate(${-size / 2}px,${-size}px)` }} width={size}
      src='/images/customMarker.png' />
  }
}
