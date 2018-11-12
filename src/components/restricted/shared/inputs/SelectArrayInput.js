import React, { Component } from 'react'

import get from 'lodash.get'
import isEqual from 'lodash.isequal'
import AutoComplete from 'material-ui/AutoComplete'
import ChipInput from 'material-ui-chip-input'
import { FieldTitle, translate } from 'admin-on-rest'
import { properties } from "../../../../properties";
import axios from "axios/index";

const dataSourceConfig = { text: 'text', value: 'value' }

export class SelectArrayInput extends Component {
  state = {
    values: [],
  };

  componentWillMount = () => {
    this.setState({
      values: this.getChoicesForValues(
        this.props.input.value || [],
        this.props.choices
      ),
    });
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
      });
    }
  };

  handleBlur = () => {};

  handleFocus = () => {
    const extracted = this.extractIds(this.state.values);
    this.props.onFocus(extracted);
    this.props.input.onFocus(extracted);
  };

  handleAdd = newValue => {
    const { linkedItemData, setLinkedItemData, source } = this.props
    const values = [...this.state.values, newValue];
    this.setState({ values }, () => this.handleChange(this.state.values))

    const newArr1 = linkedItemData.linkedItemKey1.split("||")
    const toAddString = newValue.value || newValue
    const newArr2 = toAddString.split("||")

    const type = (source === 'linkedMedia') ? 'e' : 'a'

    setLinkedItemData({ [source]: linkedItemData[source].filter( el => el !== toAddString) })

    const linkedBody = {
      linkedItemType1: (properties.markersTypes.includes(newArr1[1])) ? 'markers' : 'metadata',
      linkedItemType2: (properties.markersTypes.includes(newArr2[1])) ? 'markers' : 'metadata',
      linkedItemKey1: ((newArr1[1].indexOf('ae|') > -1) ? (newArr1[1] + '|') : '') + newArr1[0],
      linkedItemKey2: ((newArr2[1].indexOf('ae|') > -1) ? (newArr2[1] + '|') : '') + newArr2[0],
      type1: type,
      type2: type,
    }

    axios.put(properties.chronasApiHost + '/metadata/links/addLink', JSON.stringify(linkedBody), {
      'headers': {
          'Authorization': 'Bearer ' + localStorage.getItem('chs_token'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(() => {
        console.debug("linked added")
      })
  }

  handleDelete = newValue => {
    console.debug("remove chip", newValue)
    const { linkedItemData, setLinkedItemData, source } = this.props
    const values = this.state.values.filter(v => v.value !== newValue);
    this.setState({ values }, () => this.handleChange(this.state.values));

    const newArr1 = linkedItemData.linkedItemKey1.split("||")
    const toDeleteString = newValue.value || newValue
    const newArr2 = toDeleteString.split("||")

    setLinkedItemData({ linkedMedia: linkedItemData[source].filter( el => el !== toDeleteString) })

    const linkedBody = {
      linkedItemType1: (properties.markersTypes.includes(newArr1[1])) ? 'markers' : 'metadata',
      linkedItemType2: (properties.markersTypes.includes(newArr2[1])) ? 'markers' : 'metadata',
      linkedItemKey1: ((newArr1[1].indexOf('ae|') > -1) ? (newArr1[1] + '|') : '') + newArr1[0],
      linkedItemKey2: ((newArr2[1].indexOf('ae|') > -1) ? (newArr2[1] + '|') : '') + newArr2[0],
    }

    axios.put(properties.chronasApiHost + '/metadata/links/removeLink', JSON.stringify(linkedBody), {
      'headers': {
        'Authorization': 'Bearer ' + localStorage.getItem('chs_token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(() => {
        console.debug("linked deleted")
      })
  };

  handleChange = eventOrValue => {
    const extracted = this.extractIds(eventOrValue);
    this.props.onChange(extracted);
    this.props.input.onChange(extracted);
  };

  extractIds = eventOrValue => {
    const value =
      eventOrValue.target && eventOrValue.target.value
        ? eventOrValue.target.value
        : eventOrValue;
    if (Array.isArray(value)) {
      return value.map(o => o.value);
    }
    return [value];
  };

  handleUpdateInput = searchText => {
    console.debug(searchText)
    this.setState({ searchText });
    this.props.onSearchChange(searchText);
    const { setFilter } = this.props;
    setFilter && setFilter(searchText);
  };

  getChoicesForValues = (values, choices = []) => {
    const { optionValue, optionText } = this.props;
    if (!values || !Array.isArray(values)) {
      throw Error('Value of SelectArrayInput should be an array');
    }
    return values
      .map(
        value =>
          choices.find(c => c[optionValue] === value) || {
            [optionValue]: value,
            [optionText]: value,
          }
      )
      .map(this.formatChoice);
  };

  formatChoices = choices => choices.map(this.formatChoice);

  formatChoice = choice => {
    const {
      optionText,
      optionValue,
      translateChoice,
      translate,
    } = this.props;
    const choiceText =
      typeof optionText === 'function'
        ? optionText(choice)
        : get(choice, optionText);
    return {
      value: get(choice, optionValue),
      text: translateChoice
        ? translate(choiceText, { _: choiceText })
        : choiceText,
    };
  };

  render() {
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
    } = this.props;
    if (typeof meta === 'undefined') {
      throw new Error(
        "The SelectArrayInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component for details."
      );
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
    );
  }
}

SelectArrayInput.defaultProps = {
  addField: true,
  choices: [],
  onBlur: () => true,
  onChange: () => true,
  onFocus: () => true,
  options: {},
  setLinkedItemData: () => {},
  onSearchChange: () => {},
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
};

export default translate(SelectArrayInput)
