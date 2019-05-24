import React, { Component } from 'react'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import { defaultTheme, translate } from 'admin-on-rest'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import OpenIcon from 'material-ui/svg-icons/action/visibility'
import AddIcon from 'material-ui/svg-icons/content/add-circle-outline'
import { transparent } from 'material-ui/styles/colors'
import {
  changeBasemap as changeBasemapAction,
  changeColor as changeColorAction,
  changeLabel as changeLabelAction,
  setAreaColorLabel as setAreaColorLabelAction,
  setClusterMarkers as setClusterMarkersAction,
  setMarkerLimit,
  setAllMarker,
  setPopOpacity as setPopOpacityAction,
  setProvinceBorders as setProvinceBordersAction,
  toggleEpic as toggleEpicAction,
  toggleMarker as toggleMarkerAction,
  setMigration as setMigrationAction,
} from './actionReducers'
import { epicIdNameArray, iconMapping, markerIdNameArray, properties, themes } from '../../../properties'
import utilsQuery from '../../map/utils/query'
import axios from 'axios/index'
import {selectCollectionItem} from "../../map/actionReducers";

const styles = {
  innerListItem: { padding: '16px 46px 20px 58px' },
  link: {
    opacity: 0.3,
    left: 14
  },
  listItemText: {
    whiteSpace: 'nowrap',
    width: 'calc(100% - 14px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  customHeightColumn: {
    height: 32
    // width: 10,
  },
  listIcon: {
    margin: 5
  },
  areaIcon: {},
  listItem: {
    paddingLeft: 0
  },
  listStyle: {
    borderTop: '1px solid rgb(217, 217, 217)',
    borderLeft: '1px solid rgb(217, 217, 217)',
    borderRight: '1px solid rgb(217, 217, 217)',
    background: 'white',
  },
  firstColumn: { paddingLeft: 8, width: 86, height: 32 },
  toggleColumn: { width: 42, minWidth: 42, height: 32 },
  main: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: 'calc(100% - 64px)',
    position: 'initial',
    overflow: 'auto',
    overflowX: 'hidden',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '0px 0px',
    paddingLeft: '7px',
    background: 'white',
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset'
  },
}

class CollectionsContent extends Component {
  handleChange = (event, index, value) => {
    // this.props.changeBasemap(value)
    // this.setState({ selectedBasemap: value })
  }

  constructor (props) {
    super(props)
    this.state = {
      locked: true,
      publicCollections: [],
      privateCollections: [],
    }
  }

  componentDidMount = () => {
    this._reloadCollections()
  }

  _reloadCollections = () => {
    const username = localStorage.getItem('chs_username')
    axios.get(properties.chronasApiHost + '/collections?username=' + username, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}})
      .then((collections) => {
        const collectionsData = collections.data

        this.setState({
          publicCollections: collectionsData[1],
          privateCollections: collectionsData[0]
        })
      })
  }

  componentWillReceiveProps = (nextProps) => {
    const { collectionUpdatedIndex } = this.props
    if (nextProps.collectionUpdatedIndex !== collectionUpdatedIndex) {
      this._reloadCollections()
    }
  }

  _openCollection = (collectionObject, event = false) => {
    if (event && event.stopPropagation) event.stopPropagation()
    const { selectCollectionItem, history } = this.props
    // const potentialFirstWiki = (((collectionObject.map || [])[0] || {}).properties || {}).w
    // if (potentialFirstWiki) {
      selectCollectionItem(collectionObject._id, false)
    if ((history.location || {}).pathname !== '/article') history.push('/article')
    // }
  }

  _goToMod = (selectedCollection = false, event = false) => {
    if (event && event.stopPropagation) event.stopPropagation()
    const { selectCollectionItem, history } = this.props
    let fModUrl

    if (selectedCollection) {
      if (selectedCollection !== 'Bookmarks') selectCollectionItem(selectedCollection._id, false)
      // setCollectionItem
      fModUrl = '/mod/linked'
    } else {
      selectCollectionItem(false, false)
      fModUrl = '/mod/linked/create'
    }
    history.push(fModUrl)
  }

  render () {
    const { translate, theme } = this.props
    const { publicCollections, privateCollections } = this.state
    const username = localStorage.getItem('chs_username')

    return (
      <div style={{ ...styles.main, background: themes[theme].backColors[1], color: themes[theme].foreColors[1] }}>
        <List style={{ ...styles.listStyle, background: themes[theme].backColors[0] }}>
          <Subheader>{translate('collections.my')}</Subheader>
          <ListItem
            key={'addCollection'}
            leftAvatar={<div><AddIcon style={{ paddingRight: '8px' }} /><span style={{ fontSize: '14px' }}>{translate('collections.new')}</span></div>}
            onClick={(event) => this._goToMod(false, event)}
          />
          { privateCollections.map((el) => {
            return <ListItem
              onClick={(event) => this._openCollection(el, event)}
              primaryText={<div style={styles.listItemText}>{el.title}</div>}
              secondaryText={(el.slides || []).length + ' Articles'}
              rightAvatar={<div>
                <EditIcon onClick={(event) => this._goToMod(el, event)} style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} />
                <OpenIcon onClick={(event) => this._openCollection(el, event)} style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} /></div>}
            />
          })}
        </List>
        <List style={{
          ...styles.listStyle,
          background: themes[theme].backColors[0],
          borderBottom: '1px solid rgb(217, 217, 217)'
        }}>
          <Subheader>{translate('collections.public')}</Subheader>
          { publicCollections.map((el, i) => {
            const prevLetter = ((publicCollections[i-1] || {}).title || [])[0]
            const newLetter = ((el.title || [])[0] !== prevLetter && (el.title || [])[0]) ? (el.title || [])[0] : false
            return <ListItem
              onClick={(event) => this._openCollection(el, event)}
              primaryText={<div style={styles.listItemText}>{el.title}</div>}
              leftAvatar={newLetter ? <Avatar
                color={themes[theme].highlightColors[0]} backgroundColor={transparent}
                style={{ left: 8 }}
                >
                {newLetter}
              </Avatar> : null
              }
              insetChildren={!newLetter}
              secondaryText={(el.slides || []).length + ' Articles'}
              innerDivStyle={styles.innerListItem}
              rightAvatar={<div>
                { (el.owner === username) && <EditIcon onClick={(event) => this._goToMod(el, event)} style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} />}
                <OpenIcon onClick={(event) => this._openCollection(el, event)} style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} /></div>}

            />
          })}
        </List>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    collectionUpdatedIndex: state.collectionUpdatedIndex
  }), {
    changeBasemap: changeBasemapAction,
    setAreaColorLabel: setAreaColorLabelAction,
    setPopOpacity: setPopOpacityAction,
    setProvinceBorders: setProvinceBordersAction,
    setClusterMarkers: setClusterMarkersAction,
    selectCollectionItem,
    changeLabel: changeLabelAction,
    changeColor: changeColorAction,
    setMarkerLimit,
    setAllMarker,
    toggleMarker: toggleMarkerAction,
    toggleEpic: toggleEpicAction,
    setMigration: setMigrationAction,
  }),
  pure,
  translate,
)

export default enhance(CollectionsContent)
