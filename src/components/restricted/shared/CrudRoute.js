import React, { createElement, PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import pure from 'recompose/pure'
import { Restricted, translate } from 'admin-on-rest';
import Dialog from 'material-ui/Dialog';
import Toolbar from 'material-ui/Toolbar'
import FlatButton from 'material-ui/FlatButton';
import { tooltip } from '../../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../../styles/chronasColors'
import { UserList, UserCreate, UserEdit, UserDelete, UserIcon } from '../users'
import { AreaList, AreaCreate, AreaEdit, AreaDelete, AreaIcon } from '../areas'
import { MarkerList, MarkerCreate, MarkerEdit, MarkerDelete, MarkerIcon } from '../markers'
import { MetadataList, MetadataCreate, MetadataEdit, MetadataDelete, MetadataIcon } from '../metadata'
import { RevisionList, RevisionCreate, RevisionEdit, RevisionDelete, RevisionIcon } from '../revisions'

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

class CrudRoute extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render() {
    const { list, create, edit, show, remove, options, onMenuTap, translate } = this.props
    const currPrivilege = +localStorage.getItem("privilege")
    const resourceList = Object.keys(resources).filter(resCheck => +resources[resCheck].permission <= currPrivilege )



    const restrictPage = (component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted authParams={{ routeProps }} {...routeProps}>
          <Dialog

            modal={false}
            bodyStyle={{padding: 0}}
            style={{paddingTop: 0, height: '100vh'}}

            repositionOnUpdate={false}
            autoDetectWindowHeight={false}
            open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
            autoScrollBodyContent={true} contentStyle={styles.dialogStyle} onRequestClose={this.handleClose}>
            <Toolbar style={{ backgroundColor: "rgb(22, 22, 19)" }}>
              {resourceList.map((resourceKey) => (<div key={"div-" + resourceKey}>
                <FlatButton
                  key={resourceKey}
                  containerElement={<Link to={"/resources/" + resourceKey} />}
                  tooltipPosition="bottom-right"
                  tooltip={translate('pos.' + resourceKey)}
                  tooltipStyles={tooltip}
                  hoverColor={chronasMainColor}
                  onClick={onMenuTap}
                  label={resourceKey}
                  style={styles.menuButtons} />
              </div>))
              }
            </Toolbar>
            {component && createElement(component, {
              ...commonProps,
              ...routeProps,
            })}
          </Dialog>
        </Restricted>
      );
      return RestrictedPage;
    };


    return (
      <div>
      <Switch>
        <Route
          exact
          path={'/resources'}
          render={restrictPage(() => (<span>Select a resource from the menu above.</span>), '')}
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

          return (<Switch key={resourceKey} style={{zIndex: 20000}}>
            {resources[resourceKey].list && (
              <Route
                exact
                path={'/resources/' + resourceKey}
                render={restrictPage(resources[resourceKey].list, 'list', commonProps)}
              />
            )}
            {resources[resourceKey].create && (
              <Route
                exact
                path={'/resources/' + resourceKey + '/create'}
                render={restrictPage(resources[resourceKey].create, 'create', commonProps)}
              />
            )}
            {resources[resourceKey].edit && (
              <Route
                exact
                path={'/resources/' + resourceKey + '/:id'}
                render={restrictPage(resources[resourceKey].edit, 'edit', commonProps)}
              />
            )}
            {resources[resourceKey].show && (
              <Route
                exact
                path={'/resources/' + resourceKey + '/:id/show'}
                render={restrictPage(resources[resourceKey].show, 'show', commonProps)}
              />
            )}
            {resources[resourceKey].remove && (
              <Route
                exact
                path={'/resources/' + resourceKey + '/:id/delete'}
                render={restrictPage(resources[resourceKey].remove, 'delete', commonProps)}
              />
            )}
          </Switch>)
        })}
      </div>
    );
  }
}

const enhance = compose(
  connect(state => ({ }), { }),
  pure,
  translate,
)

export default enhance(CrudRoute);
