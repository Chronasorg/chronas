import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';

// components used in this view
import Profile from '../../Components/UserProfile/Profile';
import FeedBox from '../../Components/FeedBox';

// actions
import {
  fetchUserProfile,
} from './actions';
import {getDiscussion} from "../SingleDiscussion/actions";

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingProfile: true,
      profile: {},
      error: ''
    }
  }

  componentDidMount() {
    const { username } = this.props.match.params;
    fetchUserProfile(username).then( (data) => this.setState({ fetchingProfile: false, profile: data }) )
  }

  componentWillReceiveProps(newProps) {
    // fetch profile if different username
    const { username: oldUsername } = this.props.match.params;
    const { username: futureUsername } = newProps.params;

    // only update if different usernames
    if (oldUsername !== futureUsername) {
      const { fetchUserProfile } = this.props;
      fetchUserProfile(futureUsername);
    }
  }

  render() {
    const {
      fetchingProfile,
      profile,
      error,
    } = this.state;

    if (error) {
      return <div className='errorMsg'>{ error }</div>;
    }

    const {
      name,
      username,
      avatar,
      github,
      discussions,
    } = profile;

    if (fetchingProfile) {
      return (
        <div className={classnames(appLayout.constraintWidth, styles.loadingMsg)}>
          Loading users profile ...
        </div>
      );
    }

    return (
      <div className={classnames(appLayout.constraintWidth, styles.container)}>
        <div className={appLayout.primaryContent}>
          <Profile
            name={name}
            gitHandler={username}
            avatarUrl={avatar}
          />
          { JSON.stringify(profile)}
          <FeedBox
            userProfile
            type='general'
            discussions={discussions}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => { return {
  }; },
  (dispatch) => { return {
    // fetchUserProfile: (userSlug) => { dispatch(fetchUserProfile(userSlug)); },
  }; }
)(UserProfile);
