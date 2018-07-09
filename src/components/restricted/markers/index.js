import React from 'react'
import {
    translate,
    BooleanField,
    BooleanInput,
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
  { name: '[Audio]', id: 'meta_audio' },
  { name: '[Epic]', id: 'meta_epic' },
  { name: '[External Article or Primary Source]', id: 'meta_text' },
  { name: '[HTML or Text]', id: 'html' },
  { name: '[Image] Artefact', id: 'artefacts' },
  { name: '[Image] Battle', id: 'battles' },
  { name: '[Image] City & Building', id: 'cities' },
  { name: '[Image] Person', id: 'people' },
  { name: '[Image] Other', id: 'misc' },
  { name: '[Podcast & Audio]', id: 'audios' },
  { name: '[Primary Source]', id: 'ps' },
  { name: '[Story]', id: 'meta_story' },
  { name: '[Video]', id: 'meta_video' },
  { name: '[Wiki Article] Artifacts', id: 'm_artifacts' },
  { name: '[Wiki Article] Battles -> Battles', id: 'm_battles' },
  { name: '[Wiki Article] Battles -> Sieges', id: 'm_sieges' },
  { name: '[Wiki Article] Cities -> Cities', id: 'm_cities' },
  { name: '[Wiki Article] Cities -> Castles', id: 'm_castles' },
  { name: '[Wiki Article] People -> Military', id: 'm_military' },
  { name: '[Wiki Article] People -> Politicians', id: 'politicians' },
  { name: '[Wiki Article] People -> Explorers', id: 'm_explorers' },
  { name: '[Wiki Article] People -> Scientists', id: 'm_scientists' },
  { name: '[Wiki Article] People -> Artists', id: 'm_artists' },
  { name: '[Wiki Article] People -> Religious', id: 'm_religious' },
  { name: '[Wiki Article] People -> Athletes', id: 'm_athletes' },
  { name: '[Wiki Article] People -> Unclassified', id: 'm_unclassified' },
  { name: '[Wiki Article] Other -> Area Info', id: 'm_areainfo' },
  { name: '[Wiki Article] Other -> Unknown', id: 'm_unknown' },
  { name: 'Other', id: 'meta_other' }
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

  return <Create title={'Edit Article'}  {...props}>
    {(props.selectedItem.value !== '' && props.selectedItem.type === TYPE_MARKER) ? <MarkerForm validate={validateWikiProps} history={props.history} redirect='edit'>
      <SelectInput onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='type' validate={required} defaultValue={props.selectedItem.value.t} choices={markerTypes} label='resources.markers.fields.type' />
      <TextInput source='name' defaultValue={props.selectedItem.value.name} label='resources.markers.fields.name' />
      <DisabledInput source='wiki' defaultValue={props.selectedItem.value.wiki} label='resources.markers.fields.url' />
      <ModButton modType='marker' />
      <TextInput source='coo[0]' onChange={(val, v) => { props.setModDataLng(+v) }} defaultValue={props.selectedItem.value.coo[0]} label='resources.markers.fields.lat' />
      <TextInput source='coo[1]' onChange={(val, v) => { props.setModDataLat(+v) }} defaultValue={props.selectedItem.value.coo[1]} label='resources.markers.fields.lng' />
      <NumberInput validate={required} defaultValue={props.selectedItem.value.year} source='year' label='resources.markers.fields.year' type='number' />
      <LongTextInput source='geojson' label='resources.linked.fields.geojson' defaultValue={props.selectedItem.value.geojson || ''} />
      <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent' defaultValue={props.selectedItem.value.type === '0'} />
      <DeleteButton resource='markers' id={props.selectedItem.value.wiki} {...props} />
    </MarkerForm> : <MarkerForm hidesavebutton>
      <SelectInput onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='type' validate={required} defaultValue={props.selectedItem.value.t} choices={markerTypes} label='resources.markers.fields.type' />
      <h4>click on marker on the map which you like to modify</h4></MarkerForm>}
  </Create>
}

export const MarkerCreate = (props) => {
  return <Create title={'Create Article'} {...props}>
    <MarkerForm validate={validateWiki} redirect='' history={props.history}>
      <SelectInput onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='type' validate={required} choices={markerTypes} label='resources.markers.fields.type' />
      <TextInput validate={required} source='name' label='resources.markers.fields.name' />
      <TextInput validate={required} source='wiki' label='resources.markers.fields.url' type='url' />
      <ModButton modType='marker' />
      <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' />
      <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' />
      <NumberInput source='year' label='resources.markers.fields.year' />
      <LongTextInput source='geojson' label='resources.linked.fields.geojson' />
      <BooleanInput label="resources.linked.fields.onlyEpicContent" source="onlyEpicContent" defaultValue={false} />
    </MarkerForm>
  </Create>
}

const MarkerDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const MarkerDelete = (props) => <Delete {...props} title={<MarkerDeleteTitle />} />
