import React, { PureComponent } from 'react';
;
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleMenuDrawer as toggleMenuDrawerAction } from './actionReducers';
import {grey600, grey400, chronasDark} from '../../styles/chronasColors';
import {properties, themes} from '../../properties'
import {backIcon, drawer} from '../../styles/chronasStyleComponents';

import Responsive from './Responsive';

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class MenuDrawer extends PureComponent {
  handleClose = () => {
    this.props.toggleMenuDrawer()
  }

  componentWillUnmount = () => {
    console.debug('we are going down')
  }

  render() {
    const { menuDrawerOpen, setMenuDrawerVisibility, children, theme } = this.props;

    return (
      <Responsive
        small={
          <Drawer docked={false} open={menuDrawerOpen} onRequestChange={setMenuDrawerVisibility}>
            {React.cloneElement(children, { onMenuTap: this.handleClose })}
          </Drawer>
        }
        medium={
          <Drawer
            containerStyle={{ overflow: 'none', backgroundColor: themes[theme].backColors[0], paddingLeft: 56 }} style={{ overflow: 'none', zIndex: 9}} open={menuDrawerOpen}>
            <AppBar
              title={
                <span style={{
                  color: themes[theme].foreColors[0],
                  fontSize: 20
                }}
                >LAYERS</span>
              }
              showMenuIconButton={false}
              style={{ backgroundColor: themes[theme].backColors[0] }}
              iconElementRight={
                <IconButton iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }} onClick={() => this.handleClose()}>
                  <FontIcon style={{ color: themes[theme].foreColors[0] }} className="fa fa-chevron-left"/>
                </IconButton>
              }
            />
            {children}
          </Drawer>
        }
      />
    );
  }
}

const mapStateToProps = (state, props) => ({
  menuDrawerOpen: state.menuDrawerOpen,
  locale: state.locale, // force redraw on locale change
  theme: state.theme, // force redraw on theme changes
});

export default compose(
  connect(mapStateToProps, {
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
)(MenuDrawer);
