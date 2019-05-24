import React from 'react'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { showNotification, translate } from 'admin-on-rest'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import BookmarkOffIcon from 'material-ui/svg-icons/action/bookmark-border'
import BookmarkOnIcon from 'material-ui/svg-icons/action/bookmark'
import IconEdit from 'material-ui/svg-icons/editor/mode-edit'
import IconHistory from 'material-ui/svg-icons/action/view-list'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconOpenEpic from 'material-ui/svg-icons/action/open-in-browser'
import IconOpenInNew from 'material-ui/svg-icons/action/open-in-new'
import IconFlagged from 'material-ui/svg-icons/content/flag'
import IconFlaggedAlert from 'material-ui/svg-icons/action/report-problem'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FlatButton from 'material-ui/FlatButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import FullscreenEnterIcon from 'material-ui/svg-icons/navigation/fullscreen'
import RaisedButton from 'material-ui/RaisedButton'
import Toggle from 'material-ui/Toggle'
import { red400 } from 'material-ui/styles/colors'
import { LoadingCircle } from '../global/LoadingCircle'
import { setRightDrawerVisibility } from '../content/actionReducers'
import { updateUserScore } from '../menu/authentication/actionReducers'
import utilsQuery from '../map/utils/query'
import {aeIdNameArray, epicIdNameArray, properties, themes} from '../../properties'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import {
  collectionUpdated, deselectItem, selectAreaItem,
  selectCollectionItem,
  selectEpicItem,
  selectLinkedItem,
  selectMarkerItem,
  setData,
  TYPE_AREA, TYPE_COLLECTION,
  TYPE_EPIC,
  TYPE_LINKED,
  TYPE_MARKER,
  WIKI_PROVINCE_TIMELINE
} from '../map/actionReducers'
import axios from "axios/index";
import utils from "../map/utils/general";
import {changeColor} from "../menu/layers/actionReducers";

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
    height: 'calc(100% - 8px)',
    // right: '8px',
    padding: '38px 8px 0px'
  },
  epicInfoContainer: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    left: '16px',
    top: '0px',
    height: '56px',
  },
  actionButtonContainerLeft: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    left: '4px',
    top: '6px',
    height: '42px',
    zIndex: 10,
  },
  actionButtonContainer: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: '4px',
    top: '6px',
    height: '42px',
    zIndex: 10,
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
const bookmarkDialog = (isOpen, handleClose, addTo, privateCollections, addNewCollection) => {
  const filteredPrivateCollections = privateCollections ? privateCollections.filter(el => el.title !== "Bookmarks") : []
  return <Dialog
    title="Add Article To Your Collection..."
    modal={false}
    open={isOpen}
    onRequestClose={handleClose}
    autoScrollBodyContent={true}
  >
    <List>
      <ListItem onClick={() => { addTo("bookmark"); handleClose(); }} primaryText="Bookmark" />
      <Divider />
      { filteredPrivateCollections.map(el => <ListItem onClick={() => { addTo(el._id); handleClose(); }} primaryText={el.title} /> )}
      <p style={{ marginTop: '1em' }}>- or - </p>
      <RaisedButton label={"Create new collection"} onClick={addNewCollection} />
    </List>
  </Dialog>
}

