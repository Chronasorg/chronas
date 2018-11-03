import React from 'react'
import {
  AutocompleteInput,
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
    BooleanInput,
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
import { EmbeddedArrayInput } from 'aor-embedded-array'
import AddEditLinkNavigation from '../../restricted/shared/AddEditLinkNavigation'
import Divider from 'material-ui/Divider'
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
import {epicIdNameArray, properties} from "../../../properties";

export const LinkedIcon = Icon

const validateWiki = (values) => {
  const errors = {}
  if ((values.wiki && values.wiki !==  values.wiki.indexOf('.wikipedia.org/wiki/') === -1)) {
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

export const isNotAnImage = (urlPre) => {
  const url = urlPre.toLowerCase()
  return (url.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg)$/) === null)
}

export const isNotAnVideo = (urlPre) => {
  const url = urlPre.toLowerCase()

  if (url.indexOf("youtube") > -1 ||
    url.indexOf("youtu.be") > -1 ||
    url.indexOf("facebook") > -1 ||
    url.indexOf("vimeo") > -1 ||
    url.indexOf("streamable") > -1 ||
    url.indexOf("wistia") > -1 ||
    url.indexOf("dailymotion") > -1) return false

  return (url.toLowerCase().match(/\.(mp4|ogv|webm|png|svg)$/) === null)
}

export const isNotAnAudio = (urlPre) => {
  const url = urlPre.toLowerCase()

  if (url.indexOf("soundcloud") > -1 ||
    url.indexOf("mixcloud") > -1) return false

  return (url.toLowerCase().match(/\.(mp3)$/) === null)
}

export const LinkedEdit = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}
    const initWiki = props.selectedItem.value.wiki || ((props.selectedItem || {}).data || {}).wiki || ''
    if ((values.wiki && values.wiki !== initWiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && (initWiki !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }
    return errors
  }

  const postType = props.contentTypeRaw || ((props.selectedItem || {}).data || {}).subtype
  const isEpic = /*props.contentTypeRaw === */epicIdNameArray.map(el => el[0]).includes(postType)

  // if (!isEpic && ((props.selectedItem.data || {})._id || "").substr(0, 2) === "e_") {
  //   props.actOnRootTypeChange("e")
  // }

  const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: props.metadata['ruler'][rulerId][0]}
  }) || {}

  let epicDefaults
  if (isEpic) {
    const selectedData = props.selectedItem.data
    epicDefaults = {
      subtype: selectedData.subtype,
      type: selectedData.type,
      src: selectedData._id,
      attacker: ((selectedData.data || {}).participants || [])[0].map(el => {return { name: el }}),
      defender: ((selectedData.data || {}).participants || [])[1].map(el => {return { name: el }}),
      description: (selectedData.data || {}).title,
      poster: (selectedData.data || {}).poster,
      wiki: selectedData.wiki,
      year: selectedData.year,
      end: (selectedData.data || {}).end,
    }
  }

  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Edit Article'} {...props}>
    <LinkedForm validate={validateWikiProps} defaultValue={epicDefaults || props.selectedItem.value} history={props.history} redirect='edit'>
      <SelectInput onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='subtype' choices={properties.linkedTypes} label='resources.linked.fields.type' defaultValue={props.selectedItem.value.subtype} />

      {isEpic && <AutocompleteInput options={{ fullWidth: true }} source="select" choices={props.epicsChoice} onSearchChange={(val) => { return props.setSearchEpic(val) }} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.search_name" />}

      {/*{isEpic && <SelectInput onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='type' choices={properties.linkedTypes} label='resources.linked.fields.type' defaultValue={props.selectedItem.value.subtype} /> }*/}
      <DisabledInput source='src' defaultValue={props.selectedItem.value.src || ''} label='resources.linked.fields.src' />
      {isEpic && <EmbeddedArrayInput options={{ fullWidth: true }} source='attacker'>
        <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler} label='resources.areas.fields.attacker' />
      </EmbeddedArrayInput> }
      {isEpic && <EmbeddedArrayInput options={{ fullWidth: true }} source='defender'>
        <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler} label='resources.areas.fields.defender' />
      </EmbeddedArrayInput> }
      <LongTextInput source='description' label='resources.linked.fields.description' defaultValue={props.selectedItem.value.title || (props.selectedItem.value.data || {}).title || ''} />
      { !isEpic && <LongTextInput source='source' label='resources.linked.fields.source' type='url' defaultValue={props.selectedItem.value.source || ''} />}
      <LongTextInput source='poster' label='resources.linked.fields.poster' type='url' defaultValue={(props.selectedItem.value.data || {}).poster || ''} />
      <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url' defaultValue={props.selectedItem.value.wiki || ''} />
      {/*<h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4>*/}
      <NumberInput style={ isEpic ? { width: '50%', float: 'left' } : {}} validate={required} defaultValue={props.selectedItem.value.year || props.selectedItem.value.subtitle} source='year' label='resources.linked.fields.year' type='number' />
      { isEpic && <NumberInput style={{ width: '50%', float: 'right' }} source="end" defaultValue={(props.selectedItem.value.data || {}).end || props.selectedItem.value.year || props.selectedItem.value.subtitle} label="resources.areas.fields.endYear" /> }
      { !isEpic && <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />}
      { !isEpic && <NumberInput style={{ width: '30%', float: 'left' }} onChange={(val, v) => { props.setModDataLng(+v) }} defaultValue={(props.selectedItem.value.coo || {})[0] || ''} source='coo[0]' label='resources.markers.fields.lat' />}
      { !isEpic && <NumberInput style={{ width: '30%', float: 'right' }} onChange={(val, v) => { props.setModDataLat(+v) }} defaultValue={(props.selectedItem.value.coo || {})[1] || ''} source='coo[1]' label='resources.markers.fields.lng' />}
      { !isEpic && <LongTextInput source='geojson' label='resources.linked.fields.geojson' defaultValue={props.selectedItem.value.geojson || ''} />}
      { !isEpic && <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent' defaultValue={props.selectedItem.value.type === '0'} />}
      <DeleteButton id={encodeURIComponent((epicDefaults || {}).src || props.selectedItem.value.src)} {...props} />
    </LinkedForm>
    </Create>
  </div>
}

