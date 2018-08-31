import React, { createElement, PureComponent } from 'react'

import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import { Link, Route, Switch } from 'react-router-dom'
import pure from 'recompose/pure'
import axios from 'axios'
import { Restricted, translate } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { grey600, grey400, chronasDark } from '../../styles/chronasColors'
import Responsive from '../menu/Responsive'
import Content from './Content'
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from '../restricted/users'
import { ModLinksEdit } from './mod/ModLinksEdit'
import { ModAreasAll } from './mod/ModAreasAll'
import { ModMetaAdd } from './mod/ModMetaAdd'
import { ModMetaEdit } from './mod/ModMetaEdit'
import { MarkerList, MarkerCreate, MarkerEdit, MarkerDelete, MarkerIcon } from '../restricted/markers'
import { LinkedList, LinkedCreate, LinkedEdit, LinkedDelete, LinkedIcon } from '../restricted/linked'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { BottomNavigation } from 'material-ui/BottomNavigation'
import Paper from 'material-ui/Paper'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'
import IconEdit from 'material-ui/svg-icons/editor/mode-edit'
import IconClose from 'material-ui/svg-icons/navigation/close'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconDrag from 'material-ui/svg-icons/editor/drag-handle'
import IconArrowLeft from 'material-ui/svg-icons/navigation/chevron-left'
import BottomNavigationItem from '../overwrites/BottomNavigationItem'
import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../restricted/metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../restricted/revisions'
import { setRightDrawerVisibility } from './actionReducers'
import {
  TYPE_AREA, TYPE_MARKER, WIKI_RULER_TIMELINE, WIKI_PROVINCE_TIMELINE, setWikiId,
  selectValue, deselectItem as deselectItemAction, TYPE_LINKED, TYPE_EPIC, selectLinkedItem, selectAreaItem, selectMarkerItem
} from '../map/actionReducers'
import { RulerIcon, CultureIcon, ReligionIcon, ReligionGeneralIcon } from '../map/assets/placeholderIcons'
import { ModHome } from './mod/ModHome'
import {
  setModData as setModDataAction,
  setModDataLng as setModDataLngAction,
  setModDataLat as setModDataLatAction
} from './../restricted/shared/buttons/actionReducers'
import utilsQuery from '../map/utils/query'
import { changeColor, setAreaColorLabel } from '../menu/layers/actionReducers'
import { tooltip } from '../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../styles/chronasColors'
import utils from '../map/utils/general'
import { properties, themes } from '../../properties'

const nearbyIcon = <EditIcon />

const defaultIcons = {
  ruler: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png',
  religion: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png',
  religionGeneral: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of _Austria.svg.png',
  culture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png',
  capital: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png',
  province: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png',
}

const styles = {
  articleHeader: {
    height: '56px',
    overflow: 'hidden'
  },
  cardArticle: {
    paddingBottom: '0px',
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'rgb(255, 255, 255)',
    transition: 'transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    boxSizing: 'border-box',
    fontFamily: 'Cinzel, serif',
    boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    height: 'calc(40% - 40px)',
    width: '2254px',
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
}

const resources = {
  areas: { edit: ModAreasAll, permission: 1 },
  linked: { create: LinkedCreate, edit: LinkedEdit, remove: LinkedDelete, permission: 1 },
  markers: { create: MarkerCreate, edit: MarkerEdit, remove: MarkerDelete, permission: 1 },
  metadata: { create: ModMetaAdd, edit: ModMetaEdit, remove: MetadataDelete, permission: 1 },
  images: { create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 1 },
  users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 11 },
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
}

