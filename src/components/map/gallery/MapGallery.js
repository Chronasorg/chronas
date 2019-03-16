import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube'
import { Player } from 'video-react'
import Dialog from 'material-ui/Dialog'
import { GridList } from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconEdit from 'material-ui/svg-icons/content/create'
import IconArrowUp from 'material-ui/svg-icons/navigation/expand-less'
import IconArrowDown from 'material-ui/svg-icons/navigation/expand-more'
import IconGallery from 'material-ui/svg-icons/image/burst-mode'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import ContentAdd from 'material-ui/svg-icons/content/add'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import ImageGallery from 'react-image-gallery'
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
import { tooltip } from '../../../styles/chronasStyleComponents'

const imgButton = { width: 20, height: 20 }
const styles = {
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
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,.7)) drop-shadow(0 1px 2px rgba(0,0,0,.3)) drop-shadow(0 1px 2px rgba(0,0,0,.3)) drop-shadow(0 1px 2px rgba(0,0,0,.3))',
    // marginTop: '1em',
    // marginRight: '1em'
    zIndex: 15000000,
    top: '3em',
    position: 'absolute',
    right: '3em'
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
    left: '8px',
    paddingRight: '2em',
    pointerEvents: 'none'

  },
  title: {
    pointerEvents: 'none',
    // padding: '36px 28px 0 28px',
    lineHeight: '32px',
    fontWeight: 300,
    color: '#fff',
    fontSize: '14px',
    bottom: '4px',
    position: 'absolute',
    left: '8px',
    width: 'calc(100% - 20px)'
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
    zIndex: 1500000000,
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
    bottom: '-22%'
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

class MapGallery extends PureComponent {
  constructor (props) {
    super(props)
    this._openPartOf = this._openPartOf.bind(this)
    this.state = {
      selectedImage: { src: '', year: '', title: '', wiki: [], source: '', fullData: {} },
      currentYearLoaded: 3000,
      isFetchingImages: true,
      isOpen: false,
      tileData: [],
      filteredData: []
    }
  }

  handleChange = (value) => {
    this.setState({ slideIndex: value })
  }

  handleImageClose = () => {
    this.setState({ selectedImage: { src: '', year: '', title: '', wiki: [], source: '', fullData: {} } })
  }

  componentWillMount = () => {
    const { currentYearLoaded, isOpen } = this.state
    if (this.props.selectedYear !== currentYearLoaded && isOpen) {
      this._updateImages(this.props.selectedYear)
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const { selectedYear, refMap, viewport } = this.props
    const { filteredData, isOpen, selectedImage, tileData } = this.state

    /** Acting on store changes **/
    if (nextProps.selectedYear !== selectedYear && isOpen) {
      this._updateImages(nextProps.selectedYear)
    }

    if (isOpen && (selectedImage || {}).src !== '' && ((nextProps.location || {}).pathname !== (location || {}).pathname)) {
      this.handleImageClose()
    }

    if (isOpen && tileData.length > 0 && (viewport || {}).latitude !== ((nextProps || {}).viewport || {}).latitude) {
      if (this.geoUpdateTimer) clearTimeout(this.geoUpdateTimer)
      this.geoUpdateTimer = setTimeout(() => {
        this._geoUpdateImages(refMap)
      }, 100)
    }
  }

  componentWillUnmount () {
    if (this.geoUpdateTimer) clearTimeout(this.geoUpdateTimer)
  }

  _geoUpdateImages = (refMap) => {
    const { filteredData, tileData } = this.state
    let bounds
    try {
      bounds = ((refMap || {}).getMap() || {}).getBounds()
    } catch (e) {
      console.error(e)
      bounds = false
    }
    if (!bounds) return

    const NE = bounds._ne
    const SW = bounds._sw

    const newFilteredData = tileData.filter(el => {
      const imgCoo = el.coo || []
      return (NE.lng > imgCoo[0] && SW.lng < imgCoo[0] && NE.lat > imgCoo[1] && SW.lat < imgCoo[1])
    })

    const srcArr = newFilteredData.map(el => el.src)
    if (filteredData.length !== newFilteredData.length || !filteredData.every(e => srcArr.includes(e.src))) {
      this.setState({
        filteredData: newFilteredData
      })
    }
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
    this.handleImageClose()
    history.push('/article')
  }
  _updateImages = (selectedYear) => {
    const { refMap } = this.props

    this.setState({ isFetchingImages: true })
    // Load slides data
    axios.get(properties.chronasApiHost + '/metadata?year=' + selectedYear + '&end=300&subtype=artefacts,people,cities,battles,misc,ps,v,e&geo=true')
      .then((allData) => {
        const allImages = allData.data

        // IMAGES
        const tileData = []
        const filteredData = []

        const bounds = ((refMap || {}).getMap() || {}).getBounds()
        const NE = bounds._ne
        const SW = bounds._sw

        allImages.forEach((imageItem) => {
          const newImage = {
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
          }

          tileData.push(newImage)
          const imgCoo = newImage.coo
          if (NE.lng > imgCoo[0] && SW.lng < imgCoo[0] && NE.lat > imgCoo[1] && SW.lat < imgCoo[1]) filteredData.push(newImage)
        })
        this.setState({
          isFetchingImages: false,
          currentYearLoaded: selectedYear,
          tileData, // .sort((a, b) => (+b.score || 0) - (+a.score || 0))
          filteredData
        })
      })
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

    this.handleImageClose()
    this.props.history.push('/mod/linked')
  }
  _handleOpenSource = (source) => {
    window.open(decodeURIComponent(source), '_blank').focus()
  }
  _removeTile = (tileSrc) => {
    const originalTileData = this.state.tileData
    const originalFilteredData = this.state.filteredData

    this.setState({
      tileData: originalTileData.filter(el => el.src !== tileSrc),
      filteredData: originalFilteredData.filter(el => el.src !== tileSrc)
    })

    this.forceUpdate()
  }

  render () {
    const { selectedYear, translate, rightDrawerOpen, theme, setGalleryMarker, setRightDrawerVisibility } = this.props
    const { selectedImage, isOpen, filteredData, isFetchingImages } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)

    const hasNoSource = typeof selectedImage.source === 'undefined' || selectedImage.source === ''
    const hasNoImage = typeof selectedImage.src === 'undefined' || selectedImage.src === ''
    const hasNoWiki = typeof selectedImage.wiki === 'undefined' || selectedImage.wiki === '' || (selectedImage.wiki || []).length === 0

    return (
      <div style={styles.root}>
      -
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
  location: state.location,
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
})(translate(MapGallery))
