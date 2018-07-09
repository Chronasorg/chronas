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
    { name: '[Audio]', id: 'meta_audio' },
    { name: '[Epic]', id: 'meta_epic' },
    { name: '[External Article or Primary Source]', id: 'meta_text' },
    { name: '[HTML or Text]', id: 'html' },
    { name: '[Image] Artefact', id: 'artefacts' },
    { name: '[Image] Battle', id: 'battles' },
    { name: '[Image] City & Building', id: 'cities' },
    { name: '[Image] Person', id: 'people' },
    { name: '[Image] Other', id: 'misc' },
    { name: '[Podcast & Audio]', id: 'audios' },
    { name: '[Primary Source]', id: 'ps' },
    { name: '[Story]', id: 'meta_story' },
    { name: '[Video]', id: 'meta_video' },
    { name: '[Wiki Article] Artifacts', id: 'm_artifacts' },
    { name: '[Wiki Article] Battles -> Battles', id: 'm_battles' },
    { name: '[Wiki Article] Battles -> Sieges', id: 'm_sieges' },
    { name: '[Wiki Article] Cities -> Cities', id: 'm_cities' },
    { name: '[Wiki Article] Cities -> Castles', id: 'm_castles' },
    { name: '[Wiki Article] People -> Military', id: 'm_military' },
    { name: '[Wiki Article] People -> Politicians', id: 'politicians' },
    { name: '[Wiki Article] People -> Explorers', id: 'm_explorers' },
    { name: '[Wiki Article] People -> Scientists', id: 'm_scientists' },
    { name: '[Wiki Article] People -> Artists', id: 'm_artists' },
    { name: '[Wiki Article] People -> Religious', id: 'm_religious' },
    { name: '[Wiki Article] People -> Athletes', id: 'm_athletes' },
    { name: '[Wiki Article] People -> Unclassified', id: 'm_unclassified' },
    { name: '[Wiki Article] Other -> Area Info', id: 'm_areainfo' },
    { name: '[Wiki Article] Other -> Unknown', id: 'm_unknown' },
    { name: 'Other', id: 'meta_other' }
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
