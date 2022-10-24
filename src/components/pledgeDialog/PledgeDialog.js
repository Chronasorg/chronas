import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ReactHtmlParser from 'react-html-parser'
import axios from 'axios'
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import decodeJwt from 'jwt-decode'
import Divider from 'material-ui/Divider'
import FileCloudDownload from 'material-ui/svg-icons/file/cloud-download';
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CheckCircleIcon from 'material-ui/svg-icons/action/check-circle'
import OpenNewIcon from 'material-ui/svg-icons/action/open-in-new'
import StarIcon from 'material-ui/svg-icons/action/grade'
import OneIcon from 'material-ui/svg-icons/image/looks-one'
import TwoIcon from 'material-ui/svg-icons/image/looks-two'
import ThreeIcon from 'material-ui/svg-icons/image/looks-3'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'
import { setSubscription, setToken, setPrivilege } from '../menu/authentication/actionReducers'
import { changePlan } from '../menu/configuration/actionReducers'
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
      hiddenElement: true,
      activationCode: '',
      activationCodeError: '',
      subscriptionCheckoutPlanId: localStorage.getItem('chs_subCheckoutPlanId') || false,
    }
  }

  checkLoginAndGoPlan = (planId) => {
    this.setState({ subscriptionCheckout: planId })
  }

  isValidCode = () => {
    return (+this.state.activationCode % 13) === 0
  }

  render () {
    const { theme, translate, open, userDetails, setToken, setPrivilege, closePledge, setSubscription, snooze } = this.props
    const { subscriptionCheckout } = this.state
    const isPro = (localStorage.getItem('chs_subscription') && !((userDetails || {}).subscription)) || ((userDetails || {}).subscription && (userDetails || {}).subscription || "").length > 4
console.debug(userDetails);
//     const restrictPage = () => {
//       const RestrictedPage = routeProps => (
//         <Restricted location={{ pathname: '/pro' }} authParams={{ routeProps }} {...routeProps}>
//           <div>
//             <FlatButton label={'Go Back'} onClick={() =>  this.setState({ subscriptionCheckout: false }) } />
//           <div className="paypalbuttonex"
//                       options={{vault: true}}
//                       createSubscription={(data, actions) => {
//
//
//                         const userId = localStorage.getItem("chs_userid")
//                         if (!userId) alert("Please login first")
//                         return actions.subscription.create({
//                           plan_id: this.state.subscriptionCheckoutPlanId
//                         });
//                       }}
//                       onError={(e) => {
//                         console.debug(e);
//                         this.props.showNotification("Something went wrong")
//                         }}
//                       catchError={(e) => {
//                         console.debug(e);
//                         this.props.showNotification("Canceled")
//                         }}
//                         style = {{
//                                      layout:  'vertical',
//                                      color:   'white',
//                                      shape:   'rect',
//                                      label:   'pay'
//                                    }}
//                       onCancel={(e) => {
//                         console.debug(e);
//                         this.props.showNotification("Canceled")
//                         }}
//                       onApprove={(data, actions) => {
//                         // Capture the funds from the transaction
//                         return actions.subscription.get().then((details) => {
//                           // Show a success message to your buyer
//                           console.debug("setSubscription",setSubscription,this.props,data,details)
//
//                           const token = localStorage.getItem('chs_token')
//                           this.props.setSubscription(data.subscriptionID)
//                           const userId = localStorage.getItem("chs_userid")
//                           axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/' + data.subscriptionID + '/add', {}, { 'headers': { 'Authorization': 'Bearer ' + token } })
//                                   .then((e) => {
//                                     this.props.showNotification("pos.info.tabs.welcome");
//                                     console.debug("ok", e)})
//                                   .catch((e) => {
//                                     this.props.showNotification("Something went wrong");
//                           });
//                         });
//                       }}
//                     />
//                     </div>
//         </Restricted>
//       )
//       return RestrictedPage
//     }

    return (<Dialog bodyStyle={{ overflow: 'auto', backgroundImage: themes[theme].gradientColors[0] }} open={open}
      contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
      contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }}
      onRequestClose={this.handleClose}>
      <Card style={styles.card}>
        <div>
          <Toolbar style={styles.toolbar}>
            <ToolbarGroup>
              <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 600 }}
                text={ isPro ? 'Thank you for your support!' : <span>Upgrade Chronas<StarIcon color={themes[theme].highlightColors[0]} width={64} height={64} style={{width: "64px", height: "64px"}} /> Pay what you want!</span> } />
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
{ isPro ? <div>
<CardText><List dense={true}>
                            <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                            primaryText={<b>Full Features</b>}
                            secondaryText="Unlimited markers, epics and media, access to the community board & more"  />
                            <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                            primaryText={<b>No Ads</b>}
                            secondaryText="More content space where ads used to be!" />
                            <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}

                            secondaryText="Join the discussion on Patreon how the new remake should look like!"
                            primaryText={<div><b>
                            Support the development</b> of a <a className={'customLink'} target='_blank' href='https://www.patreon.com/posts/past-present-and-73703992'>complete rewrite</a><OpenNewIcon style={{
                                                                                                                                                                                                                           marginLeft: 0,
                                                                                                                                                                                                                               marginTop: -14,
                                                                                                                                                                                                                               height: 14,
                                                                                                                                                                                                                               width: 14 }} width={8} height={8} /></div>} />

                                <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                                                  primaryText={<b>Full write permissions</b>}
                                                  secondaryText="As a trusted supporter of the project, if you see false data - simply change it!" />
                        </List>
                          <Divider inset={false} />
          <p>
          <br/>
            <b> You can manage your subscription here: <a className='customLink' target='_blank'
