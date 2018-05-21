import React from 'react'
import { translate } from 'admin-on-rest'
import IconButton from 'material-ui/IconButton'
import FullscreenEnterIcon from 'material-ui/svg-icons/navigation/fullscreen'
import FullscreenLeaveIcon from 'material-ui/svg-icons/navigation/fullscreen-exit'
import { tooltip } from '../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../styles/chronasColors'

const styles = {
  iframe: {
    width: '100%',
    right: '8px',
    padding: '2px 8px'
  },
  fullscreenButton: {
    backgroundColor: 'rgb(236, 239, 241)',
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: '0px',
    height: '56px',
    color: '#fff'
  }
}

export default class ArticleIframe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isFullScreen: false,
      iframeLoading: true,
    }
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
  }

  _toggleFullscreen = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen })
  }

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
  }

  render () {
    const { isFullScreen, iframeLoading } = this.state
    const { selectedWiki, customStyle } = this.props

    const iconProps = {
      key: 'random',
      tooltipPosition: 'bottom-right',
      tooltip: translate('pos.goFullScreen'),
      tooltipStyles: tooltip,
      onClick: () => this._toggleFullscreen(),
      style: styles.fullscreenButton
    }

    const shouldLoad = (iframeLoading || selectedWiki === null)
    return (
      <div style={{ height: '100%', width: '100%', ...customStyle }}>
        { isFullScreen
              ? <IconButton { ...iconProps } >
                <FullscreenEnterIcon
                  hoverColor={chronasMainColor} />
              </IconButton>
              : <IconButton { ...iconProps } >
                <FullscreenLeaveIcon
                  hoverColor={chronasMainColor} />
              </IconButton>
          }

        { shouldLoad && <span>iframe loading placeholder...</span> }
        <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (shouldLoad ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + selectedWiki + '?printable=yes'} height='100%' frameBorder='0' />

      </div>
    )
  }
}
