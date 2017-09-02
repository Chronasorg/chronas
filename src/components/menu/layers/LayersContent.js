import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import RaisedButton from 'material-ui/RaisedButton'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actionReducers'
import { chronasMainColor } from '../../../styles/chronasColors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import {
  changeBasemap as changeBasemapAction,
  setArea as setAreaAction,
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
  },
};

const allMarkers = ['People', 'Battles']

const LayerContent = ({ activeArea, selectedText, activeMarkers,  selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, basemap, changeBasemap, setArea, changeLabel, changeColor, toggleMarker }) => (
  <div style={styles.main}>
    <h4>Basemap</h4>
    <RaisedButton style={styles.button} label="Watercolor" primary={basemap === 'watercolor'} onClick={() => changeBasemap('watercolor')} />
    <RaisedButton style={styles.button} label="Topographic" primary={basemap === 'topographic'} onClick={() => changeBasemap('topographic')} />
    <br/>
    <h4>Area</h4>
    Both:
    <RaisedButton style={styles.button} label="Political" primary={activeArea.label === 'political' && activeArea.color === 'political'} onClick={() => setArea('political','political')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.label === 'religion' && activeArea.color === 'religion'} onClick={() => setArea('religion','religion')} />
    {JSON.stringify(activeArea)}
    Label:
    <RaisedButton style={styles.button} label="Political" primary={activeArea.label === 'political'} onClick={() => changeLabel('political')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.label === 'religion'} onClick={() => changeLabel('religion')} />
    {activeArea.label}
    Color:
    <RaisedButton style={styles.button} label="Political" primary={activeArea.color === 'political'} onClick={() => changeColor('political')} />
    <RaisedButton style={styles.button} label="Religion" primary={activeArea.color === 'religion'} onClick={() => changeColor('religion')} />
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
    setArea: setAreaAction,
    changeLabel: changeLabelAction,
    changeColor: changeColorAction,
    toggleMarker: toggleMarkerAction,
    toggleMenuDrawer: toggleMenuDrawerAction
  }),
  pure,
  translate,
);

export default enhance(LayerContent);
