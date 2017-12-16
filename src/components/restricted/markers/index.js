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
import EditButton from '../shared/buttons/EditButton'
import ModGeoInput from '../shared/inputs/ModGeoInput'
import ModButton from '../shared/buttons/ModButton'
import { chronasMainColor } from '../../../styles/chronasColors'
import ArrayField from './ArrayField'
import MarkerForm from '../shared/forms/MarkerForm'
export const MarkerIcon = Icon

const MarkerFilter = (props) => (
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

export const MarkerList = (props) => {
  return <List {...props} filters={<MarkerFilter />}  sort={{field: 'name', order: 'DESC'}} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source="name" label="resources.markers.fields.name" />
      <UrlField source="id" label="resources.markers.fields.url" />
      <ArrayField source="geo" label="resources.markers.fields.geo" />
      <ChipField source="type" label="resources.markers.fields.type" />
      <ChipField source="subtype" label="resources.markers.fields.subtype" />
      <DateField source="lastUpdated" label="resources.markers.fields.lastUpdated" type="date" />
      <NumberField source="startYear" label="resources.markers.fields.startYear" type="date" />
      <NumberField source="endYear" label="resources.markers.fields.endYear" />
      <DateField source="date" label="resources.markers.fields.date" type="date" />
      <NumberField source="rating" label="resources.markers.fields.rating" style={{ color: chronasMainColor }} />
      <EditButton />
    </Datagrid>
  </List>
};

export const MarkerEdit = (props) => {
  console.debug(props)
  return <Edit title={<span>MarkerEdit</span>} {...props}>
    <SimpleForm>
      <TextInput source="name" label="resources.markers.fields.name" />
      <TextInput source="id" label="resources.markers.fields.url" validation={{ id: true }} />
      <TextInput source="geo[0]" label="resources.markers.fields.lat" />
      <TextInput source="geo[1]" label="resources.markers.fields.lng" />
      <TextInput source="type" label="resources.markers.fields.type" />
      <TextInput source="subtype" label="resources.markers.fields.subtype" />
      <DateInput source="lastUpdated" label="resources.markers.fields.lastUpdated" type="date" />
      <NumberInput source="startYear" label="resources.markers.fields.startYear" type="date" />
      <NumberInput source="endYear" label="resources.markers.fields.endYear" />
      <DateInput source="date" label="resources.markers.fields.date" type="date" />
      <NumberInput source="rating" label="resources.markers.fields.rating" style={{ width: '5em', color: chronasMainColor }} />
    </SimpleForm>
  </Edit>}

export const MarkerCreate = (props) => {
  return <Create {...props}>
    <MarkerForm redirect="list">
      <TextInput source="name" label="resources.markers.fields.name" />
      <TextInput source="wiki" label="resources.markers.fields.url" validate={required} />
      <ModButton modType="marker" />
      <NumberInput onChange={(val,v) => { props.setModDataLng(+v)}} source="geo[0]" label="resources.markers.fields.lat" />
      <NumberInput onChange={(val,v) => { props.setModDataLat(+v)}} source="geo[1]" label="resources.markers.fields.lng" />
      <TextInput source="type" validate={required} label="resources.markers.fields.type" />
      <TextInput source="subtype" label="resources.markers.fields.subtype" />
      <DateInput source="lastUpdated" label="resources.markers.fields.lastUpdated" type="date" />
      <NumberInput source="startYear" label="resources.markers.fields.startYear" type="date" />
      <NumberInput source="endYear" label="resources.markers.fields.endYear" />
      <DateInput source="date" label="resources.markers.fields.date" type="date" />
      <NumberInput source="rating" label="resources.markers.fields.rating" style={{ width: '5em', color: chronasMainColor }} />
    </MarkerForm>
  </Create>
};

const MarkerDeleteTitle = translate(({ record, translate }) => <span>
    {translate('resources.page.delete')}&nbsp;
    {record && `${record.id}`}
</span>);

export const MarkerDelete = (props) => <Delete {...props} title={<MarkerDeleteTitle />} />;

