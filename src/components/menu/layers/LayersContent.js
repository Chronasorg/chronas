import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import RaisedButton from 'material-ui/RaisedButton'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actionReducers'
import { selectEpicItem } from '../../map/actionReducers'
import { chronasMainColor } from '../../../styles/chronasColors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import {
  changeBasemap as changeBasemapAction,
  setAreaColorLabel as setAreaColorLabelAction,
  changeLabel as changeLabelAction,
  changeColor as changeColorAction,
  toggleMarker as toggleMarkerAction } from './actionReducers'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '18px 14px',
    background: 'white',
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset'
  },
};

const allMarkers = ['Politicians', 'Battles']

const LayerContent = ({ activeArea, selectedText, selectEpicItem, activeMarkers,  selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, basemap, changeBasemap, setAreaColorLabel, changeLabel, changeColor, toggleMarker }) => (
  <div style={styles.main}>
    <h4>Basemap</h4>
    <RaisedButton style={styles.button} label="None" primary={basemap === ''} onClick={() => changeBasemap('')} />
    <RaisedButton style={styles.button} label="Watercolor" primary={basemap === 'watercolor'} onClick={() => changeBasemap('watercolor')} />
    <RaisedButton style={styles.button} label="Topographic" primary={basemap === 'topographic'} onClick={() => changeBasemap('topographic')} />
    <br/>
    <h4>Area</h4>
    Both:
    <RaisedButton style={styles.button} label="Ruler" primary={activeArea.label === 'ruler' && activeArea.color === 'ruler'} onClick={() => setAreaColorLabel('ruler','ruler')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.label === 'religion' && activeArea.color === 'religion'} onClick={() => setAreaColorLabel('religion','religion')} />
    <RaisedButton style={styles.button} label="ReligionGeneral" primary={activeArea.label === 'religionGeneral' && activeArea.color === 'religionGeneral'} onClick={() => setAreaColorLabel('religionGeneral','religionGeneral')} />
    <RaisedButton style={styles.button} label="Culture" primary={activeArea.label === 'culture' && activeArea.color === 'culture'} onClick={() => setAreaColorLabel('culture','culture')} />
    <RaisedButton style={styles.button} label="Population" primary={activeArea.label === '' && activeArea.color === 'population'} onClick={() => setAreaColorLabel('population','none')} />
    {JSON.stringify(activeArea.year)}
    Label:
    <RaisedButton style={styles.button} label="Ruler" primary={activeArea.label === 'ruler'} onClick={() => changeLabel('ruler')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.label === 'religion'} onClick={() => changeLabel('religion')} />
    <RaisedButton style={styles.button} label="ReligionGeneral" primary={activeArea.label === 'religionGeneral'} onClick={() => changeLabel('religionGeneral')} />
    <RaisedButton style={styles.button} label="Culture" primary={activeArea.label === 'culture'} onClick={() => changeLabel('culture')} />
    <RaisedButton style={styles.button} label="None" primary={activeArea.label === 'none'} onClick={() => changeLabel('none')} />
    {activeArea.label}
    Color:
    <RaisedButton style={styles.button} label="Ruler" primary={activeArea.color === 'ruler'} onClick={() => changeColor('ruler')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.color === 'religion'} onClick={() => changeColor('religion')} />
    <RaisedButton style={styles.button} label="ReligionGeneral" primary={activeArea.color === 'religionGeneral'} onClick={() => changeColor('religionGeneral')} />
    <RaisedButton style={styles.button} label="Culture" primary={activeArea.color === 'culture'} onClick={() => changeColor('culture')} />
    <RaisedButton style={styles.button} label="population" primary={activeArea.color === 'population'} onClick={() => changeColor('population')} />np
    {activeArea.color}
    <br/>
    <h4>Marker</h4>
    {allMarkers.map(id =>
      <RaisedButton
        style={styles.button}
        label={id}
        key={id}
        primary={activeMarkers.indexOf(id.toLowerCase()) > -1}
        onClick={() => {console.debug(id.toLowerCase()); toggleMarker(id.toLowerCase())}} />)}
    {activeMarkers}
    <br/>
    <RaisedButton style={styles.button} label='Test Epic' onClick={() => selectEpicItem('Byzantine–Sasanian_War_of_602–628', 'Byzantine–Sasanian War of 602–628')} />

    <h4>Year</h4>
    {selectedYear}
  </div>
);

LayerContent.propTypes = {
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuTap: PropTypes.func,
  // resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
};

LayerContent.defaultProps = {
  onMenuTap: () => null,
};

const enhance = compose(
  connect(state => ({
    activeArea: state.activeArea,
    activeMarkers: state.activeMarkers,
    selectedYear: state.selectedYear,
    theme: state.theme,
    locale: state.locale,
    basemap: state.basemap,
  }), {
    changeBasemap: changeBasemapAction,
    setAreaColorLabel: setAreaColorLabelAction,
    changeLabel: changeLabelAction,
    changeColor: changeColorAction,
    toggleMarker: toggleMarkerAction,
    toggleMenuDrawer: toggleMenuDrawerAction,
    selectEpicItem
  }),
  pure,
  translate,
);

export default enhance(LayerContent);
