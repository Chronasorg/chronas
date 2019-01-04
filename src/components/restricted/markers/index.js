import React from 'react'

import {
  BooleanField,
  BooleanInput,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
  List,
  LongTextInput,
  minLength,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceArrayField,
  ReferenceManyField,
  required,
  SelectInput,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  translate,
  UrlField
} from 'admin-on-rest'

import Icon from 'material-ui/svg-icons/social/person'
import EditButton from '../shared/buttons/EditButton'
import DeleteButton from '../shared/buttons/DeleteButton'
import Divider from 'material-ui/Divider'
import { EmbeddedArrayInput } from 'aor-embedded-array'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import Delete from '../shared/crudComponents/Delete'
import ModButton from '../shared/buttons/ModButton'
import AddEditLinkNavigation from '../../restricted/shared/AddEditLinkNavigation'
import ArrayField from './ArrayField'
import MarkerForm from '../shared/forms/MarkerForm'
import { TYPE_MARKER } from '../../map/actionReducers'
import { properties } from '../../../properties'

export const MarkerIcon = Icon

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
  const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: props.metadata['ruler'][rulerId][0] }
  }) || {}

  let defaultObj = {}
  const cIndex = ((props.selectedItem || {}).data || {}).contentIndex
  const contentArr = ((props.selectedItem || {}).data || {}).content
  const isContent = contentArr &&
    typeof cIndex !== 'undefined' &&
    ((contentArr[cIndex] || {}).properties || {}).ct === 'marker'

  const validateWikiProps = (values) => {
    const errors = {}
    if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki) && (((contentArr[cIndex] || {}).properties || {}).w !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }
    return errors
  }

  if (isContent) {
    const potData = ((contentArr[cIndex] || {}).properties || {})
    defaultObj = {
      '_id': potData.w,
      'wiki': potData.w,
      'subtype': potData.t,
      'name': potData.n,
      'coo': ((contentArr[cIndex] || {}).geometry || {}).coordinates,
      'type': 'w',
      'year': potData.y,
    }
  } else {
    defaultObj = {
      ...props.selectedItem.value,
      capital: (props.selectedItem.value.capital || []).map((el) => {
        return { capitalStart: el[0], capitalEnd: el[1], capitalOwner: el[2] }
      })
    }
  }

  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Edit Article'} {...props}>
      {((props.selectedItem.value !== '' && props.selectedItem.type === TYPE_MARKER) || isContent)
        ? <MarkerForm validate={validateWikiProps} history={props.history} redirect='edit' defaultValue={defaultObj}>
          <SelectInput options={{ fullWidth: true }} onChange={(val, v) => {
            props.actOnRootTypeChange(v)
          }} source='type' validate={required}
            defaultValue={props.selectedItem.value.type ? (props.selectedItem.value.type + '|' + props.selectedItem.value.subtype) : (defaultObj.type) ? (defaultObj.type + '|' + defaultObj.subtype) : ''}
            choices={properties.linkedTypes} label='resources.markers.fields.type' />
          <TextInput options={{ fullWidth: true }} source='name' defaultValue={props.selectedItem.value.name}
            label='resources.markers.fields.name' />
          <TextInput options={{ fullWidth: true }} source='wiki'
            defaultValue={'https://en.wikipedia.org/wiki/' + (props.selectedItem.value._id || defaultObj.wiki)}
            label='resources.markers.fields.url' type='url' />
          <ModButton style={{ width: '30%', float: 'left' }} modType='marker' />
          <TextInput style={{ width: '30%', float: 'left' }} source='coo[0]' onChange={(val, v) => {
            props.setModDataLng(+v)
          }} defaultValue={(props.selectedItem.value.coo || {})[0]} label='resources.markers.fields.lat' />
          <TextInput style={{ width: '30%', float: 'right' }} source='coo[1]' onChange={(val, v) => {
            props.setModDataLat(+v)
          }} defaultValue={(props.selectedItem.value.coo || {})[1]} label='resources.markers.fields.lng' />
          <NumberInput options={{ fullWidth: true }} validate={required} defaultValue={props.selectedItem.value.year}
            source='year' label='resources.markers.fields.year' type='number' />
          <LongTextInput options={{ fullWidth: true }} source='geojson' label='resources.linked.fields.geojson'
            defaultValue={props.selectedItem.value.geojson || ''} />
          <EmbeddedArrayInput options={{ fullWidth: true }} source='capital'>
            <NumberInput options={{ width: '30%', float: 'right' }} label='resources.markers.fields.capitalStart'
              type='number' source='capitalStart' />
            <NumberInput options={{ fwidth: '30%', float: 'right' }} label='resources.markers.fields.capitalEnd'
              type='number' source='capitalEnd' />
            <AutocompleteInput options={{ fwidth: '30%', float: 'right' }} choices={choicesRuler}
              label='resources.areas.fields.capitalOwner' source='capitalOwner' />
          </EmbeddedArrayInput>
          <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent'
            defaultValue={props.selectedItem.value.type === '0'} />
          <DeleteButton resource='markers' id={props.selectedItem.value._id || defaultObj.wiki} {...props} />
        </MarkerForm> : <MarkerForm hidesavebutton>
          <SelectInput onChange={(val, v) => {
            props.actOnRootTypeChange(v)
          }} source='type' validate={required} defaultValue={props.selectedItem.value.type}
            choices={properties.linkedTypes} label='resources.markers.fields.type' />
          <h4>click on marker on the map which you like to modify</h4></MarkerForm>}
    </Create></div>
}

export const MarkerCreate = (props) => {
  const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: props.metadata['ruler'][rulerId][0] }
  }) || {}
  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Create Article'} {...props}>
      <MarkerForm validate={validateWiki} redirect='' history={props.history}>
        <SelectInput options={{ fullWidth: true }} onChange={(val, v) => {
          props.actOnRootTypeChange(v)
        }} source='type' validate={required} choices={properties.linkedTypes} label='resources.markers.fields.type' />
        <TextInput options={{ fullWidth: true }} validate={required} source='name' label='resources.markers.fields.name' />
        <TextInput options={{ fullWidth: true }} validate={required} source='wiki' label='resources.markers.fields.url'
          type='url' />
        <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />
        <NumberInput style={{ width: '30%', float: 'left' }} onChange={(val, v) => {
          props.setModDataLng(+v)
        }} source='coo[0]' label='resources.markers.fields.lat' />
        <NumberInput style={{ width: '30%', float: 'right' }} onChange={(val, v) => {
          props.setModDataLat(+v)
        }} source='coo[1]' label='resources.markers.fields.lng' />
        <NumberInput source='year' label='resources.markers.fields.year' />
        <LongTextInput options={{ fullWidth: true }} source='geojson' label='resources.linked.fields.geojson' />
        <EmbeddedArrayInput options={{ fullWidth: true }} source='capital'>
          <NumberInput options={{ width: '30%', float: 'right' }} label='resources.markers.fields.capitalStart'
            type='number' source='capitalStart' />
          <NumberInput options={{ fwidth: '30%', float: 'right' }} label='resources.markers.fields.capitalEnd'
            type='number' source='capitalEnd' />
          <AutocompleteInput options={{ fwidth: '30%', float: 'right' }} choices={choicesRuler}
            label='resources.areas.fields.capitalOwner' source='capitalOwner' />
        </EmbeddedArrayInput>
        <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent' defaultValue={false} />
      </MarkerForm>
    </Create></div>
}

const MarkerDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const MarkerDelete = (props) => <Delete {...props} title={<MarkerDeleteTitle />} />
