import React, { PureComponent } from 'react'

import BoardIcon from 'material-ui/svg-icons/communication/forum'
import CollectionIcon from 'material-ui/svg-icons/image/collections-bookmark'
import IconButton from 'material-ui/IconButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import HelpIcon from 'material-ui/svg-icons/action/help'
import DiscoverIcon from 'material-ui/svg-icons/action/explore'
import compose from 'recompose/compose'
import PlusIcon from 'material-ui/svg-icons/maps/local-hospital'
import DiceIcon from 'material-ui/svg-icons/places/casino'
import GameIcon from 'material-ui/svg-icons/hardware/videogame-asset'
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import StarIcon from 'material-ui/svg-icons/action/grade'
import Avatar from 'material-ui/Avatar'
import Badge from 'material-ui/Badge'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import { defaultTheme, showNotification, translate, userLogout } from 'admin-on-rest'
import { selectAreaItem as selectAreaItemAction } from '../map/actionReducers'
import { setActiveMenu as setActiveMenuAction, toggleMenuDrawer as toggleMenuDrawerAction } from './actionReducers'
import { toggleRightDrawer as toggleRightDrawerAction } from '../content/actionReducers'
import { tooltip } from '../../styles/chronasStyleComponents'
import {logout, setToken, setUserScore, setUser } from './authentication/actionReducers'
import { themes } from '../../properties'
import decodeJwt from "jwt-decode";

const styles = {
  mainLogo: {
    marginBottom: '24px',
    width: '50px',
    color: 'rgb(255, 255, 255)',
    marginLeft: '-6px',
    marginTop: '-8px',
    'svg': {
      'g': {
        'fill': 'red'
      }
    }
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px'
  },
  topMenu: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px'
  },
  bottomMenu: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '8px 4px'
  }
}

class Menu extends PureComponent {
  handleLogout = () => {
    const { logout, showNotification } = this.props
    localStorage.removeItem('chs_token')
    localStorage.removeItem('chs_score')
    localStorage.removeItem('chs_subscription')
    localStorage.removeItem('chs_username')
    localStorage.removeItem('chs_avatar')
    localStorage.removeItem('chs_privilege')
    localStorage.removeItem('chs_id')
    showNotification('aor.auth.logged_out')
    logout()
  }

