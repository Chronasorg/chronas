import React from 'react'
import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
  List,
  LongTextInput,
  minLength,
  NumberField,
  NumberInput,
  ReferenceArrayField,
  ReferenceManyField,
  required,
  SelectInput,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  translate,
  UrlField
} from 'admin-on-rest'
import { EmbeddedArrayInput } from 'aor-embedded-array'
import AddEditLinkNavigation from '../../restricted/shared/AddEditLinkNavigation'
import Divider from 'material-ui/Divider'
import Icon from 'material-ui/svg-icons/social/person'
import EditButton from '../shared/buttons/EditButton'
import DeleteButton from '../shared/buttons/DeleteButton'
import Delete from '../shared/crudComponents/Delete'
import ModButton from '../shared/buttons/ModButton'
import ArrayField from './ArrayField'
import LinkedForm from '../shared/forms/LinkedForm'
import LinkedTabForm from '../shared/forms/LinkedTabForm'
import RichTextImageVideoInput from '../../overwrites/RichTextImageVideoInput'
import { epicIdNameArray, properties } from '../../../properties'
import { SortableSelectArrayInput } from '../shared/inputs/SortableSelectArrayInput'
import { TYPE_COLLECTION } from '../../map/actionReducers'

export const LinkedIcon = Icon

const validateWiki = (values) => {
  const errors = {}
  if ((typeof values.wiki === "string" && values.wiki !== values.wiki.indexOf('.wikipedia.org/wiki/') === -1)) {
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

  if (url.indexOf('youtube') > -1 ||
    url.indexOf('youtu.be') > -1 ||
    url.indexOf('facebook') > -1 ||
    url.indexOf('vimeo') > -1 ||
    url.indexOf('streamable') > -1 ||
    url.indexOf('wistia') > -1 ||
    url.indexOf('dailymotion') > -1) return false

  return (url.toLowerCase().match(/\.(mp4|ogv|webm|png|svg)$/) === null)
}

export const isNotAnAudio = (urlPre) => {
  const url = urlPre.toLowerCase()

  if (url.indexOf('soundcloud') > -1 ||
    url.indexOf('mixcloud') > -1) return false

  return (url.toLowerCase().match(/\.(mp3)$/) === null)
}

export const LinkedEdit = (props) => {
  const validateWikiProps = (values) => {
    const errors = {}
    const initWiki = props.selectedItem.value.wiki || ((props.selectedItem || {}).data || {}).wiki || ''
    if ((typeof values.wiki === "string" && values.wiki !== initWiki && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && (initWiki !== values.wiki)) {
      errors.wiki = ['The URL needs to be a full Wikipedia URL']
    }
    return errors
  }

  const isEdu = (((window.location || {}).host || '').substr(0, 4) === "edu.")
  const postType = ((props.contentTypeRaw || (props.selectedItem || {}).type) === TYPE_COLLECTION) ? (isEdu ? 'ce' : 'cc') : (props.contentTypeRaw || ((props.selectedItem || {}).data || {}).subtype)
  const isEpic = /* props.contentTypeRaw === */epicIdNameArray.map(el => el[0]).includes(postType)
  const isCollection = postType === 'cc' || postType === 'ce'
  const isEduCollection = postType === 'ce'

  // if (!isEpic && ((props.selectedItem.data || {})._id || "").substr(0, 2) === "e_") {
  //   props.actOnRootTypeChange("e")
  // }

  const choicesRuler = Object.keys(props.metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: props.metadata['ruler'][rulerId][0] }
  }) || {}

  let epicDefaults
  if (isEpic) {
    const selectedData = props.selectedItem.data
    epicDefaults = {
      subtype: selectedData.subtype,
      type: selectedData.type,
      src: selectedData._id,
      attacker: (((selectedData.data || {}).participants || [])[0] || []).map(el => {
        return { name: el }
      }),
      defender: (((selectedData.data || {}).participants || [])[1] || []).map(el => {
        return { name: el }
      }),
      description: (selectedData.data || {}).title,
      poster: (selectedData.data || {}).poster,
      wiki: selectedData.wiki,
      year: selectedData.year,
      end: (selectedData.data || {}).end,
    }
  }

  const potentialYear = typeof (((props.selectedItem || {}).value || {}).start || {}).getFullYear === 'function' && (((props.selectedItem || {}).value || {}).start || {}).getFullYear()
  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Edit'} {...props}>
      { isCollection ? <LinkedTabForm setRightDrawerVisibility={props.setRightDrawerVisibility} validate={validateWikiProps} defaultValue={(props.selectedItem || {}).data ? { ...(props.selectedItem || {}).data, subtype: isEdu ? 'ce' : 'cc' } : (props.selectedItem || {})} history={props.history} redirect='edit'>
        <FormTab label="General Information">
          <SelectInput onChange={(val, v) => {
            props.actOnRootTypeChange(v)
          }} source='subtype' choices={properties.linkedTypes} label='resources.linked.fields.type' defaultValue={props.contentTypeRaw || (isCollection ? postType : ((props.selectedItem || {}).value || {}).subtype)} />

          <LongTextInput validate={required} source='title' label='resources.linked.fields.description' defaultValue={(!props.selectedItem.value.className && props.selectedItem.value.title) || (props.selectedItem.value.data || {}).title || ''} />
          <RichTextImageVideoInput source='description' uploadAPI={"http://your.domain/api/v1/"} label='resources.linked.fields.collectionDescription' toolbar={[ ['bold', 'italic', 'underline', 'link', 'image'] ]} defaultValue={(!props.selectedItem.value.className && props.selectedItem.value.title) || (props.selectedItem.value.data || {}).title || ''} />
          <NumberInput defaultValue={(typeof props.selectedItem.value.year !== "undefined" && !isNaN(props.selectedItem.value.year)) ? props.selectedItem.value.year : (potentialYear && !isNaN(potentialYear)) ? potentialYear : props.selectedItem.value.subtitle } source='year' label='resources.linked.fields.year' type='number' />
          { isEduCollection && <BooleanInput label='resources.linked.fields.allowClickAway' source='allowClickAway' defaultValue={(((props.selectedItem || {}).value || {}).data || {}).allowOtherArticles === true} /> }
          <BooleanInput label='resources.linked.fields.drawRoute' source='drawRoute' defaultValue={(((props.selectedItem || {}).value || {}).data || {}).drawRoute === true} />
          <BooleanInput label='resources.linked.fields.changeYearByArticle' source='changeYearByArticle' defaultValue={(((props.selectedItem || {}).value || {}).data || {}).changeYearByArticle === true} />
          <BooleanInput label='resources.linked.fields.isStory' source='isStory' defaultValue={(((props.selectedItem || {}).value || {}).data || {}).isStory === true} />
          <BooleanInput label='resources.linked.fields.makePublic' source='isPublic' defaultValue={(((props.selectedItem || {}).value || {}).data || {}).isPublic === true} />
          <DeleteButton
            id={encodeURIComponent((epicDefaults || {}).src || props.selectedItem.value.src || props.selectedItem.value._id || props.selectedItem.value.id)} {...props} />
        </FormTab>
        <FormTab label={ isEduCollection ? "Lesson Slides" : "Article Slides" }>
          <SortableSelectArrayInput
            setLinkedItemData={props.setLinkedItemData}
            linkedItemData={props.linkedItemData}
            choices={props.linkedItemData.linkedItemKey2choice}
            onSearchChange={(val) => {
              return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, 'linkedItemKey2choice', true, true)
            }}
            onChange={(val) => {
              return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, false, true, true)
            }} validation={required} elStyle={{ width: '60%', minWidth: '300px' }}
            translate={props.translate}
            source='slides'
          />
        </FormTab>
        { isEduCollection && <FormTab label="Quiz">
          <EmbeddedArrayInput source="quiz" labelAdd='collections.quiz.addQuestion'>
            <LongTextInput source="question" label='collections.quiz.question' />
            <EmbeddedArrayInput source="answers" labelAdd='collections.quiz.addAnswer'
                                innerContainerStyle={{
                                  padding: '0',
                                  width: 'calc(100% - 146px)',
                                  display: 'inline-block',
                                }}
                                actionsContainerStyle={{
                                  width: '120px',
                                  float: 'right',
                                  marginTop: '36px'
                                }}
            >
              <LongTextInput label='collections.quiz.answer' source="answer" />
              <BooleanInput label='collections.quiz.isCorrect' source='isCorrect'/>
            </EmbeddedArrayInput>
          </EmbeddedArrayInput>
        </FormTab>}
      </LinkedTabForm> : <LinkedForm validate={validateWikiProps} defaultValue={epicDefaults || props.selectedItem.value}
        history={props.history} redirect='edit'>
        <SelectInput onChange={(val, v) => {
          props.actOnRootTypeChange(v)
        }} source='subtype' choices={properties.linkedTypes} label='resources.linked.fields.type'
          defaultValue={props.contentTypeRaw || props.selectedItem.value.subtype} />

        {isEpic && <AutocompleteInput options={{ fullWidth: true }} source='select' choices={props.epicsChoice}
          onSearchChange={(val) => {
            return props.setSearchEpic(val)
          }} onChange={(val, v) => {
            props.setMetadataEntity(v)
          }} label='resources.areas.fields.search_name' />}

        <DisabledInput source='src'
          defaultValue={props.selectedItem.value.src || props.selectedItem.value._id || props.selectedItem.value.id || ''}
          label='resources.linked.fields.src' />
        {isEpic && <EmbeddedArrayInput options={{ fullWidth: true }} source='attacker'>
          <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler}
            label='resources.areas.fields.attacker' />
        </EmbeddedArrayInput>}
        {isEpic && <EmbeddedArrayInput options={{ fullWidth: true }} source='defender'>
          <AutocompleteInput options={{ fullWidth: true }} source='name' choices={choicesRuler}
            label='resources.areas.fields.defender' />
        </EmbeddedArrayInput>}
        <LongTextInput source='description' label='resources.linked.fields.description'
          defaultValue={(!props.selectedItem.value.className && props.selectedItem.value.title) || (props.selectedItem.value.data || {}).title || ''} />
        {!isEpic && <LongTextInput source='source' label='resources.linked.fields.source' type='url'
          defaultValue={props.selectedItem.value.source || ((props.selectedItem.value || {}).data || {}).source || ''} />}
        <LongTextInput source='poster' label='resources.linked.fields.poster' type='url'
          defaultValue={(props.selectedItem.value.data || {}).poster || ''} />
        <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url'
          defaultValue={((props.selectedItem || {}).value || {}).wiki || props.selectedItem.wiki || ''} />
        {/* <h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4> */}
        <NumberInput style={isEpic ? { width: '50%', float: 'left' } : {}} validate={required}
          defaultValue={(typeof props.selectedItem.value.year !== "undefined" && !isNaN(props.selectedItem.value.year)) ? props.selectedItem.value.year : (potentialYear && !isNaN(potentialYear)) ? potentialYear : props.selectedItem.value.subtitle }
          source='year' label='resources.linked.fields.year' type='number' />
        {isEpic && <NumberInput style={{ width: '50%', float: 'right' }} source='end'
          defaultValue={!isNaN((props.selectedItem.value.data || {}).end) ? (props.selectedItem.value.data || {}).end : !isNaN(props.selectedItem.value.year) ? props.selectedItem.value.year : props.selectedItem.value.subtitle}
          label='resources.areas.fields.endYear' />}
        {!isEpic && <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />}
        {!isEpic && <NumberInput style={{ width: '30%', float: 'left' }} onChange={(val, v) => {
          props.setModDataLng(+v)
        }} defaultValue={(props.selectedItem.value.coo || {})[1] || ''} source='coo[1]'
          label='resources.markers.fields.lat' />}
        {!isEpic && <NumberInput style={{ width: '30%', float: 'right' }} onChange={(val, v) => {
          props.setModDataLat(+v)
        }} defaultValue={(props.selectedItem.value.coo || {})[0] || ''} source='coo[0]'
          label='resources.markers.fields.lng' />}
        {!isEpic && <LongTextInput source='geojson' label='resources.linked.fields.geojson'
          defaultValue={props.selectedItem.value.geojson || ''} />}
        {!isEpic && <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent'
          defaultValue={props.selectedItem.value.type === '0'} />}
        <DeleteButton
          id={encodeURIComponent((epicDefaults || {}).src || props.selectedItem.value.src || props.selectedItem.value._id || props.selectedItem.value.id)} {...props} />
      </LinkedForm>}
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
    } else if (values.subtype === 'v' &&
      isNotAnVideo(values.src || '')) {
      errors.src = ['This URL must lead to a video']
    } else if (values.subtype === 'audios' &&
      isNotAnAudio(values.src || '')) {
      errors.src = ['This URL must lead to an audio']
    }

    if (values.src === '' && values.subtype !== 'h') {
      errors.src = ['This field is required for all but html entities']
    }

    if ((typeof values.wiki === "string" && values.wiki.indexOf('.wikipedia.org/wiki/') === -1) && ((props.selectedItem.value || {}).w !== values.wiki)) {
      errors.wiki = ['This URL must to be a full Wikipedia URL']
    }

    return errors
  }

  const isEdu = (((window.location || {}).host || '').substr(0, 4) === "edu.")
  const postType = ((props.contentTypeRaw || (props.selectedItem || {}).type) === TYPE_COLLECTION) ? (isEdu ? 'ce' : 'cc') : (props.contentTypeRaw || ((props.selectedItem || {}).data || {}).subtype)
  const isCollection = postType === 'cc' || postType === 'ce'
  const isEduCollection = postType === 'ce'

  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Add Article'} {...props}>
      { isCollection ? <LinkedTabForm  history={props.history} setRightDrawerVisibility={props.setRightDrawerVisibility} validate={validateWikiProps} redirect='create'>
        <FormTab label="General Information">
          <SelectInput onChange={(val, v) => {
            props.actOnRootTypeChange(v)
          }} source='subtype' choices={properties.linkedTypes} label='resources.linked.fields.type' defaultValue={props.contentTypeRaw || (isCollection ? postType : ((props.selectedItem || {}).value || {}).subtype)} />

          <LongTextInput validate={required} source='title' label='resources.linked.fields.description' />
          <RichTextImageVideoInput source='description' label='resources.linked.fields.collectionDescription' toolbar={[ ['bold', 'italic', 'image', 'underline', 'link'] ]} />
          <NumberInput source='year' label='resources.linked.fields.year' type='number' />
          <NumberInput style={{ width: '30%', float: 'right' }} type='number' source='yearRange[0]' label='Start Year Limit' />
          <NumberInput style={{ width: '30%', float: 'right' }} type='number' source='yearRange[1]' label='End Year Limit' />
          { isEduCollection && <BooleanInput label='resources.linked.fields.allowClickAway' source='allowClickAway' /> }
          <BooleanInput label='resources.linked.fields.drawRoute' source='drawRoute' />
          <BooleanInput label='resources.linked.fields.changeYearByArticle' source='changeYearByArticle' />
          <BooleanInput label='resources.linked.fields.isStory' source='isStory' />
          <BooleanInput label='resources.linked.fields.makePublic' source='isPublic' />
        </FormTab>
        <FormTab label={ isEduCollection ? "Lesson Slides" : "Article Slides" }>
          <SortableSelectArrayInput
            setLinkedItemData={props.setLinkedItemData}
            linkedItemData={props.linkedItemData}
            choices={props.linkedItemData.linkedItemKey2choice}
            onSearchChange={(val) => {
              return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, 'linkedItemKey2choice', true, true)
            }}
            onChange={(val) => {
              return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, false, true, true)
            }} validation={required} elStyle={{ width: '60%', minWidth: '300px' }}
            translate={props.translate}
            source='slides'
          />
        </FormTab>
        { isEduCollection && <FormTab label="Quiz">
          <EmbeddedArrayInput source="quiz" labelAdd='collections.quiz.addQuestion'>
            <LongTextInput source="question" label='collections.quiz.question' />
            <EmbeddedArrayInput source="answers" labelAdd='collections.quiz.addAnswer'
                                innerContainerStyle={{
                                  padding: '0',
                                  width: 'calc(100% - 146px)',
                                  display: 'inline-block',
                                }}
                                actionsContainerStyle={{
                                  width: '120px',
                                  float: 'right',                                  /* position: absolute; */
                                  marginTop: '36px'
                                }}
            >
              <LongTextInput label='collections.quiz.answer' source="answer" />
              <BooleanInput label='collections.quiz.isCorrect' source='isCorrect'/>
            </EmbeddedArrayInput>
          </EmbeddedArrayInput>
        </FormTab>}
      </LinkedTabForm> : <LinkedForm validate={validateWikiProps} redirect='' history={props.history}>
        <SelectInput onChange={(val, v) => {
          props.actOnRootTypeChange(v)
        }} validate={required} source='subtype' choices={properties.linkedTypes}
          defaultValue={props.contentTypeRaw}
          label='resources.linked.fields.subtype' />
        <LongTextInput source='src' type='url' label='resources.linked.fields.src' />
        <LongTextInput validate={required} source='description' label='resources.linked.fields.description' />
        <LongTextInput source='content' label='resources.linked.fields.content' />
        <LongTextInput source='source' label='resources.linked.fields.source' type='url' />
        <LongTextInput source='poster' label='resources.linked.fields.poster' type='url' />
        <LongTextInput source='wiki' label='resources.linked.fields.wiki' type='url' />
        {/* <h4>Markers and areas with the same Wikipedia article, are automatically linked with this item. If neither exist yet, consider creating a new [Marker]() or [Area]().</h4> */}
        <NumberInput validate={required} defaultValue={!isNaN(props.selectedYear) ? props.selectedYear : ''} source='year'
          label='resources.linked.fields.year' type='number' />
        <ModButton style={{ width: '30%', float: 'left', marginTop: '28px' }} modType='marker' />
        <NumberInput style={{ width: '30%', float: 'left' }} onChange={(val, v) => {
          props.setModDataLng(+v)
        }} source='coo[1]' label='resources.markers.fields.lat' />
        <NumberInput style={{ width: '30%', float: 'right' }} onChange={(val, v) => {
          props.setModDataLat(+v)
        }} source='coo[1]' label='resources.markers.fields.lng' />
        <LongTextInput source='geojson' label='resources.linked.fields.geojson' />
        <BooleanInput label='resources.linked.fields.onlyEpicContent' source='onlyEpicContent' defaultValue={false} />
      </LinkedForm>}
    </Create>
  </div>
}

const LinkedDeleteTitle = translate(({ record, translate }) => <span>
  {translate('resources.page.delete')}&nbsp;
  {record && `${record.id}`}
</span>)

export const LinkedDelete = (props) => <Delete {...props} title={<LinkedDeleteTitle />} />
