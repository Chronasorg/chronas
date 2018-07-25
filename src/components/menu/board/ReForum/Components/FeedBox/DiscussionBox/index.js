import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import Moment from 'moment';
import styles from './styles.css';
import properties from '../../../../../../../properties'
import Tag from '../../../Components/Tag';

class DiscussionBox extends Component {
  render() {
    const {
      voteCount,
      userName,
      userGitHandler,
      discussionTitle,
      time,
      opinionCount,
      tags,
      link,
      userProfile,
    } = this.props;

    const postTime = Moment(time);
    const timeDisplay = postTime.from(Moment());

    const isQuestion = link.indexOf('/' + properties.QAID + '/') > -1

    return (
      <div className='DiscussionBox_container'>
        <div className={classnames('DiscussionBox_title', userProfile && 'DiscussionBox_titleBottomMargin')}><Link to={link}>{discussionTitle}</Link></div>

        { !userProfile && <div className='DiscussionBox_posterInfo'>
          <Link to={`/community/user/${userGitHandler}`} className='DiscussionBox_name'>{userName}</Link>
        </div> }

        <div className='DiscussionBox_boxFooter'>
          { !isQuestion && <div className='DiscussionBox_tagsArea'>
            { tags.map((tag) => <Tag key={tag} name={tag} />) }
          </div> }

          <div className='DiscussionBox_postInfo'>
            <span className='DiscussionBox_info'>{timeDisplay}</span>
            <span className='DiscussionBox_info'>{voteCount || '1'} {isQuestion ? 'points' : 'favorites'}</span>
            <span className='DiscussionBox_info'>{opinionCount} {isQuestion ? 'answers' : 'opinions'}</span>
          </div>
        </div>
      </div>
    );
  }
}

DiscussionBox.defaultProps = {
  discussionId: 1,
  voteCount: 20,
  userName: 'Hello World',
  userGitHandler: 'github',
  discussionTitle: 'This is a default post title',
  time: Moment(),
  opinionCount: 12,
  tags: ['react', 'redux', 'nodejs'],
  link: '',
  userProfile: false,
};

DiscussionBox.propTypes = {
  discussionId: React.PropTypes.number,
  voteCount: React.PropTypes.number,
  userName: React.PropTypes.string,
  userGitHandler: React.PropTypes.string,
  discussionTitle: React.PropTypes.string,
  time: React.PropTypes.any,
  opinionCount: React.PropTypes.number,
  tags: React.PropTypes.array,
  link: React.PropTypes.string,
  userProfile: React.PropTypes.bool,
};

export default DiscussionBox;
