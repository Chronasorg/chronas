import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Dialog from 'material-ui/Dialog'
import { GridList, GridTile } from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
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
  iconButton: { filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))' },
  upArrow: { ...imgButton, padding: 0, top: -13 },
  downArrow: { ...imgButton, padding: 0, bottom: -13, left: -20 },
  editButton: { ...imgButton, left: -18 },
  scoreLabel: {
    width: 40,
    height: 20,
    right: 38,
    top: 16,
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
    zIndex: 1000000
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
  }
}

class Discover extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      slideIndex: 0,
      currentYearLoaded: 3000,
      hiddenElement: true,
      slidesData: [],
      tilesData: [],
      tilesStoriesData: [],
      tilesPeopleData: [],
      tilesCitiesData: [],
      tilesBattlesData: [],
      tilesOtherData: []
    }
  }

  handleChange = (value) => {
    this.setState({ slideIndex: value })
  }

  handleClose = () => {
    this.props.history.push('/')
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

  componentWillReceiveProps (nextProps) {
    const { selectedYear } = this.props
    console.debug('### DISCOVER componentWillReceiveProps', this.props)

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear) {
      this._updateImages(nextProps.selectedYear)
    }
  }

  _updateImages(selectedYear) {
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
              originalTitle: imageItem.year,
              thumbnailTitle: imageItem.year,
            })
          }
          newTilesData.push({
            img: imageItem._id,
            title: imageItem.data.title,
            author: imageItem.data.source,
            subtitle: imageItem.year,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tilesData: newTilesData,
          slidesData: newSlideData })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=cities')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            title: imageItem.data.title,
            author: imageItem.data.source,
            subtitle: imageItem.year,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tilesCitiesData: newTilesData })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=battles')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            title: imageItem.data.title,
            author: imageItem.data.source,
            subtitle: imageItem.year,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tilesBattlesData: newTilesData })
      })

    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&delta=10&end=15&type=i&subtype=misc')
      .then(response => {
        const newTilesData = []
        const res = response.data
        res.forEach((imageItem) => {
          newTilesData.push({
            img: imageItem._id,
            title: imageItem.data.title,
            author: imageItem.data.source,
            subtitle: imageItem.year,
          })
        })
        this.setState({
          currentYearLoaded: selectedYear,
          tilesOtherData: newTilesData })
      })
  }

  _handleUpvote = () => {
    this.props.showNotification('pos.feedbackSuccess')
    setTimeout(() => // TODO: this comes into callback
      this.props.showNotification((typeof localStorage.removeItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints'), 1000)

  }

  _handleDownvote = () => {
    this.props.showNotification('pos.feedbackSuccess')
    setTimeout(() => // TODO: this comes into callback
      this.props.showNotification((typeof localStorage.removeItem('token') !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints'), 1000)

  }

  _handleEdit = () => {

  }

  render () {
    const {  selectedYear, translate, rightDrawerOpen, setRightDrawerVisibility } = this.props
    const { slidesData, slideIndex, tilesData, tilesStoriesData, tilesBattlesData, tilesCitiesData, tilesPeopleData, tilesOtherData } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)
    const slideButtons = <div className="slideButtons" style={ styles.buttonContainer }>
      <IconButton
        onClick={this._handleUpvote}
        style={ styles.upArrow }
        tooltipPosition="bottom-left"
        tooltip={translate('pos.upvote')}
        iconStyle={ styles.iconButton }
      ><IconThumbUp color='white' />
      </IconButton>
      <IconButton
        onClick={this._handleDownvote}
        style={ styles.downArrow }
        iconStyle={ styles.iconButton }
        tooltipPosition="bottom-left"
        tooltip={translate('pos.downvote')}
      ><IconThumbDown color='white' /></IconButton>
      <div style={ styles.scoreLabel }>31</div>
      <IconButton
        onClick={this._handleEdit}
        iconStyle={ styles.iconButton }
        style={ styles.editButton }
        tooltipPosition="bottom-left"
        tooltip={translate('pos.edit')}
      ><IconEdit color='white' />
      </IconButton>
    </div>

    return (
      <div>
        <Toolbar style={{ zIndex: 10000, color: 'white', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
          <ToolbarGroup>
            <ToolbarTitle style={styles.toolbarTitleStyle} text={translate('pos.discover_label') + selectedYear} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton style={{ zIndex: 10000 }} touch key={'close'} containerElement={<Link to='/' />}>
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
            showBullets={true}
            showThumbnails={false}
            items={this.state.slidesData} />

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
            <Tab label='HIGHLIGHTS' value={0} />
            <Tab label='STORIES' value={1} />
            <Tab label='PEOPLE' value={2} />
            <Tab label='BATTLES' value={3} />
            <Tab label='CITIES' value={4} />
            <Tab label='OTHER' value={5} />
            <Tab label='VIDEOS' value={6} />
            <Tab label='PODCASTS' value={7} />
            <Tab label='PRIMARY SOURCES' value={8} />
          </Tabs>
          <SwipeableViews
            index={slideIndex}
            onChangeIndex={this.handleChange}>
            {/* // TAB 0 */}
            <div style={styles.root}>
              <GridList
                cellHeight={180}
                padding={1}
                cols={3}
                style={styles.gridList}
              >
                {tilesData.map((tile, i) => (
                  <GridTile
                    key={tile.img}
                    style={{border: '1px solid black'}}
                    titleStyle={styles.title}
                    subtitleStyle={styles.subtitle}
                    title={tile.subtitle}
                    subtitle={tile.title}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='bottom'
                    titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                    cols={((i+3)%4 < 2) ? 1 : 2}
                    rows={2}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            {/* TAB 1 */}
            <div style={styles.slide}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesStoriesData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    subtitle={<span><b>{tile.subtitle}</b></span>}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='top'
                    titleBackground='linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            <div style={styles.slide}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesPeopleData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='top'
                    titleBackground='linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            <div style={styles.root}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesBattlesData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='top'
                    titleBackground='linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            {/* TAB 3 */}
            <div style={styles.slide}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesCitiesData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='top'
                    titleBackground='linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            {/* TAB 5 */}
            <div style={styles.slide}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesOtherData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    actionIcon={slideButtons}
                    actionPosition='right'
                    titlePosition='top'
                    titleBackground='linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
          </SwipeableViews>
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
