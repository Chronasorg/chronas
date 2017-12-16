import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import pure from 'recompose/pure'
import compose from 'recompose/compose'
import TextField from 'material-ui/TextField';
import { translate, defaultTheme } from 'admin-on-rest'
import muiThemeable from 'material-ui/styles/muiThemeable';
import { setModData as setModDataAction } from './../buttons/actionReducers'

/**
 * An Input component for a string
 *
 * @example
 * <TextInput source="first_name" />
 *
 * You can customize the `type` props (which defaults to "text").
 * Note that, due to a React bug, you should use `<NumberField>` instead of using type="number".
 * @example
 * <TextInput source="email" type="email" />
 * <NumberInput source="nb_views" />
 *
 * The object passed as `options` props is passed to the material-ui <TextField> component
 */
export class ModGeoInput extends Component {
  handleBlur = eventOrValue => {
    this.props.onBlur(eventOrValue);
    this.props.input.onBlur(eventOrValue);
  };

  handleFocus = event => {
    this.props.onFocus(event);
    this.props.input.onFocus(event);
  };

  handleChange = (eventOrValue, val) => {
    console.debug("geooo handleChange", eventOrValue, val)
    this.props.onChange(eventOrValue);
    this.props.input.onChange(eventOrValue);

    const prevLatLng = this.props.modActive.data
    prevLatLng[this.props.accessor] = +val

    this.props.setModData(prevLatLng)
  };

  componentWillReceiveProps(nextProps) {
    console.debug("geooo componentWillReceiveProps", nextProps,this.props)
  }

  render() {
    const {
      elStyle,
      // input,
      isRequired,
      label,
      // meta,
      accessor,
      options,
      resource,
      source,
      type,
    } = this.props;

    console.debug(this.props)
    const meta={ touched: true, error: false }
    if (typeof meta === 'undefined') {
      throw new Error(
        "The TextInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component for details."
      );
    }
    const { touched, error } = meta;
    const input = {}

    if (typeof this.props.modActive.data !== "undefined") input.value = this.props.modActive.data[accessor]

    return (
    <div>
      <TextField
        {...input}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onChange={this.handleChange}
        type={type}
        value={(typeof this.props.modActive.data !== "undefined") ? this.props.modActive.data[accessor] : 123}
        style={elStyle}
        {...options}
      />
    </div>
    );
  }
}

ModGeoInput.propTypes = {
  addField: PropTypes.bool.isRequired,
  accessor: PropTypes.number.isRequired,
  elStyle: PropTypes.object,
  modActive: PropTypes.number,//PropTypes.object,
  setModData: PropTypes.func,
  input: PropTypes.object,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  meta: PropTypes.object,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  options: PropTypes.object,
  resource: PropTypes.string,
  source: PropTypes.string,
  type: PropTypes.string,
};

ModGeoInput.defaultProps = {
  addField: true,
  accessor: 0,
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  options: {},
  type: 'text',
  // modActive: 1,
  setModData: () => {},
};
//
// const enhance = compose(
//   connect(state => ({
//     modActive: state.modActive,
//     input: state.input,
//     addField: state.addField,
//     accessor: state.accessor,
//     onBlur: state.onBlur,
//     onChange: state.onChange,
//     onFocus: state.onFocus,
//     options: state.options,
//   }), {
//     setModData: setModDataAction,
//   }),
//   pure,
//   translate,
// );

const enhance = compose(
  muiThemeable(), // force redraw on theme change
  connect(state => ({
    modActive: state.modActive
  }), {
    setModData: setModDataAction,
  })
);

export default enhance(ModGeoInput);
// export default ModGeoInput;
