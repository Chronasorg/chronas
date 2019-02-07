import React from 'react'
import { Sunburst, Treemap, } from 'react-vis'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import nest from './utilsNest'
import { themes } from '../../../properties'

const LABEL_STYLE = {
  fontSize: '14px',
  textAnchor: 'middle'
}

const fullRadian = Math.PI * 2

const MODE = [
  'circlePack',
  'partition'
]

const styles = {
  chartContainer: {
    padding: '16px',
    // backgroundColor: 'rgba(255,255,255,0.7)'
  }
}

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
    cursor: 'pointer',
  }
  data.opacity = keyPath && !keyPath[data.name] ? 0.4 : 1

  return data
}

const defaultPathValue = (translate) => '<span style="font-style: italic">' + translate("chartSunburst.hoverClickItems") + '</span>'

export default class ChartSunburst extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathValue: defaultPathValue(props.translate),
      data: {},
      finalValue: 'hover/ click items',
      total: 1,
      modeIndex: -1
    }
  }

  getKeyPath = (node) => {
    if (!node.parent) {
      return // [this.props.selectedEntity]
    }

    const dataValue = node.data && node.data.name || node.name
    const dataColor = node.data && node.data.hex || node.hex

    if (!node.parent.parent) {
      return [[dataValue, dataColor]]
    } else {
      return [[dataValue, dataColor]].concat(this.getKeyPath(node.parent))
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
    this.props.setContentMenuItem('')
  }
  _updateModeIndex = (increment) => {
    const newIndex = this.state.modeIndex + (increment ? 1 : -1)
    const modeIndex = newIndex < -1 ? MODE.length - 1 : newIndex >= MODE.length ? -1 : newIndex
    this.setState({ modeIndex })
  }
  _handleMouseOver = node => {
    const { modeIndex } = this.state
    const { angle, angle0 } = node

    const path = this.getKeyPath(node).reverse()

    const pathAsMap = path.map((el) => (el[0])).reduce((res, row) => {
      res[row] = true
      return res
    }, {})

    this.setState({
      finalValue: '<span style="color: ' + path[path.length - 1][1] + '" >' + path[path.length - 1][0] + '</span>',
      pathValue: path.map((el) => ('<span style="color: ' + el[1] + '" >' + el[0] + '</span>')).join(' > ') + (modeIndex === -1 ? ' (' + Math.round((angle - angle0) / fullRadian * 1000) / 10 + '%)' : ''),
      data: updateData(this.state.data, pathAsMap)
    })
  }

  componentWillReceiveProps (nextProps) {
    const { activeAreaDim } = this.props

    if (!nextProps.isMinimized && (nextProps.preData && nextProps.preData.length > 0 || nextProps.selectedYear !== this.props.selectedYear)) {
      const { preData } = nextProps
      if (!preData || preData.length === 0) return

      const groupBys = ['ruler', 'religionGeneral', 'religion', 'culture']

      let sunBurstDataPartial = nest()
      groupBys.forEach((dim) => {
        if (activeAreaDim.indexOf(dim) === -1) {
          const newSunBurstDataPartial = sunBurstDataPartial.key(function (d) {
            return d[dim]
          })
          if (newSunBurstDataPartial) sunBurstDataPartial = newSunBurstDataPartial
        }
      })
      this.setState({
        data: {
          'children': sunBurstDataPartial
            .meta((preData || {})[1] || {})
            .entries((preData || {})[0] || {})
        },
        total: preData[0].reduce((a, b) => {
          return (+a || 0) + (b.size || 0)
        }, 0)
      })
    }
  }

  render () {
    const { isMinimized, theme, translate } = this.props
    const { data, finalValue, pathValue, modeIndex } = this.state

    const chartProps = (isMinimized) ? false : {
      animation: {
        damping: 9,
        stiffness: 300
      },
      data: data,
      onLeafClick: (node) => {
        const wikiEntity = node.wiki || node.data.wiki
        if (wikiEntity) this.props.setWikiId(wikiEntity)
      },
      height: 380,
      mode: MODE[modeIndex],
      getLabel: (modeIndex === -1) ? () => '' : x => x.name,
      width: 450,
      colorType: 'literal',
      getSize: d => d.size,
      getColor: (d) => {
        return d.hex
      },
      style: {
        stroke: '#ddd',
        strokeOpacity: 0.3,
        strokeWidth: '0.5',

      },
      hideRootNode: true,
      onValueMouseOver: this._handleMouseOver,
      onValueMouseOut: () => this.setState({
        pathValue: defaultPathValue(translate),
        finalValue: false,
        data: updateData(this.state.data, false)
      }),
      onLeafMouseOver: this._handleMouseOver,
      onLeafMouseOut: () => this.setState({
        pathValue: defaultPathValue(translate),
        finalValue: false,
        data: updateData(this.state.data, false)
      }),
      onValueClick: (node) => {
        const wikiEntity = node.wiki || (node.data && node.data.wiki)
        const isProvince = node.isProvince || (node.data && node.isProvince)
        const provName = node.name || (node.data && node.data.name)
        if (wikiEntity) {
          this.props.setWikiId(wikiEntity)
          if (isProvince) {
            this.props.selectValue(provName)
          }
        }
      }
    }

    return (
      <Paper zDepth={3} style={{
        position: 'fixed',
        left: (isMinimized ? '-52px' : '-574px'),
        top: '4px',
        zIndex: 2147483647,
        padding: '0em',
        transition: 'all .3s ease-in-out',
        background: (isMinimized ? 'white' : themes[theme].backColors[1]),
        width: (isMinimized ? '30px' : '500px'),
        height: (isMinimized ? '30px' : '524px'),
        pointerEvents: (isMinimized ? 'none' : 'inherit'),
        opacity: (isMinimized ? '0' : 'inherit'),
        overflow: 'hidden'
      }}>
        <AppBar
          style={
            {
              marginBottom: 20,
              transition: 'all .5s ease-in-out',
              background: themes[theme].backColors[0],
              boxShadow: 'rgba(0, 0, 0, 0.4) -1px 2px 3px 1px'
            }
          }
          title={<span style={{ color: themes[theme].foreColors[0] }}>{translate('chartSunburst.breakdownTitle', { dontTranslate: this.state.total })}</span>}
          iconElementLeft={<div />}
          iconElementRight={this.state.isMinimized
            ? <IconButton style={{ left: '-9px' }} onClick={() => this._maximize()}><CompositionChartIcon
              color={themes[theme].foreColors[0]} hoverColor={themes[theme].highlightColors[0]} /></IconButton>
            : <IconButton
              tooltipPosition='bottom-left'
              tooltip={'Minimize'} onClick={() => this._minimize()}><ChevronRight color={themes[theme].foreColors[0]}
                hoverColor={themes[theme].highlightColors[0]} /></IconButton>}
        />
        <div style={styles.chartContainer}>
          {!isMinimized && (modeIndex === -1) && <Sunburst {...chartProps}>

            {finalValue && <div style={{
              textShadow: 'black 1px 0px 1px',
              position: 'absolute',
              left: 123,
              top: 178,
              width: 200,
              textAlign: 'center'
            }} dangerouslySetInnerHTML={{ __html: finalValue }} />
            }
          </Sunburst>}
          {!isMinimized && (modeIndex !== -1) && <Treemap {...chartProps} />}
        </div>
        <FlatButton
          style={{
            color: themes[theme].foreColors[0],
            position: 'relative',
            top: '-418px',
            left: '352px'
          }}
          label={translate('chartSunburst.switchChart')} onClick={() => this._updateModeIndex(true)}
        />
        <div style={{
          width: '450px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: '-42px',
          marginLeft: '1em',
        }}>
          {pathValue && <div dangerouslySetInnerHTML={{ __html: pathValue }} />
          }
        </div>
      </Paper>
    )
  }
}
