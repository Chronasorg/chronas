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
      series: []
    }
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
  _nearestXHandler (value, { index }) {
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

  /**
   * Format the title line of the crosshair.
   * @param {Array} values Array of values.
   * @returns {Object} The caption and the value of the title.
   * @private
   */
  _formatCrosshairTitle (values) {
    return {
      title: 'X',
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
    if ((nextProps.newData || {}).id !== (this.props.newData || {}).id) {
      this.setState({
        series: nextProps.newData.data
      })
    }
  }

  render () {
    const { series, crosshairValues } = this.state
    const { rulerProps, selectedYear} = this.props

    if (series.length === 0) return null

    const sortedData = series[0].data.map((el) => { if (!isNaN(el.left)) return el.left }).sort((a, b) => +a - +b)
    return (
      <div>
        <div className='influenceChart'>
          <FlexibleWidthXYPlot
            animation
            getX={d => d.left}
            getY={d => d.top}
            onMouseLeave={this._mouseLeaveHandler}
            xDomain={[sortedData[0], sortedData[sortedData.length - 1]]}
            height={200}>
            <HorizontalGridLines />
            <GradientDefs>
              <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={rulerProps[1]} stopOpacity={0.8}/>
                <stop offset="100%" stopColor="white" stopOpacity={0.3} />
              </linearGradient>
            </GradientDefs>
            <YAxis
              orientation='left' title='Provinces'
              className='cool-custom-name'
              tickSizeInner={0}
              tickSizeOuter={8}
            />
            <YAxis
              orientation='right' title='World population share'
              className='cool-custom-name'
              tickSizeInner={0}
              tickSizeOuter={8}
            />
            <XAxis
              className='even-cooler-custom-name'
              tickSizeInner={0}
              tickSizeOuter={8}
            />
            <VerticalRectSeries
              data={series[0].data.map(({ left, top }) => ({ x0: left - 0.5, left: left + 0.5, top }))}
              stroke='white'
              onNearestX={this._nearestXHandler}
              {...(series[0].disabled ? { opacity: 0.2 } : null)} />
            <LineSeries
              data={series[1].data}
              curve='curveMonotoneX'
              {...(series[1].disabled ? { opacity: 0.2 } : null)} />
            <AreaSeries
              color={'url(#CoolGradient)'}
              data={series[1].data}
            />
            <Crosshair
              itemsFormat={this._formatCrosshairItems}
              titleFormat={this._formatCrosshairTitle}
              values={crosshairValues} />
            <Crosshair
              className='currentYearMarker'
              // itemsFormat={this._formatCrosshairItems}
              // titleFormat={this._formatCrosshairTitle}
              values={[
                {left: selectedYear, top: 93},
                {left: selectedYear, top: 93},
                {left: selectedYear, top: 93}]} />
          </FlexibleWidthXYPlot>
        </div>
      </div>
    )
  }
}
