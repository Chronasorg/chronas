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
  Delete,
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
import MarkerForm from '../../restricted/shared/forms/MarkerForm'

export const ModAreasAll = (props) => {
  const validateValueInput = (values) => {
    const errors = {};
    if (!values.ruler &&
      !values.culture &&
      !values.religion &&
      !values.capital &&
      !values.population) {
      errors.ruler = ['At least one of ruler, culture, religion, capital or population is required'];
    }
    if (!values.start) {
      errors.start = ['Start value is required'];
    }
    if (values.start && values.end && values.start > values.end  ) {
      errors.end = ['End year must be higher than start year'];
    }
    return errors
  };


  return <Create {...props}>
    <AreaForm  validate={validateValueInput} redirect="list" {...props}>
        <Subheader>Provinces</Subheader>
        <LongTextInput source="provinces" label="resources.areas.provinceList" validation={required} onChange={(val,v) => { props.setModData(v)}} />
      <Divider />
        <Subheader>Data</Subheader>
        <TextInput source="ruler" label="resources.areas.fields.ruler" />
        <TextInput source="culture" label="resources.areas.fields.culture" />
        <TextInput source="religion" label="resources.areas.fields.religion" />
        <TextInput source="capital" label="resources.areas.fields.capital" />
        <NumberInput source="population" label="resources.areas.fields.population" />
      <Divider />
        <Subheader>Year Range</Subheader>
        <NumberInput source="start" defaultValue={props.selectedYear} validation={required} label="resources.areas.fields.start_year" />
        <NumberInput source="end" label="resources.areas.fields.end_year" />
    </AreaForm>
  </Create>
};

