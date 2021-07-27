import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
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
import { properties, themes } from '../../../properties'
import utils from '../../map/utils/general'
import { tooltip } from '../../../styles/chronasStyleComponents'

const GALLERYBATCHSIZE = 15
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
  editButton: { ...imgButton, right: 60, width: 40, height: 40, top: 1, position: 'absolute' },
  sourceButton: { ...imgButton, right: 110, width: 40, height: 40, top: 1, position: 'absolute', padding: 0 },
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
    this.locked = false
    this._openPartOf = this._openPartOf.bind(this)
    this.state = {
      showMax: GALLERYBATCHSIZE,
      selectedImage: { src: '', year: '', title: '', wiki: [], source: '', fullData: {} },
      currentYearLoaded: 3000,
      isFetchingImages: true,
      isOpen: localStorage.getItem('chs_mediaGallery') !== 'opened' && (((window || {}).location || {}).hash !== '#/article'),
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

  componentDidMount = () => {
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
  _updateImages = (a_selectedYear) => {
    const { refMap, selectedYear } = this.props
    const f_selectedYear = a_selectedYear || selectedYear

    if (typeof refMap === "undefined") return setTimeout(this._updateImages, 1000)
    this.setState({ isFetchingImages: true })
    // Load slides data
    axios.get(properties.chronasApiHost + '/metadata?year=' + f_selectedYear + '&end=300&subtype=artefacts,people,cities,battles,misc,ps,v,e&geo=true')
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
          currentYearLoaded: f_selectedYear,
          tileData, // .sort((a, b) => (+b.score || 0) - (+a.score || 0))
          showMax: GALLERYBATCHSIZE,
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

  _handleScroll = (e) => {
    if (!this.locked) {
      const target = e ? e.target : document.getElementById('mapGalleryList')

      // console.debug(e.target, this.state, this.locked, target.clientWidth - (target.scrollWidth - target.scrollLeft), ((target.scrollWidth - target.scrollLeft) - target.clientWidth)/target.clientWidth)
      const rightCorner = ((target.scrollWidth - target.scrollLeft) - target.clientWidth)/target.clientWidth
      if (rightCorner < 1) {
        this.locked = true
        const { showMax, filteredData } = this.state
        const tileLength = filteredData.length
        if (showMax < tileLength) {
          this.setState({ showMax: (showMax + GALLERYBATCHSIZE) })
        }
        setTimeout(() => this.locked = false, 100)
      }
    }
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
    const { selectedImage, showMax, isOpen, filteredData, isFetchingImages } = this.state
    if (rightDrawerOpen) setRightDrawerVisibility(false)

    const showAds = (((window.location || {}).host || '').substr(0, 7) === "adtest.")
    const hasNoSource = typeof selectedImage.source === 'undefined' || selectedImage.source === ''
    const hasNoImage = typeof selectedImage.src === 'undefined' || selectedImage.src === ''
    const hasNoWiki = typeof selectedImage.wiki === 'undefined' || selectedImage.wiki === '' || (selectedImage.wiki || []).length === 0

    return (
      <div style={styles.root}>
        { isOpen && (selectedImage.src !== '') && <FloatingActionButton
          backgroundColor={'transparent'}
          style={styles.closeButton}
          key={'close'}
          onClick={this.handleImageClose}
        >
          <CloseIcon color={styles.toolbarTitleStyle.color} />
        </FloatingActionButton> }
        <IconButton
          key={'expandGallery'}
          style={{
            zIndex: 1,
            width: 48,
            height: 48,
            top: isOpen ? 137 : 0,
            left: 64,
            position: 'fixed'
          }}
          onClick={() => {
            const { isOpen } = this.state
            if (!isOpen) {
              this._updateImages(selectedYear)
              this.setState({ isOpen: true })
            } else {
              this.setState({ isOpen: false, tileData: [],
                showMax: GALLERYBATCHSIZE })
              localStorage.setItem('chs_mediaGallery', 'opened')
            }
          }}
          iconStyle={{
            color: themes[theme].foreColors[0],
            background: themes[theme].backColors[0],
            borderRadius: '50%'
          }}
        >
          {isOpen ? <div>
            <IconArrowUp hoverColor={themes[theme].highlightColors[0]} />
            <span style={{
                left: 90,
                height: 24,
                zIndex: -1,
                position: 'fixed',
                color: themes[theme].foreColors[0],
                backgroundColor: themes[theme].backColors[0],
                fontSize: 12,
                whiteSpace: 'nowrap',
                paddingLeft: 12,
                paddingRight: 6,
                paddingTop: 1
              }}>{translate('pos.discover_component.seeMore1')}<a className='customLink' style={{ color: themes[theme].highlightColors[0] }} onClick={() => this.props.history.push('/discover')}>{translate('pos.discover')}</a>{translate('pos.discover_component.seeMore2')}</span>
          </div>
            : <div>
              <IconArrowDown hoverColor={themes[theme].highlightColors[0]} />
              <IconGallery color={themes[theme].highlightColors[0]} style={{
                left: 90,
                width: 50,
                zIndex: -1,
                position: 'fixed',
                backgroundColor: themes[theme].backColors[0]
              }} />
            </div>}
        </IconButton>
        <div className={'mapGalleryContainer'}>
          { isOpen && <GridList
            id={'mapGalleryList'}
            onScroll={this._handleScroll}
            cellHeight={124}
            padding={4}
            style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            transition: 'all 1s ease',
            width: 'calc(100% - 62px)',
            backgroundImage: themes[theme].gradientColors[0],
            boxShadow: 'rgba(0, 0, 0, 0.4) -6px 6px 6px -3px',
            left: 64,
            height: 137,
            top: isOpen ? 6 : -130,
            position: 'fixed'
          }}>
            <GridTile
              id={'galleryId-ad'}
              key={'galleryId-ad'}
              style={{ border: '0px solid black', cursor: 'pointer' }}
              titleStyle={styles.title}
              subtitleStyle={styles.subtitle}
              title={'galleryId-ad'}
              subtitle={'galleryId-ad'}
              actionPosition='right'
              titlePosition='bottom'
              titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
              // cols={((j + 3) % 4 < 2) ? 1 : 2}
              titleHeight={36}
            >
              {showAds ? <div>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4343308524767879"
                        crossorigin="anonymous"></script>
                <ins class="adsbygoogle"
                     style={{ "display":"block" }}
                     data-ad-format="fluid"
                     data-ad-layout-key="-6t+ed+2i-1n-4w"
                     data-ad-client="ca-pub-4343308524767879"
                     data-ad-slot="7254273831"></ins>
                <script>
                  (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
              </div> : null }
            </GridTile>
            {filteredData.length > 0 ? filteredData.slice(0, showMax).map((tile, j) => (
                    <GridTile
                      id={'galleryId'+j}
                        key={tile.src}
                        style={{ border: '0px solid black', cursor: 'pointer' }}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        title={tile.title}
                        subtitle={tile.subtitle}
                        actionPosition='right'
                        titlePosition='bottom'
                        titleBackground='linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.63) 70%, rgba(0, 0, 0, .7) 100%)'
                        // cols={((j + 3) % 4 < 2) ? 1 : 2}
                        titleHeight={36}
                      >
                        <img src={tile.thumbnail || tile.src}
                          onError={() => this._removeTile(tile.src)}
                          onMouseEnter={(s, event) => {
                            const gId = 'galleryId' + j
                            setGalleryMarker(tile.coo.concat([gId]))
                          }}
                           onMouseLeave={() => {
                             setGalleryMarker([])
                           }}
                          onClick={() => {
                               this.setState({
                                 selectedImage: {
                                   src: tile.thumbnail || tile.src || tile.original || tile.poster,
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
                                           wiki: res.filter(el => {
                                             const { aeId, ct } = el.properties

                                             if (ct === 'marker' || (ct === 'area' && !aeId)) return true
                                             else if (aeId) {
                                               const [ae, colorToSelect, rulerToHold] = aeId.split('|')
                                               const nextData = this.props.activeArea.data
                                               const provinceWithOldRuler = Object.keys(nextData).find(key => nextData[key][utils.activeAreaDataAccessor(colorToSelect)] === rulerToHold)
                                               return (typeof provinceWithOldRuler !== "undefined")
                                             }
                                             return false
                                           })
                                         }
                                       })
                                     }
                                   })
                               }
                             }}
                        />
                      </GridTile>
                  )) : (isFetchingImages ? <div className={'galleryLoader'} style={{ marginTop: -15, height: 130 }}><LoadingCircle theme={theme} title={translate('pos.loading')} /></div>
                    : <div style={{ padding: '4em' }}>{translate('pos.discover_component.noGeotaggedFound')}</div>)}
          </GridList> }
        </div>
        { isOpen && <Dialog
          autoDetectWindowHeight={false}
          modal={false}
          bodyClassName={'mapGalleryRootSelectedImage'}
          contentClassName={(this.state.hiddenElement) ? '' : 'classReveal dialogImageBackgroundHack'}
          contentStyle={{ ...styles.discoverDialogStyle, overflow: 'auto', left: '0px' }}
          overlayStyle={styles.overlayStyle}
          bodyStyle={{ backgroundColor: 'transparent', border: 'none' }}
          actionsContainerStyle={{ backgroundColor: red400 }}
          style={{ backgroundColor: 'transparent', overflow: 'hidden', zIndex: 1500 }}
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
        </Dialog> }
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
