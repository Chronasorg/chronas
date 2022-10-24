import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'
import ReactHtmlParser from 'react-html-parser'
import axios from 'axios'
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import decodeJwt from 'jwt-decode'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import StarIcon from 'material-ui/svg-icons/action/grade'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { setSubscription, setToken, setPrivilege } from '../menu/authentication/actionReducers'
import { showNotification, Restricted, translate } from 'admin-on-rest'
import { themes, properties } from '../../properties'

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

class SubscribeDialog extends PureComponent {
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
      hiddenElement: true,
      subscriptionCheckoutPlanId: localStorage.getItem('chs_subCheckoutPlanId') || false,
    }
  }

  checkLoginAndGoPlan = (planId) => {
    this.setState({ subscriptionCheckout: planId })
  }

  render () {
    const { theme, subPlan, translate, open, userDetails, setToken, setPrivilege, closePledge, setSubscription, snooze } = this.props
    const { subscriptionCheckout } = this.state
//     const isPro = ((userDetails || {}).subscription && (userDetails || {}).subscription || "").length > 4
    const isLoggedIn = localStorage.getItem('chs_token')

    return <Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open={true}
                contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
                contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }}
                onRequestClose={this.handleClose}>
                <Card style={styles.card}>
                  <div>
                    <Toolbar style={styles.toolbar}>
                      <ToolbarGroup>
                        <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                          text={"Thank you for being Chronas!"} />
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

                    <FlatButton
                    onClick={() => {
                      if (isLoggedIn) {
                          const token = localStorage.getItem('chs_token')
                          const userId = localStorage.getItem("chs_userid")
                          axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/pro_v1/add', {},
                           { 'headers': { 'Authorization': 'Bearer ' + token } })
                                  .then(({ data }) => {
                                  const {token} = data
                                    this.props.setSubscription('pro_v1');
                                    this.props.showNotification("Chronas successfully upgraded");

                               this.props.setToken(token)
                               // TODO: breadcrumb last login delta

                             const decodedToken = decodeJwt(token)
                                  console.debug("decodedToken",decodedToken)
                                  localStorage.setItem('chs_userid', decodedToken.id)
                                  localStorage.setItem('chs_username', decodedToken.username)
                                  localStorage.setItem('chs_subscription', decodedToken.subscription || "-1")
                                  if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
                                  if (decodedToken.score) localStorage.setItem('chs_score', decodedToken.score)
                                  localStorage.setItem('chs_token', token)
                                  const userScore = decodedToken.score || localStorage.getItem('chs_score') || 1
                                  this.props.setUser(token, (decodedToken.name || {}).first || (decodedToken.name || {}).last || decodedToken.email, decodedToken.privilege, decodedToken.avatar, userScore, decodedToken.subscription)


                                    setTimeout(() => this.props.history.push('/'), 1000)
                                 }).catch((e) => {
                                    this.props.showNotification("Something went wrong");
                          });
                      } else {
                                    this.props.setSubscription('pro_v1');
                                    this.props.showNotification("pos.info.tabs.welcome");
                                    setTimeout(() => this.props.history.push('/'), 1000)
                      }

                    }}
                        style={{ margin: 12}}
                          label="Redeem Chronas"
                          labelPosition="before"
                          secondary={true}
                          icon={<StarIcon />}
                        />

                  <p style={{marginLeft: 24 }}>
                  <i>You can use this code on as many machines as you like!</i>
                  { !isLoggedIn && <p style={{color:"red"}}>You are not logged in: some features like modifying data will not be available</p>}
                  </p>

                  </div>
                  <div>
                    {/* <div className="originalPaypalButton"
                                options={{vault: true}}
                                createSubscription={(data, actions) => {


                                  const userId = localStorage.getItem("chs_userid")
                                  if (!userId) alert("Please login first")
                                  return actions.subscription.create({
                                    plan_id: subPlan//this.state.subscriptionCheckoutPlanId
                                  });
                                }}
                                onError={(e) => {
                                  console.debug(e);
                                  this.props.showNotification("Something went wrong")
                                  }}
                                catchError={(e) => {
                                  console.debug(e);
                                  this.props.showNotification("Canceled")
                                  }}
                                  style = {{
                                               layout:  'vertical',
                                               color:   'white',
                                               shape:   'rect',
                                               label:   'pay'
                                             }}
                                onCancel={(e) => {
                                  console.debug(e);
                                  this.props.showNotification("Canceled")
                                  }}
                                onApprove={(data, actions) => {
                                  // Capture the funds from the transaction
                                  return actions.subscription.get().then((details) => {
                                    // Show a success message to your buyer
                                    console.debug("setSubscription",setSubscription,this.props,data,details)

                                    const token = localStorage.getItem('chs_token')
                                    this.props.setSubscription(data.subscriptionID)
                                    const userId = localStorage.getItem("chs_userid")
                                    axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/' + data.subscriptionID + '/add', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
                                            .then((e) => {
                                              this.props.showNotification("pos.info.tabs.welcome");
                                              this.props.history.push('/pro')
                                              console.debug("ok", e)})
                                            .catch((e) => {
                                              this.props.showNotification("Something went wrong");
                                    });
                                  });
                                }}
                              /> */}
                              </div>

                    <Divider />
                            <CardActions>
                            <FlatButton label={'Go Back'} onClick={() =>  this.props.history.push('/pro') } />
                            <FlatButton style={{ right: 0, position: 'absolute' }} label={translate('aor.action.close')} onClick={() => closePledge()} />
                            </CardActions>
                          </Card>
                        </Dialog>
//         </Restricted>
//       )
//       return RestrictedPage
    }

//     return (<Switch style={{ zIndex: 20000 }}>
//                      <Route
//                        path={'/pro/subscribe'}
//                        render={restrictPage()}
//                      />
//                  </Switch>)

//     }
  }

export default connect(state => ({ userDetails: state.userDetails, subPlan: state.subPlan, theme: state.theme }), {
  setSubscription,
  setPrivilege,
  setToken,
  showNotification
})(translate(SubscribeDialog))


/*

<div>
          <PayPalButton
                      options={{vault: true}}
                      createSubscription={(data, actions) => {


                        const userId = localStorage.getItem("chs_userid")
                        if (!userId) alert("Please login first")
                        return actions.subscription.create({
                          plan_id: this.state.subscriptionCheckoutPlanId
                        });
                      }}
                      onError={(e) => {
                        console.debug(e);
                        this.props.showNotification("Something went wrong")
                        }}
                      catchError={(e) => {
                        console.debug(e);
                        this.props.showNotification("Canceled")
                        }}
                        style = {{
                                     layout:  'vertical',
                                     color:   'white',
                                     shape:   'rect',
                                     label:   'pay'
                                   }}
                      onCancel={(e) => {
                        console.debug(e);
                        this.props.showNotification("Canceled")
                        }}
                      onApprove={(data, actions) => {
                        // Capture the funds from the transaction
                        return actions.subscription.get().then((details) => {
                          // Show a success message to your buyer
                          console.debug("setSubscription",setSubscription,this.props,data,details)

                          const token = localStorage.getItem('chs_token')
                          this.props.setSubscription(data.subscriptionID)
                          const userId = localStorage.getItem("chs_userid")
                          axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/' + data.subscriptionID + '/add', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
                                  .then((e) => {
                                    this.props.showNotification("pos.info.tabs.welcome");
                                    console.debug("ok", e)})
                                  .catch((e) => {
                                    this.props.showNotification("Something went wrong");
                          });
                        });
                      }}
                    />
                    </div>
        */
