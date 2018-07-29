import React, { PureComponent } from 'react';
;
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Drawer from 'material-ui/Drawer';
import Paper from 'material-ui/Paper';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Responsive from './Responsive';
import { themes } from '../../properties'

const getWidth = width => (typeof width === 'number' ? `${width}px` : width);

const getStyles = ({ drawer }) => {
  const width = drawer && drawer.width ? getWidth(drawer.width) : '16em';

  return ({
    sidebarOpen: {
      flex: `0 0 ${width}`,
      marginLeft: 0,
      order: -1,
      zIndex: 10000,
      borderRadius: 0,
      transition: 'margin 350ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    },
    sidebarClosed: {
      flex: `0 0 ${width}`,
      marginLeft: `-${width}`,
      order: -1,
      zIndex: 10000,
      transition: 'margin 350ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    },
  });
};

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class Sidebar extends PureComponent {
  handleClose = () => {
    // this.props.setSidebarVisibility(false);
  }

  render() {
    const { open, setSidebarVisibility, children, muiTheme, theme } = this.props;
    const styles = getStyles(muiTheme);

    return (
      <Responsive
        small={
          <Drawer docked={false} open={open} onRequestChange={setSidebarVisibility}>
            {React.cloneElement(children, { onMenuTap: this.handleClose })}
          </Drawer>
        }
        medium={
          <Paper style={open ? { ...styles.sidebarOpen, backgroundImage: themes[theme].gradientColors[0], color: themes[theme].foreColors[0], backgroundColor: themes[theme].backColors[0]} : styles.sidebarClosed}>
            {children}
          </Paper>
        }
      />
    );
  }
}

const mapStateToProps = (state, props) => ({
  open: props.open,
  locale: state.locale, // force redraw on locale change
  theme: state.theme, // force redraw on theme changes
});

export default compose(
  muiThemeable(),
  connect(mapStateToProps, { }),
)(Sidebar);
