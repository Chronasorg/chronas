import React, { Component } from 'react'
import axios from 'axios'
import Badge from 'material-ui/Badge';
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme, showNotification } from 'admin-on-rest'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ContentLink from 'material-ui/svg-icons/content/link'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { setFullModActive, resetModActive } from '../restricted/shared/buttons/actionReducers'
import { TYPE_AREA, TYPE_MARKER, TYPE_LINKED, TYPE_EPIC, WIKI_PROVINCE_TIMELINE, WIKI_RULER_TIMELINE } from '../map/actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import utils from '../map/utils/general'
import EntityTimeline from './EntityTimeline'
import EpicTimeline from './EpicTimeline'
import ProvinceTimeline from './ProvinceTimeline'
import properties from '../../properties'

const styles = {
  contentLeftMenu: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
    position: 'fixed',
    left: '-70px',
    top: '48px',
    width: '64px',
    overflow: 'hidden'
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 'calc(100% - 64px)',
    padding: '8px 0px',
    boxShadow: 'inset 0 5px 6px -3px rgba(0,0,0,.4)'
  },
  menuIcon: {
    left: 20
  },
  menuIconBadge: {
    top: '-4px',
    left: '14px',
    fontSize: '12px',
    width: '20px',
    height: '20px'
  },
  menuIconBadgeContainer: {
    left: '-16px',
    position: 'relative',
    top: '-16px',
  },
  menuItem: {
    width: '64px'
  },
  iframe: {
    display: 'block',
    padding: '2px 8px',
    border: 'none'
  }
}

class Content extends Component {
  state = {
    itemHasLinkedItems: false,
    iframeLoading: true,
    iframeSource: '',
    selectedWiki: null,
    sunburstData: [],
    linkedItems: [],
    activeContentMenuItem: (localStorage.getItem('activeContentMenuItem') !== null) ? localStorage.getItem('activeContentMenuItem') : 'sunburst'
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
    this._handleNewData(this.props.selectedItem, this.props.metadata, this.props.activeArea)
  }

  componentWillUnmount = () => {
    // TODO: this is not called on historypush!
    this.setState({
      iframeLoading: true,
      selectedWiki: null,
      linkedItems: []
    })
    this._cleanUp()
  }

  _cleanUp = () => {
    this.props.resetModActive()
  }

  _setContentMenuItem = (newContentMenuItem) => {
    localStorage.setItem('activeContentMenuItem', newContentMenuItem)
    this.setState({ activeContentMenuItem: newContentMenuItem })
  }

  _toggleContentMenuItem = (preContentMenuItem) => {
    const newContentMenuItem = (preContentMenuItem === this.state.activeContentMenuItem) ? '' : preContentMenuItem
    localStorage.setItem('activeContentMenuItem', newContentMenuItem)
    this.setState({ activeContentMenuItem:  newContentMenuItem })
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
      const sunburstData = []
      const sunburstDataMeta = {}
      const activeData = activeArea.data
      if (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE) {
        console.error('setting up sunburst data, this should only be done once', activeprovinceValue)
        Object.keys(activeData).forEach((provKey) => {
          const currProvData = activeData[provKey]
          if (currProvData[utils.activeAreaDataAccessor(activeAreaDim)] === activeprovinceValue) {
            const ruler = metadata['ruler'][currProvData[utils.activeAreaDataAccessor('ruler')]] || {}
            // const province = metadata['province'][currProvData[utils.activeAreaDataAccessor('ruler')]] || {}
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

            sunburstDataMeta[provKey] = (metadata['province'][provKey] || {})
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
      }

      selectedWiki = (activeAreaDim === 'religionGeneral')
        ? (metadata[activeAreaDim][(metadata.religion[activeprovinceValue] || [])[3]] || {})[2]
        : (activeAreaDim === 'province' || activeAreaDim === 'capital')
          ? (metadata[activeAreaDim][activeprovinceValue] || {})
          : (metadata[activeAreaDim][activeprovinceValue] || {})[2]
    }
    else if (selectedItem.type === TYPE_MARKER) {
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

      // look for linked linked items based on wiki
      axios.get(properties.chronasApiHost + '/metadata?type=i&wiki=Battle_of_Clontarf' /*+ selectedWiki*/)
        .then((linkedItemResult) => {
          if (linkedItemResult.status === 200) {
            const linkedItems = []
            const res = linkedItemResult.data
            showNotification(linkedItems.length + ' linked item' + (linkedItems.length === 1 ) ? '' : 's' + ' found')
            res.forEach((imageItem) => {
              linkedItems.push({
                src: imageItem._id,
                wiki: imageItem.wiki,
                title: imageItem.data.title,
                subtype: imageItem.subtype,
                source: imageItem.data.source,
                subtitle: imageItem.year,
                score: imageItem.score,
              })
            })
            this.setState({ linkedItems })
          } else {
            showNotification('No linked items found, consider adding one') // TODO: notifications don't seem to work on this page
          }
        })
    }

    // religionGeneral - religion - culture - prov
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedYear !== nextProps.selectedYear ||
      this.props.selectedItem.value !== nextProps.selectedItem.value ||
        this.props.selectedItem.wiki !== nextProps.selectedItem.wiki ||
        this.props.selectedItem.type !== nextProps.selectedItem.type ||
        this.props.activeArea.color !== nextProps.activeArea.color) {
      this._handleNewData(nextProps.selectedItem, nextProps.metadata, nextProps.activeArea, nextProps.selectedItem.value === '')
    }
  }

  render () {
    const { activeContentMenuItem, sunburstData, iframeLoading, selectedWiki, itemHasLinkedItems, linkedItems } = this.state
    const { activeArea, selectedItem, rulerEntity, provinceEntity, selectedYear, metadata, newWidth, history } = this.props
    const shouldLoad = (iframeLoading || selectedWiki === null)

    const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
    const entityTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && selectedItem.type === TYPE_AREA)
    const epicTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && selectedItem.type === TYPE_EPIC)
    const provinceTimelineOpen = (selectedItem.wiki === WIKI_PROVINCE_TIMELINE)

