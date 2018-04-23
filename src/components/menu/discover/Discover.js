import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import { Player } from 'video-react'
import Dialog from 'material-ui/Dialog'
import { GridList, GridTile } from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconEdit from 'material-ui/svg-icons/content/create'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import ContentAdd from 'material-ui/svg-icons/content/add';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tabs, Tab } from 'material-ui/Tabs'
import ImageGallery from 'react-image-gallery'
import SwipeableViews from 'react-swipeable-views'
import { translate, ViewTitle, showNotification } from 'admin-on-rest'
import axios from 'axios'
import { green400, green600, blue400, blue600, red400, red600 } from 'material-ui/styles/colors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { setRightDrawerVisibility } from '../../content/actionReducers'
import {selectLinkedItem, selectMarkerItem} from '../../map/actionReducers'
import { changeTheme as changeThemeAction, changeLocale as changeLocaleAction } from './actionReducers'
import properties from "../../../properties";

const imgButton = { width: 20, height: 20}
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
    bottom: 290,
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
    maxWidth: '32em',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    bottom: '10%'
  },
  selectedImageTitle: {
    fontWeight: 400,
    fontSize: '3.125em',
    margin: '.4em 0',
    lineHeight: '1.3',
    textAlign: 'left',
    color: '#fff',
    fontFamily: "Roboto Slab','Georgia','Times New Roman',serif",
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
  }
}

const YOUTUBEOPTS = {
  height: '100%',
  width: '100%',
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0
  }
}

