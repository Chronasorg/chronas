/* eslint-disable max-len */
import { CompositeLayer } from 'deck.gl'
import MovementLayer from './movement-layer'

const FULLTIMEINTERVAL = 1000
const lightAmount = 4
const defaultProps = {
}

let _yearInitialized = ''
let _animationFrame = false
export default class MovementLayerWrapper extends CompositeLayer {
  initializeState () {
    this.finalizeState()
    console.debug("!!-!! initialize")
    this.state = {
      currentYear: '',
      // Cached tags per zoom level
      time: FULLTIMEINTERVAL
    }
    const movementData = []
    const sliceTime = FULLTIMEINTERVAL / lightAmount
    this.props.preData.data.forEach(el => {
      if (el[0].toString() !== el[1].toString()) {
        // const distance = Math.abs(el[0][0] - el[1][0]) + Math.abs(el[0][1] - el[1][1])
        // console.debug(distance, Math.floor(distance/12) + 1)
        // lightAmount = Math.floor(distance/12) + 2
        for (var i = 1; i < lightAmount -2; i++) {
          movementData.push([
            [el[0][0], el[0][1], -FULLTIMEINTERVAL +(i*sliceTime)],
            [el[1][0], el[1][1], i*sliceTime],
          ])
        }
      }
    })
    console.debug("!!-!! movementData", movementData.length)
    this.setState({
      movementData
    })
    this._animate();
  }

  shouldUpdateState ({ props, oldProps, changeFlags }) {
    if (changeFlags.dataChanged) {
      console.error("dataChanged!")
    }
    if (props.year !== oldProps.year && _yearInitialized !== props.year /*(JSON.stringify(props.preData.data[0] || {}) !== JSON.stringify(oldProps.preData.data[0] || {}))*/) {
      // this.i
      this.finalizeState()
      _yearInitialized = props.year
      this.initializeState ()
    }
    return changeFlags.somethingChanged
  }

  _animate() {
    const {
      loopLength = FULLTIMEINTERVAL, // unit corresponds to the timestamp in source data
      animationSpeed = FULLTIMEINTERVAL/10 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    // console.debug(this.state)
    _animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  finalizeState() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
      _animationFrame = false
      _yearInitialized = false
    }
  }

  renderLayers () {
    const { trailLength = 800, year } = this.props
    const { movementData, time } = this.state
    return new MovementLayer({
      id: 'movement',
      data: movementData,
      currentTime: time,
      getPath: d => d,
      opacity: 1,
      strokeWidth: 20,
      year,
      getColor: () => [32, 74, 0], // (d.vendor === 0 ? [253, 128, 93] : [80, 0, 0]
      trailLength,
    })
  }
}

MovementLayerWrapper.layerName = 'MovementLayerWrapper'
MovementLayerWrapper.defaultProps = defaultProps
