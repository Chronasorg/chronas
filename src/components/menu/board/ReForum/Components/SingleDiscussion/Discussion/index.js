import _ from 'lodash'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import classnames from 'classnames'
import styles from './styles.css'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import PlaceholderImage from '../../../SharedStyles/placeholder.jpg'
import Button from '../../../Components/Button'
import Tag from '../../../Components/Tag'
import RichEditor from '../../../Components/RichEditor'
import TagsInput from '../../../Components/NewDiscussion/TagsInput'
import {properties, themes} from "../../../../../../../properties";
import {updateDiscussion} from "../../../Views/NewDiscussion/actions";

class Discussion extends Component {
  state = {
    errorMsg: '',
    forumId: null,
    userId: null,
    fatalError: null,
    currentDiscussion: {
      title: '',
      content: '',
      tags: [],
      pinned: false,
    },
    isEditMode: false,
  }

  componentDidMount = () => {
    const { tags, discContent, discTitle, user } = this.props
    this.setState((prevState) => {
      return { currentDiscussion: { pinned: false, content: discContent, tags: tags, title: discTitle },
        userId: user._id || localStorage.getItem('chs_userid')}
    })
  }

  _enableEdit = () => {
    const {
      editAction
    } = this.props

    const {
      isEditMode
    } = this.state

    this.setState({ isEditMode: !isEditMode })

    // editAction()
  }

  componentWillReceiveProps (nextProps) {
    const {
      user,
      forums,
    } = this.props

    const finalCurrentForum = (((nextProps || {}).match || {}).params || {}).qId ? properties.QAID : nextProps.currentForum

    this.setState({ errorMsg: '' })

    this.setUserAndForumID(user, forums, finalCurrentForum)
  }

  setUserAndForumID (user, forums, currentForum) {
    const forumId = _.find(forums, { forum_slug: currentForum })
    if (forumId || currentForum === properties.QAID) {
      const currentForumId = (forumId || {})._id
      this.setState({
        forumId: currentForumId,
        userId: user._id || localStorage.getItem('chs_userid'),
      })
    } else {
      this.setState({
        fatalError: 'Invalid forum buddy, go for the right one!',
      })
    }
  }

  updateDiscussionContent = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, content: val } }
    })
  }

  _postDiscussion = (userId, forumId, currentForum, currentDiscussion) => {
    const { id, forums, match, discussion_slug } = this.props

    const finalForumId = (forumId) || (forums.filter(f => f.forum_slug === properties.QAID) || {})._id
    const res = updateDiscussion(userId, finalForumId, currentForum || properties.QAID, currentDiscussion, ((match || {}).params || {}).qId, discussion_slug)

    this.setState({ isEditMode: false })
  }

  updateDiscussionTags = (val) => {
    this.setState((prevState) => {
      return { currentDiscussion: { ...prevState.currentDiscussion, tags: val } }
    })
  }

  render () {
    const {
      currentForum,
      id,
      userAvatar,
      userName,
      userGitHandler,
      discTitle,
      discDate,
      forumId,
      discContent,
      theme,
      match,
      tags,
      favoriteCount,
      favoriteAction,
      userFavorited,
      toggleingFavorite,
      allowDelete,
      deletingDiscussion,
      deleteAction,
      editAction
    } = this.props

    const finalCurrentForm = ((match || {}).params || {}).qId ? properties.QAID : currentForum

    const {
      title,
      content,
      pinned,
    } = this.state.currentDiscussion

    const {
      isEditMode,
      userId,
      currentDiscussion
    } = this.state

    let dateDisplay = moment(discDate)
    dateDisplay = dateDisplay.from(moment())

    let favCount = ''
    if (toggleingFavorite) favCount = 'Toggling Upvote...'
    else if (userFavorited) favCount = `Points (${favoriteCount})`
    else if (favoriteCount === 0) favCount = 'Upvote'
    else if (favoriteCount === 1) favCount = '1 Upvote'
    else favCount = `${favoriteCount} Upvotes`

    const finalAvatarUrl = userAvatar ? <img className='Discussion_avatar' src={userAvatar} alt={`${name} avatar`} /> : <AccountIcon className='Discussion_avatar' />

    return (
      <div className='Discussion_container'>

        <div className='Discussion_infoContainer'>
          { finalAvatarUrl }
          <div className='Discussion_columnOnSmallBP'>
            <div className='Discussion_userInfo'>
              <Link to={`/community/user/${userGitHandler}`} className='Discussion_name'>{userName || userGitHandler}</Link>
            </div>
            <div className='Discussion_dateInfo'>{dateDisplay}</div>
          </div>
        </div>

        <div className='Discussion_discTitle'>{discTitle}</div>
        <div className='Discussion_discContent'>
          <RichEditor
            customTheme={themes[theme]}
            readOnly={!isEditMode}
            isEdit={isEditMode}
            value={discContent}
            onChange={(value) => { this.updateDiscussionContent(value) }}
            onSave={() => { this._postDiscussion(userId, forumId, finalCurrentForm, currentDiscussion) }}
          />
          { isEditMode && <TagsInput
            key={'tags'}
            value={currentDiscussion.tags}
            customTheme={themes[theme]}
            isQA={currentForum === properties.QAID}
            onChange={(tags) => { this.updateDiscussionTags(tags) }}
          />}
        </div>

        <div className='Discussion_discFooter'>
          { !isEditMode && <div className='Discussion_tags'>
            { ((currentDiscussion || {}).tags || tags).map(tag => <Tag customTheme={themes[theme]} name={tag} key={_.uniqueId('tag_')} />)}
          </div> }
          <Button noUppercase className='Discussion_favoriteButton' style={{ color: themes[theme].backColors[0], background: themes[theme].foreColors[0]}} onClick={() => { !toggleingFavorite && favoriteAction(id) }}>
            <i className={classnames(`fa fa-${userFavorited ? 'heart' : 'heart-o'}`)} />
            <span>{favCount}</span>
          </Button>
          { allowDelete && <Button noUppercase className='Discussion_deleteButton' onClick={() => { this._enableEdit() }}>
            <i className={classnames('fa fa-pencil-square-o')} />
            <span>Edit</span>
          </Button> }
          { allowDelete && <Button noUppercase className='Discussion_deleteButton' onClick={() => { deleteAction() }}>
            <i className={classnames('fa fa-trash', 'trashIcon')} />
            <span>Delete</span>
          </Button> }
        </div>

        { deletingDiscussion && <div className='Discussion_deletingDiscussion'>
          Deleting Discussion...
        </div> }
      </div>
    )
  }
}

Discussion.defaultProps = {
  id: 0,
  userName: 'n/a',
  userGitHandler: 'github',
  discTitle: 'Default Discussion Title',
  discDate: 'a day ago',
  discContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  tags: [ 'react', 'redux', 'webkit' ],
  favoriteCount: 1,
  favoriteAction: () => { },
  userFavorited: false,
  toggleingFavorite: false,
  allowDelete: false,
  deletingDiscussion: false,
  deleteAction: () => { },
  editAction: () => { }
}

export default Discussion
