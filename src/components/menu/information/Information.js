import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import { Card, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tabs, Tab } from 'material-ui/Tabs'

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
} from 'admin-on-rest'

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

class Information extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tabForm: localStorage.getItem('chs_info_section') || 'tutorial',
      hiddenElement: true
    }
  }

  handleChange = (value) => {
    this.setState({
      tabForm: value,
    })
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillUnmount = () => {
    localStorage.removeItem('chs_info_section')
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { translate } = this.props
    return (
      <Dialog bodyStyle={{ backgroundImage: '#fff' }} open contentClassName={(this.state.hiddenElement) ? '' : 'classReveal modalMenu'}  titleStyle={{ overflow: 'auto'}} overlayStyle={{ overflow: 'auto'}} style={{ overflow: 'auto'}}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0, height: '940px' }} onRequestClose={this.handleClose}>
        <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={translate('pos.information')} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton touch key={'back'} onClick={() => this.props.history.goBack()}>
                  <IconBack />
                </IconButton>
                <IconButton touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <Tabs
            value={this.state.tabForm}
            onChange={this.handleChange}
            >
            <Tab label='How To' value='tutorial'>
              <br />
              <div>
                <h4>Watch 30 sec intro video</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height={600}
                    videoId='5mJliez-Jlw'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
                <br />
                <h4>Watch 3 min in depth video</h4>
                <p>
                  <YouTube
                    className='introVideo'
                    height='600px'
                    videoId='5mJliez-Jlw'
                    opts={properties.YOUTUBEOPTS}
                    />
                </p>
              </div>
            </Tab>
            <Tab label='About' value='about'>
              <br />
              <div>
                <p>Chronas is an initiative to collect all military history contributed and edited by volunteers - amateur and professional historians from all corners of the world. We return the entered facts
                  to all Internet users in visualizations, i.e. on digital maps of witch the world map you see is an example, as an on-line encyclopedia for history enthusiasts and - in time - as an analysis tool and discussion forum for history experts.</p>
                <p>We aim to support the largest and most active community of history enthusiasts in the world. Register as a volunteer and add your military history to our knowledge base as an editor, validate and correct the
                  registered facts and moderate on-line discussions as an expert. Help us perfect our concepts, our data and our website. If your want to join our community, <a href="/login">sign up!</a></p>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                    In development by Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab>
            <Tab label='Rules' value='rules'>
              <br />
              <div className=''>
                <br />
                <h4>The Rules, in Brief</h4>
                <ol>
                  <li><i>Be Nice</i>: No Racism, Bigotry, or Offensive Behavior.</li>
                  <li>Ask <i>Clear and Specific Questions</i>, with <i>Time and Place in Mind</i>.</li>
                  <li>Provide preferably <i>Primary and Secondary Sources</i> If Asked Rather Than Tertiary Sources Like <i>Wikipedia</i>.</li>
                  <li>Serious On-Topic Questions Only: <i>No Jokes</i>, <i>Anecdotes</i>, <i>Clutter</i>, or other <i>Digressions</i>.</li>
                  <li><a href="todo">Report</a> Answers That Break those Rules.</li>
                </ol>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                  In development by Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab>
            <Tab label='Terms of Use' value='impressum'>
              <br />
              <div>
                <p>Impressum here</p>
              </div>
              <br />
              <Divider />
              <br />
              <div>
                <p>
                  In development by Dietmar & Joachim Aumann
                </p>
              </div>
            </Tab>
          </Tabs>
        </Card>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps, {
})(translate(Information))
