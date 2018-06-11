import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  getDiscussions,
  getPinnedDiscussions,
  updateSortingMethod,
} from './actions';

import Button from '../../Components/Button';
import FeedBox from '../../Components/FeedBox';
import SideBar from '../../Components/SideBar';

import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';

class ForumFeed extends Component {
  constructor (props) {
    super(props)
    this.state = {
      discussions: [],
      pinnedDiscussions: [],
    }
  }

  componentDidMount() {
    const {
      currentForumId,
      // getDiscussions,
      forums,
      currentForum,
      // getPinnedDiscussions,
    } = this.props;

    // get the discussions and pinned discussions
    console.debug("componentDidMount", this.props)
    const forumId = ((forums.filter(f => f.forum_slug === currentForum) || {})[0] || {}).forum_id
    this.setState({ discussions: getDiscussions(forumId) })
    this.setState({ discussions: getPinnedDiscussions(forumId) })
  }

  componentDidUpdate(prevProps) {
    console.debug("tataaa")
    const {
      currentForum,
      currentForumId,
      forums,
      // getDiscussions,
      // getPinnedDiscussions,
    } = this.props;

    // get the discussions again
    // if the forum didn't matched
    if (prevProps.currentForum !== currentForum) {
      // const feedChanged = true;
      // getDiscussions(currentForumId(), feedChanged);
      // getPinnedDiscussions(currentForumId(), feedChanged);
      const forumId = ((forums.filter(f => f.forum_slug === currentForum) || {})[0] || {}).forum_id
      this.setState({ discussions: getDiscussions(forumId) })
      this.setState({ discussions: getPinnedDiscussions(forumId) })
    }
  }

  handleSortingChange(newSortingMethod) {
    console.debug("tsata")
    const {
      currentForum,
      getDiscussions,
      updateSortingMethod,
      sortingMethod,
    } = this.props;

    if (sortingMethod !== newSortingMethod) {
      updateSortingMethod(newSortingMethod);
      getDiscussions(currentForum, false, true);
    }
  }

  renderNewDiscussionButtion() {
    console.debug("tata")
    const { currentForum } = this.props;

    return (
      <div className={classnames(appLayout.showOnMediumBP, styles.newDiscussionBtn)}>
        <Link to={`/board${currentForum}/new_discussion`}>
          <Button type='outline' fullWidth noUppercase>
            New Discussion
          </Button>
        </Link>
      </div>
    );
  }

  render() {
    const {
      currentForum,
      fetchingDiscussions,
      fetchingPinnedDiscussions,
      sortingMethod,
      error,
    } = this.props;


    const {
      discussions,
      pinnedDiscussions,
    } = this.state;

    if (error) {
      return (
        <div className={classnames(styles.errorMsg)}>
          {error}
        </div>
      );
    }

    return (
      <div className={classnames(appLayout.constraintWidth, styles.contentArea)}>
        <div className={appLayout.primaryContent}>
          <FeedBox
            type='pinned'
            loading={fetchingPinnedDiscussions}
            discussions={pinnedDiscussions}
            currentForum={currentForum}
          />

          <FeedBox
            type='general'
            loading={fetchingDiscussions}
            discussions={discussions}
            currentForum={currentForum}
            onChangeSortingMethod={this.handleSortingChange.bind(this)}
            activeSortingMethod={sortingMethod}
          />

          { this.renderNewDiscussionButtion() }
        </div>

        <div className={appLayout.secondaryContent}>
          <SideBar currentForum={currentForum} />
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => { return {
    // currentForumId: () => {
    //   const currentForumObj = _.find(state.app.forums, { forum_slug: state.app.currentForum });
    //   if (currentForumObj) return currentForumObj._id;
    //   else return null;
    // },
    // fetchingDiscussions: state.feed.fetchingDiscussions,
    // fetchingPinnedDiscussions: state.feed.fetchingPinnedDiscussions,
    // sortingMethod: state.feed.sortingMethod,
    // pinnedDiscussions: state.feed.pinnedDiscussions,
    // error: state.feed.error,
  }; },
  (dispatch) => { return {
    // getDiscussions: (currentForumId, feedChanged, sortingMethod, sortingChanged) => { dispatch(getDiscussions(currentForumId, feedChanged, sortingMethod, sortingChanged)); },
    // getPinnedDiscussions: (currentForumId, feedChanged) => { dispatch(getPinnedDiscussions(currentForumId, feedChanged)); },
    // updateSortingMethod: (method) => { dispatch(updateSortingMethod(method)); },
  }; }
)(ForumFeed);
