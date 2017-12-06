import React, { createElement, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers';
import {grey600, grey400, chronasDark} from '../../styles/chronasColors';
import Responsive from '../menu/Responsive';
import Content from './Content';
import { Route, Switch } from 'react-router-dom';
import pure from 'recompose/pure'
import { Restricted, translate } from 'admin-on-rest';
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from '../restricted/users'
import { AreaList, AreaCreate, AreaEdit, AreaDelete, AreaIcon } from '../restricted/areas'
import { MarkerList, MarkerCreate, MarkerEdit, MarkerDelete, MarkerIcon } from '../restricted/markers'
import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../restricted/metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../restricted/revisions'
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from './actionReducers';

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
  areas: { list: AreaList, create: AreaCreate, edit: AreaEdit, remove: AreaDelete, permission: 1 },
  markers: { list: MarkerList, create: MarkerCreate, edit: MarkerEdit, remove: MarkerDelete, permission: 1 },
  metadata: { list: MetadataList, create: MetadataCreate, edit: MetadataEdit, remove: MetadataDelete, permission: 1 },
  revisions: { list: RevisionList, create: RevisionCreate, edit: RevisionEdit, remove: RevisionDelete, permission: 1 },
  images: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 1 },
  users: { list: UserList, create: UserCreate, edit: UserEdit, remove: UserDelete, permission: 11 },
}
//, create: UserCreate, edit: UserEdit, remove: UserDelete

class RightDrawerRoutes extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.props.setRightDrawerVisibility(true)
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  handleClose = () => {
    this.props.toggleRightDrawer()
    this.props.history.push('/')
  }

  render() {
    const { list, create, edit, show, remove, options, onMenuTap, translate } = this.props
    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )
    const { rightDrawerOpen, setRightDrawerVisibility, children, muiTheme } = this.props;



    const restrictPage = (component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Responsive
          small={
            <Drawer
              docked={false}
              openSecondary={true}
              open={rightDrawerOpen}
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
              openSecondary={true}
              containerStyle={{ overflow: 'none' }}
              style={{ overflow: 'none', zIndex: 9 }}
              open={true}
              width={'50%'}
            >
              <AppBar
                title={
                  <span style={{
                    color: chronasDark,
                    fontSize: 20
                  }}
                  >CONTENT</span>
                }
                showMenuIconButton={false}
                style={{backgroundColor: '#fff'}}
                iconElementRight={
                  <IconButton iconStyle={{textAlign: 'right', fontSize: '12px', color: grey600}}
                              onClick={() => this.handleClose()}>
                    <FontIcon className="fa fa-chevron-right"/>
                  </IconButton>
                }
              />
              {component && createElement(component, {
                ...commonProps,
                ...routeProps,
              })}
            </Drawer>
          }
        />
      )
      return RestrictedPage;
    };


    return (
      <div>
      <Switch>
        <Route
          exact
          path={'/edit'}
          render={restrictPage(() => (<span>Select a resource from the menu above.</span>), '')}
        />
        <Route
          exact
          path={'/wiki/:id'}
          render={restrictPage(Content)}
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

          return (<Switch key={"rightDrawer_"+resourceKey} style={{zIndex: 20000}}>
            {resources[resourceKey].list && (
              <Route
                exact
                path={'/edit/' + resourceKey}
                render={restrictPage(resources[resourceKey].list, 'list', commonProps)}
              />
            )}
            {resources[resourceKey].create && (
              <Route
                exact
                path={'/edit/' + resourceKey + '/create'}
                render={restrictPage(resources[resourceKey].create, 'create', commonProps)}
              />
            )}
            {resources[resourceKey].edit && (
              <Route
                exact
                path={'/edit/' + resourceKey + '/:id'}
                render={restrictPage(resources[resourceKey].edit, 'edit', commonProps)}
              />
            )}
            {resources[resourceKey].show && (
              <Route
                exact
                path={'/edit/' + resourceKey + '/:id/show'}
                render={restrictPage(resources[resourceKey].show, 'show', commonProps)}
              />
            )}
            {resources[resourceKey].remove && (
              <Route
                exact
                path={'/edit/' + resourceKey + '/:id/delete'}
                render={restrictPage(resources[resourceKey].remove, 'delete', commonProps)}
              />
            )}
          </Switch>)
        })}
      </div>
    );
  }
}


const mapStateToProps = (state, props) => ({
  rightDrawerOpen: state.rightDrawerOpen,
  locale: state.locale, // force redraw on locale change
  theme: props.theme, // force redraw on theme changes
});


const enhance = compose(
  connect(mapStateToProps,
    {
      toggleRightDrawer: toggleRightDrawerAction,
      setRightDrawerVisibility: setRightDrawerVisibilityAction
  }),
  pure,
  translate,
)

export default enhance(RightDrawerRoutes);