class Discover extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedImage: { src: '', year: '', title: '', wiki: '', source: '' },
      slideIndex: 0,
      currentYearLoaded: 3000,
      hiddenElement: true,
      slidesData: [],
      tileData: {
        tilesHighlightData: [],
        tilesArticlesData: [],
        tilesStoriesData: [],
        tilesPeopleData: [],
        tilesCitiesData: [],
        tilesBattlesData: [],
        tilesOtherData: [],
        tilesVideosData: [],
        tilesPodcastsData: [],
        tilesPsData: []
      },
      tabDataKeys: [
        ['tilesHighlightData','HIGHLIGHTS',''],
        ['tilesArticlesData','ARTICLES','articles'],
        ['tilesStoriesData','STORIES','stories'],
        ['tilesPeopleData','PEOPLE','people'],
        ['tilesCitiesData','CITIES','cities'],
        ['tilesBattlesData','BATTLES','battles'],
        ['tilesOtherData','OTHER','misc'],
        ['tilesVideosData','VIDEOS','videos'],
        ['tilesPodcastsData','PODCASTS','audios'],
        ['tilesPsData','PRIMARY SOURCES','ps']
      ]
    }
  }

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
    this.setState({ selectedImage: { src: '', year: '', title: '', wiki: '', source: '' } })
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillMount = () => {
    console.debug("componentWillMountcomponentWillMount")
    if (this.props.selectedYear !== this.state.currentYearLoaded) {
      this._updateImages(this.props.selectedYear)
    }
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  componentWillReceiveProps = (nextProps) => {
    const { selectedYear } = this.props
    console.debug('### DISCOVER componentWillReceiveProps', this.props)

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear) {
      this._updateImages(nextProps.selectedYear)
    }
  }

  _updateImages = (selectedYear) => {
    // Load slides data
    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i')
      .then(response => {
        const newSlideData = []
        const res = response.data
        res.forEach((imageItem, i) => {
          if (i < 10) {
            newSlideData.push({
              original: imageItem._id,
              thumbnail: imageItem._id,
              description: imageItem.data.title,
              source: imageItem.data.source,
              subtype: imageItem.subtype,
              wiki: imageItem.wiki,
              originalTitle: imageItem.year,
              thumbnailTitle: imageItem.year,
              score: imageItem.score,
            })
          }
        })
        this.setState({
          currentYearLoaded: selectedYear,
          slidesData: newSlideData,
        })
      })

    // Load tab data
    this.state.tabDataKeys.forEach(categoryObj => {
      axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=' + categoryObj[2])
        .then(response => {
          const newTilesData = []
          const res = response.data
          res.forEach((imageItem) => {
            newTilesData.push({
              src: imageItem._id,
              wiki: imageItem.wiki,
              title: imageItem.data.title,
              subtype: imageItem.subtype,
              source: imageItem.data.source,
              subtitle: imageItem.year,
              score: imageItem.score,
            })
          })
          this.setState({
            currentYearLoaded: selectedYear,
            tileData: {...this.state.tileData, [categoryObj[0]]: newTilesData}
          })
        })
    })
  }

  _handleUpvote = (id, stateDataId) => {
    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
            if (encodeURIComponent(el.src) === id) el.score -= 1
            return el
          })
          this.setState({ tileData: tileData  })
          this.forceUpdate()
        })
    } else if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote twice
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
            .then(() => {
              tileData[stateDataId] = tileData[stateDataId].map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score += 2
                  return el
                })
              this.setState({ tileData: tileData  })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just upvote
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.props.showNotification((typeof localStorage.getItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            })
          this.setState({ tileData: tileData  })
          this.forceUpdate()
        })
    }
  }

  _handleDownvote = (id, stateDataId) => {
    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            })
          this.setState({ tileData: tileData  })
          this.forceUpdate()
        })
    } else if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote twice
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
            .then(() => {
              tileData[stateDataId] = tileData[stateDataId].map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score -= 2
                  return el
                })
              this.setState({ tileData: tileData  })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just downvote
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.props.showNotification((typeof localStorage.getItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          tileData[stateDataId] = tileData[stateDataId].map((el) => {
              if (encodeURIComponent(el.src) === id) el.score -= 1
              return el
            })
          this.setState({ tileData: tileData  })
          this.forceUpdate()
        })
    }
  }

  _handleEdit = (id, dataKey = false) => {
    const selectedItem = (dataKey) ? this.state.tileData[dataKey].filter(el => (el.src === decodeURIComponent(id)))[0] : this.state.selectedImage
    this.props.selectLinkedItem(selectedItem)
    this.props.history.push('/mod/linked')
  }

  _handleAdd = () => {
    this.props.history.push('/mod/linked/create')
  }

  _handleOpenSource = (source) => {
    console.debug("_handleOpenSource", source)
    window.open(source, '_blank').focus()
  }

  _handleOpenArticle = (selectedImage) => {
    // Albert_Einstein
    this.props.selectLinkedItem(selectedImage.wiki)
    this.props.history.push('/article') //TODO not working yet
  }

  _getYoutubeId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      false
    }
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

  render () {
    const {  selectedYear, translate, rightDrawerOpen, setRightDrawerVisibility } = this.props
    const { slidesData, selectedImage, slideIndex, tileData, tabDataKeys } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)

    const hasSource = typeof selectedImage.source === "undefined" || selectedImage.source === ''
    const hasWiki = typeof selectedImage.wiki === "undefined" || selectedImage.wiki === ''

    const slideButtons = (score, id, source, stateData) => {
      console.debug(id, source, source || id)

      const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
      const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
      const upvoteColor = (upvotedItems.indexOf(id) === -1) ? 'white' : 'green'
      const downvoteColor = (downvotedItems.indexOf(id) === -1) ? 'white' : 'red'

      const sourceSelected = decodeURIComponent(source !== "undefined" ? source : id)

      return <div className="slideButtons" style={(stateData[2] !== 'audios') ? styles.buttonContainer : { ...styles.buttonContainer, bottom: 100} }>
        <IconButton
          onClick={() => this._handleUpvote(id, stateData[0])}
          color='red'
          style={ styles.upArrow }
          tooltipPosition="center-left"
          tooltip={translate('pos.upvote')}
          iconStyle={ styles.iconButton }
        ><IconThumbUp color={upvoteColor} />
        </IconButton>
        <IconButton
          onClick={() => this._handleDownvote(id, stateData[0])}
          style={ styles.downArrow }
          iconStyle={ styles.iconButton }
          tooltipPosition="center-left"
          tooltip={translate('pos.downvote')}
        ><IconThumbDown color={downvoteColor} /></IconButton>
        <div style={ styles.scoreLabel }>{ score} </div>
        {(stateData[2] === 'audios' || stateData[2] === 'articles' || stateData[2] === 'ps' || stateData[2] === 'videos') ? <IconButton
          style={styles.sourceButton}
          tooltipPosition="bottom-center"
          tooltip={sourceSelected}
          onClick={() => this._handleOpenSource(sourceSelected)} >
          tooltip={hasWiki ? translate('pos.discover.hasNoSource') : translate('pos.discover.openSource')}>
          <FloatingActionButton
            mini={true}
            backgroundColor='#aaaaaaba'
          ><IconOutbound color="white" style={{ padding: '0px', paddingLeft: 0, marginLeft: 0 }} />
          </FloatingActionButton >
        </IconButton> : null }
        <FloatingActionButton
          mini={true}
          onClick={() => this._handleEdit(id, stateData[0])}
          backgroundColor='#aaaaaaba'
          style={ styles.editButton }
        ><IconEdit color='white' />
        </FloatingActionButton >
      </div>
    }

    const titleText = (selectedImage.src !== '') ? '' : translate('pos.discover_label') + selectedYear

    const addButtonDynamicStyle = {...styles.addButton, display: (selectedImage.src !== '') ? 'none' : 'inherit'}
    return (
      <div>
        <Toolbar style={{ zIndex: 15000, color: 'white', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
          <ToolbarGroup>
            <ToolbarTitle style={styles.toolbarTitleStyle} text={titleText} />
          </ToolbarGroup>
          <ToolbarGroup>
            <FloatingActionButton
              onClick={this._handleAdd}
              style={ addButtonDynamicStyle }>
              <ContentAdd />
            </FloatingActionButton>
            <FloatingActionButton
              backgroundColor={'transparent'}
              style={styles.closeButton}
              key={'close'}
              onClick={this.handleClose}
            >
              <CloseIcon color={styles.toolbarTitleStyle.color} />
            </FloatingActionButton >
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
            autoPlay={true}
            slideDuration={1200}
            showBullets={true}
            showThumbnails={false}
            items={slidesData}
            onClick={(event) => {
              const src = event.target.src
              const selectedSlide = slidesData.filter(el => (el.original === src))[0]

              this.setState({ selectedImage: {
                src: selectedSlide.original,
                year: selectedSlide.originalTitle,
                title: selectedSlide.description,
                wiki: selectedSlide.wiki,
                source: selectedSlide.source
              } })
            }}
          />

          <Tabs
            onChange={this.handleChange}
            value={slideIndex}
            tabItemContainerStyle={{
              backgroundColor: 'rgba(0,0,0,0)',
              margin: '0 auto',
              maxWidth: '800px'
            }}
            style={{
              margin: '0 auto',
              width: '800px',
              marginBottom: '1em',
              marginTop: '1em' }}
          >
            {tabDataKeys.map((tabKey, i) => (
            <Tab disabled={tileData[tabKey[0]].length > 0 ? false : true}  style={tileData[tabKey[0]].length > 0 ? {} : {opacity: 0.3, cursor: 'not-allowed'}} key={'tabHeader_' + i} label={tabKey[1]} value={i} />
              ))}
          </Tabs>
          <SwipeableViews
            index={slideIndex}
            onChangeIndex={this.handleChange}>
            {tabDataKeys.map((tabKey, i) => (
            <div style={styles.root} key={'tab_' + i}>
              <GridList
                cellHeight={180}
                padding={1}
                cols={(tabKey[2] !== 'videos')
                  ? (tabKey[2] === 'audios') ?
                    1 : 3
                  : 2
                }
                style={styles.gridList}
              >
                {tileData[tabKey[0]].length > 0 ? tileData[tabKey[0]].map((tile, j) => (
                    (tile.subtype !== 'videos' && tile.subtype !== 'audios' && tile.subtype !== 'ps' && tile.subtype !== 'articles') ? <GridTile
                        key={tile.src}
                        style={{border: '1px solid black', cursor: 'pointer' }}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        title={tile.subtitle}
                        subtitle={tile.title}
                        actionIcon={slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i])}
                        actionPosition='right'
                        titlePosition='bottom'
                        titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                        cols={((j+3)%4 < 2) ? 1 : 2}
                        rows={2}
                      >
                        <img src={tile.src}
                                     onError={() => this._removeTile(tabKey[0], tile.src)}
                                     onClick={() => { this.setState({ selectedImage: {
                                         src: tile.src,
                                         year: tile.subtitle,
                                         title: tile.title,
                                         wiki: tile.wiki,
                                         source: tile.source
                                       } })}}
                          />
                      </GridTile>
                    : (tile.subtype === 'articles' || tile.subtype === 'ps')
                      ? <GridTile
                          key={tile.src}
                          style={{border: '1px solid black', cursor: 'pointer'}}
                          titleStyle={styles.title}
                          subtitleStyle={styles.subtitle}
                          title={tile.subtitle}
                          subtitle={tile.title}
                          actionIcon={slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i])}
                          actionPosition='right'
                          titlePosition='bottom'
                          titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                          cols={((j+3)%4 < 2) ? 1 : 2}
                          rows={2}
                        ><img src='http://www.antigrain.com/research/font_rasterization/msword_text_rendering.png'
                               onError={() => this._removeTile(tabKey[0], tile.src)}
                               onClick={() => { this.setState({ selectedImage: {
                                   src: tile.src,
                                   year: tile.subtitle,
                                   title: tile.title,
                                   wiki: tile.wiki,
                                   source: tile.source
                                 } })}}
                        />
                        </GridTile>
                        : <GridTile
                            key={tile.src}
                            style={{border: '1px solid black', cursor: 'pointer', pointerEvents: 'none'}}
                            titleStyle={styles.title}
                            subtitleStyle={styles.subtitle}
                            title={tile.subtitle}
                            subtitle={tile.title}
                            actionIcon={slideButtons(tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), tabDataKeys[i])}
                            actionPosition='right'
                            titlePosition='bottom'
                            titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                            rows={ tile.subtype === 'audios' ? 1 : 2}
                          >
                            {this._getYoutubeId(tile.src)
                              ? <YouTube
                                  className='videoContent'
                                  videoId={this._getYoutubeId(tile.src)}
                                  opts={YOUTUBEOPTS}
                                  onError={() => this._removeTile(tabKey[0], tile.src)}
                                />
                              : <Player className='videoContent' fluid={false} ref="player">
                                <source src={tile.src} />
                              </Player>
                            }
                          </GridTile>
                    )) : <span> - nothing here - </span>}
              </GridList>
            </div>))}
          </SwipeableViews>
        </Dialog>
        <Dialog
          autoDetectWindowHeight={false}
          modal={false}
          contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogImageBackgroundHack'}
          contentStyle={{ ...styles.discoverDialogStyle, overflow: 'auto', left: '64px', maxWidth: 'calc(100% - 64px)'}}
          bodyStyle={{ backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          style={{ backgroundColor: 'transparent', overflow: 'auto' }}
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
                style={{ ...styles.buttonOpenArticle, paddingRight: '1em' }}
                tooltipPosition="bottom-center"
                tooltip={hasWiki ? translate('pos.discover.hasNoArticle') : translate('pos.discover.openArticle')}>
                  <RaisedButton
                    disabled={hasWiki}
                    label="Open Article"
                    primary={true}
                    onClick={() => this._handleOpenArticle(selectedImage)}
                  />
              </IconButton>

              <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition="bottom-center"
                tooltip={hasWiki ? translate('pos.discover.hasNoSource') : translate('pos.discover.openSource')}>
                <RaisedButton
                  disabled={hasSource}
                  label="Open Source"
                  primary={true}
                  onClick={() => this._handleOpenSource(selectedImage.source)} >
                  <IconOutbound color="white" style={{ float: 'right', padding: '4px', paddingLeft: 0, marginLeft: -10 }} />
                </RaisedButton>
              </IconButton>
              <IconButton
                style={styles.buttonOpenArticle}
                tooltipPosition="bottom-center"
                tooltip={translate('pos.discover.edit')}>
                <RaisedButton
                  label="Edit"
                  primary={true}
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
  selectedYear: state.selectedYear,
  rightDrawerOpen: state.rightDrawerOpen,
  theme: state.theme,
  locale: state.locale,
  menuItemActive: state.menuItemActive,
})

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
  setRightDrawerVisibility,
  selectLinkedItem,
  selectMarkerItem,
  showNotification
})(translate(Discover))
