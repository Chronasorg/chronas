import React, {createElement, PureComponent} from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { toggleMenuDrawer as toggleMenuDrawerAction } from './actionReducers'
import { themes } from '../../properties'

import Responsive from './Responsive'
import {translate} from "admin-on-rest";
import LayersContent from "./layers/LayersContent";
import CollectionsContent from "./collections/CollectionsContent";
import {history} from "../../store/createStore";

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class MenuDrawer extends PureComponent {
  handleClose = () => {
    this.props.toggleMenuDrawer('')
  }

  componentWillUnmount = () => {
    // console.debug('we are going down')
  }

  render () {
    const { menuDrawerOpen,  history, setMenuDrawerVisibility, translate, theme } = this.props

    return (
          <Drawer
            containerStyle={{
              overflow: 'none',
              width: 300,
              backgroundColor: themes[theme].backColors[0],
              paddingLeft: 56
            }} style={{ overflow: 'none', zIndex: 9 }} open={menuDrawerOpen}>
            <AppBar
              title={
                <span style={{
                  color: themes[theme].foreColors[0],
                  fontSize: 20
                }}
                >{translate((menuDrawerOpen === "layers") ? ("pos.layers") : ("collections.title"))}</span>
              }
              showMenuIconButton={false}
              style={{ backgroundColor: themes[theme].backColors[0], boxShadow: 'rgba(0, 0, 0, 0.4) 3px 6px 6px -3px' }}
              iconElementRight={
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={translate('aor.action.close')}
                  iconStyle={{ textAlign: 'right', fontSize: '12px', color: themes[theme].foreColors[0] }}
                  onClick={() => this.handleClose()}>
                  <FontIcon hoverColor={themes[theme].highlightColors[0]} style={{ color: themes[theme].foreColors[0] }}
                    className='fa fa-chevron-left' />
                </IconButton>
              }
            />
            {(menuDrawerOpen === 'layers') && createElement(LayersContent)}
            {(menuDrawerOpen === 'collections') && createElement(CollectionsContent, { history })}
          </Drawer>
    )
  }
}

const mapStateToProps = (state, props) => ({
  menuDrawerOpen: state.menuDrawerOpen,
  locale: state.locale, // force redraw on locale change
  theme: state.theme, // force redraw on theme changes
})

export default compose(
  connect(mapStateToProps, {
    toggleMenuDrawer: toggleMenuDrawerAction,
  }),
  translate,
)(MenuDrawer)
