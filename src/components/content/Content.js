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
import { translate, defaultTheme, showNotification } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { setFullModActive, resetModActive } from '../restricted/shared/buttons/actionReducers'
import { TYPE_AREA, TYPE_MARKER, TYPE_LINKED, WIKI_PROVINCE_TIMELINE, WIKI_RULER_TIMELINE } from '../map/actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import utils from '../map/utils/general'
import EntityTimeline from './EntityTimeline'
import ProvinceTimeline from './ProvinceTimeline'
import properties from '../../properties'

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
    sunburstData: []
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
    this._handleNewData(this.props.selectedItem, this.props.metadata, this.props.activeArea)
  }

  componentWillUnmount = () => {
    // TODO: this is not called on historypush!
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

      console.error('setting up sunburst data, this should only be done once', activeprovinceValue)
      const sunburstData = []
      const sunburstDataMeta = {}
      const activeData = activeArea.data
      Object.keys(activeData).forEach((provKey) => {
        const currProvData = activeData[provKey]
        if (currProvData[utils.activeAreaDataAccessor(activeAreaDim)] === activeprovinceValue) {
          const ruler = metadata['ruler'][currProvData[utils.activeAreaDataAccessor('ruler')]] || {}
          const culture = metadata['culture'][currProvData[utils.activeAreaDataAccessor('culture')]] || {}
          const religion = metadata['religion'][currProvData[utils.activeAreaDataAccessor('religion')]] || {}
          const religionGeneral = metadata['religionGeneral'][(metadata['religion'][currProvData[utils.activeAreaDataAccessor('religion')]] || {})[3]] || {}

          const objectToPush =
            {
              province: provKey,
              ruler: ruler[0],
              culture: culture[0],
              religion: religion[0],
              religionGeneral: religionGeneral[0],
              size: currProvData[utils.activeAreaDataAccessor('population')]
            }

          sunburstDataMeta[ruler[0]] = ruler
          sunburstDataMeta[culture[0]] = culture
          sunburstDataMeta[religion[0]] = religion
          sunburstDataMeta[religionGeneral[0]] = religionGeneral

          delete objectToPush[activeAreaDim]
          sunburstData.push(objectToPush)
        }
      })
      this.setState({
        sunburstData: [sunburstData, sunburstDataMeta]
      })

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
            showNotification('Linked marker found')
            setFullModActive(TYPE_LINKED, linkedMarker.coo, '', false)
          } else {
            showNotification('No linked marker found, consider adding one')
          }
        })
    }

    if (selectedWiki !== this.state.selectedWiki) {
      this.setState({
        iframeLoading: true,
        selectedWiki: selectedWiki
      })
    }

    // religionGeneral - religion - culture - prov
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedItem.value !== nextProps.selectedItem.value ||
        this.props.selectedItem.wiki !== nextProps.selectedItem.wiki ||
        this.props.selectedItem.type !== nextProps.selectedItem.type ||
        this.props.activeArea.color !== nextProps.activeArea.color) { this._handleNewData(nextProps.selectedItem, nextProps.metadata, nextProps.activeArea, nextProps.selectedItem.value === '') }
  }

  render () {
    const { sunburstData, iframeLoading, selectedWiki } = this.state
    const { activeArea, selectedItem, rulerEntity, provinceEntity, selectedYear, metadata, newWidth } = this.props
    const shouldLoad = (iframeLoading || selectedWiki === null)
    console.debug(shouldLoad)
    const rulerTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && activeArea.color === 'ruler')
    const provinceTimelineOpen = (selectedItem.wiki === WIKI_PROVINCE_TIMELINE)

    return <div style={styles.main}>
      { shouldLoad && !rulerTimelineOpen && !provinceTimelineOpen && <span>loading placeholder...</span> }
      {rulerTimelineOpen
        ? <EntityTimeline newWidth={newWidth} rulerProps={metadata.ruler[rulerEntity.id]} selectedYear={selectedYear} selectedItem={selectedItem} rulerEntity={rulerEntity} sunburstData={sunburstData} />
        : provinceTimelineOpen
          ? <ProvinceTimeline metadata={metadata} selectedYear={selectedYear} provinceEntity={provinceEntity} activeArea={activeArea} />
          : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (iframeLoading ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + selectedWiki + '?printable=yes'}
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
