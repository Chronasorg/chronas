import React, { createElement, PureComponent } from 'react'
import { BrowserRouter as Router,  Route, Switch, NavLink } from 'react-router-dom'
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
import { Provider } from 'react-redux';

// app views
import AppContainer from './ReForum/App/App';
import AdminContainer from './ReForum/App/Admin';
import AdminDashboard from './ReForum/Views/AdminDashboard';
import Header from './ReForum/Containers/Header';
import Footer from './ReForum/Components/Footer';
import ForumFeed from './ReForum/Views/ForumFeed';
import SingleDiscussion from './ReForum/Views/SingleDiscussion';
import NewDiscussion from './ReForum/Views/NewDiscussion';
import UserProfile from './ReForum/Views/UserProfile';
import Highscore from './ReForum/Views/Highscore';
import NotFound from './ReForum/Views/NotFound';

import { getForums, updateCurrentForum, getUser } from './ReForum/App/actions'
import {red400} from "material-ui/styles/colors";

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
    left: 64,
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
    backgroundColor: 'transparent',
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

class Board extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      forums: [],
      discussions: [],
      opinions: [],
      users: [],
      currentForum: 'general',
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

  _setForums = () => {
    getForums().then( (data) => this.setState({ forums: data }) )
  }

  _updateCurrentForum = (newForm) => {
    this.setState({ currentForum: newForm })
  }

  render () {
    const { resources, userDetails, list, create, edit, show, remove, history, options, onMenuTap, translate } = this.props
    const { forums, users } = this.state
    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
      translate: translate,
    }

    const restrictPage = (component, commonProps, customProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'community' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog
            autoDetectWindowHeight={false}
            modal={false}
            contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogBackgroundHack'}
            actionsContainerStyle={{ backgroundColor: red400 }}
            overlayStyle={styles.overlayStyle}
            style={{ backgroundColor: 'transparent', overflow: 'auto' }}
            titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
            autoScrollBodyContent={false}

            bodyStyle={{ backgroundImage: '#fff' }}
            open
            // contentStyle={styles.dialogStyle}
            onRequestClose={this.handleClose}>
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

    const restrictPageForumWrapper = (component, commonProps, customProps) => {
      const { forums } = this.state
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'community' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog open
                  autoDetectWindowHeight={false}
                  modal={false}
                  autoScrollBodyContent={false}
                  bodyStyle={{
                    backgroundImage: '#fff',
                  }}
                  actionsContainerStyle={{
                    bottom: '4em',
                    top: '4em',
                    width: 'calc(100% - 64px)',
                    overflow: 'auto',
                    position: 'fixed !important'
                  }}
                  contentClassName={(this.state.hiddenElement) ? '' : 'classReveal boardContentStyle'}
                  contentStyle={styles.dialogStyle} onRequestClose={this.handleClose}>
            <Card style={styles.card}>
              {(forums) ? <div>
                <Header updateCurrentForum={this._updateCurrentForum} history={history} translate={translate} forums={forums} users={users} />
                {createElement(component, {
                  ...commonProps,
                  ...routeProps,
                  ...customProps
                })}
                <Footer />
              </div> : <div className='loadingWrapper'>Loading...</div> }s
            </Card>
          </Dialog>
        </Restricted>
      )
      return RestrictedPage
    }

    return <Switch>
      <Route exact path="/community/admin" render={restrictPage(AdminContainer, {
        ...commonProps, history: this.props.history, forums: this.state.forums, users: this.state.users })} >
      </Route>
      <Route exact path="/community" render={restrictPage(AppContainer, commonProps, {
        setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum })} />
      <Route exact path="/community/highscore" render={restrictPageForumWrapper(Highscore, commonProps, { setForums: this._setForums, forums: this.state.forums} )} />
      <Route exact path="/community/:forum/discussion/:discussion/:qId?" render={restrictPageForumWrapper(SingleDiscussion, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/:forum/new_discussion/:qId?" render={restrictPageForumWrapper(NewDiscussion, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/:forum" render={restrictPageForumWrapper(ForumFeed, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/user/:username" render={restrictPageForumWrapper(UserProfile, commonProps, { setForums: this._setForums, forums: this.state.forums} )} />
    </Switch>
  }
}

// <Route exact path="/community/*" render={restrictPageForumWrapper(NotFound, commonProps)} />

const enhance = compose(
  connect(state => ({
    userDetails: state.userDetails
  }), { }),
  pure,
  translate,
)

export default enhance(Board)
