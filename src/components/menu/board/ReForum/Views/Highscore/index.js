import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'moment';
import classnames from 'classnames';
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';
// actions
import {
  fetchHighscore,
} from './actions';
import {themes} from "../../../../../../properties";

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
      theme
    } = this.props;
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
            <div className='FeedBox_header' style={{ background: themes[theme].highlightColors[0]}}>
              <span className='FeedBox_title'>{opinionBoxTitle}</span>
            </div>
            <div className='FeedBox_discussions'>
              <div className='Opinion_container'>
                <div className='Opinion_infoContainer'>
                  <div className='Opinion_avatar' style={{
                    textAlign: 'center',
                    width: 20,
                    height: 'inherit',
                    display: '-ms-flexbox',
                    marginLeft: -22,
                    flex: 1,
                    display: 'block', }} >Rank</div>
                  <div className='Opinion_userInfo'>
                    { 'User' }
                  </div>
                  <div className='Opinion_userInfo'>joined</div>
                  <div className='Opinion_userInfo'>
                    { `Logins` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Additions` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Edits` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Deletions` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Mistakes` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Linked` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Votes` }
                  </div>
                  <div className='Opinion_userInfo'>
                    { `Karma` }
                  </div>
                </div>
              </div>

              { highscoreData && highscoreData.map((user, index) => {
                const finalAvatarUrl = user.avatar ? <img className='Opinion_avatar' src={user.avatar} alt={`${name} avatar`} /> : <AccountIcon className='Opinion_avatar' />

                return (
                  <div className='Opinion_container'>
                    <div className='Opinion_infoContainer'>
                      <div className='Opinion_avatar'><h3>{ index + 1 }</h3></div>
                      { finalAvatarUrl }
                      <div className='Opinion_userInfo'>
                        { <Link to={`/community/user/${user.username || user.name}`} className='Opinion_name'>{user.username || user.name}</Link> }
                      </div>
                      <div className='Opinion_userInfo'>{ Moment(user.createdAt).from(Moment()) }</div>
                      <div className='Opinion_userInfo'>
                        { `${user.loginCount}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_created}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_updated}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_deleted}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_mistakes}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_linked}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.count_voted}` }
                      </div>
                      <div className='Opinion_userInfo'>
                        { `${user.karma}` }
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
