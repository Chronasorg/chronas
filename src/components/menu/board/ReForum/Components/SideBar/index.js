import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.css';

import Button from '../../Components/Button';
import {themes} from "../../../../../../properties";


class SideBar extends Component {
  render() {
    const {
      theme,
      currentForum,
    } = this.props;

    return (
      <div className='sidebarContainer'>
        <Link to={`/community/${currentForum}/new_discussion`}>
          <Button type='outline' style={{ background: themes[theme].highlightColors[0]}} fullWidth noUppercase>
            New Discussion
          </Button>
        </Link>
      </div>
    );
  }
}


SideBar.defaultProps = {
  currentForum: 'general',
};

export default SideBar;
