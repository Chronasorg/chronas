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

export const ModAreasAll = () => {
  return <AreaForm>
          <Subheader>Provinces</Subheader>
          <LongTextInput source="provinces" label="resources.areas.provinceList" validation={{ id: true }} />
        <Divider />
          <Subheader>Data</Subheader>
          <TextInput source="ruler" label="resources.areas.fields.ruler" />
          <TextInput source="culture" label="resources.areas.fields.culture" />
          <TextInput source="religion" label="resources.areas.fields.religion" />
          <TextInput source="capital" label="resources.areas.fields.capital" />
          <NumberInput source="population" label="resources.areas.fields.population" />
        <Divider />
          <Subheader>Year Range</Subheader>
          <NumberInput source="start" label="resources.areas.fields.start_year" />
          <NumberInput source="end" label="resources.areas.fields.end_year" />
      </AreaForm>
};

