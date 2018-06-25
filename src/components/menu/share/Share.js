import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import { translate, Restricted } from 'admin-on-rest';
import { chronasGradient } from '../../../styles/chronasColors';

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

class Share extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { hiddenElement: true }
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
    const {theme, locale, changeTheme, changeLocale, menuItemActive, translate} = this.props;

    return (
      <Dialog bodyStyle={{ backgroundImage: '#fff' }} open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal modalMenu"}
              contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={translate('pos.share')}/>
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton touch={true} key={'close'} containerElement={<Link to="/"/>}>
                  <CloseIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <CardText>
            <div style={styles.label}>{translate('pos.theme.name')}</div>
            <RaisedButton style={styles.button} label={translate('pos.theme.modern')} primary
                          onClick={() => changeTheme('modern')}/>
            <RaisedButton style={styles.button} label={translate('pos.theme.historic')} secondary
                          onClick={() => changeTheme('historic')}/>
          </CardText>
          <CardText>
            <div style={styles.label}>{translate('pos.language')}</div>
            <RaisedButton style={styles.button} label="en" primary={locale === 'en'}
                          onClick={() => changeLocale('en')}/>
            <RaisedButton style={styles.button} label="fr" primary={locale === 'fr'}
                          onClick={() => changeLocale('fr')}/>
          </CardText>
        </Card>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, {
})(translate(Share));
