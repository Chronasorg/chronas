import React from 'react'

import {
  BooleanField,
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
import EditButton from '../shared/buttons/EditButton'

export const AreaIcon = Icon

const AreaFilter = (props) => (
  <Filter {...props}>
    <TextInput label='pos.search' source='q' alwaysOn />
    <DateInput source='last_seen_gte' />
  </Filter>
)

const colored = WrappedComponent => props => props.record[props.source] > 500
  ? <span style={{ color: 'red' }}><WrappedComponent {...props} /></span>
  : <WrappedComponent {...props} />

const ColoredNumberField = colored(NumberField)
ColoredNumberField.defaultProps = NumberField.defaultProps

export const AreaList = (props) => {
  return <List {...props} filters={<AreaFilter />} sort={{ field: 'year', order: 'DESC' }} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source='year' label='resources.area.fields.year' />
      <TextField source='data' label='resources.area.fields.data' />
      <EditButton />
    </Datagrid>
  </List>
}

export const AreaEdit = (props) => {
  return <Edit title={<span>AreaEdit</span>} {...props}>
    <SimpleForm>
      <TextInput source='year' label='resources.area.fields.year' validation={required} />
      <LongTextInput source='data' label='resources.area.fields.data' validation={required} />
    </SimpleForm>
  </Edit>
}

export const AreaEditAll = (props) => {
  return <div title={<span>AreaEdit</span>} {...props}>
    lalalalalalalala
  </div>
}

export const AreaCreate = (props) => {
  return <Create {...props}>
    <SimpleForm redirect='list'>
      <TextInput source='year' label='resources.area.fields.year' validation={required} />
      <LongTextInput source='data' label='resources.area.fields.data' validation={required} />
    </SimpleForm>
  </Create>
}

const AreaDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.year}`}
</span>)

export const AreaDelete = (props) => <Delete {...props} title={<AreaDeleteTitle />} />
