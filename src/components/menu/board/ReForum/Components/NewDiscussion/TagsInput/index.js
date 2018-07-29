import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import classnames from 'classnames';
import _ from 'lodash';
import styles from './styles.css';

import Button from '../../../Components/Button';
import Tag from '../../../Components/Tag';


class TagsInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: null,
      tags: [],
      tagName: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    this.setState({ tags: value, errorMsg: null });
  }

  sameTag(tagName) {
    const { tags } = this.state;
    let matched = false;
    tags.map((tag) => {
      if (tag === tagName) matched = true;
    });
    return matched;
  }

  addTag() {
    const {
      tagName,
      tags,
      errorMsg,
    } = this.state;

    if (!this.sameTag(tagName)) {
      const newTags = tags.concat(tagName);
      this.setState({
        tags: newTags,
        errorMsg: null,
        tagName: '',
      });
      this.props.onChange(newTags);
    } else {
      this.setState({ errorMsg: 'Same tag!' });
    }
  }

  removeTag(position) {
    const { tags } = this.state;
    const newTags = [...tags.slice(0, position), ...tags.slice(position + 1, tags.length)];
    this.setState({ tags: newTags });
    this.props.onChange(newTags);
  }

  renderTags() {
    const { tags } = this.state;

    return tags.map((tag, i) => {
      return (
        <Tag
          name={tag}
          key={tag}
          withRemove
          removeAction={() => { this.removeTag(i); }}
        />
      );
    });
  }

  renderInput() {
    const {
      tagName,
      tags,
    } = this.state;
    const { maxTagCount } = this.props;

    if ( tags.length < maxTagCount ) {
      return (
        <div className='TagsInput_inputContainer'>
          <input
            className='TagsInput_tagInput'
            placeholder={'tag name...'}
            value={tagName}
            onChange={(e) => { this.setState({ tagName: e.target.value }); }}
          />
          <Button
            className='TagsInput_addButton'
            onClick={() => { this.addTag(); }}
          >
            <i className={classnames('fa fa-plus-circle')}></i>
          </Button>
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      errorMsg,
      tagName,
      tags,
    } = this.state;

    const { maxTagCount, isQA } = this.props;

    if (isQA) return <div className='TagsInput_container'>
      <div className=''>
        <br />
        <b><Link to="/info" onClick={localStorage.setItem("info_section", "rules")}>Please read the rules before posting</Link></b>
      </div>
      { errorMsg && <div className='TagsInput_errorMsg'>{errorMsg}</div> }
    </div>

    return (
      <div className='TagsInput_container'>
        <div className='TagsInput_tagContainer'>
          <div className='TagsInput_label'>Tags :</div>
          { this.renderTags() }
          { this.renderInput() }
        </div>
        { errorMsg && <div className='TagsInput_errorMsg'>{errorMsg}</div> }
      </div>
    );
  }
}

TagsInput.defaultProps = {
  value: [],
  maxTagCount: 3,
  onChange: (tags) => {},
};

export default TagsInput;
