import React from 'react'
import LinearProgress from 'material-ui/LinearProgress'
import axios from 'axios'

const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total)

let requestsCounter = 0

export default class LoadingBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      completed: 0,
    }
  }

  _setupStartProgress = () => {
    axios.interceptors.request.use(config => {
      console.debug('### LoadingBar: startingProgress')
      this.setState({ completed: 0 })
      requestsCounter++
      return config
    })
  }

  _setupUpdateProgress = () => {
    const update = e => {
      console.debug('### LoadingBar: updateProgress', e.loaded, e.total)
      this.setState({ completed: (calculatePercentage(e.loaded, e.total)) })
    }
    axios.defaults.onDownloadProgress = update
    axios.defaults.onUploadProgress = update
  }

  _setupStopProgress = () => {
    const responseFunc = response => {
      console.debug('### LoadingBar: stopProgress')
      if ((--requestsCounter) === 0){
        this.setState({ completed: 100 })
        setTimeout(() => {
          //TODO: call reset function which will hide and reset bar!
          return this.setState({ completed: 0 }), 1000
        })
      }
      return response
    }

    const errorFunc = error => {
      console.debug('### LoadingBar: errorProgress')
      if ((--requestsCounter) === 0){
        // TODO: red bar?
        this.setState({ completed: 100 })
        setTimeout(() => this.setState({ completed: 0 }), 1000)
      }
      return Promise.reject(error)
    }

    axios.interceptors.response.use(responseFunc, errorFunc)
  }

  componentDidMount() {
    console.debug('### LoadingBar: axios intercepted')
    this._setupStartProgress()
    this._setupUpdateProgress()
    this._setupStopProgress()
    // this.timer = setTimeout(() => this.progress(5), 1000)
  }

  render() {
    return (
      <LinearProgress className="loadingBar" style={{ zIndex: 1000000 }} mode="determinate" value={this.state.completed} />
    )
  }
}
