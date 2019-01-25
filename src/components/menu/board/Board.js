import React, { createElement, PureComponent } from 'react'
import { BrowserRouter as Router,  Route, Switch, NavLink } from 'react-router-dom'
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

// app views
import AdminContainer from './ReForum/App/Admin';
import Header from './ReForum/Containers/Header';
import Footer from './ReForum/Components/Footer';
import ForumFeed from './ReForum/Views/ForumFeed';
import SingleDiscussion from './ReForum/Views/SingleDiscussion';
import NewDiscussion from './ReForum/Views/NewDiscussion';
import UserProfile from './ReForum/Views/UserProfile';
import Highscore from './ReForum/Views/Highscore';
import Sustainers from  './ReForum/Views/Sustainers';
import NotFound from './ReForum/Views/NotFound';

import { getForums, updateCurrentForum, getUser } from './ReForum/App/actions'
import {red400} from "material-ui/styles/colors";
import {themes} from "../../../properties";

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

function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

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
    let toUpdateState = { hiddenElement: false }
    const potentialNewForum = (((this.props.history || {}).location || {}).pathname || '').substr(11) || ((this.props.location || {}).pathname || '').substr(11)
    if (potentialNewForum === 'features' || potentialNewForum === 'issues') {
      toUpdateState.currentForum = potentialNewForum
    } else {
      toUpdateState.currentForum = 'general'
    }
    this.setState(toUpdateState)
  }

  componentWillReceiveProps = (nextProps) => {
    const { location, history } = nextProps
    const { currentForum } = this.state

    const potentialNewForum = (((history || {}).location || {}).pathname || '').substr(11) || ((location || {}).pathname || '').substr(11)

    if (currentForum !== potentialNewForum && (potentialNewForum === 'features' || potentialNewForum === 'issues')) {
      this.setState({ currentForum: potentialNewForum })
    }

  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  _setForums = () => {

    getForums().then( (data) => {
      if (data) {
        let generalIndex = data.findIndex(e => e.forum_slug === 'general')
        let reorderedForums = (generalIndex !== 0) ? array_move(data, generalIndex, 0) : data
        let questionsIndex = reorderedForums.findIndex(e => e.forum_slug === 'questions')
        if (questionsIndex !== 3) reorderedForums = array_move(reorderedForums, questionsIndex, 3)
        this.setState({
          forums: reorderedForums
        })
      }
    } )
  }

  _updateCurrentForum = (newForm) => {
    this.setState({ currentForum: newForm })
  }

  render () {
    const { resources, list, create, edit, show, remove, history, options, onMenuTap, translate, theme } = this.props
    const { forums, users, currentForum } = this.state
    const commonProps = {
      options,
      currentForum: currentForum,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
      translate: translate,
      theme: theme,
    }

    const restrictPage = (component, commonProps, customProps) => {
      const { theme } = this.props
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
            bodyStyle={{
              backgroundImage: themes[theme].gradientColors[0]
            }}
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

    const restrictPageForumWrapper = (showHeader, component, commonProps, customProps) => {
      const { forums, currentForum } = this.state
      const { theme } = this.props
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'community' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog open
                  autoDetectWindowHeight={false}
                  modal={false}
                  autoScrollBodyContent={false}
                  bodyStyle={{
                    backgroundImage: themes[theme].gradientColors[0]
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
                { <Header showHeader={showHeader}
                  currentForum={currentForum} theme={theme} handleClose={this.handleClose} updateCurrentForum={this._updateCurrentForum} history={history} translate={translate} forums={forums} users={users} />}
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
      <Route exact path="/community" render={restrictPageForumWrapper(true, ForumFeed, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/highscore" render={restrictPageForumWrapper(false, Highscore, commonProps, { setForums: this._setForums, forums: this.state.forums} )} />
      <Route exact path="/community/sustainers" render={restrictPageForumWrapper(false, Sustainers, commonProps, { setForums: this._setForums, forums: this.state.forums} )} />
      <Route exact path="/community/:forum/discussion/:discussion/:qId?" render={restrictPageForumWrapper(true, SingleDiscussion, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/:forum/new_discussion/:qId?" render={restrictPageForumWrapper(true, NewDiscussion, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/:forum" render={restrictPageForumWrapper(true, ForumFeed, commonProps, { setForums: this._setForums, forums: this.state.forums, users: this.state.users, currentForum: this.state.currentForum, updateCurrentForum: this._updateCurrentForum, discussions: this.state.discussions, currentForumId: this.state.currentForum._id })} />
      <Route exact path="/community/user/:username" render={restrictPageForumWrapper(false, UserProfile, commonProps, { setForums: this._setForums, forums: this.state.forums} )} />
    </Switch>
  }
}

const enhance = compose(
  connect(state => ({
  }), { }),
  pure,
  translate,
)

export default enhance(Board)
