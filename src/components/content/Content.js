import React, { Component } from 'react'
import compose from 'recompose/compose'
import axios from 'axios'

import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Badge from 'material-ui/Badge'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper'
import { defaultTheme, showNotification, translate } from 'admin-on-rest'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ContentMovie from 'material-ui/svg-icons/maps/local-movies'
import ContentImage from 'material-ui/svg-icons/image/image'
import ContentAudio from 'material-ui/svg-icons/image/audiotrack'
import ContentLink from 'material-ui/svg-icons/content/link'
import QAAIcon from 'material-ui/svg-icons/action/question-answer'
import { setRightDrawerVisibility, toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { resetModActive, setFullModActive } from '../restricted/shared/buttons/actionReducers'
import {
  deselectItem as deselectItemAction, selectCollectionItem,
  selectValue,
  setData,
  TYPE_AREA,
  TYPE_COLLECTION,
  TYPE_EPIC,
  TYPE_LINKED,
  TYPE_MARKER,
  WIKI_PROVINCE_TIMELINE
} from '../map/actionReducers'
import LinkedGallery from './contentMenuItems/LinkedGallery'
import LinkedQAA from './contentMenuItems/LinkedQAA'
import utils from '../map/utils/general'
import ArticleIframe from './ArticleIframe'
import EpicTimeline from './EpicTimeline'
import ProvinceTimeline from './ProvinceTimeline'
import { properties, themes } from '../../properties'

const sanitizeHtml = require('sanitize-html')
const sanitizeOptions = {
  allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'img',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe' ],
  allowedAttributes: {
    a: [ 'href', 'name', 'target' ],
    // We don't currently allow img itself by default, but this
    // would make sense if we did. You could add srcset here,
    // and if you do the URL is checked for safety
    img: [ 'src', 'width', 'height' ],
    iframe: [ 'src' ]
  },
// Lots of these won't come up by default because we don't allow them
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
// URL schemes we permit
  allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
  allowProtocolRelative: true,
  allowedIframeHostnames: ['www.youtube.com', 'https://www.youtube.com', 'youtube.com', 'player.vimeo.com']
}

const MOVIETYPES = ['v']
const IMAGETYPES = ['people', 'battle', 'artefacts', 'cities', 'misc']
const AUDIOTYPES = ['audios']

const styles = {
  contentLeftMenu: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
    position: 'fixed',
    left: '-70px',
    top: '48px',
    width: '64px',
    overflow: 'hidden'
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 0px',
    boxShadow: 'inset 0 5px 6px -3px rgba(0,0,0,.4)',
    background: 'white'
  },
  menuIcon: {
    left: 20
  },
  qaaIcon: {
    left: 20,
    fill: 'rgb(117, 117, 117)'
  },
  menuIconBadge: {
    top: '-4px',
    left: '14px',
    fontSize: '12px',
    width: '20px',
    height: '20px'
  },
  menuIconBadgeContainer1: {
    fill: 'rgb(117, 117, 117)',
    left: '-8px',
    position: 'absolute',
    top: '-4px',
    width: '16px',
    height: '16px'
  },
  menuIconBadgeContainer2: {
    fill: 'rgb(117, 117, 117)',
    left: '6px',
    position: 'absolute',
    top: '-4px',
    width: '16px',
    height: '16px'
  },
  menuIconBadgeContainer3: {
    fill: 'rgb(117, 117, 117)',
    left: '-8px',
    position: 'absolute',
    top: '13px',
    width: '16px',
    height: '16px'
  },
  menuIconBadgeContainer4: {
    fill: 'rgb(117, 117, 117)',
    left: '6px',
    position: 'absolute',
    top: '13px',
    width: '16px',
    height: '16px'
  },
  menuItem: {
    width: '64px'
  },
  iframe: {
    display: 'block',
    padding: '2px 8px',
    border: 'none',
    overflow: 'auto'
  }
}

class Content extends Component {
  state = {
    iframeLoading: true,
    iframeSource: '',
    selectedWiki: null,
    hasQuestions: false,
    sunburstData: [],
    quizFinished: false,
    quizStepIndex: 0,
    quizSelected: [],
    activeContentMenuItem: (localStorage.getItem('chs_activeContentMenuItem') !== null) ? localStorage.getItem('chs_activeContentMenuItem') : 'linked'
  }