href='https://www.patreon.com/chronas'><Avatar
style={{ marginRight: 8, marginLeft: 6,
height: 24,
width: 24,
marginBottom: 4,
marginTop: -2
}} src='/images/240px-Patreon_logo.svg.png' />
Patreon <OpenNewIcon style={{
marginLeft: -2,
marginTop: -14,
height: 14,
width: 14

}} width={8} height={8} /> </a></b>
          </p>
{/*            <FlatButton style={{ */}
{/*     color: 'rgb(255, 64, 129)' }}label={'withdraw patreon activation code'} secondary={true} */}
{/*                         onClick={() => { */}
{/*                           const token = localStorage.getItem('chs_token') */}
{/*                           const subId = (userDetails || {}).subscription */}

{/*                           alert("If you no longer want to support Chronas, make sure to also cancel your subscription on Patreon.") */}
{/*                           if (!token) { */}

{/*                                     localStorage.removeItem('chs_subscription') */}
{/*                                     this.props.showNotification("Activation Code withdrawn!"); */}
{/*                                     this.props.setSubscription("-1") */}
{/*                                     this.props.setPrivilege(1) */}
{/*                                     return */}
{/*                           } */}

{/*                               const userId = localStorage.getItem("chs_userid") */}

{/*                               axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/' + subId + '/cancel', {}, */}
{/*                                { 'headers': { 'Authorization': 'Bearer ' + token } }) */}
{/*                                   .then((res) => { */}
{/*                                   console.debug("tata") */}
{/*                                     if (((res || {}).data || {}).token) { */}
{/*                                         const token = res.data.token */}
{/*                                         setToken(token) */}
{/*                                         // TODO: breadcrumb last login delta */}
{/*                                         const decodedToken = decodeJwt(token) */}
{/*                                         console.debug("decodedToken", decodedToken) */}
{/*                                         localStorage.setItem('chs_token', token) */}
{/*                                         if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar) */}
{/*                                         if (decodedToken.score) localStorage.setItem('chs_score', decodedToken.score) */}

{/*                                         localStorage.setItem('chs_subscription', decodedToken.subscription || "-1") */}
{/*                                         localStorage.setItem('chs_username', decodedToken.username) */}
{/*                                         localStorage.setItem('chs_userid', decodedToken.id) */}
{/*                                         localStorage.setItem('chs_privilege', decodedToken.privilege) */}

{/*                                         setPrivilege(decodedToken.privilege) */}
{/*                                     } */}
{/*                                     this.props.showNotification("Activation code withdrawn!"); */}
{/*                                     this.props.setSubscription("-1") */}
{/*                                     localStorage.setItem('chs_subscription', "-1") */}
{/*                                   }) */}
{/*                                   .catch((e) => { */}
{/*                                     this.props.showNotification("Something went wrong"); */}
{/*                                   }); */}
{/*                             }} /> */}
 <p>
            <i>If you have any questions or need help <a
                                                                                    className='customLink' style={{ color: themes[theme].highlightColors[0] }}
                                                                                    onClick={() => this.props.history.push('/info/contact')}>Contact Us</a></i>
            </p>
        </CardText>
</div> : <div>
  <CardText>

