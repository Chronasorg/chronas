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

class EpicTimeline extends React.Component {
  state = {
    selectedWiki: false,
    stepIndex: -1,
    influenceChartData: {},
    epicMeta: false,
    epicLinkedArticles: []
  }

  handleNext = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex + 1, selectedWiki: false})
    if (!isNaN(newYear)) this.props.setYear(+newYear)

  };

  handlePrev = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex - 1, selectedWiki: false})
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  };

  _handleUrlChange = (e) => {
    this.setState({ iframeLoading: false })
    const currSrc = document.getElementById('articleIframe').getAttribute('src')
    if (currSrc.indexOf('?printable=yes') === 1) {
      document.getElementById('articleIframe').setAttribute('src', currSrc + '?printable=yes')
    } // TODO: do this with ref
  }

  getStepContent (stepIndex) {
    const { epicData } =  this.props
    const { selectedWiki, iframeLoading, epicLinkedArticles } = this.state
    const wikiUrl = (epicLinkedArticles[stepIndex] || {}).wiki || ((epicData || {}).data || {}).wiki || -1
    return (wikiUrl === -1 && !selectedWiki) ? <span>no wiki linked, consider adding one epic _here_</span> : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (iframeLoading ? 'none' : ''), height: (epicLinkedArticles.length === 0 ? 'calc(100% - 200px)' : 'calc(100% - 246px)') }} src={'http://en.wikipedia.org/wiki/' + (selectedWiki || wikiUrl) + '?printable=yes'} frameBorder='0' />
  }

  _selectMainArticle = () => {
    this.setState({ stepIndex: -1 })
  }

  _selectStepButton = (index, newYear) => {
    this.setState({stepIndex: index, selectedWiki: false})
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  }

  setYearWrapper = (newYear) => {
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  }

  setUpInfluenceChart = (epicData) => {
    if (!epicData || !epicData.data) return

    console.error('setting up influenceChartData, this should only be done once for so many entities', epicData.length)

    this.setState({
      stepIndex: -1,
      influenceChartData: (epicData.rulerEntities || []).map((epicEntity) => {
        return {
          id: epicEntity._id,
          data: [
            {
              title: 'Population Share',
              disabled: false,
              data: epicEntity.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][2] } })
            }
          ]
        }
      })
    })
  }

  componentDidMount = () => {
    this.setUpInfluenceChart(this.props.epicData)
  }

  componentWillReceiveProps = (nextProps) => {
    const { selectedItem, epicData } = this.props

    if ((nextProps.epicData || {}).id !== (epicData || {}).id || ((nextProps.epicData || {}).id && !this.state.epicMeta)) {
      this.setUpInfluenceChart(nextProps.epicData)

      const epicMeta = ((nextProps.epicData || {}).data || {}).data || {}
      const epicLinkedArticles = (epicMeta.content || []).map((linkedItem) => {
        return {
          "name": linkedItem.properties.n || linkedItem.properties.w,
          "wiki": linkedItem.properties.w,
          "type": linkedItem.properties.t,
          "date": linkedItem.properties.y
        }}).sort((a, b) => +a.date - +b.date)
      this.setState({
        epicMeta,
        epicLinkedArticles
      })
    }
    else if (nextProps.selectedItem.wiki !== selectedItem.wiki) {
      const { epicLinkedArticles } = this.state

      const newWiki = nextProps.selectedItem.wiki
      const articleIndex = epicLinkedArticles.findIndex(x => x.wiki === newWiki);
      if (articleIndex) {
        this._selectStepButton(articleIndex, epicLinkedArticles[articleIndex].date)
      } else {
        this.setState({ selectedWiki: newWiki })
      }
    }
  }

  setWikiIdWrapper = (wiki) => {
    this.setState({ selectedWiki: wiki })
  }

  selectValueWrapper = (value) => {
    this.props.selectValue(value)
  }

  render () {
    const { epicMeta, epicLinkedArticles, stepIndex, selectedWiki, influenceChartData, translate, iframeLoading } = this.state
    const { selectedYear, rulerProps, newWidth, history, activeAreaDim, linkedItems, setContentMenuItem, activeContentMenuItem } = this.props

    const shouldLoad = (iframeLoading)
    const contentDetected = epicLinkedArticles.length !== 0

    return (
      <div style={{ height: '100%' }}>
        <LinkedGallery history={history} activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'linked' } setWikiId={ this.setWikiIdWrapper } selectValue={ this.selectValueWrapper} linkedItems={ linkedItems } selectedYear={selectedYear} />
        <div style={{ height: '200px', width: '100%' }}>
          <InfluenceChart epicMeta={epicMeta} rulerProps={rulerProps} setYear={ this.setYearWrapper } newData={influenceChartData} selectedYear={selectedYear} />
        </div>
        { contentDetected && <div style={{ width: '19%', maxWidth: '200px', height: 'calc(100% - 184px)', overflow: 'auto', display: 'inline-block', overflowX: 'hidden' }}>
          <FlatButton backgroundColor={'grey'} hoverColor={'grey'} labelStyle={{ padding: '4px', color: 'white' }} style={{ width: '100%', height: '64px' }} label={(epicMeta || {}).title || 'Epic Main'} onClick={this._selectMainArticle.bind(this)} />
          <Stepper linear={false}
            activeStep={stepIndex}
            orientation='vertical'
            style={{ float: 'left', width: '100%', background: '#eceff2', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset' }}>
            {epicLinkedArticles.map((epicContent, i) => (
              <Step key={i} style={ styles.stepContainer}>
                <StepButton iconContainerStyle={{ background: (( (+(epicLinkedArticles[i].date) <= +selectedYear) && (+selectedYear < +((epicLinkedArticles[i+1] || {}).date || 2000)) ) ? 'red' : 'inherit') }} icon={<span style={styles.stepLabel}>{epicLinkedArticles[i].date}</span>} onClick={() => this._selectStepButton(i, epicLinkedArticles[i].date) }>
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
                    {epicContent.wiki}
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
                    {epicContent.type}
                  </div>

                </StepButton>
              </Step>
            ))}
          </Stepper>
        </div> }
        <div style={{
          width: (contentDetected ? '80%' : '100%'),
          minWidth: 'calc(100% - 210px)',
          display: 'inline-block',
          float: 'right',
          height: '100%'
        }}>
          <div style={styles.contentStyle}>
            {(shouldLoad)
              ? <span>loading epic placeholder...</span>
              : this.getStepContent(stepIndex)}
            { contentDetected && <div style={ styles.navTitle }>
              <span style={{ fontWeight: 600, paddingRight: '.2em'}}>{ (epicLinkedArticles[epicLinkedArticles[stepIndex]] || {} )[0] } </span>
              <span style={{ fontWeight: 300, paddingRight: '.6em'}}>
                {(epicLinkedArticles[epicLinkedArticles[stepIndex]] || {} )[1]}
              </span>
              <span style={{ paddingRight: '2em'}}> ({stepIndex + 1} / {epicLinkedArticles.length})</span>
            </div> }
            { contentDetected && <div style={ styles.navButtons }>
              <FlatButton
                label='Back'
                disabled={stepIndex < 1}
                onClick={() => this.handlePrev(epicLinkedArticles[stepIndex-1].date)}
                style={{ marginRight: 12 }}
              />
              <RaisedButton
                label='Next'
                disabled={stepIndex >= epicLinkedArticles.length-1}
                primary
                onClick={() => this.handleNext(epicLinkedArticles[stepIndex+1].date)}
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
    selectedItem: state.selectedItem,
  }), {
    setYear: setYearAction,
    selectValue
  })
)

export default enhance(EpicTimeline)
