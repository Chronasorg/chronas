import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ReactHtmlParser from 'react-html-parser'
import axios from 'axios'
import { PayPalButton } from "react-paypal-button-v2"
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import decodeJwt from 'jwt-decode'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
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
      subscriptionCheckoutPlanId: localStorage.getItem('chs_subCheckoutPlanId') || false,
    }
  }

  checkLoginAndGoPlan = (planId) => {
    this.setState({ subscriptionCheckout: planId })
  }

  render () {
    const { theme, translate, open, userDetails, setToken, setPrivilege, closePledge, setSubscription, snooze } = this.props
    const { subscriptionCheckout } = this.state
    const isPro = ((userDetails || {}).subscription && (userDetails || {}).subscription || "").length > 4

    return (<Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open={open}
      contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
      contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }}
      onRequestClose={this.handleClose}>
      <Card style={styles.card}>
        <div>
          <Toolbar style={styles.toolbar}>
            <ToolbarGroup>
              <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                text={translate('pos.pledgeTitle')} />
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
<CardText>
          <p>
            {translate('pos.block.pledge4')}
          </p>
{(userDetails || {}).subscription}
           <FlatButton style={{
    color: 'rgb(255, 64, 129)' }}label={'cancel subscription'} secondary={true}
                        onClick={() => {
                          const token = localStorage.getItem('chs_token')
                          const subId = (userDetails || {}).subscription

                              const userId = localStorage.getItem("chs_userid")

                              axios.put(properties.chronasApiHost + '/users/' + userId + '/subscription/' + subId + '/cancel', {},
                               { 'headers': { 'Authorization': 'Bearer ' + token } })
                                  .then((res) => {
                                  console.debug("tata")
                                    if (((res || {}).data || {}).token) {
                                        const token = res.data.token
                                        setToken(token)
                                        // TODO: breadcrumb last login delta
                                        const decodedToken = decodeJwt(token)
                                        console.debug("decodedToken", decodedToken)
                                        localStorage.setItem('chs_token', token)
                                        if (decodedToken.avatar) localStorage.setItem('chs_avatar', decodedToken.avatar)
                                        if (decodedToken.score) localStorage.setItem('chs_score', decodedToken.score)

                                        localStorage.setItem('chs_subscription', decodedToken.subscription || "-1")
                                        localStorage.setItem('chs_username', decodedToken.username)
                                        localStorage.setItem('chs_userid', decodedToken.id)
                                        localStorage.setItem('chs_privilege', decodedToken.privilege)

                                        setPrivilege(decodedToken.privilege)
                                    }
                                    this.props.showNotification("Subscription successfully canceled!");
                                    this.props.setSubscription("-1")
                                    localStorage.setItem('chs_subscription', "-1")
                                  })
                                  .catch((e) => {
                                    this.props.showNotification("Something went wrong");
                                  });
                            }} />
        </CardText>
</div> : subscriptionCheckout ? <div>
  <FlatButton label={'Go Back'} onClick={() =>  this.setState({ subscriptionCheckout: false }) } />
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
          </div> : <div>
  <CardText>
  <FlatButton label={'SUBSCRIBE WITH PAYPAL Plan 1'} onClick={() => this.checkLoginAndGoPlan('P-7RB838343G9556941MJF4LNY') } />
  <FlatButton label={'SUBSCRIBE WITH PAYPAL Plan 2'} onClick={() => this.checkLoginAndGoPlan('P-7RB838343G9556941MJF4LNY') } />
CHECK FOR LOGIN
            <p>
              { ReactHtmlParser(translate('pos.block.pledge1')) }
            </p>
            <p>
              {translate('pos.block.pledge2')}
                <a className='customLink' target='_blank'
                  href='https://www.patreon.com/chronas'><Avatar
                    style={{ marginRight: 8, marginLeft: 6 }} src='/images/240px-Patreon_logo.svg.png' />
                Patreon</a>
              {translate('pos.block.pledge3')}
            </p>
            <p>
              {translate('pos.block.pledge4')}
            </p>
            <form className="donateButton" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <span>{translate('pos.block.pledge5')}&nbsp;&nbsp;</span>
              <input type="hidden" name="cmd" value="_s-xclick"/>
              <input type="hidden" name="hosted_button_id" value="DLRUFHZSBTBNN"/>
              <input type="image" src="/images/button-PayPal.png" style={{ height: 34 }} border="0" name="submit" alt="Donate with PayPal" title="Donate with PayPal" /><img alt="" border="0" src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif" width="1" height="1"/>
            </form>
          </CardText>
          </div> }

          <Divider />
                  <CardActions>
                    <FlatButton label={translate('pos.pledgeRemind')} onClick={() => snooze()} />
                    <FlatButton label={translate('pos.pledgeOpen')} onClick={() => {
                      var win = window.open('https://www.patreon.com/chronas', '_blank')
                      win.focus()
                    }} />
                    <FlatButton style={{ right: 0, position: 'absolute' }} label={translate('aor.action.close')} onClick={() => closePledge()} />
                  </CardActions>
                </Card>
              </Dialog>
              )
            }
          }

          export default connect(state => ({ userDetails: state.userDetails, theme: state.theme }), {
            setSubscription,
            setPrivilege,
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
