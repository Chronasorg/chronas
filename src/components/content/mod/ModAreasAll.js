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
  SelectArrayInput,
  required,
  minLength
} from 'admin-on-rest'
import { Link } from 'react-router-dom'
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import AreaForm from '../../restricted/shared/forms/AreaForm'
import utils from "../../map/utils/general"
import { metadata } from '../../map/data/datadef'

export const ModAreasAll = (props) => {
  const selectedProvince = props.selectedItem.province || ''

  const defaultValues = {
    'provinces': [selectedProvince] || [],
    'dataRuler': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')] || '',
    'dataCulture': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')] || '',
    'dataReligion': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')] || '',
    'dataCapital': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')] || '',
    'dataPopulation': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('population')] || 1000,
    'yearStart': props.selectedYear || 1000,
    'yearEnd': props.selectedYear || 1000,
  }

  const choicesRuler = Object.keys(metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: metadata['ruler'][rulerId][0]}
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0]}
  }) || {}

  const validateValueInput = (values) => {
    const errors = {}

    if (values.ruler === defaultValues.dataRuler &&
      values.culture === defaultValues.dataCulture &&
      values.religion === defaultValues.dataReligion &&
      values.capital === defaultValues.dataCapital &&
      values.population === defaultValues.dataPopulation) {
      errors.ruler = ['At least one of ruler, culture, religion, capital or population is required']
    }
    if (!values.start) {
      errors.start = ['Start value is required']
    }
    if (values.start && values.end && values.start > values.end  ) {
      errors.end = ['End year must be higher than start year']
    }
    return errors
  }

  return <Create title='Modify area mapping' {...props}>
      <AreaForm validate={validateValueInput} {...props} >
          <Subheader>Provinces</Subheader>
          <SelectArrayInput onChange={(val,v) => { props.setModData(v) }} validation={required} elStyle={{width: '60%', minWidth: '300px'}} defaultValue={defaultValues.provinces} source="provinces" label="resources.areas.fields.province_list" />
          <Divider />
          <Subheader>Data</Subheader>
        {/*<TextInput source="ruler" choices={choicesRuler} defaultValue={defaultValues.dataRuler} label="resources.areas.fields.ruler" />*/}
          <AutocompleteInput source="ruler" choices={choicesRuler} defaultValue={defaultValues.dataRuler} label="resources.areas.fields.ruler" />
          <TextInput source="culture" defaultValue={defaultValues.dataCulture} label="resources.areas.fields.culture" />
        {/*<TextInput source="religion" choices={choicesReligion} label="resources.areas.fields.religion" defaultValue={defaultValues.dataReligion} />*/}
          <AutocompleteInput source="religion" choices={choicesReligion} label="resources.areas.fields.religion" defaultValue={defaultValues.dataReligion} />
          <TextInput source="capital" defaultValue={defaultValues.dataCapital} label="resources.areas.fields.capital" />
          <NumberInput source="population" defaultValue={+defaultValues.dataPopulation} label="resources.areas.fields.population" />
          <Divider />
          <Subheader>Year Range</Subheader>
          <NumberInput validation={required} source="start" defaultValue={defaultValues.yearStart} label="resources.areas.fields.startYear" />
          <NumberInput source="end" defaultValue={defaultValues.yearEnd} label="resources.areas.fields.endYear" />
    </AreaForm>
  </Create>
};
