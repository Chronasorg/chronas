import React from 'react'
import { connect } from 'react-redux'
import {showNotification, translate} from 'admin-on-rest'
import YouTube from 'react-youtube'
import { Player } from 'video-react'
import { StepButton, Stepper } from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import { red400 } from 'material-ui/styles/colors'
import pure from 'recompose/pure'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog'
import { GridList, GridTile } from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconOpenEpic from 'material-ui/svg-icons/action/open-in-browser'
import ChartSunburst from './Charts/ChartSunburst'
import LinkedGallery from './contentMenuItems/LinkedGallery'
import LinkedQAA from './contentMenuItems/LinkedQAA'
import { RulerIcon } from '../map/assets/placeholderIcons'
import { changeColor } from '../menu/layers/actionReducers'
import { setYear as setYearAction } from '../map/timeline/actionReducers'
import {
  deselectItem,
  selectAreaItem,
  selectEpicItem,
  selectLinkedItem,
  selectValue,
  setData,
  setEpicContentIndex,
  TYPE_AREA,
  TYPE_EPIC,
  WIKI_PROVINCE_TIMELINE
} from '../map/actionReducers'
import InfluenceChart from './Charts/ChartArea'
import ArticleIframe from './ArticleIframe'
import {
  aeIdNameArray,
  epicIdNameArray,
  getFullIconURL,
  getYoutubeId,
  itemTypeToColor,
  itemTypeToName,
  properties,
  themes
} from '../../properties'
import utils from '../map/utils/general'

/**
 * Non-linear steppers allow users to enter a multi-step flow at any point.
 *
 * This example is similar to the regular horizontal stepper, except steps are no longer
 * automatically set to `disabled={true}` based on the `activeStep` prop.
 *
 * We've used the `<StepButton>` here to demonstrate clickable step labels.
 */

const styles = {
  buttonOpenArticle: {
    // float: 'left',
    backgroundColor: 'transparent',
    paddingRight: '1em',
    width: 'inherit',
    height: 'inherit'
  },
  selectedIMG: {
    height: 'auto',
    /* transform: translateY(-50%); */
    position: 'relative',
    left: 0,
    width: '100%',
  },
  selectedImageButtonContainer: {
    marginTop: '2.85em'
  },
  stepLabel: {
    fontWeight: 'bold',
    background: '#9e9e9e',
    padding: ' 5px',
    marginLeft: '-8px',
    borderRadius: '15px',
    color: 'white',
    // marginLeft: '-5px',
    // whiteSpace: 'nowrap'
  },
  stepContainer: {
    marginTop: -12,
    marginBottom: 4,
    maxHeight: '40px'
    // whiteSpace: 'nowrap',
    // textOverflow: 'ellipsis',
    // overflow: 'hidden'
  },
  selectedImageContent: {
    alignItems: 'flex-start',
    margin: '0 0 0 10%',
    padding: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    maxWidth: '32em',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    bottom: '10%'
  },
  selectedImageTitle: {
    fontWeight: 400,
    fontSize: '2.125em',
    margin: '.4em 0',
    lineHeight: '1.3',
    textAlign: 'left',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    textShadow: '1px 1px 1px black',
    padding: 0
  },
  selectedImageDescription: {
    textShadow: '1px 1px 1px black',
    textAlign: 'left',
    fontSize: '1em',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.87)',
    lineHeight: 1.5,
    margin: 0,
  },
  iframe: {
    width: '100%',
    right: 0,
    padding: '2px 8px'
  },
  imageItem: {
    width: '100%',
    objectFit: 'cover',
    cursor: 'pointer',
    pointerEvents: 'all'
  },
  contentStyle: {
    display: 'flex',
    height: '100%'
  },
  navButtons: {
    marginTop: '12px',
    right: '28px',
    bottom: '10px',
    position: 'fixed'
  },
  navTitle: {
    marginTop: '12px',
    left: 'calc(20% + 4px)',
    bottom: '10px',
    position: 'fixed',
    color: '#333'
  },
  gridList: {
    maxHeight: '100%',
    height: 'calc(100% - 300px)',
    width: '100%',
    overflowY: 'auto',
    margin: '0 auto'
  },
  subtitle: {
    pointerEvents: 'none',
    fontSize: '16px',
    // paddingLeft: '28px',
    // paddingRight: '28px',
    fontWeight: '400',
    lineHeight: '24px',
    color: '#bcbcbc',
    transition: 'all .5s ease',
    bottom: '20px',
    left: '30px',
    paddingRight: '2em',

  },
  title: {
    pointerEvents: 'none',
    // padding: '36px 28px 0 28px',
    lineHeight: '32px',
    fontWeight: 300,
    color: '#fff',
    fontSize: '24px',
    bottom: '50px',
    position: 'absolute',
    left: '30px',
  },
}

