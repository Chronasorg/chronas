import React, { PureComponent } from 'react'
import ReactHtmlParser from 'react-html-parser'
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
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
                tooltip={translate("aor.action.close")} touch key={'close'}>
                <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
              </IconButton>
            </ToolbarGroup>
          </Toolbar>
        </div>

        <CardText>
          <p>
            { ReactHtmlParser(translate('pos.block.pledge1')) }
          </p>
          <p>
            {translate('pos.block.pledge2')}
              <a className='customLink' target='_blank'
                href='https://www.patreon.com/chronas'><Avatar
                  style={{ marginRight: 8, marginLeft: 6 }} src='/images/240px-Patreon_logo.svg.png' />
              Patreon</a>
            {translate('pos.block.pledge3')}
          </p>
          <p>
            {translate('pos.block.pledge4')}
          </p>
          <form className="donateButton" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
            <span>{translate('pos.block.pledge5')}&nbsp;&nbsp;</span>
            <input type="hidden" name="cmd" value="_s-xclick"/>
            <input type="hidden" name="hosted_button_id" value="DLRUFHZSBTBNN"/>
            <input type="image" src="/images/button-PayPal.png" style={{ height: 34 }} border="0" name="submit" alt="Donate with PayPal" title="Donate with PayPal" /><img alt="" border="0" src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif" width="1" height="1"/>
          </form>
        </CardText>
        <Divider />
        <CardActions>
          <FlatButton label={translate('pos.pledgeRemind')} onClick={() => snooze()} />
          <FlatButton label={translate('pos.pledgeOpen')} onClick={() => {
            var win = window.open('https://www.patreon.com/chronas', '_blank')
            win.focus()
          }} />
          <FlatButton style={{ right: 0, position: 'absolute' }} label={translate('aor.action.close')} onClick={() => closePledge()} />
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
