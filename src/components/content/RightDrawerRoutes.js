import React, { createElement, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import FontIcon from 'material-ui/FontIcon'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { Link, Route, Switch } from 'react-router-dom'
import pure from 'recompose/pure'
import { Restricted, translate } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { grey600, grey400, chronasDark } from '../../styles/chronasColors'
import Responsive from '../menu/Responsive'
import Content from './Content'
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from '../restricted/users'
import { ModAreasAll } from './mod/ModAreasAll'
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
  areas: { create: ModAreasAll, permission: 1 },
  markers: { list: MarkerList, create: MarkerCreate, edit: MarkerEdit, remove: MarkerDelete, permission: 1 },
  metadata: { list: MetadataList, create: MetadataCreate, edit: MetadataEdit, remove: MetadataDelete, permission: 1 },
  revisions: { list: RevisionList, create: RevisionCreate, edit: RevisionEdit, remove: RevisionDelete, permission: 1 },
  images: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 1 },
  users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 11 },
}

class RightDrawerRoutes extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { hiddenElement: true }
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

  handleBack = () => {
    this.props.setRightDrawerVisibility(false)
    this.props.history.goBack()
  }

  handleClose = () => {
    utilsQuery.updateQueryStringParameter('type', '')
    utilsQuery.updateQueryStringParameter('province', '')
    this.props.deselectItem()
    this.props.setRightDrawerVisibility(false)
    this.props.history.push('/')
  }

  render() {
    console.debug("### render rightDrawerOpen", this.props)

    const { list, create, edit, show, remove, options, onMenuTap,
      translate, rightDrawerOpen, deselectItem, setRightDrawerVisibility,
      selectedYear, selectedItem, activeArea, children, muiTheme,
      setModData, setModDataLng, setModDataLat  } = this.props

    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )
    const defaultHeader = <AppBar
      title={
        <span style={{
          color: chronasDark,
          fontSize: 20
        }}
        > {JSON.stringify(this.props.location.pathname)} tata</span>
      }
      showMenuIconButton={false}
      style={{ backgroundColor: '#fff' }}
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

    const modUrl = '/mod/' + this.props.selectedItem.type
    const articletHeader = <AppBar
      title={
        <span style={{
          color: chronasDark,
          fontSize: 20
        }}
        > {JSON.stringify(this.props.location.pathname)}</span>
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
            render={restrictPage(defaultHeader, ModHome)}
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

          return (<Switch key={'rightDrawer_' + resourceKey} style={{ zIndex: 20000 }}>
            {resources[resourceKey].create && resourceKey === 'areas' && (
              <Route
                exact
                path={'/mod/' + resourceKey}
                render={restrictPage(defaultHeader, resources[resourceKey].create, 'create', { ...commonProps, setModData, selectedYear, selectedItem, activeArea })}
              />
            )}
            {resources[resourceKey].list && (
              <Route
                exact
                path={'/mod/' + resourceKey}
                render={restrictPage(defaultHeader, resources[resourceKey].list, 'list', commonProps)}
              />
            )}
            {resources[resourceKey].create && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/create'}
                render={restrictPage(defaultHeader, resources[resourceKey].create, 'create',
                  (resourceKey === 'markers')
                    ? Object.assign({}, commonProps, { setModDataLng, setModDataLat })
                    : commonProps)}
              />
            )}
            {resources[resourceKey].edit && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/:id'}
                render={restrictPage(defaultHeader, resources[resourceKey].edit, 'edit', commonProps)}
              />
            )}
            {resources[resourceKey].create && resourceKey === "areas" && (
              <Route
                exact
                path={'/mod/' + resourceKey}
                render={restrictPage(defaultHeader, resources[resourceKey].edit, 'edit', Object.assign({}, { ...commonProps, setModData, selectedYear, selectedItem, activeArea}, { selectedYear: selectedYear }))}
              />
            )}
            {resources[resourceKey].show && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/:id/show'}
                render={restrictPage(defaultHeader, resources[resourceKey].show, 'show', commonProps)}
              />
            )}
            {resources[resourceKey].remove && (
              <Route
                exact
                path={'/mod/' + resourceKey + '/:id/delete'}
                render={restrictPage(defaultHeader, resources[resourceKey].remove, 'delete', commonProps)}
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
