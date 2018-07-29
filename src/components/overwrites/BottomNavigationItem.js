import React, {cloneElement} from 'react'
import PropTypes from 'prop-types'
import EnhancedButton from 'material-ui/internal/EnhancedButton'

function getStyles(props, context) {
  const {selected} = props;
  const {
    muiTheme: {
      bottomNavigation,
    },
  } = context;

  const color = selected ?
    bottomNavigation.selectedColor :
    bottomNavigation.unselectedColor;

  const styles = {
    root: {
      transition: 'padding-top 0.3s',
      paddingTop: selected ? 6 : 8,
      paddingBottom: 10,
      background: selected ? '#37393130' : 'none',
      paddingLeft: 12,
      paddingRight: 12,
      minWidth: 80,
      maxWidth: 168,
    },
    label: {
      fontSize: selected ?
        bottomNavigation.selectedFontSize :
        bottomNavigation.unselectedFontSize,
      transition: 'color 0.3s, font-size 0.3s',
      color: color,
    },
    icon: {
      display: 'block',
      /**
       * Used to ensure SVG icons are centered
       */
      width: '100%',
    },
    iconColor: color,
  };

  return styles;
}

const BottomNavigationItem = (props, context) => {
  const {
    label,
    icon,
    style,
    ...other
  } = props;

  const {prepareStyles} = context.muiTheme;
  const styles = getStyles(props, context);

  const styledIcon = cloneElement(icon, {
    style: Object.assign({}, styles.icon, icon.props.style),
    color: icon.props.color || styles.iconColor,
  });

  return (
    <EnhancedButton {...other} style={Object.assign({}, styles.root, style)}>
      {styledIcon}
      <div style={prepareStyles(styles.label)}>
        {label}
      </div>
    </EnhancedButton>
  );
};

BottomNavigationItem.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export default BottomNavigationItem;
