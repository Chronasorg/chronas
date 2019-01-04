import React, { Component } from 'react'
import {
  BooleanField,
  BooleanInput,
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
  SelectArrayInput,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  translate,
  UrlField
} from 'admin-on-rest'

import { Link } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'
import AssignAddEditNavigation from '../../restricted/shared/AssignAddEditNavigation'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import AreaForm from '../../restricted/shared/forms/AreaForm'
// import BooleanInput from '../../../components/restricted/shared/inputs/BooleanInput'
import utils from '../../map/utils/general'

export class ModAreasReplace extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedType: false,
    }
  }

  render () {
    const props = this.props
    const selectedProvince = props.selectedItem.value || ''

    const defaultValues = {
      'dataRuler': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')] || '',
      'dataCulture': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')] || '',
      'dataReligion': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')] || '',
      'dataCapital': (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')] || '',
      'rulerApply': false,
      'cultureApply': false,
      'religionApply': false,
      'yearStart': props.selectedYear,
      'yearEnd': props.selectedYear,
    }

    const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
      return { id: rulerId, name: props.metadata['ruler'][rulerId][0] }
    }) || {}

    const choicesCulture = Object.keys(props.metadata['culture']).map((cultureId) => {
      return { id: cultureId, name: props.metadata['culture'][cultureId][0] }
    }) || {}

    const choicesReligion = Object.keys(props.metadata['religion']).map((religionId) => {
      return { id: religionId, name: props.metadata['religion'][religionId][0] }
    }) || {}

    const choicesRulerR = Object.keys(props.metadata['ruler']).map((rulerId) => {
      return { id: rulerId, name: props.metadata['ruler'][rulerId][0] }
    }) || {}

    const choicesCultureR = Object.keys(props.metadata['culture']).map((cultureId) => {
      return { id: cultureId, name: props.metadata['culture'][cultureId][0] }
    }) || {}

    const choicesReligionR = Object.keys(props.metadata['religion']).map((religionId) => {
      return { id: religionId, name: props.metadata['religion'][religionId][0] }
    }) || {}

    const validateValueInput = (values) => {
      const errors = {}

      if (!values.replaceWith) {
        errors.replaceWith = ['Replace value is required']
      }

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

    const { selectedType } = this.state
    return <div>
      <AssignAddEditNavigation pathname={props.location.pathname} />
      <Divider />
      <Create title='Overwrite Area' {...props}>
        <AreaForm validate={validateValueInput} {...props} >
          <FlatButton
            backgroundColor={'rgb(141, 141, 141)'}
            hoverColor={'rgb(200, 178, 115)'}
            label='By Provinces'
            containerElement={<Link to='/mod/areas' />}
            style={{ float: 'left', color: '#ffffff', marginRight: 12 }}
          />
          <FlatButton
            backgroundColor={'#494949'}
            hoverColor={'rgb(200, 178, 115)'}
            label='By Value (Replace)'
            containerElement={<Link to='/mod/areasReplace' />}
            style={{ color: '#ffffff', marginRight: 12 }}
          />
          <Subheader>Data</Subheader>
          <span>(select one value of the below to be overwritten)</span>
          <BooleanInput
            source='rulerApply'
            // defaultValue={defaultValues.rulerApply}
            defaultValue={(selectedType === 'ruler')}
            label=''
            style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
            iconStyle={{ width: 40, height: 40 }}
            onChange={(el) => {
              this.setState({ selectedType: (selectedType !== 'ruler') ? 'ruler' : false })
              setTimeout(() => this.forceUpdate(), 200)
            }}
          />
          <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='ruler'
            choices={choicesRuler} defaultValue={defaultValues.dataRuler}
            label='resources.areas.fields.ruler' />
          <BooleanInput
            source='cultureApply'
            // defaultValue={defaultValues.cultureApply}
            defaultValue={selectedType === 'culture'}
            label=''
            style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
            iconStyle={{ width: 40, height: 40 }}
            onChange={(el) => {
              this.setState({ selectedType: (selectedType !== 'culture') ? 'culture' : false })
              setTimeout(() => this.forceUpdate(), 200)
            }}
          />
          <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='culture'
            choices={choicesCulture} defaultValue={defaultValues.dataCulture}
            label='resources.areas.fields.culture' />
          <BooleanInput
            source='religionApply'
            // defaultValue={defaultValues.religionApply}
            defaultValue={selectedType === 'religion'}
            label=''
            style={{ width: 64, height: 42, marginRight: 24, padding: 0, display: 'inline-block' }}
            iconStyle={{ width: 40, height: 40 }}
            onChange={(el) => {
              this.setState({ selectedType: (selectedType !== 'religion') ? 'religion' : false })
              setTimeout(() => this.forceUpdate(), 200)
            }}
          />
          <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='religion'
            choices={choicesReligion} label='resources.areas.fields.religion'
            defaultValue={defaultValues.dataReligion} />
          <br />
          <Subheader>Replace With</Subheader>
          <span>(select replacement value)</span>
          <span>(if the item doesn't exit yet, add area entity first)</span>
          {
            (selectedType) ? (
              (selectedType === 'ruler')
                ? <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='replaceWith'
                  choices={choicesRulerR} defaultValue={defaultValues.replaceWith}
                  label='resources.areas.fields.replaceWith' />
                : (selectedType === 'culture')
                  ? <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='replaceWith'
                    choices={choicesCultureR} defaultValue={defaultValues.replaceWith}
                    label='resources.areas.fields.replaceWith' />
                  : <AutocompleteInput style={{ display: 'inline-block', width: 'calc(100% - 100px)' }} source='replaceWith'
                    choices={choicesReligionR} label='resources.areas.fields.replaceWith'
                    defaultValue={defaultValues.replaceWith} />)
              : <span>First select top value to replace</span>
          }

          <Subheader>Year Range</Subheader>
          <NumberInput style={{ width: '50%', float: 'left' }} validation={required} source='start'
            defaultValue={defaultValues.yearStart} label='resources.areas.fields.startYear' />
          <NumberInput style={{ width: '50%', float: 'right' }} source='end' defaultValue={defaultValues.yearEnd}
            label='resources.areas.fields.endYear' />
        </AreaForm>
      </Create>
    </div>
  };
}
