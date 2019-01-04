import React, { PureComponent } from 'react'
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Restricted, translate } from 'admin-on-rest'
import { themes } from '../../properties'

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

class PledgeDialog extends PureComponent {
  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }
  handleClose = () => {
    this.props.history.push('/')
  }

  constructor (props) {
    super(props)
    this.state = {
      hiddenElement: true
    }
  }

  render () {
    const { theme, translate, open, closePledge, snooze } = this.props

    return (<Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open={open}
      contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
      contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }}
      onRequestClose={this.handleClose}>
      <Card style={styles.card}>
        <div>
          <Toolbar style={styles.toolbar}>
            <ToolbarGroup>
              <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                text={translate('pos.pledgeTitle')} />
            </ToolbarGroup>
            <ToolbarGroup>
              <IconButton
                onClick={closePledge}
                tooltipPosition='bottom-left'
                tooltip={'Close'} touch key={'close'}>
                <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
              </IconButton>
            </ToolbarGroup>
          </Toolbar>
        </div>

        <CardText>
          <p>
              You have now been on Chronas for over <b>30 minutes</b>!
          </p>
          <p>
              Chronas depends on user support to survive and grow.
              If you find this project useful head over to <a className='customLink' target='_blank'
                href='https://www.patreon.com/chronas'><Avatar
                  style={{ marginRight: 8, marginLeft: 6 }} src='/images/240px-Patreon_logo.svg.png' />
              Patreon</a> and consider pledging an amount of your choice.
          </p>
          <p>
              Patreons will be able to steer the project by voting on feature priorities and major design decisions.
          </p>
        </CardText>
        <CardActions>
          <FlatButton label='Remind me in another 30 minutes' onClick={() => snooze()} />
          <FlatButton label='Open Patreon in new tab' onClick={() => {
            var win = window.open('https://www.patreon.com/chronas', '_blank')
            win.focus()
          }} />
          <FlatButton label='Close' onClick={() => closePledge()} />
        </CardActions>
      </Card>
    </Dialog>
    )
  }
}

const mapStateToProps = state => ({})

export default (translate(PledgeDialog))
// connect(mapStateToProps, {
// })(translate(PledgeDialog))
