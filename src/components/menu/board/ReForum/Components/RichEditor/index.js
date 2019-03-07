import React, { Component } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import classnames from 'classnames';
import styles from './styles.css';

import Button from '../../Components/Button';
import BlockStyleControls from './BlockStyleControls';
import InlineStyleControls from './InlineStyleControls';
import {themes} from "../../../../../../properties";

function safelyParseJSON (json) {
  let parsed = false

  try {
    parsed = JSON.parse(json)
    parsed = true
  } catch (e) {
    // Oh well, but whatever...
  }

  return parsed // Could be undefined!
}

class RichEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.focus = () => this.refs.editor.focus();
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onTab = this.onTab.bind(this);
    this.toggleBlockType = this.toggleBlockType.bind(this);
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  componentDidMount() {
    const { value } = this.props;
    if (value && safelyParseJSON(value)) {
      const contentState = convertFromRaw(JSON.parse(value));
      const editorState = EditorState.createWithContent(contentState);
      this.setState({ editorState });
    }
  }


  componentWillReceiveProps (nextProps) {
    const { value } = this.props;
    if (value !== nextProps.value && safelyParseJSON(nextProps.value)) {
      let nextVal = JSON.parse(JSON.stringify(nextProps.value))

      if (typeof nextVal === "string") nextVal = JSON.parse(nextVal)
      if (nextVal.blocks && !((nextVal.blocks || [])[0] || {}).text) {
        this.setState({
          editorState: EditorState.createEmpty(),
        })
      }
    }
  }

  onEditorStateChange(editorState) {
    const { onChange } = this.props;
    this.setState({ editorState });

    // trigger on change converting the ContentState to raw object
      onChange(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  }

  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onEditorStateChange(newState);
      return true;
    }
    return false;
  }

  onTab(event) {
    const maxDepth = 4;
    this.onEditorStateChange(RichUtils.onTab(event, this.state.editorState, maxDepth));
  }

  toggleBlockType(blockType) {
    this.onEditorStateChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  toggleInlineStyle(inlineStyle) {
    this.onEditorStateChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  customBlockStyles(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'blockquote') return styles.editorBlockquoteStyle;
    if (type === 'code-block') return styles.editorCodeStyle;
    if (type === 'header-one') return styles.editorH1Style;
    if (type === 'header-two') return styles.editorH2Style;
    if (type === 'header-three') return styles.editorH3Style;
  }

  render() {
    const {
      customTheme,
      type,
      onSave,
      isEdit,
      readOnly,
      isQA
    } = this.props;

    // styling for inline styles
    const inlineStyleMap = {
      'CODE': {
        color: '#e74c3c',
        backgroundColor: '#f9f9f9',
        border: '1px solid #e8e8e8',
        fontFamily: 'monospace',
        padding: '2px 5px',
        margin: '0px 5px',
      },
    };

    let saveButtonLabel = '';
    if (type === 'newOpinion') saveButtonLabel = 'Reply';
    if (type === 'newDiscussion') saveButtonLabel = isEdit ? 'Update' : isQA ? 'Post Question' : 'Post Discussion';

    let placeholder = '';
    if (type === 'newOpinion') placeholder = isQA ? 'Your answer...\nBe Nice: No Racism, Bigotry, or Offensive Behavior.\n' +
      'Provide preferably Primary and Secondary Sources If Asked Rather Than Tertiary Sources Like Wikipedia.\n' +
      'Serious On-Topic Answers Only: No Jokes, Anecdotes, Clutter, or other Digressions.' : 'Your opinion...'
    if (type === 'newDiscussion') placeholder = isQA ? 'Give a bit of context to your question...' : 'Discussion summary...'

    return (
      <div className={classnames('RichEditor_container', readOnly && 'RichEditor_readOnlyContainer')}>
        { !readOnly && <div className='RichEditor_controlsContainer'>
          <InlineStyleControls
            type={type}
            editorState={this.state.editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            type={type}
            editorState={this.state.editorState}
            onToggle={this.toggleBlockType}
          />
        </div> }

        <div
          className={classnames(
            'RichEditor_editorContainer',
            !readOnly && 'RichEditor_type',
            (!readOnly && type === 'newDiscussion') && 'RichEditor_newDiscussion',
            readOnly && 'RichEditor_readOnlyEditorContainer'
          )}
          onClick={this.focus}
        >
          <Editor
            customStyleMap={inlineStyleMap}
            blockStyleFn={this.customBlockStyles}
            readOnly={readOnly}
            editorState={this.state.editorState}
            onChange={this.onEditorStateChange}
            placeholder={placeholder}
            handleKeyCommand={this.handleKeyCommand}
            onTab={this.onTab}
            ref='editor'
          />
        </div>

        { !readOnly && <Button noUppercase style={{ alignSelf: 'center', background: customTheme.foreColors[0], color: customTheme.backColors[1] }} onClick={onSave}>
          {saveButtonLabel}
        </Button> }
      </div>
    );
  }
}

RichEditor.defaultProps = {
  readOnly: false,
  value: null,
  type: 'newDiscussion',
  onChange: () => { },
  onSave: () => { },
};

export default RichEditor;
