import React from 'react';
import {
    translate,
    BooleanField,
    Create,
    Datagrid,
    DateField,
    DateInput,
    DisabledInput,
    EmailField,
    Filter,
    FormTab,
    List,
    LongTextInput,
    Edit,
    Delete,
    NullableBooleanInput,
    NumberField,
    NumberInput,
    ReferenceManyField,
    SimpleForm,
    TabbedForm,
    TextField,
    TextInput,
  required,minLength
} from 'admin-on-rest';
import Icon from 'material-ui/svg-icons/social/person';
import EditButton from '../shared/buttons/EditButton';
import SegmentsInput from './SegmentsInput';
import { chronasMainColor } from '../../../styles/chronasColors'

export const UserIcon = Icon;

const UserFilter = (props) => (
    <Filter {...props}>
        <TextInput label="pos.search" source="q" alwaysOn />
        <DateInput source="last_seen_gte" />
        <NullableBooleanInput source="has_ordered" />
        <NullableBooleanInput source="has_newsletter" defaultValue={true} />
        <SegmentsInput />
    </Filter>
);

const colored = WrappedComponent => props => props.record[props.source] > 500 ?
    <span style={{ color: 'red' }}><WrappedComponent {...props} /></span> :
    <WrappedComponent {...props} />;

const ColoredNumberField = colored(NumberField);
ColoredNumberField.defaultProps = NumberField.defaultProps;

export const UserList = (props) => {
  return <List {...props} filters={<UserFilter />}  sort={{field: 'username', order: 'DESC'}} perPage={25}>
    <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
      <TextField source="username" label="resources.users.fields.username"/>
      <TextField source="name" label="resources.users.fields.name"/>
      <TextField source="education" label="resources.users.fields.education"/>
      <EmailField source="email" label="resources.users.fields.email"/>
      <TextField source="privilege" label="resources.users.fields.privilege"/>
      <DateField source="createdAt" label="resources.users.fields.createdAt" type="date" />
      <NumberField source="karma" label="resources.users.fields.karma" style={{ color: chronasMainColor }} />
      <EditButton />
    </Datagrid>
  </List>
};

export const UserEdit = (props) => {
  console.debug("props",props)
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

export const UserCreate = (props) => {
  return <Create {...props}>
    <SimpleForm redirect="list">
      <TextInput source="username" validate={required} />
      <TextInput source="name" />
      <TextInput source="education" />
      <TextInput type="email" label="resources.users.fields.email" source="email" validation={{ email: true }} options={{ fullWidth: true }} style={{ width: 544 }} />
      <NumberInput source="privilege" label="resources.users.fields.privilege"  elStyle={{ width: '5em' }} />
      <TextInput source="password" type="password" validate={[required, minLength(6)]} />
    </SimpleForm>
  </Create>
};

const UserDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.customers.page.delete')}&nbsp;
    {record && `${record.username} ${record.username}`}
</span>);

export const UserDelete = (props) => <Delete {...props} title={<UserDeleteTitle />} />;

