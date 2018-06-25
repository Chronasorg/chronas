import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import moment from 'moment'
import classnames from 'classnames'
import styles from './styles.css'

import PlaceholderImage from '../../../SharedStyles/placeholder.jpg'
import Button from '../../../Components/Button'
import RichEditor from '../../../Components/RichEditor'

class Opinion extends Component {
  render () {
    const {
      userProfile,
      opinionId,
      userAvatar,
      userName,
      forum,
      discussion,
      userGitHandler,
      opDate,
      opContent,
      userId,
      currentUserId,
      currentUserRole,
      deleteAction,
      deletingOpinion,
    } = this.props

    let dateDisplay = moment(opDate)
    dateDisplay = dateDisplay.from(moment())

    const allowDelete = (userId === currentUserId) || (currentUserRole === 'admin')

    const finalAvatarUrl = userAvatar ? <img className='Opinion_avatar' src={userAvatar} alt={`${name} avatar`} /> : <AccountIcon className='Opinion_avatar' />

    return (
      <div className='Opinion_container'>
        <div className='Opinion_infoContainer'>
          { !userProfile && finalAvatarUrl }
          <div className='Opinion_userInfo'>
            { !userProfile && <Link to={`/community/user/${userGitHandler}`} className='Opinion_name'>{userName || userGitHandler}</Link> }
            { userProfile && <Link to={`/community/${forum.forum_slug}/discussion/${discussion.discussion_slug}`} className='Opinion_name'>{forum.forum_name} -> {discussion.title}</Link> }
          </div>
          <div className='dateInfo'>{dateDisplay}</div>
          { !userProfile && allowDelete && <Button className='deleteButton' noUppercase onClick={() => { deleteAction(opinionId) }}>
            <i className={classnames('fa fa-trash', 'trashIcon')} />
            <span>Delete</span>
          </Button> }
          {/* <Button noUppercase>Quote</Button> */}
        </div>

        <div className='Opinion_opContent'>
          <RichEditor
            readOnly
            value={opContent}
          />
        </div>

        { (deletingOpinion === opinionId) && <div className='Opinion_deletingOpinion'>Deleting Opinion ...</div> }
      </div>
    )
  }
}

Opinion.defaultProps = {
  opinionId: '12345',
  userName: 'n/a',
  userGitHandler: 'github',
  opDate: 'a day ago',
  opContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  userId: '12345',
  currentUserId: '12345',
  forum: {},
  discussion: {},
  currentUserRole: 'user',
  deleteAction: () => {},
  deletingOpinion: null,
}

Opinion.propTypes = {
  opinionId: React.PropTypes.string,
  userAvatar: React.PropTypes.string,
  userName: React.PropTypes.string,
  userGitHandler: React.PropTypes.string,
  opDate: React.PropTypes.any,
  forum: React.PropTypes.object,
  discussion: React.PropTypes.object,
  opContent: React.PropTypes.string,
  userId: React.PropTypes.string,
  currentUserId: React.PropTypes.string,
  currentUserRole: React.PropTypes.string,
  deleteAction: React.PropTypes.func,
  deletingOpinion: React.PropTypes.any,
}

export default Opinion
