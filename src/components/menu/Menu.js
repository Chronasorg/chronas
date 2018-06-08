import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import BoardIcon from 'material-ui/svg-icons/communication/forum'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import DiscoverIcon from 'material-ui/svg-icons/action/explore'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import UsersIcon from 'material-ui/svg-icons/social/people'
import StorageIcon from 'material-ui/svg-icons/device/storage'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import DiceIcon from 'material-ui/svg-icons/places/casino'
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme, userLogout, showNotification } from 'admin-on-rest'
import { selectAreaItem as selectAreaItemAction } from '../map/actionReducers'
import { toggleMenuDrawer as toggleMenuDrawerAction, setActiveMenu as setActiveMenuAction } from './actionReducers'
import { toggleRightDrawer as toggleRightDrawerAction } from '../content/actionReducers'
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
      props.showNotification("Welcome " + localStorage.getItem('username')) // TODO: translate welcome
      props.setToken(token)
    }
  }

  handleLogout = () => {
    const { logout, showNotification } = this.props;
    showNotification("auth.logged_out")
    logout()
  }

  render() {
    const { toggleMenuDrawer, toggleRightDrawer, userLogout, userDetails, setActiveMenu, selectAreaItem, hasDashboard, onMenuTap, resources, translate } = this.props;
    const isLoggedIn = userDetails.token !== ''

    return <div style={styles.main}>
      <div className="topMenuItems">
        <IconButton
          key={'layers'}
          tooltipPosition="bottom-right"
          tooltip={translate('pos.layers')}
          tooltipStyles={tooltip}
          onClick={() => toggleMenuDrawer()}
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
          onClick={() => setActiveMenu('discover')}
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
          onClick={() => selectAreaItem("random")}
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
          onClick={() => setActiveMenu('configuration')}
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
                key={'mod'}
                containerElement={<Link to="/mod" />}
                tooltipPosition="bottom-right"
                tooltip={translate('pos.mod')}
                tooltipStyles={tooltip}
                onClick={() => toggleRightDrawer()}
                iconStyle={{color: '#fff'}}
              >
                <EditIcon
                  hoverColor={chronasMainColor}/>
              </IconButton>
              <IconButton
                key={'resources'}
                containerElement={<Link to="/resources" />}
                tooltipPosition="bottom-right"
                tooltip={translate('pos.resources')}
                tooltipStyles={tooltip}
                onClick={onMenuTap}
                iconStyle={{color: '#fff'}}
              >
                <StorageIcon
                  hoverColor={chronasMainColor}/>
              </IconButton>
              <IconButton
                key={'board'}
                containerElement={<Link to="/board" />}
                tooltipPosition="bottom-right"
                tooltip={translate('pos.community')}
                tooltipStyles={tooltip}
                onClick={onMenuTap}
                iconStyle={{color: '#fff'}}
              >
                <BoardIcon
                  hoverColor={chronasMainColor}/>
              </IconButton>
              <IconButton
              key={'account'}
              containerElement={<Link to="/account" />}
              tooltipPosition="bottom-right"
              tooltip={translate('pos.account')}
              tooltipStyles={tooltip}
              onClick={onMenuTap}
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
            tooltip={translate(isLoggedIn ? 'auth.logout' : 'auth.login')}
            tooltipStyles={tooltip}
            onClick={isLoggedIn ? this.handleLogout : userLogout }
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
  onMenuTap: PropTypes.func,
  translate: PropTypes.func.isRequired,
};

Menu.defaultProps = {
  onMenuTap: () => null,
};

const enhance = compose(
  connect(state => ({
    userDetails: state.userDetails,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    toggleMenuDrawer: toggleMenuDrawerAction,
    setActiveMenu: setActiveMenuAction,
    selectAreaItem: selectAreaItemAction,
    userLogout,
    setToken,
    showNotification,
    logout
  }),
  pure,
  translate,
);

export default enhance(Menu);
