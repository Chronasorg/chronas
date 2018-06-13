import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import RichEditor from '../../Components/RichEditor';
import PinButton from '../../Components/NewDiscussion/PinButton';
import TagsInput from '../../Components/NewDiscussion/TagsInput';

import {
  postDiscussion,
  // updateDiscussionTitle,
  // updateDiscussionContent,
  // updateDiscussionPinStatus,
  // updateDiscussionTags,
} from './actions';

import styles from './styles.css';
import appLayout from '../../SharedStyles/appLayout.css';

class NewDiscussion extends Component {
  constructor (props) {
    super(props);

    this.state = {
      errorMsg: "",
      forumId: null,
      userId: null,
      fatalError: null,
      currentDiscussion: {
        title: "",
        content: "",
        tags: [],
        pinned: false,
      }
    };
  }

  componentDidMount() {
    const {
      user,
      currentForum,
      forums,
    } = this.props;

    this.setUserAndForumID(user, forums, currentForum);
  }

  componentWillReceiveProps(nextProps) {
    const {
      user,
      currentForum,
      forums,
    } = nextProps;

    this.setState({errorMsg: ''})

    this.setUserAndForumID(user, forums, currentForum);
  }

  setUserAndForumID(user, forums, currentForum) {
    const forumId = _.find(forums, { forum_slug: currentForum });
    if (forumId) {
      const currentForumId = forumId._id;
      this.setState({
        forumId: currentForumId,
        userId: user._id || localStorage.getItem('userid'),
      });
    } else {
      this.setState({
        fatalError: 'Invalid forum buddy, go for the right one!',
      });
    }
  }

  updateDiscussionTitle = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, title: val } }
    })
  }

  updateDiscussionContent = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, content: val } }
    })

  }

  updateDiscussionPinStatus = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, pinned: val } }
    })

  }

  updateDiscussionTags = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, tags: val } }
    })
  }

  _postDiscussion = (userId, forumId, currentForum, currentDiscussion) => {
    const res = postDiscussion(userId, forumId, currentForum, currentDiscussion)
    if (res === 'OK') {
      // Success

    } else {
      // Error
      this.setState({
        errorMsg: res
      })
    }
  }

  renderEditor() {
    const {
      role,
    } = this.props.user;

    const {
      // updateDiscussionTitle,
      // updateDiscussionContent,
      // updateDiscussionPinStatus,
      // updateDiscussionTags,
      // postDiscussion,
      currentForum,
    } = this.props;

    const {
      title,
      content,
      tags,
      pinned,
    } = this.state.currentDiscussion;

    const {
      forumId,
      userId,
      currentDiscussion
    } = this.state;

      return [
        <input
          key={'title'}
          type="text"
          className='titleInput'
          placeholder={'Discussion title...'}
          value={title}
          onChange={(event) => { this.updateDiscussionTitle(event.target.value); }}
        />,
        (role === 'admin') && <PinButton
          key={'pinned'}
          value={pinned}
          onChange={(value) => { this.updateDiscussionPinStatus(value); }}
        />,
        <TagsInput
          key={'tags'}
          value={tags}
          onChange={(tags) => { this.updateDiscussionTags(tags); }}
        />,
        <RichEditor
          key={'content'}
          type='newDiscussion'
          value={content}
          onChange={(value) => { this.updateDiscussionContent(value); }}
          onSave={() => {  this._postDiscussion(userId, forumId, currentForum, currentDiscussion) }}
        />,
      ];
  }

  render() {
    const { fatalError, errorMsg } = this.state;

    if (fatalError) { return (<div className={classnames(styles.errorMsg, styles.fatalError)}>{fatalError}</div>); }

    const { currentForum } = this.props;
    const {
      postingSuccess,
      postingDiscussion,
    } = this.props.newDiscussion;

    return (
      <div className={classnames(appLayout.constraintWidth, styles.content)}>
        <div className='forumInfo'>
          You are creating a new discussion on <span className='forumName'>{currentForum}</span> forum.
        </div>
        <div className='errorMsg'>{errorMsg}</div>
        { postingSuccess && <div className='successMsg'>Your discussion is created :-)</div> }
        { this.renderEditor() }
        { postingDiscussion && <div className='postingMsg'>Posting discussion...</div> }
      </div>
    );
  }
}

export default connect(
  (state) => { return {
    user: state.user,
    newDiscussion: state.newDiscussion,
  }; },
  (dispatch) => { return {
    // postDiscussion: (userId, forumId, currentForum) => { dispatch(postDiscussion(userId, forumId, currentForum)); },
    // updateDiscussionTitle: (value) => { dispatch(updateDiscussionTitle(value)); },
    // updateDiscussionContent: (value) => { dispatch(updateDiscussionContent(value)); },
    // updateDiscussionPinStatus: (value) => { dispatch(updateDiscussionPinStatus(value)); },
    // updateDiscussionTags: (value) => { dispatch(updateDiscussionTags(value)); },
  }; }
)(NewDiscussion);
