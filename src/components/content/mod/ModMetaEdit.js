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
  Delete,SimpleForm,
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
import { Link } from 'react-router-dom'
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import MetaForm from '../../restricted/shared/forms/MetaForm'
import utils from "../../map/utils/general"
import ColorInput from 'aor-color-input'

export const ModMetaEdit = (props) => {
  const { metadata } = props
  const selectedProvince = (props.selectedItem || {}).province || ''
  const activeArea = props.activeArea || { data: {} }

  const defaultValues = {//dataParentname
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

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'religionGeneral', name: 'Religion General' },
    { id: 'capital', name: 'Capital' },
    { id: 'province', name: 'Province' },
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

    if (values.icon !== defaultValues.dataIcon &&
      values.icon &&
      (values.icon.indexOf('.wikipedia.org/') === -1 && values.icon.indexOf('.wikimedia.org/') === -1)) {
      errors.icon = ["The icon URL needs to be a full wikipedia or wikimedia URL, for example: 'https://en.wikipedia.org/wiki/Battle_of_Vienna#/media/File:Chor%C4%85giew_kr%C3%B3lewska_kr%C3%B3la_Zygmunta_III_Wazy.svg'"]
    }

    return errors
  }

  const typeInputs = {
    'ruler':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Which entity do you like to modify?</h4>
        <AutocompleteInput  source="select" choices={choicesRuler} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <TextInput errorText='will be changed' source="name" label="resources.areas.fields.main_ruler_name" defaultValue={defaultValues.dataName } /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl } /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}

      </MetaForm>,
    'religion':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesReligion} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />
        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <AutocompleteInput source="parentname" choices={choicesReligionGeneral} label="resources.areas.fields.main_religion_name" defaultValue={defaultValues.dataParentname} /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'religionGeneral':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesReligionGeneral} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'culture':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCulture} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataName} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues.dataColor } label="resources.areas.fields.color" picker="Compact" /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}

      </MetaForm>,
    'capital':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCapital} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput type="url"  source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}

      </MetaForm>,
    'province':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesProvince} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.key" />

        {(props.metadataEntity !== '') ? <TextInput type="url"  source="url" label="resources.areas.fields.province_url" defaultValue={defaultValues.dataUrl} /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="icon" label="resources.areas.fields.icon_url" defaultValue={defaultValues.dataIcon } /> : null}
      </MetaForm>,
    'default':
      <MetaForm validate={validateValueInput} {...props} >
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Which type of metadata do you like to modify?</h4>
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
      </MetaForm>
  }

  return <Create {...props}>
    {typeInputs[props.metadataType] || typeInputs['default']}
  </Create>
};
