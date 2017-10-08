import React from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import DiscoverIcon from 'material-ui/svg-icons/action/explore'
import DiceIcon from 'material-ui/svg-icons/places/casino'
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme, userLogout } from 'admin-on-rest'
import { setItemId as setItemIdAction } from '../map/actionReducers'
import { toggleMenuDrawer as toggleMenuDrawerAction, setActiveMenu as setActiveMenuAction } from './actionReducers'
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
  bottomMenu: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '8px 4px'
  }
};

const Menu = ({ toggleMenuDrawer, userLogout, setActiveMenu, setItemId, hasDashboard, onMenuTap, resources, translate }) => (
  <div style={styles.main}>
    <div className="topMenuItems">
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
        key={'random'}
        tooltipPosition="bottom-right"
        tooltip={translate('pos.random')}
        tooltipStyles={tooltip}
        onTouchTap={() => setItemId("random")}
        iconStyle={{color: '#fff'}}
      >
        <DiceIcon
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
        <SettingsIcon hoverColor={chronasMainColor}/>
      </IconButton>
    </div>
    <div style={styles.bottomMenu}>
      <div>
        <IconButton
          key={'products'}
          containerElement={<Link to="/products" />}
          tooltipPosition="bottom-right"
          tooltip={translate('pos.products')}
          tooltipStyles={defaultTheme.tooltip}
          onTouchTap={onMenuTap}
          iconStyle={defaultTheme.icon}
        >
          <SettingsIcon
            hoverColor={chronasMainColor}/>
        </IconButton>
        <IconButton
          tooltipPosition="bottom-right"
          tooltip={translate('aor.auth.logout')}
          tooltipStyles={tooltip}
          onTouchTap={userLogout}
          className="logout"
          iconStyle={{color: '#fff'}}
        > <LogoutIcon hoverColor={chronasMainColor}/>
        </IconButton>
      </div>
    </div>
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
    setItemId: setItemIdAction,
    userLogout
  }),
  pure,
  translate,
);

export default enhance(Menu);
