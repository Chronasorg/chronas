import React, { createElement, PureComponent } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import {
  translate,
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EditButton,
  Filter,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  Restricted,
  ReferenceInput,
  ReferenceField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
} from 'admin-on-rest'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Card, CardActions } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import Delete from '../../restricted/shared/crudComponents/Delete'
import DeleteButton from '../../restricted/shared/buttons/DeleteButton'
import FlatButton from 'material-ui/FlatButton'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../../styles/chronasColors'
import { themes } from '../../../properties'

const styles = {
  menuButtons: {
    margin: 12,
    color: '#fff',
  },
  dialogStyle: {
    width: 'calc(100% - 42px)',
    height: '800px',
    maxWidth: 'none',
    maxHeight: 'none',
    left: 42,
    top: 0,
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    top: '28px',
    position: 'fixed',
    right: '8px',
    background: 'transparent',
    boxShadow: 'none',
  }
}

class Account extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { resources, userDetails, list, create, edit, show, remove, options, onMenuTap, translate, theme } = this.props
    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
    }
    const username = localStorage.getItem('chs_userid')
    const routeProps = {
      'match': {
        'path':'/account',
        'url':'/resources/users/' + window.encodeURIComponent(username),
        'isExact': true,
        'params': {
          'id': username
        }
      },
      'location': {
        'pathname':'/account',
        'search':'',
        'hash':''
      },
      'history': {
        'length': 50,
        'action': 'POP',
        'location': {
          'pathname':'/account',
          'search': '',
          'hash': ''
        }
      }
    }

    const UserEdit = (props) => {
      const t = { ...props, ...routeProps }
      return <Edit style={{ }} title={<span>{translate('aor.edit_profile')}</span>} {...t}>
        <SimpleForm style={{ }}>
          <DisabledInput source='username' />
          <TextInput source='name' />
          <TextInput source='avatar' type='aor.profile_image' />
          <TextInput source='education' />
          <TextInput source='email' type='email' label='resources.users.fields.email' validation={{ email: true }} options={{ fullWidth: true }} style={{ width: 544 }} />
          <TextInput source='website' type='url' />
          <TextInput source='password' type='password' />
        </SimpleForm>
      </Edit>
    }

    const UserDeleteTitle = <span>{translate('resources.users.page.delete')} "{username}"</span>

    const UserDelete = (props) => {
      const tt = { ...props, ...routeProps }
      return <Delete account history={props.history} title={<UserDeleteTitle />} {...tt} />
    }

    const restrictPage = (component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'account' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog open
            autoDetectWindowHeight={false}
            modal={false}
            autoScrollBodyContent={false}
            bodyStyle={{
              background: themes[theme].backColors[0]
            }}
            actionsContainerStyle={{
              bottom: '4em',
              top: '4em',
              width: 'calc(100% - 64px)',
              overflow: 'auto',
              position: 'fixed !important'
            }}
            contentClassName={(this.state.hiddenElement) ? '' : 'classReveal accountContentStyle'}
            contentStyle={{ ...styles.dialogStyle, background: themes[theme].backColors[0] }}
                  onRequestClose={this.handleClose}>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={''} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton touch key={'back'} onClick={() => this.props.history.goBack()}>
                  <IconBack />
                </IconButton>
                <IconButton touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
            <Card style={styles.card}>
              {createElement(component, {
                ...commonProps,
                ...routeProps,
              })}
            </Card>
          </Dialog>
        </Restricted>
      )
      return RestrictedPage
    }

    return (
      <Switch style={{ zIndex: 20000 }}>
        {UserEdit && (
        <Route
          exact
          path={'/account/'}
          render={restrictPage(UserEdit, username, { ...commonProps, ...routeProps })}
                />
              )}
        {UserDelete && (
        <Route
          exact
          path={'/' + window.encodeURIComponent(username) + '/delete'}
          render={restrictPage(UserDelete, 'delete', { ...commonProps, ...routeProps })}
                />
              )}
      </Switch>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    userDetails: state.userDetails
  }), { }),
  pure,
  translate,
)

export default enhance(Account)
