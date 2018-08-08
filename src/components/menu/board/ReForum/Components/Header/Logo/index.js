import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RaisedButton from 'material-ui/RaisedButton'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import { translate, defaultTheme } from 'admin-on-rest'
import styles from './styles.css';

const Logo = (props) => {
  const username = localStorage.getItem('chs_username')
  console.debug("Logo", props)
  return (
    <div className='BoardLogo_logoContainer'>
      <div className='BoardLogo_logoTitle'>Chronas Community</div>
      <div className='rightMenu'>
        <div className='BoardLogo_logoTitle'>
          <Link
            className='NB_links'
            to={'/community/highscore'}
          >
            Member Highscore
          </Link>
        </div>
        <div className='BoardLogo_logoTitle'>
          <Link
            className='NB_links'
            to={'/community/user/' + username}
          >
            My Profile
          </Link>
        </div>
        <div className='BoardLogo_logoTitle_back'>
          <RaisedButton
            icon={<IconBack />}
            primary={true}
            label={'Back'}
            onClick={() => { props.history.goBack() } }
          />
        </div>
      </div>
    </div>
  );
};

export default Logo;
