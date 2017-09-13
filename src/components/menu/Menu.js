import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import DiscoverIcon from 'material-ui/svg-icons/action/explore';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import { Link } from 'react-router-dom';
import pure from 'recompose/pure';
import { connect } from 'react-redux'
import compose from 'recompose/compose';
import { translate, defaultTheme } from 'admin-on-rest';
import { toggleMenuDrawer as toggleMenuDrawerAction, setActiveMenu as setActiveMenuAction } from './actionReducers';
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

const Menu = ({ toggleMenuDrawer, setActiveMenu, hasDashboard, onMenuTap, resources, translate }) => (
  <div style={styles.main}>
    <IconButton
      key={'layers'}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.layers')}
      tooltipStyles={tooltip}
      onTouchTap={() => toggleMenuDrawer()}
      iconStyle={{color: '#fff'}}
    >
      <LayersIcon
        hoverColor={chronasMainColor}
      />
    </IconButton>
    <IconButton
      key={'discover'}
      containerElement={<Link to="/discover" />}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.discover')}
      tooltipStyles={tooltip}
      onTouchTap={() => setActiveMenu('discover')}
      iconStyle={{color: '#fff'}}
    >
      <DiscoverIcon
        hoverColor={chronasMainColor}/>
    </IconButton>
    <IconButton
      key={'configuration'}
      containerElement={<Link to="/configuration" />}
      tooltipPosition="bottom-right"
      tooltip={translate('pos.configuration')}
      tooltipStyles={tooltip}
      onTouchTap={() => setActiveMenu('configuration')}
      iconStyle={{color: '#fff'}}
    >
      <SettingsIcon
        hoverColor={chronasMainColor}/>
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
      <SettingsIcon
        hoverColor={chronasMainColor}/>
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
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleMenuDrawer: toggleMenuDrawerAction,
    setActiveMenu: setActiveMenuAction,
  }),
  pure,
  translate,
);

export default enhance(Menu);
