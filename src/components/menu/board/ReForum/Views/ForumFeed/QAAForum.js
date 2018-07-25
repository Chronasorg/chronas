import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import classnames from 'classnames'

import {
  getDiscussions,
  updateSortingMethod,
} from './actions'

import Button from '../../Components/Button'
import FeedBox from '../../Components/FeedBox'

import appLayout from '../../SharedStyles/appLayout.css'
import styles from './styles.css'
import {getForums} from '../../App/actions'

import properties from '../../../../../../properties'

const inlineStyles = {
  addButton: {
    fontSize: 'inherit',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

class QAAForum extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortingMethod: 'date',
      discussions: [],
      fetchingDiscussions: true,
    }
  }

  componentDidMount() {
    const {
      // getDiscussions,
      forums,
      qaaEntity,
      setForums,
    } = this.props;

    const {
      sortingMethod
    } = this.state

    // if (!forumId) {
    //   // setForums()
    // } else {
      getDiscussions(properties.QAID, sortingMethod, qaaEntity).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
    // }
  }

  componentWillReceiveProps(nextProps) {
    const {
      setForums,
      qaaEntity,
      // getDiscussions,
    } = this.props;

    const {
      sortingMethod
    } = this.state

    // if the forum didn't matched
    if (qaaEntity !== nextProps.qaaEntity) {
      // const feedChanged = true;
      this.setState({
        fetchingDiscussions: false,
      })
      getDiscussions(properties.QAID, sortingMethod, nextProps.qaaEntity).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
    }
  }

  handleSortingChange(newSortingMethod) {
    const {
      forums,
      // getDiscussions,
      qaaEntity
    } = this.props;

    const {
      sortingMethod
    } = this.state

    if (sortingMethod !== newSortingMethod) {
      // updateSortingMethod(newSortingMethod)
      this.setState({
        fetchingDiscussions: false,
        sortingMethod: newSortingMethod
      })
      getDiscussions(properties.QAID, newSortingMethod, qaaEntity).then( (data) => this.setState({ fetchingDiscussions: false, discussions: data }) )
    }
  }

  render () {
    const {
      error,
      qaaEntity
    } = this.props;


    const {
      discussions,
      fetchingDiscussions,
      sortingMethod,
    } = this.state;

    // const { discussions } = this.props
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
          <div className='addContainer'>
            <Link to={`/community/${properties.QAID}/new_discussion/${qaaEntity}`}>
              <Button style={inlineStyles.addButton} type='outline' fullWidth noUppercase>
                <b>Ask question</b>
              </Button>
            </Link>
          </div>
          <FeedBox
            type='general'
            loading={fetchingDiscussions}
            discussions={discussions}
            currentForum={properties.QAID}
            onChangeSortingMethod={this.handleSortingChange.bind(this)}
            activeSortingMethod={sortingMethod}
          />
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
    // sortingMethod: state.feed.sortingMethod,
    // error: state.feed.error,
  }; },
  (dispatch) => { return {
    // getDiscussions: (currentForumId, feedChanged, sortingMethod, sortingChanged) => { dispatch(getDiscussions(currentForumId, feedChanged, sortingMethod, sortingChanged)); },
    // updateSortingMethod: (method) => { dispatch(updateSortingMethod(method)); },
  }; }
)(QAAForum);
