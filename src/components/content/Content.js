import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { TYPE_AREA, TYPE_MARKER } from '../map/actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import utils from '../map/utils/general'
import Timeline from './Timeline'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px',
  },
  iframe: {
    display: 'block',
    padding: '2px 8px',
    border: 'none'
  }
}

class Content extends Component {
  state = {
    iframeLoading: true,
    iframeSource: '',
    selectedWiki: null,
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
    this._handleNewData(this.props.selectedItem, this.props.metadata, this.props.activeArea)
  }

  componentWillUnmount = () => {
    this.setState({ iframeLoading: true,
      selectedWiki: null, })
  }

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } //TODO: do this with ref
  }

  _handleNewData = (selectedItem, metadata, activeArea) => {
    let selectedWiki = ''

    if (selectedItem.type === TYPE_AREA) {
      const selectedProvince = selectedItem.value
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
      const activeprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]

      selectedWiki = (activeAreaDim === 'religionGeneral')
        ? (metadata[activeAreaDim][(metadata.religion[activeprovinceValue] || [])[3]] || {})[2]
        : (activeAreaDim === 'province' || activeAreaDim === 'capital')
          ? (metadata[activeAreaDim][activeprovinceValue] || {})
          : (metadata[activeAreaDim][activeprovinceValue] || {})[2]
    }
    else if (selectedItem.type === TYPE_MARKER) {
      const selectedMarker = selectedItem.value
      selectedWiki = selectedItem.wiki
    }

    if (selectedWiki !== this.state.selectedWiki) {
      this.setState({
        iframeLoading: true,
        selectedWiki: selectedWiki
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    this._handleNewData(nextProps.selectedItem, nextProps.metadata, nextProps.activeArea)
  }

  render () {
    const shouldLoad = (this.state.iframeLoading || this.state.selectedWiki === null)
    console.debug(shouldLoad)
    return <div style={styles.main}>
      { shouldLoad && <span>loading placeholder...</span> }
      <Timeline />
      {/*{(this.state.selectedWiki === null) ? null : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (this.state.iframeLoading ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + this.state.selectedWiki + '?printable=yes'}*/}
      {/*height='100%' frameBorder='0' />}*/}
      </div>
  }
}

Content.propTypes = {
  translate: PropTypes.func.isRequired,
}

Content.defaultProps = {
  onContentTap: () => null,
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    selectedItem: state.selectedItem,
    activeArea: state.activeArea,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
  }),
  pure,
  translate,
)

export default enhance(Content)
