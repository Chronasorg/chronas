import React from 'react'

import {
  BooleanField,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  DeleteButton,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
  List,
  LongTextInput,
  minLength,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceArrayField,
  ReferenceManyField,
  required,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  translate,
  UrlField
} from 'admin-on-rest'
import Icon from 'material-ui/svg-icons/social/person'
import ResolvedButton from './ResolvedButton'
import UserTextField from '../shared/fields/UserTextField'
import { chronasMainColor } from '../../../styles/chronasColors'
import OpenFullUrlButton from './OpenFullUrlButton'

const colored = WrappedComponent => props => props.record[props.source] > 500
  ? <span style={{ color: 'red' }}><WrappedComponent {...props} /></span>
  : <WrappedComponent {...props} />

const ColoredNumberField = colored(NumberField)
ColoredNumberField.defaultProps = NumberField.defaultProps

const rowStyle = (record) => {
  if (record.reverted) {
    return { backgroundColor: '#ff0001' }
  } else {
    return { maxWidth: 100 }
    // return { backgroundColor: '#25ff00' }
  }
}

const styles = {
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },
  subContainer: {
    // padding: '0px 1em 1em',
    maxHeight: 'calc(100% - 56px)',
    background: 'rgb(243, 243, 242)',
    overflow: 'auto',
    width: '100%'
  }
}

export const FlagFilter = (props) => (
  <Filter {...props}>
    <NullableBooleanInput source="fixed" defaultValue={true} />
  </Filter>
);

export const FlagList = (props) => {
  return <div style={styles.container}><div style={styles.subContainer}><List {...props} filters={<FlagFilter />} style={styles.container} title={'pos.flagHistory'} perPage={5}>
    <Datagrid bodyOptions={{ overflow: 'auto', stripedRows: true, showRowHover: true }} rowStyle={rowStyle}>
      <OpenFullUrlButton style={{ overflow: 'visible', maxWidth: '1em' }} {...props} isRedo={false} />
      <ResolvedButton style={{ overflow: 'visible', maxWidth: '1em' }} {...props} isRedo={false} />
      <TextField style={{ maxWidth: '1em' }} source='subEntityId' label='resources.flags.fields.subEntityId' />
      <ChipField style={{ maxWidth: '1em' }} source='resource' label='resources.revisions.fields.resource' />
      <TextField style={{ maxWidth: '1em' }} source='wrongWiki' label='resources.flags.fields.wrongWiki' />
      <BooleanField style={{ maxWidth: '1em' }} source='fixed' label='resources.flags.fields.fixed' />
      <DateField style={{ maxWidth: '1em' }} source='timestamp' label='resources.revisions.fields.timestamp' type='date' />
    </Datagrid>
  </List></div></div>
}
