import React, { createElement, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import FontIcon from 'material-ui/FontIcon'
import {Tabs, Tab} from 'material-ui/Tabs';
import CloseIcon from 'material-ui/svg-icons/content/clear'
import NavigationClose from 'material-ui/svg-icons/navigation/close';
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
import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../restricted/metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../restricted/revisions'
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from './actionReducers'
import { deselectItem as deselectItemAction } from '../map/actionReducers'
import { ModHome } from './mod/ModHome'
import { setModData as setModDataAction, setModDataLng as setModDataLngAction, setModDataLat as setModDataLatAction } from './../restricted/shared/buttons/actionReducers'
import utilsQuery from '../map/utils/query'
import { tooltip } from '../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../styles/chronasColors'

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
  }
}

const resources = {
  areas: { edit: ModAreasAll, permission: 1 },
  markers: { create: MarkerCreate, edit: MarkerEdit, remove: MarkerDelete, permission: 1 },
  metadata: { create: ModMetaAdd, edit: ModMetaEdit, remove: MetadataDelete, permission: 1 },
  images: { create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 1 },
  users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 11 },
}

class RightDrawerRoutes extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { hiddenElement: true, metadataType: '', metadataEntity: '' }
  }

  componentDidMount = () => {
    console.debug('### componentDidMount rightDrawerOpen', this.props)
  }

  componentWillReceiveProps (nextProps) {
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

  render() {
    const { list, create, edit, show, remove, options, onMenuTap,
      translate, rightDrawerOpen, deselectItem, setRightDrawerVisibility,
      selectedYear, selectedItem, activeArea, children, muiTheme,
      setModData, setModDataLng, setModDataLat, location, history } = this.props

    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )
    const modHeader = <AppBar
      // title={
      //   <span style={{
      //     color: chronasDark,
      //     fontSize: 20
      //   }}
      //   > {JSON.stringify(location.pathname)} tata</span>
      // }
      // showMenuIconButton={false}
      // style={{ backgroundColor: '#fff' }}

      // iconElementLeft={<IconButton><NavigationClose />test1</IconButton>}
      // iconElementRight={this.state.logged ? <NavigationClose /> : <NavigationClose />}
      iconElementLeft={
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label="Add Marker" value={1} />
          <Tab label="Add Meta" value={0} />
          <Tab label="Edit Area" value={2} />
          <Tab label="Edit Marker" value={3} />
          <Tab label="Edit Meta" value={4} />
        </Tabs>
        // <div>
        //   <FlatButton label="Add Meta" />
        //   <FlatButton label="Add Marker" />
        //   <FlatButton label="Edit Meta" />
        //   <FlatButton label="Edit Area" />
        //   <FlatButton label="Edit Marker" />
        // </div>
      }
      iconElementRight={
        <div>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleBack()}>
            <FontIcon className='fa fa-chevron-left' />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleClose()}>
            <FontIcon className='fa fa-chevron-right' />
          </IconButton>
        </div>
      }
    />

    const modUrl = '/mod/' + selectedItem.type
    const articletHeader = <AppBar
      title={
        <span style={{
          color: chronasDark,
          fontSize: 20
        }}
        > {JSON.stringify(location.pathname)}</span>
      }
      showMenuIconButton={false}
      style={{ backgroundColor: '#fff' }}
      iconElementRight={
        <div>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            containerElement={<Link to={modUrl} />}>
            <FontIcon className='fa fa-edit' />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleBack()}>
            <FontIcon className='fa fa-chevron-left' />
          </IconButton>
          <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: grey600 }}
            onClick={() => this.handleClose()}>
            <FontIcon className='fa fa-chevron-right' />
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
              width={'50%'}
            >
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
            render={restrictPage(articletHeader, Content)}
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
            finalProps = { ...commonProps, setModData, selectedYear, selectedItem, activeArea, handleClose: this.handleClose }
          } else if (resourceKey === 'metadata') {
            finalProps = { ...commonProps, setModData, selectedYear, selectedItem, activeArea, metadataType: this.state.metadataType, metadataEntity: this.state.metadataEntity, setMetadataEntity: this.setMetadataEntity, setMetadataType: this.setMetadataType }
          } else if (resourceKey === 'markers') {
            finalProps = { ...commonProps, setModDataLng, setModDataLat }
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
  locale: state.locale, // force redraw on locale change
  theme: props.theme, // force redraw on theme changes
})

const enhance = compose(
  connect(mapStateToProps,
    {
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
