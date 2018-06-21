import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import { chronasGradient } from '../../../styles/chronasColors';

import {
  translate,
  BooleanField,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  Edit,
  Filter,
  FormTab,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  Restricted,
  ReferenceManyField,
  TabbedForm,
  TextField,
  TextInput,
} from 'admin-on-rest';

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

class Information extends PureComponent {
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
    //  https://github.com/marmelab/admin-on-rest-demo/blob/0e2c183b30413bee71ef73e7c36b426da5c58d9a/src/visitors/index.js
    return (
      <Restricted authParams={{ foo: 'bar' }} location={{ pathname: 'Information' }}>
        <Dialog bodyStyle={{ backgroundImage: '#fff' }} open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
                contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}} onRequestClose={this.handleClose}>
          <Card style={styles.card}>
            <div>
              <Toolbar style={styles.toolbar}>
                <ToolbarGroup>
                  <ToolbarTitle text={translate('pos.information')}/>
                </ToolbarGroup>
                <ToolbarGroup>
                  <IconButton touch={true} key={'close'} containerElement={<Link to="/"/>}>
                    <CloseIcon />
                  </IconButton>
                </ToolbarGroup>
              </Toolbar>
            </div>
            <TabbedForm>
              <FormTab label="information.help">
                Intro videos and maybe walkthrough tutorial
              </FormTab>
              <FormTab label="information.about">
                In development by Dietmar & Joachim Aumann
              </FormTab>
            </TabbedForm>
          </Card>
        </Dialog>
      </Restricted>
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
})(translate(Information));
