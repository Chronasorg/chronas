import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';

// components used in this view
import Profile from '../../Components/UserProfile/Profile';
import FeedBox from '../../Components/FeedBox';
import Opinion from '../../Components/SingleDiscussion/Opinion'

// actions
import {
  fetchUserProfile,
} from './actions';
import {getDiscussion} from "../SingleDiscussion/actions";
import {themes} from "../../../../../../properties";

const opinionBoxTitle = 'Comments'

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
    const {
      forums,
      setForums
    } = this.props;
    const { username } = this.props.match.params;

    if (!forums || forums.length < 1) {
      setForums()
    }
    fetchUserProfile(username).then( (data) => this.setState({ fetchingProfile: false, profile: data }) )
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.params || !this.props.match.params) return
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
      forums, translate, theme
    } = this.props;

    const {
      fetchingProfile,
      profile,
      error,
    } = this.state;

    if (error) {
      return <div className='UP_errorMsg'>{ error }</div>;
    }

    const statItem = (title, value) => {
      return <div className='FeedBox_container'>
        <div className='FeedBox_header'>
          <span className='FeedBox_title'>{title}</span>
        </div>
        <div className='FeedBox_discussions'>
          <h3>{ value }</h3>
        </div>
      </div>
    }

    const {
      name,
      username,
      avatar,
      github,
      website,
      bio,
      education,
      discussions,
      opinions,
    } = profile;

    if (fetchingProfile || !forums || forums.length < 1) {
      return (
        <div className={classnames('appLayout_constraintWidth', 'UP_loadingMsg')}>
          Loading users profile ...
        </div>
      );
    }

    return (
      <div className={classnames('appLayout_constraintWidth', 'UP_container')}>
        <div className={'appLayout_primaryContent'}>
          <Profile
            name={name}
            gitHandler={username}
            avatarUrl={avatar}
            profile={profile}
            website={website}
            bio={bio}
            education={education}
          />
          <div className='user_stats'>
            { (typeof profile.karma !== "undefined") && statItem('Total Points', profile.karma) }
            { (typeof profile.loginCount !== "undefined") && statItem('Login Count', profile.loginCount) }
            { (typeof profile.count_voted !== "undefined") && statItem('Vote Count', profile.count_voted) }
            { (typeof profile.count_created !== "undefined") && statItem('Create Count', profile.count_created) }
            { (typeof profile.count_updated !== "undefined") && statItem('Edit Count', profile.count_updated) }
            { (typeof profile.count_deleted !== "undefined") && statItem('Delete Count', profile.count_deleted) }
            { (typeof profile.count_mistakes !== "undefined") && statItem('Mistakes Count', profile.count_mistakes) }
            { (typeof profile.count_reverted !== "undefined") && statItem('Revert Count', profile.count_reverted) }
            { (typeof profile.count_linked !== "undefined") && statItem('Linked Count', profile.count_linked) }
            { (typeof profile.count_voted !== "undefined") && statItem('Vote Count', profile.count_voted) }
          </div>
          <FeedBox
            customTheme={themes[theme]}
            userProfile
            type='general'
            discussions={discussions}
          />
          <div className='FeedBox_container'>
            <div className='FeedBox_header' style={{ background: themes[theme].foreColors[0]}}>
              <span className='FeedBox_title'>{opinionBoxTitle}</span>
            </div>
            <div className='FeedBox_discussions'>
              { opinions && opinions.length === 0 && <div className='FeedBox_loading'>No comments...</div> }
              { opinions && opinions.map((opinion) => {
                const forum = (forums.filter(f => opinion.forum_id === f._id) || {})[0]
                return (
                  <Opinion
                    theme={theme}
                    userProfile
                    forum={forum}
                    isQA={false}
                    opinionTitle={opinion._id}
                    opinionSlug={opinion._id}
                    key={opinion._id}
                    score={opinion.score}
                    discussion={opinion.discussion}
                    opinionId={opinion._id}
                    userAvatar={opinion.user.avatarUrl}
                    userName={opinion.user.name}
                    userGitHandler={opinion.user.username}
                    opDate={opinion.date}
                    opContent={opinion.content}
                    userId={opinion.user_id}
                    currentUserId={localStorage.getItem('chs_userid')}
                    currentUserRole={this.props.userRole}
                    translate={translate}
                  />
                )
              }) }
            </div>
          </div>
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
