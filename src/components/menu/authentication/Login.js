import React, { Component } from 'react';
import { propTypes, reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Card, CardActions } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import CircularProgress from 'material-ui/CircularProgress';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import LockIcon from 'material-ui/svg-icons/action/lock-outline';
import { cyan500, pinkA200 } from 'material-ui/styles/colors';
import { grey50, grey400, chronasMainColor, chronasGradient } from '../../../styles/chronasColors'
import { Notification, translate, showNotification } from 'admin-on-rest'
// import { userLogin as userLoginAction } from './actionReducers';
import { userLogin } from 'admin-on-rest';
const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent',
  },
  avatar: {
    margin: '1em',
    textAlign: 'center ',
  },
  form: {
    padding: '0 1em 1em 1em',
  },
  input: {
    display: 'flex',
  },
};

function getColorsFromTheme(theme) {
  if (!theme) return { primary1Color: cyan500, accent1Color: pinkA200 };
  const {
    palette: {
      primary1Color,
      accent1Color,
    },
  } = theme;
  return { primary1Color, accent1Color };
}

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({ meta: { touched, error } = {}, input: { ...inputProps }, ...props }) =>
  <TextField
    errorText={touched && error}
    {...inputProps}
    {...props}
    fullWidth
  />;

class Login extends Component {
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

  login = (auth) => {
    const { userLogin, showNotification } = this.props;
    showNotification("Logged in")
    userLogin(auth, this.props.location.state ? this.props.location.state.nextPathname : '/');
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render() {
    const { handleSubmit, submitting, theme, translate } = this.props;
    const muiTheme = getMuiTheme(theme);
    const { primary1Color, accent1Color } = getColorsFromTheme(muiTheme);
    return (
      <Dialog bodyStyle={{ backgroundImage: chronasGradient }} open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
              contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}} onRequestClose={this.handleClose} >
          <Card style={styles.card}>
            <IconButton className="closeTopRight" iconStyle={{width: 24, height: 24, color: grey400}} touch={true} key={'close'} containerElement={<Link to="/"/>}>
              <CloseIcon
                hoverColor={grey50}/>
            </IconButton>
            <div style={styles.avatar}>
              <Avatar backgroundColor={chronasMainColor} icon={<LockIcon />} size={60} />
            </div>
            <form onSubmit={handleSubmit(this.login)}>
              <div style={styles.form}>
                <div style={styles.input} >
                  <Field
                    name="username"
                    component={renderInput}
                    floatingLabelText={translate('aor.auth.username')}
                    disabled={submitting}
                  />
                </div>
                <div style={styles.input}>
                  <Field
                    name="password"
                    component={renderInput}
                    floatingLabelText={translate('aor.auth.password')}
                    type="password"
                    disabled={submitting}
                  />
                </div>
              </div>
              <CardActions>
                <RaisedButton
                  type="submit"
                  primary
                  disabled={submitting}
                  icon={submitting && <CircularProgress size={25} thickness={2} />}
                  label={translate('aor.auth.sign_in')}
                  fullWidth
                />
              </CardActions>
            </form>
          </Card>
      </Dialog>
    );
  }
}

const enhance = compose(
  translate,
  reduxForm({
    form: 'signIn',
    validate: (values, props) => {
      const errors = {};
      const { translate } = props;
      if (!values.username) errors.username = translate('aor.validation.required');
      if (!values.password) errors.password = translate('aor.validation.required');
      return errors;
    },
  }),
  connect(null, {
    userLogin,
    showNotification
  }),
);

export default enhance(Login);
