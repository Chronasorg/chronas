import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import styles from './styles.css';
import properties from "../../../../../../../properties";

import Button from '../../../Components/Button';

class UserMenu extends Component {
  constructor(props) {
    super(props);
    this.state = { activeSubMenu: false };
    this.toggleSubMenu = this.toggleSubMenu.bind(this);
  }

  handleClickOutside() {
    this.setState({ activeSubMenu: false });
  }

  toggleSubMenu() {
    this.setState((prevState) => {
      return { activeSubMenu: !prevState.activeSubMenu };
    });
  }

  renderSubMenu() {
    const { activeSubMenu } = this.state;
    const {
      signedIn,
      gitHandler,
    } = this.props;

    if (activeSubMenu) {
      return (
        <div className='subMenu'>
          <Button className='subMenuClose' onClick={this.toggleSubMenu} alwaysActive>
            <i className={classnames('fa fa-close')}></i>
          </Button>

          { !signedIn && <a className='signInLink' href={properties.chronasApiHost + '/board/user/authViaGitHub'}>
            <Button className='gitLoginBtn' alwaysActive>
              <i className={classnames('fa fa-github-alt', styles.subMenuOcto)}></i>
              <span className='btnLabel'>With GitHub</span>
            </Button>
          </a> }

          { signedIn && <span onClick={this.toggleSubMenu}><Link className='subMenuItem' to={`/user/${gitHandler}`}>My Profile</Link></span> }
          {/* { signedIn && <a className='subMenuItem' href={'#'}>Settings</a> } */}
          { signedIn && <a className='subMenuItem' href={properties.chronasApiHost + '/board/user/signout'}>Sign Out</a> }
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      signedIn,
      userName,
      avatar,
      signOutAction,
    } = this.props;

    if (signedIn) {
      return (
        <div style={{ position: 'relative' }}>
          <div className='container' onClick={this.toggleSubMenu}>
            <img className='userAvatar' src={avatar} alt={`${userName} Avatar`} />
            <span className='title'>{userName}</span>
          </div>
          {this.renderSubMenu()}
        </div>
      );
    }

    return (
      <div className='container'>
        <Button
          alwaysActive
          className={classnames(styles.signInBtn, styles.title)}
          onClick={this.toggleSubMenu}
        >
          Sign Up / Sign In
        </Button>

        {this.renderSubMenu()}
      </div>
    );
  }
}

UserMenu.defaultProps = {
  signedIn: false,
  userName: '',
  gitHandler: '',
  avatar: '',
};

UserMenu.propTypes = {
  signedIn: React.PropTypes.bool.isRequired,
  userName: React.PropTypes.string,
  gitHandler: React.PropTypes.string,
  avatar: React.PropTypes.string,
};

export default UserMenu;
