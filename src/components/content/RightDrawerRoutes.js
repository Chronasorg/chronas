import React, { createElement, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import FontIcon from 'material-ui/FontIcon'
import Chip from 'material-ui/Chip'
import { Link, Route, Switch } from 'react-router-dom'
import pure from 'recompose/pure'
import axios from 'axios'
import { Restricted, translate } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { grey600, grey400, chronasDark } from '../../styles/chronasColors'
import Responsive from '../menu/Responsive'
import Content from './Content'
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from '../restricted/users'
import { ModAreasAll } from './mod/ModAreasAll'
import { ModMetaAdd } from './mod/ModMetaAdd'
import { ModMetaEdit } from './mod/ModMetaEdit'
import { AreaList, AreaCreate, AreaEditAll, AreaDelete, AreaIcon } from '../restricted/areas'
import { MarkerList, MarkerCreate, MarkerEdit, MarkerDelete, MarkerIcon } from '../restricted/markers'
import { LinkedList, LinkedCreate, LinkedEdit, LinkedDelete, LinkedIcon } from '../restricted/linked'
// import MarkerCreate from '../restricted/markers/MarkerCreate'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {BottomNavigation } from 'material-ui/BottomNavigation';
import BottomNavigationItem from '../overwrites/BottomNavigationItem'
import Paper from 'material-ui/Paper';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import IconEdit from 'material-ui/svg-icons/editor/mode-edit';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconDrag from 'material-ui/svg-icons/editor/drag-handle';

const nearbyIcon = <IconLocationOn />;

import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../restricted/metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../restricted/revisions'
import { setRightDrawerVisibility } from './actionReducers'
import {
  TYPE_AREA, TYPE_MARKER, WIKI_RULER_TIMELINE, WIKI_PROVINCE_TIMELINE, setWikiId,
  deselectItem as deselectItemAction, TYPE_LINKED, TYPE_EPIC
} from '../map/actionReducers'
import { ModHome } from './mod/ModHome'
import { setModData as setModDataAction, setModDataLng as setModDataLngAction, setModDataLat as setModDataLatAction } from './../restricted/shared/buttons/actionReducers'
import utilsQuery from '../map/utils/query'
import { changeColor, setAreaColorLabel } from '../menu/layers/actionReducers'
import { tooltip } from '../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../styles/chronasColors'
import utils from "../map/utils/general";
import properties from "../../properties";

const styles = {
  articleHeader: {
    backgroundColor: '#eceff1',
    height: '56px'
  },
  iconElementRightStyle: {
    backgroundColor: '#eceff1',
    position: 'fixed',
    whiteSpace:  'nowrap',
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
      overflow: 'hidden',
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
  'population': 4,
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
  '/mod/metadata/create': 1,
  '/mod/areas': 2,
  '/mod/markers': 3,
  '/mod/metadata': 4,
}
class RightDrawerRoutes extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isResizing: false,
      lastDownX: 0,
      newWidth: '50%',
      hiddenElement: true,
      metadataType: '',
      metadataEntity: '',
      selectedIndex: -1,
      rulerEntity: {
        "id": null,
        "data": null
      },
      provinceEntity: {
        "id": null,
        "data": null
      },
      epicData: {
        "id": null,
        "data": null,
        "rulerEntities": []
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    // TODO: this gets called too much!
    this._handleNewData(nextProps.selectedItem, nextProps.activeArea)
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({
        selectedIndex: menuIndexByLocation[nextProps.location.pathname] || -1
      })
    }

    const { rightDrawerOpen, setRightDrawerVisibility } = this.props
    console.debug('### MAP rightDrawerOpen', this.props, nextProps)

    /** Acting on store changes **/
    if (rightDrawerOpen != nextProps.rightDrawerOpen) {
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
      if (!nextProps.rightDrawerOpen) {
        setRightDrawerVisibility(true)
      }
    }
  }

  setMetadataType = (metadataType) => {
    this.setState({ metadataType })
  }

  setMetadataEntity = (metadataEntity) => {
    this.setState({ metadataEntity })
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
    this.setState({ isResizing: true, lastDownX: e.clientX });
    document.addEventListener('mousemove', e => this.handleMousemove(e), false);
    document.addEventListener('mouseup', e => this.handleMouseup(e), false);
  }

  handleMouseup = e => {
    this.setState({ isResizing: false })
    window.removeEventListener('mousemove', e => this.handleMousemove(e), false);
    window.removeEventListener('mouseup', e => this.handleMouseup(e), false);
  }

  handleMousemove = e => {
    // this shouldnt be called anyway if not resizing (eventlistener unregister!)
    if (!this.state.isResizing) {
      return;
    }

    let offsetRight =
      document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
    let minWidth = +document.body.offsetWidth * 0.24
    let maxWidth = +document.body.offsetWidth - 160
    if (offsetRight > minWidth && offsetRight < maxWidth) {
      this.setState({ newWidth: offsetRight });
    }
  }

  select = (index) => this.setState({selectedIndex: index})

  _handleNewData = (selectedItem, activeArea = {}) => {
    if (selectedItem.type === TYPE_AREA) {
      const selectedProvince = selectedItem.value
      // is rulerEntity loaded?
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
      const activeRulDim = (activeAreaDim === 'religionGeneral')
        ? this.props.metadata['religion'][((activeArea.data || {})[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]][3]
        : ((activeArea.data || {})[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]
      if (this.state.rulerEntity.id !== activeRulDim) {
        axios.get(properties.chronasApiHost + '/metadata/a_' + activeAreaDim + '_' + activeRulDim)
          .then((newRulerEntity) => {
            this.setState({ rulerEntity: {
                id: activeRulDim,
                data: newRulerEntity.data.data
              }})
          })
      }
      else if (selectedItem.wiki === WIKI_PROVINCE_TIMELINE && this.state.provinceEntity.id !== activeRulDim) {
        axios.get(properties.chronasApiHost + '/metadata/ap_' + selectedProvince.toLowerCase() + '?type=ap')
          .then((newProvinceEntity) => {
            this.setState({ provinceEntity: {
                id: selectedProvince,
                data: newProvinceEntity.data.data
              }})
          })
      }
    } else if (selectedItem.type === TYPE_EPIC) {
      const epicWiki = selectedItem.wiki
      axios.get(properties.chronasApiHost + '/metadata/e_' + window.encodeURIComponent(epicWiki))
        .then((newEpicEntitiesRes) => {
          const newEpicEntities = newEpicEntitiesRes.data
          console.debug(newEpicEntities, newEpicEntitiesRes)

          const teamMapping = {}
          const rulerPromises = []
          newEpicEntities.data.participants.forEach((team, teamIndex) => {
            team.forEach((participant) => {
              teamMapping[participant] = teamIndex
              rulerPromises.push(axios.get(properties.chronasApiHost + '/metadata/a_ruler_' + participant))
            })
          })

          axios.all(rulerPromises)
            .then(axios.spread((...args) => {
              console.debug({
                id: newEpicEntities._id,
                data: newEpicEntities,
                rulerEntities: args.map(res => res.data)
              })

              this.setState({ epicData: {
                  id: newEpicEntities._id,
                  data: newEpicEntities,
                  rulerEntities: args.map(res => res.data)
                }})
            }))
        })
    }
  }

  componentDidMount(){
    console.debug('### RightDrawerRoutes mounted with props', this.props)
    this._handleNewData(this.props.selectedItem, this.props.activeArea)
    // window.addEventListener('mousemove', this.handleMouseOver.bind(this), false);
    // window.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
  }
  componentWillUnmount(){
    window.removeEventListener('mousemove', e => this.handleMousemove(e), false);
    window.removeEventListener('mouseup', e => this.handleMouseup(e), false);
  }

  render() {
    const { list, create, edit, show, remove, options, onMenuTap,
      translate, rightDrawerOpen, deselectItem, setWikiId, setRightDrawerVisibility,
      selectedYear, selectedItem, activeArea, children, muiTheme, setAreaColorLabel,
      setModData, setModDataLng, setModDataLat, location, history, metadata, changeColor } = this.props
    const { newWidth, rulerEntity, provinceEntity, epicData } = this.state

    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )
    const modHeader = <AppBar
      className='articleHeader'
      style={ styles.articleHeader }
      iconElementLeft={
        <BottomNavigation
        style={ styles.articleHeader }
        onChange={this.handleChange}
        selectedIndex={ this.state.selectedIndex }>
          <BottomNavigationItem
            className='bottomNavigationItem'
            containerElement={<Link to="/mod/markers/create" />}
            label="Add Marker"
            icon={nearbyIcon}
            onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            className='bottomNavigationItem'
            containerElement={<Link to="/mod/metadata/create" />}
            label="Add Entity"
            icon={nearbyIcon}
            onClick={() => { this.select(1) }}
          />
          <BottomNavigationItem
            className='bottomNavigationItem'
            containerElement={<Link to="/mod/areas" />}
            label="Edit Entity"
            icon={nearbyIcon}
            onClick={() => { this.select(2) }}
          />
          <BottomNavigationItem
            className='bottomNavigationItem'
            containerElement={<Link to="/mod/markers" />}
            label="Edit Marker"
            icon={nearbyIcon}
            onClick={() => this.select(3)}
          />
          <BottomNavigationItem
            className='bottomNavigationItem'
            containerElement={<Link to="/mod/metadata" />}
            label="Edit Meta"
            icon={nearbyIcon}
            onClick={() => this.select(4)}
          />
        </BottomNavigation>
      }
      iconElementRight={
        <div style={styles.iconElementRightStyle}>
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

    const selectedProvince = selectedItem.value

    const rulerId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')]
    const cultureId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')]
    const religionId = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')]

    // we need metadata to be loaded before we can render this component
    if (typeof metadata['ruler'] === 'undefined' || Object.keys(activeArea.data).length === 0) return null

    let entityPop = 0,
      totalPop = 0

    if (activeArea.color === 'ruler') {
      Object.keys(activeArea.data).forEach((key)=> {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[0] === rulerId) entityPop += currPop
      })
    } else if (activeArea.color === 'culture') {
      Object.keys(activeArea.data).forEach((key)=> {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[1] === cultureId) entityPop += currPop
      })
    } else if (activeArea.color === 'religion') {
      Object.keys(activeArea.data).forEach((key)=> {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((activeArea.data[key] || {})[2] === religionId) entityPop += currPop
      })
    } else if (activeArea.color === 'religionGeneral') {
      const religionGeneralId = metadata['religion'][religionId][3]
      Object.keys(activeArea.data).forEach((key)=> {
        const currPop = (activeArea.data[key] || {})[4] || 0
        totalPop += currPop
        if ((metadata['religion'][(activeArea.data[key] || {})[2]] || {})[3] === religionGeneralId) entityPop += currPop
      })
    }

    const rulerName = metadata['ruler'][rulerId][0]
    const religionName = (metadata['religion'][religionId] || {})[0] || 'n/a'
    const religionGeneralName = metadata['religionGeneral'][metadata['religion'][religionId][3]][0]
    const cultureName = (metadata['culture'][cultureId] || {})[0] || 'n/a'
    const capitalName = (activeArea.data[selectedProvince] || {})[3] + '[' + (activeArea.data[selectedProvince] || {})[4] + ']'
    const populationName = entityPop + ' [' + parseInt(entityPop / totalPop * 1000) / 10 + '%]'

    const modUrl = '/mod/' + selectedItem.type

    const articleHeader = <AppBar
      className='articleHeader'
      style={ styles.articleHeader }
      iconElementLeft={
        (selectedItem.type === TYPE_AREA) ? <BottomNavigation

          style={ styles.articleHeader }
          onChange={this.handleChange}
          selectedIndex={ (selectedItem.wiki === WIKI_PROVINCE_TIMELINE)
            ? 0
            : selectedIndexObject[activeArea.color] }>
          <BottomNavigationItem
            onClick={() => { setWikiId(WIKI_PROVINCE_TIMELINE); setAreaColorLabel('ruler', 'ruler') }}
            className='bottomNavigationItem'
            icon={<CardHeader
              title={ selectedProvince }
              titleStyle={ styles.cardHeader.titleStyle }
              subtitleStyle={ styles.cardHeader.titleStyle }
              textStyle={ styles.cardHeader.textStyle }
              style={ styles.cardHeader.style }
              subtitle={ 'Summary' }
              avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
            />}
          />
          <BottomNavigationItem
            onClick={() => { setWikiId(''); setAreaColorLabel('ruler', 'ruler') }}
            className='bottomNavigationItem'
            icon={<CardHeader
                title={ rulerName }
                titleStyle={ styles.cardHeader.titleStyle }
                subtitleStyle={ styles.cardHeader.titleStyle }
                textStyle={ styles.cardHeader.textStyle }
                style={ styles.cardHeader.style }
                subtitle="Ruler"
                avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
              />}
          />
          <BottomNavigationItem
            onClick={() => { setWikiId(''); setAreaColorLabel('culture', 'culture') }}
            className='bottomNavigationItem'
            icon={<CardHeader
              title={ cultureName }
              titleStyle={ styles.cardHeader.titleStyle }
              textStyle={ styles.cardHeader.textStyle }
              style={ styles.cardHeader.style }
              subtitle="Culture"
              avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
            />}
          />
          <BottomNavigationItem
            onClick={() => { setWikiId(''); setAreaColorLabel('religion','religion') }}
            className='bottomNavigationItem'
            icon={<CardHeader
              title={ religionName + ' [' + religionGeneralName + ']' }
              titleStyle={ styles.cardHeader.titleStyle }
              subtitleStyle={ styles.cardHeader.titleStyle }
              textStyle={ styles.cardHeader.textStyle }
              style={ styles.cardHeader.style }
              subtitle="Religion"
              avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
            />}
          />
          <BottomNavigationItem
            onClick={() => { setWikiId(''); changeColor('population') }}
            className='bottomNavigationItem'
            icon={<CardHeader
              title={ capitalName }
              titleStyle={ styles.cardHeader.titleStyle }
              subtitleStyle={ styles.cardHeader.titleStyle }
              textStyle={ styles.cardHeader.textStyle }
              style={ styles.cardHeader.style }
              subtitle="Capital"
              avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
            />}
          />
          <BottomNavigationItem
            onClick={() => { setWikiId(''); changeColor('population')} }
            className='bottomNavigationItem'
            icon={<CardHeader
              title={ populationName }
              titleStyle={ styles.cardHeader.titleStyle }
              textStyle={ styles.cardHeader.textStyle }
              style={ styles.cardHeader.style }
              subtitle="Population"
              avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/125px-Flag_of_Austria.svg.png"
            />}
            // onClick={() => this.select(0)}
          />
        </BottomNavigation> : null
      }
      iconElementRight={
        <div style={styles.iconElementRightStyle}>
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
    /*<Restricted authParams={{ foo: 'bar' }} location={{ pathname: 'article' }}>  TODO: do pathname dynamicaly*!/*/
    const restrictPage = (headerComponent, component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'mod/areas' }}  authParams={{ foo: 'bar' }} {...routeProps}>
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
                  ...routeProps,
                })}
              </Drawer>
            }
            medium={
              <Drawer
                openSecondary
                open
                containerStyle={{ overflow: 'none'/*, zIndex: 10002*/}}
                style={{ overflow: 'none', zIndex: 9 }}
                width={this.state.newWidth}
                overlayStyle={{ /*zIndex: 10001*/}}
              >
                <RaisedButton
                  className='dragHandle'
                  icon={<IconDrag />}
                  style={styles.draggableButtonDiv}
                  rippleStyle={{ width: '20px'}}
                  buttonStyle={styles.draggableButton}
                  onMouseDown={event => {
                    this.handleMousedown(event);
                  }}
                  // onTouchTap={(event) => console.debug('touchtap', event)}
                  // onMouseDown={this.handleMouseDown.bind(this)}
                  // onMouseOver={this.handleMouseOver.bind(this)}
                  // onMouseUp={this.handleMouseUp.bind(this)}
                  // onClick={(event) => console.debug('onClick', event)}
                />
                <div style={{ display: 'inline', pointerEvents: (this.state.isResizing) ? 'none' : 'inherit' }}>
                  {headerComponent}
                  {component && createElement(component, {
                    ...commonProps,
                    ...routeProps,
                  })}
                </div>
              </Drawer>
            }
          />
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
            render={restrictPage(articleHeader, Content, '', { metadata, rulerEntity, provinceEntity, epicData, selectedYear, newWidth, history } )}
        />
          <Route
            exact
            path={'/mod'}
            render={restrictPage(modHeader, ModHome)}
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
            finalProps = { ...commonProps, setModData, selectedYear, selectedItem, activeArea, metadata, handleClose: this.handleClose }
          } else if (resourceKey === 'metadata') {
            finalProps = { ...commonProps, setModData, selectedYear, selectedItem, activeArea, metadata, metadataType: this.state.metadataType, metadataEntity: this.state.metadataEntity, setMetadataEntity: this.setMetadataEntity, setMetadataType: this.setMetadataType }
          } else if (resourceKey === TYPE_MARKER) {
            finalProps = { ...commonProps, selectedItem, selectedYear, setModDataLng, setModDataLat }
          } else if (resourceKey === TYPE_LINKED) {
            finalProps = { ...commonProps, selectedItem, selectedYear, setModDataLng, setModDataLat, resource: 'metadata' }
          } else {
            finalProps = commonProps
          }

          return (<Switch key={'rightDrawer_' + resourceKey} style={{ zIndex: 20000 }}>
            {resources[resourceKey].create && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/create'}
                render={restrictPage(modHeader, resources[resourceKey].create, 'create', {...finalProps, redirect: 'create'})}
              />
            )}
            {resources[resourceKey].edit && (
              <Route
                exact
                path={'/mod/' + resourceKey }
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
  theme: props.theme, // force redraw on theme changes
})

const enhance = compose(
  connect(mapStateToProps,
    {
      setAreaColorLabel,
      changeColor,
      setWikiId,
      deselectItem: deselectItemAction,
      toggleRightDrawer: toggleRightDrawerAction,
      setModData: setModDataAction,
      setModDataLng: setModDataLngAction,
      setModDataLat: setModDataLatAction,
      setRightDrawerVisibility
    }),
  pure,
  translate,
)

export default enhance(RightDrawerRoutes)
