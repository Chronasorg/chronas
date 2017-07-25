import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleMenuDrawer as toggleMenuDrawerAction } from './actions';

import Responsive from './Responsive';

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class Sidedrawer extends PureComponent {
  handleClose = () => {
    this.props.toggleMenuDrawer()
  }

  render() {
    console.debug("this.state this.props",this.state, this.props)
    const { menuDrawerOpen, setSidedrawerVisibility, children, muiTheme } = this.props;

    return (
      <Responsive
        small={
          <Drawer docked={false} open={menuDrawerOpen} onRequestChange={setSidedrawerVisibility}>
            {React.cloneElement(children, { onMenuTap: this.handleClose })}
          </Drawer>
        }
        medium={
          <Drawer style={{ marginLeft: 100, zIndex: 9}} open={menuDrawerOpen}>
            <div style={{ textAlign: 'right' }}>
              <IconButton onTouchTap={() => this.handleClose()}>
                <FontIcon className="fa fa-chevron-left" />
              </IconButton>
            </div>
            {children}
          </Drawer>
        }
      />
    );
  }
}

Sidedrawer.propTypes = {
  children: PropTypes.node.isRequired,
  muiTheme: PropTypes.object.isRequired,
  menuDrawerOpen: PropTypes.bool,
  setSidedrawerVisibility: PropTypes.func,
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
)(Sidedrawer);
