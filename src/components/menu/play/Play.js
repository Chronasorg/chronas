import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import StarIcon from 'material-ui/svg-icons/action/stars'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Restricted, translate } from 'admin-on-rest'
import { GoldCoins } from '../customAssets'
import { properties, themes } from '../../../properties'

import { changeLocale as changeLocaleAction, changeMarkerTheme, changeTheme as changeThemeAction } from './actionReducers'
import utilsQuery from "../../map/utils/query";

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  minusGold: { color: '#bb0000', width: '14px', display: 'inline-block' },
  plusGold: { color: '#027600', width: '20px', display: 'inline-block', fontWeight: 800 },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  },
  goldIcon: {
    marginLeft: '4px',
    marginRight: '4px',
    marginTop: '-4px',
    height: '32px'
  },
  dd: {
    fontWeight: 800
  }
}

class Play extends PureComponent {

  constructor (props) {
    super(props)
    this.state = {
      hiddenElement: true,
      difficulty: 'easy'
    }
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }
  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { theme, locale, changeTheme, changeLocale, changeMarkerTheme, markerTheme, setBodyFont, setFullscreen, translate } = this.props

    const currBodyClasses = Array.from(document.body.classList) || []
    const selectedFontValue = (properties.markerOptions.find(el => currBodyClasses.includes(el.id)) || {}).id || localStorage.getItem('chs_font') || "cinzelFont"

    return (
      <Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open
        contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                  text={<h4><b>play</b>Chronas</h4>} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={translate("aor.action.close")} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <CardText>
            <Card initiallyExpanded={true}>
              <CardHeader
                title="Game Rules"
                subtitle={<b>Identify as many historic realms before your Gold runs out...</b>}
                actAsExpander={true}
                showExpandableButton={true}
              />
              <CardText expandable={true}>
                <dl style={{ marginTop: -18 }}>
                  You can use the following <b>Lifelines</b> to help you (but it will cost you gold):
                  <dd style={styles.dd}><span style={styles.minusGold}>-1</span> <GoldCoins style={styles.goldIcon} />  Change year</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-4</span> <GoldCoins style={styles.goldIcon} />  Reveal contemporary realm</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-6</span> <GoldCoins style={styles.goldIcon} />  Reveal media entity of realm</dd>
                  <dd style={styles.dd}><span style={styles.minusGold}>-8</span> <GoldCoins style={styles.goldIcon} />  Reveal content entity of realm</dd>
                </dl>
                <Divider />
                <dl style={{ marginTop: 8 }}>
                  <dd style={styles.dd}><span style={styles.minusGold}>-1</span> <GoldCoins style={styles.goldIcon} /> for every wrong guess</dd>

                    <StarIcon /> Every realm you identify earns you <span style={styles.plusGold}>+20</span> <GoldCoins style={styles.goldIcon} />
              </dl>
              <p>You will start with <GoldCoins style={styles.goldIcon} /> <b style={{fontSize: 20}}>50</b></p>
                {/*<p><i>The difficulty level determines how much Gold you have available and the obscurity of the realm to find.</i></p>*/}
              </CardText>
            </Card>
          </CardText>
          {/*<CardText>*/}
            {/*<div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>Difficulty:</div>*/}
            {/*<RaisedButton style={styles.button} label={'easy'} primary={theme === 'light'}*/}
                          {/*onClick={() => changeTheme('light')} />*/}
            {/*<RaisedButton style={styles.button} label={'medium'} primary={theme === 'dark'}*/}
                          {/*onClick={() => changeTheme('dark')} />*/}
            {/*<RaisedButton style={styles.button} label={'hard'} primary={theme === 'luther'}*/}
                          {/*onClick={() => changeTheme('luther')} />*/}
             {/*<RaisedButton style={styles.button} label={translate('pos.theme.golden')} primary={theme === 'golden'} */}
             {/*onClick={() => changeTheme('golden')} /> */}
          {/*</CardText>*/}
          <CardActions>
            <RaisedButton
              // type='submit'
              onClick={() => {
                }
              }
              primary
              label={translate('pos.play.start')}
              fullWidth
            />
          </CardActions>
          {/* TEXT FONT SELECT */}

          {/* add locked feature toggle (automatically detect timestamped waypoints to wiki article) */}

          {/* default markers/ area/ year (will be overwritten by url) */}
          {/* cluster */}
          {/* show population/ desnsity */}
          {/* image marker size */}
          {/* marker size */}

          {/* LOCKED SECTION */}

          {/* theme google earth + artsandculture.google.com + material ui 1.0 */}
        </Card>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
  markerTheme: state.markerTheme,
})

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
  changeMarkerTheme
})(translate(Play))
