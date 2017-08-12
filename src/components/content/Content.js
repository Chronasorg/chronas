import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import { Link } from 'react-router-dom';
import pure from 'recompose/pure';
import { connect } from 'react-redux'
import compose from 'recompose/compose';
import { translate, defaultTheme } from 'admin-on-rest';
import { toggleRightDrawer as toggleRightDrawerAction } from './actions';
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px',
  },
};

const Content = ({ toggleRightDrawer, hasDashboard, onRightTap, resources, translate }) => (
  <div style={styles.main}>
    Content comes here
  </div>
);

Content.propTypes = {
  translate: PropTypes.func.isRequired,
};

Content.defaultProps = {
  onContentTap: () => null,
};

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
  }),
  pure,
  translate,
);

export default enhance(Content);
