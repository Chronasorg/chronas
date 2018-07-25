import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import QAIcon from 'material-ui/svg-icons/action/question-answer'
import RichEditor from '../../Components/RichEditor'
import PinButton from '../../Components/NewDiscussion/PinButton'
import TagsInput from '../../Components/NewDiscussion/TagsInput'

import {
  postDiscussion,
  // updateDiscussionTitle,
  // updateDiscussionContent,
  // updateDiscussionPinStatus,
  // updateDiscussionTags,
} from './actions'

import styles from './styles.css'
import appLayout from '../../SharedStyles/appLayout.css'

import properties from '../../../../../../properties'

class NewDiscussion extends Component {
  constructor (props) {
    super(props)

    this.state = {
      errorMsg: '',
      forumId: null,
      userId: null,
      fatalError: null,
      currentDiscussion: {
        title: '',
        content: '',
        tags: [],
        pinned: false,
      }
    }
  }

  componentDidMount () {
    const {
      user,
      currentForum,
      setForums,
      forums,
      match,
    } = this.props

    if (!forums || forums.length < 1) {
      setForums()
    }
    const finalCurrentForum = match.params.qId ? properties.QAID : currentForum

    this.setUserAndForumID(user, forums, finalCurrentForum)
  }

  componentWillReceiveProps (nextProps) {
    const {
      user,
      forums,
    } = this.props

    const finalCurrentForum = nextProps.match.params.qId ? properties.QAID : nextProps.currentForum

    this.setState({ errorMsg: '' })

    this.setUserAndForumID(user, forums, finalCurrentForum)
  }

  setUserAndForumID (user, forums, currentForum) {
    const forumId = _.find(forums, { forum_slug: currentForum })
    if (forumId || currentForum === properties.QAID) {
      const currentForumId = (forumId || {})._id || properties.QAID
      this.setState({
        forumId: currentForumId,
        userId: user._id || localStorage.getItem('userid'),
      })
    } else {
      this.setState({
        fatalError: 'Invalid forum buddy, go for the right one!',
      })
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
    const { forums } = this.props
    const { qId } = this.props.match.params

    const finalForumId = (forumId) || ((forums.filter(f => f.forum_slug === properties.QAID) || [])[0] || {})._id
    const res = postDiscussion(userId, finalForumId, currentForum || properties.QAID, currentDiscussion, qId)
    if (res === 'OK') {
      // Success

    } else {
      // Error
      this.setState({
        errorMsg: res
      })
    }
  }

  renderEditor () {
    const {
      role,
    } = this.props.user

    const {
      // updateDiscussionTitle,
      // updateDiscussionContent,
      // updateDiscussionPinStatus,
      // updateDiscussionTags,
      // postDiscussion,
      match,
      currentForum,
    } = this.props

    const finalCurrentForm = match.params.qId ? properties.QAID : currentForum

    const {
      title,
      content,
      tags,
      pinned,
    } = this.state.currentDiscussion

    const {
      forumId,
      userId,
      currentDiscussion
    } = this.state

    return [
      <input
        key={'title'}
        type='text'
        className='NewDiscussion_titleInput'
        placeholder={'Discussion title...'}
        value={title}
        onChange={(event) => { this.updateDiscussionTitle(event.target.value) }}
        />,
      (role === 'admin') && <PinButton
        key={'pinned'}
        value={pinned}
        onChange={(value) => { this.updateDiscussionPinStatus(value) }}
        />,
      <TagsInput
        key={'tags'}
        value={tags}
        onChange={(tags) => { this.updateDiscussionTags(tags) }}
        />,
      <RichEditor
        newDiscussion
        key={'content'}
        type='newDiscussion'
        value={content}
        onChange={(value) => { this.updateDiscussionContent(value) }}
        onSave={() => { this._postDiscussion(userId, forumId, finalCurrentForm, currentDiscussion) }}
        />,
    ]
  }

  render () {
    const { fatalError, errorMsg } = this.state

    if (fatalError) { return (<div className={classnames('NewDiscussion_errorMsg', 'NewDiscussion_fatalError')}>{fatalError}</div>) }

    const { currentForum, match } = this.props

    const finalCurrentForm = match.params.qId ? properties.QAID : currentForum

    const {
      postingSuccess,
      postingDiscussion,
    } = this.props.newDiscussion

    const isQA = (finalCurrentForm === properties.QAID)
    return (
      <div className='appLayout_constraintWidth content'>
        { (isQA) ? <div className='NewDiscussion_forumInfo'>
          You are adding a questions for <span className='NewDiscussion_forumName'>{finalCurrentForm}</span> forum.
        </div> : <div className='NewDiscussion_forumInfo'>
          You are creating a new discussion on <span className='NewDiscussion_forumName'>{finalCurrentForm}</span> forum.
        </div> }
        <div className='NewDiscussion_errorMsg'>{errorMsg}</div>
        { postingSuccess && <div className='NewDiscussion_successMsg'>Your discussion is created :-)</div> }
        { this.renderEditor() }
        { postingDiscussion && <div className='NewDiscussion_postingMsg'>Posting discussion...</div> }
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
      user: state.user,
      newDiscussion: state.newDiscussion,
    }
  },
  (dispatch) => {
    return {
    // postDiscussion: (userId, forumId, currentForum) => { dispatch(postDiscussion(userId, forumId, currentForum)); },
    // updateDiscussionTitle: (value) => { dispatch(updateDiscussionTitle(value)); },
    // updateDiscussionContent: (value) => { dispatch(updateDiscussionContent(value)); },
    // updateDiscussionPinStatus: (value) => { dispatch(updateDiscussionPinStatus(value)); },
    // updateDiscussionTags: (value) => { dispatch(updateDiscussionTags(value)); },
    }
  }
)(NewDiscussion)
