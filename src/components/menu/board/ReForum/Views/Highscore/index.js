import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';

// actions
import {
  fetchHighscore,
} from './actions';

const opinionBoxTitle = 'Highscore'

class Highscore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingHighscore: true,
      highscoreData: [],
      error: ''
    }

    fetchHighscore().then( (data) => this.setState({ highscoreData: data, fetchingHighscore: false }) )
  }

  render () {
    const {
      fetchingHighscore,
      highscoreData,
    } = this.state;

    if (fetchingHighscore) {
      return (
        <div className={classnames('appLayout_constraintWidth', 'UP_loadingMsg')}>
          Loading highest ranked members ...
        </div>
      );
    }

    return (
      <div className={classnames('appLayout_constraintWidth', 'UP_container')}>
        <div className={'appLayout_primaryContent'}>
          <div className='FeedBox_container'>
            <div className='FeedBox_header'>
              <span className='FeedBox_title'>{opinionBoxTitle}</span>
            </div>
            <div className='FeedBox_discussions'>
              { highscoreData && highscoreData.map((user, index) => {
                return (
                  <div className='Opinion_container'>
                    <div className='Opinion_infoContainer'>
                      { index + 1 }
                      <img className='Opinion_avatar' src={user.avatar} />
                      <div className='Opinion_userInfo'>
                        { <Link to={`/board/user/${user.username || user.name}`} className='Opinion_name'>{user.username || user.name}</Link> }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `Karma Total: ${user.karma}` }
                      </div>
                    </div>
                  </div>
                )
              }) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => { return {
  }; },
  (dispatch) => { return {
  }; }
)(Highscore);
