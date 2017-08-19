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
import { changeBasemap as changeBasemapAction,
  changeArea as changeAreaAction,
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

const LayerContent = ({ selectedArea, selectedMarkers,  selectedYear, toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, basemap, changeBasemap, changeArea, toggleMarker }) => (
  <div style={styles.main}>
    <h4> Basemap</h4>
    <RaisedButton style={styles.button} label="Watercolor" primary={basemap === 'watercolor'} onClick={() => changeBasemap('watercolor')} />
    <RaisedButton style={styles.button} label="Topographic" primary={basemap === 'topographic'} onClick={() => changeBasemap('topographic')} />
    <br/>
    <h4>Area</h4>
    {selectedArea}
    <RaisedButton style={styles.button} label="Political" primary={selectedArea === 'political'} onClick={() => changeArea('political')} />
    <RaisedButton style={styles.button} label="Religion" primary={selectedArea === 'religion'} onClick={() => changeArea('religion')} />
    <br/>
    <h4>Marker</h4>
    {selectedMarkers}
    {allMarkers.map(id =>
      <RaisedButton
        style={styles.button}
        label={id}
        key={id}
        primary={selectedMarkers.indexOf(id.toLowerCase()) > -1}
        onClick={() => {console.debug(id.toLowerCase()); toggleMarker(id.toLowerCase())}} />)}
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
    selectedArea: state.selectedArea,
    selectedMarkers: state.selectedMarkers,
    selectedYear: state.selectedYear,
    theme: state.theme,
    locale: state.locale,
    basemap: state.basemap,
  }), {
    changeBasemap: changeBasemapAction,
    changeArea: changeAreaAction,
    toggleMarker: toggleMarkerAction,
    toggleMenuDrawer: toggleMenuDrawerAction
  }),
  pure,
  translate,
);

export default enhance(LayerContent);
