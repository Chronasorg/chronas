import _ from 'lodash';
import React, { Component } from 'react';
// import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import {
  getDiscussion,
  toggleFavorite,
  postOpinion,
  deletePost,
  deletedDiscussionRedirect,
  deleteOpinion,
} from './actions';

import Discussion from '../../Components/SingleDiscussion/Discussion';
import ReplyBox from '../../Components/SingleDiscussion/ReplyBox';
import Opinion from '../../Components/SingleDiscussion/Opinion';

import styles from './styles.css';
import appLayout from '../../SharedStyles/appLayout.css';

class SingleDiscussion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opinionContent: '',
      discussion: {},
      opinion: {},
      fetchingDiscussion: true
    }
  }

  componentDidMount() {
    const {
      discussion,
    } = this.props.match.params;

    getDiscussion(discussion).then( (data) => this.setState({ fetchingDiscussion: false, discussion: data }) )
  }

  componentDidUpdate() {
    const {
      deletedDiscussion,
      deletedDiscussionRedirect,
    } = this.props;

    const { forum } = this.props.match.params;

    // check if the discussion is deleted and redirect the user
  }

  updateOpinionContent(val) {
    this.setState({ opinionContent: val})
  }

  componentWillUnmount() {
    // remove any existing opinion texts
    this.updateOpinionContent(null);
  }

  userFavoritedDiscussion(userId, favorites) {
    let favorited = false;
    for(let i = 0; i < favorites.length; i++) {
      if (favorites[i] === userId) favorited = true;
    }
    return favorited;
  }

  handleReplySubmit() {
    const {
      forums,
      currentForum
    } = this.props;

    const {
      opinionContent,
      discussion,
    } = this.state

    const forumId = forums.filter(f => f.forum_slug === currentForum)[0]._id

    const discussion_slug = this.props.match.params.discussion;

    postOpinion(
      {
        forum_id: forumId,
        discussion_id: discussion._id,
        user_id: localStorage.getItem('userid'),
        content: opinionContent,
      },
      discussion_slug
    ).then((data) => this.setState({ discussion: data }))
  }

  deleteDiscussion() {
    const { discussion } = this.props.match.params;
    const { currentForum } = this.props;
    deletePost(discussion, currentForum);
  }

  _deleteOpinion(opinionId) {
    const { discussion } = this.props.match.params;
    deleteOpinion(opinionId, discussion).then((data) => this.setState({ discussion: data }))
  }

  _toggleFavorite(discussionId) {
    toggleFavorite(discussionId).then((data) => this.setState({ discussion: data }))
  }

  updateDiscussionTitle = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, title: val } }
    })
  }

  render() {
    const {
      toggleingFavorite,
      postingOpinion,
      opinionError,
      deletingOpinion,
      deletingDiscussion,
      error,
    } = this.props;

    const {
      fetchingDiscussion,
      discussion,
      // toggleFavorite,
      // toggleingFavorite,
      // postingOpinion,
      // opinionError,
      // deletingOpinion,
      // deletingDiscussion,
      // error,
    } = this.state;


    if (error) {
      return (<div className='errorMsg'>{error}</div>);
    }

    // return loading status if discussion is not fetched yet
    if (fetchingDiscussion) {
      return <div className='loadingWrapper'>Loading discussion ...</div>;
    }

    const {
      _id,
      content,
      date,
      favorites,
      title,
      tags,
      opinions,
    } = discussion;

    const {
      avatarUrl,
      name,
      username,
    } = discussion.user;

    // check if logged in user is owner of the discussion
    let allowDelete = false;
    if (discussion.user._id === localStorage.getItem('userid')) allowDelete = true

    // check if user favorated the discussion
    const userFavorited = this.userFavoritedDiscussion(localStorage.getItem('userid'), favorites)

    return (
      <div className={appLayout.constraintWidth}>
        <Discussion
          id={_id}
          userAvatar={avatarUrl}
          userName={name}
          userGitHandler={username}
          discTitle={title}
          discDate={date}
          discContent={content}
          tags={tags}
          favoriteCount={favorites.length}
          favoriteAction={() => this._toggleFavorite(_id)}
          userFavorited={userFavorited}
          // toggleingFavorite={}
          allowDelete={allowDelete}
          deletingDiscussion={deletingDiscussion}
          deleteAction={this.deleteDiscussion.bind(this)}
        />

        { opinionError && <div className='errorMsg'>{opinionError}</div> }

        <ReplyBox
          posting={postingOpinion}
          onSubmit={this.handleReplySubmit.bind(this)}
          onChange={(content) => { this.updateOpinionContent(content); }}
        />

        { opinions && opinions.map((opinion) => {
          return (
            <Opinion
              key={opinion._id}
              opinionId={opinion._id}
              userAvatar={opinion.user.avatarUrl}
              userName={opinion.user.name}
              userGitHandler={opinion.user.username}
              opDate={opinion.date}
              opContent={opinion.content}
              userId={opinion.user_id}
              currentUserId={localStorage.getItem('userid')}
              currentUserRole={this.props.userRole}
              deleteAction={this._deleteOpinion.bind(this)}
              deletingOpinion={deletingOpinion}
            />
          );
        }) }
      </div>
    );
  }
}

export default connect(
  (state) => { return {
    userRole: state.user.role,
    fetchingDiscussion: state.discussion.fetchingDiscussion,
    toggleingFavorite: state.discussion.toggleingFavorite,
    deletingDiscussion: state.discussion.deletingDiscussion,
    deletedDiscussion: state.discussion.deletedDiscussion,
    // opinionContent: state.discussion.opinionContent,
    postingOpinion: state.discussion.postingOpinion,
    opinionError: state.discussion.opinionError,
    deletingOpinion: state.discussion.deletingOpinion,
    error: state.discussion.error,
  }; },
  (dispatch) => { return {
    // getDiscussion: (discussionSlug) => { dispatch(getDiscussion(discussionSlug)); },
    // toggleFavorite: (discussionId) => { dispatch(toggleFavorite(discussionId)); },
    // updateOpinionContent: (content) => { dispatch(updateOpinionContent(content)); },
    // postOpinion: (opinion, discussionSlug) => { dispatch(postOpinion(opinion, discussionSlug)); },
    // deletePost: (discussionSlug) => { dispatch(deletePost(discussionSlug)); },
    // deletedDiscussionRedirect: () => { dispatch(deletedDiscussionRedirect()); },
    // deleteOpinion: (opinionId, discussionSlug) => { dispatch(deleteOpinion(opinionId, discussionSlug)); },
  }; }
)(SingleDiscussion);
