import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube'
import { Player } from 'video-react'
import Dialog from 'material-ui/Dialog'
import { GridList } from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconEdit from 'material-ui/svg-icons/content/create'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import ContentAdd from 'material-ui/svg-icons/content/add'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tab, Tabs } from 'material-ui/Tabs'
import ImageGallery from 'react-image-gallery'
import SwipeableViews from 'react-swipeable-views'
import { LoadingCircle } from '../../global/LoadingCircle'
import { showNotification, translate, ViewTitle } from 'admin-on-rest'
import axios from 'axios'
import { red400 } from 'material-ui/styles/colors'
import GridTile from '../../overwrites/GridTile'
import { setRightDrawerVisibility } from '../../content/actionReducers'
import { setAreaColorLabel } from '../../menu/layers/actionReducers'
import { selectAreaItem, selectEpicItem, selectLinkedItem, selectMarkerItem } from '../../map/actionReducers'
import { getYoutubeId, properties, themes } from '../../../properties'
import utils from '../../map/utils/general'

const imgButton = { width: 20, height: 20 }
const styles = {
  addButton: {
    zIndex: 15000,
    marginTop: '3em',
    marginRight: '3em'
  },
  buttonContainer: {
    width: 70,
    height: 50,
    /* margin-top: -315px; */
    position: 'relative',
    right: 0,
    bottom: 258,
    pointerEvents: 'all'
  },
  closeButton: {
    boxShadow: 'inherit',
    zIndex: 15000,
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,.7)) drop-shadow(0 1px 2px rgba(0,0,0,.3))',
    marginTop: '1em',
    marginRight: '1em'
  },
  imageDialog: {
    width: '100%',
    maxWidth: 'none',
  },
  iconButton: { filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))' },
  upArrow: { ...imgButton, padding: 0, right: 11, top: -4, position: 'absolute' },
  downArrow: { ...imgButton, padding: 0, right: 11, top: 24, position: 'absolute' },
  editButton: { ...imgButton, right: 60, top: 1, position: 'absolute' },
  sourceButton: { ...imgButton, right: 110, top: 1, position: 'absolute', padding: 0 },
  scoreLabel: {
    width: 38,
    height: 20,
    right: 0,
    top: 14,
    color: 'white',
    position: 'absolute',
    fontSize: 12,
    textAlign: 'center',
    filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))'
  },
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
  discoverDialogStyle: {
    width: '100%',
    // maxWidth: 'none',
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    // display: 'flex',
    // '-ms-flex-direction': 'row',
    // '-webkit-flex-direction': 'row',
    // 'flex-direction': 'row',
    //   '-ms-flex-wrap': 'wrap',
    // '-webkit-flex-wrap': 'wrap',
    // 'flex-wrap': 'wrap',
    maxWidth: '100%',
    backgroundColor: 'transparent'
    // margin-left:auto,margin-right:auto,position:absolute,top:0,right:0,bottom:0,left:0
  },
  overlayStyle: {
    background: 'rgba(0,0,0,.8)',
    pointerEvents: 'none'
  },
  toolbarTitleStyle: {
    pointerEvents: 'none',
    color: 'white',
    textShadow: '1px 1px 1px black',
    zIndex: 15000,
    padding: '1em',
    position: 'fixed',
    left: 64,
    right: 0,
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    overflowY: 'auto',
    maxWidth: '1024px',
    margin: '0 auto'
  },
  subtitle: {
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
    pointerEvents: 'none'

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
  buttonOpenArticle: {
    // float: 'left',
    backgroundColor: 'transparent',
    paddingRight: '1em',
    width: 'inherit',
    height: 'inherit',
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
    maxWidth: '80%',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    bottom: '10%'
  },
  selectedImageTitle: {
    fontWeight: 600,
    fontSize: '3.125em',
    margin: '.4em 0',
    lineHeight: '1.3',
    textAlign: 'left',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    textShadow: '0.03em 0 6px black, 0.03em 0 6px black, 0.03em 0 6px black, 0.03em 0 6px black',
    padding: 0
  },
  selectedImageDescription: {
    textShadow: '0.03em 0 6px black, 0.03em 0 6px black, 0.03em 0 6px black, 0.03em 0 6px black',
    textAlign: 'left',
    fontSize: '1em',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.87)',
    lineHeight: 1.5,
    margin: 0,
  }
}

