import React, { Component } from 'react'
import { propTypes, reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'
import {Notification, translate, showNotification, userLogin, AUTH_LOGIN} from 'admin-on-rest'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Card, CardActions } from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import CircularProgress from 'material-ui/CircularProgress'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import LockIcon from 'material-ui/svg-icons/action/lock-outline'
import { cyan500, pinkA200 } from 'material-ui/styles/colors'
import { userSignup as userSignupAction, USER_SIGNUP } from './actionReducers'
import { grey50, grey400, chronasMainColor, chronasGradient } from '../../../styles/chronasColors'
import properties from '../../../properties'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    color: 'rgba(255,255,255,0.5)',
  },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent',
  },
  avatar: {
    margin: '1em',
    position: 'absolute',
    textAlign: 'center ',
  },
  form: {
    padding: '0 1em 1em 1em',
  },
  input: {
    color: 'rgba(255,255,255,0.5)',
    display: 'flex',
  },
}

function getColorsFromTheme (theme) {
  if (!theme) return { primary1Color: cyan500, accent1Color: pinkA200 }
  const {
    palette: {
      primary1Color,
      accent1Color,
    },
  } = theme
  return { primary1Color, accent1Color }
}

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({ meta: { touched, error } = {}, input: { ...inputProps }, ...props }) =>
  <TextField
    errorText={touched && error}
    elStyle={styles.labels}
    {...inputProps}
    {...props}
    fullWidth
  />

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hiddenElement: true,
      authMode: 'signIn'
    }
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  login = (auth) => {
    const { userLogin, showNotification } = this.props
    userLogin({...auth, authType: AUTH_LOGIN}, this.props.location.state ? this.props.location.state.nextPathname : '/')
    showNotification('auth.logging_in')
  }

  signup = (auth) => {
    const { userSignup, showNotification } = this.props
    userSignup({...auth, authType: USER_SIGNUP}, this.props.location.state ? this.props.location.state.nextPathname : '/')
    showNotification('auth.signing_up')
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { handleSubmit, submitting, theme, translate } = this.props
    const muiTheme = getMuiTheme(theme)
    const { primary1Color, accent1Color } = getColorsFromTheme(muiTheme)
    const githubAuthUrl = properties.chronasApiHost + '/auth/login/github'
    const facebookAuthUrl = properties.chronasApiHost + '/auth/login/facebook'
    const twitterAuthUrl = properties.chronasApiHost + '/auth/login/twitter'
    const googleAuthUrl = properties.chronasApiHost + '/auth/login/google'
    const signInComponent = <div className='auth-box modal-pane-signin'>
      <div className='modal-header'>
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Sign into Chronas</h4>
      </div>
      <div className='modal-body'>
        <p style={{ textAlign: 'center' }}><span className='auth-form-divider-text'>with one click:</span></p>
        <div className='social-signup-buttons'>
          <div className='signup-button'><a href={githubAuthUrl} title='Sign in with Github' className='btn btn-link-github btn-block'><span className='entypo-social entypo-github' /><span className='signup-button__text'> Github</span></a></div>
          <div className='signup-button'><a href={googleAuthUrl} title='Sign in with Google' className='btn btn-link-google btn-block'><span className='entypo-social entypo-google' /><span className='signup-button__text'> Google</span></a></div>
          <div className='signup-button'><a href={facebookAuthUrl} title='Sign in with Facebook' className='btn btn-link-facebook btn-block'><span className='entypo-social entypo-facebook' /><span className='signup-button__text'> Facebook</span></a></div>
          <div className='signup-button'><a href={twitterAuthUrl} title='Sign in with Twitter' className='btn btn-link-twitter btn-block'><span className='entypo-social entypo-twitter' /><span className='signup-button__text'> Twitter</span></a></div>
        </div>
        <p className='auth-form-divider'><span className='auth-form-divider-text'>or</span></p>
        <form method='post' action='/signin' role='signin' noValidate='novalidate' className='auth-form'>
          <input type='hidden' name='action' value='signin' />
          <input type='hidden' name='target' value='/' />
          <form onSubmit={handleSubmit(this.login)}>
            <div style={styles.form}>
              <div style={styles.input} >
                <Field
                  name='email'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.email')}
                  disabled={submitting}
                />
              </div>
              <div style={styles.input}>
                <Field
                  name='password'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.password')}
                  type='password'
                  disabled={submitting}
                />
              </div>
            </div>
            <CardActions>
              <RaisedButton
                type='submit'
                primary
                disabled={submitting}
                icon={submitting && <CircularProgress size={25} thickness={2} />}
                label={translate('aor.auth.sign_in')}
                fullWidth
              />
            </CardActions>
          </form>
        </form>
        <div className='row text-muted mt-3'>
          <div className='col-sm-8'>Don't have an account? <a href='javascript:;' onClick={() => this.setState({ authMode: 'signUp' })} rel='modal-pane' data-modal-pane='join'>Join Chronas</a></div>
          <div className='col-sm-4 text-right' onClick={() => this.setState({ authMode: 'passwordReset' })}><a href='javascript:;' rel='modal-pane' data-modal-pane='password'>Forgot password?</a></div>
        </div>
      </div>
    </div>
    const signUpComponent = <div className='auth-box modal-pane-join'>
      <div className='modal-header'>
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Join Chronas</h4>
      </div>
      <div className='modal-body'>
        <p style={{ textAlign: 'center' }}><span className='auth-form-divider-text'>with a few clicks:</span></p>
        <div className='social-signup-buttons'>
          <div className='signup-button'><a href={githubAuthUrl} title='Sign in with Github' className='btn btn-link-github btn-block'><span className='entypo-social entypo-github' /><span className='signup-button__text'> Github</span></a></div>
          <div className='signup-button'><a href={googleAuthUrl} title='Sign in with Google' className='btn btn-link-google btn-block'><span className='entypo-social entypo-google' /><span className='signup-button__text'> Google</span></a></div>
          <div className='signup-button'><a href={facebookAuthUrl} title='Sign in with Facebook' className='btn btn-link-facebook btn-block'><span className='entypo-social entypo-facebook' /><span className='signup-button__text'> Facebook</span></a></div>
          <div className='signup-button'><a href={twitterAuthUrl} title='Sign in with Twitter' className='btn btn-link-twitter btn-block'><span className='entypo-social entypo-twitter' /><span className='signup-button__text'> Twitter</span></a></div>
        </div>
        <p className='auth-form-divider'><span className='auth-form-divider-text'>or</span></p>
        <form method='post' action='/signup' role='signup' noValidate='novalidate' className='auth-form'>
          <input type='hidden' name='action' value='signup' />
          <input type='hidden' name='target' value='/' />
          <form onSubmit={handleSubmit(this.signup)}>
            <div style={styles.form}>
              <div style={styles.input} >
                <Field
                  name='email'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.email')}
                  disabled={submitting}
                  />
              </div>
              <div style={styles.input}>
                <Field
                  name='password'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.password')}
                  type='password'
                  disabled={submitting}
                  />
              </div>
              <div style={styles.input}>
                <Field
                  name='username'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.username')}
                  disabled={submitting}
                />
              </div>
              <div style={styles.input}>
                <Field
                  name='first_name'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.first_name')}
                  disabled={submitting}
                  />
              </div>
              <div style={styles.input}>
                <Field
                  name='last_name'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.last_name')}
                  disabled={submitting}
                  />
              </div>
              <div style={styles.input}>
                <Field
                  name='education'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.education')}
                  disabled={submitting}
                />
              </div>
              <div style={styles.input}>
                <Field
                  name='website'
                  component={renderInput}
                  floatingLabelText={translate('aor.auth.website')}
                  disabled={submitting}
                  />
              </div>
            </div>
            <CardActions>
              <RaisedButton
                type='submit'
                primary
                disabled={submitting}
                icon={submitting && <CircularProgress size={25} thickness={2} />}
                label={translate('aor.auth.sign_up')}
                fullWidth
                />
            </CardActions>
          </form>
        </form>
        <p className='text-center text-muted mt-3'>Already have an account? <a onClick={() => this.setState({ authMode: 'signIn' })} href='javascript:;' rel='modal-pane' data-modal-pane='signin'>Sign in</a></p>
      </div>
    </div>
    const passwordResetComponent = <div className='auth-box modal-pane-password'>
      <div className='modal-header'>
        <h4 className='modal-title' style={{ margin: '0 auto' }}>Forgotten your password?</h4>
      </div>
      <div className='modal-body' style={{ marginTop: '2em' }}>
        <form method='post' action='/forgot-password' role='password-retrieval' noValidate='novalidate' className='form-password auth-form'>
          <input type='hidden' name='action' value='forgot-password' />
          <div className='form-groups'>
            <div className='form-group'>
              <label htmlFor='email' className='sr-only'>Email address</label>
              <input type='email' name='email' id='email' placeholder='Email address' className='form-control form-control--first form-control--last' />
            </div>
          </div>
          <button type='submit' data-loading-text='Sending...' className='btn btn-block btn-primary btn-submit'>Send reset link</button>
        </form>
        <p className='text-center text-muted mt-3'>I remember, <a href='javascript:;' rel='modal-pane' data-modal-pane='signin' onClick={() => this.setState({ authMode: 'signIn' })}>sign in</a></p>
      </div>
    </div>

    return (
      <Dialog bodyStyle={{ backgroundImage: chronasGradient }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }} onRequestClose={this.handleClose} >
        <Card style={styles.card}>
          <div style={styles.avatar}>
            <Avatar backgroundColor={chronasMainColor} icon={<LockIcon />} size={60} />
          </div>

          {this.state.authMode === 'signIn' ? signInComponent : null}
          {this.state.authMode === 'signUp' ? signUpComponent : null}
          {this.state.authMode === 'passwordReset' ? passwordResetComponent : null}

          <IconButton className='closeTopRight' iconStyle={{ width: 24, height: 24, color: grey400 }} touch key={'close'} containerElement={<Link to='/' />}>
            <CloseIcon hoverColor={grey50} />
          </IconButton>
        </Card>
      </Dialog>
    )
  }
}

const enhance = compose(
  translate,
  reduxForm({
    form: 'signIn',
    validate: (values, props) => {
      const errors = {}
      const { translate } = props
      if (!values.email) errors.email = translate('aor.validation.required')
      if (!values.password) errors.password = translate('aor.validation.required')
      return errors
    },
  },{
    form: 'signUp',
    validate: (values, props) => {
      const errors = {}
      const { translate } = props
      if (!values.email) errors.email = translate('aor.validation.required')
      if (!values.username) errors.username = translate('aor.validation.required')
      if (!values.password) errors.password = translate('aor.validation.required')
      return errors
    },
  }),
  connect(null, {
    userLogin,
    userSignup: userSignupAction,
    showNotification
  }),
)

export default enhance(Login)
