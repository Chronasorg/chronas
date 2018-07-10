import React from 'react'
import {
  AutocompleteInput,
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
    List,
    LongTextInput,
    Edit,
    UrlField,
    BooleanInput,
    NumberField,
    NumberInput,
    ReferenceManyField,
    ReferenceArrayField,
    SelectInput,
    SimpleForm,
    TabbedForm,
    TextField,
    TextInput,
    required,
    minLength
} from 'admin-on-rest'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'
import AddIcon from 'material-ui/svg-icons/content/add'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import { Link } from 'react-router-dom'
import { BottomNavigation } from 'material-ui/BottomNavigation'
import BottomNavigationItem from '../../overwrites/BottomNavigationItem'
import Icon from 'material-ui/svg-icons/social/person'
import EditButton from '../shared/buttons/EditButton'
import DeleteButton from '../shared/buttons/DeleteButton'
import Delete from '../shared/crudComponents/Delete'
import ModGeoInput from '../shared/inputs/ModGeoInput'
import ModButton from '../shared/buttons/ModButton'
import { chronasMainColor } from '../../../styles/chronasColors'
import ArrayField from './ArrayField'
import LinkedForm from '../shared/forms/LinkedForm'
import { TYPE_LINKED } from '../../map/actionReducers'

export const LinkedIcon = Icon

const linkedTypes = [
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

const validateWiki = (values) => {
  const errors = {}
  if ((values.wiki && values.wiki !==  values.wiki.indexOf('.wikipedia.org/wiki/') === -1)) {
    errors.wiki = ['The URL needs to be a full Wikipedia URL']
  }
  return errors
}

const LinkedFilter = (props) => (
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

export const LinkedList = (props) => {
  return <List {...props} filters={<LinkedFilter />} sort={{ field: 'name', order: 'DESC' }} perPage={25}>
    <Datagrid bodyOptions={{ stripedRows: true, showRowHover: true }}>
      <TextField source='name' label='resources.linked.fields.name' />
      <UrlField source='id' label='resources.linked.fields.url' />
      <ArrayField source='coo' label='resources.linked.fields.coo' />
      <ChipField source='type' label='resources.linked.fields.type' />
      <NumberField source='year' label='resources.linked.fields.year' />
      <EditButton />
    </Datagrid>
  </List>
}

export const isNotAnImage = (urlPre) => {
  const url = urlPre.toLowerCase()
  return (url.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg)$/) === null)
}

export const isNotAnVideo = (urlPre) => {
  const url = urlPre.toLowerCase()

  if (url.indexOf("youtube") > -1 ||
    url.indexOf("youtu.be") > -1 ||
    url.indexOf("facebook") > -1 ||
    url.indexOf("vimeo") > -1 ||
    url.indexOf("streamable") > -1 ||
    url.indexOf("wistia") > -1 ||
    url.indexOf("dailymotion") > -1) return false

  return (url.toLowerCase().match(/\.(mp4|ogv|webm|png|svg)$/) === null)
}

export const isNotAnAudio = (urlPre) => {
  const url = urlPre.toLowerCase()

  if (url.indexOf("soundcloud") > -1 ||
    url.indexOf("mixcloud") > -1) return false

  return (url.toLowerCase().match(/\.(mp3)$/) === null)
}


