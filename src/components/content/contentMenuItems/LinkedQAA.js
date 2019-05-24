import React from 'react'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { themes } from '../../../properties'
import { resetModActive, setFullModActive } from '../../restricted/shared/buttons/actionReducers'
import { toggleRightDrawer as toggleRightDrawerAction } from '../actionReducers'
import QAAForum from '../../menu/board/ReForum/Views/ForumFeed/QAAForum'
import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EditButton,
  Filter,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  Restricted,
  SelectInput,
  showNotification,
  SimpleForm,
  TextField,
  TextInput,
  translate,
  ViewTitle
} from 'admin-on-rest'

const fullRadian = Math.PI * 2

const MODE = [
  'circlePack',
  'partition'
]

const imgButton = { width: 20, height: 20 }
const styles = {
  container: {
    padding: '16px',
    // backgroundColor: 'rgba(0,0,0,0.7)'
  },
  addButton: {
    zIndex: 15000,
    // marginTop: '3em',
    // marginRight: '3em'
  },
  buttonContainer: {
    width: 70,
    height: 50,
    /* margin-top: -315px; */
    position: 'relative',
    right: 0,
    bottom: 290,
    pointerEvents: 'all'
  },
  closeButton: {
    boxShadow: 'inherit',
    zIndex: 15000,
    filter: 'drop-shadow(0 0 1px rgba(0,0,0,.7)) drop-shadow(0 1px 2px rgba(0,0,0,.3))',
    marginTop: '1em',
    marginRight: '1em'
  },
  imageDialog: {
    width: '100%',
    maxWidth: 'none',
  },
  iconButton: { filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))' },
  upArrow: { ...imgButton, padding: 0, right: 11, top: -4, position: 'absolute' },
  downArrow: { ...imgButton, padding: 0, right: 11, top: 24, position: 'absolute' },
  editButton: { ...imgButton, right: 60, width: 40, height: 40, top: 1, position: 'absolute' },
  sourceButton: { ...imgButton, right: 110, width: 40, height: 40, top: 1, position: 'absolute', padding: 0 },
  scoreLabel: {
    width: 38,
    height: 20,
    right: 0,
    top: 14,
    color: 'white',
    position: 'absolute',
    fontSize: 12,
    textAlign: 'center',
    filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.8))'
  },
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
  linkedGalleryDialogStyle: {
    width: '100%',
    // maxWidth: 'none',
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    maxWidth: '100%',
    backgroundColor: 'transparent'
    // margin-left:auto,margin-right:auto,position:absolute,top:0,right:0,bottom:0,left:0
  },
  overlayStyle: {
    background: 'rgba(0,0,0,.8)',
    pointerEvents: 'none'
  },
  toolbarTitleStyle: {
    pointerEvents: 'none',
    color: 'white',
    textShadow: '1px 1px 1px black',
    zIndex: 15000,
    padding: '1em',
    position: 'fixed',
    left: 64,
    right: 0,
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  rootMenu: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-end',
  },
  gridList: {
    width: '100%',
    overflowY: 'auto',
    maxWidth: '1024px',
    margin: '0 auto'
  },
  subtitle: {
    fontSize: '16px',
    // paddingLeft: '28px',
    // paddingRight: '28px',
    fontWeight: '400',
    lineHeight: '24px',
    color: '#bcbcbc',
    transition: 'all .5s ease',
    bottom: '20px',
    left: '30px',
    paddingRight: '2em',
    pointerEvents: 'none'

  },
  title: {
    pointerEvents: 'none',
    // padding: '36px 28px 0 28px',
    lineHeight: '32px',
    fontWeight: 300,
    color: '#fff',
    fontSize: '24px',
    bottom: '50px',
    position: 'absolute',
    left: '30px',
  },
  selectedIMG: {
    height: 'auto',
    /* transform: translateY(-50%); */
    position: 'relative',
    left: 0,
    width: '100%',
  },
  selectedImageButtonContainer: {
    marginTop: '2.85em'
  },
  buttonOpenArticle: {
    // float: 'left',
    backgroundColor: 'transparent',
    paddingRight: '1em',
    width: 'inherit',
    height: 'inherit',
  },
  selectedImageContent: {
    alignItems: 'flex-start',
    margin: '0 0 0 10%',
    padding: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    maxWidth: '32em',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    bottom: '10%'
  },
  selectedImageTitle: {
    fontWeight: 400,
    fontSize: '3.125em',
    margin: '.4em 0',
    lineHeight: '1.3',
    textAlign: 'left',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    textShadow: '1px 1px 1px black',
    padding: 0
  },
  selectedImageDescription: {
    textShadow: '1px 1px 1px black',
    textAlign: 'left',
    fontSize: '1em',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.87)',
    lineHeight: 1.5,
    margin: 0,
  }
}

