import React, { Component } from 'react'
import PropTypes from 'prop-types'

function getStyles (props, context) {
  const {
    baseTheme,
    gridTile,
  } = context.muiTheme

  const actionPos = props.actionIcon && props.actionPosition

  const styles = {
    root: {
      position: 'relative',
      display: 'block',
      height: '100%',
      overflow: 'hidden',
    },
    titleBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      [props.titlePosition]: 0,
      height: props.subtitle ? props.titleHeight : 64,
      background: props.titleBackground,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    },
    titleWrap: {
      flexGrow: 1,
      marginLeft: actionPos !== 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      marginRight: actionPos === 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      color: gridTile.textColor,
      overflow: 'hidden',
    },
    title: {
      fontSize: '16px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    subtitle: {
      fontSize: '12px',
      marginTop: props.subtitle ? 72 : 'inherit',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    actionIcon: {
      order: actionPos === 'left' ? -1 : 1,
    },
    childImg: {
      height: '100%',
      transform: 'translateX(-50%)',
      position: 'relative',
      left: '50%',
    },
  }
  return styles
}

class GridTile extends Component {
  static defaultProps = {
    titlePosition: 'bottom',
    titleBackground: 'rgba(0, 0, 0, 0.4)',
    titleHeight: 128,
    actionPosition: 'right',
    cols: 1,
    rows: 1,
    containerElement: 'div',
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  componentDidMount () {
    this.ensureImageCover()
  }

  componentDidUpdate () {
    this.ensureImageCover()
  }

  ensureImageCover () {
    let imgEl = this.refs.img

    if (imgEl) {
      const fit = () => {
        if (imgEl.offsetWidth < imgEl.parentNode.offsetWidth) {
          const { isRtl } = this.context.muiTheme
          imgEl.style.height = 'auto'
          if (isRtl) {
            imgEl.style.right = '0'
          } else {
            imgEl.style.left = '0'
          }
          imgEl.style.width = '100%'
          imgEl.style.top = '50%'
          imgEl.style.transform = imgEl.style.WebkitTransform = 'translateY(-50%)'
        }
        imgEl.removeEventListener('load', fit)
        imgEl = null // prevent closure memory leak
      }
      if (imgEl.complete) {
        fit()
      } else {
        imgEl.addEventListener('load', fit)
      }
    }
  }

  render () {
    const {
      title,
      subtitle,
      titlePosition, // eslint-disable-line no-unused-vars
      titleBackground, // eslint-disable-line no-unused-vars
      titleHeight,
      titleStyle,
      subtitleStyle,
      actionIcon, // eslint-disable-line no-unused-vars
      actionPosition, // eslint-disable-line no-unused-vars
      style,
      children,
      containerElement,
      ...other
    } = this.props

    const { prepareStyles } = this.context.muiTheme
    const styles = getStyles(this.props, this.context)
    const mergedRootStyles = Object.assign(styles.root, style)

    let titleBar = null

    if (title) {
      titleBar = (
        <div key='titlebar' style={prepareStyles(styles.titleBar)}>
          <div style={prepareStyles(styles.titleWrap)}>
            <div style={prepareStyles(Object.assign(styles.title, titleStyle))}>
              {title}
            </div>
            {subtitle ? (
              <div style={prepareStyles(Object.assign(styles.subtitle, subtitleStyle))}>
                {subtitle}
              </div>
            ) : null}
          </div>
          {actionIcon ? (
            <div style={prepareStyles(styles.actionIcon)}>
              {actionIcon}
            </div>
          ) : null}
        </div>
      )
    }

    let newChildren = children

    // if there is a single image passed as children
    // clone it and add our styles
    if (React.Children.count(children) === 1) {
      newChildren = React.Children.map(children, (child) => {
        if (child.type === 'img') {
          return React.cloneElement(child, {
            key: 'img',
            ref: 'img',
            style: prepareStyles(Object.assign({}, styles.childImg, child.props.style)),
          })
        } else {
          return child
        }
      })
    }

    const containerProps = {
      className: 'gridTileContentContainer',
      style: prepareStyles(mergedRootStyles),
      ...other,
    }

    return React.isValidElement(containerElement)
      ? React.cloneElement(containerElement, containerProps, [newChildren, titleBar])
      : React.createElement(containerElement, containerProps, [newChildren, titleBar])
  }
}

export default GridTile
