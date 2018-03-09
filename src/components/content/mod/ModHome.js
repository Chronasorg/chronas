import React from 'react'
import {
  translate,
  BooleanField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  SingleFieldList,
  ChipField,
  EmailField,
  Filter,
  FormTab,
  Edit,
  Delete,
  UrlField,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceManyField,
  ReferenceArrayField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  LongTextInput,
  required,
  minLength
} from 'admin-on-rest'
import { Link } from 'react-router-dom'
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

export const ModHome = () => {
  return <div>
    <List>
      <Subheader>Area</Subheader>
      <ListItem
        containerElement={<Link to="/mod/areas/" />}
        primaryText="Edit Area" />
    </List>
    <Divider />
    <List>
      <Subheader>Marker</Subheader>
      <ListItem
        containerElement={<Link to="/mod/markers/create" />}
        primaryText="Add Marker">
      </ListItem>
      {/*<ListItem*/}
        {/*containerElement={<Link to="/mod/markers/edit" />}*/}
        {/*primaryText="Edit Marker" />*/}
    </List>
    <Divider />
    <List>
      <Subheader>Meta</Subheader>
      <ListItem
        containerElement={<Link to="/mod/metadata/create" />}
        primaryText="Add Meta" />
      <ListItem
        containerElement={<Link to="/mod/metadata" />}
        primaryText="Edit Meta" />
    </List>
  </div>
};

