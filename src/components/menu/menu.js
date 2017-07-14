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
import { toggleMenuDrawer as toggleMenuDrawerAction } from './actions';

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px',
  },
};
const Menu = ({ toggleMenuDrawer, hasDashboard, onMenuTap, resources, translate }) => (
  <div style={styles.main}>
    <IconButton
      key={'layers'}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.layers')}
      tooltipStyles={defaultTheme.tooltip}
      onTouchTap={() => toggleMenuDrawer()}
      iconStyle={defaultTheme.icon}
    >
      <LayersIcon />
    </IconButton>
    <IconButton
      key={'configuration'}
      containerElement={<Link to="/configuration" />}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.configuration')}
      tooltipStyles={defaultTheme.tooltip}
      onTouchTap={onMenuTap}
      iconStyle={defaultTheme.icon}
    >
      <SettingsIcon />
    </IconButton>
    <IconButton
      key={'comments'}
      containerElement={<Link to="/comments" />}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.configuration')}
      tooltipStyles={defaultTheme.tooltip}
      onTouchTap={onMenuTap}
      iconStyle={defaultTheme.icon}
    >
      <SettingsIcon />
    </IconButton>
  </div>
);

Menu.propTypes = {
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuTap: PropTypes.func,
  // resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
};

Menu.defaultProps = {
  onMenuTap: () => null,
};

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    menuDrawerOpen: state.menuDrawerOpen,
  }), {
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
  pure,
  translate,
);

export default enhance(Menu);