export const LinkedEdit = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}
    if ((values.wiki && values.wiki !== (props.selectedItem.value.wiki || '') && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).wiki !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }

    return errors
  }


  return <div>
    <BottomNavigation
      // style={styles.articleHeader}
      // onChange={this.handleChange}
      selectedIndex={props.location.pathname === '/mod/linked/create' ? 0 : 1}>
      <BottomNavigationItem
        className='bottomNavigationItem'
        containerElement={<Link to='/mod/linked/create' />}
        label='Add'
        icon={<AddIcon />}
        // onClick={() => { this.select(4) }}
      />
      <BottomNavigationItem
        className='bottomNavigationItem'
        containerElement={<Link to='/mod/linked' />}
        label='Edit'
        icon={<EditIcon />}
        // onClick={() => { this.select(5) }}
      />
    </BottomNavigation>
    <Create title={'Edit Article'} {...props}>
    <LinkedForm validate={validateWikiProps} history={props.history} redirect='edit'>
      <SelectInput  onChange={(val, v) => { props.actOnRootTypeChange(v) }} source='subtype' choices={linkedTypes} label='resources.linked.fields.subtype' defaultValue={props.selectedItem.value.subtype} />
      <DisabledInput source='src' defaultValue={props.selectedItem.value.src || ''} label='resources.linked.fields.src' />
      <LongTextInput source='description' label='resources.linked.fields.description' defaultValue={props.selectedItem.value.title || (props.selectedItem.value.data || {}).title || ''} />
      <LongTextInput source='content' label='resources.linked.fields.content' defaultValue={props.selectedItem.value.content || (props.selectedItem.value.data || {}).content || ''} />
      <LongTextInput source='source' label='resources.linked.fields.source' type='url' defaultValue={props.selectedItem.value.source || ''} />
      <LongTextInput source='poster' label='resources.linked.fields.poster' type='url' defaultValue={(props.selectedItem.value.data || {}).poster || ''} />
      <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url' defaultValue={props.selectedItem.value.wiki || ''} />
      <h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4>
      <NumberInput validate={required} defaultValue={props.selectedItem.value.year || props.selectedItem.value.subtitle} source='year' label='resources.linked.fields.year' type='number' />
      <ModButton modType='marker' />
      <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} defaultValue={(props.selectedItem.value.coo || {})[0] || ''} source='coo[0]' label='resources.markers.fields.lat' />
      <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} defaultValue={(props.selectedItem.value.coo || {})[1] || ''} source='coo[1]' label='resources.markers.fields.lng' />
      <LongTextInput source='geojson' label='resources.linked.fields.geojson' defaultValue={props.selectedItem.value.geojson || ''} />
      <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent' defaultValue={props.selectedItem.value.type === '0'} />
      <DeleteButton id={encodeURIComponent(props.selectedItem.value.src)} {...props} />
    </LinkedForm>
    </Create>
  </div>
}

export const LinkedCreate = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}

    if (values.subtype === 'artefacts' &&
      values.subtype === 'battles' &&
      values.subtype === 'cities' &&
      values.subtype === 'people' &&
      values.subtype === 'misc' &&
      isNotAnImage(values.src || '')) {
      errors.src = ['This URL must lead to an image']
    } else if (values.subtype === 'videos' &&
      isNotAnVideo(values.src || '')) {
      errors.src = ['This URL must lead to a video']
    } else if (values.subtype === 'audios' &&
      isNotAnAudio(values.src || '')) {
      errors.src = ['This URL must lead to an audio']
    }

    if (values.src === '' && values.subtype !== 'html') {
      errors.src = ['This field is required for all but html entities']
    }

    if ((values.wiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki)) {
      errors.wiki = ['This URL must to be a full Wikipedia URL']
    }
    return errors
  }

  return <div>
    <BottomNavigation
      // style={styles.articleHeader}
      // onChange={this.handleChange}
      selectedIndex={props.location.pathname === '/mod/linked/create' ? 0 : 1}>
      <BottomNavigationItem
        className='bottomNavigationItem'
        containerElement={<Link to='/mod/linked/create' />}
        label='Add'
        icon={<AddIcon />}
        // onClick={() => { this.select(4) }}
      />
      <BottomNavigationItem
        className='bottomNavigationItem'
        containerElement={<Link to='/mod/linked' />}
        label='Edit'
        icon={<EditIcon />}
        // onClick={() => { this.select(5) }}
      />
    </BottomNavigation>
    <Create title={'Add Article'} {...props}>
    <LinkedForm validate={validateWikiProps} redirect='' history={props.history}>
      <SelectInput  onChange={(val, v) => { props.actOnRootTypeChange(v) }} validate={required} source='subtype' choices={linkedTypes} label='resources.linked.fields.subtype' />
      <LongTextInput source='src' type='url' label='resources.linked.fields.src' />
      <LongTextInput validate={required} source='description' label='resources.linked.fields.description' />
      <LongTextInput source='content' label='resources.linked.fields.content' />
      <LongTextInput source='source' label='resources.linked.fields.source' type='url' />
      <LongTextInput source='poster' label='resources.linked.fields.poster' type='url' />
      <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url' />
      <h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4>
      <NumberInput validate={required} defaultValue={props.selectedYear || ''} source='year' label='resources.linked.fields.year' type='number' />
      <ModButton modType='marker' />
      <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' />
      <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' />
      <LongTextInput source='geojson' label='resources.linked.fields.geojson' />
      <BooleanInput label="resources.linked.fields.onlyEpicContent" source="onlyEpicContent" defaultValue={false} />
    </LinkedForm>
    </Create>
  </div>
}

const LinkedDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const LinkedDelete = (props) => <Delete {...props} title={<LinkedDeleteTitle />} />
