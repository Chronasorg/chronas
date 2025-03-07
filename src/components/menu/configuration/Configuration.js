import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Restricted, translate } from 'admin-on-rest'
import { properties, themes } from '../../../properties'

import { changeLocale as changeLocaleAction, changeMarkerTheme, changeTheme as changeThemeAction } from './actionReducers'
import utilsQuery from "../../map/utils/query";

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

class Configuration extends PureComponent {
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
                  text={translate('pos.configuration')} />
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
            <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.theme.name')}</div>
            <RaisedButton style={styles.button} label={translate('pos.theme.light')} primary={theme === 'light'}
              onClick={() => changeTheme('light')} />
            <RaisedButton style={styles.button} label={translate('pos.theme.dark')} primary={theme === 'dark'}
              onClick={() => changeTheme('dark')} />
            <RaisedButton style={styles.button} label={translate('pos.theme.luther')} primary={theme === 'luther'}
              onClick={() => changeTheme('luther')} />
            {/* <RaisedButton style={styles.button} label={translate('pos.theme.golden')} primary={theme === 'golden'} */}
            {/* onClick={() => changeTheme('golden')} /> */}
          </CardText>
          <CardText>
            <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.goFullScreen')}</div>
            <RaisedButton style={styles.button} label={translate('pos.toggle')}
                          onClick={() => setFullscreen()} />
          </CardText>
          <CardText>
            <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.language')}</div>
            <SelectField
              autoWidth={true}
              value={locale}
              onChange={(event, index, value) => {
                localStorage.setItem('chs_locale', value)
                utilsQuery.updateQueryStringParameter('locale', value)
                changeLocale(value)
                const previousTheme = theme
                changeTheme(theme === 'light' ? 'dark' : 'light')
                setTimeout(() => changeTheme(previousTheme), 50)
              }}
              style={{ ...styles.label, color: themes[theme].foreColors[0] }}
              floatingLabelStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              inputStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              textareaStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              hintStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
            >
              {properties.languageOptions.map((el) => {
                return <MenuItem key={el.id} value={el.id} primaryText={el.name} />
              })}
            </SelectField>
            <br />
            <p><i>We are looking for native speakers to translate our UI in various languages, please send an email through the <a
              className='customLink' style={{ color: themes[theme].highlightColors[0] }}
              onClick={() => this.props.history.push('/info/contact')}>Contact form</a> if interested.</i></p>
          </CardText>
          <CardText style={{ float: 'left' }}>
            <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.theme.font')}</div>
            <SelectField
              value={selectedFontValue}
              onChange={(event, index, value) => {
                setBodyFont(value)
                this.forceUpdate()
              }}
              style={{ ...styles.label, color: themes[theme].foreColors[0] }}
              floatingLabelStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              inputStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              textareaStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              hintStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
            >
              {properties.fontOptions.map((el) => {
                return <MenuItem value={el.id} primaryText={el.name} />
              })}
            </SelectField>
          </CardText>
          <CardText style={{ float: 'right', marginTop: 14 }}>
            <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.markerType')}</div>
            <SelectField
              value={markerTheme}
              onChange={(event, index, value) => {
                changeMarkerTheme(value)
              }}
              style={{ ...styles.label, color: themes[theme].foreColors[0], top: 10 }}
              floatingLabelStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              inputStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              textareaStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              hintStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
            >
              {properties.markerOptions.map((el) => {
                return <MenuItem value={el.id} primaryText={translate('pos.markerTypes.' + el.id)} />
              })}
            </SelectField>
          </CardText>
          <br />
          <Divider style={{ clear: 'both' }}/>
          <CardText>
          <p><i>You can let the best data settings be suggested to you at the <a
            className='customLink' style={{ color: themes[theme].highlightColors[0] }}
            onClick={() => this.props.history.push('/performance')}>Performance</a> section based on your machine's specs..</i></p>
        </CardText>

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
})(translate(Configuration))

