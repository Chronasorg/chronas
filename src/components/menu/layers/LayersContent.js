import React, { Component } from 'react'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import { defaultTheme, translate } from 'admin-on-rest'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Checkbox from 'material-ui/Checkbox'
import RadioButton from 'material-ui/RadioButton'
import Toggle from 'material-ui/Toggle'
import Slider from 'material-ui/Slider'
import AreaIcon from 'material-ui/svg-icons/maps/map'
import MarkerIcon from 'material-ui/svg-icons/maps/place'
import EpicIcon from 'material-ui/svg-icons/image/burst-mode'
import LockOpenIcon from 'material-ui/svg-icons/action/lock-open'
import LockClosedIcon from 'material-ui/svg-icons/action/lock'
import LinkIcon from 'material-ui/svg-icons/content/link'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, } from 'material-ui/Table'
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actionReducers'
import {
  changeBasemap as changeBasemapAction,
  changeColor as changeColorAction,
  changeLabel as changeLabelAction,
  setAreaColorLabel as setAreaColorLabelAction,
  setClusterMarkers as setClusterMarkersAction,
  setMarkerLimit,
  setPopOpacity as setPopOpacityAction,
  setProvinceBorders as setProvinceBordersAction,
  toggleEpic as toggleEpicAction,
  toggleMarker as toggleMarkerAction
} from './actionReducers'
import { epicIdNameArray, iconMapping, markerIdNameArray, themes } from '../../../properties'