class EpicTimeline extends React.Component {
  state = {
    rulerSetup: '',
    selectedWiki: false,
    stepIndex: -1,
    hiddenElement: true,
    setYearByArticle: localStorage.getItem('chs_setYearByArticle') ? localStorage.getItem('chs_setYearByArticle') === 'true' : true,
    selectedImage: { src: '', year: '', title: '', wiki: '', source: '' },
    influenceChartData: [],
    epicMeta: false,
    epicLinkedArticles: [],
    linkedMediaItems: [],
    yearsSupported: [0, 0]
  }

  handleNext = (newYear) => {
    const { stepIndex, setYearByArticle, yearsSupported } = this.state
    if ((this.props.selectedItem || {}).type === TYPE_AREA) {
      this.setState({ stepIndex: stepIndex + 1, selectedWiki: false })
      if (!isNaN(newYear) && setYearByArticle && +newYear >= yearsSupported[0] && +newYear <= yearsSupported[1]) this.props.setYear(+newYear)
    }
    this.props.setEpicContentIndex(stepIndex + 1)
  };

  handlePrev = (newYear) => {
    const { stepIndex, setYearByArticle, yearsSupported } = this.state
    if ((this.props.selectedItem || {}).type === TYPE_AREA) {
      this.setState({ stepIndex: stepIndex - 1, selectedWiki: false })
      if (!isNaN(newYear) && setYearByArticle && +newYear >= yearsSupported[0] && +newYear <= yearsSupported[1]) this.props.setYear(+newYear)
    }
    this.props.setEpicContentIndex(stepIndex - 1)
  };
  _selectMainArticle = () => {
    if ((this.props.selectedItem || {}).type === TYPE_AREA) {
      this.setState({ stepIndex: -1 })
    } else {
      this.props.setEpicContentIndex(-1)
    }
  }
  _selectStepButton = (index, newYear, openOwn, event) => {
    if (openOwn) {
      if (event.stopPropagation) event.stopPropagation()
      const { activeArea, changeColor, selectEpicItem, selectedYear } = this.props
      const { epicLinkedArticles } = this.state
      const selectedArticle = epicLinkedArticles[index]
      const aeId = selectedArticle.aeId

      if (epicIdNameArray.map(el => el[0]).includes(selectedArticle.type)) {
        selectEpicItem(selectedArticle.wiki, +newYear || selectedYear, selectedArticle.id)
      } else if (aeId) {
        const [ae, colorToSelect, rulerToHold] = aeId.split('|')
        this._selectAreaItem(rulerToHold, colorToSelect, true)
      }
    } else {
      if ((this.props.selectedItem || {}).type === TYPE_AREA) {
        const { setYearByArticle, yearsSupported } = this.state
        this.setState({ stepIndex: index, selectedWiki: false })
        if (!isNaN(newYear) && setYearByArticle && +newYear >= yearsSupported[0] && +newYear <= yearsSupported[1]) this.props.setYear(+newYear)
      }
      this.props.setEpicContentIndex(index)
    }
  }
  _selectAreaItem = (rulerToHold, colorToSelect, doChangeColor = false) => {
    const { activeArea, changeColor, selectAreaItem } = this.props
    const nextData = activeArea.data
    const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold)
    if (provinceWithOldRuler) {
      selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
      if (doChangeColor && colorToSelect !== activeArea.color) {
        changeColor(colorToSelect)
      }
    }
  }
  setYearWrapper = (newYear) => {
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  }

  _roundToTwo = (val) => {
    return Math.round(+val * 100) /100
  }
  _setUpInfluenceDataAndMediaAndLinkedContent = (epicData, influenceRawData, isEntity) => {
    if (!epicData || (!epicData.content || !epicData.data) && !influenceRawData) return

    const { selectedItem } = this.props

    console.error('setting up influenceChartData, this should only be done once for so many entities', influenceRawData.id)

    const epicMeta = (epicData || {}).data || {}
    const influenceChartData = (isEntity)
      ? ((influenceRawData.data || {}).influence ? [{
        id: influenceRawData.id,
        data: [
          {
            title: 'Provinces',
            disabled: false,
            data: influenceRawData.data.influence.map((el) => {
              return { left: Object.keys(el)[0], top: this._roundToTwo(Object.values(el)[0][0]) }
            })
          },
          {
            title: 'Population Total',
            disabled: false,
            data: influenceRawData.data.influence.map((el) => {
              return { left: Object.keys(el)[0], top: this._roundToTwo(Object.values(el)[0][1]) }
            })
          },
          {
            title: 'Population Share',
            disabled: false,
            data: influenceRawData.data.influence.map((el) => {
              return { left: Object.keys(el)[0], top: this._roundToTwo(Object.values(el)[0][2]) }
            })
          }
        ]
      }] : [])
      : (epicData.rulerEntities || []).map((epicEntity) => {
        return {
          id: epicEntity._id,
          data: [
            {
              title: 'Population Share',
              disabled: false,
              data: epicEntity.data.influence.map((el) => {
                return { left: Object.keys(el)[0], top: this._roundToTwo(Object.values(el)[0][2]) }
              })
            }
          ]
        }
      })

    const linkedMediaItems = (epicData.media || epicMeta.media || []).map((imageItem) => {
      return {
        src: imageItem._id || ((imageItem || {}).properties || {}).id || ((imageItem || {}).properties || {}).w || imageItem.src || imageItem.wiki || ((imageItem || {}).properties || {}).w,
        wiki: imageItem.wiki || imageItem.properties.w,
        title: imageItem.name || imageItem.title || (imageItem.data || {}).title || ((imageItem || {}).properties || {}).n,
        subtype: imageItem.subtype || imageItem.properties.t,
        source: imageItem.source || (imageItem.data || {}).source || ((imageItem || {}).properties || {}).src,
        subtitle: ((imageItem || {}).properties || {}).y || imageItem.year || imageItem.subtitle || ((imageItem || {}).properties || {}).n,
        score: ((imageItem || {}).properties || {}).s || imageItem.score,
        date: ((imageItem || {}).properties || {}).y || imageItem.year
      }
    }).sort((a, b) => (+b.score || 0) - (+a.score || 0))

    let entityContentData
    if (isEntity) {
      entityContentData = []
      const entityRulerData = ((epicData || {}).data || {}).ruler || {}
      Object.keys(entityRulerData).forEach((k) => {
        entityContentData.push({
          'name': entityRulerData[k][0],
          'type': entityRulerData[k][1],
          'wiki': entityRulerData[k][2],
          'date': k
        }
        )
      })
    }

    const epicLinkedArticles = ((entityContentData && entityContentData.concat(((epicData || {}).content || []))) ||
      (epicData || {}).content ||
      (epicMeta || {}).content || []).map((linkedItem) => {
      return {
        'name': (!linkedItem.properties) ? (linkedItem.name || linkedItem.wiki) : linkedItem.properties.n || linkedItem.properties.w,
        'wiki': (!linkedItem.properties) ? linkedItem.wiki : linkedItem.properties.w,
        'content': (!linkedItem.properties) ? (linkedItem.content || linkedItem.name) : (linkedItem.properties.c || linkedItem.properties.n),
        'type': (!linkedItem.properties) ? linkedItem.type : linkedItem.properties.t,
        'aeId': (linkedItem.properties || {}).aeId,
        'source': (!linkedItem.properties) ? false : linkedItem.properties.src,
        'id': (!linkedItem.properties) ? linkedItem.id : linkedItem.properties.id,
        'score': (!linkedItem.properties) ? false : linkedItem.properties.s,
        'isMarker': (!linkedItem.properties) ? true : (linkedItem.properties.ct === 'marker'),
        'date': ((!linkedItem.properties) ? linkedItem.date : linkedItem.properties.y),
        'geometry': linkedItem.geometry,
        'icon': (linkedItem.properties || {}).i
      }
    }).filter((el) => el['name'] !== 'null').sort((a, b) => {
      return +(a.date || -5000) - +(b.date || -5000)
    })

    const dateRange = ((((influenceChartData || [])[0] || {}).data || [])[0] || {}).data

    this.setState({
      epicLinkedArticles,
      epicMeta,
      linkedMediaItems: linkedMediaItems,
      rulerSetup: epicData.id,
      stepIndex: -1,
      influenceChartData,
      yearsSupported: (dateRange && dateRange.length !== 0) ? [+dateRange[0].left, +dateRange[dateRange.length - 1].left] : [0, 0],
    })

    if ((selectedItem || {}).type === TYPE_AREA && ((epicData || {}).content || []).length > 0) {
      // this.props.setData({
      //   id: epicData.id || epicData._id,
      //   content: epicLinkedArticles.map((el, index) => {
      //     el.index = index
      //     el.hidden = false
      //     return el
      //   }),
      //   contentIndex: -1
      // })
    }
  }
  handleImageClose = () => {
    this.setState({ selectedImage: { src: '', year: '', title: '', wiki: '', source: '' } })
  }
  componentDidMount = () => {
    const { selectedItem, isEntity, influenceRawData } = this.props
    const epicData = (selectedItem || {}).data
    if (epicData) this._setUpInfluenceDataAndMediaAndLinkedContent(epicData, influenceRawData, isEntity)
  }
  componentWillReceiveProps = (nextProps) => {
    const { rulerSetup, setYearByArticle } = this.state
    const { selectedItem, contentIndex, rulerProps, isEntity, influenceRawData } = this.props

    const prevLinkedId = ((selectedItem || {}).data).id
    const nextPropsEpicData = (nextProps.selectedItem || {}).data
    const nextLinkedId = (nextPropsEpicData || {}).id

    if ((
      nextPropsEpicData.id &&
        rulerSetup !== nextPropsEpicData.id &&
        nextLinkedId !== prevLinkedId) &&
      (nextProps.influenceRawData.id !== influenceRawData.id ||
        nextProps.selectedItem.wiki !== WIKI_PROVINCE_TIMELINE)) {
      this._setUpInfluenceDataAndMediaAndLinkedContent(nextPropsEpicData, influenceRawData, nextProps.isEntity)
    } else if (prevLinkedId === nextLinkedId && (rulerProps || {})[2] !== (nextProps.rulerProps || {})[2]) {
      this.forceUpdate()
    } else if (nextProps.selectedItem.type === TYPE_EPIC && nextProps.contentIndex !== contentIndex) {
      this.setState({ stepIndex: nextProps.contentIndex, selectedWiki: false })
      if (setYearByArticle) {
        const newYear = (((((nextProps.selectedItem || {}).data || {}).content || [])[nextProps.contentIndex] || {}).properties || {}).y
        if (!isNaN(newYear)) this.props.setYear(+newYear)
      }
    }
  }
  toggleYearByArticleWrapper = () => {
    localStorage.setItem('chs_setYearByArticle', !this.state.setYearByArticle)
    this.setState({ setYearByArticle: !this.state.setYearByArticle })
  }
  setWikiIdWrapper = (wiki) => {
    this.setState({ selectedWiki: wiki })
  }
  selectValueWrapper = (value) => {
    this.props.selectValue(value)
  }
  _handleEdit = (id) => {
    // const selectedItem = this.state.tileData.filter(el => (el.src === decodeURIComponent(id)))[0]
    this.props.selectLinkedItem(this.state.selectedImage)
    this.props.history.push('/mod/linked')
  }
  _handleOpenSource = (source) => {
    window.open(source, '_blank').focus()
  }

  getStepContent (stepIndex, contentDetected) {
    const { deselectItem, rulerProps, selectedItem, history, setMetadataEntity, theme } = this.props
    const { selectedWiki, setYearByArticle, epicLinkedArticles, influenceChartData } = this.state
    const selectedIndexItem = (epicLinkedArticles[stepIndex] || {})
    const itemType = selectedIndexItem.type
    const isMarker = !(selectedIndexItem.isMarker === false) || (selectedIndexItem.type.substr(0, 3) === 'ae|')
    const hasChart = (influenceChartData && influenceChartData.length > 0)
    // TODO: fly to if coo, add geojson up to that index and animate current - if main, add all geojson
    if (isMarker) {
      const wikiUrl = selectedIndexItem.wiki || ((selectedItem || {}).data || {}).wiki || (rulerProps || {})[2] || -1
      return <ArticleIframe history={history} selectAreaItemWrapper={this._selectAreaItem}
        toggleYearByArticleDisabled={!contentDetected} yearByArticleValue={setYearByArticle}
        toggleYearByArticle={this.toggleYearByArticleWrapper} hasChart={hasChart}
        isEntity={this.props.isEntity} deselectItem={deselectItem} selectedItem={selectedItem}
        customStyle={{
          ...styles.iframe,
          height: (epicLinkedArticles.length === 0 ? (hasChart ? 'calc(100% - 254px)' : '100%') : (hasChart ? 'calc(100% - 300px)' : 'calc(100% - 46px)'))
        }} selectedWiki={selectedWiki || wikiUrl} />
    } else if (epicIdNameArray.map(el => el[0]).includes(itemType) || itemType === 'ps') {
      // add hyperlink here
      const wikiUrl = selectedIndexItem.wiki || ((selectedItem || {}).data || {}).wiki || (rulerProps || {})[2] || -1
      return <ArticleIframe history={history} selectAreaItemWrapper={this._selectAreaItem}
        setMetadataEntity={setMetadataEntity} toggleYearByArticleDisabled={!contentDetected}
        yearByArticleValue={setYearByArticle} toggleYearByArticle={this.toggleYearByArticleWrapper}
        hasChart={hasChart} isEntity={this.props.isEntity} deselectItem={deselectItem}
        selectedItem={selectedItem} customStyle={{
          ...styles.iframe,
          height: (epicLinkedArticles.length === 0 ? (hasChart ? 'calc(100% - 254px)' : '100%') : (hasChart ? 'calc(100% - 300px)' : 'calc(100% - 46px)'))
        }} selectedWiki={selectedWiki || wikiUrl} />
    } else {
      if (itemType === 'html') {
        const content = selectedIndexItem.content
        return <ArticleIframe history={history} selectAreaItemWrapper={this._selectAreaItem}
          setMetadataEntity={setMetadataEntity} toggleYearByArticleDisabled={!contentDetected}
          yearByArticleValue={setYearByArticle}
          toggleYearByArticle={this.toggleYearByArticleWrapper} hasChart={hasChart}
          isEntity={this.props.isEntity} deselectItem={deselectItem} selectedItem={selectedItem}
          customStyle={{
            ...styles.iframe,
            height: (epicLinkedArticles.length === 0 ? (hasChart ? 'calc(100% - 254px)' : '100%') : (hasChart ? 'calc(100% - 300px)' : 'calc(100% - 46px)'))
          }} htmlContent={content} selectedWiki={selectedWiki} />
      }

      return <GridList
        cellHeight={'calc(100% - 300px)'}
        padding={1}
        cols={1}
        style={{ ...styles.gridList, background: 'rgb(23, 23, 23)' }}
      >{(itemType !== 'v' && itemType !== 'audios' && itemType !== 'ps' && itemType !== 'articles')
          ? <GridTile
            key={selectedIndexItem.wiki}
            style={{ border: '0px solid black', cursor: 'pointer', pointerEvents: 'none' }}
            titleStyle={styles.title}
            subtitleStyle={styles.subtitle}
            title={selectedIndexItem.name}
            subtitle={selectedIndexItem.name}
            actionPosition='right'
            titlePosition='bottom'
            titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
            cols={1}
            rows={1}
          >
            <img src={selectedIndexItem.wiki}
              style={styles.imageItem}
              onClick={() => {
                this.setState({
                  selectedImage: {
                    src: selectedIndexItem.wiki,
                    year: selectedIndexItem.date,
                    title: selectedIndexItem.name,
                    wiki: selectedIndexItem.wiki,
                    source: selectedIndexItem.source
                  }
                })
              }}
            />
          </GridTile>
          : (itemType === 'articles')
            ? <GridTile
              key={selectedIndexItem.wiki}
              style={{ border: '0px solid black', cursor: 'pointer', pointerEvents: 'none' }}
              titleStyle={styles.title}
              subtitleStyle={styles.subtitle}
              title={selectedIndexItem.name}
              subtitle={selectedIndexItem.name}
              actionPosition='right'
              titlePosition='bottom'
              titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
              cols={1}
              rows={1}
            >
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Sachsenspiegel.jpg/614px-Sachsenspiegel.jpg'
                style={styles.imageItem}
                onClick={() => {
                  this.setState({
                    selectedImage: {
                      src: selectedIndexItem.wiki,
                      year: selectedIndexItem.date,
                      title: selectedIndexItem.name,
                      wiki: selectedIndexItem.wiki,
                      source: selectedIndexItem.source
                    }
                  })
                }}
              />
            </GridTile>
            : <GridTile
              key={selectedIndexItem.wiki}
              style={{ border: '0px solid black', cursor: 'pointer', pointerEvents: 'none' }}
              titleStyle={styles.title}
              subtitleStyle={styles.subtitle}
              title={selectedIndexItem.name}
              subtitle={selectedIndexItem.name}
              actionPosition='right'
              titlePosition='bottom'
              titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
              cols={1}
              rows={1}
            >
              {getYoutubeId(selectedIndexItem.wiki)
                ? <YouTube
                  className='videoContent'
                  videoId={getYoutubeId(selectedIndexItem.wiki)}
                  opts={properties.YOUTUBEOPTS}
                />
                : <Player className='videoContent' fluid={false} ref='player'>
                  <source src={selectedIndexItem.wiki} />
                </Player>
              }
            </GridTile>}
      </GridList>
    }
  }
  componentDidCatch(error, info) {
    this.props.showNotification('Something went wrong', 'confirm')
  }
  render () {
    const { epicMeta, epicLinkedArticles, stepIndex, linkedMediaItems, influenceChartData, selectedImage, selectedWiki, iframeLoading } = this.state
    const { activeContentMenuItem, activeAreaDim, selectedItem, rulerProps, setHasQuestions, isEntity, newWidth, history, selectedYear, setContentMenuItem, sunburstData, translate, theme } = this.props

    const linkedItems = (selectedItem || {}).data
    const hasSource = typeof selectedImage.source === 'undefined' || selectedImage.source === ''
    const hasWiki = typeof selectedImage.wiki === 'undefined' || selectedImage.wiki === ''
    const contentDetected = epicLinkedArticles.length !== 0
    const isNotAreaRuler = typeof (rulerProps || {})[1] !== 'string'

    const entityName = (epicMeta || {}).title || (rulerProps || {})[0]

    return (
      <div style={{ height: '100%' }}>
        {isEntity && <ChartSunburst
          theme={theme}
          activeAreaDim={activeAreaDim}
          setContentMenuItem={setContentMenuItem}
          isMinimized={activeContentMenuItem !== 'sunburst'}
          setWikiId={this.setWikiIdWrapper}
          selectValue={this.selectValueWrapper}
          preData={sunburstData}
          selectedYear={selectedYear} />}
        {linkedItems && linkedItems.id &&
        <LinkedQAA setHasQuestions={setHasQuestions} history={history} activeAreaDim={activeAreaDim}
          setContentMenuItem={setContentMenuItem} isMinimized={activeContentMenuItem !== 'qaa'}
          qName={entityName || ''} qId={linkedItems.id} />}
        <LinkedGallery history={history} qName={entityName || ''} activeAreaDim={activeAreaDim}
          setContentMenuItem={setContentMenuItem} isMinimized={activeContentMenuItem !== 'linked'}
          setWikiId={this.setWikiIdWrapper} selectValue={this.selectValueWrapper}
          linkedItems={linkedMediaItems} selectedYear={selectedYear} />
        {influenceChartData && influenceChartData.length > 0 &&
        <div style={{ height: (!isEntity) ? '256px' : '200px', width: '100%' }}>
          <InfluenceChart qName={entityName || ''} epicMeta={isEntity ? false : epicMeta}
            chartIcons={epicLinkedArticles.filter(el => el.type === 'b' || el.type === 'si')}
            rulerProps={rulerProps} setYear={this.setYearWrapper} newData={influenceChartData}
            selectedYear={selectedYear} />
        </div>}
        {contentDetected && <div style={{
          width: '19%',
          maxWidth: '200px',
          height: 'calc(100% - 248px)',
          display: 'inline-block',
          background: themes[theme].gradientColors[0]
        }}>
          <FlatButton backgroundColor={isNotAreaRuler ? themes[theme].backColors[0] : (rulerProps || {})[1]}
            hoverColor={isNotAreaRuler ? themes[theme].backColors[1] : themes[theme].highlightColors[0]}
            labelStyle={{
              padding: '4px',
              color: isNotAreaRuler ? themes[theme].foreColors[0] : themes[theme].backColors[0],
              textTransform: 'inherit',
              fontWeight: 600
            }} style={{
              width: '100%',
              height: '64px',
              borderRadius: '0px',
              border: 'none',
              lineHeight: '26px',
              padding: '6px',

              borderTop: isNotAreaRuler ? '1px solid ' + themes[theme].borderColors[0] : 'none',
              borderRight: isNotAreaRuler ? '1px solid ' + themes[theme].borderColors[0] : 'none',

            }} label={(epicMeta || {}).title || (rulerProps || {})[0] || 'loading'}
            onClick={this._selectMainArticle} />
          <div style={{
            borderRight: '1px solid ' + themes[theme].borderColors[0],
            width: '100%',
            overflow: 'auto',
            height: 'calc(100% - 64px)'
          }}>
            <Stepper linear={false}
              activeStep={stepIndex}
              orientation='vertical'
              style={{
                float: 'left',
                paddingTop: 16,
                width: '100%',
                background: 'transparent',
                boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset'
              }}>
              {epicLinkedArticles.map((epicContent, i) => (
                <div title={epicContent.name || epicContent.wiki} key={i} style={styles.stepContainer}>
                  <StepButton
                    icon={
                      (epicLinkedArticles[i].type.substr(0, 2) === 'ae')
                        ? <Avatar size={30}
                          style={{ marginLeft: -3 }}
                          color={themes[theme].backColors[0]}
                          backgroundColor={themes[theme].foreColors[0]}
                          {...(epicLinkedArticles[i].icon ? (epicLinkedArticles[i].icon[0] === '/' ? { src: epicLinkedArticles[i].icon } : { src: getFullIconURL(decodeURIComponent(epicLinkedArticles[i].icon)) }) : {
                            icon: <RulerIcon viewBox={'0 0 64 64'} />
                          })}
                        />
                        : <span style={{
                          ...styles.stepLabel,
                          color: (stepIndex === i ? themes[theme].backColors[0] : themes[theme].foreColors[0]),
                          background: (stepIndex === i ? themes[theme].highlightColors[0] : themes[theme].backColors[0])
                        }}>{epicLinkedArticles[i].date}</span>
                    }
                    onClick={() => {
                      this._selectStepButton(i, epicLinkedArticles[i].date)
                    }}>
                    <div style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      position: 'absolute',
                      width: '20$',
                      left: '50px',
                      top: '16px',
                      fontSize: '15px',
                      color: themes[theme].foreColors[0]
                    }}>
                      {epicContent.name || epicContent.wiki}
                    </div>
                    <div style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      position: 'absolute',
                      width: '20$',
                      left: '50px',
                      top: '32px',
                      fontSize: '12px',
                      color: themes[theme].foreColors[1],
                      textDecoration: 'none',
                      borderBottom: '2px solid ' + itemTypeToColor[epicContent.type],
                    }}>
                      {itemTypeToName[epicContent.type]}
                    </div>
                  </StepButton>
                  {epicIdNameArray.concat(aeIdNameArray).map(el => el[0]).includes(epicContent.type) && epicContent.type !== 'ei' &&
                  <FlatButton
                    onClick={(event) => this._selectStepButton(i, epicLinkedArticles[i].date, true, event)}
                    style={{
                      height: 36,
                      minWidth: 36,
                      marginTop: -64,
                      zIndex: 100,
                      float: 'right',
                      position: 'relative'
                    }}
                    iconStyle={{ height: 20, width: 20 }}
                    // style={{...styles.buttonOpenArticle, zIndex: 1000, padding: 0, position: 'absolute', top: 15 }}
                    tooltipPosition='bottom-left'
                    tooltip={translate('pos.openEpic')}
                    icon={<IconOpenEpic color={themes[theme].highlightColors[0]}
                      style={{ height: 30 }}
                      // style={{ float: 'right'/*, padding: '4px'*/, paddingLeft: 0, marginLeft: 10 }}
                    />} />}
                </div>
              ))}
            </Stepper></div>
        </div>}
        <div style={{
          width: (contentDetected ? '80%' : '100%'),
          minWidth: 'calc(100% - 210px)',
          display: 'inline-block',
          float: 'right',
          height: '100%'
        }}>
          <div style={styles.contentStyle}>
            {this.getStepContent(stepIndex, contentDetected)}
            {contentDetected && <div style={styles.navTitle}>
              <span style={{
                fontWeight: 600,
                paddingRight: '.2em'
              }}>{(epicLinkedArticles[epicLinkedArticles[stepIndex]] || {})[0]} </span>
              <span style={{ fontWeight: 300, paddingRight: '.6em' }}>
                {(epicLinkedArticles[epicLinkedArticles[stepIndex]] || {})[1]}
              </span>
              <span style={{ paddingRight: '2em' }}> ({stepIndex + 1} / {epicLinkedArticles.length})</span>
            </div>}
            {contentDetected && <div style={styles.navButtons}>
              <FlatButton
                label='Back'
                disabled={stepIndex < 1}
                onClick={() => this.handlePrev(epicLinkedArticles[stepIndex - 1].date)}
                style={{ color: '#333', marginRight: 12 }}
              />
              <RaisedButton
                label='Next'
                disabled={stepIndex >= epicLinkedArticles.length - 1}
                primary
                onClick={() => this.handleNext(epicLinkedArticles[stepIndex + 1].date)}
              />
            </div>}
          </div>
        </div>
        <Dialog
          autoDetectWindowHeight={false}
          modal={false}
          contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogImageBackgroundHack'}
          contentStyle={{
            ...styles.discoverDialogStyle,
            overflow: 'auto',
            left: '64px',
            padding: '0px',
            maxWidth: 'calc(100% - 64px)'
          }}
          bodyStyle={{ backgroundColor: 'transparent', padding: '0px', border: 'none' }}
          overlayStyle={{ padding: '0px' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          style={{ backgroundColor: 'transparent', padding: '0px', overflow: 'auto' }}
          titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
          autoScrollBodyContent={false}
          open={(selectedImage.src !== '')}
          onRequestClose={this.handleImageClose}
        >
          <img src={selectedImage.src} style={styles.selectedIMG} />
          <div style={styles.selectedImageContent}>
            <h1 style={styles.selectedImageTitle}>{selectedImage.year}</h1>
            <p style={styles.selectedImageDescription}>{selectedImage.title}</p>
            <div style={styles.selectedImageButtonContainer}>
              <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition='bottom-center'
                tooltip={hasWiki ? translate('pos.discover_component.hasNoSource') : translate('pos.discover_component.openSource')}>
                <RaisedButton
                  disabled={hasSource}
                  label='Open Source'
                  primary
                  onClick={() => this._handleOpenSource(selectedImage.source)}>
                  <IconOutbound color='white'
                    style={{ float: 'right', padding: '4px', paddingLeft: 0, marginLeft: -10 }} />
                </RaisedButton>
              </IconButton>
              <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition='bottom-center'
                tooltip={translate('pos.discover_component.edit')}>
                <RaisedButton
                  label='Edit'
                  primary
                  onClick={() => this._handleEdit(selectedImage.source)} />
              </IconButton>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    selectedItem: state.selectedItem,
    contentIndex: ((state.selectedItem || {}).data || {}).contentIndex,
    activeArea: state.activeArea,
    theme: state.theme,
  }), {
    changeColor,
    deselectItem,
    setData,
    showNotification,
    selectAreaItem,
    setYear: setYearAction,
    selectValue,
    selectLinkedItem,
    selectEpicItem,
    setEpicContentIndex
  }),
  pure,
  translate,
)

export default enhance(EpicTimeline)
