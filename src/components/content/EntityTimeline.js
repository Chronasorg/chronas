import React from 'react'
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper'
import ChartSunburst from './Charts/ChartSunburst'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import compose from 'recompose/compose'
import { connect } from "react-redux"
import { setYear  as setYearAction} from '../map/timeline/actionReducers'
import { selectValue } from '../map/actionReducers'
import { WIKI_PROVINCE_TIMELINE} from '../map/actionReducers'
import InfluenceChart from "./Charts/ChartArea"

/**
 * Non-linear steppers allow users to enter a multi-step flow at any point.
 *
 * This example is similar to the regular horizontal stepper, except steps are no longer
 * automatically set to `disabled={true}` based on the `activeStep` prop.
 *
 * We've used the `<StepButton>` here to demonstrate clickable step labels.
 */

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
    // whiteSpace: 'nowrap',
    // textOverflow: 'ellipsis',
    // overflow: 'hidden'
  },
  iframe: {
    width: '100%',
    right: 0,
    padding: '2px 8px'
  },
  contentStyle: {
    display: 'flex',
    height: '100%' },
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

class EntityTimeline extends React.Component {
  state = {
    selectedWiki: false,
    stepIndex: -1,
    influenceChartData: {}
  }

  handleNext = () => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex + 1 })
  };

  handlePrev = () => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex - 1 })
  };

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
  }

  getStepContent (stepIndex, sortedRulerKeys) {
    const { selectedWiki, iframeLoading } = this.state
    const rulerEntityData = ((this.props.rulerEntity || {}).data || {}).ruler || {}
    const wikiUrl = (rulerEntityData[sortedRulerKeys[stepIndex]] || {})[2] || (this.props.rulerProps || {})[2] || -1
    return (wikiUrl === -1 && !selectedWiki) ? <span>no wiki linked, consider adding one _here_</span> : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (iframeLoading ? 'none' : ''), height: (sortedRulerKeys.length === 0 ? 'calc(100% - 200px)' : 'calc(100% - 246px)') }} src={'http://en.wikipedia.org/wiki/' + (selectedWiki || wikiUrl) + '?printable=yes'} frameBorder='0' />
  }

  _selectRealm = () => {
    this.setState({ stepIndex: -1, selectedWiki: false })
  }

  _selectStepButton = (index, newYear) => {
    this.setState({stepIndex: index, selectedWiki: false})
    this.props.setYear(+newYear)
  }

  setYearWrapper = (newYear) => {
    this.props.setYear(+newYear)
  }

  setUpInfluenceChart = (rulerEntity) => {
    if (!rulerEntity || !rulerEntity.data) return

    console.error('setting up influenceChartData, this should only be done once', rulerEntity.id)

    this.setState({
      influenceChartData: {
        id: rulerEntity.id,
        data: [
          {
            title: 'Provinces',
            disabled: false,
            data: rulerEntity.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][0] } })
          },
          {
            title: 'Population Total',
            disabled: false,
            data: rulerEntity.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][1] } })
          },
          {
            title: 'Population Share',
            disabled: false,
            data: rulerEntity.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][2] } })
          }
        ]
      }
    })
  }

  componentDidMount = () => {
    this.setUpInfluenceChart(this.props.rulerEntity)
  }

  componentWillReceiveProps = (nextProps) => {

    if ((nextProps.rulerEntity || {}).id !== (this.props.rulerEntity || {}).id && nextProps.selectedItem.wiki !== WIKI_PROVINCE_TIMELINE) {
      this.setUpInfluenceChart(nextProps.rulerEntity)
    }
  }

  setWikiIdWrapper = (wiki) => {
    this.setState({ selectedWiki: wiki })
  }

  selectValueWrapper = (value) => {
    this.props.selectValue(value)
  }


  render () {
    const { stepIndex, selectedWiki, influenceChartData, iframeLoading } = this.state
    const { rulerEntity, selectedYear, rulerProps, newWidth, activeAreaDim, sunburstData, setContentMenuItem, activeContentMenuItem } = this.props

    const shouldLoad = (iframeLoading)
    const rulerEntityData = ((rulerEntity || {}).data || {}).ruler || {}
    const sortedRulerKeys = Object.keys(rulerEntityData).sort((a, b) => +a - +b)
    const rulerDetected = sortedRulerKeys.length !== 0

    return (
      <div style={{ height: '100%' }}>
        <ChartSunburst activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'sunburst' } setWikiId={ this.setWikiIdWrapper } selectValue={ this.selectValueWrapper} preData={ sunburstData } selectedYear={selectedYear} />
        <div style={{ height: '200px', width: '100%' }}>
          <InfluenceChart rulerProps={rulerProps} setYear={ this.setYearWrapper } newData={influenceChartData} selectedYear={selectedYear} />
        </div>
        { rulerDetected && <div style={{ width: '19%', maxWidth: '200px', height: 'calc(100% - 200px)', overflow: 'auto', display: 'inline-block' }}>
          <FlatButton backgroundColor={(rulerProps || {})[1] || 'grey'} hoverColor={'grey'} labelStyle={{ padding: '4px', color: 'white' }} style={{ width: '100%', height: '64px' }} label={(rulerProps || {})[0]} onClick={this._selectRealm.bind(this)} />
          <Stepper linear={false}
            activeStep={stepIndex}
            orientation='vertical'
            style={{ float: 'left', width: '100%', paddingRight: '1em', background: '#eceff2' }}>
            {sortedRulerKeys.map((yearKey, i) => (
              (rulerEntityData[yearKey][0] !== "null") ? <Step key={i} style={ styles.stepContainer}>
                <StepButton iconContainerStyle={{ background: (( (+(sortedRulerKeys[i]) <= +selectedYear) && (+selectedYear < +(sortedRulerKeys[i+1] || 2000)) ) ? 'red' : 'inherit') }} icon={<span style={styles.stepLabel}>{sortedRulerKeys[i]}</span>} onClick={() => this._selectStepButton(i, sortedRulerKeys[i]) }>
                  <div style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    position: 'absolute',
                    width: '20$',
                    left: '60px',
                    top: '16px',
                    fontSize: '15px'
                  }}>
                    {rulerEntityData[yearKey][0]}
                  </div>
                  <div style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    position: 'absolute',
                    width: '20$',
                    left: '60px',
                    top: '32px',
                    fontSize: '12px'
                  }}>
                    {rulerEntityData[yearKey][1]}
                  </div>

                </StepButton>
              </Step> : null
            ))}
          </Stepper>
        </div> }
        <div style={{
          width: (rulerDetected ? '80%' : '100%'),
          minWidth: 'calc(100% - 210px)',
          display: 'inline-block',
          float: 'right',
          height: '100%'
        }}>
          <div style={styles.contentStyle}>
            {(shouldLoad)
              ? <span>loading placeholder...</span>
              : this.getStepContent(stepIndex, sortedRulerKeys)}
            { rulerDetected && <div style={ styles.navTitle }>
              <span style={{ fontWeight: 600, paddingRight: '.2em'}}>{ (rulerEntityData[sortedRulerKeys[stepIndex]] || {} )[0] } </span>
              <span style={{ fontWeight: 300, paddingRight: '.6em'}}>
                {(rulerEntityData[sortedRulerKeys[stepIndex]] || {} )[1]}
              </span>
              <span style={{ paddingRight: '2em'}}> ({stepIndex + 1} / {sortedRulerKeys.length})</span>
            </div> }
            { rulerDetected && <div style={ styles.navButtons }>
              <FlatButton
                label='Back'
                disabled={stepIndex === 0}
                onClick={this.handlePrev}
                style={{ marginRight: 12 }}
              />
              <RaisedButton
                label='Next'
                disabled={stepIndex === sortedRulerKeys.length-1}
                primary
                onClick={this.handleNext}
              />
            </div> }
          </div>
        </div>
      </div>
    )
  }
}

const enhance = compose(
  connect(state => ({
  }), {
    setYear: setYearAction,
    selectValue
  })
)

export default enhance(EntityTimeline)
