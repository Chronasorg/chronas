import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import { translate, ViewTitle } from 'admin-on-rest';

import { changeTheme as changeThemeAction, changeLocale as changeLocaleAction } from './actions';

const styles = {
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
};
// transform: '',
// bodyStyle={{ transition: 'opacity 2.0s ease-in'}}
// style={{ transition: 'opacity 2.0s ease-in'}}
// actionsContainerStyle={{ transition: 'opacity 2.0s ease-in'}}
// overlayStyle={{ transition: 'opacity 2.0s ease-in'}}
// titleStyle={{ transition: 'opacity 2.0s ease-in'}}
const Configuration = ({ theme, locale, changeTheme, changeLocale, translate }) => (
  <Dialog open={true} contentClassName="dialogReveal" contentStyle={{transform: '', transition: 'opacity 3s', opacity: 1}}>
    <Card style={{boxShadow: "none"}}>
      <div>
        <Toolbar style={{background: "white", boxShadow: "none"}}>
          <ToolbarGroup>
            <ToolbarTitle text={translate('pos.configuration')} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton touch={true}
                        key={'close'}
                        containerElement={<Link to="/" />}>
              <CloseIcon />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>

        {/*<ViewTitle title={translate('pos.configuration')} />*/}
        {/*<IconButton*/}
          {/*key={'close'}*/}
          {/*containerElement={<Link to="/" />}*/}
        {/*><CloseIcon />*/}
        {/*</IconButton>*/}
      </div>
      <CardText>
        <div style={styles.label}>{translate('pos.theme.name')}</div>
        <RaisedButton style={styles.button} label={translate('pos.theme.modern')} primary onClick={() => changeTheme('modern')} />
        <RaisedButton style={styles.button} label={translate('pos.theme.historic')} secondary onClick={() => changeTheme('historic')} />
      </CardText>
      <CardText>
        <div style={styles.label}>{translate('pos.language')}</div>
        <RaisedButton style={styles.button} label="en" primary={locale === 'en'} onClick={() => changeLocale('en')} />
        <RaisedButton style={styles.button} label="fr" primary={locale === 'fr'} onClick={() => changeLocale('fr')} />
      </CardText>
    </Card>
  </Dialog>
);

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
});

// export PostIcon from 'material-ui/svg-icons/action/settings';

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
})(translate(Configuration));
