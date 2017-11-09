import React from 'react'

import {
    translate,
    BooleanField,
    Create,
    Datagrid,
    DateField,
    DateInput,
    DeleteButton,
    DisabledInput,
    SingleFieldList,
    ChipField,
    EmailField,
    Filter,
    FormTab,
    List,
    LongTextInput,
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
    required,
    minLength
} from 'admin-on-rest'
import Icon from 'material-ui/svg-icons/social/person'
import RevertButton from './RevertButton'
import { chronasMainColor } from '../../../styles/chronasColors'
export const RevisionIcon = Icon

const RevisionFilter = (props) => (
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

const rowStyle = (record) => {
  console.debug("rowStylerowStylerowStylerowStyle",record)
  if (record.reverted) {
    return { backgroundColor: '#ff0001' }
  }
  else {
    return
    // return { backgroundColor: '#25ff00' }
  }
};




export const RevisionList = (props) => {
  console.debug("props is", this.props)

  const prevBodyStyle = (record) => {
    console.debug("prevBodyStyleprevBodyStyleprevBodyStyle",record)
    if (record.reverted) {
      return { color: 'green', backgroundColor: '#ff0001' }
    }
    else {
      return { color: 'red', backgroundColor: '#ff0001' }
      // return { backgroundColor: '#25ff00' }
    }
  };
  const nextStyle = (record) => (record || {}).reverted ? { color: 'green' } :  { color: 'red' }
  const prevStyle = (record) => {
    if((record || {}).reverted) { return { color: 'red' } } else {return { color: 'green' }}
  }
  return <List {...props} filters={<RevisionFilter />}  sort={{field: 'name', order: 'DESC'}} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }} rowStyle={rowStyle}>
      <TextField source="id" label="resources.revisions.fields.id" />
      <ChipField source="type" label="resources.revisions.fields.type" />
      <TextField source="entityId" label="resources.revisions.fields.entityId" />
      <ChipField source="resource" label="resources.revisions.fields.resource" />
      <TextField source="user" label="resources.revisions.fields.user" />
      <TextField source="nextBody" label="resources.revisions.fields.nextBody" style={rowStyle} />
      <TextField source="prevBody" label="resources.revisions.fields.prevBody" style={prevStyle} />
      <BooleanField source="reverted" label="resources.revisions.fields.reverted" />
      <DateField source="timestamp" label="resources.revisions.fields.timestamp" type="date" />
      <RevertButton {...props} isRedo={false} />
      <DeleteButton {...props} />
    </Datagrid>
  </List>
};

export const RevisionEdit = (props) => {
  return <Edit title={<span>RevisionEdit</span>} {...props}>
    <SimpleForm>
      <TextInput source="name" label="resources.revisions.fields.name" />
      <TextInput source="id" label="resources.revisions.fields.url" validation={{ id: true }} />
      <TextInput source="geo[0]" label="resources.revisions.fields.lat" />
      <TextInput source="geo[1]" label="resources.revisions.fields.lng" />
      <TextInput source="type" label="resources.revisions.fields.type" />
      <TextInput source="subtype" label="resources.revisions.fields.subtype" />
      <DateInput source="lastUpdated" label="resources.revisions.fields.lastUpdated" type="date" />
      <NumberInput source="startYear" label="resources.revisions.fields.startYear" type="date" />
      <NumberInput source="endYear" label="resources.revisions.fields.endYear" />
      <DateInput source="date" label="resources.revisions.fields.date" type="date" />
      <NumberInput source="rating" label="resources.revisions.fields.rating" style={{ width: '5em', color: chronasMainColor }} />
    </SimpleForm>
  </Edit>}

export const RevisionCreate = (props) => {
  return <Create {...props}>
    <SimpleForm>
      <TextInput source="name" label="resources.revisions.fields.name" />
      <TextInput source="wiki" label="resources.revisions.fields.url" validate={required} />
      <NumberInput source="geo[0]" label="resources.revisions.fields.lat" />
      <NumberInput source="geo[1]" label="resources.revisions.fields.lng" />
      <TextInput source="type" label="resources.revisions.fields.type" />
      <TextInput source="subtype" label="resources.revisions.fields.subtype" />
      <DateInput source="lastUpdated" label="resources.revisions.fields.lastUpdated" type="date" />
      <NumberInput source="startYear" label="resources.revisions.fields.startYear" type="date" />
      <NumberInput source="endYear" label="resources.revisions.fields.endYear" />
      <DateInput source="date" label="resources.revisions.fields.date" type="date" />
      <NumberInput source="rating" label="resources.revisions.fields.rating" style={{ width: '5em', color: chronasMainColor }} />
    </SimpleForm>
  </Create>
};

const RevisionDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.page.delete')}&nbsp;
    {record && `${record.id}`}
</span>);

export const RevisionDelete = (props) => <Delete {...props} title={<RevisionDeleteTitle />} />;

