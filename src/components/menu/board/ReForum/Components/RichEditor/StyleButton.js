import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor_controlButton'
    if (this.props.active) {
      className += ' RichEditor_controlButtonActive'
    }

    return (
      <div className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </div>
    );
  }
}

export default StyleButton;
