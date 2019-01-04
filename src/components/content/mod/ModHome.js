import React from 'react'
import {
  BooleanField,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
  LongTextInput,
  minLength,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceArrayField,
  ReferenceManyField,
  required,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  translate,
  UrlField
} from 'admin-on-rest'
import { Link } from 'react-router-dom'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'

export const ModHome = () => {
  return <div>
    <List>
      <Subheader>Area</Subheader>
      <ListItem
        containerElement={<Link to='/mod/areas/' />}
        primaryText='Overwrite Area' />
    </List>
    <Divider />
    <List>
      <Subheader>Marker</Subheader>
      <ListItem
        containerElement={<Link to='/mod/markers/create' />}
        primaryText='Add Item' />
      {/* <ListItem */}
      {/* containerElement={<Link to="/mod/markers/edit" />} */}
      {/* primaryText="Edit Marker" /> */}
    </List>
    <Divider />
    <List>
      <Subheader>Meta</Subheader>
      <ListItem
        containerElement={<Link to='/mod/metadata/create' />}
        primaryText='Add Area Entity' />
      <ListItem
        containerElement={<Link to='/mod/metadata' />}
        primaryText='Edit Entity' />
    </List>
  </div>
}
