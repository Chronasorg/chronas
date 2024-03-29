import React, { createElement, PureComponent } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Drawer from 'material-ui/Drawer'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconArrowLeft from 'material-ui/svg-icons/navigation/chevron-left'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Link, Route, Switch } from 'react-router-dom'
import pure from 'recompose/pure'
import axios from 'axios'
import { Restricted, showNotification, translate } from 'admin-on-rest'
import { LoadingCircle } from '../global/LoadingCircle'
import { setRightDrawerVisibility, toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { grey600 } from '../../styles/chronasColors'
import Responsive from '../menu/Responsive'
import Content from './Content'
import { UserCreate, UserDelete, UserEdit, UserList } from '../restricted/users'
import { ModLinksEdit } from './mod/ModLinksEdit'
import { ModAreasAll } from './mod/ModAreasAll'
import { ModAreasReplace } from './mod/ModAreasReplace'
import { ModMetaAdd } from './mod/ModMetaAdd'
import { ModMetaEdit } from './mod/ModMetaEdit'
import { MarkerCreate, MarkerDelete, MarkerEdit } from '../restricted/markers'
import { LinkedCreate, LinkedDelete, LinkedEdit } from '../restricted/linked'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import SelectField from 'material-ui/SelectField'
import FlatButton from 'material-ui/FlatButton'
import MenuItem from 'material-ui/MenuItem'
import { BottomNavigation } from 'material-ui/BottomNavigation'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconDrag from 'material-ui/svg-icons/editor/drag-handle'
import IconList from 'material-ui/svg-icons/action/list'
import IconFlags from 'material-ui/svg-icons/content/flag'
import BottomNavigationItem from '../overwrites/BottomNavigationItem'
import { MetadataDelete } from '../restricted/metadata'
import { RevisionList } from '../restricted/revisions'
import { FlagList } from '../restricted/flags'
import {
  deselectItem as deselectItemAction,
  selectAreaItem,
  selectEpicItem,
  selectLinkedItem,
  selectMarkerItem,
  selectValue,
  setFullItem,
  setData,
  setWikiId,
  TYPE_AREA,
  TYPE_COLLECTION,
  TYPE_EPIC,
  TYPE_LINKED,
  TYPE_MARKER,
  WIKI_PROVINCE_TIMELINE
} from '../map/actionReducers'
import { setYear } from '../map/timeline/actionReducers'
import { CultureIcon, ProvinceIcon, ReligionGeneralIcon, RulerIcon } from '../map/assets/placeholderIcons'
import { ModHome } from './mod/ModHome'
import {
  setModData as setModDataAction,
  setModDataLat as setModDataLatAction,
  setModDataLng as setModDataLngAction
} from './../restricted/shared/buttons/actionReducers'
import utilsQuery from '../map/utils/query'
import { changeColor, setAreaColorLabel } from '../menu/layers/actionReducers'
import utils from '../map/utils/general'
import { epicIdNameArray, properties, themes } from '../../properties'

const nearbyIcon = <EditIcon />

const styles = {
  articleHeader: {
    width: 'calc(100$ - 140px)',
    height: '56px',
    overflow: 'hidden'
  },
  chevIcon: {
    width: 24,
    height: 24
  },
  chevContainer: {
    position: 'relative',
    top: '-5px',
    width: 24,
    height: 24,
    padding: 0
  },
  cardArticle: {
    paddingBottom: '0px',
    color: 'rgba(0, 0, 0, 0.87)',
    transition: 'transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    boxSizing: 'border-box',
    fontFamily: 'Cinzel, serif',
    boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    height: 'calc(40% - 40px)',
    width: '2254px',
    minWidth: '238px',
    position: 'fixed',
    zIndex: '1300',
    left: 'auto',
    top: '20px',
    transform: 'translate(0px, 0px)',
    right: '20px',
    borderRadius: '2px'
  },
  iconElementRightStyle: {
    position: 'fixed',
    whiteSpace: 'nowrap',
    right: 0,
    height: 56
  },
  menuButtons: {
    margin: 12,
    color: '#fff',
  },
  dialogStyle: {
    width: 'calc(100% - 64px)',
    height: '100%',
    maxWidth: 'calc(100% - 64px)',
    maxHeight: 'none',
    left: 32,
    top: 0,
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    paddingTop: 0
  },
  partOfDiv: {
    position: 'fixed',
    right: '60px',
    background: 'white',
    boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)',
    zIndex: '1',
    borderRadius: '4px'
  },
  cardHeader: {
    titleStyle: {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: 100,
      textAlign: 'left'
    },
    textStyle: {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },
    style: {
      whiteSpace: 'nowrap',
      textAlign: 'left',
      padding: 0
    }
  },
  draggableButtonDiv: {
    minWidth: '60px',
    position: 'absolute',
    top: 'calc(50% - 20px)',
    marginLeft: '-43px',
    transform: 'rotate(90deg)',
    zIndex: 10002
  },
  draggableButton: {
    cursor: 'ew-resize',
    boxShadow: '5px -5px 8px 0px rgba(0, 0, 0, 0.31)',
    height: '20px',
    lineHeight: '20px'
  }
}

const selectedIndexObject = {
  'ruler': 1,
  'culture': 2,
  'religion': 3,
  'religionGeneral': 4,
}

const resources = {
  areas: { edit: ModAreasAll, permission: 1 },
  areasReplace: { edit: ModAreasReplace, permission: 1 },
  linked: { create: LinkedCreate, edit: LinkedEdit, remove: LinkedDelete, permission: 1 },
  markers: { create: MarkerCreate, edit: MarkerEdit, remove: MarkerDelete, permission: 1 },
  metadata: { create: ModMetaAdd, edit: ModMetaEdit, remove: MetadataDelete, permission: 1 },
  revisions: { list: RevisionList },
  flags: { list: FlagList },
  // images: { create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 1 },
  // users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 11 },
}

const menuIndexByLocation = {
  '/mod/markers/create': 0,
  '/mod/markers': 0,
  '/mod/linked/create': 0,
  '/mod/linked': 0,
  '/mod/links': 0,
  '/mod/metadata/create': 1,
  '/mod/metadata': 1,
  '/mod/areas': 1,
  '/mod/areasReplace': 1
}

