import debounce from 'lodash.debounce'
import React, { Component } from 'react'
import Quill from 'quill'
import ImageResize from 'quill-image-resize-module'

require('./RichTextImageVideoInput.css')

class RichTextImageVideoInput extends Component {

  componentDidMount() {
    const {
      input: {
        value,
      },
      toolbar,
    } = this.props

    const imageHandler = function imageHandler() {
      const range = this.quill.getSelection()
      const value = prompt('What is the image URL')
      if (value) {
        this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER)
      }
    }

    const htmlHandler = function htmlHandler() {
      const range = this.quill.getSelection()
      const value = prompt('Paste HTML here')
      if (value) {
        this.quill.clipboard.dangerouslyPasteHTML(range.index, value)
      }
    }

    Quill.register('modules/imageResize', ImageResize);
    this.quill = new Quill(this.divRef, {
      modules: {
        imageResize: {
          displaySize: true
        },
        toolbar: [ ['bold', 'italic', 'underline', 'clean', 'link', 'image', 'code-block', 'video'] ]
      },
      theme: 'snow',
    })

    this.quill.getModule('toolbar').addHandler('image', imageHandler);
    this.quill.getModule('toolbar').addHandler('code-block', htmlHandler);

    this.quill.pasteHTML(value)

    this.editor = this.divRef.querySelector('.ql-editor')
    this.quill.on('text-change', debounce(this.onTextChange, 500));
    // this.quill.pasteHTML(value)
    // this.quill.on('editor-change', function(eventName, ...args) { console.debug(eventName,args) });
  }

  componentWillUnmount() {
    this.quill.off('text-change', this.onTextChange)
    this.quill = null
  }

  onTextChange = () => {
    this.props.input.onChange(this.editor.innerHTML)
  }

  updateDivRef = ref => {
    this.divRef = ref
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.input.value !== this.props.input.value && !this.quill.hasFocus()) {
      this.quill.pasteHTML(nextProps.input.value)
    }
  }

  render () {
    return <div className='aor-rich-text-input'>
      <div ref={this.updateDivRef} />
    </div>
  }
}

RichTextImageVideoInput.defaultProps = {
  addField: true,
  addLabel: true,
  options: {},
  record: {},
  toolbar: true,
}

export default RichTextImageVideoInput
