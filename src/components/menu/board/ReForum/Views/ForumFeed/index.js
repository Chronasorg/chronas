import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import classnames from 'classnames'
import FlatButton from 'material-ui/FlatButton'

import {
  getDiscussions,
  getPinnedDiscussions,
  updateSortingMethod,
} from './actions'

import Button from '../../Components/Button'
import FeedBox from '../../Components/FeedBox'
import SideBar from '../../Components/SideBar'

import appLayout from '../../SharedStyles/appLayout.css'
import styles from './styles.css'
import { getForums } from '../../App/actions'
import { themes } from '../../../../../../properties'

class ForumFeed extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortingMethod: 'date',
      discussions: [],
      pinnedDiscussions: [],
      fetchingDiscussions: true,
      fetchingPinnedDiscussions: true,
      discussionsCount: 0,
      offset: 0
    }
  }

  componentDidMount () {
    const {
      forums,
      currentForum,
      setForums,
      // getPinnedDiscussions,
    } = this.props

    const {
      sortingMethod,
      offset
    } = this.state

    const forumId = ((forums.filter(f => f.forum_slug === currentForum) || {})[0] || {})._id

    if (!forumId) {
      setForums()
    } else {
      getDiscussions(currentForum, sortingMethod, '', offset).then((data) => this.setState({ fetchingDiscussions: false, discussions: (data || {})[0], discussionsCount: (data || {})[1] || 0 }))
      getPinnedDiscussions(currentForum).then((data) => this.setState({ fetchingPinnedDiscussions: false, pinnedDiscussions: data }))
    }
  }

  componentWillReceiveProps (nextProps) {
    const {
      currentForum,
      forums,
      setForums,
      // getPinnedDiscussions,
    } = this.props

    const {
      sortingMethod,
      offset
    } = this.state

    // get the discussions again
    // if the forum didn't matched
    if (nextProps.currentForum !== currentForum || forums.length !== nextProps.forums.length) {
      this.setState({
        fetchingDiscussions: false,
        fetchingPinnedDiscussions: false,
      })
      getDiscussions(nextProps.currentForum, sortingMethod, '', offset).then((data) => this.setState({ fetchingDiscussions: false, discussions: (data || {})[0], discussionsCount: (data || {})[1] || 0 }))
      getPinnedDiscussions(nextProps.currentForum).then((data) => this.setState({ fetchingPinnedDiscussions: false, pinnedDiscussions: data }))
    }
  }

  _handleOffsetChange (newOffset) {
    const {
      currentForum,
    } = this.props

    const {
      sortingMethod,
      offset
    } = this.state

    if (offset !== newOffset) {
      // updateSortingMethod(newSortingMethod)
      this.setState({
        offset: newOffset,
      })

      getDiscussions(currentForum, sortingMethod, '', newOffset).then((data) => this.setState({ fetchingDiscussions: false, discussions: (data || {})[0], discussionsCount: (data || {})[1] || 0 }))
    }
  }

  handleSortingChange (newSortingMethod) {
    const {
      currentForum,
      forums,
    } = this.props

    const {
      sortingMethod,
      offset
    } = this.state

    if (sortingMethod !== newSortingMethod) {
      // updateSortingMethod(newSortingMethod)
      this.setState({
        fetchingDiscussions: false,
        sortingMethod: newSortingMethod
      })
      getDiscussions(currentForum, newSortingMethod, '', offset).then((data) => this.setState({ fetchingDiscussions: false, discussions: (data || {})[0], discussionsCount: (data || {})[1] || 0 }))
    }
  }

  renderNewDiscussionButtion () {
    const { currentForum, theme } = this.props

    return (
      <div className={classnames('ForumFeed_showOnMediumBP', 'ForumFeed_newDiscussionBtn')}>
        <Link to={`/community/${currentForum}/new_discussion`}>
          <Button type='outline' style={{ background: themes[theme].highlightColors[0] }} fullWidth noUppercase>
            New Discussion
          </Button>
        </Link>
      </div>
    )
  }

  render () {
    const {
      currentForum,
      error,
      theme
    } = this.props

    const {
      discussions,
      fetchingDiscussions,
      discussionsCount,
      offset,
      fetchingPinnedDiscussions,
      pinnedDiscussions,
      sortingMethod,
    } = this.state

    if (error) {
      return (
        <div className={classnames('ForumFeed_errorMsg')}>
          {error}
        </div>
      )
    }

    return (
      <div className={classnames('appLayout_constraintWidth', 'ForumFeed_contentArea')}>
        <div className={'appLayout_primaryContent'}>
          <FeedBox
            customTheme={themes[theme]}
            type='pinned'
            loading={fetchingPinnedDiscussions}
            discussions={pinnedDiscussions}
            currentForum={currentForum}
          />
          <div style={{ paddingBottom: 24 }}>
            <div style={{ float: 'left' }}>
              Showing <span style={{fontWeight: 'bolder'}}>{offset}</span> - <span style={{fontWeight: 'bolder'}}>{Math.min(offset + 5, discussionsCount)}</span> of <span style={{fontWeight: 'bolder'}}>{discussionsCount}</span>
            </div>

            <FlatButton style={{ float: 'right' }} label='Next' disabled={((offset + 5) >= discussionsCount)}
                        onClick={() => this._handleOffsetChange(offset + 5)} />
            <FlatButton style={{ float: 'right' }} label='Prev' disabled={(offset < 1)}
                        onClick={() => this._handleOffsetChange(Math.max(0, offset - 5))} />
          </div>
          <FeedBox
            customTheme={themes[theme]}
            type='general'
            loading={fetchingDiscussions}
            discussions={discussions}
            currentForum={currentForum}
            onChangeSortingMethod={this.handleSortingChange.bind(this)}
            activeSortingMethod={sortingMethod}
          />
        </div>

        <div className={'appLayout_secondaryContent'}>
          <SideBar theme={theme} currentForum={currentForum} />
        </div>
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
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
    }
  },
  (dispatch) => {
    return {
    // getPinnedDiscussions: (currentForumId, feedChanged) => { dispatch(getPinnedDiscussions(currentForumId, feedChanged)); },
    // updateSortingMethod: (method) => { dispatch(updateSortingMethod(method)); },
    }
  }
)(ForumFeed)
