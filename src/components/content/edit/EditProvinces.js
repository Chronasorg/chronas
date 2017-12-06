import React, { createElement, PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import pure from 'recompose/pure'
import {
  translate,
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EditButton,
  Filter,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  Restricted,
  ReferenceInput,
  ReferenceField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
} from 'admin-on-rest';


const styles = {
  menuButtons: {
    margin: 12,
    color: '#fff',
  },
  dialogStyle: {
    width: 'calc(100% - 64px)',
    height: '800px',
    maxWidth: 'none',
    maxHeight: 'none',
    left: 32,
    top: 0,
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    paddingTop: 0
  },
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

const detailStyle = { display: 'inline-block', verticalAlign: 'top', marginRight: '2em', minWidth: '8em' };

class EditProvinces extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render() {
    return (
      <div>
        tata?
      </div>
    );
  }
}
/*

 {component && createElement(component, {
 ...commonProps,
 })}

 */
// ...routeProps,
const enhance = compose(
  connect(state => ({
    userDetails: state.userDetails
  }), { }),
  pure,
  translate,
)

export default enhance(EditProvinces);