class RightDrawerRoutes extends PureComponent {
  setLinkedItemData = ({ linkedItemType1 = false, linkedItemType2 = false, linkedItemKey1 = false, linkedContent = false, linkedMedia = false } = {}) => {
    const prevLinkedItemData = this.state.linkedItemData

    if (linkedItemType1) prevLinkedItemData.linkedItemType1 = linkedItemType1 // "Albert_Einstein|politicians"
    if (linkedItemType2) prevLinkedItemData.linkedItemType2 = linkedItemType2
    if (linkedItemKey1) prevLinkedItemData.linkedItemKey1 = linkedItemKey1
    if (linkedContent) prevLinkedItemData.linkedContent = linkedContent
    if (linkedMedia) prevLinkedItemData.linkedMedia = linkedMedia

    this.setState({ linkedItemData: prevLinkedItemData })
  }
  setMetadataType = (metadataType, metadataEntity = false) => {
    if (metadataEntity !== 'province') { this.setState({ metadataType, metadataEntity: '' }) }
    else { this.setState({ metadataType }) }
  }
  actOnRootTypeChange = (contentTypeRaw) => {
    const { location, history } = this.props

    if (contentTypeRaw === 'ce' && ((window.location || {}).host || '').substr(0, 4) !== "edu.") {
      // window.location.href="https://edu.chronas.org" +  window.location.search +  window.location.hash
    }

    this.setState({ contentTypeRaw })
    const contentType = (contentTypeRaw.substr(0, 2) === 'w|') ? 'markers' : 'metadata'
    if (contentType === 'markers' && location.pathname.indexOf(contentType) === -1 && location.pathname.indexOf('/mod') !== -1) {
      history.push(location.pathname.replace('linked', 'markers'))
    } else if (contentType === 'metadata' && location.pathname.indexOf('linked') === -1 && location.pathname.indexOf('/mod') !== -1) {
      history.push(location.pathname.replace('markers', 'linked'))
    }
  }
  setContentType = (contentTypeFull) => {
    const contentType = (contentTypeFull.substr(0, 2) === 'w|') ? 'markers' : 'metadata'
    this.setState({ contentType, contentChoice: [] })
  }
  setSearchEpic = (searchText) => {
    // contentChoice
    if (searchText.length > 3) {
      if (!this.state.isFetchingSearch || new Date().getTime() - this.state.isFetchingSearch > 3000) {
        this.setState({ isFetchingSearch: new Date().getTime() })
        axios.get(properties.chronasApiHost + '/metadata?type=e&search=' + searchText)
          .then(response => {
            this.setState({
              isFetchingSearch: false,
              epicsChoice: response.data.map((el) => {
                return { id: el, name: el }
              })
            })
          })
          .catch(() => {
            this.setState({ isFetchingSearch: false, epicsChoice: [] })
          })
      }
    } else {
      this.setState({ searchText })
    }
  }
  setSearchSnippet = (searchText, contentTypeRaw = false, stateItem = false, includeMarkers = true, forCollections = false) => {
    // contentChoice
    if (searchText.length > 2) {
      if (!this.state.isFetchingSearch || new Date().getTime() - this.state.isFetchingSearch > 3000) {
        this.setState({ isFetchingSearch: new Date().getTime() })
        axios.get(properties.chronasApiHost + '/markers?both=true&search=' + searchText + '&includeMarkers=' + includeMarkers + '&count=' + 100)
          .then(response => {
            if (stateItem) {
              const newlinkedItemData = this.state.linkedItemData
              newlinkedItemData[stateItem] = response.data.map((el) => {
                return forCollections ? { id: el[0] + '||' + el[2], name: el[1], suggest: properties.typeToDescriptedType[el[2]] + ": " + el[1], category: properties.typeToDescriptedType[el[2]] } : { id: el[0] + '||' + el[2], name: properties.typeToDescriptedType[el[2]] + ': ' + el[1] }
              })

              this.setState({
                isFetchingSearch: false,
                linkedItemData: newlinkedItemData
              })
            } else {
              this.setState({
                isFetchingSearch: false,
                contentChoice: response.data.map((el) => {
                  return forCollections ? { id: el[0] + '||' + el[2], name: el[1], suggest: properties.typeToDescriptedType[el[2]] + ": " + el[1], category: properties.typeToDescriptedType[el[2]] } : { id: el[0] + '||' + el[2], name: properties.typeToDescriptedType[el[2]] + ': ' + el[1] }
                })
              })
            }
          })
          .catch(() => {
            this.setState({ isFetchingSearch: false, contentChoice: [] })
          })
      }
    } else {
      this.setState({ searchText })
    }
  }
  routeNotYetSetup = () => {
    const { activeArea, location, selectedItem } = this.props
    const oldrouteKey = this.state.routeKey
    const newrouteKey = location.pathname + activeArea.color + selectedItem.value + (((selectedItem || {}).data || {}).id || '')

    if (oldrouteKey === newrouteKey) {
      return false
    } else {
      this.setState({ routeKey: newrouteKey })
      return true
    }
  }
  ensureLoadLinkedItem = (newLinkKey, forced = false) => {
    // const { activeArea, location, selectedItem } = this.props
    const oldLinkKey = this.state.linkSetup

    // if (this.state.metadataType === 'e' && metadataEntity !== this.state.metadataEntity) {
    if (oldLinkKey === newLinkKey && !forced) {
      return false
    } else {
      this.setState({ linkSetup: newLinkKey })

      if (newLinkKey) {
        const newArr1 = newLinkKey.split('||')
        axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=' + ((properties.markersTypes.includes(newArr1[1])) ? '0:' : '1:') + window.encodeURIComponent(((newArr1[1].indexOf('ae|') > -1) ? (newArr1[1] + '|') : '') + (newArr1[0] || "").replaceAll('.','^')))
          .then((res) => {
            if (res.status === 200) {
              const linkedItemResult = res.data
              const linkedItemData = this.state.linkedItemData

              linkedItemData.linkedMedia = []
              linkedItemData.linkedContent = []

              linkedItemResult['map'].forEach((el) => {
                linkedItemData.linkedContent.push(((el.properties.t || '').indexOf('ae|') > -1) ? (el.properties.aeId.split('|')[2] + '||' + el.properties.t) : el.properties.w + '||' + (el.properties.ct === 'marker' ? 'w|' : '') + el.properties.t)
                // linkedItemData.linkedMedia.push({ name: (el.properties.w  + '(' + el.properties.t + ')'), id: el.properties.w })
              })

              linkedItemResult.media.forEach((el) => {
                linkedItemData.linkedMedia.push(((el.properties.t || '').indexOf('ae|') > -1) ? (el.properties.aeId.split('|')[2] + '||' + el.properties.t) : el.properties.w + '||' + (el.properties.ct === 'marker' ? 'w|' : '') + el.properties.t)
                // linkedItemData.linkedContent.push({ name: (el.properties.w  + '(' + el.properties.t + ')'), id: el.properties.w })
              })
              // linkedItemKey1
              linkedItemData.linkedItemKey1 = newLinkKey
              linkedItemData.linkedItemKey1choice = [{ id: newLinkKey, name: newLinkKey }]

              this.setState({
                linkSetup: newLinkKey,
                isFetchingSearch: false,
                updateID: this.state.updateID++,
                linkedItemData
              })
            } else {
              this.props.showNotification('No linked items found yet')
            }
          })
      } else {
        this.setState({ linkedItemData: {} })
      }
      // el.properties.t
      return true
    }
  }
  setMetadataEntity = (metadataEntity, isEpic) => {
    if ((this.state.metadataType === 'e' || isEpic) && metadataEntity !== this.state.metadataEntity) {
      axios.get(properties.chronasApiHost + '/metadata/' + metadataEntity)
        .then(response => {
          const rawDefault = response.data
          let contentChoice = []
          let modifiedDefaultValues = {
            'type': rawDefault.type,
            'url': 'https://en.wikipedia.org/wiki/' + rawDefault.wiki,
            'subtype': rawDefault.subtype,
            'start': rawDefault.data.start,
            'end': rawDefault.data.end,
            'participants': ((rawDefault.data || {}).participants || []).map(pTeam => {
              return {
                'participantTeam': pTeam.map(pParticipant => {
                  return { 'name': pParticipant/*, 'value': pParticipant */ }
                })
              }
            }),
            'coo': rawDefault.coo,
            'partOf': rawDefault.partOf,
            'poster': rawDefault.poster
          }

          this.setState({
            contentChoice: contentChoice,
            metadataEntity,
            defaultEpicValues: modifiedDefaultValues
          })
        })
        .catch(() => {
          this.setState({ metadataEntity })
        })
    } else {
      this.setState({ metadataEntity })
    }
  }
  handleBack = () => {
    this.props.setRightDrawerVisibility(false)
    this.props.history.goBack()
  }
  handleClose = () => {
    this.props.history.push('/')
    this.props.deselectItem()
    this.props.setRightDrawerVisibility(false)
    utilsQuery.updateQueryStringParameter('type', '')
    utilsQuery.updateQueryStringParameter('value', '')
  }
  handleMousedown = e => {
    this.setState({ isResizing: true, lastDownX: e.clientX })
    document.addEventListener('mousemove', e => this.handleMousemove(e), { passive: true })
    document.addEventListener('mouseup', e => this.handleMouseup(e), { passive: true })
  }
  handleMouseup = e => {
    this.setState({ isResizing: false })
    window.removeEventListener('mousemove', e => this.handleMousemove(e), { passive: true })
    window.removeEventListener('mouseup', e => this.handleMouseup(e), { passive: true })
  }
  handleMousemove = e => {
    const { selectedItem } = this.props
    // this shouldnt be called anyway if not resizing (eventlistener unregister!)
    if (!this.state.isResizing) {
      return
    }
    const offsetRight = +document.body.offsetWidth - (e.clientX - document.body.offsetLeft)
    const minWidth = +document.body.offsetWidth * 0.24
    const maxWidth = +document.body.offsetWidth - 160

    if (selectedItem.type === TYPE_MARKER || selectedItem.type === TYPE_COLLECTION || selectedItem.type === TYPE_LINKED) {
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        const offsetTop = e.clientY
        const minHeight = +document.body.offsetHeight * 0.24
        const maxHeight = +document.body.offsetHeight - 160
        const stateToUpdate = { newMarkerWidth: offsetRight,
          newMarkerPartOfWidth: ((offsetRight - 80) > 160) ? (offsetRight - 80) : 160 }

        if (offsetTop > minHeight && offsetTop < maxHeight) {
          stateToUpdate.newMarkerHeight = offsetTop
          stateToUpdate.newMarkerPartOfHeight = offsetTop + 20
        }
        this.setState(stateToUpdate)
      }
    } else {
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        this.setState({ newWidth: offsetRight })
      }
    }
  }
  select = (index) => this.setState({ selectedIndex: index })
  _handleNewData = (selectedItem, activeArea = {}) => {
    if (this.props.isLight) return
    if (selectedItem.type === TYPE_AREA) {
      const selectedProvince = selectedItem.value
      // is rulerEntity loaded?
      const activeAreaDim = (activeArea.color === 'population') ? 'ruler' : activeArea.color
      const activeRulDim = utils.getAreaDimKey(this.props.metadata, activeArea, selectedItem)

      if (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && this.state.rulerEntity.id !== activeRulDim) {
        axios.get(properties.chronasApiHost + '/metadata/a_' + activeAreaDim + '_' + activeRulDim)
          .then((newRulerEntity) => {
            this.setState({
              rulerEntity: {
                id: activeRulDim,
                data: newRulerEntity.data.data
              }
            })
          })
          .catch((err) => {
            console.error(err)
            this.setState({
              rulerEntity: {
                'id': null,
                'data': null
              }
            })
          })
      } else if (selectedItem.wiki === WIKI_PROVINCE_TIMELINE && this.state.provinceEntity.id !== activeRulDim) {
        axios.get(properties.chronasApiHost + '/metadata/ap_' + selectedProvince.toLowerCase() + '?type=ap')
          .then((newProvinceEntity) => {
            this.setState({
              provinceEntity: {
                id: selectedProvince,
                data: newProvinceEntity.data.data
              }
            })
          })
      }
    }
  }

  constructor (props) {
    super(props)
    // this._setPartOfItems = this._setPartOfItems.bind(this)
    this._openPartOf = this._openPartOf.bind(this)
    this.state = {
      contentType: '',
      searchText: '',
      stepIndex: -1,
      updateID: 0,
      linkedItemData: {},
      isFetchingSearch: false,
      contentChoice: [],
      contentTypeRaw: false,
      defaultEpicValues: {},
      isResizing: false,
      lastDownX: 0,
      newWidth: '50%',
      newMarkerWidth: '30%',
      newMarkerPartOfWidth: 'calc(30% - 80px)',
      newMarkerHeight: 'calc(80% - 40px)',
      newMarkerPartOfHeight: 'calc(80% - 20px)',
      hiddenElement: true,
      metadataType: '',
      metadataEntity: '',
      routeKey: '',
      linkSetup: '',
      prefilledLinked: false,
      selectedIndex: -1,
      rulerEntity: {
        'id': null,
        'data': null
      },
      provinceEntity: {
        'id': null,
        'data': null
      },
    }
  }

  componentWillReceiveProps (nextProps) {
    // TODO: this gets called too much!
    const { activeArea, location, metadata, selectedItem } = this.props

    // console.debug('componentWillReceiveProps   RightDrawerRoutes')
    if (
      (!(nextProps.selectedItem.type === TYPE_EPIC &&
        selectedItem.type === TYPE_EPIC) &&
        (nextProps.selectedItem.wiki !== selectedItem.wiki || nextProps.selectedItem.value !== selectedItem.value || nextProps.activeArea.color !== activeArea.color)) // don't load twice with type_epic
    ) {
      this._handleNewData(nextProps.selectedItem, nextProps.activeArea)
    }
    if (selectedItem.type === TYPE_COLLECTION && !nextProps.selectedItem.data) { this.setState({ stepIndex: -1 }) }
    else if (selectedItem.type === TYPE_COLLECTION && ((nextProps.selectedItem || {}).data || {}).stepIndex !== ((selectedItem || {}).data || {}).stepIndex) {
      const sI = ((nextProps.selectedItem || {}).data || {}).stepIndex
      setTimeout(() => {
        if (!(sI > -1) || this.state.stepIndex === sI) return
        console.debug('should only happen on manual click!')
        this.setState({ stepIndex: sI })
        if (selectedItem.data.changeYearByArticle) {
          const newYear = (((((nextProps.selectedItem || {}).data || {}).content || [])[sI] || {}).properties || {}).y
          if ((typeof newYear !== "undefined" && newYear !== false && !isNaN(newYear)) && +newYear >= -2000 && +newYear <= 2000) this.props.setYear(+newYear)
        }
      }, 600)
    }
    if (location.pathname !== nextProps.location.pathname) {
      if (nextProps.location.pathname === '/mod/links' && nextProps.selectedItem) {
        let prefilledId = ''
        if (nextProps.selectedItem.type === TYPE_AREA && (nextProps.activeArea.color !== 'population')) {
          const activeAreaDim = (nextProps.activeArea.color === 'population') ? 'ruler' : nextProps.activeArea.color
          const activeprovinceValue = utils.getAreaDimKey(metadata, nextProps.activeArea, nextProps.selectedItem)
          prefilledId = activeprovinceValue + '||ae|' + activeAreaDim
        } else {
          prefilledId = ((((nextProps.selectedItem || {}).value || {}).subtype === 'ei') ? ((nextProps.selectedItem || {}).value || {}).id : (nextProps.selectedItem.type === TYPE_EPIC) ? nextProps.selectedItem.value : nextProps.selectedItem.wiki) + '||' + (nextProps.selectedItem.value.type || nextProps.selectedItem.type)
        }
        this.ensureLoadLinkedItem(prefilledId, true) // adopt to new standard
      } else if (location.pathname === '/mod/links') {
        this.setState({ linkedItemData: {} })
      }

      this.setState({
        selectedIndex: menuIndexByLocation[nextProps.location.pathname]
      })
    }

    const { rightDrawerOpen, setRightDrawerVisibility, isLight } = this.props

    if (rightDrawerOpen !== nextProps.rightDrawerOpen) {
      if (rightDrawerOpen) {
        if (nextProps.location.pathname.indexOf('/mod') === -1) this.setState({ hiddenElement: true, contentTypeRaw: false })
        else this.setState({ hiddenElement: true })
      } else {
        // console.debug('rightDrawer Opened')
        this.setState({ hiddenElement: false })
      }
    }

    if (nextProps.location.pathname.indexOf('/mod') > -1 ||
      nextProps.location.pathname.indexOf('/article') > -1) {
      if (!isLight && !nextProps.rightDrawerOpen && ((nextProps.selectedItem.type !== TYPE_MARKER && nextProps.selectedItem.type !== TYPE_COLLECTION && nextProps.selectedItem.type !== TYPE_LINKED) || nextProps.location.pathname.indexOf('/article') === -1)) {
        setRightDrawerVisibility(true)
      }
    } else if (nextProps.rightDrawerOpen) {
      setRightDrawerVisibility(false)
    }

    if ((nextProps.selectedItem.type === TYPE_MARKER || nextProps.selectedItem.type === TYPE_LINKED) && rightDrawerOpen && nextProps.location.pathname.indexOf('/article') > -1) {
      setRightDrawerVisibility(false)
    }
  }

  componentDidMount () {
    this._handleNewData(this.props.selectedItem, this.props.activeArea)
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', e => this.handleMousemove(e), false)
    window.removeEventListener('mouseup', e => this.handleMouseup(e), false)
  }

  componentDidCatch (error, info) {
    this.props.showNotification('somethingWentWrong', 'confirm')
  }

  _getFullIconURL (iconPath) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + iconPath + '/100px-' + iconPath.substr(iconPath.lastIndexOf('/') + 1) + ((iconPath.toLowerCase().indexOf('svg') > -1) ? '.PNG' : '')
  }

  _openPartOf (el) {
    const { activeArea, changeColor, selectAreaItem, selectedItem, setYear, setFullItem, selectEpicItem, selectMarkerItem, selectLinkedItem, setAreaColorLabel, showNotification, isLight, history } = this.props
    if (isLight) return
    const cType = ((el || {}).properties || {}).ct
    const aeId = ((el || {}).properties || {}).aeId
    if (aeId) {
      const [ae, colorToSelect, rulerToHold] = aeId.split('|')
      const nextData = activeArea.data
      const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold) // TODO: go on here
      if (provinceWithOldRuler) {
        selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
        if (colorToSelect !== activeArea.color) {
          changeColor(colorToSelect)
        }
      } else {
        axios.get(properties.chronasApiHost + '/metadata/a_ruler_' + rulerToHold)
          .then(influenceData => {
            const fullInfluenceData = (((influenceData || {}).data || {}).data || {}).influence
            const fullObj = fullInfluenceData[Math.floor(fullInfluenceData.length / 2)]
            if (fullObj) {
              const selectedYear = +Object.keys(fullObj)[0]
              setYear(selectedYear)
              axios.get(properties.chronasApiHost + '/areas/' + selectedYear)
                .then((areaDefsRequest) => {
                  const nextData = areaDefsRequest.data
                  const provinceWithOldRuler2 = Object.keys(nextData).find(key => nextData[key][0] === rulerToHold)
                  if (provinceWithOldRuler2) {
                    selectAreaItem(((el || {}).properties || {}).w, provinceWithOldRuler2)
                  }
                })
              // setFullItem(selectedItem.wiki, rulerToHold, TYPE_AREA, { newEntity: rulerToHold })
              // setYear(selectedYear)
            } else {
              // no province found with that ruler, check aggregate and go to that land
              selectMarkerItem(((el || {}).properties || {}).w, ((el || {}).properties || {}).w)
              showNotification('No province of ' + ((el || {}).properties || {}).n + ' found in the current year: only opening article.')
            }
          })
          .catch((e) => {
            // no province found with that ruler, check aggregate and go to that land
            selectMarkerItem(((el || {}).properties || {}).w, ((el || {}).properties || {}).w)
            showNotification('No province of ' + ((el || {}).properties || {}).n + ' found in the current year: only opening article.')
          })
      }
    } else if (epicIdNameArray.map(el => el[0]).includes(((el || {}).properties || {}).t)) {
      if (activeArea.color !== 'ruler') {
        setAreaColorLabel('ruler', 'ruler')
      }
      selectEpicItem(((el || {}).properties || {}).w, ((el || {}).properties || {}).y, ((el || {}).properties || {}).id/*, fullData */)
      // selectEpicItem(fullData.wiki, +(fullData.year || selectedYear))
    } else if (cType === 'marker') {
      if (typeof ((el || {}).properties || {}).y !== 'undefined') setYear(((el || {}).properties || {}).y)
      selectMarkerItem(((el || {}).properties || {}).w, ((el || {}).properties || {}).w)
    } else {
      if (typeof ((el || {}).properties || {}).y !== 'undefined') setYear(((el || {}).properties || {}).y)
      selectLinkedItem(((el || {}).properties || {}).w)
    }
    history.push('/article')
  }

  hideRevealAnimationCard = () => {
    const animationCard = document.getElementById('animationCard')
    const contentCard = document.querySelector('.markerContainer>div:last-child>div')
    const iframeContainer = document.getElementById('articleIframe')
    animationCard.style.height = '8px'
    iframeContainer.style.right = -1 * (iframeContainer.offsetWidth + 100) + 'px'
    setTimeout(() => {
      animationCard.style.height = '16px'
      iframeContainer.style.opacity = 0
      iframeContainer.style.right = '0px'
      setTimeout(() => {
        setTimeout(() => {
          iframeContainer.style.opacity = 1
        }, 100)
      }, 500)
    }, 1000)
  }

  setCollectionIndex = (sI) => {
    const { selectedItem, setData } = this.props
    if (sI >= 0 && sI < (((this.props.selectedItem || {}).data || {}).content || []).length) setData({ ...selectedItem.data, stepIndex: sI })
    this.setState({ stepIndex: sI })
    if (selectedItem.data.changeYearByArticle) {
      const newYear = (((((this.props.selectedItem || {}).data || {}).content || [])[sI] || {}).properties || {}).y
      if ((typeof newYear !== "undefined" && newYear !== false && !isNaN(newYear)) && +newYear >= -2000 && +newYear <= 2000) this.props.setYear(+newYear)
    }
  }
  handleCollectionPrev = () => {
    const { selectedItem, setData } = this.props
    const { stepIndex } = this.state
    if ((+stepIndex - 1) >= 0 && (+stepIndex - 1) < (((this.props.selectedItem || {}).data || {}).content || []).length) setData({ ...selectedItem.data, stepIndex: (+stepIndex - 1) })
    if (selectedItem.data.changeYearByArticle) {
      const newYear = (((((this.props.selectedItem || {}).data || {}).content || [])[stepIndex - 1] || {}).properties || {}).y
      if ((typeof newYear !== "undefined" && newYear !== false && !isNaN(newYear)) && +newYear >= -2000 && +newYear <= 2000) this.props.setYear(+newYear)
    }
    this.hideRevealAnimationCard()
    setTimeout(() => {
      this.setState({ stepIndex: stepIndex - 1 })
    }, 500)
  }

  handleCollectionNext = () => {
    const { selectedItem, setData, showNotification } = this.props
    const { stepIndex } = this.state
    if ((+stepIndex + 1) >= 0 && (+stepIndex + 1) < (((this.props.selectedItem || {}).data || {}).content || []).length) setData({ ...selectedItem.data, stepIndex: (+stepIndex + 1) })
    this.hideRevealAnimationCard()
    if (selectedItem.data.changeYearByArticle) {
      const newYear = (((((this.props.selectedItem || {}).data || {}).content || [])[stepIndex + 1] || {}).properties || {}).y
      if ((typeof newYear !== "undefined" && newYear !== false && !isNaN(newYear)) && +newYear >= -2000 && +newYear <= 2000) this.props.setYear(+newYear)
    }
    if (((selectedItem.data || {}).quiz || []).length > 0) showNotification('Good Job! Marked As Read')
    setTimeout(() => {
      this.setState({ stepIndex: stepIndex + 1 })
    }, 500)
  }

  render () {
    console.debug('render()   RightDrawerRoutes')
    const {
      options, setWikiId, setRightDrawerVisibility, theme,
      selectedYear, selectedItem, activeArea, setAreaColorLabel, location,
      setModData, setModDataLng, setModDataLat, history, metadata, changeColor, isLight, translate
    } = this.props
    const { newWidth, newMarkerWidth, newMarkerHeight, newMarkerPartOfWidth, newMarkerPartOfHeight, rulerEntity, contentTypeRaw, stepIndex, provinceEntity } = this.state

    if ((typeof selectedItem.wiki === 'undefined')) return null

    const isMarker = (isLight || (selectedItem.type === TYPE_MARKER || selectedItem.type === TYPE_LINKED)) && location.pathname.indexOf('/article') > -1
    const isCollection = selectedItem.type === TYPE_COLLECTION && location.pathname.indexOf('/article') > -1 && !isLight
    const isEpic = (selectedItem.type === TYPE_EPIC) && location.pathname.indexOf('/article') > -1 && !isLight
    const currPrivilege = +localStorage.getItem('chs_privilege')
    const resourceList = Object.keys(resources)// .filter(resCheck => +resources[resCheck].permission <= currPrivilege)
    const modHeader = <AppBar
      className='articleHeader'
      style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }} // '#eceff1'}
      iconElementLeft={
        <BottomNavigation
          style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }}
          onChange={this.handleChange}
          selectedIndex={this.state.selectedIndex}>
          <BottomNavigationItem
            themeBackColors={themes[theme].backColors[1]}
            className='bottomNavigationItem'
            containerElement={<Link to='/mod/markers/create' />}
            label={translate('pos.markersMedia')}
            icon={nearbyIcon}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            themeBackColors={themes[theme].backColors[1]}
            className='bottomNavigationItem'
            containerElement={<Link to='/mod/areas' />}
            label={translate('pos.area')}
            icon={nearbyIcon}
            // onClick={() => { this.select(4) }}
          />
        </BottomNavigation>
      }
      iconElementRight={
        <div style={{ ...styles.iconElementRightStyle, backgroundColor: themes[theme].backColors[0] }}>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('pos.flags')} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
            containerElement={<Link to='/mod/flags?filter=%7B%7D&order=DESC&page=1&perPage=5&sort=timestamp' />}>
            <IconFlags />
          </IconButton>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={'pos.allRevisions'} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
            containerElement={<Link to='/mod/revisions?filter=%7B%7D&order=DESC&page=1&perPage=5&sort=timestamp' />}>
            <IconList />
          </IconButton>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('aor.action.back')} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
            onClick={() => this.handleBack()}>
            <IconBack />
          </IconButton>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('aor.action.close')} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
            onClick={() => this.handleClose()}>
            <IconClose />
          </IconButton>
        </div>
      }
    />

    const selectedProvince = selectedItem.value

    const rulerId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')]
    const cultureId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')]
    const religionId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')]

    // we need metadata to be loaded before we can render this component
    if (typeof metadata['ruler'] === 'undefined' || Object.keys(activeArea.data).length === 0) return null

    let entityPop = 0, totalPop = 0

    if (activeArea.color === 'ruler') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += +currPop
        if ((activeArea.data[key] || {})[0] === rulerId) entityPop += currPop
      })
    }
    else if (activeArea.color === 'culture') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += +currPop
        if ((activeArea.data[key] || {})[1] === cultureId) entityPop += currPop
      })
    }
    else if (activeArea.color === 'religion') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += +currPop
        if ((activeArea.data[key] || {})[2] === religionId) entityPop += currPop
      })
    }
    else if (activeArea.color === 'religionGeneral') {
      const religionGeneralId = (metadata['religion'][religionId] || {})[3]
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += +currPop
        if ((metadata['religion'][(activeArea.data[key] || {})[2]] || {})[3] === religionGeneralId) entityPop += currPop
      })
    }

    const entityObject = isLight ? {
        ruler: (metadata['ruler'][rulerId] || []),
      } : {
        ruler: (metadata['ruler'][rulerId] || []),
        religion: (metadata['religion'][religionId] || {}),
        religionGeneral: metadata['religionGeneral'][(metadata['religion'][religionId] || [])[3]] || {},
        culture: (metadata['culture'][cultureId] || {}),
        // capital: ((metadata['capital'][(activeArea.data[selectedProvince] || {})[3]]) || {}),
        province: (metadata['province'][selectedProvince] || {}),
      }
    const hasLocaleMetadata = typeof ((metadata || {}).locale || {}).ruler !== 'undefined'

    const entityMeta = isLight ? {} : {
      ruler: {
        name: hasLocaleMetadata
          ? (metadata.locale['ruler'][rulerId] || entityObject.ruler[0] || 'n/a')
          : (entityObject.ruler[0] || 'n/a'),
        icon: entityObject.ruler[3]
      },
      religion: {
        name: hasLocaleMetadata
          ? (metadata.locale['religion'][religionId] || entityObject.religion[0] || 'n/a')
          : (entityObject.religion[0] || 'n/a'),
        icon: entityObject.religion[4]
      },
      religionGeneral: {
        name: hasLocaleMetadata
          ? (metadata.locale['religionGeneral'][(metadata['religion'][religionId] || [])[3]] || entityObject.religionGeneral[0] || 'n/a')
          : (entityObject.religionGeneral[0] || 'n/a'),
        icon: entityObject.religionGeneral[3]
      },
      culture: {
        name: hasLocaleMetadata
          ? (metadata.locale['culture'][cultureId] || entityObject.culture[0] || 'n/a')
          : (entityObject.culture[0] || 'n/a'),
        icon: entityObject.culture[3]
      },
      province: {
        name: hasLocaleMetadata
          ? ((metadata.locale['province'] || {})[selectedProvince] || selectedProvince || 'n/a')
          : (selectedProvince || 'n/a')
      }
    }

    let modUrl = '/mod/' + selectedItem.type

        const { userDetails } = this.props

         const isPro = (localStorage.getItem('chs_subscription') && !((userDetails || {}).subscription)) || ((userDetails || {}).subscription && (userDetails || {}).subscription || "").length > 4
         if (!isPro) {
            modUrl = '/pro';
         }


    const articleHeader = <AppBar
      className='articleHeader'
      style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }}
      iconElementLeft={
        (selectedItem.type === TYPE_AREA && !isLight)
          ? <BottomNavigation
            style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }}
            onChange={this.handleChange}
            selectedIndex={(selectedItem.wiki === WIKI_PROVINCE_TIMELINE)
              ? 0
              : selectedIndexObject[activeArea.color]}>
            <BottomNavigationItem
              themeBackColors={themes[theme].backColors[1]}
              onClick={() => {
                setWikiId(WIKI_PROVINCE_TIMELINE)
                setAreaColorLabel('ruler', 'ruler')
              }}
              className='bottomNavigationItem'
              icon={<CardHeader
                title={entityMeta.province.name}
                subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
                titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
                style={styles.cardHeader.style}
                subtitle={translate('resources.areas.fields.province')}
                avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                  icon={<ProvinceIcon
                    viewBox={'0 0 64 64'} />} />/* this._getFullIconURL(entityMeta.ruler.icon) */}
              />}
            />
            <BottomNavigationItem
              themeBackColors={themes[theme].backColors[1]}
              onClick={() => {
                setWikiId(selectedItem.value)
                setAreaColorLabel('ruler', 'ruler')
              }}
              className='bottomNavigationItem'
              icon={<CardHeader
                title={entityMeta.ruler.name}
                subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
                titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
                style={styles.cardHeader.style}
                subtitle={translate('resources.areas.fields.ruler')}
                avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                  {...(entityMeta.ruler.icon ? (entityMeta.ruler.icon[0] === '/' ? { src: entityMeta.ruler.icon } : { src: this._getFullIconURL(decodeURIComponent(entityMeta.ruler.icon)) }) : {
                    icon: <RulerIcon viewBox={'0 0 64 64'} />
                  })} />}
              />}
            />
            <BottomNavigationItem
              themeBackColors={themes[theme].backColors[1]}
              onClick={() => {
                setWikiId(selectedItem.value)
                setAreaColorLabel('culture', 'culture')
              }}
              className='bottomNavigationItem'
              icon={<CardHeader
                title={entityMeta.culture.name}
                subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
                titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
                style={styles.cardHeader.style}
                subtitle={translate('resources.areas.fields.culture')}
                avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}

                  {...(entityMeta.culture.icon ? (entityMeta.culture.icon[0] === '/' ? { src: entityMeta.culture.icon } : { src: this._getFullIconURL(decodeURIComponent(entityMeta.culture.icon)) }) : {
                    icon: <CultureIcon viewBox={'0 0 64 64'} />
                  })} />}
              />}
            />
            <BottomNavigationItem
              themeBackColors={themes[theme].backColors[1]}
              onClick={() => {
                setWikiId(selectedItem.value)
                setAreaColorLabel('religion', 'religion')
              }}
              className='bottomNavigationItem'
              icon={<CardHeader
                title={entityMeta.religion.name /* + ' [' + entityMeta.religionGeneral.name + ']' */}
                subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
                titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
                style={styles.cardHeader.style}
                subtitle={translate('resources.areas.fields.religion')}
                avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                  {...(entityMeta.religion.icon ? (entityMeta.religion.icon[0] === '/' ? { src: entityMeta.religion.icon } : { src: this._getFullIconURL(decodeURIComponent(entityMeta.religion.icon)) }) : {
                    icon: <ReligionGeneralIcon style={{ height: 32, width: 32, margin: 0 }}
                      viewBox={'0 0 200 168'} />
                  })} />}
              />}
            />
            <BottomNavigationItem
              themeBackColors={themes[theme].backColors[1]}
              onClick={() => {
                setWikiId(selectedItem.value)
                setAreaColorLabel('religionGeneral', 'religionGeneral')
              }}
              className='bottomNavigationItem'
              icon={<CardHeader
                title={entityMeta.religionGeneral.name}
                subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
                titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
                style={styles.cardHeader.style}
                subtitle={translate('resources.areas.fields.genReligion')}
                avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]}
                  {...(entityMeta.religionGeneral.icon ? (entityMeta.religionGeneral.icon[0] === '/' ? { src: entityMeta.religionGeneral.icon } : { src: this._getFullIconURL(decodeURIComponent(entityMeta.religionGeneral.icon)) }) : {
                    icon: <ReligionGeneralIcon style={{ height: 32, width: 32, margin: 0 }}
                      viewBox={'0 0 200 168'} />
                  })} />}
              />}
            />
          </BottomNavigation> : null
      }
      iconElementRight={
        <div style={{ ...styles.iconElementRightStyle, backgroundColor: themes[theme].backColors[0] }}>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('aor.action.edit')} style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            containerElement={<Link to={modUrl} />}><EditIcon hoverColor={themes[theme].highlightColors[0]} />
          </IconButton>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('aor.action.back')} style={{ width: 32 }} iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleBack()}>
            <IconBack hoverColor={themes[theme].highlightColors[0]} />
          </IconButton>
          <IconButton
            tooltipPosition='bottom-left'
            tooltip={translate('aor.action.close')} iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleClose()}>
            <IconClose hoverColor={themes[theme].highlightColors[0]} />
          </IconButton>
        </div>
      }
    />

    const CoreContent = (headerComponent, component, route, commonProps, routeProps) => {
      const { selectedItem } = this.props
      const items = ((this.props.selectedItem || {}).data || {}).content || []
      const potentialPartOfItem = (selectedItem.value || {}).partOf
      const partOfEntity = potentialPartOfItem && items.find(el => (el.properties || {}).id === potentialPartOfItem)
      let minimumColWidth = false // true
      let hasQuiz = (((this.props.selectedItem || {}).data || {}).quiz || []).length > 0
      if (isCollection) {
        const offsetRight = (typeof newMarkerWidth === "number") ? (newMarkerWidth + 80) : (document.body.offsetWidth * 0.3 + 80) // (+document.body.offsetWidth - (e.clientX - document.body.offsetLeft))
        minimumColWidth = ((offsetRight - 80) > 450)
      }

      const partOfEntities = partOfEntity ? [partOfEntity] : items
      return <Responsive
        small={
          <Drawer
            docked={false}
            openSecondary
            open
            onRequestChange={setRightDrawerVisibility}
          >
            {component && createElement(component, {
              ...commonProps,
              ...routeProps
            })}
          </Drawer>
        }
        medium={
          (isMarker || isCollection) ? <div className={'markerContainer'}>

            {!isCollection && partOfEntities && partOfEntities.length !== 0 && <div style={{
              ...styles.partOfDiv,
              background: themes[theme].backColors[0],
              width: newMarkerPartOfWidth,
              top: newMarkerPartOfHeight
            }}>
              <CardActions style={{ textAlign: 'center', maxHeight: 48 }}>
                {(partOfEntities.length === 1) ? <FlatButton
                    // style={{ color: '#fff' }}
                    // backgroundColor='rgb(255, 64, 129)'
                  hoverColor={themes[theme].highlightColors[0]}// '#8AA62F'
                  onClick={() => this._openPartOf(partOfEntities[0])}
                  labelStyle={{ paddingLeft: 0, paddingRight: 0 }}
                  label={<div style={{ paddingLeft: 14, paddingRight: 14 }}>{translate('pos.partOf')} <span style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      fontWeight: 'bolder'
                    }}>{(((partOfEntities[0].properties || {}).y ? ((partOfEntities[0].properties || {}).y + ': ') : '') + (partOfEntities[0].properties || {}).n || (partOfEntities[0].properties || {}).w || '').toString().toUpperCase()}</span>
                  </div>} />
                  : <SelectField
                    style={{
                      width: 200,
                      //   color: 'rgb(255, 255, 255)',
                      backgroundColor: 'transparent',
                      // maxHeight: 40,
                      // marginTop: -40,
                      textAlign: 'center',
                      marginRight: 8,
                      maxHeight: 9,
                      marginTop: 1,
                      top: -32,
                      // transition: '1s all'
                    }}
                    menuStyle={{
                      width: 200,
                      //   color: 'rgb(255, 255, 255)',
                      top: 14,
                      maxHeight: 36,
                      //    backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    menuItemStyle={{
                      width: 200,
                      maxHeight: 36,
                      //      color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    labelStyle={{
                      maxHeight: 36,
                      width: 200,
                      left: 0,
                      //        color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    listStyle={{ width: 200 }}
                    underlineStyle={{ width: 200 }}
                    floatingLabelStyle={{
                      maxHeight: 36,
                      width: 200,
                      left: 0,
                      //       color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    iconStyle={{
                      top: -4
                    }}
                    hintStyle={{ width: 200, left: 22, /* color: 'rgb(255, 255, 255)' */}}
                    // maxHeight={36}

                    floatingLabelText={translate('pos.related_item')}
                    hintText={translate('pos.related_item')}
                    value={null}
                    onChange={(event, index, value) => {
                      this._openPartOf(value)
                    }}
                  >
                    {partOfEntities.map((el, index) => {
                      return <MenuItem key={'partOf_' + index} value={el}
                        primaryText={(((el.properties || {}).y ? ((el.properties || {}).y + ': ') : '') + (el.properties || {}).n || (el.properties || {}).w || '').toString().toUpperCase()} />
                    })}
                  </SelectField>
                }
              </CardActions>
            </div>}
            {isCollection && partOfEntities && partOfEntities.length !== 0 && <div style={{
              ...styles.partOfDiv,
              width: newMarkerPartOfWidth,
              paddingTop: 10,
              transition: 'margin 1s',
              marginTop: stepIndex !== -1 ? '-10px' : '-60px',
              top: !isCollection ? newMarkerPartOfHeight : (typeof newMarkerPartOfHeight === 'string') ? 'calc(80% - 6px)' : (newMarkerPartOfHeight + 14)
            }}>
              <CardActions style={{ textAlign: 'center', maxHeight: 48 }}>
                <span style={{ paddingRight: '2em', width: minimumColWidth ? '20%' : '40%', float: 'left', lineHeight: '36px', display: 'inline-table', padding: 0, margin: 0 }}> ({stepIndex + 1} / {partOfEntities.length + (hasQuiz ? 1 : 0)})</span>
                <div style={{
                  display: minimumColWidth ? 'inline-table' : 'none',
                  width: '60%',
                  maxWidth: '210px',
                  padding: 0,
                  margin: 0
                }}>
                  {(partOfEntities.length === 1) ? <FlatButton
                    // style={{ color: '#fff' }}
                    // backgroundColor='rgb(255, 64, 129)'
                    hoverColor={themes[theme].highlightColors[0]}// '#8AA62F'
                    onClick={() => this._openPartOf(partOfEntities[0])}
                    labelStyle={{ paddingLeft: 0, paddingRight: 0 }}
                    label={<div style={{ paddingLeft: 14, paddingRight: 14 }}>{translate('pos.partOf')} <span style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      fontWeight: 'bolder'
                    }}>{(((partOfEntities[0].properties || {}).y ? ((partOfEntities[0].properties || {}).y + ': ') : '') + (partOfEntities[0].properties || {}).n || (partOfEntities[0].properties || {}).w || '').toString().toUpperCase()}</span>
                    </div>} />
                  : <SelectField
                    style={{
                      width: 200,
                      // display: newMarkerWidth > 380 ? '' : 'none',
                      //   color: 'rgb(255, 255, 255)',
                      backgroundColor: 'transparent',
                      // maxHeight: 40,
                      // marginTop: -40,
                      textAlign: 'center',
                      marginRight: 8,
                      maxHeight: 9,
                      marginTop: 1,
                      top: -32,
                      // transition: '1s all'
                    }}
                    menuStyle={{
                      width: 200,
                      //   color: 'rgb(255, 255, 255)',
                      top: 14,
                      maxHeight: 36,
                      //    backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    menuItemStyle={{
                      width: 200,
                      maxHeight: 36,
                      //      color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    labelStyle={{
                      maxHeight: 36,
                      width: 200,
                      left: 0,
                      //        color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    listStyle={{ width: 200 }}
                    underlineStyle={{ width: 200 }}
                    floatingLabelStyle={{
                      maxHeight: 36,
                      width: 200,
                      left: 0,
                      //       color: 'rgb(255, 255, 255)',
                      //       backgroundColor: 'rgb(106, 106, 106)'
                    }}
                    iconStyle={{
                      top: -4
                    }}
                    hintStyle={{ width: 200, left: 22, /* color: 'rgb(255, 255, 255)' */}}
                    // maxHeight={36}

                    floatingLabelText={translate('pos.browse_item')}
                    hintText={translate('pos.browse_item')}
                    value={null}
                    onChange={(event, index, value) => {
                      if (isCollection) {
                        return this.setCollectionIndex(index)
                      }
                      this._openPartOf(value)
                    }}
                  >
                    {partOfEntities.map((el, index) => {
                      return <MenuItem key={'partOf_' + index} value={el}
                                       style={{ color: index === stepIndex ? themes[theme].highlightColors[0] : 'inherit' }}
                        primaryText={(((el.properties || {}).y ? ((el.properties || {}).y + ': ') : '') + (el.properties || {}).n || (el.properties || {}).w || '').toString().toUpperCase()} />
                    })}
                  </SelectField>
                }</div>
                <div style={{ width: minimumColWidth ? '20%' : '40%', display: 'inline-table', float: 'right', lineHeight: '36px', padding: 0, margin: 0 }}>
                  <IconButton
                    disabled={stepIndex < 1}
                    iconStyle={styles.chevIcon}
                    style={{ ...styles.chevContainer, pointerEvents: (stepIndex < 1) ? 'none' : 'all' }}>
                    <ChevronLeft onClick={this.handleCollectionPrev} />
                  </IconButton>
                  <IconButton
                    disabled={stepIndex > (partOfEntities.length - 2 + (hasQuiz ? 1 : 0))}
                    iconStyle={styles.chevIcon}
                    style={{ ...styles.chevContainer, pointerEvents: (stepIndex > (partOfEntities.length - 2 + (hasQuiz ? 1 : 0))) ? 'none' : 'all' }}>
                    <ChevronRight onClick={this.handleCollectionNext} />
                  </IconButton>
                </div>
              </CardActions>
            </div>}
            { isCollection && <div id={'animationCard'} style={{
              ...styles.partOfDiv,
              width: (typeof newMarkerPartOfWidth === 'string') ? 'calc(30% - 40px)' : (newMarkerPartOfWidth + 40),
              height: '16px',
              borderRadius: 0,
              right: '40px',
              top: newMarkerPartOfHeight
            }} /> }
            { isCollection && <div style={{
              ...styles.partOfDiv,
              tranisition: '.5s',
              borderRadius: 0,
              // background: themes[theme].backColors[1],
              width: (typeof newMarkerPartOfWidth === 'string') ? 'calc(30% - 20px)' : (newMarkerPartOfWidth + 60),
              height: '8px',
              right: '30px',
              top: newMarkerPartOfHeight
            }} /> }
            <Card
              style={{ ...styles.cardArticle, background: themes[theme].backColors[0], width: newMarkerWidth, height: newMarkerHeight, boxShadow: 'none' }}
              containerStyle={{ height: '100%' }}
            >
            </Card>
            <Card
              style={{ ...styles.cardArticle, backgroundColor: 'transparent', width: newMarkerWidth, height: newMarkerHeight }}
              containerStyle={{ height: '100%', position: 'relative', transition: '0.5s', right: '0px', transitionTimingFunction: 'ease-in-out' }}
          >
              <RaisedButton
                className={(isCollection) ? 'dragHandle markerHandle collection' : (isMarker) ? 'dragHandle markerHandle' : 'dragHandle'}
                icon={(isMarker || isCollection) ? <IconArrowLeft /> : <IconDrag />}
                style={(isMarker || isCollection) ? {
                ...styles.draggableButtonDiv,
                top: 'calc(100% - 20px)',
                left: '20px',
                minWidth: 'inherit',
                transform: 'inherit'
              } : styles.draggableButtonDiv}
                labelStyle={{ width: '640px' }}
                rippleStyle={{ width: '440px' }}
                buttonStyle={styles.draggableButton}
                onMouseDown={event => {
                this.handleMousedown(event)
              }}
            />
              <div className='articleContentContainer' style={{ display: 'inline', pointerEvents: (this.state.isResizing) ? 'none' : 'inherit' }}>
                {component && createElement(component, {
                ...commonProps,
                ...routeProps
              })}
              </div>
            </Card>
          </div> : <Drawer
            openSecondary
            open
            containerStyle={{ overflow: 'none'/*, zIndex: 10002 */ }}
            style={{ overflow: 'none', zIndex: 9 }}
            width={this.state.newWidth}
            overlayStyle={{/* zIndex: 10001 */}}
          >
            <RaisedButton
              className='dragHandle'
              icon={<IconDrag />}
              style={styles.draggableButtonDiv}
              rippleStyle={{ width: '20px' }}
              buttonStyle={styles.draggableButton}
              onMouseDown={event => {
                this.handleMousedown(event)
              }}
            />
            <div className='articleContentContainer' style={{ display: 'inline', pointerEvents: (this.state.isResizing) ? 'none' : 'inherit' }}>
              {!isEpic && headerComponent}
              {component && createElement(component, {
                ...commonProps,
                ...routeProps
              })}
            </div>
          </Drawer>
        }
      />
    }

    const unrestrictPage = (headerComponent, component, route, commonProps) => {
      const UnrestrictedPage = routeProps => (
        <div>
          {CoreContent(headerComponent, component, route, commonProps, routeProps)}
        </div>
      )
      return UnrestrictedPage
    }

    const restrictPage = (headerComponent, component, route, commonProps) => {
      const username = localStorage.getItem('chs_username')
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'mod/areas' }} authParams={{ foo: 'bar' }} {...routeProps}>
          {(localStorage.getItem('chs_newToMod') === 'true') ? CoreContent(headerComponent, component, route, commonProps, routeProps) : CoreContent(
            <AppBar
              className='articleHeader'
              style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }} // '#eceff1'}
              iconElementRight={
                <div style={{ ...styles.iconElementRightStyle, backgroundColor: themes[theme].backColors[0] }}>
                  <IconButton
                    tooltipPosition='bottom-left'
                    tooltip={'Go Back'} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
                    onClick={() => this.handleBack()}>
                    <IconBack />
                  </IconButton>
                  <IconButton
                    tooltipPosition='bottom-left'
                    tooltip={translate('aor.action.close')} iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
                    onClick={() => this.handleClose()}>
                    <IconClose />
                  </IconButton>
                </div>
              }
            />, () => <Card style={styles.card}>
              <div>
                <Toolbar style={styles.toolbar}>
                  <ToolbarGroup>
                    <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                      text={'Thank you for becoming part of the Chronas Data Club!'} />
                  </ToolbarGroup>
                </Toolbar>
              </div>

              <CardText>
                <p>The great strength of this project is that every registered user can curate and extend the dataset, thank
              you for choosing to be a part of it!</p>
                <p>Every edit or addition will earn you points which you can view in your <a className='customLink' style={{
                  fontWeight: 800,
                  color: themes[theme].highlightColors[0]
                }} onClick={() => history.push((username) ? ('/community/user/' + username) : '/account')}>profile</a> and
              compare those points to the top 10 data contributors <a className='customLink' style={{
                  fontWeight: 800,
                  color: themes[theme].highlightColors[0]
                }} onClick={() => history.push('/community/highscore')}>highscore</a>.</p>
                <p>
              Before you start, please first have a <a className='customLink' style={{
                    fontWeight: 800,
                    color: themes[theme].highlightColors[0]
                  }} onClick={() => {
                    localStorage.setItem('chs_newToMod', 'true')
                    localStorage.setItem('chs_info_section', 'tutorial')
                  }}>quick look at a short tutorial video</a> to see how it works, then <b>come right back</b> to this page by clicking the back icon <IconArrowLeft style={{ paddingRight: 2 }} /> and start
              editing!
                </p>
                <Divider />
                <p>
                  <br />
                  <span>Last but not least, here are the most important rules for contributing:</span>
                  <ol>
                    <li><i>No Vandalism</i>: This is not the place to paint an alternative history map. Vandalism hurts the
                  project immensely (costly backups) and will get you banned.
                    </li>
                    <li>Your data inputs should be based on <i>accepted history</i> and you should be ready to cite sources
                  if asked.
                    </li>
                    <li><i>Report</i> users that break those rules in the <a className='customLink' style={{
                      fontWeight: 800,
                      color: themes[theme].highlightColors[0]
                    }} onClick={() => history.push('/community/issues')}>forum</a>.
                    </li>
                  </ol>
                </p>
              </CardText>
              <CardActions>
                <FlatButton
                  onClick={() => {
                    localStorage.setItem('chs_newToMod', 'true')
                    localStorage.setItem('chs_info_section', 'tutorial')
                  }} label={translate('pos.goTutorial')} />
                <FlatButton
                  onClick={() => {
                    localStorage.setItem('chs_newToMod', 'true')
                    this.forceUpdate()
                  }} label={translate('pos.skipTutorial')} />
              </CardActions>
            </Card>, route, commonProps, routeProps) }
        </Restricted>
      )
      return RestrictedPage
    }

    const resourceElements = resourceList.map((resourceKey) => {
      const commonProps = {
        options,
        hasList: !!resources[resourceKey].list,
        hasEdit: !!resources[resourceKey].edit,
        hasShow: !!resources[resourceKey].show,
        hasCreate: !!resources[resourceKey].create,
        hasDelete: !!resources[resourceKey].remove,
        resource: resourceKey,
      }

      let finalProps

      if (resourceKey === 'areas' || resourceKey === 'areasReplace') {
        finalProps = {
          ...commonProps,
          setModData,
          selectedYear,
          selectedItem,
          activeArea,
          metadata,
          handleClose: this.handleClose
        }
      } else if (resourceKey === 'metadata') {
        finalProps = {
          ...commonProps,
          setModData,
          selectedYear,
          selectedItem,
          activeArea,
          metadata,
          setModDataLng,
          setModDataLat,
          contentType: this.state.contentType,
          contentChoice: this.state.contentChoice,
          metadataType: this.state.metadataType,
          defaultEpicValues: this.state.defaultEpicValues,
          metadataEntity: this.state.metadataEntity,
          setMetadataEntity: this.setMetadataEntity,
          routeNotYetSetup: this.routeNotYetSetup,
          setMetadataType: this.setMetadataType,
          setSearchEpic: this.setSearchEpic,
          setContentType: this.setContentType,
          setSearchSnippet: this.setSearchSnippet,
          epicsChoice: this.state.epicsChoice
        }
      } else if (resourceKey === TYPE_MARKER) {
        finalProps = {
          ...commonProps,
          metadata,
          contentTypeRaw,
          selectedItem,
          selectedYear,
          setModDataLng,
          setModDataLat,
          actOnRootTypeChange: this.actOnRootTypeChange
        }
      } else if (resourceKey === TYPE_LINKED || resourceKey === TYPE_EPIC) {
        finalProps = {
          ...commonProps,
          actOnRootTypeChange: this.actOnRootTypeChange,
          contentTypeRaw,
          linkedItemData: this.state.linkedItemData,
          epicsChoice: this.state.epicsChoice,
          setSearchEpic: this.setSearchEpic,
          setSearchSnippet: this.setSearchSnippet,
          setLinkedItemData: this.setLinkedItemData,
          setRightDrawerVisibility: this.props.setRightDrawerVisibility,
          setData: this.props.setData,
          selectedItem,
          selectedYear,
          setModDataLng,
          setModDataLat,
          metadata,
          resource: 'metadata',
          history,
          translate
        }
      } else {
        finalProps = commonProps
      }

      const resItems = []

      if (resources[resourceKey].list) {
        resItems.push({
          d_path: '/mod/' + resourceKey,
          d_el: resources[resourceKey].list,
          d_sec: 'list',
          d_props: {
            ...finalProps,
            redirect: 'list'
          }
        })
      }

      if (resources[resourceKey].create) {
        resItems.push({
          d_path: '/mod/' + resourceKey + '/create',
          d_el: resources[resourceKey].create,
          d_sec: 'create',
          d_props: {
            ...finalProps,
            redirect: 'create'
          }
        })
      }

      if (resources[resourceKey].edit && resourceKey === 'revisions') {
        resItems.push({
          d_path: '/mod/' + resourceKey + ':id',
          d_el: resources[resourceKey].edit,
          d_sec: 'edit',
          d_props: {
            ...finalProps,
            redirect: 'edit'
          }
        })
      } else if (resources[resourceKey].edit) {
        resItems.push({
          d_path: '/mod/' + resourceKey,
          d_el: resources[resourceKey].edit,
          d_sec: 'edit',
          d_props: {
            ...finalProps,
            redirect: 'edit'
          }
        })
      }

      if (resources[resourceKey].show) {
        resItems.push({
          d_path: '/mod/' + resourceKey + '/:id/show',
          d_el: resources[resourceKey].show,
          d_sec: 'show',
          d_props: {
            ...finalProps,
            redirect: 'show'
          }
        })
      }

      if (resources[resourceKey].remove) {
        resItems.push({
          d_path: '/mod/' + resourceKey + '/:id/delete',
          d_el: resources[resourceKey].remove,
          d_sec: 'delete',
          d_props: {
            ...finalProps,
            redirect: 'delete'
          }
        })
      }

      return resItems
    }).reduce((acc, val) => acc.concat(val), []).concat([{
      d_path: '/article',
      d_el: Content,
      d_sec: '',
      d_props: {
        metadata,
        isLight,
        influenceRawData: rulerEntity,
        provinceEntity,
        stepIndex: stepIndex,
        setMetadataEntity: this.setMetadataEntity,
        setMetadataType: this.setMetadataType,
        setCollectionIndex: this.setCollectionIndex,
      }
    }, {
      d_path: '/mod',
      d_el: ModHome,
    }, {
      d_path: '/mod/links',
      d_el: ModLinksEdit,
      d_sec: 'create',
      d_props: {
        options,
        hasList: false,
        hasEdit: false,
        hasShow: false,
        hasCreate: true,
        hasDelete: false,
        resource: 'metadata',
        metadata,
        selectedItem,
        setModData,
        setRightDrawerVisibility: this.props.setRightDrawerVisibility,
        newWidth,
        // linkSetup: '',
        // prefilledLinked: false,
        // ensureLoadLinkedItem
        linkedItemData: this.state.linkedItemData,
        updateID: this.state.updateID,
        contentChoice: this.state.contentChoice,
        metadataEntity: this.state.metadataEntity,
        metadataType: this.state.metadataType,
        setLinkedItemData: this.setLinkedItemData,
        setSearchSnippet: this.setSearchSnippet,
        ensureLoadLinkedItem: this.ensureLoadLinkedItem,
        setContentType: this.setContentType,
        redirect: 'create',
        history
      }
    }, ])

    return (
      <div>
        <Switch>
          {resourceElements.map((dEl, index) => {
            if (dEl.d_path === '/article') {
              return <Route
                exact
                key={('rr' + index)}
                path={dEl.d_path}
                render={unrestrictPage(articleHeader, dEl.d_el, dEl.d_sec, dEl.d_props)}
              />
            } else {
              return <Route
                exact
                key={('rr' + index)}
                path={dEl.d_path}
                render={restrictPage(modHeader, dEl.d_el, dEl.d_sec, dEl.d_props)}
              />
            }
          }
          )}

        </Switch>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  modActive: state.modActive,
  activeArea: state.activeArea,
  rightDrawerOpen: state.rightDrawerOpen,
  selectedItem: state.selectedItem,
  selectedYear: state.selectedYear,
  userDetails: state.userDetails,
  metadata: state.metadata,
  locale: state.locale, // force redraw on locale change
  theme: state.theme, // force redraw on theme changes
})

const enhance = compose(
  connect(mapStateToProps,
    {
      setAreaColorLabel,
      setData,
      changeColor,
      setWikiId,
      selectEpicItem,
      selectValue,
      setFullItem,
      setYear,
      selectAreaItem,
      deselectItem: deselectItemAction,
      toggleRightDrawer: toggleRightDrawerAction,
      setModData: setModDataAction,
      setModDataLng: setModDataLngAction,
      setModDataLat: setModDataLatAction,
      selectLinkedItem,
      selectMarkerItem,
      setRightDrawerVisibility,
      showNotification
    }),
  pure,
  translate,
)

export default enhance(RightDrawerRoutes)