  quizIsSelected = (index) => {
    return (this.state.quizSelected[this.state.quizStepIndex] || []).indexOf(index) !== -1
  }

  quizHandleRowSelection = (selectedRows) => {
    const { quizSelected } = this.state
    if (JSON.stringify(selectedRows) === "[]") return
    quizSelected[this.state.quizStepIndex] = selectedRows
    this.setState({ quizSelected })
  }

  componentDidMount = () => {
    this.setState({ iframeLoading: true })
    this._handleNewData(this.props.selectedItem, this.props.metadata, this.props.activeArea)
  }

  componentDidCatch(error, info) {
    this.props.showNotification('somethingWentWrong', 'confirm')
  }

  componentWillUnmount = () => {
    // TODO: this is not called on historypush!
    this.setState({
      iframeLoading: true,
      selectedWiki: null,
      hasQuestions: false,
    })
    this._cleanUp()
  }

  selectValueWrapper = (value) => {
    this.props.selectValue(value)
  }

  _setHasQuestions = (val) => {
    this.setState({ hasQuestions: val })
  }

  setWikiIdWrapper = (wiki) => {
    this.setState({ selectedWiki: wiki })
  }

  _cleanUp = () => {
    this.props.resetModActive()
  }

  _setContentMenuItem = (newContentMenuItem) => {
    localStorage.setItem('chs_activeContentMenuItem', newContentMenuItem)
    this.setState({ activeContentMenuItem: newContentMenuItem })
  }

  _toggleContentMenuItem = (preContentMenuItem) => {
    const newContentMenuItem = (preContentMenuItem === this.state.activeContentMenuItem) ? '' : preContentMenuItem
    localStorage.setItem('chs_activeContentMenuItem', newContentMenuItem)
    this.setState({ activeContentMenuItem: newContentMenuItem })
  }

