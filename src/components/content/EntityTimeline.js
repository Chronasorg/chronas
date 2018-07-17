import React from 'react'
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper'
import ChartSunburst from './Charts/ChartSunburst'
import LinkedGallery from './contentMenuItems/LinkedGallery'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import compose from 'recompose/compose'
import { connect } from "react-redux"
import { setYear  as setYearAction} from '../map/timeline/actionReducers'
import { selectValue } from '../map/actionReducers'
import { WIKI_PROVINCE_TIMELINE} from '../map/actionReducers'
import InfluenceChart from "./Charts/ChartArea"
import ArticleIframe from "./ArticleIframe";

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
    influenceChartData: []
  }

  handleNext = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex + 1, selectedWiki: false})
    this.props.setYear(+newYear)
  };

  handlePrev = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex - 1, selectedWiki: false})
    this.props.setYear(+newYear)
  };

  getStepContent (stepIndex, sortedRulerKeys) {
    const { selectedWiki, influenceChartData } = this.state
    const { selectedItem, rulerEntity, rulerProps } = this.props
    const rulerEntityData = ((rulerEntity || {}).data || {}).ruler || {}
    const wikiUrl = (rulerEntityData[sortedRulerKeys[stepIndex]] || {})[2] || (rulerProps || {})[2] || -1
    return <ArticleIframe  hasChart={ influenceChartData && influenceChartData.length > 0 } selectedItem={ selectedItem } customStyle={{ ...styles.iframe, height: (sortedRulerKeys.length === 0 ? 'calc(100% - 200px)' : 'calc(100% - 294px)') }} selectedWiki={ selectedWiki || wikiUrl} />
  }

  _selectMainArticle = () => {
    this.setState({ stepIndex: -1 })
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
      stepIndex: -1,
      influenceChartData: [{
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
      }]
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
    const { stepIndex, selectedWiki, influenceChartData, translate } = this.state
    const { rulerEntity, selectedYear, rulerProps, newWidth, history, activeAreaDim, sunburstData, linkedItems, setContentMenuItem, activeContentMenuItem } = this.props

    const rulerEntityData = ((rulerEntity || {}).data || {}).ruler || {}
    const sortedRulerKeys = Object.keys(rulerEntityData).filter((key) => rulerEntityData[key][0] !== "null").sort((a, b) => +a - +b)
    const rulerDetected = sortedRulerKeys.length !== 0

    return (
      <div style={{ height: '100%' }}>
        <ChartSunburst activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'sunburst' } setWikiId={ this.setWikiIdWrapper } selectValue={ this.selectValueWrapper} preData={ sunburstData } selectedYear={selectedYear} />
        <LinkedGallery history={history} activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'linked' } setWikiId={ this.setWikiIdWrapper } selectValue={ this.selectValueWrapper} linkedItems={ linkedItems.media } selectedYear={selectedYear} />
        <div style={{ height: '200px', width: '100%' }}>
          <InfluenceChart rulerProps={rulerProps} setYear={ this.setYearWrapper } newData={influenceChartData} selectedYear={selectedYear} />
        </div>
        { rulerDetected && <div style={{ width: '19%', maxWidth: '200px', height: 'calc(100% - 248px)', overflow: 'auto', display: 'inline-block', overflowX: 'hidden' }}>
          <FlatButton backgroundColor={(rulerProps || {})[1] || 'grey'} hoverColor={'grey'} labelStyle={{ padding: '4px', color: 'white' }} style={{ width: '100%', height: '64px' }} label={(rulerProps || {})[0]} onClick={this._selectMainArticle.bind(this)} />
          <Stepper linear={false}
            activeStep={stepIndex}
            orientation='vertical'
            style={{ float: 'left', width: '100%', background: '#eceff2', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset' }}>
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
            { this.getStepContent(stepIndex, sortedRulerKeys)}
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
                disabled={stepIndex < 1}
                onClick={() => this.handlePrev(sortedRulerKeys[stepIndex-1])}
                style={{ marginRight: 12 }}
              />
              <RaisedButton
                label='Next'
                disabled={stepIndex >= sortedRulerKeys.length-1}
                primary
                onClick={() => this.handleNext(sortedRulerKeys[stepIndex+1])}
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
