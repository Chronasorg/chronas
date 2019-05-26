import React, { Component } from 'react'

import get from 'lodash.get'
import ChipInput from './ChipInput'
import { FieldTitle, translate } from 'admin-on-rest'
import { properties } from '../../../../properties'
import axios from 'axios/index'

const dataSourceConfig = { text: 'text', value: 'value' }

const arraymove = (arr, fromIndex, toIndex) => {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
  return arr
}

export class SortableSelectArrayInput extends Component {
  state = {
    values: [],
  };

  componentWillMount = () => {
    this.setState({
      values: this.getChoicesForValues(
        this.props.input.value || [],
        this.props.choices
      ),
    })
  };

  componentWillReceiveProps = nextProps => {
    if (
      this.props.choices !== nextProps.choices ||
      this.props.input.value !== nextProps.input.value
    ) {
      this.setState({
        values: this.getChoicesForValues(
          nextProps.input.value || [],
          nextProps.choices
        ),
      })
    }
  };

  handleBlur = () => {
  };

  handleFocus = () => {
    const extracted = this.extractIds(this.state.values)
    this.props.onFocus(extracted)
    this.props.input.onFocus(extracted)
  };

  handleAdd = newValue => {
    const { linkedItemData, setLinkedItemData, source } = this.props
    const toAddString = newValue.value || newValue
    const values = [...this.state.values, newValue]
    // setLinkedItemData({ [source]: linkedItemData[source].filter(el => el !== toAddString).concat([toAddString]) })
    this.setState({ values }, () => this.handleChange(this.state.values))
  }

  handleOrderChange = (chipIndex, direction) => {
    const newChips = arraymove(this.state.values, chipIndex, direction === 'up' ? (chipIndex - 1) : (chipIndex + 1))
    const values = this.state.values.filter(v => v.value !== newChips)
    this.setState({ values }, () => this.handleChange(this.state.values))
  }

  handleDelete = newValue => {
    // console.debug('remove chip', newValue)
    const values = this.state.values.filter(v => v.value !== newValue)
    this.setState({ values }, () => this.handleChange(this.state.values))

  };

  handleChange = eventOrValue => {
    const extracted = this.extractIds(eventOrValue)
    this.props.onChange(extracted)
    this.props.input.onChange(extracted)
  };

  extractIds = eventOrValue => {
    const value =
      eventOrValue.target && eventOrValue.target.value
        ? eventOrValue.target.value
        : eventOrValue
    if (Array.isArray(value)) {
      return value.map(o => o.value)
    }
    return [value]
  };

  handleUpdateInput = searchText => {
    this.setState({ searchText })
    this.props.onSearchChange(searchText)
    const { setFilter } = this.props
    setFilter && setFilter(searchText)
  };

  getChoicesForValues = (values, choices = []) => {
    const { optionValue, optionText } = this.props
    if (!values || !Array.isArray(values)) {
      throw Error('Value of SortableSelectArrayInput should be an array')
    }
    return values
      .map(
        value =>
          choices.find(c => c[optionValue] === value) || {
            [optionValue]: value,
            [optionText]: value,
          }
      )
      .map(this.formatChoice)
  };

  formatChoices = choices => choices.map(this.formatChoice);

  formatChoice = choice => {
    const {
      optionText,
      optionValue,
    } = this.props
    return {
      category: choice.category,
      value: get(choice, optionValue),
      name: choice.name,
      text: choice.suggest,
    }
  };

  render () {
    const {
      elStyle,
      input,
      isRequired,
      choices,
      label,
      meta,
      options,
      resource,
      source,
      setFilter,
    } = this.props
    if (typeof meta === 'undefined') {
      throw new Error(
        "The SortableSelectArrayInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component for details."
      )
    }
    const { touched, error } = meta

    return (
      <ChipInput
        {...input}
        value={this.state.values}
        // Override onBlur so that redux-form does not try to handle it and miss
        // updates from onRequestAdd
        fullWidth
        fullWidthInput
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onClick={this.handleFocus}
        onRequestAdd={this.handleAdd}
        handleOrderChange={this.handleOrderChange}
        onRequestDelete={this.handleDelete}
        onUpdateInput={this.handleUpdateInput}
        floatingLabelText={
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        }
        errorText={touched && error}
        style={elStyle}
        dataSource={this.formatChoices(choices)}
        dataSourceConfig={dataSourceConfig}
        openOnFocus
        {...options}
      />
    )
  }
}

SortableSelectArrayInput.defaultProps = {
  addField: true,
  choices: [],
  onBlur: () => true,
  onChange: () => true,
  onFocus: () => true,
  options: {},
  setLinkedItemData: () => {
  },
  onSearchChange: () => {
  },
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
}

export default translate(SortableSelectArrayInput)
