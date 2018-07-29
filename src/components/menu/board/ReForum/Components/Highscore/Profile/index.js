import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';


class Profile extends Component {
  render() {
    const {
      name,
      gitHandler,
      location,
      avatarUrl,
    } = this.props;

    return (
      <div className='UserProfile_container'>
        <div className='UserProfile_avatarContainer'>
          <img className='UserProfile_avatar' src={avatarUrl} alt={`${name} avatar`} />
        </div>
        <div className='UserProfile_infoContainer'>
          <div className='UserProfile_name'>{ name }</div>
          <div className='UserProfile_gitHandler'><i className={classnames('fa fa-github-alt', 'UserProfile_gitIcon')}></i> { gitHandler }</div>
          <div className='UserProfile_location'>{ location }</div>
        </div>
      </div>
    );
  }
}

Profile.defaultProps = {
  name: 'Hello World',
  gitHandler: 'helloWorld',
  location: 'Somewhere in the world',
  avatarUrl: 'https://google.com',
};

export default Profile;
