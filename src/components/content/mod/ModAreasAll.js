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
  required,
  minLength
} from 'admin-on-rest'
import { Link } from 'react-router-dom'
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import ModButton from '../../restricted/shared/buttons/ModButton'
import AreaForm from '../../restricted/shared/forms/AreaForm'
import utils from "../../map/utils/general"
import { metadata } from '../../map/data/datadef'


export const ModAreasAll = (props) => {
  const selectedProvince = props.selectedItem.province
  // const activeAreaDim = props.activeArea.color
  // const activeprovinceDim = (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]
  // const selectedWiki = (metadata[activeAreaDim][activeprovinceDim] || {})[2]

  const defaultValues = {
    'provinces': selectedProvince,
    'dataRuler': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('political')],
    'dataCulture': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')],
    'dataReligion': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')],
    'dataCapital': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')],
    'dataPopulation': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('population')],
    'yearStart': props.selectedYear,
    'yearEnd': props.selectedYear,
  }

  const choicesRuler = Object.keys(metadata['political']).map((rulerId) => {
    return { id: rulerId, name: metadata['political'][rulerId][0]}
  })

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0]}
  })

  const validateValueInput = (values) => {
    const errors = {};

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
  };

  return <Create {...props}>
      <AreaForm validate={validateValueInput} >
          <Subheader>Provinces</Subheader>
          <DisabledInput validation={required} elStyle={{width: '60%', minWidth: '300px'}} defaultValue={defaultValues.provinces} source="provinces" label="resources.areas.fields.provinceList" />
          <Divider />
          <Subheader>Data</Subheader>
          <AutocompleteInput source="ruler" choices={choicesRuler} defaultValue={defaultValues.dataRuler} label="resources.areas.fields.ruler" />
          <TextInput source="culture" defaultValue={defaultValues.dataCulture} label="resources.areas.fields.culture" />
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
