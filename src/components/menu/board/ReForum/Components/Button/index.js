import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';


class Button extends Component {
  render() {
    const {
      type,
      fullWidth,
      noUppercase,
      className,
      style,
      onClick,
      alwaysActive,
    } = this.props;

    return (
      <button
        onClick={onClick}
        className={classnames(
         'BoardButton_button',
          'BoardButton_buttonDefaults',
          'BoardButton_type',
          fullWidth && 'BoardButton_fullWidth',
          noUppercase && 'BoardButton_noUppercase',
          alwaysActive && 'BoardButton_alwaysActive',
          className
        )}
        style={{...style, fontFamily: 'inherit', fontWeight: 'bold'}}
      >
        {this.props.children}
      </button>
    );
  }
}

Button.defaultProps = {
  type: 'default',
  fullWidth: false,
  noUppercase: false,
  alwaysActive: false,
  className: '',
  style: {},
  onClick: () => { },
};

export default Button;
