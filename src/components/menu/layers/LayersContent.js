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
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import { translate, defaultTheme } from 'admin-on-rest'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import RadioButton from 'material-ui/RadioButton'
import Toggle from 'material-ui/Toggle'
import ActionGrade from 'material-ui/svg-icons/action/grade'
import MarkerIcon from 'material-ui/svg-icons/maps/place'
import LockOpenIcon from 'material-ui/svg-icons/action/lock-open'
import LockClosedIcon from 'material-ui/svg-icons/action/lock'
import ContentInbox from 'material-ui/svg-icons/content/inbox'
import ContentDrafts from 'material-ui/svg-icons/content/drafts'
import ContentSend from 'material-ui/svg-icons/content/send'
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

const colorArray = ['ruler','culture','religion','religionGeneral','population']
const styles = {
  listIcon: {
    margin: 5
  },
  areaIcon: {

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
          selectable={this.state.locked}
          onRowSelection={(val) => {
            if (!this.state.locked) return
            const selectedDim = colorArray[val[0]];
            if (selectedDim !== 'population') setAreaColorLabel(selectedDim, selectedDim)
            else changeColor(selectedDim)
          } }
          style={{ width: 180 }}
          bodyStyle={{overflow: 'initial'}}
          wrapperStyle={{overflow: 'initial'}}
          className="areaTable"
        >
          <TableHeader
            style={{ border: 0 }}
            displaySelectAll={false}
            adjustForCheckbox={false} >
            <TableRow style={{ border: 0, height: 0 }}>
              <TableHeaderColumn style={{ ...styles.firstColumn, width: 76, height: 0 }} ></TableHeaderColumn>
              <TableHeaderColumn style={{
                top: -8,
                left: 0, height: 0
              }}>Area<Checkbox
                onCheck={() => { this.setState({ locked: !locked }) }}
                style={{
                  position: 'absolute',
                  left: 57,
                  top: -2 }}
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
                <RadioButton
                  label=""
                  checked={activeArea.color === 'ruler'}
                  onCheck={() => { if (!locked) changeColor('ruler')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.label === 'ruler'}
                  onCheck={() => { if (!locked) changeLabel('ruler')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Culture</TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.color === 'culture'}
                  onCheck={() => { if (!locked) changeColor('culture')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.label === 'culture'}
                  onCheck={() => { if (!locked) changeLabel('culture')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Religion</TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.color === 'religion'}
                  onCheck={() => { if (!locked) changeColor('religion')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.label === 'religion'}
                  onCheck={() => { if (!locked) changeLabel('religion')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Religion Gen.</TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.color === 'religionGeneral'}
                  onCheck={() => { if (!locked) changeColor('religionGeneral')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.label === 'religionGeneral'}
                  onCheck={() => { if (!locked) changeLabel('religionGeneral')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={ styles.firstColumn } >Population</TableRowColumn>
              <TableRowColumn>
                <RadioButton
                  label=""
                  checked={activeArea.color === 'population'}
                  onCheck={() => { if (!locked) changeColor('population')}}
                  style={{ ...styles.toggleColumn, minWidth: 42, width: 42 }}
                  iconStyle={ styles.areaIcon }
                />
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
