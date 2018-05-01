import React from 'react'

import { Sunburst, LabelSeries } from 'react-vis'
import { EXTENDED_DISCRETE_COLOR_RANGE } from '../../styles/chronasColors'

const LABEL_STYLE = {
  fontSize: '18px',
  textAnchor: 'middle'
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
      fill: EXTENDED_DISCRETE_COLOR_RANGE[5]
    }
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
  }

  return data
}


const decoratedData = updateData({
  "children": [
    {
      "name": "analytics",
      "hex": "#12939A",
      "children": [
        {
          "name": "cluster",
          "children": [
            {"name": "AgglomerativeCluster", "hex": "#12939A", "size": 3938},
            {"name": "CommunityStructure", "hex": "#12939A", "size": 3812},
            {"name": "HierarchicalCluster", "hex": "#12939A", "size": 6714},
            {"name": "MergeEdge", "hex": "#12939A", "size": 743}
          ]
        },
        {
          "name": "graph",
          "children": [
            {"name": "BetweennessCentrality", "hex": "#12939A", "size": 3534},
            {"name": "LinkDistance", "hex": "#12939A", "size": 5731},
            {"name": "MaxFlowMinCut", "hex": "#12939A", "size": 7840},
            {"name": "ShortestPaths", "hex": "#12939A", "size": 5914},
            {"name": "SpanningTree", "hex": "#12939A", "size": 3416}
          ]
        },
        {
          "name": "optimization",
          "children": [
            {"name": "AspectRatioBanker", "hex": "#12939A", "size": 7074}
          ]
        }
      ]
    },
    {
      "name": "animate",
      "children": [
        {"name": "Easing", "hex": "#12939A", "size": 17010},
        {"name": "FunctionSequence", "hex": "#12939A", "size": 5842},
        {
          "name": "interpolate",
          "children": [
            {"name": "ArrayInterpolator", "hex": "#12939A", "size": 1983},
            {"name": "ColorInterpolator", "hex": "#12939A", "size": 2047},
            {"name": "DateInterpolator", "hex": "#12939A", "size": 1375},
            {"name": "Interpolator", "hex": "#12939A", "size": 8746},
            {"name": "MatrixInterpolator", "hex": "#12939A", "size": 2202},
            {"name": "NumberInterpolator", "hex": "#12939A", "size": 1382},
            {"name": "ObjectInterpolator", "hex": "#12939A", "size": 1629},
            {"name": "PointInterpolator", "hex": "#12939A", "size": 1675},
            {"name": "RectangleInterpolator", "hex": "#12939A", "size": 2042}
          ]
        },
        {"name": "ISchedulable", "hex": "#12939A", "size": 1041},
        {"name": "Parallel", "hex": "#12939A", "size": 5176},
        {"name": "Pause", "hex": "#12939A", "size": 449},
        {"name": "Scheduler", "hex": "#12939A", "size": 5593},
        {"name": "Sequence", "hex": "#12939A", "size": 5534},
        {"name": "Transition", "hex": "#12939A", "size": 9201},
        {"name": "Transitioner", "hex": "#12939A", "size": 19975},
        {"name": "TransitionEvent", "hex": "#12939A", "size": 1116},
        {"name": "Neonate", "hex": "#12939A", "size": 6006}
      ]
    },
  ]
}, false)


export default class ChartSunburst extends React.Component {
  state = {
    pathValue: false,
    data: decoratedData,
    finalValue: 'SUNBURST',
    clicked: false
  }


  getKeyPath = (node) => {
    if (!node.parent) {
      return [this.props.selectedEntity || '']
    }

    return [node.data && node.data.name || node.name].concat(this.getKeyPath(node.parent))
  }

  render () {
    const { clicked, data, finalValue, pathValue } = this.state
    return (
      <div className='sunburst'>
        <Sunburst
          animation={{damping: 20, stiffness: 300}}
          hideRootNode
          onValueMouseOver={node => {
            if (clicked) {
              return;
            }
            const path = this.getKeyPath(node).reverse();
            const pathAsMap = path.reduce((res, row) => {
              res[row] = true;
              return res;
            }, {});
            this.setState({
              finalValue: path[path.length - 1],
              pathValue: path.join(' > '),
              data: updateData(decoratedData, pathAsMap)
            });
          }}
          onValueMouseOut={() => clicked ? () => {} : this.setState({
            pathValue: false,
            finalValue: false,
            data: updateData(decoratedData, false)
          })}
          onValueClick={() => this.setState({clicked: !clicked})}
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
      </Sunburst>
        <div className='basic-sunburst-example-path-name'>{pathValue}</div>
      </div>
    )
  }
}
