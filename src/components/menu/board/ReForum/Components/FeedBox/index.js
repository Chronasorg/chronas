import React, { Component } from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import styles from './styles.css';

import DiscussionBox from './DiscussionBox';

class FeedBox extends Component {
  renderSort() {
    const {
      activeSortingMethod,
      onChangeSortingMethod,
    } = this.props;

    if (this.props.type === 'general') {
      return (
        <div className='sortList'>
          <span
            className={classnames(styles.sort, (activeSortingMethod === 'date') && styles.sortActive)}
            onClick={() => onChangeSortingMethod('date')}
          >
            Latest
          </span>
          <span
            className={classnames(styles.sort, (activeSortingMethod === 'popularity') && styles.sortActive)}
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
        return <div className='loading'>No discussions...</div>;
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
    } = this.props;

    let discussionBoxTitle = '';
    if (type === 'general') discussionBoxTitle = 'Discussions';
    if (type === 'pinned') discussionBoxTitle = 'Pinned';

    return (
      <div className='container'>
        <div className='header'>
          <span className='title'>{discussionBoxTitle}</span>
          { !userProfile && this.renderSort() }
        </div>
        { loading && <div className='loading'>Loading...</div> }
        { this.renderEmptyDiscussionLine(loading, discussions) }
        { !loading &&
          <div className='discussions'>
            { discussions && discussions.map((discussion) =>
              <DiscussionBox
                userProfile={userProfile}
                key={discussion._id}
                userName={(discussion.user || {}).name || (discussion.user || {}).username || "n/a username"}
                userGitHandler={(discussion.user || {}).username}
                discussionTitle={discussion.title}
                time={discussion.date}
                tags={discussion.tags}
                opinionCount={discussion.opinion_count}
                voteCount={(discussion.favorites || {}).length || discussion.favorites}
                link={`/${userProfile ? (discussion.forum || {}).forum_slug : currentForum}/discussion/${discussion.discussion_slug}`}
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

FeedBox.propTypes = {
  type: React.PropTypes.oneOf(['general', 'pinned']),
  loading: React.PropTypes.bool,
  discussions: React.PropTypes.array,
  currentForum: React.PropTypes.string,
  activeSortingMethod: React.PropTypes.string,
  onChangeSortingMethod: React.PropTypes.func,
  userProfile: React.PropTypes.bool,
};

export default FeedBox;
