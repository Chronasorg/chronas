import React, { Component } from 'react'

import get from 'lodash.get'
import isEqual from 'lodash.isequal'
import AutoComplete from 'material-ui/AutoComplete'
import { FieldTitle, translate } from 'admin-on-rest'

export class AutocompleteDisallowInput extends Component {
  handleNewRequest = (chosenRequest, index) => {
    const { allowEmpty, choices, input, optionValue } = this.props
    let choiceIndex = allowEmpty ? index - 1 : index

    // The empty item is always at first position
    if (index !== 0) {
      this.setState({ isValid: 0 })
      return input.onChange('')
    }

    this.setState({ isValid: 1 })
    input.onChange(optionValue)
  };
  handleUpdateInput = searchText => {
    const { input, setFilter } = this.props
    const found = this.props.choices.filter(function (el) {
      return el.name === searchText
    }).length !== 0

    this.setState({ searchText })
    setFilter && setFilter(searchText)

    if (found) {
      this.setState({ isValid: 0 })
      return input.onChange('')
    } else {
      this.setState({ isValid: 1 })
      input.onChange(searchText)
    }
  };
  addAllowEmpty = choices => {
    const { allowEmpty, translate } = this.props

    if (allowEmpty) {
      return [
        {
          value: '',
          text: translate('aor.input.autocomplete.none'),
        },
        ...choices,
      ]
    }

    return choices
  };

  constructor (props) {
    super(props)
    this.state = {
      isValid: 0
    }
  }

  componentWillMount () {
    this.setSearchText(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props.choices, nextProps.choices)) {
      return
    }

    if (this.props.input.value !== nextProps.input.value) {
      this.setSearchText(nextProps)
    }
  }

  setSearchText (props) {
    const { choices, input, optionValue, translate } = props

    const selectedSource = choices.find(
      choice => get(choice, optionValue) === input.value
    )

    if (typeof selectedSource !== 'undefined') {

    }
    // const searchText =
    //   (selectedSource && this.getSuggestion(selectedSource)) ||
    //   translate('aor.input.autocomplete.none')
    // this.setState({ searchText })
  }

  getSuggestion (choice) {
    const { optionText, translate, translateChoice } = this.props
    const choiceName =
      typeof optionText === 'function'
        ? optionText(choice)
        : get(choice, optionText)
    return translateChoice
      ? translate(choiceName, { _: choiceName })
      : choiceName
  }

  render () {
    const {
      choices,
      elStyle,
      filter,
      isRequired,
      label,
      meta,
      options,
      optionValue,
      resource,
      source,
    } = this.props
    if (typeof meta === 'undefined') {
      throw new Error(
        "The AutocompleteDisallowInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component for details."
      )
    }
    const { touched, error } = meta

    const dataSource = this.addAllowEmpty(
      choices.map(choice => ({
        value: get(choice, optionValue),
        text: this.getSuggestion(choice),
      }))
    )

    const validMessage = {
      0: 'Specify an original value, if you like to edit an existing resource click Edit Entity on top.',
      1: ''
    }

    return (
      <AutoComplete
        searchText={this.state.searchText}
        listStyle={{ maxHeight: 200, overflow: 'auto' }}
        dataSource={dataSource}
        textFieldStyle={{ color: 'red' }}
        floatingLabelText={
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        }
        filter={filter}
        onNewRequest={this.handleNewRequest}
        onUpdateInput={this.handleUpdateInput}
        openOnFocus
        style={elStyle}
        errorText={validMessage[this.state.isValid]}
        {...options}
      />
    )
  }
}

AutocompleteDisallowInput.defaultProps = {
  addField: true,
  allowEmpty: false,
  choices: [],
  filter: AutoComplete.fuzzyFilter,
  options: {},
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
}

export default translate(AutocompleteDisallowInput)