  constructor (props) {
    super(props)
    this.state = { diceRotation: 60 }
    const token = localStorage.getItem('chs_token')
    if (token !== null) {
      //  <span>{translate('resources.users.page.delete')} "{username}"</span>
      props.showNotification('Welcome ' + localStorage.getItem('chs_username'), 'confirm') // TODO: translate welcome
      props.setToken(token)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { setUserScore, setUser } = this.props
    const { token, username } = this.props.userDetails
    if (token !== nextProps.userDetails.token && nextProps.userDetails.token && username === nextProps.userDetails.username) {
      const decodedToken = decodeJwt(nextProps.userDetails.token)
      if (decodedToken.score) {
        localStorage.setItem('chs_score', decodedToken.score)
//         setUserScore(+decodedToken.score)

         const userScore = decodedToken.score
         setUser(nextProps.userDetails.token, (decodedToken.name || {}).first || (decodedToken.name || {}).last || decodedToken.email, decodedToken.privilege, decodedToken.avatar, userScore, decodedToken.subscription)

      }
    }
  }

  render () {
    const { toggleMenuDrawer, userLogout, userDetails, setActiveMenu, selectAreaItem, onMenuTap, theme, isLight, translate } = this.props
    const { diceRotation } = this.state
    const isLoggedIn = (userDetails || {}).token !== ''
    const isPro = (localStorage.getItem('chs_subscription') && !((userDetails || {}).subscription)) || ((userDetails || {}).subscription && (userDetails || {}).subscription || "").length > 4
    const username = localStorage.getItem('chs_username')
    const customAvatar = (userDetails || {}).avatar || localStorage.getItem('chs_avatar')
    const preUserScore = (userDetails || {}).score || 1
    const userScore = preUserScore > 100000 ? (Math.floor(preUserScore/ 1000000) + 'm') : preUserScore > 1000 ? (Math.floor(preUserScore/ 1000) + 'k') : preUserScore
    return <div style={styles.main}>
      <div style={styles.topMenu} className='topMenuItems'>
        <IconButton
          key={'info'}
          style={styles.mainLogo}
          containerElement={<Link to='/info' />}
          onClick={() => localStorage.setItem('chs_info_section', 'welcome')}
          iconStyle={styles.mainLogo}
        >
          <SVG
            className={('logoMenuContainer ' + themes[theme].className)}
            src='/images/newLogo10.svg'
          >
            CHRONAS
          </SVG>
        </IconButton>
        <IconButton
          style={{ marginTop: '32px', padding: 0 }}
          key={'layers'}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.layers')}
          tooltipStyles={tooltip}
          onClick={() => toggleMenuDrawer('layers')}
          iconStyle={{ color: themes[theme].foreColors[0] }}
        >
          <LayersIcon
            hoverColor={themes[theme].highlightColors[0]}
          />
        </IconButton>
        { !isLight && <IconButton
          key={'discover'}
          containerElement={<Link to='/discover' />}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.discover')}
          tooltipStyles={tooltip}
          onClick={() => setActiveMenu('discover')}
          iconStyle={{ color: themes[theme].foreColors[0] }}
        >
          <DiscoverIcon
            hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>}
        { !isLight && <IconButton
          key={'random'}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.random')}
          tooltipStyles={tooltip}
          onClick={() => { this.setState({ diceRotation: this.state.diceRotation + 360 }); selectAreaItem('random') }}
          iconStyle={{
            color: themes[theme].foreColors[0],
            transition: '2s transform',
            transform: 'rotate(' + diceRotation + 'deg)'
          }}
          style={{ padding: 0 }}
        >
          <DiceIcon
            hoverColor={themes[theme].highlightColors[0]} />
        </IconButton> }
        <IconButton
          key={'configuration'}
          containerElement={<Link to='/configuration' />}
          tooltipPosition='bottom-right'
          tooltip={translate('pos.configuration')}
          tooltipStyles={tooltip}
          onClick={() => setActiveMenu('configuration')}
          iconStyle={{ color: themes[theme].foreColors[0] }}
        >
          <SettingsIcon hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>
      </div>



      <div style={styles.bottomMenu}>

      <div>

        <IconButton
          key={'pro'}
          containerElement={<Link to={'/pro'} />}
          tooltipPosition='bottom-right'
          tooltip={'PRO Version'}
          tooltipStyles={tooltip}
          onClick={onMenuTap}
          hoverColor={themes[theme].highlightColors[0]}
          iconStyle={{
                                           color: isPro ? themes[theme].highlightColors[0] : themes[theme].foreColors[0] }}
//          iconStyle={{ backgroundColor: themes[theme].foreColors[0] }}
        >
        <StarIcon hoverColor={themes[theme].highlightColors[0]} />
        </IconButton>

        {isLoggedIn ? (
            <div>
              <IconButton
                key={'community'}
                containerElement={<Link to='/community/general' />}
                tooltipPosition='bottom-right'
                tooltip={translate('pos.community')}
                tooltipStyles={tooltip}
                onClick={onMenuTap}
                iconStyle={{ color: themes[theme].foreColors[0] }}
              >
                <BoardIcon
                  hoverColor={themes[theme].highlightColors[0]} />
              </IconButton>
              <Badge
                style={{ padding: 0 }}
                badgeContent={userScore}
                className={'accountPointsBadge'}
                badgeStyle={{ top: -6, right: 0, border: '1px solid rgba(106, 106, 106, 0.4)' }}
              ><IconButton
                key={'account'}
                containerElement={<Link to={(username) ? ('/community/user/' + username) : '/account'} />}
                tooltipPosition='bottom-right'
                tooltip={translate('pos.account')}
                tooltipStyles={tooltip}
                onClick={onMenuTap}
                hoverColor={themes[theme].highlightColors[0]}
                iconStyle={{ backgroundColor: themes[theme].foreColors[0] }}
              >
                {customAvatar ? <Avatar
                  size={24}
                  src={customAvatar} /> : <Avatar
                  style={{ fontSize: 16 }}
                  size={24}
                  color={{
                    // color: themes[theme].foreColors[0],
                    // backgroundColor: themes[theme].backColors[0]
                  }}
                  src={customAvatar}><span style={{
                  fontWeight: 'bolder',
                  color: themes[theme].backColors[0]
                }}>{(username || ' ').substr(0, 1).toUpperCase()}</span></Avatar>
                }
              </IconButton>
            </Badge>
            </div>
          ) : null }

          <IconButton
            key={'collections'}
            tooltipPosition='bottom-right'
            tooltip={translate('collections.title')}
            tooltipStyles={tooltip}
            className={'collectionMenuIcon'}
            onClick={() => toggleMenuDrawer('collections')}
            iconStyle={{ color: themes[theme].foreColors[0] }}
          >
            <CollectionIcon
              hoverColor={themes[theme].highlightColors[0]} />
          </IconButton>
          { !isLight && <IconButton
            key={'play'}
            containerElement={<Link to='/play' />}
            // tooltipPosition="bottom-right"
            // tooltip={translate('pos.help')}
            // tooltipStyles={tooltip}
            onClick={() => setActiveMenu('play')}
            iconStyle={{ color: themes[theme].foreColors[0] }}
          >
            <GameIcon hoverColor={themes[theme].highlightColors[0]} />
          </IconButton> }
          { !isLight && <IconButton
            key={'help'}
            containerElement={<Link to='/info' />}
            // tooltipPosition="bottom-right"
            // tooltip={translate('pos.help')}
            // tooltipStyles={tooltip}
            onClick={() => setActiveMenu('info')}
            iconStyle={{ color: themes[theme].foreColors[0] }}
          >
            <HelpIcon hoverColor={themes[theme].highlightColors[0]} />
          </IconButton> }
          { !isLight && <IconButton
            onClick={isLoggedIn ? this.handleLogout : userLogout}
            className='logout'
            iconStyle={{ color: isLoggedIn ? themes[theme].highlightColors[0] : themes[theme].foreColors[0] }}
          > <LogoutIcon hoverColor={themes[theme].highlightColors[0]} />
          </IconButton> }
        </div>
      </div>
    </div>
  }
};

Menu.defaultProps = {
  onMenuTap: () => null,
}

const enhance = compose(
  connect(state => ({
    userDetails: state.userDetails,
    theme: state.theme
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    toggleMenuDrawer: toggleMenuDrawerAction,
    setActiveMenu: setActiveMenuAction,
    selectAreaItem: selectAreaItemAction,
    userLogout,
    setUserScore,
    setUser,
    setToken,
    showNotification,
    logout
  }),
  pure,
  translate,
)

export default enhance(Menu)