    const linkedItemCount =  (linkedItems || []).length

    return <div style={styles.main}>
      { entityTimelineOpen && <div>
        <Paper style={styles.contentLeftMenu}>
          <Menu desktop={true}>
            <MenuItem style={ { ...styles.menuItem, backgroundColor: (activeContentMenuItem === 'sunburst') ? 'rgba(0,0,0,0.2)' : 'inherit'} } onClick={() => this._toggleContentMenuItem('sunburst')} leftIcon={<CompositionChartIcon style={ styles.menuIcon } />} />
            <Divider />
            <MenuItem style={ { ...styles.menuItem, backgroundColor: (activeContentMenuItem === 'linked') ? 'rgba(0,0,0,0.2)' : 'inherit'} } onClick={() => this._toggleContentMenuItem('linked')} leftIcon={
              <Badge
                badgeStyle={ { ...styles.menuIconBadge, backgroundColor: (linkedItemCount > 0) ? 'rgb(255, 64, 129)' : 'rgb(205, 205, 205)'  } }
                badgeContent={ linkedItemCount }
                primary={true}
              >
                <ContentLink
                  style={ styles.menuIconBadgeContainer } />
              </Badge>
            } disabled={itemHasLinkedItems} />
          </Menu>
        </Paper>
      </div>}
      { shouldLoad && !entityTimelineOpen && !provinceTimelineOpen && !epicTimelineOpen && <span>loading placeholder...</span> }
      {entityTimelineOpen
        ? <EntityTimeline history={history} newWidth={newWidth} setContentMenuItem={this._setContentMenuItem} activeContentMenuItem={activeContentMenuItem} activeAreaDim={activeAreaDim} rulerProps={metadata[activeAreaDim][rulerEntity.id]} selectedYear={selectedYear} selectedItem={selectedItem} rulerEntity={rulerEntity} sunburstData={sunburstData} linkedItems={linkedItems} />
        : provinceTimelineOpen
          ? <ProvinceTimeline metadata={metadata} selectedYear={selectedYear} provinceEntity={provinceEntity} activeArea={activeArea} />
          : epicTimelineOpen
            ? <EpicTimeline
              history={history}
              newWidth={newWidth}
              setContentMenuItem={this._setContentMenuItem}
              activeContentMenuItem={activeContentMenuItem}
              activeAreaDim={activeAreaDim}
              selectedYear={selectedYear}
              epicData={selectedItem.data}
              rulerProps={(selectedItem.data.rulerEntities || []).map(el => metadata['ruler'][el.id] )}
              linkedItems={linkedItems} />
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