export const LinkedCreate = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}

    if (values.subtype === 'artefacts' &&
      values.subtype === 'battles' &&
      values.subtype === 'cities' &&
      values.subtype === 'people' &&
      values.subtype === 'misc' &&
      isNotAnImage(values.src || '')) {
      errors.src = ['This URL must lead to an image']
    } else if (values.subtype === 'v' &&
      isNotAnVideo(values.src || '')) {
      errors.src = ['This URL must lead to a video']
    } else if (values.subtype === 'audios' &&
      isNotAnAudio(values.src || '')) {
      errors.src = ['This URL must lead to an audio']
    }

    if (values.src === '' && values.subtype !== 'html') {
      errors.src = ['This field is required for all but html entities']
    }

    if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki)) {
      errors.wiki = ['This URL must to be a full Wikipedia URL']
    }

    return errors
  }

  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider/>
    <Create title={'Add Article'} {...props}>
    <LinkedForm validate={validateWikiProps} redirect='' history={props.history}>
      <SelectInput  onChange={(val, v) => { props.actOnRootTypeChange(v) }} validate={required} source='subtype' choices={properties.linkedTypes} label='resources.linked.fields.subtype' />
      <LongTextInput source='src' type='url' label='resources.linked.fields.src' />
      <LongTextInput validate={required} source='description' label='resources.linked.fields.description' />
      <LongTextInput source='content' label='resources.linked.fields.content' />
      <LongTextInput source='source' label='resources.linked.fields.source' type='url' />
      <LongTextInput source='poster' label='resources.linked.fields.poster' type='url' />
      <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url' />
      {/*<h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4>*/}
      <NumberInput validate={required} defaultValue={props.selectedYear || ''} source='year' label='resources.linked.fields.year' type='number' />
      <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />
      <NumberInput style={{ width: '30%', float: 'left' }} onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' />
      <NumberInput style={{ width: '30%', float: 'right' }} onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' />
      <LongTextInput source='geojson' label='resources.linked.fields.geojson' />
      <BooleanInput label="resources.linked.fields.onlyEpicContent" source="onlyEpicContent" defaultValue={false} />
    </LinkedForm>
    </Create>
  </div>
}

const LinkedDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const LinkedDelete = (props) => <Delete {...props} title={<LinkedDeleteTitle />} />
