import React, { Component } from 'react'
import Toggle from 'material-ui/Toggle'
import { FieldTitle } from 'admin-on-rest'

const styles = {
  block: {
    margin: '1rem 0',
    maxWidth: 250,
  },
  toggle: {
    marginBottom: 16,
  },
}

class BooleanInput extends Component {
  handleToggle = (event, value) => {
    this.props.input.onChange(value)
  };

  render () {
    const {
      value,
      input,
      isRequired,
      label,
      source,
      elStyle,
      resource,
      options,
    } = this.props

    return (
      <div style={elStyle || styles.block}>
        <Toggle
          toggled={value || !!input.value}
          onToggle={this.handleToggle}
          style={styles.toggle}
          label={
            <FieldTitle
              label={label}
              source={source}
              resource={resource}
              isRequired={isRequired}
            />
          }
          {...options}
        />
      </div>
    )
  }
}

BooleanInput.defaultProps = {
  addField: true,
  options: {},
}

export default BooleanInput
