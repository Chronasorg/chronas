import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';

class Counts extends Component {
  render() {
    const {
      count,
      label,
    } = this.props;

    return (
      <div className='container'>
        <div className='count'>{count}</div>
        <div className='label'>{label}</div>
      </div>
    );
  }
}

Counts.defaultProps = {
  count: 0,
  label: 'default',
};

Counts.propTypes = {
  count: React.PropTypes.number,
  label: React.PropTypes.string,
};

export default Counts;
