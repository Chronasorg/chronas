import React, { PureComponent } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'
import Avatar from 'material-ui/Avatar'
import { Card, CardActions, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { setArea, changeLabel, changeColor, setEpic, setMarker } from '../../../components/menu/layers/actionReducers'
import { selectAreaItem } from '../../map/actionReducers'
import { List, ListItem } from 'material-ui/List'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { toggleVoice as toggleVoiceAction } from './../layers/actionReducers'
import { Restricted, translate } from 'admin-on-rest'
import { themes } from '../../../properties'

import VoiceOnIcon from 'material-ui/svg-icons/av/mic'
import VoiceOffIcon from 'material-ui/svg-icons/av/mic-off'
import {connect} from "react-redux";
import {setYear} from "../../map/timeline/actionReducers";

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

/*

function speak(preSpeak){
  tiroAnimation.classList.remove("listenAnimation")
  var toSpeak = preSpeak
  if (preSpeak === 'computer' && !activeConversation) {
    activeConversation = true
    toSpeak = 'I am listening'
  }

  if (!activeConversation && toSpeak.indexOf('computer') === -1) return
  else if (!activeConversation && toSpeak.indexOf('computer') > -1) toSpeak = toSpeak.replace('computer ', '')

  if ((preSpeak === 'stop listening' || preSpeak === 'goodbye') && activeConversation) {
    activeConversation = false
    toSpeak = 'Goodbye'
  }

  if (toSpeak === 'stop') {
    if (timeoutResumeInfinity !== false) {
      timeoutResumeInfinity = false;
      clearInterval(timeoutResumeInfinity);
    }
    return synth.pause()

  }
  else if (toSpeak === 'cancel') {
    if (timeoutResumeInfinity !== false) {
      timeoutResumeInfinity = false;
      clearInterval(timeoutResumeInfinity);
    }
    return synth.cancel()
  }
  else if (toSpeak === 'continue') {
    resumeInfinity()
    return synth.resume()
  }

  if (toSpeak === 'mute') {
    actualSpeak("Mute activated")
    return isMuted = true
  }
  else if (toSpeak === 'unmute') {
    isMuted = false
    return actualSpeak("Mute disabled")
  }
  else if (toSpeak === 'status') { return getStatus() }
  else if (toSpeak.indexOf('weather') > -1) {
    const q = (toSpeak.split('weather ') || [])[1] || "Madison"
    return getWeather(q)
      .then(function(preLabelList) {
        const labelList = (preLabelList || {}).list
        if (labelList.length === 0) {
          return actualSpeak('Couldn\'t find any weather at location ' + q)
        }
        else {

          return actualSpeak('Weather in ' + q + ': '+ labelList.filter((el, index) => [0,1,2,4].indexOf(index) > -1).map((el) => {
            return (Math.round(el.main.temp - 273.15)) + "°C with " + el.weather[0].description + " at " + new Date(el.dt * 1000).getHours() + "\n"
          }).join('') +'', 'Weather in ' + q + ': '+ labelList.filter((el, index) => [0,1,2,4].indexOf(index) > -1).map((el) => {
            return "<p><img style=\"margin-bottom: -18px\" alt=\"icon\" src=\"//openweathermap.org/img/wn/" + el.weather[0].icon + "@2x.png\" width=\"50\" height=\"50\"> " + (Math.round(el.main.temp - 273.15)) + "°C with " + el.weather[0].description + " at <b>" + new Date(el.dt * 1000).getHours() + "</b></p>"
          }).join('') +'')
        }
      })
  }
  else if (toSpeak.indexOf('hacker news') > -1) {
    const potentialHackerNewsCount = toSpeak.split('hacker news ')[1]
    return getHackerNews(isNaN(potentialHackerNewsCount) ? 5 : +potentialHackerNewsCount)
      .then(function(labelList) {
        if (labelList.length === 0) {
          return actualSpeak('Couldn\'t find any hacker news')
        }
        else {
          return actualSpeak('Found ' + labelList.length + ' hacker news:\n" '+ labelList.map((el, index) => {
            return iteratedNumbers(index+1) + " : " + el.title + "\"\n"
          }).join(', ') +'', 'Found  <b>' + labelList.length + '</b> <a href=\'https://news.ycombinator.com/\' target=\'_blank\'>hacker news</a>:<br/><br/>'+ labelList.map((el, index) => {
            return iteratedNumbers(index+1) + ": " + el.title + "<br/><a href='" + el.url + "' target='_blank'>" + el.url + "</a><br/><br/>"
          }).join(' ') +'"')
        }
      })
  }
  else if (toSpeak.indexOf('news') > -1) {
    const q = (toSpeak.split('news ') || [])[1]
    return getNews(q)
      .then(function(preLabelList) {
        const labelList = (preLabelList || {}).articles
        if (labelList.length === 0) {
          return actualSpeak('Couldn\'t find any general news')
        }
        else {
          return actualSpeak('Found ' + labelList.length + ' news:\n" '+ labelList.map((el, index) => {
            return iteratedNumbers(index+1) + " by " + el.source.name + ": " + el.title + "\"\n"
          }).join(', ') +'', 'Found  <b>' + labelList.length + '</b> <a href=\'https://news.ycombinator.com/\' target=\'_blank\'>news</a>:<br/><br/>'+ labelList.map((el, index) => {
            return (iteratedNumbers(index+1) + " " + el.source.name + ": " + el.title + "<br/><a href='" + el.url + "' target='_blank'>" + el.url + "</a><br/><br/>"
            )}).join(' ') +'"')
        }
      })
  }
  else if (toSpeak.indexOf('look up list ') > -1) {
    //  http://sites.linkeddata.center/help/devop/examples/sparql-examples
    var needle = toSpeak.indexOf('look up list ')
    var keyword = toSpeak.substr(needle + 'look up list '.length)
    var potentialLimitCount = toSpeak.substr(toSpeak.lastIndexOf(' ') + 1)
    if (!isNaN(potentialLimitCount)) keyword = keyword.substr(0, keyword.lastIndexOf(' '))
    keyword_to_dbpediaId(keyword, true, isNaN(potentialLimitCount) ? false : +potentialLimitCount)
      .then(function(labelList) {
        if (labelList.length === 0) {
          return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
        }
        else {
          return actualSpeak('Found ' + labelList.length + ' results:\n" '+ labelList.map((el, index) => {
            return iteratedNumbers(index+1) + " Option: \"" + el + "\".\n"
          }).join(', ') +'"')
        }
      })
    return
  }
  else if (toSpeak.indexOf('look up ') > -1) {
    //  http://sites.linkeddata.center/help/devop/examples/sparql-examples
    var needle = toSpeak.indexOf('look up ')
    var keyword = toSpeak.substr(needle + 'look up '.length)
    return keyword_to_dbpediaId(keyword)
      .then(function(preDbpediaId) {
        var dbpediaId = preDbpediaId[0]
        var label = preDbpediaId[1]
        if (!dbpediaId) return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
        dbpediaId_to_abstract(dbpediaId)
          .then(function(abstract) {
            if (!abstract) return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
            actualSpeak('Found: "' + label + '".\n' +abstract)
          })
      })

  }
  else if (toSpeak.indexOf('quote popular') > -1 || toSpeak === "quote") {
    return fetch(openAPIs.quotePopular)
      .then(function (response) {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
      .then(function (resDataPre) {
        const resData = resDataPre.quote || {}
        if(resData.body) return actualSpeak("Quote by " + resData.author + ": " + resData.body)
      })
  }
  else if (toSpeak.indexOf('quote programming') > -1) {
    return fetch(openAPIs.quoteProgramming)
      .then(function (response) {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
      .then(function (resData) {
        if(resData.en) return actualSpeak("Quote by " + resData.author + ": " + resData.en)
      })
  }
  else if (toSpeak === "time" || toSpeak.indexOf("what is the time") > -1) {
    return actualSpeak("The time is " + new Date().getHours() + " hours, " + new Date().getMinutes() + " minutes and " + new Date().getSeconds() + " seconds")
  }
  else if (toSpeak.indexOf("remind me in ") > -1) {
    const currTime = new Date()
    const note = toSpeak.split(' to ')[1]
    const duration = toSpeak.split(' in ')[1].split(' to ')[0]
    const durationValue = +duration.split(' ')[0]
    var currReminderLength = reminders.length
    if (duration.split(' ')[1] === 'minute' || duration.split(' ')[1] === 'minutes') {
      currTime.setMinutes(currTime.getMinutes() + durationValue)
      reminders.push(setInterval(() => remind(currReminderLength, currTime.getTime(), note, 4), 1000))
      return actualSpeak("I will remind you to " + note + " in " + duration)
    } else if (duration.split(' ')[1] === 'second' || duration.split(' ')[1] === 'seconds') {
      currTime.setSeconds(currTime.getSeconds() + durationValue)
      reminders.push(setInterval(() => remind(currReminderLength, currTime.getTime(), note, 4), 1000))
      return actualSpeak("I will remind you to " + note + " in " + duration)
    } else if (duration.split(' ')[1] === 'hour' || duration.split(' ')[1] === 'hours') {
      currTime.setHours(currTime.getHours() + durationValue)
      reminders.push(setInterval(() => remind(currReminderLength, currTime.getTime(), note, 4), 1000))
      return actualSpeak("I will remind you to " + note + " in " + duration)
    }
    return
  }

  actualSpeak(toSpeak === preSpeak ? ('') : toSpeak) // err sound
}
*/

const synth = window.speechSynthesis;
const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const grammar = '#JSGF V1.0; grammar phrase;';
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
let voices = [];
let timeoutResumeInfinity = false;
let statusInterval = false;
let isMuted = false;

function resumeInfinity() {
  if (timeoutResumeInfinity === false) timeoutResumeInfinity = setInterval(() => resumeSpeech(), 1000);
}

function resumeSpeech() {
  if (timeoutResumeInfinity !== false) window.speechSynthesis.resume()
}

class Voice extends PureComponent {
  componentDidMount = () => {
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    // recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 10;
    recognition.onresult = function(event) {
      var speechResult = event.results[0][0].transcript.toLowerCase();
      this.actOnSpeech(speechResult);
      console.log('Speech received: ' + speechResult + '. Confidence: ' + event.results[0][0].confidence);
    }.bind(this)
    recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
      resumeInfinity();
    }

    recognition.onerror = function(event) {
      console.debug('Error occurred in recognition: ' + event.error);
    }

    recognition.onaudiostart = function(event) {
      //Fired when the user agent has started to capture audio.
      console.log('SpeechRecognition.onaudiostart');
    }

    recognition.onaudioend = function(event) {
      //Fired when the user agent has finished capturing audio.
      console.log('SpeechRecognition.onaudioend');
    }

    recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
    }

    recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
    }

    recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend')
      // tiroAnimation.classList.remove("listenAnimation")
    }

    recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
      // tiroAnimation.classList.add("listenAnimation")
    }


    recognition.onend = function (event) {
      //Fired when the speech recognition service has disconnected.
      if (this.props.voiceActive) recognition.start();
      console.log('SpeechRecognition.onend', this.props.voiceActive);
      // tiroAnimation.classList.remove("listenAnimation")
    }.bind(this)

    voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname === bname ) return 0;
      else return +1;
    });

    this.setState({ hiddenElement: false })
  }

  actualSpeak = (toSpeak, toPrint = toSpeak) => {
    if (isMuted) return
    if (synth.speaking) {
      synth.cancel()
    }

    var utterThis = new SpeechSynthesisUtterance(toSpeak);
    utterThis.onend = function (event) {
      // fullOutput.innerHTML = ''
      console.log('SpeechSynthesisUtterance.onend');
      if (timeoutResumeInfinity !== false) {
        clearInterval(timeoutResumeInfinity);
        timeoutResumeInfinity = false
      }
    }
    utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
    }
    var selectedOption = 'Google US English'

    for(let i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    // utterThis.pitch = 0.3;
    // utterThis.rate = 1.2;
    synth.speak(utterThis);
  }

  actOnSpeech = (preSpeak) => {
    console.debug('acting on: ' + preSpeak)
    // tiroAnimation.classList.remove("listenAnimation")
    var toSpeak = preSpeak
    // if (preSpeak === 'computer' && !activeConversation) {
    //   activeConversation = true
    //   toSpeak = 'I am listening'
    // }
    //
    // if (!activeConversation && toSpeak.indexOf('computer') === -1) return
    // else if (!activeConversation && toSpeak.indexOf('computer') > -1) toSpeak = toSpeak.replace('computer ', '')

    // if ((preSpeak === 'stop listening' || preSpeak === 'goodbye') && activeConversation) {
    //   // activeConversation = false
    //   toSpeak = 'Goodbye'
    // }

    if (toSpeak === 'stop') {
      if (timeoutResumeInfinity !== false) {
        timeoutResumeInfinity = false;
        clearInterval(timeoutResumeInfinity);
      }
      return synth.pause()

    }
    else if (toSpeak === 'cancel') {
      if (timeoutResumeInfinity !== false) {
        timeoutResumeInfinity = false;
        clearInterval(timeoutResumeInfinity);
      }
      return synth.cancel()
    }
    else if (toSpeak === 'continue') {
      resumeInfinity()
      return synth.resume()
    }

    // if (toSpeak === 'mute') {
    //   actualSpeak("Mute activated")
    //   return isMuted = true
    // }
    // else if (toSpeak.indexOf('look up list ') > -1) {
    //   //  http://sites.linkeddata.center/help/devop/examples/sparql-examples
    //   var needle = toSpeak.indexOf('look up list ')
    //   var keyword = toSpeak.substr(needle + 'look up list '.length)
    //   var potentialLimitCount = toSpeak.substr(toSpeak.lastIndexOf(' ') + 1)
    //   if (!isNaN(potentialLimitCount)) keyword = keyword.substr(0, keyword.lastIndexOf(' '))
    //   keyword_to_dbpediaId(keyword, true, isNaN(potentialLimitCount) ? false : +potentialLimitCount)
    //     .then(function(labelList) {
    //       if (labelList.length === 0) {
    //         return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
    //       }
    //       else {
    //         return actualSpeak('Found ' + labelList.length + ' results:\n" '+ labelList.map((el, index) => {
    //           return iteratedNumbers(index+1) + " Option: \"" + el + "\".\n"
    //         }).join(', ') +'"')
    //       }
    //     })
    //   return
    // }
    // else if (toSpeak.indexOf('look up ') > -1) {
    //   //  http://sites.linkeddata.center/help/devop/examples/sparql-examples
    //   var needle = toSpeak.indexOf('look up ')
    //   var keyword = toSpeak.substr(needle + 'look up '.length)
    //   return keyword_to_dbpediaId(keyword)
    //     .then(function(preDbpediaId) {
    //       var dbpediaId = preDbpediaId[0]
    //       var label = preDbpediaId[1]
    //       if (!dbpediaId) return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
    //       dbpediaId_to_abstract(dbpediaId)
    //         .then(function(abstract) {
    //           if (!abstract) return actualSpeak('Couldn\'t find anything under " '+ keyword +'"')
    //           actualSpeak('Found: "' + label + '".\n' +abstract)
    //         })
    //     })
    //
    // }
    else if (toSpeak.indexOf(" year ") > -1) {
      const year = +toSpeak.split(' year ')[1]
      if (!isNaN(year)) {
        this.props.setYear(year)
        this.actualSpeak("Ok, let's see how the world in the year " + year + " looked like!")
      }
      return
    }
    else if (toSpeak.indexOf("culture") > -1) {
      this.props.changeColor('culture')
      this.props.changeLabel('culture')
      this.actualSpeak("Ok, changing to the culture map!")
      return
    }
    else if (toSpeak.indexOf("ruler") > -1) {
      this.props.changeColor('ruler')
      this.props.changeLabel('ruler')
      this.actualSpeak("Ok, changing to the political map!")
      return
    }
    else if (toSpeak.indexOf("who") > -1 || toSpeak.indexOf("Paris") > -1) {
      this.props.selectAreaItem("Île-de-France","Île-de-France")
      this.actualSpeak("Ok, Paris was ruled by the Kingdom of the Franks")
      this.props.history.push('/article')
      return
    }
    else if (toSpeak.indexOf("religion") > -1) {
      this.props.changeColor('religion')
      this.props.changeLabel('religion')
      this.actualSpeak("Ok, changing to the religion map!")
      return
    }
    else if (toSpeak.indexOf("culture") > -1) {
      this.props.changeColor('culture')
      this.actualSpeak("Ok, changing to a culture map!")
      return
    }
    else if (toSpeak.indexOf("close article") > -1) {
      this.handleClose()
      this.actualSpeak("Ok, closing article")
      return
    }
    else if (toSpeak.indexOf("close menu") > -1) {
      this.handleClose()
      this.actualSpeak("Ok, closing menu")
      return
    }
    else if (toSpeak.indexOf("disable") > -1) {
      this.toggleVoice()
      return
    }

    this.actualSpeak(toSpeak === preSpeak ? ('') : toSpeak) // err sound
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

  toggleVoice = () => {
    const { voiceActive, toggleVoice } = this.props
    console.debug(this.props, 'toggleVoice', toggleVoice)

    if (voiceActive) {
      this.actualSpeak("Voice Commands Deactivated")
      recognition.abort();

    } else {
      this.actualSpeak("Voice Commands Activated")
      recognition.start();
    }
    toggleVoice('')
  }

  render () {
    const { theme, translate, open, voiceActive } = this.props
    console.debug('render voice');

    return (<Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open
                    contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
                    contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                              text={translate('Voice Commands  (experimental)')} />
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
            <p>
              {translate('Here are some voice command examples to try:')}
            </p>
            <p>
              <ul>
                <li>Go to year 722 Changes selected year to 722</li>
                <li>When was the seventh siege of Gibraltar</li>
                <li>When was Albert Einstein born</li>
                <li>What was the Gothic War</li>
                <li>How many people lived in the Roman Empire in the year 200</li>
                <li>Open menu configuration</li>
                <li>Close menu</li>
                <li>Narrate article</li>
                <li>Disable Voice Commands</li>
              </ul>
            </p>
          </CardText>
          <Divider />
          <CardActions>
            <List>
              <ListItem
                key={'voice'}
                style={voiceActive ? {
                  marginRight: -1,
                  backgroundColor: themes[theme].highlightColors[0],
                  color: themes[theme].backColors[0]
                } : {
                  marginRight: -1,
                  color: themes[theme].foreColors[0]
                }
                }
                onClick={this.toggleVoice}
                primaryText={voiceActive ? translate("Disable Voice Commands") : translate("Activate Voice Commands") }
                leftIcon={voiceActive ? <VoiceOffIcon color={ themes[theme].backColors[0] } /> : <VoiceOnIcon color={ themes[theme].foreColors[0] } />}
                rightIcon={<IconButton
                  iconStyle={{ color: voiceActive ? themes[theme].backColors[0] : themes[theme].foreColors[0] }}
                  style={{
                    position: 'fixed',
                    top: 'inherit',
                    right: 18,
                    marginTop: -17
                  }}
                  touch={true}
                  tooltip={translate("pos.voiceTooltip")}
                  tooltipPosition="bottom-right"
                >
                </IconButton>}
              />
            </List>
            <FlatButton style={{ right: 0, position: 'absolute' }} containerElement={<Link to='/' />} label={translate('aor.action.close')} />
            <br />
          </CardActions>
        </Card>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
  voiceActive: state.voiceActive
})

// export default (translate(Voice))
// connect(mapStateToProps, {
// })(translate(Voice))

export default compose(
  connect(mapStateToProps, {
    toggleVoice: toggleVoiceAction,
    setYear,
    setArea,
    selectAreaItem,
    changeLabel,
    changeColor
  }),
  translate,
)(Voice)
