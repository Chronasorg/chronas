import React, { PureComponent } from 'react'

export default class BasicPin extends PureComponent {
  render () {
    const { size = 20, onClick } = this.props
    return <img style={{ transform: `translate(${-size / 2}px,${-size}px)` }} width={size}
      src='/images/customMarker.png' />
  }
}
