import React from 'react'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import { selectLinkedItem } from '../../map/actionReducers'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import YouTube from 'react-youtube'
import axios from 'axios'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Player } from 'video-react'
import Dialog from 'material-ui/Dialog'
import { GridList } from 'material-ui/GridList'
import GridTile from '../../overwrites/GridTile'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconEdit from 'material-ui/svg-icons/content/create'
import ContentLink from 'material-ui/svg-icons/content/link'
import CommentIcon from 'material-ui/svg-icons/communication/comment'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import ContentFilter from 'material-ui/svg-icons/content/filter-list'
import IconButton from 'material-ui/IconButton'
import { showNotification, translate, ViewTitle } from 'admin-on-rest'
import { red400 } from 'material-ui/styles/colors'
import { getYoutubeId, properties, themes } from '../../../properties'
import { resetModActive, setFullModActive } from '../../restricted/shared/buttons/actionReducers'
import { toggleRightDrawer as toggleRightDrawerAction } from '../actionReducers'

const fullRadian = Math.PI * 2

const MODE = [
  'circlePack',
  'partition'
]
const GALLERYBATCHSIZE = 10
const imgButton = { width: 20, height: 20 }
const styles = {
  container: {
    padding: '16px',
    // backgroundColor: 'rgba(0,0,0,0.7)'
  },
  addButton: {
    zIndex: 15000,
    // marginTop: '3em',
    // marginRight: '3em'
  },
  buttonContainer: {
    width: 70,
    height: 50,
    /* margin-top: -315px; */
    position: 'relative',
    right: 0,
    bottom: 260,
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
  fullButton: { ...imgButton, right: 170, top: 1, position: 'absolute', padding: 0 },
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
  linkedGalleryDialogStyle: {
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
  rootMenu: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-end',
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
    position: 'absolute',
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
  }
}

class LinkedGallery extends React.Component {
  loadLinkedItemsToTileData = (nextLinkedItems) => {
    this.setState({
      showMax: GALLERYBATCHSIZE,
      tileData: nextLinkedItems,
    },
    this.forceUpdate)
  }
  handleChangeFilter = (event, value) => {
    this.setState({
      filtered: value,
      showMax: GALLERYBATCHSIZE
    })
  };
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
    window.addEventListener('resize', this._resize, {passive: true})
  }
  componentWillMount = () => {
    this.loadLinkedItemsToTileData(this.props.linkedItems)
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
    window.removeEventListener('resize', this._resize)
  }
  componentWillReceiveProps = (nextProps) => {
    const { linkedItems } = this.props

    const nextMediaSrc = nextProps.linkedItems.map(el => el.src)
    if (linkedItems && nextProps.linkedItems && ((linkedItems || []).length !== (nextProps.linkedItems || []).length || (linkedItems || []).some(el => !nextMediaSrc.includes(el.src)))) {
      this.loadLinkedItemsToTileData(nextProps.linkedItems)
    }
  }
  _resize = () => {
    this.forceUpdate()
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
          this.setState({
            tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score -= 1
              return el
            })
          })
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
              this.setState({
                tileData: tileData.map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score += 2
                  return el
                })
              })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just upvote
      localStorage.setItem('chs_upvotedItems', upvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          this.props.showNotification((typeof token !== 'undefined') ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({
            tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            })
          })
          this.forceUpdate()
        })
    }
  }
  _handleDownvote = (id) => {
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
          this.setState({
            tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            })
          })
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
              this.setState({
                tileData: tileData.map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score -= 2
                  return el
                })
              })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just downvote
      localStorage.setItem('chs_downvotedItems', downvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
        .then(() => {
          this.props.showNotification((typeof token !== 'undefined') ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({
            tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score -= 1
              return el
            })
          })
          this.forceUpdate()
        })
    }
  }
  _minimize = () => {
    this.props.setContentMenuItem('')
  }
  _handleEdit = (id) => {
    const selectedItem = this.state.tileData.find(el => (el.src === decodeURIComponent(id)))
    this.props.selectLinkedItem(selectedItem)
    this.props.history.push('/mod/linked')
  }
  _handleAdd = () => {
    this.props.history.push('/mod/links')
  }
  _handleOpenSource = (source) => {
    window.open(source, '_blank').focus()
  }
  _removeTile = (tileSrc) => {
    const originalTileData = this.state.tileData.filter(el => el.src !== tileSrc)

    this.setState({
      tileData: originalTileData
    })

    this.forceUpdate()
  }
  _handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (bottom) {
      const { showMax, tileData, filtered } = this.state
      const tileLength = tileData.filter(linkedItem => (JSON.stringify(filtered).indexOf(linkedItem.subtype) !== -1)).length
      if (showMax < tileLength) {
        this.setState({ showMax: (showMax + GALLERYBATCHSIZE) })
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      showMax: GALLERYBATCHSIZE,
      filtered: [
        'artefacts',
        'articles',
        'stories',
        'people',
        'cities',
        'battles',
        'misc',
        'v',
        'audios',
        'ps'
      ],
      data: {},
      selectedImage: { src: '', year: '', title: '', wiki: '', source: '' },
      slideIndex: 0,
      currentYearLoaded: 3000,
      hiddenElement: true,
      tileData: [],
      categories: [
        ['artefacts', 'Artefacts'],
        ['articles', 'Articles'],
        ['stories', 'Stories'],
        ['people', 'People'],
        ['cities', 'Cities'],
        ['battles', 'Battles'],
        ['misc', 'Misc'],
        ['v', 'Video'],
        ['audios', 'Audio'],
        ['ps', 'Primary Sources (text)']
      ]
    }
  }

  slideButtons = (subtype, score, id, source, stateData) => {
    const { translate, theme } = this.props
    const upvotedItems = (localStorage.getItem('chs_upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('chs_downvotedItems') || '').split(',')
    const upvoteColor = (upvotedItems.indexOf(id) === -1) ? 'rgba(170, 170, 170, 0.73)' : 'green'
    const downvoteColor = (downvotedItems.indexOf(id) === -1) ? 'rgba(170, 170, 170, 0.73)' : 'red'
    const sourceSelected = decodeURIComponent(source !== 'undefined' ? source : id)

    return <div className='slideButtons' style={(stateData[2] !== 'audios') ? styles.buttonContainer : {
      ...styles.buttonContainer,
      bottom: 100
    }}>
      <IconButton
        onClick={() => this._handleUpvote(id)}
        color='red'
        style={styles.upArrow}
        tooltipPosition='center-left'
        tooltip={translate('pos.upvote')}
        iconStyle={styles.iconButton}
      ><IconThumbUp color={upvoteColor} />
      </IconButton>
      <IconButton
        onClick={() => this._handleDownvote(id)}
        style={styles.downArrow}
        iconStyle={styles.iconButton}
        tooltipPosition='center-left'
        tooltip={translate('pos.downvote')}
      ><IconThumbDown color={downvoteColor} /></IconButton>
      <div style={styles.scoreLabel}>{score} </div>
      <FloatingActionButton
        mini
        onClick={() => this._handleEdit(id)}
        backgroundColor='#aaaaaaba'
        style={styles.editButton}
      ><IconEdit color='white' />
      </FloatingActionButton>
      {subtype !== 'ps' && source && source !== 'undefined' && <FloatingActionButton
        mini
        onClick={() => window.open(decodeURIComponent(source), '_blank').focus()}
        backgroundColor='#aaaaaaba'
        style={styles.sourceButton}
      ><CommentIcon
        tooltipPosition='center-left'
        tooltip={translate('pos.downvote')}
        hoverColor={themes[theme].highlightColors[0]}
        color='white' />
      </FloatingActionButton>}
      <FloatingActionButton
        mini
        onClick={() => window.open(decodeURIComponent(subtype !== 'ps' ? id : source), '_blank').focus()}
        backgroundColor='#aaaaaaba'
        style={styles.fullButton}
        tooltipPosition='center-left'
        tooltip={translate('pos.downvote')}
      ><IconOutbound hoverColor={themes[theme].highlightColors[0]} color='white' />
      </FloatingActionButton>
    </div>
  }

  render () {
    const { isMinimized, linkedItems, selectedYear, translate, setRightDrawerVisibility, qName, theme } = this.props
    const { showMax, selectedImage, filtered, slideIndex, tileData, categories } = this.state

    const noTiles = (typeof linkedItems === 'undefined' || (tileData && tileData.length === 0))

    const hasSource = typeof selectedImage.source === 'undefined' || selectedImage.source === ''
    const hasWiki = typeof selectedImage.wiki === 'undefined' || selectedImage.wiki === ''
    const addButtonDynamicStyle = { ...styles.addButton, display: (selectedImage.src !== '') ? 'none' : 'inherit' }

    const articleContentContainer = (document.getElementsByClassName("articleContentContainer") || {})[0]
    const articleWidth = isMinimized ? 0 : (articleContentContainer || {}).offsetWidth || 0
    let dynamicWidth = isMinimized ? 0 : (((document.getElementsByClassName("body") || {})[0] || {}).offsetWidth || 0) - articleWidth - 148
    let isFlip = false

    if (dynamicWidth > 600) dynamicWidth = 600
    if (dynamicWidth < 319) isFlip = true
    return (
      <Paper
        onScroll={this._handleScroll}
        zDepth={3} style={{
          position: 'fixed',
          left: (isMinimized ? '-52px' : isFlip ? 0 : ((-dynamicWidth - 74) + 'px')),
          zIndex: 2147483647,
          top: '4px',
          padding: '0em',
          transition: 'all .3s ease-in-out',
          width: (isMinimized ? '30px' : isFlip ? (articleWidth + 'px') : (dynamicWidth + 'px')),
          maxHeight: (isMinimized ? '30px' : 'calc(100% - 200px)'),
          pointerEvents: (isMinimized ? 'none' : 'inherit'),
          opacity: (isMinimized ? '0' : 'inherit'),
          overflow: 'auto',
        }}>
        <AppBar
          style={
            {
              marginBottom: 0,
              transition: 'all .5s ease-in-out',
              background: (isMinimized ? 'white' : themes[theme].backColors[0]),
              boxShadow: 'rgba(0, 0, 0, 0.4) -1px 2px 3px 1px'
            }
          }
          title={<span style={{ color: themes[theme].foreColors[0] }}>{translate('pos.mediaTitle', { dontTranslate: qName })}</span>}
          iconElementLeft={<div />}
          iconElementRight={isMinimized
            ? <IconButton iconStyle={{ fill: 'rgba(55, 57, 49, 0.19)' }} style={{ left: '-9px' }}
              onClick={() => this._maximize()}><CompositionChartIcon /></IconButton>
            : <IconButton
              tooltipPosition='bottom-left'
              tooltip={translate('pos.minimize')} onClick={() => this._minimize()}>
              { isFlip
                ? <ChevronLeft color={themes[theme].foreColors[0]} hoverColor={themes[theme].highlightColors[0]} />
                : <ChevronRight color={themes[theme].foreColors[0]} hoverColor={themes[theme].highlightColors[0]} /> }
            </IconButton>}
        />
        {!isMinimized && <div style={styles.container}>
          <div style={styles.root}>
            <div style={styles.rootMenu}>
              <IconMenu
                clickCloseDelay={0}
                iconButtonElement={<IconButton tooltip={translate('pos.filterMedia')}><ContentFilter /></IconButton>}
                onChange={this.handleChangeFilter}
                value={filtered}
                multiple
              >
                {categories.map((category, i) => <MenuItem key={'categoriesMenuItem' + i} value={category[0]}
                  primaryText={category[1]}
                  disabled={!tileData || !tileData.some(linkedItem => linkedItem.subtype === category[0])} />)}
              </IconMenu>
              <IconMenu
                iconButtonElement={<IconButton tooltip={translate('pos.addMedia')}><ContentLink /></IconButton>}
                onClick={this._handleAdd}
                style={addButtonDynamicStyle} />
            </div>
            <GridList
              className='linkedGalleryGridList'
              cellHeight={180}
              padding={1}
              cols={1}
              style={styles.gridList}
            >
              {tileData.length > 0 ? tileData.filter(linkedItem => (JSON.stringify(filtered).indexOf(linkedItem.subtype) !== -1)).slice(0, showMax).map((tile, j) => (
                (tile.subtype !== 'v' && tile.subtype !== 'audios' && tile.subtype !== 'ps' && tile.subtype !== 'articles')
                  ? <GridTile
                    key={tile.src}
                    style={{ border: '1px solid black', cursor: 'pointer', pointerEvents: 'none' }}
                    titleStyle={styles.title}
                    subtitleStyle={styles.subtitle}
                    title={tile.subtitle}
                    subtitle={tile.title}
                    actionIcon={this.slideButtons(tile.subtype, tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), categories[0])}
                    actionPosition='right'
                    titlePosition='bottom'
                    titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                    cols={1}
                    rows={2}
                    titleHeight={128}
                  >
                    <img src={tile.src}
                      onError={() => this._removeTile(tile.src)}
                      onClick={() => {
                        this.setState({
                          selectedImage: {
                            src: tile.src,
                            year: tile.subtitle,
                            title: tile.title,
                            wiki: tile.wiki,
                            source: tile.source
                          }
                        })
                      }}
                    />
                  </GridTile>
                  : (tile.subtype === 'articles' || tile.subtype === 'ps')
                    ? <GridTile
                      key={tile.src}
                      style={{ border: '1px solid black', cursor: 'pointer', pointerEvents: 'none' }}
                      titleStyle={styles.title}
                      subtitleStyle={styles.subtitle}
                      title={tile.subtitle}
                      subtitle={tile.title}
                      actionIcon={this.slideButtons(tile.subtype, tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), categories)}
                      actionPosition='right'
                      titlePosition='bottom'
                      titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                      cols={1}
                      rows={2}
                      titleHeight={128}
                    ><img
                      src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Sachsenspiegel.jpg/614px-Sachsenspiegel.jpg'
                      onError={() => this._removeTile(tile.src)}
                      onClick={() => {
                          this.setState({
                            selectedImage: {
                              src: tile.src,
                              year: tile.subtitle,
                              title: tile.title,
                              wiki: tile.wiki,
                              source: tile.source
                            }
                          })
                        }}
                      />
                    </GridTile>
                    : <GridTile
                      key={tile.src}
                      style={{ border: '1px solid black', cursor: 'pointer', pointerEvents: 'none' }}
                      titleStyle={styles.title}
                      subtitleStyle={styles.subtitle}
                      title={tile.subtitle}
                      subtitle={tile.title}
                      actionIcon={this.slideButtons(tile.subtype, tile.score, encodeURIComponent(tile.src), encodeURIComponent(tile.source), categories)}
                      actionPosition='right'
                      titlePosition='bottom'
                      titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                      rows={2}
                      titleHeight={128}
                    >
                      {getYoutubeId(tile.src)
                        ? <YouTube
                          className='videoContent'
                          videoId={getYoutubeId(tile.src)}
                          opts={properties.YOUTUBEOPTS}
                          onError={() => this._removeTile(tile.src)}
                        />
                        : <Player className='videoContent' fluid={false} ref='player'>
                          <source src={tile.src} />
                        </Player>
                      }
                    </GridTile>
              )) : <span> {translate('pos.noLinkedContents')} </span>}

            </GridList>
          </div>
          <Dialog
            autoDetectWindowHeight={false}
            modal={false}
            contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogImageBackgroundHack'}
            contentStyle={{
              ...styles.discoverDialogStyle,
              overflow: 'auto',
              left: '64px',
              maxWidth: 'calc(100% - 64px)'
            }}
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
                {selectedImage.source && <IconButton
                  style={styles.buttonOpenArticle}
                  tooltipPosition='bottom-center'
                  tooltip={hasWiki ? translate('pos.discover_component.hasNoSource') : translate('pos.discover_component.openSource')}>
                  <RaisedButton
                    disabled={hasSource}
                    label={translate('pos.openSource')}
                    primary
                    onClick={() => this._handleOpenSource(selectedImage.source)}>
                    <IconOutbound color='white'
                      style={{ float: 'right', padding: '4px', paddingLeft: 0, marginLeft: -10 }} />
                  </RaisedButton>
                </IconButton>}
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
        </div>}
      </Paper>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    setFullModActive,
    selectLinkedItem,
    resetModActive,
    showNotification,
  }),
  pure,
  translate,
)

export default enhance(LinkedGallery)