const colorArray = ['ruler', 'culture', 'religion', 'religionGeneral', 'population']
const styles = {
  link: {
    opacity: 0.3,
    left: 14
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

class LayerContent extends Component {
  handleChange = (event, index, value) => {
    this.props.changeBasemap(value)
    this.setState({ selectedBasemap: value })
  }

  constructor (props) {
    super(props)
    this.state = {
      basemapId: 0,
      markerLimit: localStorage.getItem('chs_markerLimit') !== 'undefined' ? +localStorage.getItem('chs_markerLimit') : 3000,
      locked: true,
      selectedBasemap: 'topographic',
    }
  }

  // TODO: FEATURE: ADD + SELECT, SEARCH EPIC

  render () {
    const { basemapId, locked } = this.state
    const { activeArea, setPopOpacity, setProvinceBorders, selectedText, activeMarkers, activeEpics, selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, markerTheme, mapStyles, changeBasemap, setAreaColorLabel, setClusterMarkers, changeLabel, changeColor, setMarkerLimit, toggleMarker, toggleEpic, theme } = this.props

    return (
      <div style={{ ...styles.main, background: themes[theme].backColors[1], color: themes[theme].foreColors[1] }}>
        <List style={{ ...styles.listStyle, background: themes[theme].backColors[0] }}>
          <Subheader>General</Subheader>
          <ListItem
            primaryText='Area'
            leftIcon={<AreaIcon />}
            initiallyOpen={false}
            primaryTogglesNestedList
            nestedItems={[<ListItem
              disabled
              innerDivStyle={{ padding: 0, marginLeft: 0 }}
              primaryText={<div style={{ paddingBottom: 12, paddingTop: 0 }}>
                <Table
                  selectable={this.state.locked}
                  onRowSelection={(val) => {
                    if (!this.state.locked) return
                    const selectedDim = colorArray[val[0]]
                    if (selectedDim !== 'population') setAreaColorLabel(selectedDim, selectedDim)
                    else changeColor(selectedDim)
                  }}
                  style={{ width: '100%', background: 'inherit' }}
                  bodyStyle={{ overflow: 'initial' }}
                  wrapperStyle={{ overflow: 'initial' }}
                  className='areaTable'
                >
                  <TableHeader
                    style={{ border: 0 }}
                    displaySelectAll={false}
                    adjustForCheckbox={false}>
                    <TableRow style={{ border: 0, height: 0 }}>
                      <TableHeaderColumn style={{ ...styles.firstColumn, width: 76, height: 0 }} />
                      <TableHeaderColumn style={{
                        // top: -8,
                        // left: 0, height: 0
                      }}>Area
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        style={{
                          left: 9,
                          width: 32,
                          paddingLeft: 2
                        }}> <Checkbox
                          onCheck={() => {
                            this.setState({ locked: !locked })
                          }}
                          style={{
                            left: -3
                          /*
   position: 'absolute',
   left: 57,
           top: -2 */
                          }}
                          checked={locked}
                          checkedIcon={<LockClosedIcon />}
                          uncheckedIcon={<LockOpenIcon />}
                          label=''
                        /></TableHeaderColumn>
                      <TableHeaderColumn style={{
                        paddingLeft: 12
                        // left: 7,
                        // top: -8, height: 0
                      }}>Label</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    style={{ cursor: 'pointer' }}
                    showRowHover
                    displayRowCheckbox={false}>
                    <TableRow style={styles.customHeightColumn}>
                      <TableRowColumn style={styles.firstColumn}>Ruler</TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn}>
                        <RadioButton
                          label=''
                          checked={activeArea.color === 'ruler'}
                          onCheck={() => {
                            if (!locked) changeColor('ruler')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 12 }}>
                        {locked && <LinkIcon style={styles.link} />}
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 0 }}>
                        <RadioButton
                          label=''
                          checked={activeArea.label === 'ruler'}
                          onCheck={() => {
                            if (!locked) changeLabel('ruler')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                    </TableRow>
                    <TableRow style={styles.customHeightColumn}>
                      <TableRowColumn style={styles.firstColumn}>Culture</TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn}>
                        <RadioButton
                          label=''
                          checked={activeArea.color === 'culture'}
                          onCheck={() => {
                            if (!locked) changeColor('culture')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 12 }}>
                        {locked && <LinkIcon style={styles.link} />}
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 0 }}>
                        <RadioButton
                          label=''
                          checked={activeArea.label === 'culture'}
                          onCheck={() => {
                            if (!locked) changeLabel('culture')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                    </TableRow>
                    <TableRow style={styles.customHeightColumn}>
                      <TableRowColumn style={styles.firstColumn}>Religion</TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn}>
                        <RadioButton
                          label=''
                          checked={activeArea.color === 'religion'}
                          onCheck={() => {
                            if (!locked) changeColor('religion')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 12 }}>
                        {locked && <LinkIcon style={styles.link} />}
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 0 }}>
                        <RadioButton
                          label=''
                          checked={activeArea.label === 'religion'}
                          onCheck={() => {
                            if (!locked) changeLabel('religion')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                    </TableRow>
                    <TableRow style={styles.customHeightColumn}>
                      <TableRowColumn style={styles.firstColumn}>Religion Gen.</TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn}>
                        <RadioButton
                          label=''
                          checked={activeArea.color === 'religionGeneral'}
                          onCheck={() => {
                            if (!locked) changeColor('religionGeneral')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 12 }}>
                        {locked && <LinkIcon style={styles.link} />}
                      </TableRowColumn>
                      <TableRowColumn style={{ ...styles.customHeightColumn, paddingLeft: 0 }}>
                        <RadioButton
                          label=''
                          checked={activeArea.label === 'religionGeneral'}
                          onCheck={() => {
                            if (!locked) changeLabel('religionGeneral')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                    </TableRow>
                    <TableRow style={styles.customHeightColumn}>
                      <TableRowColumn style={styles.firstColumn}>Population</TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn}>
                        <RadioButton
                          label=''
                          checked={activeArea.color === 'population'}
                          onCheck={() => {
                            if (!locked) changeColor('population')
                          }}
                          style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                          iconStyle={styles.areaIcon}
                        />
                      </TableRowColumn>
                      <TableRowColumn style={styles.customHeightColumn} />
                    </TableRow>
                  </TableBody>
                </Table></div>}
            />]}
          />
          <ListItem
            primaryText='Markers'
            leftIcon={<MarkerIcon />}
            initiallyOpen={false}
            primaryTogglesNestedList
            nestedItems={markerIdNameArray.map(id => {
              const cofficient = 40 / (markerTheme.substr(0, 4) === 'abst' ? 169 : 135)
              const backgroundPosition = 'url(/images/' + markerTheme + '-atlas.png) -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][id[0]] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping[markerTheme.substr(0, 4)][id[0]] || {}).y * cofficient)) + 'px'
              const backgroundSize = markerTheme.substr(0, 4) === 'abst' ? '121px 278px' : '154px 224px'
              // ((iconMapping['abst'][id[0]] || {}).width) + 'px ' + ((iconMapping['abst'][id[0]] || {}).height) + 'px'
              return <ListItem value={id[0]}
                // style={{ display: (id[0] === 'c' ? 'none' : 'inherit') }}
                key={id[0]}
                onClick={() => {
                  toggleMarker(id[0])
                }}
                innerDivStyle={{ padding: 0 }}
                primaryText={<div className='listAvatar'><img style={{
                  borderRadius: '50%',
                  marginRight: '1em',
                  height: 30,
                  width: 30,
                  background: backgroundPosition,
                  backgroundSize: backgroundSize,
                  opacity: activeMarkers.list.includes(id[0]) ? 1 : 0.2
                }} src='/images/transparent.png' /> {id[2]}</div>}
              />
            }).concat(
              [<ListItem
                key={'markerLimit'}
                style={{ height: 60 }}
                innerDivStyle={{ padding: 0 }}
                primaryText={<div className='listAvatar'>
                  <div style={{ marginBottom: -20, paddingTop: 18 }}>Marker Limit <span style={{
                    fontWeight: 'bolder',
                    paddingLeft: 8,
                    position: 'absolute',
                    right: 22
                  }}>{this.state.markerLimit}</span></div>
                  <Slider
                    min={0}
                    max={10000}
                    step={1}
                    style={{ paddingRight: 16 }}
                    value={this.state.markerLimit}
                    onDragStop={() => {
                      const value = this.state.markerLimit
                      localStorage.setItem('chs_markerLimit', value)
                      setMarkerLimit(value)
                    }}
                    onChange={(event, value) => {
                      this.setState({ markerLimit: value })
                    }}
                  />
                </div>}
              />,
                <ListItem primaryText='Cluster Marker'
                  style={{
                  padding: '16px 72px 16px 0px',
                  whiteSpace: 'nowrap'
                }}
                  rightToggle={<Toggle defaultToggled={mapStyles.clusterMarkers}
                    onToggle={() => setClusterMarkers(!mapStyles.clusterMarkers)} />}
              />,
                <hr />])
            }
          />

          <ListItem
            primaryText='Epics'
            leftIcon={<EpicIcon />}
            initiallyOpen={false}
            primaryTogglesNestedList
            nestedItems={epicIdNameArray.map(id => {
              return <ListItem value={id[0]}
                key={id[0]}
                onClick={() => {
                  toggleEpic(id[0])
                }}
                innerDivStyle={{ padding: 0 }}
                primaryText={<div className='listAvatar' style={{
                  opacity: activeEpics.includes(id[0]) ? 1 : 0.2
                }}><img style={{
                    borderRadius: '0%',
                    marginRight: '1em',
                    background: id[2],
                    height: 30,
                    width: 30,
                    opacity: activeEpics.includes(id[0]) ? 1 : 0.4
                  }} src='/images/transparent.png' /> {id[1]}</div>}
              />
            })}
          />
        </List>
        <List style={{
          ...styles.listStyle,
          background: themes[theme].backColors[0],
          borderBottom: '1px solid rgb(217, 217, 217)'
        }}>
          <Subheader>Advanced</Subheader>
          <DropDownMenu className='dropdownAvatarMenu' selectedMenuItemStyle={{
            fontWeight: 'bolder',
            color: themes[theme].highlightColors[0],
            paddingLeft: 0
          }} value={this.state.selectedBasemap} onChange={this.handleChange} openImmediately={false}>
            <MenuItem value='topographic' primaryText='Topographic' leftIcon={<Avatar style={{ borderRadius: 0 }}
              src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/2/1/2' />}
              label={<ListItem style={styles.listItem} leftAvatar={<Avatar style={{ borderRadius: 0 }}
                src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/2/1/2' />}>Basemap</ListItem>}
            />
            <MenuItem value='watercolor' primaryText='Watercolor' leftIcon={<Avatar style={{ borderRadius: 0 }}
              src='https://stamen-tiles.a.ssl.fastly.net/watercolor/2/2/1.jpg' />}
              label={<ListItem style={styles.listItem} leftAvatar={<Avatar style={{ borderRadius: 0 }}
                src='https://stamen-tiles.a.ssl.fastly.net/watercolor/2/2/1.jpg' />}>Basemap</ListItem>}
            />
            <MenuItem value='none' primaryText='None'
              leftIcon={<Avatar style={{ borderRadius: 0 }} src='/images/transparent.png' />}
              label={<ListItem style={styles.listItem} leftAvatar={<Avatar style={{ borderRadius: 0 }}
                src='/images/transparent.png' />}>Basemap</ListItem>}
            />
          </DropDownMenu>
          <ListItem primaryText='Show Provinces'
            rightToggle={<Toggle onToggle={() => setProvinceBorders(!mapStyles.showProvinceBorders)} />}
            open={mapStyles.showProvinceBorders} />
          <ListItem primaryText='Opacity by Population'
            rightToggle={<Toggle onToggle={() => setPopOpacity(!mapStyles.popOpacity)} />}
            open={mapStyles.popOpacity} />
        </List>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
    activeArea: state.activeArea,
    activeMarkers: state.activeMarkers,
    activeEpics: state.activeEpics,
    selectedYear: state.selectedYear,
    markerTheme: state.markerTheme,
    mapStyles: state.mapStyles,
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
    toggleMarker: toggleMarkerAction,
    toggleEpic: toggleEpicAction,
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
  pure,
  translate,
)

export default enhance(LayerContent)
