import React from 'react'
import ReactDOM from 'react-dom'
import Timeline from 'react-visjs-timeline'
import ArticleIframe from './ArticleIframe'

const start = '0000-01-01',
  min = '-002000-01-01T00:00:00.000Z',
  max = '2017-01-01'

const styles = {
  stepLabel: {
    fontWeight: 'bold',
    background: '#9e9e9e',
    padding: ' 5px',
    borderRadius: '15px',
    color: 'white',
    marginLeft: '-5px',
    // whiteSpace: 'nowrap'
  },
  stepContainer: {
    // display: flex;
    // flex-direction: row;
    // justify-content: flex-start;
    // height: %;
    // padding: 8px 4px;
    // whiteSpace: 'nowrap',
    // textOverflow: 'ellipsis',
    // overflow: 'hidden'
  },
  iframe: {
    width: '100%',
    height: '100%'
    // position: 'fixed',
    // right: 0,
    // width: '100%',
    // height: 'calc(100% - 128px)',
  },
  navButtons: {
    marginTop:'12px',
    right: '28px',
    bottom: '10px',
    position: 'fixed'
  },
  navTitle: {
    marginTop:'12px',
    left: 'calc(20% + 4px)',
    bottom: '10px',
    position: 'fixed'
  }
}
class ProvinceTimeline extends React.Component {
  state = {
    selectedWiki: null,
    stepIndex: 0,
    timelineOptions: {
      width: '100%',
      height: '326px',
      zoomMin: 315360000000,
      min: min,
      max: max,
      start: start,
      stack: false,
      showCurrentTime: false,
      tooltip: {
        followMouse: true
      }
      // showMajorLabels: false
    },
    customTimes: {
      selectedYear: new Date()
    },
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
  }

  componentDidMount () {
    // Hack for issue https://github.com/Lighthouse-io/react-visjs-timeline/issues/40
    ReactDOM.findDOMNode(this).children[0].style.visibility = 'visible'
    ReactDOM.findDOMNode(this).children[0].style.width = '100%'

    let timelineOptions = this.state.timelineOptions
    delete timelineOptions.start

    this.setState({ timelineOptions })
  }

  _onClickTimeline = (props, event) => {
    const wikiId = (props.group === 'capital') ? this.props.metadata[props.group][props.item.split("||")[2]] : this.props.metadata[props.group][props.item.split("||")[2]][2]
    this.setState({
      selectedWiki: wikiId
    })
  };

  componentWillReceiveProps (nextProps) {
    const { provinceEntity, metadata } = this.props

    const toSelect = metadata.province[nextProps.provinceEntity.id]
    const newWiki = (typeof toSelect === "object") ? toSelect[0] : toSelect

    if (this.state.selectedWiki !== newWiki) {
      this.setState({
        selectedWiki: (typeof toSelect === "object") ? toSelect[0] : toSelect
      })
    }
  }

  render () {
    const { timelineOptions, selectedWiki } = this.state
    const { activeArea, history, selectedItem, selectedYear, provinceEntity, metadata, deselectItem } = this.props
    const contentStyle = {
      padding: '8px 0px 0px 8px',
      height: '100%',
      display: 'block'
    }

    const provinceEntityData = (provinceEntity || {}).data || {}

    const groups = [{
      id: 'ruler',
      content: 'Ruler'},{
      id: 'religion',
      content: 'Religion'},{
      id: 'religionGeneral',
      content: 'Religion General'},{
      id: 'culture',
      content: 'Culture'},{
      id: 'capital',
      content: 'Capital'}
      ]

    const items = []

    Object.keys(provinceEntityData).forEach((key) => {
      provinceEntityData[key].forEach((item, index, array) => {
        if (key !== 'population')
        {
          const startYear = +Object.keys(item)[0],
            endYear = (index === array.length - 1) ? 2000 : +Object.keys(array[index + 1])[0],
            dimKey = Object.values(item)[0],
            itemTitle = (key === 'capital') ? dimKey : (metadata[key][dimKey] || {})[0]

          if (selectedWiki === null && activeArea.color === key && selectedYear > startYear && selectedYear < endYear) {
            this.setState({ selectedWiki: (metadata[key][dimKey] || {})[2] })
          }

          items.push({
            className: 'entityTimelineItem',
            start: new Date(new Date(0, 1, 1).setFullYear(startYear)),
            end: new Date(new Date(0, 1, 1).setFullYear(endYear)),  // end is optional
            content: itemTitle,
            id: key + "||" + index + "||" + dimKey,
            group: key,
            type: 'range',
            style: (key === 'capital') ? '' : 'background: ' + (metadata[key][dimKey] || {})[1],
            title: '<span style="color: red">' + itemTitle + '</span> ' + startYear + ' - ' + endYear + ' (' + (endYear - startYear) + ' years)'
          })
        }
      })
    })

    return (
      <div className="ProvinceTimeline" style={{ width: '100%', height: '100%', overflow: 'auto', display: 'inline-table' }}>
        <Timeline
          options={timelineOptions}
          customTimes={new Date(new Date(0, 1, 1).setFullYear(+selectedYear))}
          groups={groups}
          items={items}
          clickHandler={this._onClickTimeline.bind(this)}
        />
        <div style={contentStyle}>
          <ArticleIframe history={history} customStyle={{ ...styles.iframe, height: '100%' }} selectedWiki={ selectedWiki } selectedItem={ selectedItem } deselectItem={deselectItem} />
        </div>
      </div>
    )
  }
}

export default ProvinceTimeline
