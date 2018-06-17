import React, { Component } from 'react';
import classnames from 'classnames';

import styles from './styles.css';
import appLayout from '../../SharedStyles/appLayout.css';

class Footer extends Component {
  render() {
    return (
      <div className={classnames('appLayout_constraintWidth', 'Footer_contentArea')}>
        {/* Copyright? Who cares? :-) */}
      </div>
    );
  }
}


Footer.defaultProps = {
};

Footer.propTypes = {
};

export default Footer;
