import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
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
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tabs, Tab } from 'material-ui/Tabs'
import ImageGallery from 'react-image-gallery'
import SwipeableViews from 'react-swipeable-views'
import { translate, ViewTitle, showNotification } from 'admin-on-rest'
import axios from 'axios'
import { green400, green600, blue400, blue600, red400, red600 } from 'material-ui/styles/colors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { setRightDrawerVisibility } from '../../content/actionReducers'
import { changeTheme as changeThemeAction, changeLocale as changeLocaleAction } from './actionReducers'
import properties from "../../../properties";

const imgButton = { width: 20, height: 20}
const styles = {
  buttonContainer: {
    width: 70,
    height: 50,
    /* margin-top: -315px; */
    position: 'relative',
    right: 0,
    bottom: 290
  },
  imageDialog: {
    width: '100%',
    maxWidth: 'none',
  },
  iconButton: { filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))' },
  upArrow: { ...imgButton, padding: 0, top: -13 },
  downArrow: { ...imgButton, padding: 0, bottom: -13, left: -20 },
  editButton: { ...imgButton, left: -14, top: 1, position: 'relative' },
  scoreLabel: {
    width: 40,
    height: 20,
    right: 38,
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
  },
  title: {
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

class Discover extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedImage: { img: '', year: '', title: '', wiki: '', source: '' },
      slideIndex: 0,
      currentYearLoaded: 3000,
      hiddenElement: true,
      slidesData: [],
      tileData: {
        tilesHighlightData: [],
        tilesStoriesData: [],
        tilesPeopleData: [],
        tilesCitiesData: [],
        tilesBattlesData: [],
        tilesOtherData: []
      },
      tabDataKeys: [
        ['tilesHighlightData','HIGHLIGHTS'],
        ['tilesStoriesData','STORIES'],
        ['tilesPeopleData','PEOPLE'],
        ['tilesCitiesData','CITIES'],
        ['tilesBattlesData','BATTLES'],
        ['tilesOtherData','OTHER'],
        ['tilesOtherData','VIDEOS'],
        ['tilesOtherData','PODCASTS'],
        ['tilesOtherData','PRIMARY SOURCES']
      ]
    }
  }

  handleChange = (value) => {
    this.setState({ slideIndex: value })
  }

  handleClose = () => {
    if (this.state.selectedImage.img !== '') {
      this.handleImageClose()
      return
    }
    this.props.history.push('/')
  }

  handleImageClose = () => {
    this.setState({ selectedImage: { img: '', year: '', title: '', wiki: '', source: '' } })
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
    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i')
      .then(response => {
        const newTilesData = []
        const newSlideData = []
        const res = response.data
        res.forEach((imageItem, i) => {
          if (i < 5) {
            newSlideData.push({
              original: imageItem._id,
              thumbnail: imageItem._id,
              description: imageItem.data.title,
              source: imageItem.data.source,
              wiki: imageItem.data.wiki,
              originalTitle: imageItem.year,
              thumbnailTitle: imageItem.year,
              score: imageItem.score,
            })
          }
          newTilesData.push({
            img: imageItem._id,
            wiki: imageItem.data.wiki,
            title: imageItem.data.title,
            source: imageItem.data.source,
            subtitle: imageItem.year,
            score: imageItem.score,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          slidesData: newSlideData,
          tileData: {...this.state.tileData, tilesHighlightData: newTilesData}
        })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=cities')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            wiki: imageItem.data.wiki,
            title: imageItem.data.title,
            source: imageItem.data.source,
            subtitle: imageItem.year,
            score: imageItem.score,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tileData: {...this.state.tileData, tilesCitiesData: newTilesData}
        })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=battles')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            wiki: imageItem.data.wiki,
            title: imageItem.data.title,
            source: imageItem.data.source,
            subtitle: imageItem.year,
            score: imageItem.score,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tileData: {...this.state.tileData, tilesBattlesData: newTilesData}
        })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=misc')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            wiki: imageItem.data.wiki,
            title: imageItem.data.title,
            source: imageItem.data.source,
            subtitle: imageItem.year,
            score: imageItem.score,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tileData: {...this.state.tileData, tilesOtherData: newTilesData}
        })
      })
  }

  _handleUpvote = (id, stateDataId) => {
    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const originalState = this.state[stateDataId]

    if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.setState({ [stateDataId]: originalState.map((el) => {
              if (encodeURIComponent(el.img) === id) el.score -= 1
            return el
          })})
        })
    } else if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote twice
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
            .then(() => {
              this.setState({ [stateDataId]: originalState.map((el) => {
                  if (encodeURIComponent(el.img) === id) el.score += 2
                  return el
                })})
            })
        })
    } else {
      // neutral -> just upvote
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.props.showNotification((typeof localStorage.getItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({ [stateDataId]: originalState.map((el) => {
              if (encodeURIComponent(el.img) === id) el.score += 1
              return el
            })})
        })
    }
  }

  _handleDownvote = (id, stateDataId) => {
    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const originalState = this.state[stateDataId]

    if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.setState({ [stateDataId]: originalState.map((el) => {
              if (encodeURIComponent(el.img) === id) el.score += 1
              return el
            })})
        })
    } else if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote twice
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
            .then(() => {
              this.setState({ [stateDataId]: originalState.map((el) => {
                  if (encodeURIComponent(el.img) === id) el.score -= 2
                  return el
                })})
            })
        })
    } else {
      // neutral -> just downvote
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}})
        .then(() => {
          this.props.showNotification((typeof localStorage.getItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({ [stateDataId]: originalState.map((el) => {
              if (encodeURIComponent(el.img) === id) el.score -= 1
              return el
            })})
        })
    }
  }

  _handleEdit = () => {
    this.props.history.push('/mod/linked') //TODO not working yet
  }

  _handleOpenSource = (source) => {
    window.open(source, '_blank').focus()
  }

  _handleOpenArticle = () => {

  }

  render () {
    const {  selectedYear, translate, rightDrawerOpen, setRightDrawerVisibility } = this.props
    const { slidesData, selectedImage, slideIndex, tileData, tabDataKeys } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)

    const hasSource = typeof selectedImage.source === "undefined" || selectedImage.source === ''
    const hasWiki = typeof selectedImage.wiki === "undefined" || selectedImage.wiki === ''

    const slideButtons = (score, id, stateDataId) => {

      const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
      const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
      const upvoteColor = (upvotedItems.indexOf(id) === -1) ? 'white' : 'green'
      const downvoteColor = (downvotedItems.indexOf(id) === -1) ? 'white' : 'red'

      return <div className="slideButtons" style={ styles.buttonContainer }>
        <IconButton
          onClick={() => this._handleUpvote(id, stateDataId)}
          color='red'
          style={ styles.upArrow }
          tooltipPosition="center-left"
          tooltip={translate('pos.upvote')}
          iconStyle={ styles.iconButton }
        ><IconThumbUp color={upvoteColor} />
        </IconButton>
        <IconButton
          onClick={() => this._handleDownvote(id, stateDataId)}
          style={ styles.downArrow }
          iconStyle={ styles.iconButton }
          tooltipPosition="center-left"
          tooltip={translate('pos.downvote')}
        ><IconThumbDown color={downvoteColor} /></IconButton>
        <div style={ styles.scoreLabel }>{ score} </div>
        <FloatingActionButton
          mini={true}
          onClick={() => this._handleEdit({id})}
          backgroundColor='#aaaaaaba'
          style={ styles.editButton }
        ><IconEdit color='white' />
        </FloatingActionButton >
      </div>
    }

    const titleText = (selectedImage.img !== '') ? '' : translate('pos.discover_label') + selectedYear

    return (
      <div>
        <Toolbar style={{ zIndex: 15000, color: 'white', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
          <ToolbarGroup>
            <ToolbarTitle style={styles.toolbarTitleStyle} text={titleText} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton
              style={{ zIndex: 15000 }}
              touch
              key={'close'}
              onClick={this.handleClose}
            >
              <CloseIcon color={styles.toolbarTitleStyle.color} />
            </IconButton>
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
            slideDuration={800}
            showBullets={true}
            showThumbnails={false}
            items={slidesData}
            onClick={(event) => {
              const src = event.target.src
              const selectedSlide = slidesData.filter(el => (el.original === src))[0]

              this.setState({ selectedImage: {
                img: selectedSlide.original,
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
            <Tab key={'tabHeader_' + i} label={tabKey[1]} value={i} />
              ))}
          </Tabs>
          <SwipeableViews
            index={slideIndex}
            onChangeIndex={this.handleChange}>
            {/* // TAB 0 */}
            {tabDataKeys.map((tabKey, i) => (
            <div style={styles.root} key={'tab_' + i}>
              <GridList
                cellHeight={180}
                padding={1}
                cols={3}
                style={styles.gridList}
              >
                {tileData[tabKey[0]].map((tile, i) => (
                  <GridTile
                    key={tile.img}
                    style={{border: '1px solid black', cursor: 'pointer'}}
                    titleStyle={styles.title}
                    subtitleStyle={styles.subtitle}
                    title={tile.subtitle}
                    subtitle={tile.title}
                    actionIcon={slideButtons(tile.score, encodeURIComponent(tile.img), "tilesHighlightData")}
                    actionPosition='right'
                    titlePosition='bottom'
                    titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                    cols={((i+3)%4 < 2) ? 1 : 2}
                    rows={2}
                  >
                    <img src={tile.img} onClick={() => { this.setState({ selectedImage: {
                        img: tile.img,
                        year: tile.subtitle,
                        title: tile.title,
                        wiki: tile.wiki,
                        source: tile.source
                    } })}} />
                  </GridTile>
                ))}
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
          open={(selectedImage.img !== '')}
          onRequestClose={this.handleImageClose}
        >
          <img src={selectedImage.img} style={styles.selectedIMG} />
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
                    onClick={() => this._handleOpenArticle}
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
                  onClick={() => this._handleEdit} />
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
  showNotification
})(translate(Discover))
