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
      <div className='container'>
        <div className='avatarContainer'>
          <img className='avatar' src={avatarUrl} alt={`${name} avatar`} />
        </div>
        <div className='infoContainer'>
          <div className='name'>{ name }</div>
          <div className='gitHandler'><i className={classnames('fa fa-github-alt', styles.gitIcon)}></i> { gitHandler }</div>
          <div className='location'>{ location }</div>
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

Profile.propTypes = {
  name: React.PropTypes.string,
  gitHandler: React.PropTypes.string,
  location: React.PropTypes.string,
  avatarUrl: React.PropTypes.string,
};

export default Profile;
