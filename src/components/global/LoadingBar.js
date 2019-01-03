import React from 'react'
import LinearProgress from 'material-ui/LinearProgress'
import axios from 'axios'
import { themes } from '../../properties'

const COLOR_SUCCESS = "rgb(0, 232, 18)"
const COLOR_ERROR = "rgb(232, 0, 18)"

const incrementLoaded = 15
let stoppedFlag = false
let loaded = 0

export default class LoadingBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      activeColor: themes[this.props.theme].highlightColors[0],
      completedPercent: 0,
      isVisible: true,
      isLoadingInterval: undefined,
    }
  }

  _load = () => {
    loaded += incrementLoaded;
    if (!stoppedFlag){
      this.setState({ completedPercent: (Math.sqrt(Math.sqrt(loaded)) * 15) })
    }

    if ((Math.sqrt(Math.sqrt(loaded)) * 15) > 100) {
      clearInterval(this.state.isLoadingInterval)
      stoppedFlag = false
      this._errorOut()
    }
  }

  _resetLoadingBar = () => {
    stoppedFlag = true
    clearInterval(this.state.isLoadingInterval)
    this.setState({
      isVisible: false,
      completedPercent: 0,
      activeColor: themes[this.props.theme].highlightColors[0]
    },() => {
      stoppedFlag = false
      this.setState({
        isVisible: true
      })
    })
  }

  _startLoadingBar = () => {
    if (!stoppedFlag && typeof this.state.isLoadingInterval === "undefined")
    this.setState({
      isVisible: true,
      completedPercent: 0
    })
    this._startSimulation()
  }

  _setupStartProgress = () => {
    axios.interceptors.request.use(config => {
      this._startLoadingBar()
      return config
    })
    this._startLoadingBar()
  }

  _setupStopProgress = () => {
    const responseFunc = response => {
        stoppedFlag = true
        clearInterval(this.state.isLoadingInterval)
        this.setState({ completedPercent: 100 })
        setTimeout(() => this._resetLoadingBar(), 1000)
      return response
    }

    const errorFunc = error => {
        clearInterval(this.state.isLoadingInterval)
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
    if (typeof this.state.isLoadingInterval !== "undefined") {
      clearInterval(this.state.isLoadingInterval)
    }

    loaded = 0
    this.setState({ isLoadingInterval: setInterval(() => this._load(), 500) })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.failAndNotify === true) {
      clearInterval(this.state.isLoadingInterval)
      this._errorOut()
    }
  }

  componentWillUnmount() {
    if (typeof this.state.isLoadingInterval !== "undefined") {
      clearInterval(this.state.isLoadingInterval)
    }
  }

  componentDidMount() {
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
