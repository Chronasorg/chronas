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
import {getForums} from "../../App/actions";

class ForumFeed extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortingMethod: 'date',
      discussions: [],
      pinnedDiscussions: [],
      fetchingDiscussions: true,
      fetchingPinnedDiscussions: true,
    }
  }

  componentDidMount() {
    const {
      currentForumId,
      // getDiscussions,
      forums,
      currentForum,
      setForums,
      // getPinnedDiscussions,
    } = this.props;

    const {
      sortingMethod
    } = this.state

    const forumId = ((forums.filter(f => f.forum_slug === currentForum) || {})[0] || {})._id

    if (!forumId) {
      setForums()
    } else {
      getDiscussions(forumId, sortingMethod).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
      getPinnedDiscussions(forumId).then( (data) => this.setState({ fetchingPinnedDiscussions: false, pinnedDiscussions: data }) )
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      currentForum,
      currentForumId,
      forums,
      setForums,
      // getDiscussions,
      // getPinnedDiscussions,
    } = this.props;

    const {
      sortingMethod
    } = this.state

    // get the discussions again
    // if the forum didn't matched
    if (nextProps.currentForum !== currentForum || forums.length !== nextProps.forums.length) {
      // const feedChanged = true;
      // getDiscussions(currentForumId(), feedChanged);
      // getPinnedDiscussions(currentForumId(), feedChanged);
      const forumId = ((nextProps.forums.filter(f => f.forum_slug === nextProps.currentForum) || {})[0] || {})._id
      this.setState({
        fetchingDiscussions: false,
        fetchingPinnedDiscussions: false,
      })
      getDiscussions(forumId, sortingMethod).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
      getPinnedDiscussions(forumId).then( (data) => this.setState({ fetchingPinnedDiscussions: false, pinnedDiscussions: data }) )
    }
  }

  handleSortingChange(newSortingMethod) {
    console.debug("tsata")
    const {
      currentForum,
      forums,
      // getDiscussions,
    } = this.props;

    const {
      sortingMethod
    } = this.state

    const forumId = ((forums.filter(f => f.forum_slug === currentForum) || {})[0] || {})._id

    if (sortingMethod !== newSortingMethod) {
      // updateSortingMethod(newSortingMethod)
      this.setState({
        fetchingDiscussions: false,
        sortingMethod: newSortingMethod
      })
      getDiscussions(forumId, newSortingMethod).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
    }
  }

  renderNewDiscussionButtion() {
    console.debug("tata")
    const { currentForum } = this.props;

    return (
      <div className={classnames('ForumFeed_showOnMediumBP', 'ForumFeed_newDiscussionBtn')}>
        <Link to={`/board/${currentForum}/new_discussion`}>
          <Button type='outline' fullWidth noUppercase>
            New Discussion
          </Button>
        </Link>
      </div>
    );
  }

  render () {
    const {
      currentForum,
      error,
    } = this.props;


    const {
      discussions,
      fetchingDiscussions,
      fetchingPinnedDiscussions,
      pinnedDiscussions,
      sortingMethod,
    } = this.state;

    if (error) {
      return (
        <div className={classnames('ForumFeed_errorMsg')}>
          {error}
        </div>
      );
    }

    return (
      <div className={classnames('appLayout_constraintWidth', 'ForumFeed_contentArea')}>
        <div className={'appLayout_primaryContent'}>
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

          {/*{ this.renderNewDiscussionButtion() }*/}
        </div>

        <div className={'appLayout_secondaryContent'}>
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
