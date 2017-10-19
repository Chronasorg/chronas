import React from 'react';
import { List, Datagrid, TextField } from 'admin-on-rest';
import GridList from './GridList';

export const UserList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="username" />
    </Datagrid>
  </List>
);
/*
export const UserList = props => {
  return (
    <List {...props} perPage={20} style={{background: 'blue'}}>
      <GridList />
    </List>
  );
}

/*
import React from 'react';
import {
    translate,
    BooleanField,
    Datagrid,
    DateField,
    DateInput,
    Delete,
    Edit,
    Filter,
    FormTab,
    List,
    LongTextInput,
    NullableBooleanInput,
    NumberField,
    ReferenceManyField,
    TabbedForm,
    TextField,
    TextInput,
} from 'admin-on-rest';
import Icon from 'material-ui/svg-icons/social/person';

import EditButton from '../shared/buttons/EditButton';
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

export const UserList = (props) => (
    <List {...props} filters={<UserFilter />} sort={{ field: 'last_seen', order: 'DESC' }} perPage={25}>
        <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
          <TextField source="id" />
          <TextField source="username" />
        </Datagrid>
    </List>
);



 // <FullNameField />
 // <DateField source="createdAt" type="date" />
 // <NumberField source="edits" label="resources.customers.fields.commands" style={{ color: 'purple' }} />
 // <ColoredNumberField source="karma" options={{ style: 'currency', currency: 'USD' }} />
 // <DateField source="createdAt" showTime />
 // <BooleanField source="has_newsletter" label="News." />
 // <SegmentsField />
 // <EditButton />

const UserTitle = ({ record }) => record ? <FullNameField record={record} size={32} /> : null;

export const UserEdit = (props) => (
    <Edit title={<UserTitle />} {...props}>
        <TabbedForm>
            <FormTab label="resources.customers.tabs.identity">
                <TextInput source="first_name" style={{ display: 'inline-block' }} />
                <TextInput source="last_name" style={{ display: 'inline-block', marginLeft: 32 }} />
                <TextInput type="email" source="email" validation={{ email: true }} options={{ fullWidth: true }} style={{ width: 544 }} />
                <DateInput source="birthday" />
            </FormTab>
            <FormTab label="resources.customers.tabs.address">
                <LongTextInput source="address" style={{ maxWidth: 544 }} />
                <TextInput source="zipcode" style={{ display: 'inline-block' }} />
                <TextInput source="city" style={{ display: 'inline-block', marginLeft: 32 }} />
            </FormTab>
            <FormTab label="resources.customers.tabs.orders">
                <ReferenceManyField addLabel={false} reference="commands" target="customer_id">
                    <Datagrid>
                        <DateField source="date" />
                        <TextField source="reference" />
                        <NbItemsField />
                        <NumberField source="total" options={{ style: 'currency', currency: 'USD' }} />
                        <TextField source="status" />
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </FormTab>
            <FormTab label="resources.customers.tabs.reviews">
                <ReferenceManyField addLabel={false} reference="reviews" target="customer_id">
                    <Datagrid filter={{ status: 'approved' }}>
                        <DateField source="date" />
                        <ProductReferenceField />
                        <StarRatingField />
                        <TextField source="comment" style={{ maxWidth: '20em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} />
                        <EditButton style={{ padding: 0 }} />
                    </Datagrid>
                </ReferenceManyField>
            </FormTab>
            <FormTab label="resources.customers.tabs.stats">
                <SegmentsField />
                <NullableBooleanInput source="has_newsletter" />
                <DateField source="first_seen" style={{ width: 128, display: 'inline-block' }} />
                <DateField source="latest_purchase" style={{ width: 128, display: 'inline-block' }} />
                <DateField source="last_seen" style={{ width: 128, display: 'inline-block' }} />
            </FormTab>
        </TabbedForm>
    </Edit>
);

const UserDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.customers.page.delete')}&nbsp;
    {record && <img src={`${record.avatar}?size=25x25`} width="25" alt="" />}
    {record && `${record.first_name} ${record.last_name}`}
</span>);

export const UserDelete = (props) => <Delete {...props} title={<UserDeleteTitle />} />;
*/
