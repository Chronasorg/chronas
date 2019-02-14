import React from 'react'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { showNotification, translate } from 'admin-on-rest'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import IconEdit from 'material-ui/svg-icons/editor/mode-edit'
import IconHistory from 'material-ui/svg-icons/action/view-list'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FlatButton from 'material-ui/FlatButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import FullscreenEnterIcon from 'material-ui/svg-icons/navigation/fullscreen'
import Toggle from 'material-ui/Toggle'
import { red400 } from 'material-ui/styles/colors'
import { LoadingCircle } from '../global/LoadingCircle'
import { setRightDrawerVisibility } from '../content/actionReducers'
import utilsQuery from '../map/utils/query'
import { epicIdNameArray, themes } from '../../properties'
import {
  selectEpicItem,
  selectLinkedItem,
  selectMarkerItem,
  setData,
  TYPE_AREA,
  TYPE_EPIC,
  TYPE_LINKED,
  TYPE_MARKER,
  WIKI_PROVINCE_TIMELINE
} from '../map/actionReducers'

const jsonp = require('jsonp');

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
    height: '100%',
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
    height: '100%',
    width: '100%'
  },
  iframe: {
    width: '100%',
    height: '100%',
    right: '8px',
    padding: '38px 8px 0px'
  },
  epicInfoContainer: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    left: '16px',
    top: '0px',
    height: '56px',
  },
  actionButtonContainer: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: '4px',
    top: '6px',
    height: '42px',
  },
  fullscreenButton: {
    whiteSpace: 'nowrap',
  },
  fullscreenClose: {
    top: 4,
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: 'calc(50% - 56px)',
    height: '56px',
    color: 'rgb(107, 107, 107)'
  }
}

