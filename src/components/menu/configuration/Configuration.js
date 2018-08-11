import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { translate, Restricted } from 'admin-on-rest';
import { properties, themes } from '../../../properties'

import { changeTheme as changeThemeAction, changeLocale as changeLocaleAction } from './actionReducers'

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
};

class Configuration extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hiddenElement: true
    }
  }

  componentDidMount = () => {
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  handleClose = () => {
    this.props.history.push('/')
  }


  render() {
    const {theme, locale, changeTheme, changeLocale, menuItemActive, setBodyFont, setFullscreen, translate} = this.props;

    const currBodyClasses = Array.from(document.body.classList) || []
    const selectedFontValue = ((properties.fontOptions.filter(el => currBodyClasses.includes(el.id)) || [])[0] || {}).id

    return (
        <Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open={true} contentClassName={(this.state.hiddenElement) ? '' : "classReveal"} contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}} onRequestClose={this.handleClose}>
          <Card style={styles.card}>
            <div>
              <Toolbar style={styles.toolbar}>
                <ToolbarGroup>
                  <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0] }} text={translate('pos.configuration')} />
                </ToolbarGroup>
                <ToolbarGroup>
                  <IconButton iconStyle={{ ...styles.label, color: themes[theme].foreColors[0] }} touch={true} key={'close'} containerElement={<Link to="/" />}>
                    <CloseIcon />
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
            </CardText>
            <CardText>
              <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.language')}</div>
              <RaisedButton style={styles.button} label="en" primary={locale === 'en'}
                            onClick={() => changeLocale('en')} />
              <RaisedButton style={styles.button} label="fr" primary={locale === 'fr'}
                            onClick={() => changeLocale('fr')} />
            </CardText>
            <CardText>
              <CardText>
                <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.goFullScreen')}</div>
                <RaisedButton style={styles.button} label={translate('pos.goFullScreen')}
                              onClick={() => setFullscreen()} />
              </CardText>
              <div style={{ ...styles.label, color: themes[theme].foreColors[0] }}>{translate('pos.theme.font')}</div>
              <SelectField
                floatingLabelText={translate('pos.fontType')}
                value={ selectedFontValue }
                onChange={ (event, index, value) => { setBodyFont(value) } }
                style={{ ...styles.label, color: themes[theme].foreColors[0] }}
                floatingLabelStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                inputStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                textareaStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                hintStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
              >
                { properties.fontOptions.map((el) => {
                  return <MenuItem value={el.id}  primaryText={el.name} />
                })}
              </SelectField>
            </CardText>

            TEXT FONT SELECT

            * add locked feature toggle (automatically detect timestamped waypoints to wiki article)

            default markers/ area/ year (will be overwritten by url)
            cluster
            show population/ desnsity
            image marker size
            marker size

            LOCKED SECTION

            theme google earth + artsandculture.google.com + material ui 1.0
          </Card>
        </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
  menuItemActive: state.menuItemActive,
});

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
})(translate(Configuration));
