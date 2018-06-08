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
import { Card } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Toolbar from 'material-ui/Toolbar'
import FlatButton from 'material-ui/FlatButton'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../../styles/chronasColors'

import ReactDOM from 'react-dom';
import { Router, browserHistory, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';

// app store
import appStore from './ReForum/App/store';

// app views
import AppContainer from './ReForum/App/App';
import AdminContainer from './ReForum/App/Admin';
import Dashboard from './ReForum/Views/AdminDashboard';
import Header from './ReForum/Containers/Header';
import ForumFeed from './ReForum/Views/ForumFeed';
import SingleDiscussion from './ReForum/Views/SingleDiscussion';
import NewDiscussion from './ReForum/Views/NewDiscussion';
import UserProfile from './ReForum/Views/UserProfile';
import NotFound from './ReForum/Views/NotFound';

const styles = {
  menuButtons: {
    margin: 12,
    color: '#fff',
  },
  dialogStyle: {
    width: 'calc(100% - 64px)',
    height: '800px',
    maxWidth: 'none',
    maxHeight: 'none',
    left: 32,
    top: 0,
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    paddingTop: 0
  },
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

const detailStyle = { display: 'inline-block', verticalAlign: 'top', marginRight: '2em', minWidth: '8em' }

class Board extends PureComponent {
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
    const { resources, userDetails, list, create, edit, show, remove, options, onMenuTap, translate } = this.props
    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
    }
    const username = localStorage.getItem('id')
    const routeProps = {
      'match': {
        'path':'/board',
        'url':'/resources/users/' + window.encodeURIComponent(username),
        'isExact': true,
        'params': {
          'id': username
        }
      },
      'location': {
        'pathname':'/board',
        'search':'',
        'hash':''
      },
      'history': {
        'length': 50,
        'action': 'POP',
        'location': {
          'pathname':'/board',
          'search': '',
          'hash': ''
        }
      }
    }

    const BoardApp = <Switch>
        <Route path="/board/admin" component={AdminContainer}>
          <IndexRoute component={Dashboard} />
        </Route>
        <Route path="/board/" component={AppContainer}>
          <IndexRoute component={ForumFeed} />
          <Route path="/board/:forum" component={ForumFeed} />
          <Route path="/board/:forum/discussion/:discussion" component={SingleDiscussion} />
          <Route path="/board/:forum/new_discussion" component={NewDiscussion} />
          <Route path="/board/user/:username" component={UserProfile} />
          <Route path="/board/*" component={NotFound} />
        </Route>
      </Switch>

    const restrictPage = (component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'board' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog bodyStyle={{ backgroundImage: '#fff' }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
            contentStyle={styles.dialogStyle} onRequestClose={this.handleClose}>
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

    return BoardApp
  }
}

const enhance = compose(
  connect(state => ({
    userDetails: state.userDetails
  }), { }),
  pure,
  translate,
)

export default enhance(Board)
