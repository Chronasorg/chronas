import React from 'react'
import {
  XAxis,
  YAxis,
  FlexibleWidthXYPlot,
  HorizontalGridLines,
  GradientDefs,
  AreaSeries,
  LineSeries,
  VerticalRectSeries,
  Crosshair
} from 'react-vis'

export default class InfluenceChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      crosshairValues: [],
      currentYearMarkerValues: [],
      series: [],
      sortedData: []
    }
    this.__mouseClick = this._mouseClick.bind(this)
    this._nearestXHandler = this._nearestXHandler.bind(this)
    this._mouseLeaveHandler = this._mouseLeaveHandler.bind(this)
    this._formatCrosshairItems = this._formatCrosshairItems.bind(this)
    this._formatCrosshairTitle = this._formatCrosshairTitle.bind(this)
  }

  /**
   * Event handler for onNearestX.
   * @param {Object} value Selected value.
   * @param {number} index Index of the series.
   * @private
   */
  _nearestXHandler (value, { event, innerX, index }) {
    const { series } = this.state
    this.setState({
      crosshairValues: series.map(s => s.data[index])
    })
  }

  /**
   * Event handler for onMouseLeave.
   * @private
   */
  _mouseLeaveHandler () {
    this.setState({ crosshairValues: [] })
  }

  _mouseClick (value,e) {
    console.debug('_mouseClick',value,e)
  }

  /**
   * Format the title line of the crosshair.
   * @param {Array} values Array of values.
   * @returns {Object} The caption and the value of the title.
   * @private
   */
  _formatCrosshairTitle (values) {
    return {
      title: 'Year',
      value: values[0].left
    }
  }

  /**
   * A callback to format the crosshair items.
   * @param {Object} values Array of values.
   * @returns {Array<Object>} Array of objects with titles and values.
   * @private
   */
  _formatCrosshairItems (values) {
    const { series } = this.state
    return values.map((v, i) => {
      return {
        title: series[i].title,
        value: v.top
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.newData.data && (nextProps.newData || {}).id !== (this.props.newData || {}).id || nextProps.selectedYear !== this.props.selectedYear) {
      const { selectedYear} = nextProps

      const currentYearMarkerValues = nextProps.newData.data.map((s) => {
        const nearestYear = s.data.map(y => +y.left).reduce(function(prev, curr) {
          return (Math.abs(+curr - +selectedYear) < Math.abs(+prev - +selectedYear) ? +curr : +prev)
        }).toString()
        return {
          left: selectedYear,
          top: s.data.filter(f => f.left ===  nearestYear)[0].top }
      })

      this.setState({
        sortedData: nextProps.newData.data[0].data.map((el) => { if (!isNaN(el.left)) return el.left }).sort((a, b) => +a - +b),
        series: nextProps.newData.data,
        currentYearMarkerValues
      })
    }
  }

  render () {
    const { series, crosshairValues, currentYearMarkerValues, sortedData } = this.state
    const { rulerProps, selectedYear} = this.props

    if (!sortedData || sortedData.length === 0) return null

    const entityColor = (rulerProps || {})[1] || 'grey'
    return (
      <div>
        <div className='influenceChart'>
          <FlexibleWidthXYPlot
            animation
            getX={d => d.left}
            getY={d => d.top}
            onClick={this._mouseClick}
            onValueClick={this._mouseClick}
            onMouseLeave={this._mouseLeaveHandler}
            xDomain={[sortedData[0], sortedData[sortedData.length - 1]]}
            height={200}>
            <HorizontalGridLines />
            <GradientDefs>
              <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={entityColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor="white" stopOpacity={0.3} />
              </linearGradient>
            </GradientDefs>
            <YAxis
              orientation='left' title='Population'
              className='cool-custom-name'
              tickSizeInner={0}
              tickSizeOuter={8}
            />
            <XAxis
              className='even-cooler-custom-name'
              tickSizeInner={0}
              tickSizeOuter={8}
            />
            <LineSeries
              onSeriesMouseOver={this._mouseClick}
              onclick={(val, event) => {
                console.debug('line click', val, event)
                // does something on click
                // you can access the value of the event
              }}
              onSeriesClick={(event) => {
                console.debug('line click', event, event.value)
                // does something on click
                // you can access the value of the event
              }}
              color={entityColor}
              data={series[2].data}
              curve='curveMonotoneX'
              onNearestX={this._nearestXHandler} />
            <AreaSeries
              onValueClick={this._mouseClick}
              onSeriesClick={(event) => {
                console.debug('area click', event, event.value)
                // does something on click
                // you can access the value of the event
              }}
              color={'url(#CoolGradient)'}
              curve='curveMonotoneX'
              onNearestX={this._nearestXHandler}
              data={series[2].data}
            />
            <Crosshair
              itemsFormat={this._formatCrosshairItems}
              titleFormat={this._formatCrosshairTitle}
              values={crosshairValues} />
            <Crosshair
              className='currentYearMarker'
              itemsFormat={this._formatCrosshairItems}
              titleFormat={this._formatCrosshairTitle}
              values={currentYearMarkerValues} />
          </FlexibleWidthXYPlot>
        </div>
      </div>
    )
  }
}
