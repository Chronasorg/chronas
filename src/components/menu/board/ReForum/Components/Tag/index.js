import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';

import Button from '../../Components/Button';
import {themes} from "../../../../../../properties";


class Tag extends Component {
  render() {
    const {
      name,
      customTheme,
      withRemove,
      removeAction,
    } = this.props;
//, withRemove && styles.tagWithRemove)}
    return (
      <div className='Tag_tag' style={{ background: customTheme.highlightColors[0] }} >
        {name}
        { withRemove &&
          <Button
            onClick={removeAction}
            className='Tag_removeButton'
          >
            <i className={'fa fa-close'}></i>
          </Button>
        }
      </div>
    );
  }
}

Tag.defaultProps = {
  name: '',
  withRemove: false,
  removeAction: () => {},
};

export default Tag;