class ArticleIframe extends React.Component {
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
    if (currSrc.indexOf('printable=yes') === 1) {
      this.__setIFrameSource('articleIframe', currSrc + '?printable=yes')
      // document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
    this.forceUpdate()
  }
  __setIFrameSource = (cid, url) => {
    const myframe = document.getElementById(cid)
    if (myframe !== null) {
      if (myframe.src) {
        myframe.src = url
      } else if (myframe.contentWindow !== null && myframe.contentWindow.location !== null) {
        myframe.contentWindow.location = url
      } else {
        myframe.setAttribute('src', url)
      }
    }
  }
  _handleClose = () => {
    this.props.history.push('/')
    this.props.deselectItem()
    this.props.setRightDrawerVisibility(false)
    utilsQuery.updateQueryStringParameter('type', '')
    utilsQuery.updateQueryStringParameter('value', '')
  }
  _goToRevision = (modUrl, isProvince) => {
    const { selectedItem, setData, setMetadataType, selectedTypeId, selectedYear, selectAreaItemWrapper, selectLinkedItem, setMetadataEntity, selectEpicItem, selectMarkerItem, history } = this.props

    let entityId = ''
    let subentity = ''

    const contentIndexExists = typeof (selectedItem.data || {}).contentIndex !== 'undefined'
    const epicContentItem = ((selectedItem.data || {}).content || [])[(contentIndexExists ? (selectedItem.data || {}).contentIndex : -1)]

    let fModUrl = modUrl

    if (isProvince) {
      entityId = selectedTypeId.id
    } else if (selectedItem.type === 'areas' && (selectedItem.wiki === '-1' || !contentIndexExists || selectedItem.data.contentIndex === -1)) {
      subentity = (((selectedItem || {}).data || {}).id || '').split('|')[2]
    } else if (epicContentItem) {
      if (((epicContentItem || {}).properties || {}).ct === 'marker') {
        entityId = ((epicContentItem || {}).properties || {}).w
      } else if (((epicContentItem || {}).properties || {}).ct === 'metadata') {
        entityId = ((epicContentItem || {}).properties || {}).id
      } else if (((epicContentItem || {}).properties || {}).ct === 'area' && ((epicContentItem || {}).properties || {}).aeId) {
        const [ae, colorToSelect, rulerToHold] = ((epicContentItem || {}).properties || {}).aeId.split('|')
        selectAreaItemWrapper(rulerToHold, colorToSelect)
        fModUrl = '/mod/metadata'
      }
      // setMetadataType(selectedTypeId.type)
    }
    if (!entityId && !subentity) {
      entityId = (selectedItem.data || {}).id || (selectedItem.value || {})._id || selectedItem.wiki || selectedItem.value
      if (entityId.substr(1, 1) === ":") {
        entityId = entityId.substr(2)
      }
    }

    history.push('/mod/revisions?filter=%7B%22' + (entityId ? 'entity' : 'subentity') + '%22%3A%22' + (entityId || subentity) + '%22%2C%22last_seen_gte%22%3A%222018-11-08T06%3A00%3A00.000Z%22%7D')// fModUrl)
  }
  _goToMod = (modUrl, isProvince) => {
    const { selectedItem, setData, setMetadataType, selectedTypeId, selectedYear, selectAreaItemWrapper, selectLinkedItem, setMetadataEntity, selectEpicItem, selectMarkerItem, history } = this.props

    const contentIndexExists = typeof (selectedItem.data || {}).contentIndex !== 'undefined'
    const epicContentItem = ((selectedItem.data || {}).content || [])[(contentIndexExists ? (selectedItem.data || {}).contentIndex : -1)]
    let fModUrl = modUrl

    if (isProvince && selectedItem.value) {
      setMetadataEntity(selectedItem.value)
    } else if (epicContentItem) {
      if (((epicContentItem || {}).properties || {}).ct === 'marker') {
        fModUrl = '/mod/markers'
        selectMarkerItem(((epicContentItem || {}).properties || {}).w, {
          '_id': ((epicContentItem || {}).properties || {}).w,
          'name': ((epicContentItem || {}).properties || {}).n,
          'type': ((epicContentItem || {}).properties || {}).t,
          'year': ((epicContentItem || {}).properties || {}).y,
          'coo': (epicContentItem.geometry || {}).coordinates
        })
      } else if (((epicContentItem || {}).properties || {}).ct === 'metadata') {
        // setMetadataEntity(((epicContentItem || {}).properties || {}).id, true)

        selectEpicItem('modOnly', +selectedYear, ((epicContentItem || {}).properties || {}).id)

        if (epicIdNameArray.map(el => el[0]).includes(((epicContentItem || {}).properties || {}).t)) fModUrl = '/mod/linked'
      } else if (((epicContentItem || {}).properties || {}).ct === 'area' && ((epicContentItem || {}).properties || {}).aeId) {
        const [ae, colorToSelect, rulerToHold] = ((epicContentItem || {}).properties || {}).aeId.split('|')
        selectAreaItemWrapper(rulerToHold, colorToSelect)
        fModUrl = '/mod/metadata'
      }
      // setMetadataType(selectedTypeId.type)
    } else if ((selectedItem.value || {}).type === 'i' || (selectedItem.value || {}).subtype === 'ps') {
      fModUrl = '/mod/linked'
    } else if ((selectedItem.value || {}).subtype === 'ei') {
      fModUrl = '/mod/linked'
    }
    history.push(fModUrl)
  }

  constructor (props) {
    super(props)
    this.state = {
      fullfinalWiki: (props.locale === "en" && props.selectedWiki && props.selectedWiki !== -1) ? ('https://en.wikipedia.org/wiki/' + props.selectedWiki) : -1,
      localizedArticle: false,
      isFullScreen: false,
      iframeLoading: true,
      iframeLoadingFull: true,
    }
  }

  componentWillMount () {
    const { locale, selectedWiki } = this.props
    // https://www.wikidata.org/w/api.php?action=wbgetentities&titles=Vietnamese_Wikipedia&sites=enwiki&format=json
    if (locale !== "en" && selectedWiki && selectedWiki !== -1) {
      jsonp('https://www.wikidata.org/w/api.php?action=wbgetentities&titles=' + selectedWiki + '&sites=enwiki&format=json&callback=JSON_CALLBACK', null, (err, data) => {
        if (err) {
          this.props.showNotification('pos.localeWikiNotFound', 'confirm')
          this.setState({
            fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
          })
        } else {
          const wikiLabelKey = (Object.keys((data || {}).entities) || {})[0]
          const wikiLabel = (((data.entities[wikiLabelKey] || {}).labels || {})[locale] || {}).value
          if (wikiLabel) {
            this.setState({
              fullfinalWiki: 'https://' + locale + '.wikipedia.org/wiki/' + wikiLabel
            })
          } else {
            this.props.showNotification('pos.localeWikiNotFound', 'confirm')
            this.setState({
              fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
            })
          }
        }
      })
    }
  }

