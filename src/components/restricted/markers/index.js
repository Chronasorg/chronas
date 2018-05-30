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
    SelectInput,
    SimpleForm,
    TabbedForm,
    TextField,
    TextInput,
    required,
    minLength
} from 'admin-on-rest'
import Icon from 'material-ui/svg-icons/social/person'
import EditButton from '../shared/buttons/EditButton'
import DeleteButton from '../shared/buttons/DeleteButton'
import Delete from '../shared/crudComponents/Delete'
import ModGeoInput from '../shared/inputs/ModGeoInput'
import ModButton from '../shared/buttons/ModButton'
import { chronasMainColor } from '../../../styles/chronasColors'
import ArrayField from './ArrayField'
import MarkerForm from '../shared/forms/MarkerForm'
import { TYPE_MARKER } from '../../map/actionReducers'

export const MarkerIcon = Icon

const markerTypes = [
  { name: 'Artifacts', id: 'artifacts' },
  { name: 'Battles -> Battles', id: 'battles' },
  { name: 'Battles -> Sieges', id: 'sieges' },
  { name: 'Cities -> Cities', id: 'cities' },
  { name: 'Cities -> Castles', id: 'castles' },
  { name: 'People -> Military', id: 'military' },
  { name: 'People -> Politicians', id: 'politicians' },
  { name: 'People -> Explorers', id: 'explorers' },
  { name: 'People -> Scientists', id: 'scientists' },
  { name: 'People -> Artists', id: 'artists' },
  { name: 'People -> Religious', id: 'religious' },
  { name: 'People -> Athletes', id: 'athletes' },
  { name: 'People -> Unclassified', id: 'unclassified' },
  { name: 'Other -> Area Info', id: 'areainfo' },
  { name: 'Other -> Unknown', id: 'unknown' },
]
//
// const validateWiki = (value) => {
//   if (value && value.indexOf('.wikipedia.org/wiki/') === -1) {
//     return "The URL needs to be a full Wikipedia URL"
//   }
//   return [];
// }

const validateWiki = (values) => {
  const errors = {}
  if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1))// && ((this.props.selectedItem.value || {}).w !== values.wiki)) {
  {
    errors.wiki = ['The URL needs to be a full Wikipedia URL']
  }
  return errors
}

const MarkerFilter = (props) => (
  <Filter {...props}>
    <TextInput label='pos.search' source='q' alwaysOn />
    <DateInput source='last_seen_gte' />
  </Filter>
)

const colored = WrappedComponent => props => props.record[props.source] > 500
    ? <span style={{ color: 'red' }}><WrappedComponent {...props} /></span>
    : <WrappedComponent {...props} />

const ColoredNumberField = colored(NumberField)
ColoredNumberField.defaultProps = NumberField.defaultProps

export const MarkerList = (props) => {
  return <List {...props} filters={<MarkerFilter />} sort={{ field: 'name', order: 'DESC' }} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source='name' label='resources.markers.fields.name' />
      <UrlField source='id' label='resources.markers.fields.url' />
      <ArrayField source='coo' label='resources.markers.fields.coo' />
      <ChipField source='type' label='resources.markers.fields.type' />
      <NumberField source='year' label='resources.markers.fields.year' />
      <EditButton />
    </Datagrid>
  </List>
}

export const MarkerEdit = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}
    if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }
    return errors
  }

  console.debug(props)
  return <Create title={<span>MarkerEdit</span>} {...props}>
    {(props.selectedItem.value !== '' && props.selectedItem.type === TYPE_MARKER) ? <MarkerForm validate={validateWikiProps} history={props.history} redirect='edit'>
      <TextInput source='name' defaultValue={props.selectedItem.value.n} label='resources.markers.fields.name' />
      <DisabledInput source='wiki' defaultValue={props.selectedItem.value.w} label='resources.markers.fields.url' />
      <ModButton modType='marker' />
      <TextInput source='coo[0]' onChange={(val, v) => { props.setModDataLng(+v) }} defaultValue={props.selectedItem.value.coo[0]} label='resources.markers.fields.lat' />
      <TextInput source='coo[1]' onChange={(val, v) => { props.setModDataLat(+v) }} defaultValue={props.selectedItem.value.coo[1]} label='resources.markers.fields.lng' />
      <SelectInput source='type' validate={required} defaultValue={props.selectedItem.value.t} choices={markerTypes} label='resources.markers.fields.type' />
      <NumberInput validate={required} defaultValue={props.selectedItem.value.y} source='year' label='resources.markers.fields.year' type='number' />
      <DeleteButton resource='markers' id={props.selectedItem.value.w} {...props} />
    </MarkerForm> : <MarkerForm hidesavebutton><h4>click on marker on the map which you like to modify</h4></MarkerForm>}
  </Create>
}

export const MarkerCreate = (props) => {
  return <Create {...props}>
    <MarkerForm validate={validateWiki} redirect='' history={props.history}>
      <TextInput validate={required} source='name' label='resources.markers.fields.name' />
      <TextInput validate={required} source='wiki' label='resources.markers.fields.url' type='url' />
      <ModButton modType='marker' />
      <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' />
      <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' />
      <SelectInput source='type' validate={required} choices={markerTypes} label='resources.markers.fields.type' />
      <NumberInput source='year' label='resources.markers.fields.year' />
    </MarkerForm>
  </Create>
}

const MarkerDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const MarkerDelete = (props) => <Delete {...props} title={<MarkerDeleteTitle />} />
