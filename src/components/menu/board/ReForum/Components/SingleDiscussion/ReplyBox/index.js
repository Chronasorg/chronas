import React, { Component } from 'react';
import styles from './styles.css';

import RichEditor from '../../../Components/RichEditor';


class ReplyBox extends Component {
  render() {
    const {
      posting,
      onSubmit,
      opinionContent,
      onChange,
      isQA
    } = this.props;

    if (posting) return <div className='ReplyBox_loadingWrapper'>Posting your opinion...</div>;

    return (
      <RichEditor
        isQA={isQA}
        type="newOpinion"
        onSave={onSubmit}
        onChange={onChange}
        value={opinionContent}
      />
    );
  }
}

ReplyBox.defaultProps = {
  posting: false,
  onSubmit: () => { },
  onChange: (value) => { },
};

export default ReplyBox;
