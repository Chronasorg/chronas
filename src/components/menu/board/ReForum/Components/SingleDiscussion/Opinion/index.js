import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import moment from 'moment'
import classnames from 'classnames'
import styless from './styles.css'
import IconButton from 'material-ui/IconButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import PlaceholderImage from '../../../SharedStyles/placeholder.jpg'
import Button from '../../../Components/Button'
import RichEditor from '../../../Components/RichEditor'
import {themes} from "../../../../../../../properties";

const imgButton = { width: 20, height: 20}
const styles = {
  iconButton: {filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))'},
  upArrow: {...imgButton, padding: 0, right: 11, top: -4, position: 'absolute'},
  downArrow: {...imgButton, padding: 0, right: 11, top: 24, position: 'absolute'},
  editButton: {...imgButton, right: 60, top: 1, position: 'absolute'},
  sourceButton: {...imgButton, right: 110, top: 1, position: 'absolute', padding: 0},
  scoreLabel: {
    width: 38,
    height: 20,
    right: 0,
    top: 12,
    color: '#333',
    position: 'absolute',
    fontSize: 12,
    textAlign: 'center',
    filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))'
  },
  voteContainer: {
    position: 'absolute',
    left: '30px',
    top: '20px',
  },
  label: {width: '10em', display: 'inline-block'},
  button: {margin: '1em'}
}

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
      isQA,
      score,
      opContent,
      userId,
      currentUserId,
      currentUserRole,
      voteAction,
      deleteAction,
      theme,
      deletingOpinion,
      translate
    } = this.props

    const upvotedItems = (localStorage.getItem('chs_upvotedOpinions') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedOpinions') || '').split(',')
    const upvoteColor = (upvotedItems.indexOf(opinionId) === -1) ? '#333' : 'green'
    const downvoteColor = (downvotedItems.indexOf(opinionId) === -1) ? '#333' : 'red'

    let dateDisplay = moment(opDate)
    dateDisplay = dateDisplay.from(moment())

    const allowDelete = (userId === currentUserId) || (currentUserRole === 'admin')

    const finalAvatarUrl = userAvatar ? <img className='Opinion_avatar' src={userAvatar} alt={`${name} avatar`} /> : <AccountIcon className='Opinion_avatar' />

    return (
      <div className='Opinion_container'>
        <div className='Opinion_infoContainer'>
          <div style={ styles.voteContainer }>
            <IconButton
              onClick={() => voteAction(opinionId, true)}
              color='red'
              style={ styles.upArrow }
              tooltipPosition="center-left"
              tooltip={translate('pos.upvote')}
              iconStyle={ styles.iconButton }
            ><IconThumbUp color={upvoteColor} />
            </IconButton>
            <IconButton
              onClick={() => voteAction(opinionId, false)}
              style={ styles.downArrow }
              iconStyle={ styles.iconButton }
              tooltipPosition="center-left"
              tooltip={translate('pos.downvote')}
            ><IconThumbDown color={downvoteColor} /></IconButton>
            <div style={ styles.scoreLabel }>{score} </div>
          </div>

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
        </div>

        <div className='Opinion_opContent'>
          <RichEditor
            customTheme={themes[theme]}
            isQA={isQA}
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

export default Opinion
