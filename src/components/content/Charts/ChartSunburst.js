import React from 'react'
import { Sunburst, LabelSeries, Treemap,  } from 'react-vis'
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import nest from './utilsNest'

const LABEL_STYLE = {
  fontSize: '14px',
  textAnchor: 'middle'
}

const fullRadian = Math.PI*2

const MODE = [
  'circlePack',
  'partition',
  'partition-pivot',
  'squarify',
  'resquarify',
  'slice',
  'dice',
  'slicedice',
  'binary'
];

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


const decoratedData = updateData({
}, false)


export default class ChartSunburst extends React.Component {
  state = {
    pathValue: false,
    data: decoratedData,
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

    return [node.data && node.data.name || node.name].concat(this.getKeyPath(node.parent))
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      data: {
        "children": nest()
      .key(function(d) { return d.religionGeneral; })
      .key(function(d) { return d.religion; })
      .key(function(d) { return d.culture; })
      // .key(function(d) { return d.province; })
      .meta((nextProps.preData || {})[1] || {})
      .entries((nextProps.preData || {})[0] || {})
      },
      total: nextProps.preData[0].reduce((a,b) => { return (+a || 0) + (b.size || 0) })
    })
  }

  _countSize = (obj, key, out) => {
    var i,
      proto = Object.prototype,
      ts = proto.toString,
      hasOwn = proto.hasOwnProperty.bind(obj);

    if ('[object Array]' !== ts.call(out)) out = [];

    for (i in obj) {
      if (hasOwn(i)) {
        if (i === key && i === 'parent') {
          out.push(obj[i])
        } else if ('[object Array]' === ts.call(obj[i]) || '[object Object]' === ts.call(obj[i])) {
          this._countSize(obj[i], key, out);
        }
      }
    }

    return out;
  }

  _minimize = () => {
    this.setState({ isMinimized: true })
  }

  _maximize = () => {
    this.setState({ isMinimized: false })
  }

  _updateModeIndex = (increment) => {
    console.debug('update chart mode')
    const newIndex = this.state.modeIndex + (increment ? 1 : -1);
    const modeIndex = newIndex < -1 ? MODE.length - 1 : newIndex >= MODE.length ? -1 : newIndex;
    this.setState({modeIndex});
  }

  render () {
    const { clicked, data, finalValue, useCirclePacking, pathValue, isMinimized, modeIndex } = this.state
    const { preData } = this.props

    const chartProps = {
      animation: {
        damping: 9,
        stiffness: 300
      },
      data: data,
      onLeafMouseOver: x => this.setState({hoveredNode: x}),
      onLeafMouseOut: () => this.setState({hoveredNode: false}),
      onLeafClick: (n) => console.debug('clicked on ',n),
      height: 300,
      mode: MODE[modeIndex],
      getLabel: x => x.name,
      width: 350,
      colorType: 'literal',
      getSize: d => d.size,
      getLabel: x => x.name,
      getColor: (d) => { /*console.debug(d);*/ return d.hex},
        style: {
        stroke: '#ddd',
          strokeOpacity: 0.3,
          strokeWidth: '0.5'
      }
    };

    return (

      <Paper zDepth={3} style={{
             position: 'fixed',
             left:  (isMinimized ? '-103px' : '-408px'),
             top: '64px',
             padding: '1em',
             transition: 'all .2s ease-in-out',
             width: (isMinimized ? '95' : '400px'),
             height: (isMinimized ? '95px' : '424px'),
             overflow: 'hidden'
           }}>
        <AppBar
          title={<span>Composition <span style={{fontSize: '12px', color: '#06060669'}}>{this.state.total} subjects</span></span>}
          iconElementLeft={<div></div>}
          iconElementRight={this.state.isMinimized ? <IconButton style={{ left: '-9px' }} onClick={() => this._maximize()}><CompositionChartIcon /></IconButton> :  <IconButton onClick={() => this._minimize()}><ChevronRight /></IconButton>}
        />
      { !isMinimized && (modeIndex === -1) && <Sunburst
          animation={{damping: 20, stiffness: 300}}
          hideRootNode
          onValueMouseOver={node => {
            const { angle, angle0 } = node
            if (clicked) {
              return;
            }
            let partialCount = 0
            const path = this.getKeyPath(node).reverse();
            const pathAsMap = path.reduce((res, row) => {
              res[row] = true;
              return res;
            }, {});

            this.setState({
              finalValue: path[path.length - 1],
              pathValue: path.join(' > ') + ' (' + Math.round((angle-angle0)/fullRadian * 1000) / 10 + '%)',
              data: updateData(this.state.data, pathAsMap)
            });
          }}
          onValueMouseOut={() => clicked ? () => {} : this.setState({
            pathValue: false,
            finalValue: false,
            data: updateData(this.state.data, false)
          })}
          onValueClick={(node) => {
          this.setState({clicked: !clicked})
          }}
          data={data}
          colorType={'literal'}
          getSize={d => d.size}
          getColor={(d) => { /*console.debug(d);*/ return d.hex} }
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          height={300}
          width={350}>
          {finalValue && <LabelSeries data={[
            {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
          ]} />}
      </Sunburst>}
        { !isMinimized && (modeIndex !== -1) &&  <Treemap {...chartProps}/>}

        <FlatButton
          style={{
            position: 'relative',
            top: '-300px',
            left: '251px'
          }}
          label="SWITCH CHART"
                    onClick={() => this._updateModeIndex(true).bind(this)}
        />
        <div style={{
          width: '350px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          paddingTop: '4px',
          textOverflow: 'ellipsis',
        }}>{pathValue}</div>
      </Paper>
    )
  }
}
