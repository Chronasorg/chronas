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
  }
}
class EntityTimeline extends React.Component {
  state = {
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state
    if (stepIndex < 2) {
      this.setState({ stepIndex: stepIndex + 1 })
    }
  };

  handlePrev = () => {
    const { stepIndex } = this.state
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 })
    }
  };

  getStepContent (stepIndex) {
    switch (stepIndex) {
      case 0:
        return 'Select campaign settings...'
      case 1:
        return 'What is an ad group anyways?'
      case 2:
        return 'This is the bit I really care about!'
      default:
        return 'You\'re a long way from home sonny jim!'
    }
  }

  render () {
    const { stepIndex } = this.state
    const contentStyle = { margin: '0 16px' }

    return (
      <div style={{ width: '100%' }}>
        <Stepper linear={false}
          activeStep={stepIndex}
          orientation='vertical'
          style={{ float: 'left', paddingRight: '1em' }}>
          <Step>
            <StepButton icon={<span style={styles.stepLabel}>1942</span>} onClick={() => this.setState({ stepIndex: 1 })}>
              Create an ad group
            </StepButton>
          </Step>
          <Step>
            <StepButton onClick={() => this.setState({ stepIndex: 2 })}>
              Create an ad
            </StepButton>
          </Step>
        </Stepper>
        <div style={contentStyle}>
          <p>{this.getStepContent(stepIndex)}</p>
          <div style={{ marginTop: 12 }}>
            <FlatButton
              label='Back'
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={{ marginRight: 12 }}
            />
            <RaisedButton
              label='Next'
              disabled={stepIndex === 2}
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