class Discover extends PureComponent {
  handleChange = (value) => {
    this.setState({ slideIndex: value })
  }
  handleClose = () => {
    if (this.state.selectedImage.src !== '') {
      this.handleImageClose()
      return
    }
    this.props.history.push('/')
  }
  handleImageClose = () => {
    this.setState({ selectedImage: { src: '', year: '', title: '', wiki: [], source: '', fullData: {} } })
  }
  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }
  componentWillMount = () => {
    if (this.props.selectedYear !== this.state.currentYearLoaded) {
      this._updateImages(this.props.selectedYear)
    }
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }
  componentWillReceiveProps = (nextProps) => {
    const { selectedYear } = this.props

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear) {
      this._updateImages(nextProps.selectedYear)
    }
  }
  _handleOpenArticle = (selectedImage) => {
    this.props.selectLinkedItem(selectedImage.wiki, selectedImage.fullData)
    this.props.history.push('/article')
  }
  _openPartOf = (el, fullData) => {
    const { activeArea, setAreaColorLabel, selectAreaItem, selectMarkerItem, selectedYear, selectEpicItem, selectLinkedItem, history } = this.props

    const aeId = ((el || {}).properties || {}).aeId
    const typeId = ((el || {}).properties || {}).ct || (fullData || {}).type
    if (aeId) {
      const [ae, colorToSelect, rulerToHold] = aeId.split('|')
      const nextData = activeArea.data
      const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold) // TODO: go on here
      if (provinceWithOldRuler) {
        selectAreaItem(provinceWithOldRuler, provinceWithOldRuler)
        if (colorToSelect !== activeArea.color) {
          setAreaColorLabel(colorToSelect, colorToSelect)
        }
      }
    } else if (typeId === 'marker') {
      selectMarkerItem(el.properties.w, { coo: (el.geometry || {}).coordinates })
    } else if (typeId === 'e') {
      if (activeArea.color !== 'ruler') {
        setAreaColorLabel('ruler', 'ruler')
      }
      selectEpicItem(fullData.wiki, +((!fullData.year || isNaN(fullData.year)) ? selectedYear : fullData.year), fullData._id)
    } else {
      selectLinkedItem(((el || {}).properties || {}).w || (fullData || {}).wiki, fullData)
    }
    history.push('/article')
  }
  _updateImages = (selectedYear) => {
    this.setState({ isFetchingImages: true })
    // Load slides data
    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&type=i&end=150&discover=artefacts,people,cities,battles,misc,ps,v,e')
      .then((allData) => {
        const newSlideData = []
        const allEpics = allData.data[0]
        const allImages = allData.data[1]

        localStorage.setItem('chs_dyk_discover', true)

        // SLIDERS
        const tileData = this.state.tileData
        allImages.sort((a, b) => (+b.score || 0) - (+a.score || 0)).forEach((imageItem, i) => {
          if (i < 10) {
            newSlideData.push({
              original: imageItem._id,
              thumbnail: imageItem.data.poster,
              description: imageItem.data.title,
              source: imageItem.data.source,
              subtype: imageItem.subtype,
              // wiki: imageItem.wiki,
              originalTitle: imageItem.year,
              thumbnailTitle: imageItem.year,
              score: imageItem.score,
              fullData: imageItem
            })
          }
        })

        // IMAGES
        this.state.tabDataKeys.forEach(categoryObj => {
          // if image metadata
          const newTilesData = []
          const res = allImages.filter(el => el.subtype === categoryObj[2])
          res.forEach((imageItem) => {
            newTilesData.push({
              src: imageItem._id,
              wiki: (imageItem.subtype === 'ps' && imageItem.wiki),
              thumbnail: imageItem.data.poster || (imageItem.subtype === 'ps' && 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Sachsenspiegel.jpg/614px-Sachsenspiegel.jpg'),
              title: imageItem.data.title,
              subtype: imageItem.subtype,
              source: imageItem.data.source,
              subtitle: imageItem.year,
              coo: imageItem.coo,
              score: imageItem.score,
              fullData: imageItem
            })
          })
          tileData[categoryObj[0]] = newTilesData.sort((a, b) => (+b.score || 0) - (+a.score || 0))
        })

        // EPICS
        const newEpicData = []
        allEpics.forEach((epicItem) => {
          const epicTile = {
            src: epicItem._id,
            coo: epicItem.coo,
            poster: epicItem.data.poster,
            thumbnail: epicItem.data.poster,
            title: epicItem.data.title,
            source: epicItem.data.source,
            subtype: 'epics',
            subtitle: epicItem.year,
            score: epicItem.score,
            wiki: [epicItem.wiki],
            fullData: epicItem
          }
          newEpicData.push(epicTile)
        })

        tileData['tilesHighlightData'] = newEpicData.filter(e => e.poster).sort((a, b) => (+b.score || 0) - (+a.score || 0)).slice(0, 5).concat([].concat(...Object.values(tileData)).sort((a, b) => (+b.score || 0) - (+a.score || 0)).slice(0, 10))
        tileData['tilesEpicsData'] = newEpicData.sort((a, b) => (+b.score || 0) - (+a.score || 0))

        this.setState({
          isFetchingImages: false,
          slidesData: newSlideData,
          currentYearLoaded: selectedYear,
          tileData
        })
      })
  }
  _handleUpvote = (id, stateDataId) => {
    const token = localStorage.getItem('chs_token')
    if (!token) {
      this.props.showNotification('pos.pleaseLogin')
      return
    }
    const upvotedItems = (localStorage.getItem('chs_upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote
      localStorage.setItem('chs_upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
            if (encodeURIComponent(el.src) === id) el.score -= 1
            return el
          })
          this.setState({ tileData: tileData })
          this.forceUpdate()
        })
    } else if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote twice
      localStorage.setItem('chs_upvotedItems', upvotedItems.concat([id]))
      localStorage.setItem('chs_downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
            .then(() => {
              tileData[stateDataId] = tileData[stateDataId].map((el) => {
                if (encodeURIComponent(el.src) === id) el.score += 2
                return el
              })
              this.setState({ tileData: tileData })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just upvote
      localStorage.setItem('chs_upvotedItems', upvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          this.props.showNotification((typeof token !== 'undefined') ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
            if (encodeURIComponent(el.src) === id) el.score += 1
            return el
          })
          this.setState({ tileData: tileData })
          this.forceUpdate()
        })
    }
  }
  _handleDownvote = (id, stateDataId) => {
    const token = localStorage.getItem('chs_token')
    if (!token) {
      this.props.showNotification('pos.pleaseLogin')
      return
    }
    const upvotedItems = (localStorage.getItem('chs_upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote
      localStorage.setItem('chs_downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
            if (encodeURIComponent(el.src) === id) el.score += 1
            return el
          })
          this.setState({ tileData: tileData })
          this.forceUpdate()
        })
    } else if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote twice
      localStorage.setItem('chs_downvotedItems', downvotedItems.concat([id]))
      localStorage.setItem('chs_upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
            .then(() => {
              tileData[stateDataId] = tileData[stateDataId].map((el) => {
                if (encodeURIComponent(el.src) === id) el.score -= 2
                return el
              })
              this.setState({ tileData: tileData })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just downvote
      localStorage.setItem('chs_downvotedItems', downvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          this.props.showNotification((typeof token !== 'undefined') ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
            if (encodeURIComponent(el.src) === id) el.score -= 1
            return el
          })
          this.setState({ tileData: tileData })
          this.forceUpdate()
        })
    }
  }
  _handleEdit = (id, dataKey = false) => {
    const selectedItem = (dataKey) ? this.state.tileData[dataKey].find(el => (el.src === decodeURIComponent(id))) : this.state.selectedImage
    this.props.selectLinkedItem(selectedItem, {
      ...selectedItem,
      ...selectedItem.fullData,
      participants: (((selectedItem.fullData || {}).data || {}).participants || []).map((pT) => {
        return {
          'participantTeam': pT.map((pp) => {
            return { 'name': pp }
          })
        }
      })
    })
    this.props.history.push('/mod/linked')
  }
  _handleAdd = () => {
    this.props.history.push('/mod/linked/create')
  }
  _handleOpenSource = (source) => {
    window.open(decodeURIComponent(source), '_blank').focus()
  }
  _removeTile = (tileDataKey, tileSrc) => {
    const originalTileData = this.state.tileData
    const originalSlideData = this.state.slidesData

    originalTileData[tileDataKey] = originalTileData[tileDataKey].filter(el => el.src !== tileSrc)

    this.setState({
      slidesData: originalSlideData.filter(el => el.original !== tileSrc),
      tileData: originalTileData
    })

    this.forceUpdate()
  }

  constructor (props) {
    super(props)
    this._openPartOf = this._openPartOf.bind(this)
    this.state = {
      selectedImage: { src: '', year: '', title: '', wiki: [], source: '', fullData: {} },
      slideIndex: 0,
      currentYearLoaded: 3000,
      hiddenElement: true,
      isFetchingImages: true,
      slidesData: [],
      tileData: {
        tilesHighlightData: [],
        tilesArtefactsData: [],
        tilesArticlesData: [],
        tilesEpicsData: [],
        tilesPeopleData: [],
        tilesCitiesData: [],
        tilesBattlesData: [],
        tilesOtherData: [],
        tilesVideosData: [],
        tilesPodcastsData: [],
        tilesPsData: []
      },
      tabDataKeys: [
        ['tilesHighlightData', 'HIGHLIGHTS', ''],
        ['tilesArtefactsData', 'ARTEFACTS', 'artefacts'],
        // ['tilesArticlesData', 'ARTICLES', 'articles'],
        ['tilesEpicsData', 'EPICS', 'epics'],
        ['tilesPeopleData', 'PEOPLE', 'people'],
        ['tilesCitiesData', 'CITIES', 'cities'],
        ['tilesBattlesData', 'BATTLES', 'battles'],
        ['tilesOtherData', 'OTHER', 'misc'],
        ['tilesVideosData', 'VIDEOS', 'v'],
        // ['tilesPodcastsData', 'PODCASTS', 'audios'],
        ['tilesPsData', 'PRIMARY SOURCES', 'ps']
      ]
    }
  }

  slideButtons = (score, id, source, stateData, hasNoWiki) => {
    const { translate, theme } = this.props
    const upvotedItems = (localStorage.getItem('chs_upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedItems') || '').split(',')
    const upvoteColor = (upvotedItems.indexOf(id) === -1) ? 'white' : 'green'
    const downvoteColor = (downvotedItems.indexOf(id) === -1) ? 'white' : 'red'
    const sourceSelected = decodeURIComponent(source !== 'undefined' ? source : id)

    return <div className='slideButtons' style={(stateData[2] !== 'audios') ? styles.buttonContainer : {
      ...styles.buttonContainer,
      bottom: 100
    }}>
      <IconButton
        onClick={() => this._handleUpvote(id, stateData[0])}
        color='red'
        style={styles.upArrow}
        tooltipPosition='center-left'
        tooltip={translate('pos.upvote')}
        iconStyle={styles.iconButton}
      ><IconThumbUp hoverColor={themes[theme].highlightColors[0]} color={upvoteColor} />
      </IconButton>
      <IconButton
        onClick={() => this._handleDownvote(id, stateData[0])}
        style={styles.downArrow}
        iconStyle={styles.iconButton}
        tooltipPosition='center-left'
        tooltip={translate('pos.downvote')}
      ><IconThumbDown hoverColor={themes[theme].highlightColors[0]} color={downvoteColor} /></IconButton>
      <div style={styles.scoreLabel}>{score} </div>
      {(stateData[2] === 'audios' || stateData[2] === 'articles' || (stateData[2] === 'ps' && (sourceSelected || '').indexOf('http') > -1) || stateData[2] === 'v')
        ? <IconButton
          style={styles.sourceButton}
          tooltipPosition='bottom-center'
          tooltip={sourceSelected}
          onClick={() => this._handleOpenSource(sourceSelected)}>
          tooltip={hasNoWiki ? translate('pos.discover_component.hasNoSource') : translate('pos.discover_component.openSource')}>
          <FloatingActionButton
            mini
            backgroundColor='#aaaaaaba'
          ><IconOutbound hoverColor={themes[theme].highlightColors[0]} color='white' style={{ padding: '0px', paddingLeft: 0, marginLeft: 0 }} />
          </FloatingActionButton>
        </IconButton> : null}
      <FloatingActionButton
        mini
        onClick={() => this._handleEdit(id, stateData[0])}
        backgroundColor='#aaaaaaba'
        style={styles.editButton}
      ><IconEdit hoverColor={themes[theme].highlightColors[0]} color='white' />
      </FloatingActionButton>
    </div>
  }

  render () {
    const { selectedYear, translate, rightDrawerOpen, theme, setRightDrawerVisibility } = this.props
    const { slidesData, selectedImage, slideIndex, tileData, tabDataKeys, isFetchingImages } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)

    const hasNoSource = typeof selectedImage.source === 'undefined' || selectedImage.source === ''
    const hasNoImage = typeof selectedImage.src === 'undefined' || selectedImage.src === ''
    const hasNoWiki = typeof selectedImage.wiki === 'undefined' || selectedImage.wiki === '' || (selectedImage.wiki || []).length === 0

    const titleText = (selectedImage.src !== '') ? '' : translate('pos.discover_label') + selectedYear

    const addButtonDynamicStyle = { ...styles.addButton, display: (selectedImage.src !== '') ? 'none' : 'inherit' }
    return (
      <div>
        <Toolbar style={{
          zIndex: 15000,
          color: 'white',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px'
        }}>
          <ToolbarGroup>
            <ToolbarTitle style={styles.toolbarTitleStyle} text={titleText} />
          </ToolbarGroup>
          <ToolbarGroup>
            <FloatingActionButton
              onClick={this._handleAdd}
              style={addButtonDynamicStyle}>
              <ContentAdd />
            </FloatingActionButton>
            <FloatingActionButton
              backgroundColor={'transparent'}
              style={styles.closeButton}
              key={'close'}
              onClick={this.handleClose}
            >
              <CloseIcon color={styles.toolbarTitleStyle.color} />
            </FloatingActionButton>
          </ToolbarGroup>
        </Toolbar>
        <Dialog open
          autoDetectWindowHeight={false}
          modal={false}
          onRequestClose={this.handleClose}
          contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogBackgroundHack'}
          contentStyle={styles.discoverDialogStyle}
          bodyStyle={{ backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          overlayStyle={styles.overlayStyle}
          style={{ backgroundColor: 'transparent', overflow: 'auto' }}
          titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
          autoScrollBodyContent={false}>

          <ImageGallery
            showPlayButton={false}
            showFullscreenButton={false}
            autoPlay
            slideDuration={1200}
            showBullets
            showThumbnails={false}
            items={slidesData}
            onClick={(event) => {
              const src = event.target.src
              const tile = slidesData.find(el => (el.original === src))

              this.setState({
                selectedImage: {
                  src: tile.subtype === 'ps' ? tile.thumbnail : (tile.src || tile.original || tile.poster),
                  year: tile.subtitle || tile.originalTitle,
                  title: tile.title || tile.description,
                  wiki: tile.subtype === 'ps' && [tile.wiki],
                  source: tile.source,
                  fullData: tile.fullData
                }
              })

              if (tile.subtype !== 'ps') {
                axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:' + window.encodeURIComponent((tile.src || tile.original)))
                  .then((linkedItemResult) => {
                    if (linkedItemResult.status === 200) {
                      const res = (linkedItemResult.data.map || []).concat(linkedItemResult.data.media || [])
                      this.setState({
                        selectedImage: {
                          ...this.state.selectedImage,
                          wiki: res.filter(el => el.properties.ct === 'marker' || el.properties.ct === 'area')
                        }
                      })
                    }
                  })
              }
            }}
          />

          <Tabs
            onChange={this.handleChange}
            value={slideIndex}
            tabItemContainerStyle={{
              backgroundColor: 'rgba(0,0,0,0)',
              margin: '0 auto',
              maxWidth: '1024px'
            }}
            inkBarStyle={{
              backgroundColor: themes[theme].highlightColors[0]
            }}
            style={{
              margin: '0 auto',
              width: '1024px',
              marginBottom: '1em',
              marginTop: '1em'
            }}
          >
            {tabDataKeys.map((tabKey, i) => (
              <Tab disabled={!(tileData[tabKey[0]].length > 0)}
                style={tileData[tabKey[0]].length > 0 ? {} : { opacity: 0.3, cursor: 'not-allowed' }}
                key={'tabHeader_' + i} label={translate('pos.discover_component.tabs.' + tabKey[1])} value={i} />
            ))}
          </Tabs>
          <SwipeableViews
            index={slideIndex}
            onChangeIndex={this.handleChange}>
            {tabDataKeys.map((tabKey, i) => (
              (slideIndex === i) ? <div style={styles.root} key={'tab_' + i}>
                <GridList
                  cellHeight={180}
                  padding={1}
                  cols={(tabKey[2] !== 'v')
                    ? (tabKey[2] === 'audios')
                      ? 1 : 3
                    : 2
                  }
                  style={styles.gridList}
                >
                  {tileData[tabKey[0]].length > 0 ? tileData[tabKey[0]].map((tile, j) => (
                    (tile.subtype !== 'epics' && tile.subtype !== 'v' && tile.subtype !== 'audios' /* && tile.subtype !== 'ps' */ && tile.subtype !== 'articles')
                      ? <GridTile
                        key={tile.src}
                        style={{ border: '1px solid black', cursor: 'pointer' }}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        title={tile.subtitle}
                        subtitle={tile.title}
                        actionIcon={this.slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i], hasNoWiki)}
                        actionPosition='right'
                        titlePosition='bottom'
                        titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                        cols={((j + 3) % 4 < 2) ? 1 : 2}
                        titleHeight={128}
                        rows={2}
                      >
                        <img src={tile.thumbnail || tile.src}
                          onError={() => this._removeTile(tabKey[0], tile.src)}
                          onClick={() => {
                            this.setState({
                              selectedImage: {
                                src: tile.subtype === 'ps' ? tile.thumbnail : (tile.src || tile.original || tile.poster),
                                year: tile.subtitle || tile.originalTitle,
                                title: tile.title || tile.description,
                                wiki: tile.subtype === 'ps' && [tile.wiki],
                                source: tile.source,
                                fullData: tile.fullData
                              }
                            })

                            if (tile.subtype !== 'ps') {
                              axios.get(properties.chronasApiHost + '/metadata/links/getLinked?source=1:' + window.encodeURIComponent(tile.src))
                                .then((linkedItemResult) => {
                                  if (linkedItemResult.status === 200) {
                                    const res = (linkedItemResult.data.map || []).concat(linkedItemResult.data.media || [])

                                    this.setState({
                                      selectedImage: {
                                        ...this.state.selectedImage,
                                        wiki: res.filter(el => el.properties.ct === 'marker' || el.properties.ct === 'area')
                                      }
                                    })
                                  }
                                })
                            }
                          }}
                        />
                      </GridTile>
                      : (tile.subtype === 'epics')
                        ? <GridTile
                          key={tile.src}
                          style={{ border: '1px solid black', cursor: 'pointer' }}
                          titleStyle={styles.title}
                          subtitleStyle={styles.subtitle}
                          title={tile.subtitle}
                          subtitle={tile.title}
                          actionIcon={this.slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i], hasNoWiki)}
                          actionPosition='right'
                          titlePosition='bottom'
                          titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 10%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                          cols={((j + 3) % 4 < 2) ? 1 : 2}
                          titleHeight={128}
                          rows={2}
                        >
                          <h1 style={{
                            position: 'absolute',
                            left: '0px',
                            right: '0px',
                            top: '0px',
                            margin: '0.3em',
                            color: 'white',
                            fontWeight: 'bolder',
                            fontSize: '3em',
                            textShadow: '0.03em 0 4px #000, 0.03em 0 4px #000, 0.03em 0 4px #000, 0.03em 0 4px #000'
                          }}>EPIC</h1>
                          <img src={tile.poster || '/images/placeholder-epic.png'}
                            onError={() => this._removeTile(tabKey[0], tile.src)}
                            onClick={() => {
                              this.setState({
                                selectedImage: {
                                  src: tile.src,
                                  poster: tile.poster,
                                  year: tile.subtitle,
                                  title: tile.title,
                                  wiki: tile.wiki,
                                  source: tile.source,
                                  fullData: tile.fullData
                                }
                              })
                            }}
                          />
                        </GridTile>
                        : <GridTile
                          key={tile.src}
                          style={{ border: '1px solid black', cursor: 'pointer' }}
                          titleStyle={styles.title}
                          subtitleStyle={styles.subtitle}
                          title={tile.subtitle}
                          subtitle={tile.title}
                          actionIcon={this.slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i], hasNoWiki)}
                          actionPosition='right'
                          titlePosition='bottom'
                          titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                          rows={tile.subtype === 'audios' ? 1 : 2}
                          titleHeight={128}
                        >
                          {getYoutubeId(tile.src)
                            ? <YouTube
                              className='videoContent'
                              videoId={getYoutubeId(tile.src)}
                              opts={properties.YOUTUBEOPTS}
                              onError={() => this._removeTile(tabKey[0], tile.src)}
                            />
                            : <Player className='videoContent' fluid={false} ref='player'>
                              <source src={tile.src} />
                            </Player>
                          }
                        </GridTile>
                  )) : (isFetchingImages ? <LoadingCircle theme={theme} title={translate('pos.loading')} />
                    : <span>No items found</span>)}
                </GridList>
              </div> : <div />
            ))}
          </SwipeableViews>
        </Dialog>
        <Dialog
          autoDetectWindowHeight={false}
          modal={false}
          contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogImageBackgroundHack'}
          contentStyle={{ ...styles.discoverDialogStyle, overflow: 'auto', left: '64px', maxWidth: 'calc(100% - 64px)' }}
          bodyStyle={{ backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          style={{ backgroundColor: 'transparent', overflow: 'hidden' }}
          titleStyle={{ backgroundColor: 'transparent', borderRadius: 0 }}
          autoScrollBodyContent={false}
          open={(selectedImage.src !== '')}
          onRequestClose={this.handleImageClose}
        >
          <img src={selectedImage.poster || selectedImage.src} style={styles.selectedIMG} />
          <div style={styles.selectedImageContent}>
            <h1 style={styles.selectedImageTitle}>{selectedImage.year}</h1>
            <p style={styles.selectedImageDescription}>{selectedImage.title}</p>
            <div style={styles.selectedImageButtonContainer}>

              {hasNoWiki || ((selectedImage || {}).wiki || []).length === 1
                ? <IconButton
                  style={{ ...styles.buttonOpenArticle, paddingRight: '1em' }}
                  tooltipPosition='bottom-center'
                  tooltip={hasNoWiki ? translate('pos.discover_component.hasNoArticle') : (translate('pos.discover_component.openArticle') + '  ' + (((selectedImage.wiki[0].properties || {}).n || '').toString() || '').toUpperCase())}>
                  <RaisedButton
                    hoverColor={themes[theme].highlightColors[0]}
                    disabled={hasNoWiki}
                    label={translate('pos.discover_component.openArticle')}
                    onClick={() => this._openPartOf(selectedImage.wiki[0], selectedImage.fullData)}
                    primary
                  />
                </IconButton>
                : <SelectField
                  style={{
                    width: 200,
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: 'transparent',
                    maxHeight: 36,
                    textAlign: 'center'
                  }}
                  menuStyle={{
                    width: 200,
                    color: 'rgb(255, 255, 255)',
                    top: 14,
                    maxHeight: 36,
                    backgroundColor: 'rgb(106, 106, 106)'
                  }}
                  menuItemStyle={{
                    width: 200,
                    maxHeight: 36,
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgb(106, 106, 106)'
                  }}
                  labelStyle={{
                    maxHeight: 36,
                    width: 200,
                    left: 0,
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgb(106, 106, 106)'
                  }}
                  listStyle={{ width: 200 }}
                  underlineStyle={{ width: 200 }}
                  floatingLabelStyle={{
                    maxHeight: 36,
                    width: 200,
                    left: 0,
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgb(106, 106, 106)'
                  }}
                  hintStyle={{ width: 200, left: 22, color: 'rgb(255, 255, 255)' }}
                  // maxHeight={36}
                  floatingLabelText={translate('pos.related_item')}
                  hintText={translate('pos.related_item')}
                  value={null}
                  onChange={(event, index, value) => {
                    this._openPartOf(value)
                  }}
                >
                  {(selectedImage.wiki || []).map((el) => {
                    return <MenuItem value={el}
                      primaryText={((el.properties || {}).n || (el.properties || {}).w || '').toString().toUpperCase()} />
                  })}
                </SelectField>
              }
              {selectedImage.src && <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition='bottom-center'
                tooltip={hasNoWiki ? translate('pos.discover_component.hasNoImage') : translate('pos.discover_component.openSource')}>
                <RaisedButton
                  hoverColor={themes[theme].highlightColors[0]}
                  disabled={hasNoImage}
                  label={translate('pos.discover_component.openSource')}
                  primary
                  onClick={() => this._handleOpenSource(selectedImage.src)}>
                  <IconOutbound color='white'
                    style={{ float: 'right', padding: '4px', paddingLeft: 0, marginLeft: -10 }} />
                </RaisedButton>
              </IconButton>}
              <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition='bottom-center'
                tooltip={hasNoWiki ? translate('pos.discover_component.hasNoSource') : translate('pos.discover_component.openSource')}>
                <RaisedButton
                  hoverColor={themes[theme].highlightColors[0]}
                  disabled={hasNoSource}
                  label={translate('pos.openSource')}
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
                  hoverColor={themes[theme].highlightColors[0]}
                  label={translate('pos.edit')}
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

const mapStateToProps = state => ({
  activeArea: state.activeArea,
  selectedYear: state.selectedYear,
  rightDrawerOpen: state.rightDrawerOpen,
  theme: state.theme,
  locale: state.locale,
  menuItemActive: state.menuItemActive,
})

export default connect(mapStateToProps, {
  setAreaColorLabel,
  setRightDrawerVisibility,
  selectAreaItem,
  selectEpicItem,
  selectLinkedItem,
  selectMarkerItem,
  showNotification
})(translate(Discover))
