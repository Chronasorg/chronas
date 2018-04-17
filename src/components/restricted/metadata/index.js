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
    List,
    LongTextInput,
    Edit,
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
    required,
    minLength
} from 'admin-on-rest'
import Icon from 'material-ui/svg-icons/social/person'
import EditButton from '../shared/buttons/EditButton'
import Delete from '../shared/crudComponents/Delete'
import { chronasMainColor } from '../../../styles/chronasColors'
import ArrayField from './ArrayField'
export const MetadataIcon = Icon

const MetadataFilter = (props) => (
    <Filter {...props}>
        <TextInput label="pos.search" source="q" alwaysOn />
        <DateInput source="last_seen_gte" />
    </Filter>
);

const colored = WrappedComponent => props => props.record[props.source] > 500 ?
    <span style={{ color: 'red' }}><WrappedComponent {...props} /></span> :
    <WrappedComponent {...props} />;

const ColoredNumberField = colored(NumberField);
ColoredNumberField.defaultProps = NumberField.defaultProps;

export const MetadataList = (props) => {
  return <List {...props} filters={<MetadataFilter />}  sort={{field: '_id', order: 'DESC'}} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source="id" label="resources.metadata.fields._id" />
      <TextField source="data" label="resources.metadata.fields.data" />
      <EditButton />
    </Datagrid>
  </List>
};

export const MetadataEdit = (props) => {
  return <Edit title={<span>MetadataEdit</span>} {...props}>
    <SimpleForm>
      <TextInput source="_id" label="resources.metadata.fields._id" validation={required} />
      <TextInput source="data" label="resources.metadata.fields.data" validation={required} />
    </SimpleForm>
  </Edit>}

export const MetadataCreate = (props) => {
  return <Create {...props}>
    <SimpleForm redirect="list">
      <TextInput source="_id" label="resources.metadata.fields._id" validation={required} />
      <TextInput source="data" label="resources.metadata.fields.data" validation={required} />
    </SimpleForm>
  </Create>
};

const MetadataDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.page.delete')}&nbsp;
    {record && `${record.id}`}
</span>);

export const MetadataDelete = (props) => <Delete {...props} title={<MetadataDeleteTitle />} />;

