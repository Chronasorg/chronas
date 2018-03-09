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
import { metadata } from '../../map/data/datadef'
import ColorInput from 'aor-color-input'
import AutocompleteDisallowInput from "../../restricted/shared/inputs/AutocompleteDisallowInput"

export const ModMetaAdd = (props) => {
  const selectedProvince = (props.selectedItem || {}).province || ''
  const activeArea = props.activeArea || { data: {} }
  // const activeAreaDim = props.activeArea.color
  // const activeprovinceDim = (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]
  // const selectedWiki = (metadata[activeAreaDim][activeprovinceDim] || {})[2]

  const defaultValues = {
    'provinces': selectedProvince || '',
    'dataRuler': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('political')] || '',
    'dataCulture': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')] || '',
    'dataReligion': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')] || '',
    'dataCapital': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')] || '',
    'dataPopulation': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('population')] || 1000,
    'yearStart': props.selectedYear || 1000,
    'yearEnd': props.selectedYear || 1000,
  }

  const choicesRuler = Object.keys(metadata['political']).map((rulerId) => {
    return { id: rulerId, name: metadata['political'][rulerId][0]}
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0]}
  }) || {}

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'capital', name: 'Capital' },
    { id: 'provinces', name: 'Provinces' },
  ]

  const choicesCulture = [ { id: 'todo', name: 'todo' } ]
  const choicesCapital = [ { id: 'todo', name: 'todo' } ]
  const choicesMainReligion = [ { id: 'todo', name: 'todo' } ]

  const validateValueInput = (values) => {

    // displayname and wiki must be unique

    console.debug(values)

    const errors = {}

    if (values.url === '') {
      errors.url = ["This url already exists, if you like to edit an existing resource click Edit Meta on top."]
    }
    if (values.name === '') {
      errors.name = ["This name already exists, if you like to edit an existing resource click Edit Meta on top."]
    }
    if (!values.color) {
      errors.color = ['Color value is required']
    }

    return errors
  }

  const typeInputs = {
    'ruler':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput validate={required} source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteDisallowInput source="name" choices={choicesRuler} defaultValue={defaultValues.dataRuler} label="resources.areas.fields.display_name" />
        {/*<AutocompleteInput validate={required} source="parentname" choices={choicesMainRuler} label="resources.areas.fields.main_ruler_name" defaultValue={defaultValues.dataReligion} />*/}
        <ColorInput source="color" label="resources.areas.fields.color" picker="Circle" />
        <AutocompleteDisallowInput source="url" choices={choicesReligion} defaultValue={defaultValues.dataReligion} label="resources.areas.fields.wiki_url" />
    </MetaForm>,
    'religion':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput validate={required} source="type" choices={[
          { id: 'ruler', name: 'Ruler' },
          { id: 'culture', name: 'Culture' },
          { id: 'religion', name: 'Religion' },
          { id: 'capital', name: 'Capital' },
        ]} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
      <AutocompleteDisallowInput validate={required} source="name" choices={choicesReligion} defaultValue={defaultValues.dataReligion} label="resources.areas.fields.display_name" />
      <AutocompleteInput validate={required} source="parentname" choices={choicesMainReligion} label="resources.areas.fields.main_religion_name" defaultValue={defaultValues.dataReligion} />
      <ColorInput validate={required} source="color" label="resources.areas.fields.color" picker="Circle"/>
      <AutocompleteDisallowInput validate={required} source="url" choices={choicesReligion} label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} />
    </MetaForm>,
    'culture':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput validate={required} source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
      <AutocompleteDisallowInput validate={required} source="name" choices={choicesCulture} defaultValue={defaultValues.dataCulture} label="resources.areas.fields.display_name" />
      <ColorInput validate={required} source="color" label="resources.areas.fields.color" picker="Circle"/>
      <AutocompleteDisallowInput validate={required} source="url" choices={choicesReligion} label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} />
    </MetaForm>,
    'capital':
    <MetaForm validate={validateValueInput} {...props} >
      <SelectInput validate={required} source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
      <ColorInput validate={required} source="color" label="resources.areas.fields.color" picker="Circle"/>
      <AutocompleteDisallowInput validate={required} source="name" choices={choicesCapital} defaultValue={defaultValues.dataCapital} label="resources.areas.fields.display_name" />
      <AutocompleteDisallowInput validate={required} source="url" choices={choicesReligion} label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} />
    </MetaForm>,
    'default':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <span>select type of metadata from above dropdown</span>
      </MetaForm>
  }

  return <Create {...props}>
      {typeInputs[props.metadataType] || typeInputs['default']}
  </Create>
};
