import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleMenuDrawer as toggleMenuDrawerAction } from './actions';
import {grey600, grey400, chronasDark} from '../../styles/chronasColors';
import {backIcon, drawer} from '../../styles/chronasStyleComponents';

import Responsive from './Responsive';

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class MenuDrawer extends PureComponent {
  handleClose = () => {
    console.debug("handle close")
    this.props.toggleMenuDrawer()
  }

  render() {
    console.debug("menuDrawerOpen: this.state this.props",this.state, this.props)
    const { menuDrawerOpen, setMenuDrawerVisibility, children, muiTheme } = this.props;

    return (
      <Responsive
        small={
          <Drawer docked={false} open={menuDrawerOpen} onRequestChange={setMenuDrawerVisibility}>
            {React.cloneElement(children, { onMenuTap: this.handleClose })}
          </Drawer>
        }
        medium={
          <Drawer
            containerStyle={{ overflow: 'none', paddingLeft: 56 }} style={{ overflow: 'none', marginLeft: 100, zIndex: 9}} open={menuDrawerOpen}>
            <AppBar
              title={
                <span style={{
                  color: chronasDark,
                  fontSize: 20
                }}
                >LAYERS</span>
              }
              showMenuIconButton={false}
              style={{backgroundColor: '#fff'}}
              iconElementRight={
                <IconButton iconStyle={{textAlign: 'right', fontSize: '12', color: grey600}}
                            onTouchTap={() => this.handleClose()}>
                  <FontIcon className="fa fa-chevron-left"/>
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

MenuDrawer.propTypes = {
  children: PropTypes.node.isRequired,
  muiTheme: PropTypes.object.isRequired,
  menuDrawerOpen: PropTypes.bool,
  setMenuDrawerVisibility: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  menuDrawerOpen: state.menuDrawerOpen,
  locale: state.locale, // force redraw on locale change
  theme: props.theme, // force redraw on theme changes
});

export default compose(
  connect(mapStateToProps, {
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
)(MenuDrawer);
