import React from 'react'
import {
  translate,
  BooleanField,
  BooleanInput,
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

import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import AssignAddEditNavigation from '../../restricted/shared/AssignAddEditNavigation'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import AreaForm from '../../restricted/shared/forms/AreaForm'
import utils from "../../map/utils/general"

export const ModAreasAll = (props) => {
  const selectedProvince = props.selectedItem.value || ''

  const defaultValues = {
    'provinces': [selectedProvince] || [],
    'dataRuler': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')] || '',
    'dataCulture': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')] || '',
    'dataReligion': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')] || '',
    'dataCapital': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')] || '',
    'dataPopulation': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('population')] || 1000,
    'rulerApply': false,
    'cultureApply': false,
    'religionApply': false,
    'populationApply': false,
    'yearStart': props.selectedYear,
    'yearEnd': props.selectedYear,
  }

  const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: props.metadata['ruler'][rulerId][0]}
  }) || {}

  const choicesCulture = Object.keys(props.metadata['culture']).map((cultureId) => {
    return { id: cultureId, name: props.metadata['culture'][cultureId][0]}
  }) || {}

  const choicesReligion = Object.keys(props.metadata['religion']).map((religionId) => {
    return { id: religionId, name: props.metadata['religion'][religionId][0]}
  }) || {}

  const validateValueInput = (values) => {
    const errors = {}

    if (!values.rulerApply &&
      !values.cultureApply &&
      !values.religionApply &&
      !values.populationApply) {
      errors.rulerApply = ['At least one of ruler, culture, religion or population is required']
      errors.cultureApply = ['At least one of ruler, culture, religion or population is required']
      errors.religionApply = ['At least one of ruler, culture, religion or population is required']
      errors.populationApply = ['At least one of ruler, culture, religion or population is required']
    }
    if (!values.start) {
      errors.start = ['Start value is required']
    }
    if (values.start && values.end && values.start > values.end) {
      errors.end = ['End year must be higher than start year']
    }
    return errors
  }

  return <div>
    <AssignAddEditNavigation pathname={props.location.pathname} />
    <Divider/>
    <Create title='Overwrite Area' {...props}>
      <AreaForm validate={validateValueInput} {...props} >
        <FlatButton
          backgroundColor={"#494949"}
          hoverColor={"rgb(200, 178, 115)"}
          label='By Provinces'
          containerElement={<Link to='/mod/areas' />}
          style={{ float: 'left', color: '#ffffff', marginRight: 12 }}
        />
        <FlatButton
          backgroundColor={"rgb(141, 141, 141)"}
          hoverColor={"rgb(200, 178, 115)"}
          label='By Value (Replace)'
          containerElement={<Link to='/mod/areasReplace' />}
          style={{ color: '#ffffff', marginRight: 12 }}
        />
          <SelectArrayInput options={{ fullWidth: true }} onChange={(val,v) => { props.setModData(v) }} validation={required} elStyle={{width: '60%', minWidth: '300px'}} defaultValue={defaultValues.provinces} source="provinces" label="resources.areas.fields.province_list" />
          <Subheader>Data</Subheader>
        <BooleanInput
          source="rulerApply"
          defaultValue={defaultValues.rulerApply}
          label=""
          style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
          iconStyle={{ width: 40, height: 40 }}
        />
          <AutocompleteInput style={{display: 'inline-block', width: 'calc(100% - 100px)'}}  source="ruler" choices={choicesRuler} defaultValue={defaultValues.dataRuler} label="resources.areas.fields.ruler" />
        <BooleanInput
          source="cultureApply"
          defaultValue={defaultValues.cultureApply}
          label=""
          style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
          iconStyle={{ width: 40, height: 40 }}
        />
          <AutocompleteInput style={{display: 'inline-block', width: 'calc(100% - 100px)'}} source="culture" choices={choicesCulture} defaultValue={defaultValues.dataCulture} label="resources.areas.fields.culture" />

        <BooleanInput
          source="religionApply"
          defaultValue={defaultValues.religionApply}
          label=""
          style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
          iconStyle={{ width: 40, height: 40 }}
        />
          <AutocompleteInput style={{display: 'inline-block', width: 'calc(100% - 100px)'}} source="religion" choices={choicesReligion} label="resources.areas.fields.religion" defaultValue={defaultValues.dataReligion} />

        <BooleanInput
          source="populationApply"
          label=""
          defaultValue={defaultValues.populationApply}
          style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
          iconStyle={{ width: 40, height: 40 }}
        />
          <NumberInput style={{display: 'inline-block', width: 'calc(100% - 100px)'}} source="population" defaultValue={+defaultValues.dataPopulation} label="resources.areas.fields.population" />
          <Subheader>Year Range</Subheader>
          <NumberInput style={{ width: '50%', float: 'left' }} validation={required} source="start" defaultValue={defaultValues.yearStart} label="resources.areas.fields.startYear" />
          <NumberInput style={{ width: '50%', float: 'right' }} source="end" defaultValue={defaultValues.yearEnd} label="resources.areas.fields.endYear" />
    </AreaForm>
    </Create>
  </div>
};
