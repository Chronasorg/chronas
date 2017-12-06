import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers';
import {grey600, grey400, chronasDark} from '../../styles/chronasColors';
import Responsive from '../menu/Responsive';

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class RightDrawer extends PureComponent {
  handleClose = () => {
    this.props.toggleRightDrawer()
  }

  render() {
    const { rightDrawerOpen, setRightDrawerVisibility, children, muiTheme } = this.props;

    return (
      <Responsive
        small={
          <Drawer
            docked={false}
            openSecondary={true}
            open={rightDrawerOpen}
            onRequestChange={setRightDrawerVisibility}
          >
            {React.cloneElement(children, { onMenuTap: this.handleClose })}
          </Drawer>
        }
        medium={
          <Drawer
            openSecondary={true}
            containerStyle={{ overflow: 'none' }}
            style={{ overflow: 'none', zIndex: 9 }}
            open={rightDrawerOpen}
            width={'50%'}
          >
            <AppBar
              title={
                <span style={{
                  color: chronasDark,
                  fontSize: 20
                }}
                >CONTENT</span>
              }
              showMenuIconButton={false}
              style={{backgroundColor: '#fff'}}
              iconElementRight={
                <IconButton iconStyle={{textAlign: 'right', fontSize: '12px', color: grey600}}
                            onClick={() => this.handleClose()}>
                  <FontIcon className="fa fa-chevron-right"/>
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

RightDrawer.propTypes = {
  children: PropTypes.node.isRequired,
  muiTheme: PropTypes.object.isRequired,
  setRightDrawerVisibility: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  rightDrawerOpen: state.rightDrawerOpen,
  locale: state.locale, // force redraw on locale change
  theme: props.theme, // force redraw on theme changes
});

export default compose(
  connect(mapStateToProps, {
    toggleRightDrawer: toggleRightDrawerAction,
  }),
)(RightDrawer);