class ArticleIframe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      bookmarkDialogOpen: false,
      flagged: false,
      fullfinalWiki: (props.locale === "en" && props.selectedWiki && props.selectedWiki !== -1) ? ('https://en.wikipedia.org/wiki/' + props.selectedWiki) : -1,
      localizedArticle: false,
      isFullScreen: false,
      iframeLoading: true,
      privateCollections: false,
      iframeLoadingFull: true,
    }
  }
  _addNewCollection = () => {
    const { selectCollectionItem, history } = this.props
    selectCollectionItem(false, false)
    history.push('/mod/linked/create')
  }
  _openBookmarkDialog = () => {
    const username = localStorage.getItem('chs_username')
    this.setState({ bookmarkDialogOpen: true })
    axios.get(properties.chronasApiHost + '/collections?onlyPrivate&username=' + username, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}})
      .then((collections) => {
        const collectionsData = collections.data

        this.setState({
          privateCollections: collectionsData[0]
        })
      })
  }
  _toggleBookmark = (collId) => {
    const username = localStorage.getItem('chs_username')
    const { collectionUpdated, selectedItem, selectedWiki, showNotification, theme } = this.props
    // const toBookmark = (selectedItem.type + ':' + selectedWiki)
    const bookmarks = (localStorage.getItem('chs_bookmarks') || '').split(',')
    const potentialAE = (((selectedItem.data || {}).id || '').split(':') || [])[1] || ''
    const toBookmark = (selectedItem.type === TYPE_AREA
      ? (potentialAE.split('|')[2] + '||' + (potentialAE.split('|')[0] + '|' + potentialAE.split('|')[1]))
      : (selectedItem.type === TYPE_EPIC ? (((selectedItem || {}).data || {})._id + '||' + ((selectedItem || {}).data || {}).subtype) : (selectedWiki + '||' + (selectedItem.type === TYPE_MARKER ? 'w|' : '') + ((selectedItem || {}).value || {}).subtype)))
    const bookmarked = bookmarks.indexOf(toBookmark) > -1
    // const { bookmark } = this.state
    if (!bookmarked) {
      // do POST flag encodeURIComponent(window.location.href)
      axios.put(properties.chronasApiHost + '/collections/slides/' + '?username=' + username + '&toUpdate=' + toBookmark + '&toAdd=true&collection=' + collId, {}, {
        'headers': {
          'Authorization': 'Bearer ' + localStorage.getItem('chs_token'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(() => {
          localStorage.setItem('chs_bookmarks', [ ...bookmarks, toBookmark])
          showNotification('Added to Bookmarks')
          this.props.updateUserScore(1)
          collectionUpdated()
          document.querySelector(".collectionMenuIcon svg").style.color = themes[theme].highlightColors[0]
          setTimeout(() => document.querySelector(".collectionMenuIcon svg").style.color = themes[theme].foreColors[0], 1000)
          this.forceUpdate()
        })
        .catch((err) => {
          console.error(err)
          showNotification('somethingWentWrong')
        })
    } else {
      // do DELETE flag
      axios.put(properties.chronasApiHost + '/collections/slides/' + '?username=' + username + '&toUpdate=' + toBookmark + '&toAdd=false&collection=' + collId, {}, {
        'headers': {
          'Authorization': 'Bearer ' + localStorage.getItem('chs_token'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(() => {
          localStorage.setItem('chs_bookmarks', bookmarks.filter(el => toBookmark !== el))
          showNotification('Removed from Bookmarks')
          collectionUpdated()
          document.querySelector(".collectionMenuIcon svg").style.color = themes[theme].highlightColors[0]
          setTimeout(() => document.querySelector(".collectionMenuIcon svg").style.color = themes[theme].foreColors[0], 1000)
          this.forceUpdate()
        })
        .catch((err) => {
          console.error(err)
          showNotification('somethingWentWrong')
        })
    }
  }

  _selectStepButton = (stepItem) => {
      const { selectEpicItem, selectedYear } = this.props
      const aeId = stepItem.aeId
      const newYear = stepItem.y && (stepItem.y !== selectedYear) && stepItem.y
      if (epicIdNameArray.map(el => el[0]).includes(stepItem.t)) {
        selectEpicItem(stepItem.w, (!newYear || isNaN(newYear)) ? +selectedYear : +newYear, stepItem.id)
      } else if (aeId) {
        const [ae, colorToSelect, rulerToHold] = aeId.split('|')
        this._selectAreaItem(rulerToHold, colorToSelect, true)
      }
  }

  _selectAreaItem = (rulerToHold, colorToSelect, doChangeColor = false) => {
    const { activeArea, changeColor, selectAreaItem } = this.props
    const nextData = activeArea.data
    const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold)
    if (provinceWithOldRuler) {
      selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
      if (doChangeColor && colorToSelect !== activeArea.color) {
        changeColor(colorToSelect)
      }
    }
  }

  _toggleFlag = () => {
    const { selectedItem, selectedWiki } = this.props
    const { flagged } = this.state
    const fullUrl = encodeURIComponent(window.location.href)
    if (!flagged) {
      // do POST flag encodeURIComponent(window.location.href)
      axios.post(properties.chronasApiHost + '/flags', {
        fullUrl: fullUrl,
        resource: selectedItem.type,
        subEntityId: (selectedItem.value || {}).id || selectedItem.value,
        wrongWiki: selectedWiki
      })
        .then(() => {
          this.props.showNotification('pos.feedbackSuccess')
          this.props.updateUserScore(1)
        })
        .catch((err) => {
          console.error(err)
          this.props.showNotification('somethingWentWrong')
        })
    } else {
      // do DELETE flag
      axios.delete(properties.chronasApiHost + `/flags/${fullUrl}`)
      this.props.showNotification('Unflagged')
    }

    this.setState({ flagged: !flagged })
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
    }
    else if (selectedItem.type === TYPE_COLLECTION) {
      fModUrl = '/mod/linked'
    }
    else if (epicContentItem) {
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
    }
    else if ((selectedItem.value || {}).type === 'i' || (selectedItem.value || {}).subtype === 'ps') {
      fModUrl = '/mod/linked'
    }
    else if ((selectedItem.value || {}).subtype === 'ei') {
      fModUrl = '/mod/linked'
    }
    history.push(fModUrl)
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

  componentDidMount() {
    window.addEventListener('keyup', this._handleEsc, {passive: true})
  }
  componentWillUnmount() {
    window.removeEventListener('keyup', this._handleEsc)
  }

  _handleEsc = (e) => {
    if (e.key === "Escape") this._handleClose()
  }

  componentWillReceiveProps(nextProps){
    const { locale, selectedWiki } = nextProps
    // https://www.wikidata.org/w/api.php?action=wbgetentities&titles=Vietnamese_Wikipedia&sites=enwiki&format=json
    if (this.props.selectedWiki !== selectedWiki) {
      this.setState({ flagged: false })
      if (locale === "en") {
        this.setState({
          iframeLoading: true,
          fullfinalWiki: 'https://en.wikipedia.org/wiki/' + selectedWiki
        })
      }
      else {
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
    const { bookmarkDialogOpen, isFullScreen, fullfinalWiki, iframeLoading, flagged, iframeLoadingFull, privateCollections } = this.state
    const { hasChart, selectedItem, theme, isEntity, customStyle, htmlContent, selectedWiki, translate, toggleYearByArticle, toggleYearByArticleDisabled, yearByArticleValue } = this.props

    const bookmarks = (localStorage.getItem('chs_bookmarks') || '').split(',')
    const potentialAE = (((selectedItem.data || {}).id || '').split(':') || [])[1] || ''
    const toBookmark = (selectedItem.type === TYPE_AREA
      ? (potentialAE.split('|')[2] + '||' + (potentialAE.split('|')[0] + '|' + potentialAE.split('|')[1]))
      : selectedWiki + '||' + (selectedItem.type === TYPE_MARKER ? 'w|' : '') + ((selectedItem || {}).value || {}).subtype)
    const bookmarked = bookmarks.indexOf(toBookmark) > -1
    const isMarker = selectedItem.type === TYPE_MARKER
    const isCollection = selectedItem.type === TYPE_COLLECTION
    const contentIndexExists = typeof (selectedItem.data || {}).contentIndex !== 'undefined'
    const epicContentItem = ((selectedItem.data || {}).content || [])[(contentIndexExists ? (selectedItem.data || {}).contentIndex : -1)]
    const isMedia = selectedItem.type === TYPE_LINKED
    const isArea = selectedItem.type === TYPE_AREA
    const isEpic = selectedItem.type === TYPE_EPIC
    const isEpicInfo = selectedItem.value.subtype === 'ei'
    const potentialSource = ((selectedItem.value || {}).data || {}).source || (selectedItem.value || {}).source
    const isPsWithSource = selectedItem.value.subtype === 'ps' && (potentialSource || '').indexOf('wikisource') > -1
    const isProvince = selectedItem.wiki === WIKI_PROVINCE_TIMELINE
    const noWiki = (!selectedItem || !fullfinalWiki || fullfinalWiki === null || fullfinalWiki === -1 || fullfinalWiki === "https://en.wikipedia.org/wiki/-1")
    const modUrl = isEpic || isArea
      ? (((epicContentItem || {}).properties || {}).ct === 'marker' ? '/mod/markers' : (isArea ? '/mod/metadata' : (isEpic ? '/mod/linked' : '/mod/links')))
      : (isMarker ? '/mod/markers' : '/mod/metadata')
    const hasContentBar = (isArea || isEpic) && ((selectedItem.data || {}).content || []).length > 0
    let stepIndex, stepItem
    if (isCollection) {
      stepIndex = (selectedItem.data || {}).stepIndex
      stepItem = (((selectedItem.data || {}).content || [])[stepIndex] || {}).properties

      if ((stepItem && epicIdNameArray.concat(aeIdNameArray).map(el => el[0]).includes(stepItem.t) && stepItem.t !== 'ei')) console.debug('truuuuuuuuu')
      else console.debug('false')
    }

    const modMenu = <div>{isEpicInfo
      ? <div style={styles.epicInfoContainer}><img className='tsTicks discoveryIcon articleEpic'
        src='/images/transparent.png' /><h6
          style={{ paddingLeft: 40, paddingTop: 22 }}>{translate('pos.markerMetadataTypes.ei')}</h6></div> : isPsWithSource
        ? <div style={styles.epicInfoContainer}>
          <FlatButton
            backgroundColor={themes[theme].highlightColors[0]}
            hoverColor={themes[theme].foreColors[0]}
            color={themes[theme].backColors[0]}
            style={{ margin: 12, left: 4, position: 'absolute', color: themes[theme].backColors[0] }}
            label={translate("pos.readDocument")}
            labelPosition='before'
            primary
            onClick={() => window.open(decodeURIComponent(potentialSource), '_blank').focus()}
            icon={<IconOpenInNew color={themes[theme].backColors[0]} />}
          /></div> : null}
      { <div style={!(isMarker || isMedia || !hasChart) ? {
        ...styles.actionButtonContainerLeft,
        left: hasContentBar ? 'calc(19% + 8px)' : '4px',
        top: 254
      } : (!hasChart && isEntity) ? {
        ...styles.actionButtonContainerLeft,
        left: hasContentBar ? 'calc(19% + 8px)' : '4px',
        top: 60
      } : (isProvince) ? { ...styles.actionButtonContainerLeft, top: 332 }
        : {
        ...styles.actionButtonContainerLeft,
          right: hasContentBar ? 'calc(19% + 8px)' : '4px',
        backgroundColor: themes[theme].backColors[0]
      }}>
        { !isCollection ? <IconButton
          tooltipPosition='bottom-center'
          tooltip={translate(bookmarked ? 'pos.unbookmark' : 'pos.bookmark')}
          style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px' }}
          onClick={this._openBookmarkDialog}>
          {bookmarked ? <BookmarkOnIcon color={themes[theme].highlightColors[0]} /> : <BookmarkOffIcon color={themes[theme].highlightColors[0]} />}
        </IconButton> : (stepItem && epicIdNameArray.concat(aeIdNameArray).map(el => el[0]).includes(stepItem.t) && stepItem.t !== 'ei') ? <FlatButton
          onClick={() => this._selectStepButton(stepItem)}
          style={{
            height: 36,
            minWidth: 36,
            padding: 6,
            left: 4,
            zIndex: 100,
            float: 'right',
            position: 'absolute'
          }}
          // style={{...styles.buttonOpenArticle, zIndex: 1000, padding: 0, position: 'absolute', top: 15 }}
          tooltipPosition='bottom-left'
          tooltip={translate('pos.openEpic')}
          icon={<IconOpenEpic color={themes[theme].highlightColors[0]} style={{ height: 30 }} />} /> : null }
      </div> }
      <div style={!(isMarker || isCollection || isMedia || !hasChart) ? {
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
          tooltipPosition='bottom-center'
          tooltip={translate(flagged ? 'pos.unflag' : 'pos.flag')}
          style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px' }}
          onClick={this._toggleFlag}>
          {flagged ? <IconFlaggedAlert color={'#fd2a00'} hoverColor={themes[theme].highlightColors[0]} /> : <IconFlagged color={'rgb(152, 70, 54)'} hoverColor={themes[theme].highlightColors[0]} />}
        </IconButton>
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
          tooltip={translate('pos.openArticleInNewTab')}
          onClick={() => { const win = window.open(fullfinalWiki, '_blank'); win.focus();}}
          style={{ width: 32, marginRight: -8, zIndex: 10 }} iconStyle={{ textAlign: 'right', width: '20px', height: '20px', fontSize: '12px' }}>
          <IconOpenInNew style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
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
          style={{}} iconStyle={{ textAlign: 'right', fontSize: '12px' }} onClick={this._handleClose}>
          <IconClose style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>}
      </div>
    </div>

    const shouldLoad = !htmlContent && (noWiki || iframeLoading)

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
        {bookmarkDialog(bookmarkDialogOpen, () => this.setState({ bookmarkDialogOpen: false }), this._toggleBookmark, privateCollections, this._addNewCollection)}
        {modMenu}
        {shouldLoad && <LoadingCircle theme={theme} title={translate('pos.loading')} />}
        {htmlContent && typeof htmlContent === "string" && <div style={{ 'padding': '1em', paddingTop: '2em' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        {htmlContent && htmlContent}
        {!htmlContent && (+fullfinalWiki !== -1) && (fullfinalWiki !== '') && (fullfinalWiki !== null) &&
        <iframe id='articleIframe' onLoad={this._handleUrlChange}
          style={{ ...styles.iframe, display: (shouldLoad ? 'none' : ''), height: (!hasChart && isEntity ? 'calc(100% - 56px)' : 'calc(100% - 8px)') }}
          src={fullfinalWiki +  '?printable=yes'}
          frameBorder='0' />}
      </div>
    )
  }
}

//
const enhance = compose(
  connect(state => ({
    activeArea: state.activeArea,
    theme: state.theme,
    selectedYear: state.selectedYear,
  }), {
    changeColor,
    selectAreaItem,
    collectionUpdated,
    setRightDrawerVisibility,
    setData,
    selectCollectionItem,
    selectEpicItem,
    selectMarkerItem,
    selectLinkedItem,
    updateUserScore,
    showNotification
  }),
  pure,
  translate,
)

export default enhance(ArticleIframe)
