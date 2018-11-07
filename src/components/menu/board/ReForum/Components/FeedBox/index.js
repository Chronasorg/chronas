import React, { Component } from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import styles from './styles.css';
import { properties } from '../../../../../../properties'

import DiscussionBox from './DiscussionBox';


class FeedBox extends Component {
  renderSort() {
    const {
      activeSortingMethod,
      onChangeSortingMethod,
    } = this.props;

    if (this.props.type === 'general') {
      return (
        <div className='FeedBox_sortList'>
          <span
            className={classnames('FeedBox_sort', (activeSortingMethod === 'date') && 'FeedBox_sortActive')}
            onClick={() => onChangeSortingMethod('date')}
          >
            Latest
          </span>
          <span
            className={classnames('FeedBox_sort', (activeSortingMethod === 'popularity') && 'FeedBox_sortActive')}
            onClick={() => onChangeSortingMethod('popularity')}
          >
            Popular
          </span>
        </div>
      );
    }
    return null;
  }

  renderEmptyDiscussionLine(loading, discussions) {
    if (!loading) {
      if (!discussions || discussions.length === 0) {
        return (this.props.currentForum === properties.QAID) ? <div className='FeedBox_loading'>No questions yet...</div> : <div className='FeedBox_loading'>No threads yet...</div>
      }
    }
  }

  render() {
    const {
      type,
      loading,
      discussions,
      currentForum,
      userProfile,
      customTheme
    } = this.props;

    const discussionBoxTitle = (currentForum === properties.QAID) ? 'Questions' : (type === 'pinned') ? 'Pinned' : 'Threads'

    return (
      <div className='FeedBox_container'>
        <div className='FeedBox_header' style={customTheme ? { background: customTheme.foreColors[0] } : {}}>
          <span className='FeedBox_title'>{discussionBoxTitle}</span>
          { !userProfile && this.renderSort() }
        </div>
        { loading && <div className='FeedBox_loading'>Loading...</div> }
        { this.renderEmptyDiscussionLine(loading, discussions) }
        { !loading &&
          <div className='FeedBox_discussions'>
            { discussions && discussions.map((discussion) =>
              <DiscussionBox
                userProfile={userProfile}
                key={discussion._id}
                userName={(discussion.user || {}).name || (discussion.user || {}).username || "n/a username"}
                userGitHandler={(discussion.user || {}).username}
                discussionTitle={discussion.title}
                time={discussion.date}
                customTheme={customTheme}
                tags={discussion.tags}
                opinionCount={discussion.opinion_count}
                voteCount={discussion.favorites}
                link={`/community/${userProfile ? (discussion.forum || {}).forum_slug : currentForum}/discussion/${discussion.discussion_slug}`}
              />
            ) }
          </div>
        }
      </div>
    );
  }
}

FeedBox.defaultProps = {
  type: 'general',
  loading: false,
  discussions: [],
  currentForum: 'general',
  activeSortingMethod: 'date',
  onChangeSortingMethod: (val) => { },
  userProfile: false,
};

export default FeedBox;
