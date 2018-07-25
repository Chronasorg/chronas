import React from 'react'
import { connect } from 'react-redux'
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import compose from 'recompose/compose'
import ChartSunburst from './Charts/ChartSunburst'
import LinkedGallery from './contentMenuItems/LinkedGallery'
import LinkedQAA from './contentMenuItems/LinkedQAA'
import { setYear  as setYearAction} from '../map/timeline/actionReducers'
import {selectValue, setEpicContentIndex, WIKI_PROVINCE_TIMELINE} from '../map/actionReducers'
import InfluenceChart from './Charts/ChartArea'
import ArticleIframe from './ArticleIframe'

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
    linkedSetup: '',
    rulerSetup: '',
    selectedWiki: false,
    stepIndex: -1,
    influenceChartData: [],
    epicMeta: false,
    epicLinkedArticles: [],
    linkedMediaItems: [],
  }

  handleNext = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex + 1, selectedWiki: false})
    this.props.setEpicContentIndex(stepIndex + 1)
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  };

  handlePrev = (newYear) => {
    const { stepIndex } = this.state
    this.setState({ stepIndex: stepIndex - 1, selectedWiki: false})
    this.props.setEpicContentIndex(stepIndex - 1)
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  };

  getStepContent (stepIndex) {
    const { epicData, selectedItem, rulerProps } =  this.props
    const { selectedWiki, epicLinkedArticles, influenceChartData  } = this.state
    const itemTyep = (epicLinkedArticles[stepIndex] || {}).type
    //TODO: fly to if coo, add geojson up to that index and animate current - if main, add all geojson
    if (itemTyep === 'html') {
      const content = (epicLinkedArticles[stepIndex] || {}).content
      return  <div style={{ 'padding': '1em' }} dangerouslySetInnerHTML={{__html: content}}></div>
    } else {
      const wikiUrl = (epicLinkedArticles[stepIndex] || {}).wiki || ((epicData || {}).data || {}).wiki || (rulerProps || {})[2] || -1
      return  <ArticleIframe hasChart={ influenceChartData && influenceChartData.length > 0 } selectedItem={ selectedItem } customStyle={{ ...styles.iframe, height: (epicLinkedArticles.length === 0 ? 'calc(100% - 200px)' : 'calc(100% - 246px)') }} selectedWiki={ selectedWiki || wikiUrl} />
    }
  }

  _selectMainArticle = () => {
    this.setState({ stepIndex: -1 })
    this.props.setEpicContentIndex(-1)
  }

  _selectStepButton = (index, newYear) => {
    this.setState({stepIndex: index, selectedWiki: false})
    this.props.setEpicContentIndex(index)
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  }

  setYearWrapper = (newYear) => {
    if (!isNaN(newYear)) this.props.setYear(+newYear)
  }

  setUpInfluenceChart = (epicData) => {
    if (!epicData || !epicData.data) return

    console.error('setting up influenceChartData, this should only be done once for so many entities', epicData.length)

    const influenceChartData = (this.props.isEntity) ? [{
        id: epicData.id,
        data: [
          {
            title: 'Provinces',
            disabled: false,
            data: epicData.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][0] } })
          },
          {
            title: 'Population Total',
            disabled: false,
            data: epicData.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][1] } })
          },
          {
            title: 'Population Share',
            disabled: false,
            data: epicData.data.influence.map((el) => { return { left: Object.keys(el)[0], top: Object.values(el)[0][2] } })
          }
        ]
      }] : (epicData.rulerEntities || []).map((epicEntity) => {
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
    this.setState({
      stepIndex: -1,
      influenceChartData
    })
  }

  componentDidMount = () => {
    this.setUpInfluenceChart(this.props.epicData)
  }

  componentWillReceiveProps = (nextProps) => {
    const { selectedItem, epicData, linkedItems, rulerProps, isEntity } = this.props

    // if ((nextProps.selectedItem.value !== selectedItem.value || (nextProps.linkedItems.media || nextProps.epicMeta.media || []).length !== (linkedItems.media || epicMeta.media || []).length) && ((nextProps.epicData || {}).id !== (epicData || {}).id || ((nextProps.epicData || {}).id && (linkedItems || !this.state.epicMeta)))) {
    const nextEntity = ((nextProps.epicData || {}).data || {}).wiki || (nextProps.rulerProps || {})[2]
    const prevEntity = ((epicData || {}).data || {}).wiki || (rulerProps || {})[2]

    const nextLinkedId = nextProps.linkedItems.id
    const prevLinkedId = linkedItems.id

    if ((prevEntity !== nextEntity || nextLinkedId !== prevLinkedId) && nextProps.selectedItem.wiki !== WIKI_PROVINCE_TIMELINE) {
      const { rulerSetup } = this.state
      if (rulerSetup !== nextProps.epicData.id) {
        this.setUpInfluenceChart(nextProps.epicData)
      }

      const epicMeta = ((nextProps.epicData || {}).data || {}).data || {}
      this.setState({
        epicMeta,
        rulerSetup: nextProps.epicData.id
      })

      const linkedMediaItems = (nextProps.linkedItems.media || nextProps.epicMeta.media || []).map((imageItem) => {
        return {
          src: imageItem._id || imageItem.wiki || ((imageItem || {}).properties || {}).w,
          wiki: imageItem.wiki || imageItem.properties.w,
          title: imageItem.name || imageItem.title || (imageItem.data || {}).title || ((imageItem || {}).properties || {}).n,
          subtype: imageItem.subtype || imageItem.properties.t,
          source: imageItem.source || (imageItem.data || {}).source || ((imageItem || {}).properties || {}).s,
          subtitle: imageItem.subtitle || imageItem.year || ((imageItem || {}).properties || {}).n,
          score: imageItem.score || ((imageItem || {}).properties || {}).s,
        }
      })

      let entityContentData
      if (isEntity) {
        entityContentData = []
        const entityRulerData = ((nextProps.epicData || {}).data || {}).ruler || {}
        Object.keys(entityRulerData).forEach((k) => {
          entityContentData.push({
              "name": entityRulerData[k][0],
              "type": entityRulerData[k][1],
              "wiki": entityRulerData[k][2],
              "date": k
            }
          )
        })
      }

      const epicLinkedArticles = ((entityContentData && entityContentData.concat(((nextProps.linkedItems || {}).content || []))) || (nextProps.epicMeta || {}).content || []).map((linkedItem) => {
        return {
          "name": (!linkedItem.properties) ? (linkedItem.name || linkedItem.wiki) : linkedItem.properties.n || linkedItem.properties.w,
          "wiki": (!linkedItem.properties) ? linkedItem.wiki : linkedItem.properties.w,
          "content": (!linkedItem.properties) ? (linkedItem.content || linkedItem.name) : linkedItem.properties.c,
          "type": (!linkedItem.properties) ? linkedItem.type : linkedItem.properties.t,
          "date": (!linkedItem.properties) ? linkedItem.date : linkedItem.properties.y
        }}).filter((el) => el["name"] !== "null").sort((a, b) => +a.date - +b.date)

      this.setState({
          linkedSetup: prevLinkedId,
          linkedMediaItems: linkedMediaItems,
        epicLinkedArticles
      })
    }
    // else if (nextProps.selectedItem.wiki !== selectedItem.wiki) {// TODO: reload linked media if wiki changed
    //   const { epicLinkedArticles } = this.state
    //
    //   const newWiki = nextProps.selectedItem.wiki
    //   const articleIndex = epicLinkedArticles.findIndex(x => x.wiki === newWiki);
    //   if (articleIndex !== -1) {
    //     this._selectStepButton(articleIndex, epicLinkedArticles[articleIndex].date)
    //   } else {
    //     this.setState({ selectedWiki: newWiki })
    //   }
    // }
  }

  setWikiIdWrapper = (wiki) => {
    this.setState({ selectedWiki: wiki })
  }

  selectValueWrapper = (value) => {
    this.props.selectValue(value)
  }

  render () {
    const { epicMeta, epicLinkedArticles, stepIndex, selectedWiki, linkedMediaItems, linkedQAAItems, influenceChartData, translate, iframeLoading } = this.state
    const { activeContentMenuItem, activeAreaDim, rulerProps, isEntity, newWidth, history, selectedYear, setContentMenuItem, linkedItems, sunburstData } = this.props

    const contentDetected = epicLinkedArticles.length !== 0

    return (
      <div style={{ height: '100%' }}>
        { isEntity && <ChartSunburst
          activeAreaDim={activeAreaDim}
          setContentMenuItem={setContentMenuItem}
          isMinimized={ activeContentMenuItem !== 'sunburst' }
          setWikiId={ this.setWikiIdWrapper }
          selectValue={ this.selectValueWrapper}
          preData={ sunburstData }
          selectedYear={selectedYear} /> }
        { linkedItems && linkedItems.id && <LinkedQAA history={history} activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'qaa' } qId={ linkedItems.id } /> }
        <LinkedGallery history={history} activeAreaDim={activeAreaDim} setContentMenuItem={setContentMenuItem} isMinimized={ activeContentMenuItem !== 'linked' } setWikiId={ this.setWikiIdWrapper } selectValue={ this.selectValueWrapper} linkedItems={ linkedMediaItems } selectedYear={selectedYear} />
        { isEntity && influenceChartData && influenceChartData.length > 0 && <div style={{ height: '200px', width: '100%' }}>
          <InfluenceChart epicMeta={isEntity ? false : epicMeta} rulerProps={rulerProps} setYear={ this.setYearWrapper } newData={influenceChartData} selectedYear={selectedYear} />
        </div> }
        { contentDetected && <div style={{ width: '19%', maxWidth: '200px', height: 'calc(100% - 248px)', overflow: 'auto', display: 'inline-block', overflowX: 'hidden' }}>
          <FlatButton backgroundColor={(rulerProps || {})[1] || 'grey'} hoverColor={'grey'} labelStyle={{ padding: '4px', color: 'white' }} style={{ width: '100%', height: '64px' }} label={(epicMeta || {}).title || (rulerProps || {})[0] || 'Epic Main'} onClick={this._selectMainArticle.bind(this)} />
          <Stepper linear={false}
            activeStep={stepIndex}
            orientation='vertical'
            style={{ float: 'left', width: '100%', background: '#eceff2', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 5px 6px -3px inset' }}>
            {epicLinkedArticles.map((epicContent, i) => (
              <Step key={i} style={ styles.stepContainer}>
                <StepButton iconContainerStyle={{ background: (( (+(epicLinkedArticles[i].date) <= +selectedYear) && (+selectedYear < +((epicLinkedArticles[i+1] || {}).date || 2000)) ) ? 'red' : 'inherit') }} icon={<span style={styles.stepLabel}>{epicLinkedArticles[i].date}</span>} onClick={() => { console.debug(i, epicLinkedArticles[i].date); this._selectStepButton(i, epicLinkedArticles[i].date) }}>
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
                    {epicContent.name || epicContent.wiki}
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
            { this.getStepContent(stepIndex) }
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
    selectValue,
    setEpicContentIndex
  })
)

export default enhance(EpicTimeline)
