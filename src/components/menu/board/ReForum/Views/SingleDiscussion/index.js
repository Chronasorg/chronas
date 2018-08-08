import _ from 'lodash';
import React, { Component } from 'react';
// import { browserHistory } from 'react-router';
import compose from 'recompose/compose'
import { connect } from 'react-redux';
import { properties } from "../../../../../../properties";
import classnames from 'classnames';

import {
  getDiscussion,
  toggleFavorite,
  postOpinion,
  deletePost,
  deletedDiscussionRedirect,
  deleteOpinion,
  voteOpinion
} from './actions';

import { translate, defaultTheme, userLogout, showNotification } from 'admin-on-rest'
import Discussion from '../../Components/SingleDiscussion/Discussion';
import ReplyBox from '../../Components/SingleDiscussion/ReplyBox';
import Opinion from '../../Components/SingleDiscussion/Opinion';

class SingleDiscussion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSortingMethod: 'date',
      opinionContent: '',
      discussion: {},
      opinion: {},
      fetchingDiscussion: true
    }
  }

  componentDidMount() {
    const {
      forums,
      setForums
    } = this.props

    const {
      discussion,
    } = this.props.match.params;


    if (forums.length < 1) {
      setForums()
    }
    getDiscussion(discussion).then( (data) => this.setState({ fetchingDiscussion: false, discussion: data }) )
  }

  _onChangeSortingMethod = (method) => {

    const prevDiscussion = this.state.discussion
    const prevOpinions = prevDiscussion.opinions || []

    if (method === 'date') {
      prevDiscussion.opinions = prevOpinions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      this.setState ({
        discussion: prevDiscussion,
        activeSortingMethod: method,
      })
    } else if (method === 'popularity') {
      prevDiscussion.opinions = prevOpinions.sort((a, b) => b.score - a.score)

      this.setState ({
        discussion: prevDiscussion,
        activeSortingMethod: method,
      })
    }

  }

  componentWillReceiveProps(nextProps) {
    const {
      deletedDiscussion,
      deletedDiscussionRedirect,
      forums,
      setForums
    } = nextProps;

    const { forum } = this.props.match.params;

    // check if the discussion is deleted and redirect the user
  }

  updateOpinionContent(val) {
    if (val !== this.state.opinionContent){
      this.setState({ opinionContent: val})
      this.forceUpdate()
    }
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
      currentForum,
      showNotification
    } = this.props;

    const {
      opinionContent,
      discussion,
    } = this.state

    const forumId = forums.filter(f => f.forum_slug === currentForum)[0]._id
    const discussion_slug = this.props.match.params.discussion

    postOpinion(
      {
        forum_id: forumId,
        discussion_id: discussion._id,
        user_id: localStorage.getItem('chs_userid'),
        content: opinionContent,
      },
      discussion_slug
    ).then((data) => {
      showNotification("Replied")
      // this.updateOpinionContent('{"blocks":[{"key":"8mpkt","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}')
      this.setState({
        opinionContent: '{"blocks":[{"text":"","type":"header-three","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        discussion: data
      })
    })
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

  _voteOpinion(opinionId, isUpvote) {
    const { discussion } = this.props.match.params;

    const upvotedItems = (localStorage.getItem('chs_upvotedOpinions') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedOpinions') || '').split(',')
    const alreadyUpvoted = (upvotedItems.indexOf(opinionId) > -1)
    const alreadyDownvoted = (downvotedItems.indexOf(opinionId) > -1)

    let delta = 0
    if (isUpvote) {
      delta = 0

      if (alreadyUpvoted) {
        delta = -1
        localStorage.setItem('chs_upvotedOpinions', upvotedItems.filter((elId) => elId !== opinionId))
      }
      else if (alreadyDownvoted) {
        localStorage.setItem('chs_downvotedOpinions', downvotedItems.filter((elId) => elId !== opinionId))
        localStorage.setItem('chs_upvotedOpinions', upvotedItems.filter((elId) => elId !== opinionId).concat([opinionId]))
        delta = 2
      } else {
        localStorage.setItem('chs_downvotedOpinions', downvotedItems.filter((elId) => elId !== opinionId))
        localStorage.setItem('chs_upvotedOpinions', upvotedItems.filter((elId) => elId !== opinionId).concat([opinionId]))
        delta = 1
      }


    } else {
      delta = 0

      if (alreadyDownvoted) {
        localStorage.setItem('chs_downvotedOpinions', downvotedItems.filter((elId) => elId !== opinionId))
        delta = 1
      }
      else if (alreadyUpvoted) {
        localStorage.setItem('chs_upvotedOpinions', upvotedItems.filter((elId) => elId !== opinionId))
        localStorage.setItem('chs_downvotedOpinions', downvotedItems.filter((elId) => elId !== opinionId).concat([opinionId]))
        delta = -2
      } else {
        localStorage.setItem('chs_upvotedOpinions', upvotedItems.filter((elId) => elId !== opinionId))
        localStorage.setItem('chs_downvotedOpinions', downvotedItems.filter((elId) => elId !== opinionId).concat([opinionId]))
        delta = -1
      }
    }

    voteOpinion(opinionId, discussion, delta).then((data) => this.setState({ discussion: data }))
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
      match,
      opinionError,
      deletingOpinion,
      deletingDiscussion,
      error,
      translate
    } = this.props;

    const {
      fetchingDiscussion,
      discussion,
      opinionContent,
      activeSortingMethod
      // toggleFavorite,
      // toggleingFavorite,
      // postingOpinion,
      // opinionError,
      // deletingOpinion,
      // deletingDiscussion,
      // error,
    } = this.state;


    if (error) {
      return (<div className='SD_errorMsg'>{error}</div>);
    }

    // return loading status if discussion is not fetched yet
    if (fetchingDiscussion) {
      return <div className='SD_loadingWrapper'>Loading discussion ...</div>;
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
      avatar,
      name,
      username,
    } = discussion.user;

    // check if logged in user is owner of the discussion
    let allowDelete = false;
    if (discussion.user._id === localStorage.getItem('chs_userid')) allowDelete = true

    // check if user favorated the discussion
    const userFavorited = this.userFavoritedDiscussion(localStorage.getItem('chs_userid'), favorites)


    const { forum } = this.props.match.params;
    const isQA = forum === properties.QAID
    return (
      <div className={'appLayout_constraintWidth'}>
        <Discussion
          id={_id}
          userAvatar={avatar}
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
          translate={translate}
        />

        { opinionError && <div className='SD_errorMsg'>{opinionError}</div> }

        <ReplyBox
          isQA={isQA}
          posting={postingOpinion}
          onSubmit={this.handleReplySubmit.bind(this)}
          onChange={(content) => { this.updateOpinionContent(content) }}
          opinionContent={opinionContent}
          translate={translate}
        />


        <div className='FeedBox_sortList'>
          <span
            className={classnames('FeedBox_sort', (activeSortingMethod === 'date') && 'FeedBox_sortActive')}
            onClick={() => this._onChangeSortingMethod('date')}
          >
            Latest
          </span>
          <span
            className={classnames('FeedBox_sort', (activeSortingMethod === 'popularity') && 'FeedBox_sortActive')}
            onClick={() => this._onChangeSortingMethod('popularity')}
          >
            Popular
          </span>
        </div>
        { opinions && opinions.map((opinion) => {
          return (
            <Opinion
              isQA={isQA}
              key={opinion._id}
              opinionId={opinion._id}
              userAvatar={opinion.user.avatar}
              userName={opinion.user.name}
              score={opinion.score}
              userGitHandler={opinion.user.username}
              opDate={opinion.date}
              opContent={opinion.content}
              userId={opinion.user_id}
              currentUserId={localStorage.getItem('chs_userid')}
              currentUserRole={this.props.userRole}
              deleteAction={this._deleteOpinion.bind(this)}
              voteAction={this._voteOpinion.bind(this)}
              deletingOpinion={deletingOpinion}
              translate={translate}
            />
          );
        }) }
      </div>
    );
  }
}


const enhance = compose(
  connect(state => ({
    userRole: state.user.role,
    fetchingDiscussion: state.discussion.fetchingDiscussion,
    toggleingFavorite: state.discussion.toggleingFavorite,
    deletingDiscussion: state.discussion.deletingDiscussion,
    deletedDiscussion: state.discussion.deletedDiscussion,
    opinionContent: state.discussion.opinionContent,
    postingOpinion: state.discussion.postingOpinion,
    opinionError: state.discussion.opinionError,
    deletingOpinion: state.discussion.deletingOpinion,
    error: state.discussion.error,
  }), {
    postOpinion: (opinion, discussionSlug) => { dispatch(postOpinion(opinion, discussionSlug)); },
    showNotification,
  }),
  // pure,
  // translate,
);

export default enhance(SingleDiscussion);
