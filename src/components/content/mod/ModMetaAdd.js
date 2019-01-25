import React from 'react'
import {
  BooleanField,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
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
import { EmbeddedArrayInput } from 'aor-embedded-array'
import Divider from 'material-ui/Divider'
import AssignAddEditNavigation from '../../restricted/shared/AssignAddEditNavigation'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import MetaForm from '../../restricted/shared/forms/MetaForm'
import ModButton from '../../restricted/shared/buttons/ModButton'
import ColorInput from 'aor-color-input'
import AutocompleteDisallowInput from '../../restricted/shared/inputs/AutocompleteDisallowInput'
import { epicIdNameArray } from '../../../properties'

export const ModMetaAdd = (props) => {
  const { metadata } = props
  const selectedProvince = (props.selectedItem || {}).province || ''
  const activeArea = props.activeArea || { data: {} }

  const choicesRuler = Object.keys(metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: metadata['ruler'][rulerId][0] }
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0] }
  }) || {}

  const choicesReligionGeneral = Object.keys(metadata['religionGeneral']).map((religionId) => {
    return { id: religionId, name: metadata['religionGeneral'][religionId][0] }
  }) || {}

  const choicesCulture = Object.keys(metadata['culture']).map((cultureId) => {
    return { id: cultureId, name: metadata['culture'][cultureId][0] }
  }) || {}

  // const choicesCapital = Object.keys(metadata['capital']).map((capitalId) => {
  //   return { id: capitalId, name: metadata['capital'][capitalId][0] }
  // }) || {}

  const choicesProvince = Object.keys(metadata['province']).map((capitalId) => {
    return { id: capitalId, name: metadata['province'][capitalId][0] }
  }) || {}

  const contentType = [
    { name: '[Marker] Artifacts', id: 'm_artifacts' },
    { name: '[Marker] Battles -> Battles', id: 'm_battles' },
    { name: '[Marker] Battles -> Sieges', id: 'm_sieges' },
    { name: '[Marker] Cities -> Cities', id: 'm_cities' },
    { name: '[Marker] Cities -> Castles', id: 'm_castles' },
    { name: '[Marker] People -> Military', id: 'm_military' },
    { name: '[Marker] People -> Politicians', id: 'politicians' },
    { name: '[Marker] People -> Explorers', id: 'm_explorers' },
    { name: '[Marker] People -> Scientists', id: 'm_scientists' },
    { name: '[Marker] People -> Artists', id: 'm_artists' },
    { name: '[Marker] People -> Religious', id: 'm_religious' },
    { name: '[Marker] People -> Athletes', id: 'm_athletes' },
    { name: '[Marker] People -> Unclassified', id: 'm_unclassified' },
    { name: '[Marker] Other -> Landmark', id: 'm_landmark' },
    { name: '[Marker] Other -> Unknown', id: 'm_unknown' },
    { id: 'meta_story', name: 'Story' },
    { id: 'meta_image', name: 'Image' },
    { id: 'meta_audio', name: 'Audio' },
    { id: 'meta_text', name: 'External Article or Primary Source' },
    { id: 'meta_video', name: 'Video' },
    { id: 'meta_other', name: 'Other' }
  ]

  const choicesEpicSubtypes = epicIdNameArray.map(el => {
    return { id: el[0], name: el[1] }
  })

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'religionGeneral', name: 'Religion (General)' },
    // { id: 'capital', name: 'Capital' },
    { id: 'province', name: 'Province' },
    // { id: 'e', name: 'Epic' },
  ]

  const validateValueInput = (values) => {
    const errors = {}

    if (values.url && values.url.indexOf('.wikipedia.org/wiki/') === -1) {
      errors.url = ['The URL needs to be a full Wikipedia URL']
    }
    if (values.name === '') {
      errors.name = ['This name already exists. If you like to edit an existing resource click Edit Entity on top.']
    }
    if (!values.color) {
      errors.color = ['Color value is required']
    }

    if (values.icon &&
      (values.icon.indexOf('.wikipedia.org/') === -1 && values.icon.indexOf('.wikimedia.org/') === -1)) {
      errors.icon = ["The icon URL needs to be a full wikipedia or wikimedia URL, for example: 'https://en.wikipedia.org/wiki/Battle_of_Vienna#/media/File:Chor%C4%85giew_kr%C3%B3lewska_kr%C3%B3la_Zygmunta_III_Wazy.svg'"]
    }
    return errors
  }

  const typeInputs = {
    'e':
  <MetaForm validate={validateValueInput} {...props} redirect='create'>
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} type='url' source='poster' label='resources.areas.fields.poster' />
    <AutocompleteInput options={{ fullWidth: true }} validate={required} type='text' choices={choicesEpicSubtypes}
      source='subtype' label='resources.areas.fields.subtype' />
    <TextInput options={{ fullWidth: true }} validate={required} type='number' source='start'
      label='resources.areas.fields.start' />
    <TextInput options={{ fullWidth: true }} type='number' source='end' label='resources.areas.fields.end' />
    <EmbeddedArrayInput options={{ fullWidth: true }} source='attacker'>
      <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler}
        label='resources.areas.fields.attacker' />
    </EmbeddedArrayInput>
    <EmbeddedArrayInput options={{ fullWidth: true }} source='defender'>
      <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler}
        label='resources.areas.fields.defender' />
    </EmbeddedArrayInput>
    <EmbeddedArrayInput validate={required} source='content'
      label='Content (shows up in left content column, if it doesnt exist yet, you can create _media/ others_ and _markers_ to be added here)'>
      <SelectInput validate={required} source='contentType' choices={contentType} onChange={(val, v) => {
        props.setContentType(v)
      }} defaultValue={props.contentType} />
      <AutocompleteInput options={{ fullWidth: true }} validate={required} source='name' choices={props.contentChoice}
        label='resources.areas.fields.participant' onSearchChange={(val) => {
          return props.setSearchSnippet(val)
        }} />
    </EmbeddedArrayInput>
    <TextInput options={{ fullWidth: true }} type='text' source='title' label='resources.areas.fields.title' />
    <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />
    <NumberInput style={{ width: '30%', float: 'left' }} options={{ fullWidth: true }} onChange={(val, v) => {
      props.setModDataLng(+v)
    }} source='coo[1]' label='resources.markers.fields.lat' />
    <NumberInput style={{ width: '30%', float: 'right' }} options={{ fullWidth: true }} onChange={(val, v) => {
      props.setModDataLat(+v)
    }} source='coo[0]' label='resources.markers.fields.lng' />
    <TextInput options={{ fullWidth: true }} type='text' source='partOf' label='resources.areas.fields.partOf' />
  </MetaForm>,
    'ruler':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput options={{ fullWidth: true }} source='name' choices={choicesRuler}
      label='resources.areas.fields.display_name' />
    <ColorInput options={{ fullWidth: true }} validate={required} source='color' label='Area Color' picker='Chrome' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='icon'
      label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'religion':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput options={{ fullWidth: true }} validate={required} source='name'
      choices={choicesReligion} label='resources.areas.fields.display_name' />
    <AutocompleteInput options={{ fullWidth: true }} validate={required} source='parentname'
      choices={choicesReligionGeneral} label='resources.areas.fields.main_religion_name' />
    <ColorInput options={{ fullWidth: true }} validate={required} source='color' label='Area Color' picker='Chrome' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='icon'
      label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'religionGeneral':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput options={{ fullWidth: true }} validate={required} source='name'
      choices={choicesReligionGeneral} label='resources.areas.fields.display_name' />
    <ColorInput options={{ fullWidth: true }} validate={required} source='color' label='Area Color' picker='Chrome' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='icon'
      label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'culture':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput options={{ fullWidth: true }} validate={required} source='name'
      choices={choicesCulture} label='resources.areas.fields.display_name' />
    <ColorInput options={{ fullWidth: true }} validate={required} source='color' label='Area Color' picker='Chrome' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='icon'
      label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'capital':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    {/* <AutocompleteDisallowInput options={{ fullWidth: true }} validate={required} source='name' choices={choicesCapital} label='resources.areas.fields.display_name' /> */}
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='url'
      label='resources.areas.fields.wiki_url' />
    <TextInput options={{ fullWidth: true }} validate={required} type='url' source='icon'
      label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'default':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput source='type' choices={choicesType} onChange={(val, v) => {
      props.setMetadataType(v)
    }} defaultValue={props.metadataType} />
    <span>select type of metadata from above dropdown</span>
  </MetaForm>
  }

  return <div>
    <AssignAddEditNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Add Area Entity'} {...props}>
      {typeInputs[props.metadataType] || typeInputs['default']}
    </Create>
  </div>
}
