import React, { Component } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import {translate, defaultTheme, showNotification} from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { setFullModActive, resetModActive } from '../restricted/shared/buttons/actionReducers'
import { TYPE_AREA, TYPE_MARKER, TYPE_LINKED, WIKI_PROVINCE_TIMELINE, WIKI_RULER_TIMELINE } from '../map/actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import utils from '../map/utils/general'
import EntityTimeline from './EntityTimeline'
import ProvinceTimeline from './ProvinceTimeline'
import properties from "../../properties"

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 'calc(100% - 64px)',
    padding: '8px 4px'
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
    //TODO: this is not called on historypush!
    this.setState({
      iframeLoading: true,
      selectedWiki: null
    })
    this._cleanUp()
  }

  _cleanUp = () => {
    this.props.resetModActive()
  }

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
  }

  _handleNewData = (selectedItem, metadata, activeArea, doCleanup = false) => {
    const { showNotification, setFullModActive, resetModActive } = this.props
    let selectedWiki = null

    if (doCleanup) this._cleanUp()

    if (selectedItem.type === TYPE_AREA) {
      const selectedProvince = selectedItem.value
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
      const activeprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]

      selectedWiki = (activeAreaDim === 'religionGeneral')
        ? (metadata[activeAreaDim][(metadata.religion[activeprovinceValue] || [])[3]] || {})[2]
        : (activeAreaDim === 'province' || activeAreaDim === 'capital')
          ? (metadata[activeAreaDim][activeprovinceValue] || {})
          : (metadata[activeAreaDim][activeprovinceValue] || {})[2]

    } else if (selectedItem.type === TYPE_MARKER) {
      selectedWiki = selectedItem.wiki
    } else if (selectedItem.type === TYPE_LINKED) {
      selectedWiki = selectedItem.wiki
      axios.get(properties.chronasApiHost + '/markers/' + selectedWiki)
        .then((linkedMarkerResult) => {
          if (linkedMarkerResult.status === 200) {
            const linkedMarker = linkedMarkerResult.data
            showNotification("Linked marker found")
            setFullModActive(TYPE_LINKED, linkedMarker.coo, '', false)
          } else {
            showNotification("No linked marker found, consider adding one")
          }
        })
    }

    if (selectedWiki !== this.state.selectedWiki) {
      this.setState({
        iframeLoading: true,
        selectedWiki: selectedWiki
      })
    }
  }

  componentWillReceiveProps (nextProps) {
      if (this.props.selectedItem.value !== nextProps.selectedItem.value ||
        this.props.selectedItem.wiki !== nextProps.selectedItem.wiki ||
        this.props.selectedItem.type !== nextProps.selectedItem.type ||
        this.props.activeArea.color !== nextProps.activeArea.color)
    this._handleNewData(nextProps.selectedItem, nextProps.metadata, nextProps.activeArea, nextProps.selectedItem.value === '')
  }

  render () {
    const { activeArea, selectedItem, rulerEntity, provinceEntity, selectedYear, metadata } = this.props
    const shouldLoad = (this.state.iframeLoading || this.state.selectedWiki === null)
    console.debug(shouldLoad)
    const rulerTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && activeArea.color === 'ruler')
    const provinceTimelineOpen = (selectedItem.wiki === WIKI_PROVINCE_TIMELINE)

    return <div style={styles.main}>
      { shouldLoad && !rulerTimelineOpen && !provinceTimelineOpen && <span>loading placeholder...</span> }
      {rulerTimelineOpen
        ? <EntityTimeline rulerProps={metadata.ruler[rulerEntity.id]} selectedYear={selectedYear} selectedItem={selectedItem} rulerEntity={rulerEntity} />
        : provinceTimelineOpen
          ? <ProvinceTimeline metadata={metadata} selectedYear={selectedYear} provinceEntity={provinceEntity} activeArea={activeArea} />
          : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (this.state.iframeLoading ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + this.state.selectedWiki + '?printable=yes'}
        height='100%' frameBorder='0' />}
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
    setFullModActive,
    resetModActive,
    showNotification,
  }),
  pure,
  translate,
)

export default enhance(Content)
