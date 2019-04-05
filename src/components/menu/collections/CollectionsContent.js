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
import { epicIdNameArray, iconMapping, markerIdNameArray, themes } from '../../../properties'
import utilsQuery from "../../map/utils/query";

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
    }
  }

  componentWillReceiveProps = (nextProps) => {
  }

  _goToMod = (selectedCollection = false) => {
    const { selectedItem, selectedYear, selectAreaItemWrapper, selectEpicItem, selectMarkerItem, history } = this.props
    let fModUrl

    if (selectedCollection) {
      // setCollectionItem
      fModUrl = '/mod/linked'
    } else {
      fModUrl = '/mod/linked/create'
    }
    history.push(fModUrl)
  }

  render () {
    const { translate, theme } = this.props

    return (
      <div style={{ ...styles.main, background: themes[theme].backColors[1], color: themes[theme].foreColors[1] }}>
        <List style={{ ...styles.listStyle, background: themes[theme].backColors[0] }}>
          <Subheader>{translate("collections.my")}</Subheader>
          <ListItem
            key={'addCollection'}
            leftAvatar={<div><AddIcon style={{ paddingRight: '8px'}}/><span style={{fontSize: '14px'}}>{translate('collections.new')}</span></div>}
            onClick={() => this._goToMod()}
          />
          <ListItem
            primaryText={<div style={styles.listItemText}>{"Bookmarks"}</div>}
            secondaryText="2 Articles"
            // innerDivStyle={styles.innerListItem}
            rightAvatar={<div ><EditIcon onClick={() => this._goToMod("Bookmarks")} style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} /><OpenIcon style={{ width: '18px', height: '18px' }} className={'openBookmarkIcon'} /></div>}
          />
        </List>
        <List style={{
          ...styles.listStyle,
          background: themes[theme].backColors[0],
          borderBottom: '1px solid rgb(217, 217, 217)'
        }}>
          <Subheader>{translate("collections.public")}</Subheader>
          <ListItem
            primaryText={<div style={styles.listItemText}>Adelle Charles</div>}
            leftAvatar={
              <Avatar
                color={themes[theme].highlightColors[0]} backgroundColor={transparent}
                style={{left: 8}}
              >
                A
              </Avatar>
            }
            secondaryText="2 Articles"
            innerDivStyle={styles.innerListItem}
            rightAvatar={<div className={'openBookmarkIcon'}><OpenIcon /></div>}
          />
          <ListItem
            innerDivStyle={styles.innerListItem}
            primaryText={<div style={styles.listItemText}>Adham Dannaway</div>}
            secondaryText="4 Articles"
            insetChildren={true}
            rightAvatar={<div className={'openBookmarkIcon'}><OpenIcon /></div>}
          />
          <ListItem
            innerDivStyle={styles.innerListItem}
            primaryText={<div style={styles.listItemText}>Allison Grayce</div>}
            insetChildren={true}
            rightAvatar={<div className={'openBookmarkIcon'}><OpenIcon /></div>}
            secondaryText="14 Articles"
          />
          <ListItem
            innerDivStyle={styles.innerListItem}
            primaryText={<div style={styles.listItemText}>Angel Ceballos</div>}
            insetChildren={true}
            rightAvatar={<div className={'openBookmarkIcon'}><OpenIcon /></div>}
          />
          <ListItem
            innerDivStyle={styles.innerListItem}
            primaryText={<div style={styles.listItemText}>Bob Charles</div>}
            leftAvatar={
              <Avatar
                color={themes[theme].highlightColors[0]} backgroundColor={transparent}
                style={{left: 8}}
              >
                B
              </Avatar>
            }
            rightAvatar={<div className={'openBookmarkIcon'}><OpenIcon /></div>}
          />
        </List>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
  }), {
    changeBasemap: changeBasemapAction,
    setAreaColorLabel: setAreaColorLabelAction,
    setPopOpacity: setPopOpacityAction,
    setProvinceBorders: setProvinceBordersAction,
    setClusterMarkers: setClusterMarkersAction,
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
