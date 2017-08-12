import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import RaisedButton from 'material-ui/RaisedButton'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleMenuDrawer as toggleMenuDrawerAction } from '../actions'
import { chronasMainColor } from '../../../styles/chronasColors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { changeBasemap as changeBasemapAction } from './actions'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '18px 14px',
  },
};
const LayerContent = ({ toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate, basemap, changeBasemap }) => (
  <div style={styles.main}>
    <h4> AREA </h4>
    <h4> MARKER </h4>
    <br/>
    <h6> Basemap Placeholder</h6>
    <RaisedButton style={styles.button} label="Watercolor" primary={basemap === 'watercolor'} onClick={() => changeBasemap('watercolor')} />
    <RaisedButton style={styles.button} label="Topographic" primary={basemap === 'topographic'} onClick={() => changeBasemap('topographic')} />
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
    theme: state.theme,
    locale: state.locale,
    basemap: state.basemap,
  }), {
    toggleMenuDrawer: toggleMenuDrawerAction,
    changeBasemap: changeBasemapAction,
  }),
  pure,
  translate,
);

export default enhance(LayerContent);