{/*
  <FlatButton label={'SUBSCRIBE WITH PAYPAL Plan 1'} onClick={() => { this.props.changePlan('P-7RB838343G9556941MJF4LNY'); this.props.history.push('/pro/subscribe') }} />
  <FlatButton label={'SUBSCRIBE WITH PAYPAL Plan 2'} onClick={() => { this.props.changePlan('P-7RB838343G9556941MJF4LNY'); this.props.history.push('/pro/subscribe') }} />
CHECK FOR LOGIN
            <p>
              { ReactHtmlParser(translate('pos.block.pledge1')) }
            </p> */}
             <List dense={true}>
                  <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                  primaryText={<b>Full Features</b>}
                  secondaryText="Unlimited markers, epics and media, access to the community board & more"  />
                  <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                  primaryText={<b>No Ads</b>}
                  secondaryText="More content space where ads used to be!" />
                  <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}

                  secondaryText="Join the discussion on Patreon how the new remake should look like!"
                  primaryText={<div><b>
                  Support the development</b> of a <a className={'customLink'} target='_blank' href='https://www.patreon.com/posts/past-present-and-73703992'>complete rewrite</a><OpenNewIcon style={{
                                                                                                                                                                                                                 marginLeft: 0,
                                                                                                                                                                                                                     marginTop: -14,
                                                                                                                                                                                                                     height: 14,
                                                                                                                                                                                                                     width: 14 }} width={8} height={8} /></div>} />

                      <ListItem leftIcon={<CheckCircleIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                                        primaryText={<b>Full write permissions</b>}
                                        secondaryText="As a trusted supporter of the project, if you see false data - simply change it!" />
              </List>
                <Divider inset={false} />
            <br/><b>
            Supporting Chronas is quick and easy:
            </b>
             <List dense={true}>
                  <ListItem leftIcon={<OneIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                  primaryText={<div>Head over to <a className='customLink' target='_blank'
                                                                       href='https://www.patreon.com/chronas'><Avatar
                                                                         style={{ marginRight: 8, marginLeft: 6,
                                                                          height: 24,
                                                                              width: 24,
                                                                              marginBottom: 4,
                                                                              marginTop: -2
                                                                              }} src='/images/240px-Patreon_logo.svg.png' />
                                                                     Patreon <OpenNewIcon style={{
                                                                     marginLeft: -2,
                                                                         marginTop: -14,
                                                                         height: 14,
                                                                         width: 14

                                                                     }} width={8} height={8} /> </a>and pledge an amount of your choice! <b>Whatever Chronas is worth to you!</b></div>} />
                  <ListItem leftIcon={<TwoIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                  primaryText="Check your inbox" />
                  <ListItem leftIcon={<ThreeIcon color={themes[theme].highlightColors[0]} />} disabled={true} insetChildren={true}
                  primaryText={<div style={{marginTop: '-16px'}}>
                 Paste the Activation Code <TextField id="activationCodeField" style={{ width: 100, marginLeft: 12, marginRight: 12 }}
                                         hintText="here"
                                         onChange={(event, newValue) => this.setState({ activationCode: newValue })}
                                         errorText={this.state.activationCodeError}
                                       /> and hit  <RaisedButton
                                                                      label={'Submit'}
                                                                      style={{ marginLeft: 12}}
                                                                      onClick={(event) => {

                                                                      if (this.isValidCode()) {
                                                                        this.setState( { activationCodeError: "" })
                                                                        this.props.showNotification("Activation Code valid!");
                                                                        this.props.changePlan('P-7RB838343G9556941MJF4LNY');
                                                                        this.props.history.push('/pro/subscribe');
                                                                      } else {
                                                                        this.setState( { activationCodeError: "incorrect code" })
                                                                        this.props.showNotification("Activation Code seems to be incorrect");

                                                                      }

//                                                                         showNotification("Successfully submitted, redirecting now...")
//                                                                         setTimeout(() => window.location.href="https://chronas.org", 2000)
//                                                                         event.preventDefault();
                                                                        // this.setState({quizStepIndex: 0, quizFinished: false});
                                                                      }}
                                                                    /></div>} />

              </List>
            <p>
            <i>If you have any questions or need help <a
                                                                                    className='customLink' style={{ color: themes[theme].highlightColors[0] }}
                                                                                    onClick={() => this.props.history.push('/info/contact')}>Contact Us</a></i>
            </p>
{/*             <p> */}
{/*               {translate('pos.block.pledge2')} */}
{/*                 <a className='customLink' target='_blank' */}
{/*                   href='https://www.patreon.com/chronas'><Avatar */}
{/*                     style={{ marginRight: 8, marginLeft: 6 }} src='/images/240px-Patreon_logo.svg.png' /> */}
{/*                 Patreon</a> */}
{/*               {translate('pos.block.pledge3')} */}
{/*             </p> */}
{/*             <p> */}
{/*               {translate('pos.block.pledge4')} */}
{/*             </p> */}
{/*             <form className="donateButton" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"> */}
{/*               <span>{translate('pos.block.pledge5')}&nbsp;&nbsp;</span> */}
{/*               <input type="hidden" name="cmd" value="_s-xclick"/> */}
{/*               <input type="hidden" name="hosted_button_id" value="DLRUFHZSBTBNN"/> */}
{/*               <input type="image" src="/images/button-PayPal.png" style={{ height: 34 }} border="0" name="submit" alt="Donate with PayPal" title="Donate with PayPal" /><img alt="" border="0" src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif" width="1" height="1"/> */}
{/*             </form> */}
          </CardText>
          </div> }

          <Divider />
                  <CardActions>
                    <FlatButton style={{  }} label={translate('aor.action.close')} onClick={() => closePledge()} />
                  </CardActions>
                </Card>
              </Dialog>
              )
            }
          }