class LinkedQAA extends React.Component {
  handleClose = () => {
    this.props.history.goBack()
  }
  componentDidMount = () => {
    this.setState({ hiddenElement: false })
    window.addEventListener('resize', this._resize, {passive: true})
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
    window.removeEventListener('resize', this._resize)
  }
  _minimize = () => {
    this.props.setContentMenuItem('')
  }
  _resize = () => {
    this.forceUpdate()
  }

  constructor (props) {
    super(props)
    this.state = {
      forums: [],
      discussions: [],
      opinions: [],
      users: [],
      currentForum: 'general',
      hiddenElement: true
    }
  }

  render () {
    const { isMinimized, options, qId, qName, setHasQuestions, theme, translate } = this.props

    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
    }

    const articleContentContainer = (document.getElementsByClassName("articleContentContainer") || {})[0]
    const articleWidth = isMinimized ? 0 : (articleContentContainer || {}).offsetWidth || 0
    let dynamicWidth = isMinimized ? 0 : (((document.getElementsByClassName("body") || {})[0] || {}).offsetWidth || 0) - articleWidth - 148
    let isFlip = false

    if (dynamicWidth > 600) dynamicWidth = 600
    if (dynamicWidth < 319) isFlip = true

    return (
      <Paper zDepth={3} style={{
        position: 'fixed',
        left: (isMinimized ? '-52px' : isFlip ? 0 : ((-dynamicWidth - 74) + 'px')),
        zIndex: 2147483647,
        top: '4px',
        padding: '0em',
        transition: 'all .3s ease-in-out',
        width: (isMinimized ? '30px' : isFlip ? (articleWidth + 'px') : (dynamicWidth + 'px')),
        maxHeight: (isMinimized ? '30px' : 'calc(100% - 200px)'),
        pointerEvents: (isMinimized ? 'none' : 'inherit'),
        opacity: (isMinimized ? '0' : 'inherit'),
        overflow: 'auto',
      }}>
        <AppBar
          style={
            {
              marginBottom: 0,
              transition: 'all .5s ease-in-out',
              background: (isMinimized ? 'white' : themes[theme].backColors[0]),
              boxShadow: 'rgba(0, 0, 0, 0.4) -1px 2px 3px 1px'
            }
          }
          title={<span style={{ color: themes[theme].foreColors[0] }}>Q&A: {qName}</span>}
          iconElementLeft={<div />}
          iconElementRight={this.state.isMinimized
            ? <IconButton iconStyle={{ fill: 'rgba(55, 57, 49, 0.19)' }} style={{ left: '-9px' }}
              onClick={() => this._maximize()}><CompositionChartIcon /></IconButton>
            : <IconButton
              tooltipPosition='bottom-left'
              tooltip={translate('pos.minimize')} onClick={() => this._minimize()}>
              { isFlip
                ? <ChevronLeft color={themes[theme].foreColors[0]} hoverColor={themes[theme].highlightColors[0]} />
                : <ChevronRight color={themes[theme].foreColors[0]} hoverColor={themes[theme].highlightColors[0]} /> }
              </IconButton>}
        />
        <div style={styles.container}>
          {qId && qId !== '' &&
          <QAAForum setHasQuestions={setHasQuestions} forums={[]} qaaEntity={qId} users={this.state.users} translate={translate}
            discussions={this.state.discussions} />}
        </div>
      </Paper>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    selectedItem: state.selectedItem,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    setFullModActive,
    resetModActive,
    showNotification,
  }),
  pure,
  translate,
)

export default enhance(LinkedQAA)
