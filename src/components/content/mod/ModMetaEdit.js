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
  Edit,
  Delete, SimpleForm,
  UrlField,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceManyField,
  ReferenceArrayField,
  TabbedForm,
  TextField,
  TextInput,
  LongTextInput,
  SelectInput,
  required,
  minLength
} from 'admin-on-rest'
import { EmbeddedArrayInput } from 'aor-embedded-array'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import MetaForm from '../../restricted/shared/forms/MetaForm'
import ModButton from '../../restricted/shared/buttons/ModButton'
import utils from '../../map/utils/general'
import ColorInput from 'aor-color-input'
import { TYPE_AREA, TYPE_EPIC, TYPE_MARKER } from '../../map/actionReducers'
import { epicIdNameArray } from '../../../properties'

export const ModMetaEdit = (props) => {
  const { metadata, routeNotYetSetup, selectedItem } = props

  let newEntity = ((props.activeArea.data || {})[props.selectedItem.value] || [])[utils.activeAreaDataAccessor(props.activeArea.color)]

  if (routeNotYetSetup()) {
    if (selectedItem.type === TYPE_EPIC) {
      props.setMetadataType('e')
      newEntity = ((props.selectedItem || {}).data || {}).id
    } else if (props.activeArea.color && (!props.metadataType || props.metadataType !== props.activeArea.color)) {
      props.setMetadataType(props.activeArea.color)
    }

    if (newEntity && props.selectedItem.value && (!props.metadataEntity || props.metadataEntity !== newEntity)) {
      props.setMetadataEntity(newEntity, selectedItem.type === TYPE_EPIC)
    }
  }

  const defaultValues = {
      dataName: ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[0] || '',
      dataColor: ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[1] || '',
      dataUrl: (props.metadataType === 'capital' || props.metadataType === 'province') ? 'https://en.wikipedia.org/wiki/' + ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[0] || '' : 'https://en.wikipedia.org/wiki/' + ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[2] || '',
      dataIcon: (props.metadataType === 'capital' || props.metadataType === 'province')
        ? ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[1] || ''
        : (props.metadataType === 'religion')
          ? ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[4] || ''
          : ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[3] || '',
      dataParentname: ((metadata[props.metadataType] || {})[props.metadataEntity] || {})[3] || '',
    }

  const choicesRuler = Object.keys(metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: metadata['ruler'][rulerId][0]}
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0]}
  }) || {}

  const choicesReligionGeneral = Object.keys(metadata['religionGeneral']).map((religionId) => {
    return { id: religionId, name: metadata['religionGeneral'][religionId][0]}
  }) || {}

  const choicesCulture = Object.keys(metadata['culture']).map((cultureId) => {
    return { id: cultureId, name: metadata['culture'][cultureId][0]}
  }) || {}

  const choicesCapital = Object.keys(metadata['capital']).map((capitalId) => {
    return { id: capitalId, name: metadata['capital'][capitalId][0]}
  }) || {}

  const choicesProvince = Object.keys(metadata['province']).map((capitalId) => {
    return { id: capitalId, name: metadata['province'][capitalId][0]}
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
    { name: '[Marker] Other -> Area Info', id: 'm_areainfo' },
    { name: '[Marker] Other -> Unknown', id: 'm_unknown' },
    { id: 'meta_story', name: 'Story' },
    { id: 'meta_image', name: 'Image' },
    { id: 'meta_audio', name: 'Audio' },
    { id: 'meta_text', name: 'External Article or Primary Source' },
    { id: 'meta_video', name: 'Video' },
    { id: 'meta_other', name: 'Other' }
  ]

  const choicesEpicSubtypes = epicIdNameArray.map(el => { return { id: el[0], name: el[1] } })

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'religionGeneral', name: 'Religion (General)' },
    { id: 'capital', name: 'Capital' },
    { id: 'province', name: 'Province' },
    { id: 'e', name: 'Epic' },
  ]

  const validateValueInput = (values) => {
    const errors = {}

    if (values.icon === defaultValues.dataIcon &&
      values.name === defaultValues.dataName &&
      (props.metadataType === "capital" || props.metadataType === "province" || values.color === defaultValues.dataColor) &&
      values.url === defaultValues.dataUrl &&
      ((props.metadataType !== "religion") || values.parentname === defaultValues.dataParentname)) {
      errors.name = ['At least one of ruler, culture, religion, capital or population is required']
      errors.color = ['At least one of ruler, culture, religion, capital or population is required']
      errors.url = ['At least one of ruler, culture, religion, capital or population is required']
    }

    if (values.url !== defaultValues.dataUrl &&
      values.url &&
      values.url.indexOf('.wikipedia.org/wiki/') === -1) {
      errors.url = ["The URL needs to be a full Wikipedia URL"]
    }

    if (values.icon &&
      values.icon !== defaultValues.dataIcon &&
      (values.icon.indexOf('.wikipedia.org/') === -1 && values.icon.indexOf('.wikimedia.org/') === -1)) {
      errors.icon = ["The icon URL needs to be a full wikipedia or wikimedia URL, for example: 'https://en.wikipedia.org/wiki/Battle_of_Vienna#/media/File:Chor%C4%85giew_kr%C3%B3lewska_kr%C3%B3la_Zygmunta_III_Wazy.svg'"]
    }

    return errors
  }

  const typeInputs = {
    'e':
  <MetaForm  validate={validateValueInput} {...props} redirect='edit' defaultValue={props.defaultEpicValues}>
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteInput source="select" choices={props.epicsChoice} onSearchChange={(val) => { return props.setSearchEpic(val) }} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.display_name" />
    {(props.metadataEntity !== '') ? <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' /> : null}
    {(props.metadataEntity !== '') ? <TextInput type='url' source='poster' label='resources.areas.fields.poster' /> : null}
    {(props.metadataEntity !== '') ? <AutocompleteInput validate={required} type='text' choices={choicesEpicSubtypes} source='subtype' label='resources.areas.fields.subtype' /> : null}
    {(props.metadataEntity !== '') ? <TextInput validate={required} type='number' source='start' label='resources.areas.fields.start' /> : null}
    {(props.metadataEntity !== '') ? <TextInput type='number' source='end' label='resources.areas.fields.end' /> : null}
    {(props.metadataEntity !== '') ? <EmbeddedArrayInput source='participants'>
      <EmbeddedArrayInput source='participantTeam'>
        <AutocompleteInput source='name' choices={choicesRuler} label='resources.areas.fields.participant' />
      </EmbeddedArrayInput>
    </EmbeddedArrayInput> : null}
    {(props.metadataEntity !== '') ? <EmbeddedArrayInput validate={required} source='content' label='Content (shows up in left content column, if it doesnt exist yet, you can create _media/ others_ and _markers_ to be added here)'>
      <SelectInput validate={required} source='contentType' choices={contentType} onChange={(val, v) => { props.setContentType(v) }} defaultValue={props.contentType} />
      <AutocompleteInput validate={required} source='name' choices={props.contentChoice} label='resources.areas.fields.participant' onSearchChange={(val) => { return props.setSearchSnippet(val) }} />
    </EmbeddedArrayInput> : null}
    {(props.metadataEntity !== '') ? <TextInput type='text' source='title' label='resources.areas.fields.title' /> : null}
    {(props.metadataEntity !== '') ? <ModButton modType='marker' /> : null}
    {(props.metadataEntity !== '') ? <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' /> : null}
    {(props.metadataEntity !== '') ? <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' /> : null}
    {(props.metadataEntity !== '') ? <TextInput type='text' source='partOf' label='resources.areas.fields.partOf' /> : null}
  </MetaForm>,
    'ruler':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Which entity do you like to modify?</h4>
        <AutocompleteInput  source="select" choices={choicesRuler} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <TextInput errorText='will be changed' source="name" label="resources.areas.fields.main_ruler_name" defaultValue={defaultValues.dataName } /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl } /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'religion':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesReligion} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />
        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <AutocompleteInput source="parentname" choices={choicesReligionGeneral} label="resources.areas.fields.main_religion_name" defaultValue={defaultValues.dataParentname} /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'religionGeneral':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesReligionGeneral} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'culture':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCulture} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact" /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'capital':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCapital} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'province':
      <MetaForm  validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesProvince} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.province_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'default':
      <MetaForm  validate={validateValueInput} {...props} >
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Which type of metadata do you like to modify?</h4>
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
      </MetaForm>
  }

  return <Create {...props}>
    {typeInputs[props.metadataType] || typeInputs['default']}
  </Create>
};
