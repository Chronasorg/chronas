import React from 'react'
import LinearProgress from 'material-ui/LinearProgress'
import axios from 'axios'

const COLOR_SUCCESS = "rgb(0, 232, 18)"
const COLOR_ERROR = "rgb(232, 0, 18)"

const incrementLoaded = 15
let isLoadingInterval
let stoppedFlag = false
let loaded = 0

export default class LoadingBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      completedPercent: 0,
      isVisible: true,
      activeColor: COLOR_SUCCESS,
    }
  }

  _load = () => {
    loaded += incrementLoaded;
    if (!stoppedFlag)
      this.setState({ completedPercent: (Math.sqrt(Math.sqrt(loaded)) * 15) })

    if ((Math.sqrt(Math.sqrt(loaded)) * 15) > 100) {
      clearInterval(isLoadingInterval)
      stoppedFlag = false
      this._errorOut()
    }
  }

  _resetLoadingBar = () => {
    console.debug("### LoadingBar: resetingLoadBar, this should be done with isVisible false")
    stoppedFlag = true
    clearInterval(isLoadingInterval)
    this.setState({
      isVisible: false,
      completedPercent: 0,
      activeColor: COLOR_SUCCESS
    },() => {
      stoppedFlag = false
      this.setState({
        isVisible: true
      })
    })
  }

  _startLoadingBar = () => {
    if (!stoppedFlag && typeof isLoadingInterval === "undefined")
    this.setState({
      isVisible: true,
      completedPercent: 0
    })
    this._startSimulation()
  }

  _setupStartProgress = () => {
    axios.interceptors.request.use(config => {
      console.debug('### LoadingBar: startingProgress')
      this._startLoadingBar()
      return config
    })
  }


  _setupStopProgress = () => {
    const responseFunc = response => {
      console.debug('### LoadingBar: stopProgress')
        stoppedFlag = true
        clearInterval(isLoadingInterval)
        this.setState({ completedPercent: 100 })
        setTimeout(() => this._resetLoadingBar(), 1000)
      return response
    }

    const errorFunc = error => {
      console.debug('### LoadingBar: errorProgress')
        clearInterval(isLoadingInterval)
        this._errorOut()
      return Promise.reject(error)
    }
    axios.interceptors.response.use(responseFunc, errorFunc)
  }

  _errorOut() {
    this.setState({ completedPercent: 100,
      activeColor: COLOR_ERROR })
    setTimeout(() => this._resetLoadingBar(), 500)
  }
  _startSimulation() {
    if (typeof isLoadingInterval !== "undefined") {
      clearInterval(isLoadingInterval);
    }

    loaded = 0
    isLoadingInterval = setInterval(() => this._load(), 500)
  }

  componentWillUnmount() {
    console.debug('### LoadingBar: WillUnmount')
    if (typeof isLoadingInterval !== "undefined") {
      clearInterval(isLoadingInterval);
    }
  }

  componentDidMount() {
    console.debug('### LoadingBar: axios intercepted')
    this._setupStartProgress()
    this._setupStopProgress()
    // this.timer = setTimeout(() => this.progress(5), 1000)
  }

  render() {
    const { activeColor, completedPercent, isVisible } = this.state
    return isVisible
          ? <LinearProgress className="loadingBar" color={activeColor} style={{ zIndex: 1000000}} mode="determinate" value={ completedPercent } />
          : null
  }
}
