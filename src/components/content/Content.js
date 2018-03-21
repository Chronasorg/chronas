import React from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import { toggleRightDrawer as toggleRightDrawerAction } from './actionReducers'
import { TYPE_AREA, TYPE_MARKER } from '../map/actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import utils from '../map/utils/general'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    padding: '8px 4px',
  },
  iframe: {
    display: 'block',
    padding: '2px 8px',
    border: 'none'
  }
}

const Content = (props) => {
  let selectedWiki = ''

  if (props.selectedItem.type === TYPE_AREA) {
    const selectedProvince = props.selectedItem.id
    const activeAreaDim = (props.activeArea.color === 'population') ? 'capital' : props.activeArea.color
    const activeprovinceDim = (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]

    selectedWiki = (activeAreaDim === 'religionGeneral')
      ? (props.metadata[activeAreaDim][(props.metadata.religion[activeprovinceDim] || [])[3]] || {})[2]
      : (activeAreaDim === 'province' || activeAreaDim === 'capital')
        ? (props.metadata[activeAreaDim][activeprovinceDim] || {})
        : (props.metadata[activeAreaDim][activeprovinceDim] || {})[2]
  }
  else if (props.selectedItem.type === TYPE_MARKER) {
    const selectedMarker = props.selectedItem.id
    selectedWiki = props.selectedItem.wiki
  }

  return <div style={styles.main}><iframe style={styles.iframe} src={'http://en.wikipedia.org/wiki/' + selectedWiki + '?printable=yes'}
    height='100%' frameBorder='0' /></div>
}
// = ({ toggleRightDrawer, hasDashboard, selectedItem, onRightTap, resources, translate }) => (
Content.propTypes = {
  translate: PropTypes.func.isRequired,
}

Content.defaultProps = {
  onContentTap: () => null,
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    selectedItem: state.selectedItem,
    activeArea: state.activeArea,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
  }),
  pure,
  translate,
)

export default enhance(Content)
