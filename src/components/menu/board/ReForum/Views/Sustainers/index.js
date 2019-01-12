import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from 'material-ui/Avatar'
import Moment from 'moment';
import classnames from 'classnames';
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';
// actions
import {
  fetchSustainers,
} from './actions';
import {themes} from "../../../../../../properties";

const opinionBoxTitle = 'Sustainers'

class Sustainers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingSustainers: true,
      sustainersData: [],
      error: ''
    }

    fetchSustainers().then( (data) => this.setState({ sustainersData: data, fetchingSustainers: false }) )
  }

  render () {
    const {
      theme
    } = this.props;
    const {
      fetchingSustainers,
      sustainersData,
    } = this.state;

    if (fetchingSustainers) {
      return (
        <div className={classnames('appLayout_constraintWidth', 'UP_loadingMsg')}>
          Loading sustaining members ...
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
                <br />
              <p>
                Chronas depends on user support to survive and grow.
                <br />
                If you like this project to succeed, head over to <a className='customLink'  target='_blank' href='https://www.patreon.com/chronas'><Avatar style={{ marginRight: 6, marginLeft: 6 }} src="/images/240px-Patreon_logo.svg.png" />
                Patreon</a> and consider pledging an amount of your choice. <b>Thank You!</b>
                <br />
                Patreons will be able to steer the project by voting on feature priorities and design decisions.
              </p>
              { sustainersData && sustainersData.length > 0 && <div className='Opinion_container'>
                <div className='Opinion_infoContainer'>
                  <div className='Opinion_avatar' style={{
                    textAlign: 'center',
                    width: 20,
                    height: 'inherit',
                    marginLeft: -62,
                    flex: 1,
                    display: 'block', }} ></div>
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
              </div> }
              { sustainersData && sustainersData.length === 0 && <div className='Opinion_container'>
                <div className='Opinion_infoContainer'>
                  <span>Supporting members will be listed here</span>
                </div>
              </div> }

              { sustainersData && sustainersData.map((user, index) => {
                const finalAvatarUrl = user.avatar ? <img className='Opinion_avatar' src={user.avatar} alt={`${name} avatar`} /> : <AccountIcon className='Opinion_avatar' />

                return (
                  <div className='Opinion_container'>
                    <div className='Opinion_infoContainer'>
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
)(Sustainers);
