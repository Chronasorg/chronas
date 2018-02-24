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
import { Card } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import Toolbar from 'material-ui/Toolbar'
import FlatButton from 'material-ui/FlatButton';
import { tooltip } from '../../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../../styles/chronasColors'


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

class Account extends PureComponent {
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
    const { resources, userDetails, list, create, edit, show, remove, options, onMenuTap, translate } = this.props
    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: false,
      resource: 'users',
    }
    const username = localStorage.getItem('id')
    const routeProps = {
      "match": {
        "path":"/account",
        "url":"/resources/users/" + username,
        "isExact": true,
        "params": {
          "id": username
        }
      },
      "location": {
        "pathname":"/account",
        "search":"",
        "hash":""
      },
      "history": {
        "length": 50,
        "action": "POP",
        "location": {
          "pathname":"/account",
          "search": "",
          "hash": ""
        }
      }
    }

    const UserEdit = (props) => {
      return <Edit title={<span>UserEdit</span>} {...props}>
        <SimpleForm>
          <DisabledInput source="username" />
          <TextInput source="name" />
          <TextInput source="education" />
          <TextInput type="email" label="resources.users.fields.email" source="email" validation={{ email: true }} options={{ fullWidth: true }} style={{ width: 544 }} />
          <NumberInput source="privilege" label="resources.users.fields.privilege"  elStyle={{ width: '5em' }} />
          <NumberInput source="karma" elStyle={{ width: '5em' }} />
          <LongTextInput source="password"  type="password" />
          <DisabledInput source="createdAt" label="resources.users.fields.createdAt" type="date" />
        </SimpleForm>
      </Edit>}

    return (
      <Restricted authParams={{ foo: 'bar' }} location={{ pathname: 'account' }}>
        <Dialog bodyStyle={{ backgroundImage: '#fff' }} open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
                contentStyle={styles.dialogStyle} onRequestClose={this.handleClose}>
          <Card style={styles.card}>
            {UserEdit && createElement(UserEdit, {
            ...commonProps,
            ...routeProps,
            })}
          </Card>
        </Dialog>
      </Restricted>
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

export default enhance(Account);
