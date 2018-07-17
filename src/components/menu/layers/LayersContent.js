import React, {Component} from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import Download from 'material-ui/svg-icons/file/file-download'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actionReducers'
import { selectEpicItem } from '../../map/actionReducers'
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

const styles = {
  listIcon: {
    margin: 5
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: 'calc(100% - 64px)',
    position: 'initial',
    overflow: 'auto',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '18px 14px',
    background: 'white',
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset'
  },
};

const allMarkers = ['Politicians', 'Battles']

const allEpics = ['War', 'Battle', 'Campaign', 'Exploration', 'Siege', 'Voyage', 'Other Epic']

class LayerContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      basemapId: 0
    }
  }

  handleChange = (event, index, value) => this.setState({value})

  render() {
    const {basemapId} = this.state
    const {activeArea, setPopOpacity, setProvinceBorders, selectedText, selectEpicItem, activeMarkers, activeEpics, selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, mapStyles, changeBasemap, setAreaColorLabel, setClusterMarkers, changeLabel, changeColor, toggleMarker, toggleEpic} = this.props
    return (
      <div style={styles.main}>
        <h4>Basemap</h4>
        <DropDownMenu value={this.state.value} onChange={this.handleChange} openImmediately={true}>
          <MenuItem value={1} primaryText="Watercolor" leftIcon={<Avatar
            src="https://v0.material-ui.com/images/uxceo-128.jpg"
            size={30}
            style={styles.listIcon}
             />}
          />
          <MenuItem value={2} primaryText="Topographic" leftIcon={<Download />} />
          <MenuItem value={3} primaryText="None" leftIcon={<Download />} />
        </DropDownMenu>
        <RaisedButton style={styles.button} label="None" primary={mapStyles.basemap === ''}
                      onClick={() => changeBasemap('')}/>
        <RaisedButton style={styles.button} label="Watercolor" primary={mapStyles.basemap === 'watercolor'}
                      onClick={() => changeBasemap('watercolor')}/>
        <RaisedButton style={styles.button} label="Topographic" primary={mapStyles.basemap === 'topographic'}
                      onClick={() => changeBasemap('topographic')}/>
        <br/>
        <RaisedButton style={styles.button} label="Show Provinces" primary={mapStyles.showProvinceBorders}
                      onClick={() => setProvinceBorders(!mapStyles.showProvinceBorders)}/>
        <br/>
        <h4>Area</h4>
        Population Opacity:
        <RaisedButton style={styles.button} label="PopOpacity" primary={mapStyles.popOpacity}
                      onClick={() => setPopOpacity(!mapStyles.popOpacity)}/>
        Both:
        <RaisedButton style={styles.button} label="Ruler"
                      primary={activeArea.label === 'ruler' && activeArea.color === 'ruler'}
                      onClick={() => setAreaColorLabel('ruler', 'ruler')}/>
        <RaisedButton style={styles.button} label="Religion"
                      primary={activeArea.label === 'religion' && activeArea.color === 'religion'}
                      onClick={() => setAreaColorLabel('religion', 'religion')}/>
        <RaisedButton style={styles.button} label="ReligionGeneral"
                      primary={activeArea.label === 'religionGeneral' && activeArea.color === 'religionGeneral'}
                      onClick={() => setAreaColorLabel('religionGeneral', 'religionGeneral')}/>
        <RaisedButton style={styles.button} label="Culture"
                      primary={activeArea.label === 'culture' && activeArea.color === 'culture'}
                      onClick={() => setAreaColorLabel('culture', 'culture')}/>
        <RaisedButton style={styles.button} label="Population"
                      primary={activeArea.label === '' && activeArea.color === 'population'}
                      onClick={() => setAreaColorLabel('population', 'none')}/>
        {JSON.stringify(activeArea.year)}
        Label:
        <RaisedButton style={styles.button} label="Ruler" primary={activeArea.label === 'ruler'}
                      onClick={() => changeLabel('ruler')}/>
        <RaisedButton style={styles.button} label="Religion" primary={activeArea.label === 'religion'}
                      onClick={() => changeLabel('religion')}/>
        <RaisedButton style={styles.button} label="ReligionGeneral" primary={activeArea.label === 'religionGeneral'}
                      onClick={() => changeLabel('religionGeneral')}/>
        <RaisedButton style={styles.button} label="Culture" primary={activeArea.label === 'culture'}
                      onClick={() => changeLabel('culture')}/>
        <RaisedButton style={styles.button} label="None" primary={activeArea.label === 'none'}
                      onClick={() => changeLabel('none')}/>
        {activeArea.label}
        Color:
        <RaisedButton style={styles.button} label="Ruler" primary={activeArea.color === 'ruler'}
                      onClick={() => changeColor('ruler')}/>
        <RaisedButton style={styles.button} label="Religion" primary={activeArea.color === 'religion'}
                      onClick={() => changeColor('religion')}/>
        <RaisedButton style={styles.button} label="ReligionGeneral" primary={activeArea.color === 'religionGeneral'}
                      onClick={() => changeColor('religionGeneral')}/>
        <RaisedButton style={styles.button} label="Culture" primary={activeArea.color === 'culture'}
                      onClick={() => changeColor('culture')}/>
        <RaisedButton style={styles.button} label="population" primary={activeArea.color === 'population'}
                      onClick={() => changeColor('population')}/>np
        {activeArea.color}
        <br/>
        <h4>Marker</h4>
        <RaisedButton style={styles.button} label="Cluster Markers" primary={mapStyles.clusterMarkers}
                      onClick={() => setClusterMarkers(!mapStyles.clusterMarkers)}/>
        <br/>
        {allMarkers.map(id =>
          <RaisedButton
            style={styles.button}
            label={id}
            key={id}
            primary={activeMarkers.indexOf(id.toLowerCase()) > -1}
            onClick={() => {
              toggleMarker(id.toLowerCase())
            }}/>)}
        {activeMarkers}
        <br/>
        <h4>Epics</h4>
        {allEpics.map(id =>
          <RaisedButton
            style={styles.button}
            label={id}
            key={id}
            primary={activeEpics.indexOf(id.toLowerCase()) > -1}
            onClick={() => {
              toggleEpic(id.toLowerCase())
            }}/>)}
        {activeEpics}
        <br/>
        <RaisedButton style={styles.button} label='Test Epic' onClick={() => {
          selectEpicItem('Byzantine–Sasanian_War_of_602–628', 602)
        }}/>
        <h4>Year</h4>
        {selectedYear}
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
    selectEpicItem
  }),
  pure,
  translate,
)

export default enhance(LayerContent);
