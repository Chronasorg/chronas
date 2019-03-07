import React, { Component } from 'react';
import styles from './styles.css';

import RichEditor from '../../../Components/RichEditor';
import {themes} from "../../../../../../../properties";


class ReplyBox extends Component {
  render() {
    const {
      posting,
      onSubmit,
      theme,
      opinionContent,
      onChange,
      isQA
    } = this.props;

    if (posting) return <div className='ReplyBox_loadingWrapper'>Posting your opinion...</div>;

    return (
      <RichEditor
        customTheme={themes[theme]}
        isQA={isQA}
        type="newOpinion"
        onSave={onSubmit}
        onChange={onChange}
        value={''}
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
