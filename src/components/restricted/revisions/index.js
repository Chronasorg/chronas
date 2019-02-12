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
import RevertButton from './RevertButton'
import UserTextField from '../shared/fields/UserTextField'
import { chronasMainColor } from '../../../styles/chronasColors'
//
// export const RevisionIcon = Icon
//
// const RevisionFilter = (props) => (
//   <Filter {...props}>
//     <TextInput label='pos.search' source='q' value={'test123lala'} alwaysOn />
//   </Filter>
// )

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

export const RevisionFilter = (props) => (
  <Filter {...props}>
    <TextInput source='user' />
    <NullableBooleanInput source="reverted" defaultValue={true} />
  </Filter>
);

export const RevisionList = (props) => {
  const prevBodyStyle = (record) => {
    if (record.reverted) {
      return { color: 'green', backgroundColor: '#ff0001' }
    } else {
      return { color: 'red', backgroundColor: '#ff0001' }
      // return { backgroundColor: '#25ff00' }
    }
  }
  const nextStyle = (record) => (record || {}).reverted ? { color: 'green' } : { color: 'red' }
  const prevStyle = { color: 'green' }

  return <div style={styles.container}><div style={styles.subContainer}><List {...props} filters={<RevisionFilter />} style={styles.container} title={translate('pos.revisionHistory')} perPage={5}>
    <Datagrid bodyOptions={{ overflow: 'auto', stripedRows: true, showRowHover: true }} rowStyle={rowStyle}>
      <RevertButton style={{ overflow: 'visible', maxWidth: '1em' }} {...props} isRedo={false} />
      <TextField style={{ maxWidth: '1em' }} source='entityId' label='resources.revisions.fields.entityId' />
      <ChipField style={{ maxWidth: '1em' }} source='resource' label='resources.revisions.fields.resource' />
      <UserTextField style={{ maxWidth: '1em' }} source='user' label='resources.revisions.fields.user' />
      <TextField style={{ maxWidth: '1em' }} source='nextBody' label='resources.revisions.fields.nextBody' />
      <TextField style={{ maxWidth: '1em' }} source='prevBody' label='resources.revisions.fields.prevBody'
                 elStyle={prevStyle} />
      <BooleanField style={{ maxWidth: '1em' }} source='reverted' label='resources.revisions.fields.reverted' />
      <DateField style={{ maxWidth: '1em' }} source='timestamp' label='resources.revisions.fields.timestamp' type='date' />
      {/* <DeleteButton style={{ maxWidth: '1em' }} {...props} /> */}
    </Datagrid>
  </List></div></div>
}

//
// export const RevisionEdit = (props) => {
//   return <Edit title={<span>RevisionEdit</span>} {...props}>
//     <SimpleForm>
//       <TextInput source='name' label='resources.revisions.fields.name' />
//       <TextInput source='id' label='resources.revisions.fields.url' validation={{ id: true }} />
//       <TextInput source='coo[1]' label='resources.revisions.fields.lat' />
//       <TextInput source='coo[0]' label='resources.revisions.fields.lng' />
//       <TextInput source='type' label='resources.revisions.fields.type' />
//       <TextInput source='subtype' label='resources.revisions.fields.subtype' />
//       <DateInput source='lastUpdated' label='resources.revisions.fields.lastUpdated' type='date' />
//       <NumberInput source='startYear' label='resources.revisions.fields.startYear' type='date' />
//       <NumberInput source='endYear' label='resources.revisions.fields.endYear' />
//       <DateInput source='date' label='resources.revisions.fields.date' type='date' />
//       <NumberInput source='rating' label='resources.revisions.fields.rating'
//         style={{ width: '5em', color: chronasMainColor }} />
//     </SimpleForm>
//   </Edit>
// }
//
// export const RevisionCreate = (props) => {
//   return <Create {...props}>
//     <SimpleForm redirect='list'>
//       <TextInput source='name' label='resources.revisions.fields.name' />
//       <TextInput source='wiki' label='resources.revisions.fields.url' validate={required} />
//       <NumberInput source='coo[1]' label='resources.revisions.fields.lat' />
//       <NumberInput source='coo[0]' label='resources.revisions.fields.lng' />
//       <TextInput source='type' label='resources.revisions.fields.type' />
//       <TextInput source='subtype' label='resources.revisions.fields.subtype' />
//       <DateInput source='lastUpdated' label='resources.revisions.fields.lastUpdated' type='date' />
//       <NumberInput source='startYear' label='resources.revisions.fields.startYear' type='date' />
//       <NumberInput source='endYear' label='resources.revisions.fields.endYear' />
//       <DateInput source='date' label='resources.revisions.fields.date' type='date' />
//       <NumberInput source='rating' label='resources.revisions.fields.rating'
//         style={{ width: '5em', color: chronasMainColor }} />
//     </SimpleForm>
//   </Create>
// }
//
// const RevisionDeleteTitle = translate(({ record, translate }) => <span>
//   {translate('resources.page.delete')}&nbsp;
//   {record && `${record.id}`}
// </span>)
//
// export const RevisionDelete = (props) => <Delete {...props} title={<RevisionDeleteTitle />} />
