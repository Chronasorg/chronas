import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import DiscoverIcon from 'material-ui/svg-icons/action/explore'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import DiceIcon from 'material-ui/svg-icons/places/casino'
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme, userLogout, showNotification } from 'admin-on-rest'
import { setItemId as setItemIdAction } from '../map/actionReducers'
import { toggleMenuDrawer as toggleMenuDrawerAction, setActiveMenu as setActiveMenuAction } from './actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import { logout, setToken } from './authentication/actionReducers'

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

class Menu extends PureComponent {

  constructor(props) {
    super(props);
    const token = localStorage.getItem('token');
    if (token !== null) {
      props.showNotification("Logged in")
      props.setToken(token)
    }
  }

  handleLogout = () => {
    const { logout, showNotification } = this.props;
    showNotification("Logged out")
    logout()
  }

  render() {
    const { toggleMenuDrawer, userLogout, userDetails, setActiveMenu, setItemId, hasDashboard, onMenuTap, resources, translate } = this.props;
    const isLoggedIn = userDetails.token !== ''

    return <div style={styles.main}>
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
          { isLoggedIn ? (
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
              key={'account'}
              containerElement={<Link to="/account" />}
              tooltipPosition="bottom-right"
              tooltip={translate('pos.account')}
              tooltipStyles={tooltip}
              onTouchTap={onMenuTap}
              iconStyle={{color: '#fff'}}
              >
              <AccountIcon
              hoverColor={chronasMainColor}/>
              </IconButton>
            </div>
            ) : null
          }
          <IconButton
            tooltipPosition="bottom-right"
            tooltip={translate(isLoggedIn ? 'aor.auth.logout' : 'aor.auth.login')}
            tooltipStyles={tooltip}
            onTouchTap={isLoggedIn ? this.handleLogout : userLogout }
            className="logout"
            iconStyle={{color: isLoggedIn ? chronasMainColor : '#fff'}}
          > <LogoutIcon hoverColor={chronasMainColor}/>
          </IconButton>
        </div>
      </div>
    </div>
  }
};

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
    userDetails: state.userDetails,
  }), {
    toggleMenuDrawer: toggleMenuDrawerAction,
    setActiveMenu: setActiveMenuAction,
    setItemId: setItemIdAction,
    userLogout,
    setToken,
    showNotification,
    logout
  }),
  pure,
  translate,
);

export default enhance(Menu);
