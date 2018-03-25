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
// import MarkerCreate from '../restricted/markers/MarkerCreate'
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import IconEdit from 'material-ui/svg-icons/editor/mode-edit';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import IconDrag from 'material-ui/svg-icons/editor/drag-handle';

const nearbyIcon = <IconLocationOn />;

import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../restricted/metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../restricted/revisions'
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from './actionReducers'
import { TYPE_AREA, TYPE_MARKER, deselectItem as deselectItemAction } from '../map/actionReducers'
import { ModHome } from './mod/ModHome'
import { setModData as setModDataAction, setModDataLng as setModDataLngAction, setModDataLat as setModDataLatAction } from './../restricted/shared/buttons/actionReducers'
import utilsQuery from '../map/utils/query'
import { changeColor } from '../menu/layers/actionReducers'
import { tooltip } from '../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../styles/chronasColors'
import utils from "../map/utils/general";

const styles = {
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
  chip: {
  },
  draggableButton: {
    position: 'absolute',
    top: 'calc(50% - 20px)',
    marginLeft: '-44px',
    transform: 'rotate(90deg)'
  }
}

const selectedIndexObject = {
  'ruler': 1,
  'culture': 2,
  'religion': 3,
  'population': 5,
}

const resources = {
  areas: { edit: ModAreasAll, permission: 1 },
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
      activeResize: false,
      hiddenElement: true,
      metadataType: '',
      metadataEntity: '',
      selectedIndex: -1,
      articleWidth: '50%',
    }
  }

  componentWillReceiveProps (nextProps) {

    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({
        selectedIndex: menuIndexByLocation[nextProps.location.pathname] || -1
      })
    }

    const { rightDrawerOpen } = this.props
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
      nextProps.location.pathname.indexOf('/article/') > -1) {
      if (!nextProps.rightDrawerOpen) {
        setRightDrawerVisibilityAction(true)
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
    utilsQuery.updateQueryStringParameter('type', '')
    utilsQuery.updateQueryStringParameter('province', '')
    this.props.deselectItem()
    this.props.setRightDrawerVisibility(false)
  }

  handleOnTouchTap = (event) => {
    console.debug(event)
  }

  handleMouseDown = (event) => {
    console.debug('down')
    this.setState({ activeResize: true })
  }

  handleMouseOver = (event) => {
    // if (this.state.activeResize) {
    //   this.setState({ articleWidth: window.innerWidth-event.clientX })
    //   // console.debug('onMouseOver', window.innerWidth-event.layerX, window.innerWidth-event.pageX, window.innerWidth-event.screenX, window.innerWidth-event.clientX, parseInt(event.screenX/event.clientX*100) + '%', event )
    // }
  }

  handleMouseUp = (event) => {
    this.setState({ activeResize: false })
  }

  select = (index) => this.setState({selectedIndex: index});


  componentDidMount(){
    console.debug('### RightDrawerRoutes mounted with props', this.props)
    window.addEventListener('mousemove', this.handleMouseOver.bind(this), false);
    window.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
  }
  componentWillUnmount(){
    window.removeEventListener('mousemove', this.handleMouseOver.bind(this), false);
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this), false);
  }

  render() {
    const { list, create, edit, show, remove, options, onMenuTap,
      translate, rightDrawerOpen, deselectItem, setRightDrawerVisibility,
      selectedYear, selectedItem, activeArea, children, muiTheme,
      setModData, setModDataLng, setModDataLat, location, history, metadata, changeColor } = this.props

    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )
    const modHeader = <AppBar
      iconElementLeft={
        <BottomNavigation
        onChange={this.handleChange}
        value={this.state.slideIndex}
        selectedIndex={ this.state.selectedIndex }>
          <BottomNavigationItem
            containerElement={<Link to="/mod/markers/create" />}
            label="Add Marker"
            icon={nearbyIcon}
            onClick={() => changeColor('ruler')}
          />
          <BottomNavigationItem
            containerElement={<Link to="/mod/metadata/create" />}
            label="Add Entity"
            icon={nearbyIcon}
            onClick={() => changeColor('ruler')}
          />
          <BottomNavigationItem
            containerElement={<Link to="/mod/areas" />}
            label="Edit Entity"
            icon={nearbyIcon}
            onClick={() => changeColor('ruler')}
          />
          <BottomNavigationItem
            containerElement={<Link to="/mod/markers" />}
            label="Edit Marker"
            icon={nearbyIcon}
            // onClick={() => this.select(3)}
          />
          <BottomNavigationItem
            containerElement={<Link to="/mod/metadata" />}
            label="Edit Meta"
            icon={nearbyIcon}
            // onClick={() => this.select(4)}
          />
        </BottomNavigation>
      }
      iconElementRight={
        <div>
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
    const articletHeader = <AppBar
      iconElementLeft={
        (selectedItem.type === TYPE_AREA) ? <BottomNavigation
          onChange={this.handleChange}
          value={this.state.slideIndex}
          selectedIndex={ selectedIndexObject[activeArea.color] }>
          <BottomNavigationItem
            onClick={() => changeColor('ruler')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              King
            </Chip>}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            onClick={() => changeColor('ruler')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              { rulerName }
            </Chip>}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            onClick={() => changeColor('culture')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              { cultureName }
            </Chip>}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            onClick={() => changeColor('religion')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              { religionName } [ { religionGeneralName } ]
            </Chip>}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            onClick={() => changeColor('population')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              { capitalName }
            </Chip>}
            // onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            onClick={() => changeColor('population')}
            icon={<Chip
              style={styles.chip}
            >
              <Avatar src="images/uxceo-128.jpg" />
              { populationName }
            </Chip>}
            // onClick={() => this.select(0)}
          />
        </BottomNavigation> : null
      }
      iconElementRight={
        <div>
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

    const restrictPage = (headerComponent, component, route, commonProps) => {
      const RestrictedPage = routeProps => (
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
              containerStyle={{ overflow: 'none' }}
              style={{ overflow: 'none', zIndex: 9 }}
              width={this.state.articleWidth}
            >
              <RaisedButton
                icon={<IconDrag />}
                style={styles.draggableButton}
                // onTouchTap={(event) => console.debug('touchtap', event)}
                // onMouseDown={this.handleMouseDown.bind(this)}
                // onMouseOver={this.handleMouseOver.bind(this)}
                // onMouseUp={this.handleMouseUp.bind(this)}
                // onClick={(event) => console.debug('onClick', event)}
              />

              {headerComponent}
              {component && createElement(component, {
                ...commonProps,
                ...routeProps,
              })}
            </Drawer>
          }
        />
      )
      return RestrictedPage
    }

    return (
      <div>
        <Switch>
          <Route
            exact
            path={'/article'}
            render={restrictPage(articletHeader, Content, '', { metadata } )}
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
            finalProps = { ...commonProps, selectedItem, setModDataLng, setModDataLat }
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
      changeColor,
      deselectItem: deselectItemAction,
      toggleRightDrawer: toggleRightDrawerAction,
      setModData: setModDataAction,
      setModDataLng: setModDataLngAction,
      setModDataLat: setModDataLatAction,
      setRightDrawerVisibility: setRightDrawerVisibilityAction
    }),
  pure,
  translate,
)

export default enhance(RightDrawerRoutes)