class RightDrawerRoutes extends PureComponent {
  constructor (props) {
    super(props)
    this._setPartOfItems = this._setPartOfItems.bind(this)
    this._openPartOf = this._openPartOf.bind(this)
    this.state = {
      contentType: '',
      searchText: '',
      updateID: 0,
      partOfEntities: [],
      linkedItemData: {},
      isFetchingSearch: false,
      contentChoice: [],
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

  setLinkedItemData = ({ linkedItemType1 = false, linkedItemType2 = false, linkedItemKey1 = false, linkedContent = false, linkedMedia = false } = {}) => {
    const prevLinkedItemData = this.state.linkedItemData

    if (linkedItemType1) prevLinkedItemData.linkedItemType1 = linkedItemType1 // "Albert_Einstein|politicians"
    if (linkedItemType2) prevLinkedItemData.linkedItemType2 = linkedItemType2
    if (linkedItemKey1) prevLinkedItemData.linkedItemKey1 = linkedItemKey1
    if (linkedContent) prevLinkedItemData.linkedContent = linkedContent
    if (linkedMedia) prevLinkedItemData.linkedMedia = linkedMedia

    this.setState({ linkedItemData: prevLinkedItemData })
  }

  setMetadataType = (metadataType) => {
    this.setState({ metadataType, metadataEntity: '' })
  }

  actOnRootTypeChange = (contentTypeRaw) => {
    const { location, history } = this.props
    const contentType = (contentTypeRaw.substr(0, 2) === 'w|') ? 'markers' : 'metadata'
    if (contentType === 'markers' && location.pathname.indexOf(contentType) === -1 && location.pathname.indexOf('/mod') !== -1) {
      history.push(location.pathname.replace('linked', 'markers'))
    } else if (contentType === 'metadata' && location.pathname.indexOf('linked') === -1 && location.pathname.indexOf('/mod') !== -1) {
      history.push(location.pathname.replace('markers', 'linked'))
    }
  }

  setContentType = (contentTypeRaw) => {
    const contentType = (contentTypeRaw.substr(0, 2) === 'w|') ? 'markers' : 'metadata'
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

  setSearchSnippet = (searchText, contentTypeRaw = false, stateItem = false, includeMarkers = true) => {
    // contentChoice
    if (searchText.length > 2) {
      if (!this.state.isFetchingSearch || new Date().getTime() - this.state.isFetchingSearch > 3000) {
        this.setState({ isFetchingSearch: new Date().getTime() })
        axios.get(properties.chronasApiHost + '/markers?both=true&search=' + searchText + '&includeMarkers=' + includeMarkers)
          .then(response => {
            if (stateItem) {
              const newlinkedItemData = this.state.linkedItemData
              newlinkedItemData[stateItem] = response.data.map((el) => {
                return { id: el[0] + '||' + el[2], name: properties.typeToDescriptedType[el[2]] + ': ' + el[1] }
              })

              this.setState({
                isFetchingSearch: false,
                linkedItemData: newlinkedItemData
              })
            } else {
              this.setState({
                isFetchingSearch: false,
                contentChoice: response.data.map((el) => {
                  return { id: el[0] + '||' + el[2], name: properties.typeToDescriptedType[el[2]] + ': ' + el[1] }
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
    const newrouteKey = location.pathname + activeArea.color + selectedItem.value

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

        axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=' + ((properties.markersTypes.includes(newArr1[1])) ? '0:' : '1:') + ((newArr1[1].indexOf('ae|') > -1) ? (newArr1[1] + '|') : '') + newArr1[0])
          .then((res) => {
            if (res.status === 200) {
              const linkedItemResult = res.data
              const linkedItemData = this.state.linkedItemData

              linkedItemData.linkedMedia = []
              linkedItemData.linkedContent = []

              linkedItemResult['map'].forEach((el) => {
                linkedItemData.linkedContent.push(el.properties.w + '||' + el.properties.t)
                  // linkedItemData.linkedMedia.push({ name: (el.properties.w  + '(' + el.properties.t + ')'), id: el.properties.w })
              })

              linkedItemResult.media.forEach((el) => {
                linkedItemData.linkedMedia.push(el.properties.w + '||' + el.properties.t)
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
              showNotification('No linked items found yet')
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
            'participants': rawDefault.data.participants.map(pTeam => { return { 'participantTeam': pTeam.map(pParticipant => { return { 'name': pParticipant/*, 'value': pParticipant */} }) } }),
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
    document.addEventListener('mousemove', e => this.handleMousemove(e), false)
    document.addEventListener('mouseup', e => this.handleMouseup(e), false)
  }
  handleMouseup = e => {
    this.setState({ isResizing: false })
    window.removeEventListener('mousemove', e => this.handleMousemove(e), false)
    window.removeEventListener('mouseup', e => this.handleMouseup(e), false)
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

    if (selectedItem.type === TYPE_MARKER || selectedItem.type === TYPE_LINKED) {
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        const offsetTop = e.clientY
        const minHeight = +document.body.offsetHeight * 0.24
        const maxHeight = +document.body.offsetHeight - 160
        const stateToUpdate = { newMarkerWidth: offsetRight, newMarkerPartOfWidth: offsetRight - 80 }

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
    if (selectedItem.type === TYPE_AREA) {
      const selectedProvince = selectedItem.value
      // is rulerEntity loaded?
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
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

  componentWillReceiveProps (nextProps) {
    // TODO: this gets called too much!
    const { activeArea, location, metadata, selectedItem } = this.props
    if (
      (!(nextProps.selectedItem.type === TYPE_EPIC &&
        selectedItem.type === TYPE_EPIC) &&
        (nextProps.selectedItem.wiki !== selectedItem.wiki || nextProps.selectedItem.value !== selectedItem.value || nextProps.activeArea.color !== activeArea.color)) // don't load twice with type_epic
    ) {
      this._handleNewData(nextProps.selectedItem, nextProps.activeArea)
    }
    if (location.pathname !== nextProps.location.pathname) {
      if (nextProps.location.pathname === '/mod/links' && nextProps.selectedItem) {
        let prefilledId = ''
        if (nextProps.selectedItem.type === TYPE_AREA) {
          const activeAreaDim = (nextProps.activeArea.color === 'population') ? 'capital' : nextProps.activeArea.color
          const activeprovinceValue = utils.getAreaDimKey(metadata, nextProps.activeArea, nextProps.selectedItem)
          prefilledId = activeprovinceValue + '||ae|' + activeAreaDim
        } else {
          prefilledId = ((nextProps.selectedItem.type === TYPE_EPIC) ? 'e_' : '') + nextProps.selectedItem.wiki + '||' + (nextProps.selectedItem.value.type || nextProps.selectedItem.type)
        }
        this.ensureLoadLinkedItem(prefilledId, true) // adopt to new standard
      } else if (location.pathname === '/mod/links') {
        this.setState({ linkedItemData: {} })
      }

      this.setState({
        selectedIndex: menuIndexByLocation[nextProps.location.pathname]
      })
    }

    const { rightDrawerOpen, setRightDrawerVisibility } = this.props
    console.debug('### MAP rightDrawerOpen', this.props, nextProps)

    /** Acting on store changes **/
    if (rightDrawerOpen !== nextProps.rightDrawerOpen) {
      if (rightDrawerOpen) {
        console.debug('rightDrawer Closed')
        this.setState({ hiddenElement: true })
      } else {
        console.debug('rightDrawer Opened')
        this.setState({ hiddenElement: false })
      }
    }

    if (nextProps.location.pathname.indexOf('/mod') > -1 ||
      nextProps.location.pathname.indexOf('/article') > -1) {
      if (!nextProps.rightDrawerOpen && ((nextProps.selectedItem.type !== TYPE_MARKER && nextProps.selectedItem.type !== TYPE_LINKED) || nextProps.location.pathname.indexOf('/article') === -1)) {
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
    console.debug('### RightDrawerRoutes mounted with props', this.props)
    this._handleNewData(this.props.selectedItem, this.props.activeArea)
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', e => this.handleMousemove(e), false)
    window.removeEventListener('mouseup', e => this.handleMouseup(e), false)
  }

  _getFullIconURL (iconPath) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + iconPath + '/100px-' + iconPath.substr(iconPath.lastIndexOf('/') + 1) + ((iconPath.toLowerCase().indexOf('svg') > -1) ? '.PNG' : '')
  }

  _setPartOfItems (items) {
    this.setState({ partOfEntities: items })
  }

  _openPartOf (el) {
    console.debug(el)
    const { activeArea, changeColor, selectAreaItem, selectLinkedItem, history } = this.props

    const aeId = ((el || {}).properties || {}).aeId
    if (aeId) {
      const [ ae, colorToSelect, rulerToHold ] = aeId.split('|')
      const nextData = activeArea.data
      const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold) // TODO: go on here
      if (provinceWithOldRuler) {
        selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
        if (colorToSelect !== activeArea.color) {
          changeColor(colorToSelect)
        }
      }
    } else {
      selectLinkedItem(el.properties.w)
    }
    history.push('/article')
  }

  render () {
    const {
      options, setWikiId, setRightDrawerVisibility, theme,
      selectedYear, selectedItem, activeArea, setAreaColorLabel, location,
      setModData, setModDataLng, setModDataLat, history, metadata, changeColor, translate
    } = this.props
    const { newWidth, newMarkerWidth, newMarkerPartOfWidth, newMarkerPartOfHeight, rulerEntity, provinceEntity, partOfEntities } = this.state

    if ((typeof selectedItem.wiki === 'undefined')) return null

    const isMarker = (selectedItem.type === TYPE_MARKER || selectedItem.type === TYPE_LINKED) && location.pathname.indexOf('/article') > -1
    const isEpic = (selectedItem.type === TYPE_EPIC) && location.pathname.indexOf('/article') > -1
    const currPrivilege = +localStorage.getItem('chs_privilege')
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege)
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
            label='Markers & Media'
            icon={nearbyIcon}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            themeBackColors={themes[theme].backColors[1]}
            className='bottomNavigationItem'
            containerElement={<Link to='/mod/areas' />}
            label='Area'
            icon={nearbyIcon}
            // onClick={() => { this.select(4) }}
          />
        </BottomNavigation>
      }
      iconElementRight={
        <div style={{ ...styles.iconElementRightStyle, backgroundColor: themes[theme].backColors[0] }}>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
            onClick={() => this.handleBack()}>
            <IconBack />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
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

    let entityPop = 0,
      totalPop = 0

    if (activeArea.color === 'ruler') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[0] === rulerId) entityPop += currPop
      })
    } else if (activeArea.color === 'culture') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[1] === cultureId) entityPop += currPop
      })
    } else if (activeArea.color === 'religion') {
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[2] === religionId) entityPop += currPop
      })
    } else if (activeArea.color === 'religionGeneral') {
      const religionGeneralId = metadata['religion'][religionId][3]
      Object.keys(activeArea.data).forEach((key) => {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((metadata['religion'][(activeArea.data[key] || {})[2]] || {})[3] === religionGeneralId) entityPop += currPop
      })
    }

    const entityObject = {
      ruler: metadata['ruler'][rulerId],
      religion: (metadata['religion'][religionId] || {}),
      religionGeneral: metadata['religionGeneral'][metadata['religion'][religionId][3]] || {},
      culture: (metadata['culture'][cultureId] || {}),
      capital: ((metadata['capital'][(activeArea.data[selectedProvince] || {})[3]]) || {}),
      province: (metadata['province'][selectedProvince] || {}),
    }
    const entityMeta = {
      ruler: {
        name: entityObject.ruler[0] || 'n/a', icon: entityObject.ruler[3] || defaultIcons.ruler
      },
      religion: {
        name: entityObject.religion[0] || 'n/a', icon: entityObject.religion[4] || defaultIcons.religion
      },
      religionGeneral: {
        name: entityObject.religionGeneral[0] || 'n/a',
        icon: entityObject.religionGeneral[3] || defaultIcons.religionGeneral
      },
      culture: {
        name: entityObject.culture[0] || 'n/a', icon: entityObject.culture[3] || defaultIcons.culture
      },
      capital: {
        name: entityObject.capital[0] || 'n/a', icon: entityObject.capital[1] || defaultIcons.capital
      },
      province: {
        name: entityObject.province[0] || 'n/a', icon: entityObject.province[1] || defaultIcons.province
      }
    }

    const modUrl = '/mod/' + selectedItem.type

    const articleHeader = <AppBar
      className='articleHeader'
      style={{ ...styles.articleHeader, backgroundColor: themes[theme].backColors[0] }}
      iconElementLeft={
        (selectedItem.type === TYPE_AREA) ? <BottomNavigation
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
              title={selectedProvince}
              subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
              titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
              style={styles.cardHeader.style}
              subtitle='Summary'
              avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]} icon={<RulerIcon viewBox={'0 0 64 64'} />} />/*this._getFullIconURL(entityMeta.ruler.icon)*/}
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
              subtitle='Ruler'
              avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]} icon={<RulerIcon viewBox={'0 0 64 64'} />} />/*this._getFullIconURL(entityMeta.ruler.icon)*/}
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
              subtitle='Culture'
              avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]} icon={<CultureIcon viewBox={'0 0 64 64'} />} />/*this._getFullIconURL(entityMeta.ruler.icon)*/}
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
              title={entityMeta.religion.name + ' [' + entityMeta.religionGeneral.name + ']'}
              subtitleStyle={{ ...styles.cardHeader.titleStyle, color: themes[theme].foreColors[1] }}
              titleStyle={{ ...styles.cardHeader.textStyle, color: themes[theme].foreColors[0] }}
              style={styles.cardHeader.style}
              subtitle='Religion'
              avatar={<Avatar color={themes[theme].foreColors[0]} backgroundColor={themes[theme].backColors[1]} icon={<ReligionGeneralIcon viewBox={'0 0 200 168'} />} />/*this._getFullIconURL(entityMeta.ruler.icon)*/}
            />}
          />
        </BottomNavigation> : null
      }
      iconElementRight={
        <div style={{ ...styles.iconElementRightStyle, backgroundColor: themes[theme].backColors[0] }}>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            containerElement={<Link to={modUrl} />}><IconEdit />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleBack()}>
            <IconBack />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleClose()}>
            <IconClose />
          </IconButton>
        </div>
      }
    />
    /* <Restricted authParams={{ foo: 'bar' }} location={{ pathname: 'article' }}>  TODO: do pathname dynamicaly*!/ */

    const CoreContent = (headerComponent, component, route, commonProps, routeProps) => (
      <Responsive
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
          isMarker ? <div><Card
            style={{ ...styles.cardArticle, width: this.state.newMarkerWidth, height: this.state.newMarkerHeight }}
            containerStyle={{ height: '100%' }}
          >
            <RaisedButton
              className={(isMarker) ? 'dragHandle markerHandle' : 'dragHandle'}
              icon={(isMarker) ? <IconArrowLeft /> : <IconDrag />}
              style={(isMarker) ? { ...styles.draggableButtonDiv, top: 'calc(100% - 20px)', left: '20px', minWidth: 'inherit', transform: 'inherit' } : styles.draggableButtonDiv}
              labelStyle={{ width: '640px' }}
              rippleStyle={{ width: '440px' }}
              buttonStyle={styles.draggableButton}
              onMouseDown={event => {
                this.handleMousedown(event)
              }}
            />
            <div style={{ display: 'inline', pointerEvents: (this.state.isResizing) ? 'none' : 'inherit' }}>
              {component && createElement(component, {
                ...commonProps,
                ...routeProps
              })}
            </div>
          </Card>
            { partOfEntities && partOfEntities.length !== 0 && <div style={{ ...styles.partOfDiv, width: this.state.newMarkerPartOfWidth, top: this.state.newMarkerPartOfHeight }}>
              <CardActions style={{ textAlign: 'center' }}>
                { (partOfEntities.length === 1) ? <FlatButton
                  style={{ color: '#fff' }}
                  backgroundColor='rgb(255, 64, 129)'
                  hoverColor='#8AA62F'
                  onClick={() => this._openPartOf(partOfEntities[0])}
                  label={'Part of ' + ((partOfEntities[0].properties || {}).n || (partOfEntities[0].properties || {}).w || '').toString().toUpperCase()} />
              : <SelectField
                floatingLabelText={translate('pos.related_item')}
                hintText={translate('pos.related_item')}
                value={null}
                onChange={(event, index, value) => { this._openPartOf(value) }}
              >
                { partOfEntities.map((el) => {
                  return <MenuItem value={el} primaryText={((el.properties || {}).n || (el.properties || {}).w || '').toString().toUpperCase()} />
                })}
              </SelectField>
              }
              </CardActions>
            </div>}
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
              // onTouchTap={(event) => console.debug('touchtap', event)}
              // onMouseDown={this.handleMouseDown.bind(this)}
              // onMouseOver={this.handleMouseOver.bind(this)}
              // onMouseUp={this.handleMouseUp.bind(this)}
              // onClick={(event) => console.debug('onClick', event)}
            />
            <div style={{ display: 'inline', pointerEvents: (this.state.isResizing) ? 'none' : 'inherit' }}>
              { !isEpic && headerComponent}
              {component && createElement(component, {
                ...commonProps,
                ...routeProps
              })}
            </div>
          </Drawer>
        }
      />
    )

    const unrestrictPage = (headerComponent, component, route, commonProps) => {
      const UnrestrictedPage = routeProps => (
        <div>
          { CoreContent(headerComponent, component, route, commonProps, routeProps) }
        </div>
      )
      return UnrestrictedPage
    }

    const restrictPage = (headerComponent, component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'mod/areas' }} authParams={{ foo: 'bar' }} {...routeProps}>
          { CoreContent(headerComponent, component, route, commonProps, routeProps) }
        </Restricted>
      )
      return RestrictedPage
    }

    return (
      <div>
        <Switch>
          <Route
            exact
            path={'/article'}
            render={unrestrictPage(articleHeader, Content, '', {
              // setPartOfEntities,
              metadata,
              rulerEntity,
              provinceEntity,
              selectedYear,
              newWidth,
              setPartOfItems: this._setPartOfItems,
              history
            })}
          />
          <Route
            exact
            path={'/mod'}
            render={restrictPage(modHeader, ModHome)}
          />
          <Route
            exact
            path={'/mod/links'}
            render={restrictPage(modHeader, ModLinksEdit, 'create', {
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
            })}
          />
        </Switch>
        {resourceList.map((resourceKey) => {
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

          if (resourceKey === 'areas') {
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
            finalProps = { ...commonProps,
              selectedItem,
              selectedYear,
              setModDataLng,
              setModDataLat,
              actOnRootTypeChange: this.actOnRootTypeChange }
          } else if (resourceKey === TYPE_LINKED || resourceKey === TYPE_EPIC) {
            finalProps = {
              ...commonProps,
              selectedItem,
              selectedYear,
              setModDataLng,
              setModDataLat,
              actOnRootTypeChange: this.actOnRootTypeChange,
              resource: 'metadata',
              history
            }
          } else {
            finalProps = commonProps
          }

          return (<Switch key={'rightDrawer_' + resourceKey} style={{ zIndex: 20000 }}>
            {resources[resourceKey].create && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/create'}
                render={restrictPage(modHeader, resources[resourceKey].create, 'create', {
                  ...finalProps,
                  redirect: 'create'
                })}
              />
            )}
            {resources[resourceKey].edit && (
              <Route
                exact
                path={'/mod/' + resourceKey}
                render={restrictPage(modHeader, resources[resourceKey].edit, 'edit', finalProps)}
              />
            )}
            {resources[resourceKey].show && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/:id/show'}
                render={restrictPage(modHeader, resources[resourceKey].show, 'show', finalProps)}
              />
            )}
            {resources[resourceKey].remove && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/:id/delete'}
                render={restrictPage(modHeader, resources[resourceKey].remove, 'delete', finalProps)}
              />
            )}
          </Switch>)
        })}
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
  metadata: state.metadata,
  locale: state.locale, // force redraw on locale change
  theme: state.theme, // force redraw on theme changes
})

const enhance = compose(
  connect(mapStateToProps,
    {
      setAreaColorLabel,
      changeColor,
      setWikiId,
      selectValue,
      selectAreaItem,
      deselectItem: deselectItemAction,
      toggleRightDrawer: toggleRightDrawerAction,
      setModData: setModDataAction,
      setModDataLng: setModDataLngAction,
      setModDataLat: setModDataLatAction,
      selectLinkedItem,
      selectMarkerItem,
      setRightDrawerVisibility
    }),
  pure,
  translate,
)

export default enhance(RightDrawerRoutes)
