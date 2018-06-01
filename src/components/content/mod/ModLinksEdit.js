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
  Delete, SimpleForm,
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
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'
import { EmbeddedArrayInput } from 'aor-embedded-array'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import SelectArrayInput from '../../restricted/shared/inputs/SelectArrayInput'
import LinksForm from '../../restricted/shared/forms/LinksForm'
import ModButton from '../../restricted/shared/buttons/ModButton'
import utils from '../../map/utils/general'
import ColorInput from 'aor-color-input'

export const ModLinksEdit = (props) => {
  const { metadata } = props

  const contentType = [
    { id: 'meta_audio', name: 'Audio' },
    { id: 'meta_epic', name: 'Epic' },
    { id: 'meta_text', name: 'External Article or Primary Source' },
    { id: 'meta_image', name: 'Image' },
    { id: 'meta_story', name: 'Story' },
    { id: 'meta_video', name: 'Video' },
    { id: 'meta_other', name: 'Other' },
    { name: '[Marker] Artifacts', id: 'm_artifacts' },
    { name: '[Marker] Battles -> Battles', id: 'm_battles' },
    { name: '[Marker] Battles -> Sieges', id: 'm_sieges' },
    { name: '[Marker] Cities -> Cities', id: 'm_cities' },
    { name: '[Marker] Cities -> Castles', id: 'm_castles' },
    { name: '[Marker] People -> Military', id: 'm_military' },
    { name: '[Marker] People -> Politicians', id: 'politicians' },
    { name: '[Marker] People -> Explorers', id: 'm_explorers' },
    { name: '[Marker] People -> Scientists', id: 'm_scientists' },
    { name: '[Marker] People -> Artists', id: 'm_artists' },
    { name: '[Marker] People -> Religious', id: 'm_religious' },
    { name: '[Marker] People -> Athletes', id: 'm_athletes' },
    { name: '[Marker] People -> Unclassified', id: 'm_unclassified' },
    { name: '[Marker] Other -> Area Info', id: 'm_areainfo' },
    { name: '[Marker] Other -> Unknown', id: 'm_unknown' }
  ]

  return <Create {...props}>
    <LinksForm {...props} redirect='create'>
      <Subheader>Item to link</Subheader>
      <SelectInput validate={required} source='linkedItemType1' choices={contentType} onChange={(val, v) => { props.setLinkedItemData({ linkedItemType1: v }) }} defaultValue={props.linkedItemData.linkedItemType1} />
      <AutocompleteInput setLinkedItemData={props.setLinkedItemData} validate={required} source='linkedItemKey1' choices={props.linkedItemData.linkedItemKey1choice} label='resources.areas.fields.participant' onSearchChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemType1, "linkedItemKey1choice" ) }} onChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemKey1 ) }}
      />
      <Subheader>Items to link</Subheader>
      <SelectInput validate={required} source='linkedItemType2' choices={contentType} onChange={(val, v) => { props.setLinkedItemData({ linkedItemType2: v }) }} defaultValue={props.linkedItemData.linkedItemType2} />
      <SelectArrayInput
        linkedItemData={props.linkedItemData}
        choices={props.linkedItemData.linkedItemKey2choice}
        onSearchChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, "linkedItemKey2choice") }}
        onChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2 ) }}  validation={required} elStyle={{width: '60%', minWidth: '300px'}} source="linkedItemKey2" label="resources.areas.fields.province_list" />
      <Divider />
    </LinksForm>
  </Create>
}
