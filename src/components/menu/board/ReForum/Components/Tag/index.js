import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';

import Button from '../../Components/Button';

class Tag extends Component {
  render() {
    const {
      name,
      withRemove,
      removeAction,
    } = this.props;
//, withRemove && styles.tagWithRemove)}
    return (
      <div className='Tag_tag'>
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

Tag.propTypes = {
  name: React.PropTypes.string.isRequired,
  withRemove: React.PropTypes.bool,
  removeAction: React.PropTypes.func,
};

export default Tag;
