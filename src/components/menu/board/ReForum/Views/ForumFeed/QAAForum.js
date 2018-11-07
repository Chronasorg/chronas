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

import {didYouKnows, properties, themes} from '../../../../../../properties'

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
    localStorage.setItem('chs_dyk_question', true)

      getDiscussions(properties.QAID, sortingMethod, qaaEntity).then( (data) => {
        this.setState({ fetchingDiscussions: false, discussions: (data || {})[0] })
        this.props.setHasQuestions(((data || {})[0] || []).length)
      })
    // }
  }

  componentWillReceiveProps(nextProps) {
    const {
      setForums,
      qaaEntity,
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
      getDiscussions(properties.QAID, sortingMethod, nextProps.qaaEntity).then((data) => {
        this.setState({ fetchingDiscussions: false, discussions: (data || {})[0] })
        this.props.setHasQuestions(((data || {})[0] || []).length)
      })
    }
  }

  handleSortingChange(newSortingMethod) {
    const {
      forums,
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
      getDiscussions(properties.QAID, newSortingMethod, qaaEntity).then( (data) => this.setState({ fetchingDiscussions: false, discussions: (data || {})[0] }) )
    }
  }

  render () {
    const {
      error,
      qaaEntity,
      theme
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
              <Button style={{ ...inlineStyles.addButton, background: themes[theme].highlightColors[0], borderColor: themes[theme].highlightColors[0], color: themes[theme].backColors[0], boxShadow: '0 2px 2px 0 rgb(114, 114, 114), 0 3px 1px -2px rgba(171, 171, 171, 0.7), 0 1px 5px 0 rgba(128, 128, 128, 0.69)' }} type='outline' fullWidth noUppercase>
                <b>Ask question</b>
              </Button>
            </Link>
          </div>
          <FeedBox
            type='general'
            customTheme={themes[theme]}
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

export default connect(state => ({
    theme: state.theme,
  }),
  (dispatch) => { return {
    // updateSortingMethod: (method) => { dispatch(updateSortingMethod(method)); },
  }; }
)(QAAForum);