export default connect(state => ({ userDetails: state.userDetails, theme: state.theme }), {
  setSubscription,
  setPrivilege,
  changePlan,
  setToken,
  showNotification
})(translate(PledgeDialog))

/**
<div id="paypal-button-container-P-7RB838343G9556941MJF4LNY"></div>
yq
      style: {
          shape: 'rect',
          color: 'white',
          layout: 'horizontal',
          label: 'subscribe'
      },
      createSubscription: function(data, actions) {
        return actions.subscription.create({
          // Creates the subscription
          plan_id: 'P-2DG92832TU634905MMIFCXYA'
        });
      },
      onApprove: function(data, actions) {
        // do add user privilege to timestamp 1 month from now (?)
        alert(data.subscriptionID); // You can add optional success message for the subscriber here
      }
  }).render('#paypal-button-container-P-2DG92832TU634905MMIFCXYA'); // Renders the PayPal button
</script>







<div id="paypal-button-container-P-2SE90484UT842910AMIFDCFY"></div>
<script src="https://www.paypal.com/sdk/js?client-id=AbxiFy63NVZ5DIC-bEI7rgp1iYpaZkeJSR_WDj60WPP-TQ6lfQhR6_Ex5LT_AeipBK1QTMX9oX7s0Wr8&vault=true&intent=subscription" data-sdk-integration-source="button-factory"></script>
<script>
  paypal.Buttons({
      style: {
          shape: 'rect',
          color: 'white',
          layout: 'horizontal',
          label: 'subscribe'
      },
      createSubscription: function(data, actions) {
        return actions.subscription.create({
          // Creates the subscription
          plan_id: 'P-2SE90484UT842910AMIFDCFY'
        });
      },
      onApprove: function(data, actions) {
        alert(data.subscriptionID); // You can add optional success message for the subscriber here
      }
  }).render('#paypal-button-container-P-2SE90484UT842910AMIFDCFY'); // Renders the PayPal button
</script>






sandbox: <div id="paypal-button-container-P-24929775D9861254YMIJJ6PQ"></div>
<script src="https://www.paypal.com/sdk/js?client-id=AYxTwJ35cx6UjyodB-sDWHhi1BFz6ivTbagUSgfpB6wp5vQNeIjhVb6zZZd1a_UpXuTVNeM_W_Dq-yeK&vault=true&intent=subscription" data-sdk-integration-source="button-factory"></script>
<script>
  paypal.Buttons({
      style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
      },
      createSubscription: function(data, actions) {
        return actions.subscription.create(
          plan_id: 'P-24929775D9861254YMIJJ6PQ'
        });
      },
      onApprove: function(data, actions) {
        alert(data.subscriptionID); // You can add optional success message for the subscriber here
      }
  }).render('#paypal-button-container-P-24929775D9861254YMIJJ6PQ'); // Renders the PayPal button
</script>


buyer:

sb-mrztv14068953@personal.example.com
l(P/W|4q

Email ID:
sb-2tl8710494634@personal.example.com
System Generated Password:
#__+9Tgb


Email ID:
sb-qu43w214047863@business.example.com
System Generated Password:
6W.-rK_6


new buyer:
sb-cysju15140091@personal.example.com
0,Bfbv<?

new business:
sb-unppw15161824@business.example.com
Ye=_Z18s

https://developer.paypal.com/api/subscriptions/v1/
 *
 */
