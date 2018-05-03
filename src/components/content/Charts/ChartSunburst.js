import React from 'react'
import { Sunburst, LabelSeries, Treemap, } from 'react-vis'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import nest from './utilsNest'

const LABEL_STYLE = {
  fontSize: '14px',
  textAnchor: 'middle'
}

const fullRadian = Math.PI * 2

const MODE = [
  'circlePack',
  'partition'
]

/*
whiteSpace: 'nowrap',
textOverflow: 'ellipsis',
overflow: 'hidden'
*/

/**
 * Recursively modify data depending on whether or not each cell has been selected by the hover/highlight
 * @param {Object} data - the current node being considered
 * @param {Object|Boolean} keyPath - a map of keys that are in the highlight path
 * if this is false then all nodes are marked as selected
 * @returns {Object} Updated tree structure
 */
function updateData (data, keyPath) {
  if (data.children) {
    data.children.map(child => updateData(child, keyPath))
  }
  // add a fill to all the uncolored cells
  if (!data.hex) {
    data.style = {
      fill: 'red'// dynamic colors later
    }
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
  }

  return data
}

export default class ChartSunburst extends React.Component {
  state = {
    pathValue: false,
    data: {},
    finalValue: 'SUNBURST',
    clicked: false,
    total: 1,
    modeIndex: -1,
    isMinimized: false
  }

  getKeyPath = (node) => {
    if (!node.parent) {
      return [this.props.selectedEntity || '']
    }

    const dataValue = node.data && node.data.name || node.name
    const dataColor = node.data && node.data.hex || node.hex
    return ['<span style="color: ' + dataColor + '" >' + dataValue + '</span>'].concat(this.getKeyPath(node.parent))
  }

  componentWillReceiveProps (nextProps) {
    const { activeAreaDim } = this.props

    if (nextProps.preData && nextProps.preData.length > 0 || nextProps.selectedYear !== this.props.selectedYear) {
      const { preData } = nextProps
      if (!preData || preData.length === 0) return

      const groupBys = ['ruler', 'religionGeneral', 'religion', 'culture']

      let sunBurstDataPartial = nest()
      groupBys.forEach((dim) => {
        if (activeAreaDim.indexOf(dim) === -1)
          sunBurstDataPartial = sunBurstDataPartial.key(function (d) { return d[dim] })
      })
      this.setState({
        data: {
          'children': sunBurstDataPartial
            .meta((preData || {})[1] || {})
            .entries((preData || {})[0] || {})
        },
        total: preData[0].reduce((a, b) => { return (+a || 0) + (b.size || 0) })
      })
    }
  }

  _countSize = (obj, key, out) => {
    var i,
      proto = Object.prototype,
      ts = proto.toString,
      hasOwn = proto.hasOwnProperty.bind(obj)

    if (ts.call(out) !== '[object Array]') out = []

    for (i in obj) {
      if (hasOwn(i)) {
        if (i === key && i === 'parent') {
          out.push(obj[i])
        } else if (ts.call(obj[i]) === '[object Array]' || ts.call(obj[i]) === '[object Object]') {
          this._countSize(obj[i], key, out)
        }
      }
    }

    return out
  }

  _minimize = () => {
    this.setState({ isMinimized: true })
  }

  _maximize = () => {
    this.setState({ isMinimized: false })
  }

  _updateModeIndex = (increment) => {
    console.debug('update chart mode')
    const newIndex = this.state.modeIndex + (increment ? 1 : -1)
    const modeIndex = newIndex < -1 ? MODE.length - 1 : newIndex >= MODE.length ? -1 : newIndex
    this.setState({ modeIndex })
  }

  _handleMouseOver = node => {
    const { clicked, modeIndex } = this.state
    const { angle, angle0 } = node
    if (clicked) {
      return
    }

    const path = this.getKeyPath(node).reverse()

    if (modeIndex === -1) {
      const pathAsMap = path.reduce((res, row) => {
        res[row] = true
        return res
      }, {})

      this.setState({
        finalValue: path[path.length - 1],
        pathValue: path.join(' > ') + ' (' + Math.round((angle - angle0) / fullRadian * 1000) / 10 + '%)',
        data: updateData(this.state.data, pathAsMap)
      })
    } else {
      const pathAsMap = path.reduce((res, row) => {
        res[row] = true
        return res
      }, {})
      this.setState({
        pathValue: path.join(' > '),
        data: updateData(this.state.data, pathAsMap)
      })
    }
  }

  render () {
    const { clicked, data, finalValue, pathValue, isMinimized, modeIndex } = this.state

    const chartProps = {
      animation: {
        damping: 9,
        stiffness: 300
      },
      data: data,
      onLeafMouseOver: this._handleMouseOver,
      onLeafMouseOut: () => this.setState({ pathValue: '' }),
      onLeafClick: (n) => { console.debug('gorandom'); this.props.selectAreaItemWrapper('random') },
      height: 400,
      mode: MODE[modeIndex],
      getLabel: (modeIndex === -1) ? () => '' : x => x.name,
      width: 450,
      colorType: 'literal',
      getSize: d => d.size,
      getColor: (d) => { return d.hex },
      style: {
        stroke: '#ddd',
        strokeOpacity: 0.3,
        strokeWidth: '0.5'
      },
      hideRootNode: true,
      onValueMouseOver: this._handleMouseOver,
      onValueMouseOut: () => clicked ? () => {} : this.setState({
        pathValue: false,
        finalValue: false,
        data: updateData(this.state.data, false)
      }),
      onValueClick: (node) => {
        this.setState({ clicked: !clicked })
      }

    }
    // var thisIsMyCopy = (
    //   <p>copy copy copy <strong>strong copy</strong></p>
    // );
    var thisIsMyCopy = (
      pathValue
    )

    return (

      <Paper zDepth={3} style={{
        position: 'fixed',
        left:  (isMinimized ? '-103px' : '-508px'),
        top: '64px',
        padding: '1em',
        transition: 'all .2s ease-in-out',
        width: (isMinimized ? '95' : '500px'),
        height: (isMinimized ? '95px' : '524px'),
        overflow: 'hidden'
      }}>
        <AppBar
          title={<span>Composition <span style={{ fontSize: '12px', color: '#06060669' }}>{this.state.total} subjects</span></span>}
          iconElementLeft={<div />}
          iconElementRight={this.state.isMinimized
            ? <IconButton style={{ left: '-9px' }} onClick={() => this._maximize()}><CompositionChartIcon /></IconButton>
            : <IconButton onClick={() => this._minimize()}><ChevronRight /></IconButton>}
        />
        { !isMinimized && (modeIndex === -1) && <Sunburst {...chartProps}>

          { finalValue &&  <div style={{
            textShadow: 'black 1px 0px 1px',
            position: 'absolute',
            left: 122,
            top: 190,
            width: 200,
            textAlign: 'center'
          }} dangerouslySetInnerHTML={{__html: finalValue}}></div>
          }
        </Sunburst>}
        { !isMinimized && (modeIndex !== -1) && <Treemap {...chartProps} /> }

        <FlatButton
          style={{
            position: 'relative',
            top: '-400px',
            left: '301px'
          }}
          label='SWITCH CHART' onClick={() => this._updateModeIndex(true)}
        />
        <div style={{
          width: '450px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          marginTop: '-25px',
          textOverflow: 'ellipsis',
        }}>
          { pathValue &&  <div style={{textShadow: 'black 1px 0px 1px'}} dangerouslySetInnerHTML={{__html: pathValue}}></div>
          }
        </div>
      </Paper>
    )
  }
}
