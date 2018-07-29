import React from 'react'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import {showNotification, translate} from 'admin-on-rest'
import { Link } from 'react-router-dom'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import IconEdit from 'material-ui/svg-icons/editor/mode-edit'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import FullscreenEnterIcon from 'material-ui/svg-icons/navigation/fullscreen'
import { tooltip } from '../../styles/chronasStyleComponents'
import {chronasMainColor, grey600} from '../../styles/chronasColors'
import { red400 } from 'material-ui/styles/colors'
import { setRightDrawerVisibility } from '../content/actionReducers'
import utilsQuery from "../map/utils/query";
import { selectLinkedItem, TYPE_AREA, TYPE_MARKER, TYPE_LINKED } from "../map/actionReducers";
import {toggleRightDrawer as toggleRightDrawerAction} from "./actionReducers";
import {resetModActive, setFullModActive} from "../restricted/shared/buttons/actionReducers";

const styles = {
  closeButton: {
    boxShadow: 'inherit',
    zIndex: 15000,
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,.7)) drop-shadow(0 1px 2px rgba(0,0,0,.3))',
    position: 'fixed',
    top: '1em',
    right: '5em',
  },
  discoverDialogStyle: {
    width: '100%',
    height:'100%',
    // maxWidth: 'none',
    transform: '',
    transition: 'all .3s',
    opacity: 0,
    // display: 'flex',
    // '-ms-flex-direction': 'row',
    // '-webkit-flex-direction': 'row',
    // 'flex-direction': 'row',
    //   '-ms-flex-wrap': 'wrap',
    // '-webkit-flex-wrap': 'wrap',
    // 'flex-wrap': 'wrap',
    maxWidth: '100%',
    backgroundColor: 'transparent'
    // margin-left:auto,margin-right:auto,position:absolute,top:0,right:0,bottom:0,left:0
  },
  overlayStyle: {
    transition: 'all .3s',
    background: 'rgba(0,0,0,.8)',
    pointerEvents: 'none',
    height:'100%',
    width: '100%'
  },
  iframe: {
    width: '100%',
    height:'100%',
    right: '8px',
    padding: '38px 8px 0px'
  },
  actionButtonContainer: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: '4px',
    top: '0px',
    height: '56px',
  },
  fullscreenButton: {
    whiteSpace: 'nowrap',
  },
  fullscreenClose: {
    backgroundColor: '#00000073',
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: '56px',
    height: '56px',
    color: '#fff'
  }
}

const LoadingCompass = <span>iframe loading placeholder...</span>

class ArticleIframe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isFullScreen: false,
      iframeLoading: true,
      iframeLoadingFull: true,
    }
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
    this.setState({ iframeLoadingFull: true })
  }

  _exitFullscreen = () => {
    this.setState({ isFullScreen: false })
  }

  _enterFullscreen = () => {
    this.setState({ isFullScreen: true })
  }

  _handlFullURLChange = (e) => {
    this.setState({ iframeLoadingFull: false })
  }

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
  }

  _handleClose = () => {
    this.props.history.push('/')
    this.props.deselectItem()
    this.props.setRightDrawerVisibility(false)
    utilsQuery.updateQueryStringParameter('type', '')
    utilsQuery.updateQueryStringParameter('value', '')
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedWiki !== nextProps.selectedWiki) this.forceUpdate()
  }

  render () {
    const { isFullScreen, iframeLoading, iframeLoadingFull } = this.state
    const { hasChart, selectedItem, selectedWiki, isEntity, customStyle } = this.props

    if (!selectedItem) return LoadingCompass
    const shouldLoad = (iframeLoading || selectedWiki === null || +selectedWiki === -1)
    const isMarker = selectedItem.type === TYPE_MARKER
    const isMedia = selectedItem.type === TYPE_LINKED
    const isArea = selectedItem.type === TYPE_AREA

    const modUrl = isMarker ?  '/mod/markers' : '/mod/metadata'
    const iconEnterFullscreen = {
      key: 'random',
      tooltipPosition: 'bottom-right',
      tooltip: translate('pos.goFullScreen'),
      tooltipStyles: tooltip,
      onClick: () => this._enterFullscreen(),
      style: styles.fullscreenButton
    }
    return (
      <div style={{ Zindex: 2147483647, height: '100%', width: '100%', ...customStyle }}>
        <Dialog
          open={isFullScreen}
          autoDetectWindowHeight={false}
          modal={false}
          onRequestClose={this._exitFullscreen}
          contentClassName={(iframeLoadingFull) ? '' : 'classReveal dialogBackgroundHack fullWikiArticle '}
          contentStyle={styles.discoverDialogStyle}
          bodyStyle={{ height: '100%', width: '100%', backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          overlayStyle={styles.overlayStyle}
          style={{ zIndex: 15000, height: '100%', width: '100%', backgroundColor: 'transparent', overflow: 'auto' }}
          titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
          autoScrollBodyContent={false}>
          { (selectedWiki !== '') && shouldLoad && LoadingCompass }
          { (selectedWiki === '') && <span>no wiki article found, consider adding one by clicking the edit button...</span> }
          { (+selectedWiki !== -1) && (selectedWiki !== '') && <iframe id='articleFullIframe' onLoad={this._handlFullURLChange} height='100%' width='100%' style={{ height: '100%', width: '100%', display: (shouldLoad ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + selectedWiki} frameBorder='0' /> }
          { isFullScreen &&
          <FloatingActionButton
            backgroundColor={'transparent'}
            style={styles.fullscreenClose}
            key={'close'}
            onClick={this._exitFullscreen}
          >
            <CloseIcon color={'white'} />
          </FloatingActionButton >
          }
        </Dialog>
        <div style={ !(isMarker || isMedia || !hasChart) ? { ...styles.actionButtonContainer, top: 254 } : styles.actionButtonContainer } >
          <IconButton iconStyle={{textAlign: 'right', fontSize: '12px', color: grey600}} containerElement={<Link to={modUrl}/>}>
            <IconEdit hoverColor={chronasMainColor} />
          </IconButton>
          <IconButton {...iconEnterFullscreen}>
            <FullscreenEnterIcon
              hoverColor={chronasMainColor} />
          </IconButton>
          { !(isEntity) && <IconButton iconStyle={{textAlign: 'right', fontSize: '12px', color: grey600}} onClick={() => this._handleClose()}>
            <IconClose hoverColor={chronasMainColor} />
          </IconButton> }
        </div>
        { shouldLoad && LoadingCompass }
        { (+selectedWiki !== -1) && (selectedWiki !== '') && <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (shouldLoad ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + selectedWiki + '?printable=yes'} height='100%' frameBorder='0' /> }
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
  }), {
    setRightDrawerVisibility,
  }),
  pure,
  translate,
)

export default enhance(ArticleIframe)