  componentWillReceiveProps(nextProps){
    const { locale, selectedWiki } = nextProps
    // https://www.wikidata.org/w/api.php?action=wbgetentities&titles=Vietnamese_Wikipedia&sites=enwiki&format=json
    if (this.props.selectedWiki !== selectedWiki) {
      if (locale === "en") {
        this.setState({
          iframeLoading: true,
          fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
        })
      } else {
        jsonp('https://www.wikidata.org/w/api.php?action=wbgetentities&titles=' + selectedWiki + '&sites=enwiki&format=json&callback=JSON_CALLBACK', null, (err, data) => {
          if (err) {
            this.props.showNotification('pos.localeWikiNotFound', 'confirm')
            this.setState({
              fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
            })
          } else {
            const wikiLabelKey = (Object.keys((data || {}).entities) || {})[0]
            const wikiLabel = (((data.entities[wikiLabelKey] || {}).labels || {})[locale] || {}).value
            if (wikiLabel) {
              this.setState({
                fullfinalWiki: 'https://' + locale + '.wikipedia.org/wiki/' + wikiLabel
              })
            } else {
              this.props.showNotification('pos.localeWikiNotFound', 'confirm')
              this.setState({
                fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
              })
            }
          }
        })

        this.setState({
          iframeLoading: true,
          fullfinalWiki: -1
        })
      }
    }
  }

