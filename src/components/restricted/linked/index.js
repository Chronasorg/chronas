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
import LinkedForm from '../shared/forms/LinkedForm'
import { TYPE_LINKED } from '../../map/actionReducers'

export const LinkedIcon = Icon

const linkedTypes = [
  { name: 'People -> Military', id: 'military' },
  { name: 'People -> Politicians', id: 'politicians' },
  { name: 'People -> Explorers', id: 'explorers' },
  { name: 'People -> Scientists', id: 'scientists' },
  { name: 'People -> Artists', id: 'artists' },
  { name: 'People -> Religious', id: 'religious' },
  { name: 'People -> Athletes', id: 'athletes' },
  { name: 'People -> Unclassified', id: 'unclassified' },
  { name: 'Cities -> Cities', id: 'cities' },
  { name: 'Cities -> Castles', id: 'castles' },
  { name: 'Battles -> Battles', id: 'battles' },
  { name: 'Battles -> Sieges', id: 'sieges' },
  { name: 'People -> Artifacts', id: 'artifacts' },
  { name: 'Other -> Area Info', id: 'areainfo' },
  { name: 'Other -> Unknown', id: 'unknown' },
]

const validateWiki = (values) => {
  const errors = {}
  if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1))// && ((this.props.selectedItem.value || {}).w !== values.wiki)) {
  {
    errors.wiki = ['The URL needs to be a full Wikipedia URL']
  }
  return errors
}

const LinkedFilter = (props) => (
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

export const LinkedList = (props) => {
  return <List {...props} filters={<LinkedFilter />} sort={{ field: 'name', order: 'DESC' }} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source='name' label='resources.linked.fields.name' />
      <UrlField source='id' label='resources.linked.fields.url' />
      <ArrayField source='coo' label='resources.linked.fields.coo' />
      <ChipField source='type' label='resources.linked.fields.type' />
      <NumberField source='year' label='resources.linked.fields.year' />
      <EditButton />
    </Datagrid>
  </List>
}

export const LinkedEdit = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}
    if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }
    return errors
  }

  console.debug(props)
  return <Create title={<span>LinkedEdit</span>} {...props}>
    {(props.selectedItem.value !== '' && props.selectedItem.type === TYPE_LINKED) ? <LinkedForm validate={validateWikiProps} history={props.history} redirect='edit'>
      <TextInput source='name' defaultValue={props.selectedItem.value.n} label='resources.linked.fields.name' />
      <DisabledInput source='wiki' defaultValue={props.selectedItem.value.w} label='resources.linked.fields.url' />
      <ModButton modType='linked' />
      <TextInput source='coo[0]' onChange={(val, v) => { props.setModDataLng(+v) }} defaultValue={props.selectedItem.value.coo[0]} label='resources.linked.fields.lat' />
      <TextInput source='coo[1]' onChange={(val, v) => { props.setModDataLat(+v) }} defaultValue={props.selectedItem.value.coo[1]} label='resources.linked.fields.lng' />
      <SelectInput source='type' validate={required} defaultValue={props.selectedItem.value.t} choices={linkedTypes} label='resources.linked.fields.type' />
      <NumberInput validate={required} defaultValue={props.selectedItem.value.y} source='year' label='resources.linked.fields.year' type='number' />
      <DeleteButton resource='linked' id={props.selectedItem.value.w} {...props} />
    </LinkedForm> : <LinkedForm hidesavebutton><h4>click on linked on the map which you like to modify</h4></LinkedForm>}
  </Create>
}

export const LinkedCreate = (props) => {
  return <Create {...props}>
    <LinkedForm validate={validateWiki} redirect='' history={props.history}>
      <TextInput validate={required} source='name' label='resources.linked.fields.name' />
      <TextInput validate={required} source='wiki' label='resources.linked.fields.url' type='url' />
      <ModButton modType='linked' />
      <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.linked.fields.lat' />
      <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.linked.fields.lng' />
      <SelectInput source='type' validate={required} choices={linkedTypes} label='resources.linked.fields.type' />
      <NumberInput source='year' label='resources.linked.fields.year' />
    </LinkedForm>
  </Create>
}

const LinkedDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const LinkedDelete = (props) => <Delete {...props} title={<LinkedDeleteTitle />} />
