import React, {Component} from 'react'

import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import _ from 'lodash'
import Avatar from 'material-ui/Avatar'
import { Card, CardText } from 'material-ui/Card'
import DropDownMenu from 'material-ui/DropDownMenu'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import Download from 'material-ui/svg-icons/file/file-download'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { translate, defaultTheme } from 'admin-on-rest'
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import MarkerIcon from 'material-ui/svg-icons/maps/place';
import LockOpenIcon from 'material-ui/svg-icons/action/lock-open';
import LockClosedIcon from 'material-ui/svg-icons/action/lock';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';
import ContentSend from 'material-ui/svg-icons/content/send';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actionReducers'
import {
  changeBasemap as changeBasemapAction,
  setAreaColorLabel as setAreaColorLabelAction,
  setPopOpacity as setPopOpacityAction,
  setClusterMarkers as setClusterMarkersAction,
  setProvinceBorders as setProvinceBordersAction,
  changeLabel as changeLabelAction,
  changeColor as changeColorAction,
  toggleMarker as toggleMarkerAction,
  toggleEpic as toggleEpicAction } from './actionReducers'
import { iconMapping, markerIdNameArray, properties, themes } from '../../../properties'

const styles = {
  listIcon: {
    margin: 5
  },
  listItem: {
    paddingLeft: 0
  },
  firstColumn: { paddingLeft: 8, width: 86 },
  toggleColumn: { width: 42, minWidth: 42 },
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
    padding: '18px 14px',
    background: 'white',
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset'
  },
};

const allEpics = ['War', 'Battle', 'Campaign', 'Exploration', 'Siege', 'Voyage', 'Other Epic']

class LayerContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      basemapId: 0,
      locked: true,
      selectedBasemap: "watercolor",
    }
  }

  handleChange = (event, index, value) => {
    this.props.changeBasemap(value)
    this.setState({ selectedBasemap: value })
  }

  // TODO: FEATURE: ADD + SELECT, SEARCH EPIC

  render () {
    const { basemapId, locked } = this.state
    const {activeArea, setPopOpacity, setProvinceBorders, selectedText, activeMarkers, activeEpics, selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, mapStyles, changeBasemap, setAreaColorLabel, setClusterMarkers, changeLabel, changeColor, toggleMarker, toggleEpic, theme} = this.props

    return (
      <div style={{ ...styles.main, background: themes[theme].backColors[1], color: themes[theme].foreColors[1] }}>
          <List>
            <Subheader>General</Subheader>
            <DropDownMenu className="dropdownAvatarMenu" selectedMenuItemStyle={{ paddingLeft: 0 }} value={this.state.selectedBasemap} onChange={this.handleChange} openImmediately={false}>
              <MenuItem value="watercolor" primaryText="Watercolor" leftIcon={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}
                        label={<ListItem style={ styles.listItem } leftAvatar={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}>Basemap</ListItem>}
              />
              <MenuItem value="topographic" primaryText="Topographic" leftIcon={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}
                        label={<ListItem style={ styles.listItem } leftAvatar={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}>Basemap</ListItem>}
              />
              <MenuItem value="none" primaryText="None" leftIcon={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}
                        label={<ListItem style={ styles.listItem } leftAvatar={<Avatar src="https://v0.material-ui.com/images/uxceo-128.jpg" />}>Basemap</ListItem>}
              />
            </DropDownMenu>
          </List>
        <Subheader>Area</Subheader>
        <Table
          selectable={false}
          style={{ width: 180 }}
          bodyStyle={{overflow: 'initial'}}
          wrapperStyle={{overflow: 'initial'}}
          className="areaTable"
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false} >
            <TableRow style={{ height: 0 }}>
              <TableHeaderColumn style={{ ...styles.firstColumn, height: 0 }} ></TableHeaderColumn>
              <TableHeaderColumn style={{
                top: -8,
                left: 0, height: 0
              }}>Area<Checkbox
                onCheck={() => { this.setState({ locked: !locked }) }}
                style={{
                  position: 'absolute',
                  left: 55,
                  top: 6 }}
                checked={locked}
                checkedIcon={<LockClosedIcon />}
                uncheckedIcon={<LockOpenIcon />}
                label=""
              /></TableHeaderColumn>
              <TableHeaderColumn style={{
                left: 7,
                top: -8, height: 0
              }}>Label</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Ruler</TableRowColumn>
              <TableRowColumn>
                <RaisedButton primary={activeArea.color === 'ruler'}
                              onClick={() => locked ? setAreaColorLabel('ruler', 'ruler') : changeColor('ruler')}
                              style={{ ...styles.toggleColumn, minWidth: (locked ? 88 : 42), width: (locked ? 88 : 42)}} />
              </TableRowColumn>
              <TableRowColumn>
                { !locked && <RaisedButton primary={activeArea.label === 'ruler'}
                                           onClick={() => changeLabel('ruler')}
                                           style={ styles.toggleColumn } /> }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Culture</TableRowColumn>
              <TableRowColumn>
                <RaisedButton primary={activeArea.color === 'culture'}
                              onClick={() => locked ? setAreaColorLabel('culture', 'culture') : changeColor('culture')}
                              style={{ ...styles.toggleColumn, minWidth: (locked ? 88 : 42), width: (locked ? 88 : 42)}} />
              </TableRowColumn>
              <TableRowColumn>
                { !locked && <RaisedButton primary={activeArea.label === 'culture'}
                                           onClick={() => changeLabel('culture')} style={ styles.toggleColumn } /> }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Religion</TableRowColumn>
              <TableRowColumn>
                <RaisedButton primary={activeArea.color === 'religion'}
                              onClick={() => locked ? setAreaColorLabel('religion', 'religion') : changeColor('religion')}
                              style={{ ...styles.toggleColumn, minWidth: (locked ? 88 : 42), width: (locked ? 88 : 42)}} />
              </TableRowColumn>
              <TableRowColumn>
                { !locked && <RaisedButton primary={activeArea.label === 'religion'}
                                           onClick={() => changeLabel('religion')} style={ styles.toggleColumn } /> }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Religion Gen.</TableRowColumn>
              <TableRowColumn>
                <RaisedButton primary={activeArea.color === 'religionGeneral'}
                              onClick={() => locked ? setAreaColorLabel('religionGeneral', 'religionGeneral') : changeColor('religionGeneral')}
                              style={{ ...styles.toggleColumn, minWidth: (locked ? 88 : 42), width: (locked ? 88 : 42)}} />
              </TableRowColumn>
              <TableRowColumn>
                { !locked && <RaisedButton primary={activeArea.label === 'religionGeneral'}
                                           onClick={() => changeLabel('religionGeneral')}  style={ styles.toggleColumn } /> }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Population</TableRowColumn>
              <TableRowColumn>
                <RaisedButton primary={activeArea.color === 'population'}
                              onClick={() => changeColor('population')}
                              style={{ ...styles.toggleColumn, minWidth: (locked ? 88 : 42), width: (locked ? 88 : 42)}} />
              </TableRowColumn>
              <TableRowColumn>
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
          <Divider />
          <List>
            <Subheader>Markers & Epics</Subheader>
            <ListItem
              primaryText="Markers"
              leftIcon={<MarkerIcon />}
              initiallyOpen={true}
              primaryTogglesNestedList={true}
              nestedItems={markerIdNameArray.map(id => {
                const cofficient = 40 / 169
                const backgroundPosition = 'url(/images/abstract-atlas.png) -' + (Math.round((iconMapping['abst'][id[0]] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping['abst'][id[0]] || {}).y * cofficient)) + 'px'
                const backgroundSize = '121px 200px'
                //((iconMapping['abst'][id[0]] || {}).width) + 'px ' + ((iconMapping['abst'][id[0]] || {}).height) + 'px'
                console.debug(backgroundPosition)


                return <ListItem value={id[0]}
                            key={id[0]}
                            onClick={() => { toggleMarker(id[0]) }}
                            innerDivStyle={{ padding: 0 }}
                            primaryText={<div className="listAvatar"><img style={{
                              width: 30,
                              height: 40,
                              background: backgroundPosition,
                              backgroundSize: backgroundSize,
                              opacity: activeMarkers.includes(id[0]) ? 1 : 0.2
                            }} src="/images/transparent.png" /> {id[2]}</div>}
                  />})}
            />
          </List><Divider />
        <List>
          <ListItem
            primaryText="Epics"
            leftIcon={<MarkerIcon />}
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={allEpics.map(id => {
              // const cofficient = 40 / 169
              // const backgroundPosition = 'url(/images/abstract-atlas.png) -' + (Math.round((iconMapping['abst'][id[0]] || {}).x * cofficient)) + 'px -' + (Math.round((iconMapping['abst'][id[0]] || {}).y * cofficient)) + 'px'
              // const backgroundSize = '121px 200px'
              // //((iconMapping['abst'][id[0]] || {}).width) + 'px ' + ((iconMapping['abst'][id[0]] || {}).height) + 'px'
              // console.debug(backgroundPosition)

              return <ListItem value={id}
                               key={id}
                               onClick={() => { toggleEpic(id.toLowerCase()) }}
                               innerDivStyle={{ padding: 0 }}
                               primaryText={<div className="listAvatar" style={{
                                 opacity: activeEpics.indexOf(id.toLowerCase()) > -1 ? 1 : 0.2
                               }} ><img style={{
                                 width: 30,
                                 height: 40,
                                 opacity: activeEpics.indexOf(id.toLowerCase()) > -1 ? 1 : 0.2
                               }} src="/images/transparent.png" /> {id}</div>}
              />})}
          />
        </List>

        <List>
          <Subheader>Advanced</Subheader>
          <ListItem
            leftCheckbox={<Checkbox
              onCheck={() => setClusterMarkers(!mapStyles.clusterMarkers)}
              checked={mapStyles.clusterMarkers} />}
            primaryText="Cluster Marker"
          />
          <ListItem
            leftCheckbox={<Checkbox onCheck={() => setProvinceBorders(!mapStyles.showProvinceBorders)} checked={mapStyles.showProvinceBorders} />}
            primaryText="Show Provinces"
          />
          <ListItem
            leftCheckbox={<Checkbox onCheck={() => setPopOpacity(!mapStyles.popOpacity)} checked={mapStyles.popOpacity} />}
            primaryText="Opacity by Population"
          />
        </List>
        <Divider />
        {/*{allEpics.map(id =>*/}
          {/*<RaisedButton*/}
            {/*style={styles.button}*/}
            {/*label={id}*/}
            {/*key={id}*/}
            {/*primary={activeEpics.indexOf(id.toLowerCase()) > -1}*/}
            {/*onClick={() => {*/}
              {/*toggleEpic(id.toLowerCase())*/}
            {/*}}/>)}*/}
        {/*{activeEpics}*/}
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
    theme: state.theme,
    locale: state.locale,
    mapStyles: state.mapStyles,
  }), {
    changeBasemap: changeBasemapAction,
    setAreaColorLabel: setAreaColorLabelAction,
    setPopOpacity: setPopOpacityAction,
    setProvinceBorders: setProvinceBordersAction,
    setClusterMarkers: setClusterMarkersAction,
    changeLabel: changeLabelAction,
    changeColor: changeColorAction,
    toggleMarker: toggleMarkerAction,
    toggleEpic: toggleEpicAction,
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
  pure,
  translate,
)

export default enhance(LayerContent);
