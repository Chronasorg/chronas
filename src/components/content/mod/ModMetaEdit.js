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

  const defaultValues = {
    ruler: {
      name: (metadata['ruler'][props.metadataEntity] || {})[0] || '',
      color: (metadata['ruler'][props.metadataEntity] || {})[1] || '',
      url: (metadata['ruler'][props.metadataEntity] || {})[2] || '',
    },
    culture: {
      name: (metadata['culture'][props.metadataEntity] || {})[0] || '',
      color: (metadata['culture'][props.metadataEntity] || {})[1] || '',
      url: (metadata['culture'][props.metadataEntity] || {})[2] || '',
    },
    religion: {
      name: (metadata['religion'][props.metadataEntity] || {})[0] || '',
      color: (metadata['religion'][props.metadataEntity] || {})[1] || '',
      url: (metadata['religion'][props.metadataEntity] || {})[2] || '',
    },
    capital: {
      name: (metadata['capital'][props.metadataEntity] || {})[0] || '',
      url: (metadata['capital'][props.metadataEntity] || {})[2] || '',
    }
  }

  const choicesRuler = Object.keys(metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: metadata['ruler'][rulerId][0]}
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0]}
  }) || {}

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'capital', name: 'Capital' },
    // { id: 'provinces', name: 'Provinces' }, // TODO: change province wiki name color and polygons (?)
  ]

  const choicesCulture = [ { id: 'todo', name: 'todo' } ]
  const choicesCapital = [ { id: 'todo', name: 'todo' } ]
  const choicesMainRuler = [ { id: 'todo', name: 'todo' } ]
  const choicesMainReligion = [ { id: 'todo', name: 'todo' } ]

  const validateValueInput = (values) => {
    if (values.url !== defaultValues['ruler'].url && values.url.indexOf('.wikipedia.org/wiki/') === -1) {
      errors.url = ["The URL needs to be a full Wikipedia URL"]
    }

    // if (values.ruler === defaultValues.dataRuler &&
    //   values.culture === defaultValues.dataCulture &&
    //   values.religion === defaultValues.dataReligion &&
    //   values.capital === defaultValues.dataCapital &&
    //   values.population === defaultValues.dataPopulation) {
    //   errors.ruler = ['Did you change anything?']
    // }
    return errors
  }

  const typeInputs = {
    'ruler':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Which entity do you like to modify?</h4>
        <AutocompleteInput  source="select" choices={choicesRuler} onChange={(val,v) => { props.setMetadataEntity(v) }} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <TextInput source="name" label="resources.areas.fields.main_ruler_name" defaultValue={defaultValues['ruler'].name } /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" defaultValue={defaultValues['ruler'].color } label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues['ruler'].url } /> : null}

      </MetaForm>,
    'religion':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesReligion} onChange={(val,v) => { props.setMetadataEntity(v) }} defaultValue={defaultValues.dataReligion} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataReligion} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <AutocompleteInput source="parentname" choices={choicesMainReligion} label="resources.areas.fields.main_religion_name" defaultValue={defaultValues.dataReligion} /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" label="resources.areas.fields.color" picker="Compact"/> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} /> : null}

      </MetaForm>,
    'culture':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCulture} onChange={(val,v) => { props.setMetadataEntity(v) }} defaultValue={defaultValues.dataCulture} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <TextInput source="name" defaultValue={defaultValues.dataCulture} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <ColorInput source="color" label="resources.areas.fields.color" picker="Compact" /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url" source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} /> : null}

      </MetaForm>,
    'capital':
      <MetaForm validate={validateValueInput} {...props} >
        <SelectInput source="type" choices={choicesType} onChange={(val,v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <AutocompleteInput source="select" choices={choicesCapital} onChange={(val,v) => { props.setMetadataEntity(v) }} defaultValue={defaultValues.dataCapital} label="resources.areas.fields.display_name" />

        {(props.metadataEntity !== '') ? <AutocompleteInput source="name" onChange={(val,v) => { props.setMetadataEntity(v) }} defaultValue={defaultValues.dataCapital} label="resources.areas.fields.display_name" /> : null}
        {(props.metadataEntity !== '') ? <TextInput type="url"  source="url" label="resources.areas.fields.wiki_url" defaultValue={defaultValues.dataReligion} /> : null}

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
