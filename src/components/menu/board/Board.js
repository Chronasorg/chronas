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
    this.state = {
      forums: [
        {
          'forum_id': 0,
          'forum_slug': 'general',
          'forum_name': 'General',
        },
        {
          'forum_id': 1,
          'forum_slug': 'react',
          'forum_name': 'React',
        },
        {
          'forum_id': 2,
          'forum_slug': 'redux',
          'forum_name': 'Redux',
        },
      ],
      discussions: [
        {
          'forum_id': '58c23d2efce8810b6f20b0b3',
          'discussion_slug': 'a_pinned_discussion',
          'user_id': '58c242a96ba2030d170f86f9',
          'date': 1486450269704,
          'title': 'A pinned discussion',
          'content': 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          'favorites': 2,
          'tags': ['react', 'redux', 'mongodb'],
          'pinned': true,
        },
        {
          'forum_id': '58c23d2efce8810b6f20b0b3',
          'discussion_slug': 'another_pinned_discussion',
          'user_id': '58c242a96ba2030d170f86f9',
          'date': 1486450269704,
          'title': 'Another pinned discussion',
          'content': 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          'favorites': 3,
          'tags': ['react', 'redux'],
          'pinned': true,
        },
        {
          'forum_id': '58c23d2efce8810b6f20b0b3',
          'discussion_slug': 'one_another_pinned_discussion',
          'user_id': '58c242e2fb2e150d2570e02b',
          'date': 1486450269704,
          'title': 'One another pinned discussion',
          'content': 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          'favorites': 5,
          'tags': ['express', 'mongodb'],
          'pinned': true,
        },
        {
          'forum_id': '58c23d2efce8810b6f20b0b3',
          'discussion_slug': 'a_discussion_from_general_forum',
          'user_id': '58c242e2fb2e150d2570e02b',
          'date': 1486450269704,
          'title': 'A discussion from general forum',
          'content': 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          'favorites': 2,
          'tags': ['react', 'redux', 'mongodb'],
          'pinned': false,
        },
      ],
      opinions: [
        {
          'discussion_id': '58c641904e457708a7147417',
          'user_id': '58c242e2fb2e150d2570e02b',
          'date': 1486450269704,
          'content': 'Awesome stuffs!',
        },
        {
          'discussion_id': '58c641904e457708a7147417',
          'user_id': '58c242e2fb2e150d2570e02b',
          'date': 1486450269704,
          'content': 'Awesome stuffs really!',
        },
        {
          'discussion_id': '58c641cf88336b08c76f3b50',
          'user_id': '58c242a96ba2030d170f86f9',
          'date': 1486450269704,
          'content': 'Great job dude!',
        },
        {
          'discussion_id': '58c641cf88336b08c76f3b50',
          'user_id': '58c242a96ba2030d170f86f9',
          'date': 1486450269704,
          'content': 'These discussions!!!',
        },
      ],
      users: [
        {
          'user_id': 0,
          'username': 'testuser1',
          'email': 'testuser1@reforum.abc',
          'avatarUrl': 'https://robohash.org/quisapientelibero.png?size=50x50&set=set1',
          'name': 'Test User 1',
        },
        {
          'user_id': 1,
          'username': 'testuser2',
          'email': 'testuser2@reforum.abc',
          'avatarUrl': 'https://robohash.org/magnidictadeserunt.png?size=50x50&set=set1',
          'name': 'Test User 2',
        },
        {
          'user_id': 2,
          'username': 'testuser3',
          'email': 'testuser3@reforum.abc',
          'avatarUrl': 'https://robohash.org/ducimusnostrumillo.jpg?size=50x50&set=set1',
          'name': 'Test User 3',
        },
        {
          'user_id': 3,
          'username': 'testuser4',
          'email': 'testuser4@reforum.abc',
          'avatarUrl': 'https://robohash.org/autemharumvitae.bmp?size=50x50&set=set1',
          'name': 'Test User 4',
        },
        {
          'user_id': 4,
          'username': 'testuser5',
          'email': 'testuser5@reforum.abc',
          'avatarUrl': 'https://robohash.org/similiquealiquidmaiores.jpg?size=50x50&set=set1',
          'name': 'Test User 5',
        },
      ],
      hiddenElement: true
    }
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

    const restrictPage = (component, commonProps, customProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'board' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog bodyStyle={{ backgroundImage: '#fff' }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
                  contentStyle={styles.dialogStyle} onRequestClose={this.handleClose}>
            <Card style={styles.card}>
              {createElement(component, {
                ...commonProps,
                ...routeProps,
                ...customProps
              })}
            </Card>
          </Dialog>
        </Restricted>
      )
      return RestrictedPage
    }

    const BoardApp = <Switch>
        <Route path="/board/admin" render={restrictPage(AdminContainer, {
          ...commonProps, tata: 'tt', forums: this.state.forums })} >
          <IndexRoute component={Dashboard} />
        </Route>
        <Route path="/board/" render={restrictPage(AppContainer, commonProps, {
          forums: this.state.forums })} >
          <IndexRoute component={ForumFeed} />
          <Route exact path="/board/:forum" component={ForumFeed} />
          <Route exact path="/board/:forum/discussion/:discussion" component={SingleDiscussion} />
          <Route exact path="/board/:forum/new_discussion" component={NewDiscussion} />
          <Route exact path="/board/user/:username" component={UserProfile} />
          <Route path="/board/*" component={NotFound} />
        </Route>
      </Switch>

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