  render () {
    const { isFullScreen, fullfinalWiki, iframeLoading, iframeLoadingFull } = this.state
    const { hasChart, selectedItem, theme, isEntity, customStyle, htmlContent, translate, toggleYearByArticle, toggleYearByArticleDisabled, yearByArticleValue } = this.props

    const isMarker = selectedItem.type === TYPE_MARKER
    const contentIndexExists = typeof (selectedItem.data || {}).contentIndex !== 'undefined'
    const epicContentItem = ((selectedItem.data || {}).content || [])[(contentIndexExists ? (selectedItem.data || {}).contentIndex : -1)]
    const isMedia = selectedItem.type === TYPE_LINKED
    const isArea = selectedItem.type === TYPE_AREA
    const isEpic = selectedItem.type === TYPE_EPIC
    const isEpicInfo = selectedItem.value.subtype === 'ei'
    const potentialSource = ((selectedItem.value || {}).data || {}).source || (selectedItem.value || {}).source
    const isPsWithSource = selectedItem.value.subtype === 'ps' && (potentialSource || '').indexOf('wikisource') > -1
    const isProvince = selectedItem.wiki === WIKI_PROVINCE_TIMELINE
    const noWiki = (!selectedItem || !fullfinalWiki || fullfinalWiki === -1)
    const modUrl = isEpic || isArea
      ? (((epicContentItem || {}).properties || {}).ct === 'marker' ? '/mod/markers' : (isArea ? '/mod/metadata' : (isEpic ? '/mod/linked' : '/mod/links')))
      : (isMarker ? '/mod/markers' : '/mod/metadata')

    // epicContentItem
    // ? (epicContentItem.ct === "marker" ? '/mod/markers' : (isArea ? '/mod/metadata' : (isEpic ? '/mod/linked' : '/mod/links')))
    // : (isMarker ?  '/mod/markers' : '/mod/metadata')

    const modMenu = <div>{isEpicInfo
      ? <div style={styles.epicInfoContainer}><img className='tsTicks discoveryIcon articleEpic'
        src='/images/transparent.png' /><h6
          style={{ paddingLeft: 40, paddingTop: 22 }}>{translate('pos.markerMetadataTypes.ei')}</h6></div> : isPsWithSource
        ? <div style={styles.epicInfoContainer}>

          <FlatButton
            backgroundColor={themes[theme].highlightColors[0]}
            hoverColor={themes[theme].foreColors[0]}
            color={themes[theme].backColors[0]}
            style={{ margin: 12, marginLeft: -8, marginTop: 8, color: themes[theme].backColors[0] }}
            label={translate("pos.readDocument")}
            labelPosition='before'
            primary
            onClick={() => window.open(decodeURIComponent(potentialSource), '_blank').focus()}
            icon={<IconOutbound color={themes[theme].backColors[0]} />}
          /></div> : null}
      <div style={!(isMarker || isMedia || !hasChart) ? {
      ...styles.actionButtonContainer,
      top: 254
    } : (!hasChart && isEntity) ? {
        ...styles.actionButtonContainer,
        top: 60
      } : (isProvince) ? { ...styles.actionButtonContainer, top: 332 } : {
      ...styles.actionButtonContainer,
      backgroundColor: themes[theme].backColors[0]
    }}>
        {toggleYearByArticle && <Toggle
          label={translate("pos.setYearByArticle")}
          disabled={toggleYearByArticleDisabled}
          onToggle={() => toggleYearByArticle()}
          defaultToggled={yearByArticleValue}
          style={{
          width: 'inherit',
          display: 'inline-block',
          position: 'relative',
          top: 5
        }}
      />}
        <IconButton
          tooltipPosition='bottom-left'
          tooltip={translate('aor.action.edit')}
          style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px' }}
          onClick={() => this._goToMod(modUrl, isProvince)}>
          <IconEdit style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>
        <IconButton
          tooltipPosition='bottom-left'
          tooltip={translate('pos.revisionHistory')}
          style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px' }}
          onClick={() => this._goToRevision(modUrl, isProvince)}>
          <IconHistory style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>
        <IconButton
          tooltipPosition='bottom-left'
          tooltip={translate('pos.fullscreenArticle')}
          onClick={() => this._enterFullscreen()}
          style={{ ...styles.fullscreenButton, width: !(isEntity || isProvince) ? 32 : 'inherit' }}>
          <FullscreenEnterIcon style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>
        {!(isEntity || isProvince) && <IconButton
          tooltipPosition='bottom-left'
          tooltip={translate('aor.action.back')}
          style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px' }}
          onClick={() => this.props.history.goBack()}>
          <IconBack style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>}
        {!(isEntity || isProvince) && <IconButton
          tooltipPosition='bottom-left'
          tooltip={translate("aor.action.close")}
          style={{}} iconStyle={{ textAlign: 'right', fontSize: '12px' }} onClick={() => this._handleClose()}>
          <IconClose style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>}
      </div>
    </div>

    const shouldLoad = !htmlContent && (noWiki || iframeLoading || fullfinalWiki === null || +fullfinalWiki === -1)

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
          {(fullfinalWiki !== '') && shouldLoad && <LoadingCircle theme={theme} title={translate('pos.loading')} />}
          {(fullfinalWiki === '') &&
          <span>no wiki article found, consider adding one by clicking the edit button...</span>}
          {(+fullfinalWiki !== -1) && (fullfinalWiki !== '') && (fullfinalWiki !== null) &&
          <iframe id='articleFullIframe' onLoad={this._handlFullURLChange} height='100%' width='100%'
            style={{ height: '100%', width: '100%', display: (shouldLoad ? 'none' : '') }}
            src={fullfinalWiki} frameBorder='0' />}
          {isFullScreen &&
          <FloatingActionButton
            backgroundColor={'white'}
            style={styles.fullscreenClose}
            key={'close'}
            onClick={this._exitFullscreen}
            color={'rgb(107, 107, 107)'}
            iconStyle={{ fill: 'rgb(107, 107, 107)' }}
          >
            <CloseIcon color={'rgb(107, 107, 107)'} hoverColor={themes[theme].highlightColors[0]} />
          </FloatingActionButton>
          }
        </Dialog>
        {modMenu}
        {shouldLoad && <LoadingCircle theme={theme} title={translate('pos.loading')} />}
        {htmlContent && <div style={{ 'padding': '1em' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        {!htmlContent && (+fullfinalWiki !== -1) && (fullfinalWiki !== '') && (fullfinalWiki !== null) &&
        <iframe id='articleIframe' onLoad={this._handleUrlChange}
          style={{ ...styles.iframe, display: (shouldLoad ? 'none' : ''), height: (!hasChart && isEntity ? 'calc(100% - 56px)' : '100%') }}
          src={fullfinalWiki +  '?printable=yes'} height='100%'
          frameBorder='0' />}
      </div>
    )
  }
}

//
const enhance = compose(
  connect(state => ({
    theme: state.theme,
    selectedYear: state.selectedYear,
  }), {
    setRightDrawerVisibility,
    setData,
    selectEpicItem,
    selectMarkerItem,
    selectLinkedItem,
    showNotification
  }),
  pure,
  translate,
)

export default enhance(ArticleIframe)
