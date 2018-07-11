import React from 'react'
import {
  translate,
  BooleanField,
  Create,
  CheckboxGroupInput,
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

import FlatButton from 'material-ui/FlatButton';
import ActionDeleteIcon from 'material-ui/svg-icons/action/delete';
import RaisedButton from 'material-ui/RaisedButton'
import axios from "axios/index";
import properties from "../../../properties";


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

  const CustomDeleteButton = ({items, index}) => (
    <FlatButton
      key={index}
      secondary
      label="Delete"
      icon={<ActionDeleteIcon />}
      onClick={() => {
        // Take custom action
        console.log(items, index);
        items.remove(index);
      }}
    />
  )

  const CustomSubmitButton = ({items, index, other}) => (
    <FlatButton
      key={index}
      secondary
      icon={<RaisedButton label="Submit" primary={true} />}
      onClick={() => {
        const linkObjectToAdd = items.get(index)

        console.debug('this',this.props,props)
        if (linkObjectToAdd && linkObjectToAdd.linkedItemType2 && linkObjectToAdd.linkedItemKey2) {
          const linkedBody = {
            linkedItemType1: (this.props.linkedItemData.linkedItemType1.substr(0, 2) === 'm_') ? 'markers' : 'metadata',
            linkedItemType2: (linkObjectToAdd.linkedItemType2.substr(0, 2) === 'm_') ? 'markers' : 'metadata',
            linkedItemKey1: this.props.linkedItemData.linkedItemKey1,
            linkedItemKey2: linkObjectToAdd.linkedItemKey2,
            type1: linkObjectToAdd.type1,
            type2: linkObjectToAdd.type2,

          }

          axios.put(properties.chronasApiHost + '/metadata/links/addLink', JSON.stringify(linkedBody), {
              'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
            .then(() => {
              console.debug("linked added")
            })

        } else {
          alert('Both item type and key are required.')
        }
      }}
    />
  )

  return <Create {...props}>
    <LinksForm {...props} redirect='create'>
      <Subheader>Item to link</Subheader>
      <SelectInput validate={required} source='linkedItemType1' choices={contentType} onChange={(val, v) => { props.setLinkedItemData({ linkedItemType1: v }) }} defaultValue={props.linkedItemData.linkedItemType1} />
      <AutocompleteInput setLinkedItemData={props.setLinkedItemData} validate={required} source='linkedItemKey1' choices={props.linkedItemData.linkedItemKey1choice} label='resources.areas.fields.destinationItem' onSearchChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemType1, "linkedItemKey1choice" ) }} onChange={(val) => { return props.setSearchSnippet(val, props.linkedItemData.linkedItemKey1 ) }}
      />
      <Subheader>Items to link</Subheader>
      <Divider />
      <EmbeddedArrayInput allowRemove={false} customButtons={[<CustomDeleteButton />, <CustomSubmitButton />]} source='links'>
        <SelectInput validate={required} source='linkedItemType2' choices={contentType} onChange={(val, v) => { props.setLinkedItemData({ linkedItemType2: v }) }} defaultValue={props.linkedItemData.linkedItemType2} />
        <AutocompleteInput
          linkedItemData={props.linkedItemData}
          choices={props.linkedItemData.linkedItemKey2choice}
          onSearchChange={(val) => { console.debug('!!onSearchChange'); return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, "linkedItemKey2choice") }}
          onChange={(val) => { console.debug('!!onchange'); return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2 ) }}  validation={required} elStyle={{width: '60%', minWidth: '300px'}} source="linkedItemKey2" label="resources.areas.fields.linkedElement" />
        <CheckboxGroupInput label={'On destination item side:'} source="type1" choices={[
          { id: 'm', name: 'Show up in linked media gallery' },
          { id: 'c', name: 'Show up in content list' },
        ]} />
        <CheckboxGroupInput label={'On linked item side:'} source="type2" choices={[
          { id: 'm', name: 'Show up in linked media gallery' },
          { id: 'c', name: 'Show up in content list' },
        ]} />
      </EmbeddedArrayInput>
    </LinksForm>
  </Create>
}
