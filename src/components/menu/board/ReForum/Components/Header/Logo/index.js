import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './styles.css';

const Logo = () => {
  const username = localStorage.getItem('username')
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
      </div>
    </div>
  );
};

export default Logo;
