import React from 'react';
import {
    translate,
    BooleanField,
    Create,
    Datagrid,
    DateField,
    DateInput,
    DisabledInput,
    Filter,
    FormTab,
    List,
    LongTextInput,
    Edit,
    Delete,
    NullableBooleanInput,
    NumberField,
    ReferenceManyField,
    SimpleForm,
    TabbedForm,
    TextField,
    TextInput,
} from 'admin-on-rest';
import Icon from 'material-ui/svg-icons/social/person';
// import Edit from '../shared/crudComponents/Edit';
import EditButton from '../shared/buttons/EditButton';
// import Delete from '../shared/buttons/EditButton';
import NbItemsField from '../shared/commands/NbItemsField';
import ProductReferenceField from '../products/ProductReferenceField';
import StarRatingField from '../reviews/StarRatingField';
import FullNameField from './FullNameField';
import SegmentsField from './SegmentsField';
import SegmentsInput from './SegmentsInput';

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
      <TextField source="username"/>
      <TextField source="name"/>
      <EditButton />
    </Datagrid>
  </List>
};

const UserTitle = ({ record }) => record ? <FullNameField record={record} size={32} /> : null;


const validateUserCreation = (values) => {
  const errors = {};
  if (!values.username) {
    errors.username = ['Username is required'];
  }
  if (!values.name) {
    errors.name = ['Name is required'];
  }
  return errors
};
/*

 const PersonEdit = (props) => (
 <Edit {...props}>
 <SimpleForm>
 <SexInput source="sex" />
 </SimpleForm>
 </Edit>
 );

export const UserEdit = translate(({ translate, ...rest }) => (
  <Edit title={<span>UserEdit</span>} {...rest}>
    <SimpleForm>
      <TextField source="username"/>
      <div>tesst</div>
    </SimpleForm>
  </Edit>
));
*/
export const UserEdit = (props) => {
  console.debug("USEREDIT",props)
  // var props2 =  Object.assign({}, props);
  // props2.data = {"_id":"daumann","username":"daumann","name":"Dietmar","__v":0,"comments":0,"edits":0,"karma":0,"createdAt":"2017-10-21T00:27:35.216Z","status":"inactive","privilege":"user"}

  return <Edit title={<span>UserEdit</span>} {...props}>
    <SimpleForm>
      <DisabledInput source="username" />
      <LongTextInput source="name" />
    </SimpleForm>
  </Edit>}

/*

 <TabbedForm>
 <FormTab label="resources.customers.tabs.identity">
 <TextInput source="id" style={{ display: 'inline-block' }} />
 </FormTab>
 </TabbedForm>

export const UserEdit = (props) => {
  console.debug("UserEdit,props",props)
  return <Edit {...props}>1
    <SimpleForm>
      test
    </SimpleForm>
  </Edit>
};

 <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
 <TextInput source="username" style={{display: 'inline-block'}}/>
 123
 </Datagrid>*/
export const UserCreate = (props) => {
  console.debug("UserEdit,props",props)
  return <Create {...props}>
    <SimpleForm validate={validateUserCreation}>
      <TextInput label="Username" source="username" />
      <TextInput label="Name" source="name" />
    </SimpleForm>
  </Create>
};

/*
export const UserEdit = (props) => (
    <Edit title={<UserTitle />} {...props}>
        <TabbedForm>
            <FormTab label="resources.customers.tabs.identity">
                <TextInput source="username" style={{ display: 'inline-block' }} />
            </FormTab>
            <FormTab label="resources.customers.tabs.address">
                <LongTextInput source="email" style={{ maxWidth: 544 }} />
                <TextInput source="privilege" style={{ display: 'inline-block' }} />
            </FormTab>
        </TabbedForm>
    </Edit>
);
*/
const UserDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.customers.page.delete')}&nbsp;
    {record && `${record.username} ${record.username}`}
</span>);

export const UserDelete = (props) => <Delete {...props} title={<UserDeleteTitle />} />;

