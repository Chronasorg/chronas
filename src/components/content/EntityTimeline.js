import React from 'react'
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'

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
    position: 'fixed',
    right: 0,
    width: '80%',
    height: 'calc(100% - 128px)',
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
class EntityTimeline extends React.Component {
  state = {
    stepIndex: 0,
  };

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

  getStepContent (stepIndex) {
    const rulerEntityData = ((this.props.rulerEntity || {}).data || {})
    const wikiUrl = (rulerEntityData[Object.keys(rulerEntityData)[stepIndex]] || {})[2] || -1
    return (wikiUrl === -1) ? null : <iframe id='articleIframe' onLoad={this._handleUrlChange} style={{ ...styles.iframe, display: (this.state.iframeLoading ? 'none' : '') }} src={'http://en.wikipedia.org/wiki/' + wikiUrl + '?printable=yes'} height='90%' frameBorder='0' />
  }

  render () {
    const { stepIndex, selectedWiki } = this.state
    const { rulerEntity } = this.props
    const contentStyle = { margin: '0 16px' }

    const shouldLoad = (this.state.iframeLoading || selectedWiki === null)
    const rulerEntityData = (rulerEntity || {}).data || {}

    return (
      <div style={{ width: '19%', overflow: 'auto' }}>
        <Stepper linear={false}
          activeStep={stepIndex}
          orientation='vertical'
          style={{ float: 'left', width: '100%', paddingRight: '1em' }}>
          {Object.keys(rulerEntityData).map((yearKey, i) => (
            <Step key={i} style={ styles.stepContainer}>
              <StepButton icon={<span style={styles.stepLabel}>{yearKey}</span>} onClick={() => this.setState({ stepIndex: i }) /* TODO: change year onclick */ }>
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
            </Step>
          ))}
        </Stepper>
        <div style={contentStyle}>
          {(selectedWiki === null || shouldLoad)
            ? <span>loadin1g placeholder...</span>
            : this.getStepContent(stepIndex)}
          <div style={ styles.navTitle }>
            <span style={{ fontWeight: 600, paddingRight: '.2em'}}>{ (rulerEntityData[Object.keys(rulerEntityData)[stepIndex]] || {} )[0] } </span>
            <span style={{ fontWeight: 300, paddingRight: '.6em'}}>
              {(rulerEntityData[Object.keys(rulerEntityData)[stepIndex]] || {} )[1]}
            </span>
            <span style={{ paddingRight: '2em'}}> ({stepIndex + 1} / {Object.keys(rulerEntityData).length})</span>
          </div>

          <div style={ styles.navButtons }>
            <FlatButton
              label='Back'
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={{ marginRight: 12 }}
            />
            <RaisedButton
              label='Next'
              disabled={stepIndex === Object.keys(rulerEntityData).length-1}
              primary
              onClick={this.handleNext}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default EntityTimeline