  _handleNewData = (selectedItem, metadata, activeArea, doCleanup = false) => {
    const { setData, showNotification, setFullModActive, resetModActive } = this.props

    const isMarker = selectedItem.type === TYPE_MARKER
    const isCollection = selectedItem.type === TYPE_COLLECTION
    const isMedia = selectedItem.type === TYPE_LINKED
    const isArea = selectedItem.type === TYPE_AREA

    let selectedWiki = null

    if (doCleanup) this._cleanUp()

    if (isArea) {
      const selectedProvince = selectedItem.value
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
      const activeprovinceValue = (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]
      const sunburstData = []
      const sunburstDataMeta = {}
      const activeData = activeArea.data

      if (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE) {
        console.error('setting up sunburst data, this should only be done once', activeprovinceValue)
        Object.keys(activeData).forEach((provKey) => {
          const currProvData = activeData[provKey]
          if (currProvData[utils.activeAreaDataAccessor(activeAreaDim)] === activeprovinceValue) {
            const ruler = metadata['ruler'][currProvData[utils.activeAreaDataAccessor('ruler')]] || {}
            const culture = metadata['culture'][currProvData[utils.activeAreaDataAccessor('culture')]] || {}
            const religion = metadata['religion'][currProvData[utils.activeAreaDataAccessor('religion')]] || {}
            const religionGeneral = metadata['religionGeneral'][(metadata['religion'][currProvData[utils.activeAreaDataAccessor('religion')]] || {})[3]] || {}

            const hasLocaleMetadata = typeof ((metadata || {}).locale || {}).ruler !== "undefined"

            let newRuler, newCulture, newReligion, newReligionGeneral
            if (hasLocaleMetadata) {
              newRuler = metadata.locale['ruler'][currProvData[utils.activeAreaDataAccessor('ruler')]] || ruler[0]
              newCulture = metadata.locale['culture'][currProvData[utils.activeAreaDataAccessor('culture')]] || culture[0]
              newReligion = metadata.locale['religion'][currProvData[utils.activeAreaDataAccessor('religion')]] || religion[0]
              newReligionGeneral = metadata.locale['religionGeneral'][currProvData[utils.activeAreaDataAccessor('religionGeneral')]] || religionGeneral[0]
            } else {
              newRuler = ruler[0]
              newCulture = culture[0]
              newReligion = religion[0]
              newReligionGeneral = religionGeneral[0]
            }

            const objectToPush =
              {
                province: provKey,
                ruler: newRuler,
                culture: newCulture,
                religion: newReligion,
                religionGeneral: newReligionGeneral,
                size: currProvData[utils.activeAreaDataAccessor('population')]
              }

            sunburstDataMeta[provKey] = (metadata['province'][provKey] || {})
            sunburstDataMeta[newRuler] = ruler
            sunburstDataMeta[newCulture] = culture
            sunburstDataMeta[newReligion] = religion
            sunburstDataMeta[newReligionGeneral] = religionGeneral

            delete objectToPush[activeAreaDim]
            sunburstData.push(objectToPush)
          }
        })
        this.setState({
          sunburstData: [sunburstData, sunburstDataMeta]
        })
      }

      selectedWiki = (activeAreaDim === 'religionGeneral')
        ? (metadata[activeAreaDim][(metadata.religion[activeprovinceValue] || [])[3]] || {})[2]
        : (activeAreaDim === 'province' || activeAreaDim === 'capital')
          ? (metadata[activeAreaDim][activeprovinceValue] || {})
          : (metadata[activeAreaDim][activeprovinceValue] || {})[2]
    }
    else if (isMarker || isCollection) {
      selectedWiki = selectedItem.wiki
    } else if (isMedia) {
      selectedWiki = selectedItem.wiki
      axios.get(properties.chronasApiHost + '/markers/' + selectedWiki)
        .then((linkedMarkerResult) => {
          if (linkedMarkerResult.status === 200) {
            const linkedMarker = linkedMarkerResult.data
            showNotification('Linked marker found')
            setFullModActive(TYPE_LINKED, linkedMarker.coo, '', false)
          } else {
            showNotification('No linked marker found, consider adding one')
          }
        })
    }

    if (selectedWiki !== this.state.selectedWiki) {
      this.setState({
        iframeLoading: true,
        selectedWiki: selectedWiki
      })

      if (isCollection && selectedItem.data) return
      // const selectedProvince = selectedItem.value
      const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
      let activeprovinceValue = utils.getAreaDimKey(metadata, activeArea, selectedItem)
      const linkId = ((((selectedItem || {}).value || {}).subtype === 'ei') ? '1:e_' : (isMarker && (((selectedItem || {}).value || {}).subtype !== 'ps')) ? '0:' : '1:') + (isArea ? ('ae|' + activeAreaDim + '|' + activeprovinceValue) : selectedWiki)

      const urlMetadataLinks = isCollection ? properties.chronasApiHost + '/collections/' + (selectedItem || {}).wiki : properties.chronasApiHost + '/metadata/links/getLinked?source=' + window.encodeURIComponent(linkId)
      axios.get(urlMetadataLinks, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}})
        .then((linkedItemResult) => {
          if (linkedItemResult.status === 200) {
            const res = linkedItemResult.data
            let potentialStartingWiki
            if (isCollection) {
              potentialStartingWiki = (((res.map || [])[0] || {}).properties || {}).w
            //   if (!potentialStartingWiki) {
            //     return showNotification('No linked slides for this collection found')
            //   }
            //   return this.props.selectCollectionItem(potentialStartingWiki, res)
            }

            const linkedItems = {
              media: [],
              content: [],
              id: linkId
            }

            res.media.forEach((imageItem) => {
              linkedItems.media.push({
                src: ((imageItem || {}).properties || {}).id || imageItem._id || imageItem.properties.w,
                wiki: imageItem.wiki || imageItem.properties.w,
                title: imageItem.name || (imageItem.data || {}).title || imageItem.properties.n,
                subtype: imageItem.subtype || imageItem.properties.t,
                source: (imageItem.data || {}).source || imageItem.properties.src,
                subtitle: (!imageItem.year || isNaN(imageItem.year)) ? imageItem.properties.n : imageItem.year,
                year: (!imageItem.year || isNaN(imageItem.year)) ? imageItem.properties.y : imageItem.year,
                score: imageItem.score || imageItem.properties.s,
              })
            })
            linkedItems.content = res.map.sort((a, b) => {
              if (isCollection) {
                return (+a.order || 0) - (+b.order || 0)
              }
              return +(a.properties.y || -5000) - +(b.properties.y || -5000)
            })
            linkedItems.media = linkedItems.media.sort((a, b) => (+a.order || +b.score || 0) - (+b.order || +a.score || 0))

            showNotification(linkedItems.media.length + ' linked media item' + ((linkedItems.media.length === 1) ? '' : 's') + ' found')
            setData(isCollection ? { ...res, ...linkedItems } : linkedItems, isCollection ? potentialStartingWiki : false)
          } else {
            showNotification('No linked items found, consider adding one') // TODO: notifications don't seem to work on this page
          }
        })
    }

    // religionGeneral - religion - culture - prov
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedYear !== nextProps.selectedYear ||
      this.props.selectedItem.value !== nextProps.selectedItem.value ||
      this.props.selectedItem.wiki !== nextProps.selectedItem.wiki ||
      this.props.selectedItem.type !== nextProps.selectedItem.type ||
      this.props.activeArea.color !== nextProps.activeArea.color) {
      this._handleNewData(nextProps.selectedItem, nextProps.metadata, nextProps.activeArea, nextProps.selectedItem.value === '')
    }
  }

  handleNext = () => {
    const {quizStepIndex} = this.state
    const questionCount = (((this.props.selectedItem || {}).data || {}).quiz || []).length
    this.setState({
      quizStepIndex: quizStepIndex + 1,
      quizFinished: quizStepIndex >= questionCount-1,
    })
  }

  handlePrev = () => {
    const {quizStepIndex} = this.state
    if (quizStepIndex > 0) {
      this.setState({quizStepIndex: quizStepIndex - 1})
    }
  }

  // getStepContent(stepIndex) {
  //   switch (stepIndex) {
  //     case 0:
  //       return 'Select campaign settings...';
  //     case 1:
  //       return 'What is an ad group anyways?';
  //     case 2:
  //       return 'This is the bit I really care about!';
  //     default:
  //       return 'You\'re a long way from home sonny jim!';
  //   }
  // }

  render () {
    const { activeContentMenuItem, hasQuestions, sunburstData, iframeLoading, selectedWiki } = this.state
    const { activeArea, deselectItem, selectedItem, influenceRawData, provinceEntity, selectedYear, setMetadataType, showNotification, theme, metadata, newWidth, history, stepIndex, setMetadataEntity } = this.props

    const finalLinkedItems = /* (linkedItems || {}).id ? linkedItems : */selectedItem.data || {
      media: [],
      content: [],
      id: ''
    }

    const activeAreaDim = (activeArea.color === 'population') ? 'capital' : activeArea.color
    const entityTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && selectedItem.type === TYPE_AREA)
    const epicTimelineOpen = (selectedItem.wiki !== WIKI_PROVINCE_TIMELINE && selectedItem.type === TYPE_EPIC)
    const provinceTimelineOpen = (selectedItem.wiki === WIKI_PROVINCE_TIMELINE)
    const isCollection = selectedItem.type === TYPE_COLLECTION
    const isMarker = selectedItem.type === TYPE_MARKER
    const isMedia = selectedItem.type === TYPE_LINKED
    const linkedCount = (finalLinkedItems.media || []).length
    const hasLinkedImage = (finalLinkedItems.media || []).some(lI => IMAGETYPES.includes(lI.subtype))
    const hasLinkedMovie = (finalLinkedItems.media || []).some(lI => MOVIETYPES.includes(lI.subtype))
    const hasLinkedAudio = (finalLinkedItems.media || []).some(lI => AUDIOTYPES.includes(lI.subtype))
    const hasLinkedOther = linkedCount > 0
    const linkedActive = ((activeContentMenuItem === 'linked' && hasLinkedOther) || (activeContentMenuItem ===  'forcelinked'))
    const haslocale = typeof ((metadata || {}).locale || {}).ruler !== "undefined"
    let rulerProps
    if ((entityTimelineOpen || epicTimelineOpen)) {
      if (entityTimelineOpen) {
        rulerProps = metadata[activeAreaDim][influenceRawData.id]
        if (haslocale) {
          const newName = metadata.locale[activeAreaDim][influenceRawData.id]
          if (newName) rulerProps[0] = newName
        }
      } else {
        rulerProps = (selectedItem.data.rulerEntities || []).map(el => metadata['ruler'][el.id])
      }
    }

    const safeSelectedWiki = (isCollection && (!selectedItem.data || stepIndex === -1)) ? null : isCollection ? (((selectedItem.data.content[stepIndex] || {}).properties || {}).w) : selectedWiki

    let ownerAvatar, ownerUsername, htmlContent
    if (isCollection) {
      const collectionData = ((selectedItem || {}).data || {})
      const hasQuiz = (collectionData.quiz || []).length > 0
      const sanitizedHtmlDescription = sanitizeHtml(collectionData.description || '', sanitizeOptions)
      if (selectedItem.data && stepIndex === -1) {
        ownerAvatar = collectionData.avatar
        ownerUsername = collectionData.owner
        htmlContent = <div id="articleIframe"><Card style={{
          marginTop: '3em',
          backgroundColor: 'rgba(0,0,0,0)',
          boxShadow: 'none'
        }}>
          <CardText>
            <p>
              <h1>{collectionData.title}</h1>
              <span style={{ opacity: 0.6 }}>{(collectionData.slides || []).length} Articles</span>
              <span style={{ paddingLeft: '8px' }}>by {ownerAvatar ? <Avatar
                size={24}
                style={{ top: -5, position: 'relative' }}
                src={ownerAvatar} /> : <Avatar
                style={{ top: -5, position: 'relative', fontSize: 16 }}
                size={24}
                color={{
                  // color: themes[theme].foreColors[0],
                  // backgroundColor: themes[theme].backColors[0]
                }}
                src={ownerAvatar}><span style={{
                fontWeight: 'bolder',
                color: themes[theme].backColors[0]
              }}>{(ownerUsername || ' ').substr(0, 1).toUpperCase()}</span></Avatar>
              } {ownerUsername}</span>
            </p>
            { sanitizedHtmlDescription && <p>
              <span dangerouslySetInnerHTML={{ __html: sanitizedHtmlDescription }} />
            </p> }
            <br />
            <div>
              <RaisedButton label="Start" onClick={() => {
                this.props.setCollectionIndex(0)
              }} />
            </div>

            {hasQuiz && <div>
              <br />
              <Divider />
              <p>
                Includes a quiz at the end with <span style={{ fontWeight: 600 }}>{(collectionData.quiz || []).length}</span> question(s).
              </p>
            </div>}
          </CardText>
        </Card></div>
      }
      else if (hasQuiz && stepIndex === (selectedItem.data.slides || []).length) {
        const { quizFinished, quizSelected, quizStepIndex } = this.state
        const quizData = collectionData.quiz
        const contentStyle = { margin: '0 16px' }
        const currQuestion = quizData[quizStepIndex] && quizData[quizStepIndex].question
        const currAnswers = quizData[quizStepIndex] && <TableBody style={{ backgroundColor: themes[theme].backColors[0], cursor: 'pointer' }} showRowHover={true} stripedRows={false}>
          {quizData[quizStepIndex].answers.map((el, i) => { return <TableRow selected={this.quizIsSelected(i)}>
          <TableRowColumn>{el.answer}</TableRowColumn>
        </TableRow>})}
        </TableBody>
        htmlContent = <div id="articleIframe" style={{ width: '100%', maxWidth: 700, paddingTop: '2em', margin: 'auto' }}>
          <Stepper activeStep={quizStepIndex}>
            {quizData.map(() => <Step>
              <StepLabel/>
            </Step>)}
          </Stepper>
          <div style={contentStyle}>
            {quizFinished ? (<div>
                <p>
                    Congratulations! You completed all slides and finished the quiz.
                </p>
                <p>
                You can now submit to send your lecturer the test report and your quiz performance.
                </p>
                <p>
                  <RaisedButton
                    label={'Submit'}
                    onClick={(event) => {
                      showNotification("Successfully submitted, redirecting now...")
                      setTimeout(() => window.location.href="https://chronas.org", 2000)
                      console.debug(JSON.stringify(this.state.quizSelected), JSON.stringify(this.props.selectedItem))
                      console.debug(this.state)
                      event.preventDefault();
                      // this.setState({quizStepIndex: 0, quizFinished: false});
                    }}
                  />
                </p>
                <Divider />
                <p>
                  On Submit you will be redirected to Chronas Home. Thank you for participating!
                </p>
              </div>
            ) : (
              <div>
                <div style={{ marginTop: 12, backgroundColor: themes[theme].backColors[0] }}>
                  <Table headerStyle={{ backgroundColor: themes[theme].backColors[0] }} bodyStyle={{ backgroundColor: themes[theme].backColors[0], cursor: 'pointer' }} multiSelectable={false} onRowSelection={this.quizHandleRowSelection}>
                    <TableHeader style={{ backgroundColor: themes[theme].backColors[0] }} displaySelectAll={false} adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn colSpan="2" tooltip={currQuestion} style={{textAlign: 'center', whiteSpace: 'inherit' }}>
                          {currQuestion}
                        </TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    { currAnswers }
                  </Table>
                </div>
                <div style={{marginTop: 12}}>
                  <FlatButton
                    label="Back"
                    disabled={quizStepIndex === 0}
                    onClick={this.handlePrev}
                    style={{marginRight: 12}}
                  />
                  <RaisedButton
                    backgroundColor={(quizSelected.length === 0) ? 'rgb(255, 255, 255)' : 'rgb(106, 106, 106)'}
                    labelColor={(quizSelected.length === 0) ? 'rgba(106, 106, 106, 0.3)' : 'rgb(255, 255, 255)'}
                    label={quizStepIndex === 2 ? 'Finish' : 'Next'}
                    onClick={this.handleNext}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      }
    }

    return <div style={(isMarker || isMedia) ? { ...styles.main, boxShadow: 'inherit' } : (isCollection) ? { ...styles.main, boxShadow: 'inherit', background: 'transparent' } : styles.main}>
      {(entityTimelineOpen || epicTimelineOpen || isMarker || isCollection || isMedia) && <div>
        <Paper style={{
          ...styles.contentLeftMenu,
          backgroundColor: themes[theme].backColors[0],
          color: themes[theme].foreColors[0]
        }}>
          <Menu desktop>
            {entityTimelineOpen && <MenuItem style={{
              ...styles.menuItem,
              color: themes[theme].backColors[0],
              backgroundColor: ((activeContentMenuItem === 'sunburst') ? 'rgba(0,0,0,0.2)' : 'inherit')
            }} onClick={() => {
              localStorage.setItem('chs_dyk_distribution', true)
              this._toggleContentMenuItem('sunburst')
            }} leftIcon={<CompositionChartIcon hoverColor={themes[theme].highlightColors[0]}
              style={{ ...styles.menuIcon, fill: themes[theme].foreColors[0] }} />} />}
            {entityTimelineOpen && <Divider style={{ backgroundColor: themes[theme].backColors[2] }} />}
            <MenuItem style={{
              ...styles.menuItem,
              zIndex: 10,
              color: themes[theme].backColors[0],
              top: 0,
              backgroundColor: (linkedActive ? 'rgba(0,0,0,0.2)' : 'inherit')
            }} onClick={() => this._toggleContentMenuItem('forcelinked')} leftIcon={
              <IconButton
                tooltipPosition='bottom-left'
                tooltip={''} iconStyle={{ fill: 'rgba(55, 57, 49, 0.19)', top: 0, pointerEvents: 'none' }}>
                <Badge
                  badgeContent={linkedCount}
                  primary
                  badgeStyle={{ top: -22, fontWeight: 'bolder', right: 10, opacity: (linkedCount > 0) ? 1 : 0.5 }}
                >
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: -9
                  }}>
                    <ContentImage hoverColor={themes[theme].highlightColors[0]} style={{
                      ...styles.menuIconBadgeContainer1,
                      fill: (hasLinkedImage ? themes[theme].highlightColors[0] : themes[theme].foreColors[0])
                    }} />
                    <ContentMovie hoverColor={themes[theme].highlightColors[0]} style={{
                      ...styles.menuIconBadgeContainer2,
                      fill: (hasLinkedMovie ? themes[theme].highlightColors[0] : themes[theme].foreColors[0])
                    }} />
                    <ContentAudio hoverColor={themes[theme].highlightColors[0]} style={{
                      ...styles.menuIconBadgeContainer3,
                      fill: (hasLinkedAudio ? themes[theme].highlightColors[0] : themes[theme].foreColors[0])
                    }} />
                    <ContentLink hoverColor={themes[theme].highlightColors[0]} style={{
                      ...styles.menuIconBadgeContainer4,
                      fill: (hasLinkedOther ? themes[theme].highlightColors[0] : themes[theme].foreColors[0])
                    }} />
                  </div>
                </Badge>
              </IconButton>
            } />
            {entityTimelineOpen && <Divider style={{ backgroundColor: themes[theme].backColors[2] }} />}
            <MenuItem style={{
              ...styles.menuItem,
              color: themes[theme].backColors[0],
              top: 0,
              backgroundColor: ((activeContentMenuItem === 'qaa') ? 'rgba(0,0,0,0.2)' : 'inherit')
            }} onClick={() => this._toggleContentMenuItem('qaa')} leftIcon={
              <Badge
                style={{ top: -18, margin: 0, left: 10 }}
                badgeStyle={{ left: 28, fontWeight: 'bolder', top: 13, opacity: (hasQuestions > 0) ? 1 : 0.5 }}
                badgeContent={hasQuestions || 0}
                primary
              >
                <QAAIcon hoverColor={themes[theme].highlightColors[0]} style={{
                  ...styles.qaaIcon,
                  fill: (hasQuestions ? themes[theme].highlightColors[0] : themes[theme].foreColors[0])
                }} />
              </Badge>} />
          </Menu>
        </Paper>
      </div>}
      {(entityTimelineOpen || epicTimelineOpen)
        ? <EpicTimeline
          setHasQuestions={this._setHasQuestions}
          history={history}
          newWidth={newWidth}
          setContentMenuItem={this._setContentMenuItem}
          activeContentMenuItem={linkedActive ? 'linked' : activeContentMenuItem === 'linked' ? '' : activeContentMenuItem}
          activeAreaDim={activeAreaDim}
          setMetadataEntity={setMetadataEntity}
          influenceRawData={influenceRawData}
          rulerProps={rulerProps}
          selectedYear={selectedYear}
          selectedItem={selectedItem}
          // epicData={entityTimelineOpen ? rulerEntity : selectedItem.data}
          isEntity={entityTimelineOpen}
          sunburstData={sunburstData}
          // linkedItems={finalLinkedItems}
        />
        : provinceTimelineOpen
          ? <ProvinceTimeline deselectItem={deselectItem} history={history} selectedItem={selectedItem}
            metadata={metadata} setMetadataEntity={setMetadataEntity} setMetadataType={setMetadataType} selectedYear={selectedYear}
            provinceEntity={provinceEntity} activeArea={activeArea} />
          : <div style={{ height: '100%' }}>
            <LinkedQAA setHasQuestions={this._setHasQuestions} history={history} activeAreaDim={activeAreaDim}
              setContentMenuItem={this._setContentMenuItem} isMinimized={activeContentMenuItem !== 'qaa'}
              qId={((selectedItem || {}).data || {}).id || ''} qName={safeSelectedWiki || ''} />
            <LinkedGallery history={history} activeAreaDim={activeAreaDim} setContentMenuItem={this._setContentMenuItem}
              isMinimized={!linkedActive} setWikiId={this.setWikiIdWrapper}
              selectValue={this.selectValueWrapper}
              linkedItems={((selectedItem || {}).data || {}).media || []} selectedYear={selectedYear}
              qName={safeSelectedWiki || ''} />
            <ArticleIframe history={history} deselectItem={deselectItem} htmlContent={htmlContent}
              customStyle={{ ...styles.iframe, height: '100%' }} selectedWiki={safeSelectedWiki} selectedItem={selectedItem} />
          </div>
      }
    </div>
  }
}

Content.defaultProps = {
  onContentTap: () => null,
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    selectedItem: state.selectedItem,
    activeArea: state.activeArea,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    deselectItem: deselectItemAction,
    setFullModActive,
    setData,
    resetModActive,
    showNotification,
    selectCollectionItem,
    setRightDrawerVisibility,
    selectValue
  }),
  pure,
  translate,
)

export default enhance(Content)
