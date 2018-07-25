import React, {createElement} from 'react'
import { Sunburst, LabelSeries, Treemap, } from 'react-vis'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import {selectLinkedItem, selectMarkerItem} from '../../map/actionReducers'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CompositionChartIcon from 'material-ui/svg-icons/image/view-compact'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ContentFilter from 'material-ui/svg-icons/content/filter-list'
import ImageGallery from 'react-image-gallery'
import YouTube from 'react-youtube'
import axios from 'axios'
import Badge from 'material-ui/Badge';
import PropTypes from 'prop-types'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Player } from 'video-react'
import Dialog from 'material-ui/Dialog'
import { Card } from 'material-ui/Card'
import { GridList, GridTile } from 'material-ui/GridList'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconThumbUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import IconThumbDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import IconOutbound from 'material-ui/svg-icons/action/open-in-new'
import IconEdit from 'material-ui/svg-icons/content/create'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import ContentAdd from 'material-ui/svg-icons/content/add'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import IconMenu from 'material-ui/IconMenu'
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import { green400, green600, blue400, blue600, red400, red600 } from 'material-ui/styles/colors'
import { tooltip } from '../../../styles/chronasStyleComponents'
import properties from "../../../properties";
import {resetModActive, setFullModActive} from "../../restricted/shared/buttons/actionReducers";
import {toggleRightDrawer as toggleRightDrawerAction} from "../actionReducers";
import NewDiscussion from "../../menu/board/ReForum/Views/NewDiscussion";
import AppContainer from "../../menu/board/ReForum/App/App";
import QAAForum from "../../menu/board/ReForum/Views/ForumFeed/QAAForum";
import Highscore from "../../menu/board/ReForum/Views/Highscore";
import UserProfile from "../../menu/board/ReForum/Views/UserProfile";
import SingleDiscussion from "../../menu/board/ReForum/Views/SingleDiscussion";
import AdminContainer from "../../menu/board/ReForum/App/Admin";
import {
  translate,
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
  Restricted,
  ReferenceInput,
  ReferenceField,
  SelectInput,
  SimpleForm,
  showNotification,
  TextField,
  TextInput,
  ViewTitle
} from 'admin-on-rest'

const fullRadian = Math.PI * 2

const MODE = [
  'circlePack',
  'partition'
]

const imgButton = { width: 20, height: 20}
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
  editButton: { ...imgButton, right: 60, top: 1, position: 'absolute' },
  sourceButton: { ...imgButton, right: 110, top: 1, position: 'absolute', padding: 0 },
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
    // display: 'flex',
    // '-ms-flex-direction': 'row',
    // '-webkit-flex-direction': 'row',
    // 'flex-direction': 'row',
    //   '-ms-flex-wrap': 'wrap',
    // '-webkit-flex-wrap': 'wrap',
    // 'flex-wrap': 'wrap',
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
    fontFamily: "Roboto Slab','Georgia','Times New Roman',serif",
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
  constructor (props) {
    super(props)
    this.state = {
      forums: [],
      discussions: [], // [{"_id":"5b2033277360754cc222298f","forum_id":"5b1ebb597399ff48be74ec55","forum":{"_id":"5b1ebb597399ff48be74ec55","forum_slug":"ggeneral","forum_name":"General","__v":0},"user_id":"user@keystonejs.com","user":{"_id":"user@keystonejs.com","username":"prickly-reading","name":"prickly-reading","password":"$2a$10$s51BoOAkr6RBS68KyK32M.fFepqBZCHcjvE833yxswPHmSQI.TnKG","email":"user@keystonejs.com","karma":45,"lastUpdated":"2018-03-30T16:37:10.745Z","createdAt":"2018-03-30T16:37:10.745Z","privilege":1,"authType":"chronas","loginCount":1,"count_deleted":8,"count_created":17,"count_reverted":7,"count_mistakes":5,"count_voted":84,"count_updated":45,"count_linked":18},"discussion_slug":"hhhhhhhhhhhhhhhhhhhhhhhhhh_5b2033277360754cc222298e","date":"2018-06-12T20:55:03.628Z","title":"hhhhhhhhhhhhhhhhhhhhhhhhhh","content":"{\"blocks\":[{\"key\":\"7rg4b\",\"text\":\"hgfffffffffffffffff\",\"type\":\"blockquote\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}","pinned":false,"tags":["hhhhhhhhhhhh"],"favorites":[],"__v":0,"opinion_count":0},{"_id":"5b202743d5e65f532049678c","forum_id":"5b1ebb597399ff48be74ec55","forum":{"_id":"5b1ebb597399ff48be74ec55","forum_slug":"ggeneral","forum_name":"General","__v":0},"user_id":"user@keystonejs.com","user":{"_id":"user@keystonejs.com","username":"prickly-reading","name":"prickly-reading","password":"$2a$10$s51BoOAkr6RBS68KyK32M.fFepqBZCHcjvE833yxswPHmSQI.TnKG","email":"user@keystonejs.com","karma":45,"lastUpdated":"2018-03-30T16:37:10.745Z","createdAt":"2018-03-30T16:37:10.745Z","privilege":1,"authType":"chronas","loginCount":1,"count_deleted":8,"count_created":17,"count_reverted":7,"count_mistakes":5,"count_voted":84,"count_updated":45,"count_linked":18},"discussion_slug":"wtestsgdfggggggggggdfg_5b202743d5e65f532049678b","date":"2018-06-12T20:04:19.105Z","title":"wtestsgdfggggggggggdfg","content":"{\"blocks\":[{\"key\":\"6cqm\",\"text\":\"gfdgdfgdggggggggggggdd\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}","pinned":false,"tags":["dsfsdf"],"favorites":[],"__v":6,"opinion_count":1}],
      opinions: [],
      users: [],
      currentForum: 'general',
      hiddenElement: true
    }
  }

  handleClose = () => {
    this.props.history.goBack()
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  componentWillReceiveProps = (nextProps) => {
    console.debug('### LinkedQAA componentWillReceiveProps', this.props, nextProps)
  }

  _handleUpvote = (id, stateDataId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      this.props.showNotification('pos.pleaseLogin')
      return
    }

    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          this.setState({ tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score -= 1
              return el
            }) })
          this.forceUpdate()
        })
    } else if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote twice
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
            .then(() => {
              this.setState({ tileData: tileData.map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score += 2
                  return el
                }) })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just upvote
      localStorage.setItem('upvotedItems', upvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          this.props.showNotification((typeof token !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({ tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            }) })
          this.forceUpdate()
        })
    }
  }

  _handleDownvote = (id) => {
    const token = localStorage.getItem('token')
    if (!token) {
      this.props.showNotification('pos.pleaseLogin')
      return
    }
    const upvotedItems = (localStorage.getItem('upvotedItems') || '').split(',')
    const downvotedItems = (localStorage.getItem('downvotedItems') || '').split(',')
    const tileData = this.state.tileData

    if (downvotedItems.indexOf(id) > -1) {
      // already downvoted -> upvote
      localStorage.setItem('downvotedItems', downvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/upvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          this.setState({ tileData: tileData.map((el) => {
              if (encodeURIComponent(el.src) === id) el.score += 1
              return el
            }) })
          this.forceUpdate()
        })
    } else if (upvotedItems.indexOf(id) > -1) {
      // already upvoted -> downvote twice
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      localStorage.setItem('upvotedItems', upvotedItems.filter((elId) => elId !== id))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
            .then(() => {
              this.setState({ tileData: tileData.map((el) => {
                  if (encodeURIComponent(el.src) === id) el.score -= 2
                  return el
                }) })
              this.forceUpdate()
            })
        })
    } else {
      // neutral -> just downvote
      localStorage.setItem('downvotedItems', downvotedItems.concat([id]))
      axios.put(properties.chronasApiHost + '/metadata/' + id + '/downvote', {}, { 'headers': { 'Authorization': 'Bearer ' + token}})
        .then(() => {
          this.props.showNotification((typeof token !== "undefined") ? 'pos.pointsAdded' : 'pos.signupToGatherPoints')
          this.setState({ tileData: tileData.map((el) => {f
              if (encodeURIComponent(el.src) === id) el.score -= 1
              return el
            }) })
          this.forceUpdate()
        })
    }
  }

  _minimize = () => {
    this.props.setContentMenuItem('')
  }

  _handleEdit = (id) => {
    const selectedItem = this.state.tileData.filter(el => (el.src === decodeURIComponent(id)))[0]
    this.props.selectLinkedItem(selectedItem)
    this.props.history.push('/mod/linked')
  }

  _handleAdd = () => {
    this.props.history.push('/mod/links')
  }

  _handleOpenSource = (source) => {
    console.debug("_handleOpenSource", source)
    window.open(source, '_blank').focus()
  }

  _getYoutubeId = (url) => {
    if (typeof url === 'undefined') return false
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      false
    }
  }

  _removeTile = (tileSrc) => {
    const originalTileData = this.state.tileData.filter(el => el.src !== tileSrc)

    this.setState({
      tileData: originalTileData
    })

    this.forceUpdate()
  }

  render () {
    const { isMinimized, options, qId } = this.props

    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
    }

    return (
      <Paper zDepth={3} style={{
        position: 'fixed',
        left:  (isMinimized ? '-52px' : '-574px'),
        top: '4px',
        padding: '0em',
        transition: 'all .3s ease-in-out',
        width: (isMinimized ? '30px' : '500px'),
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
              background: (isMinimized ? 'white' : 'rgba(55, 57, 49, 0.19)')
            }
          }
          title={<span>Questions and Answers</span>}
          iconElementLeft={<div />}
          iconElementRight={this.state.isMinimized
            ? <IconButton iconStyle={{ fill: 'rgba(55, 57, 49, 0.19)' }} style={{ left: '-9px' }} onClick={() => this._maximize()}><CompositionChartIcon /></IconButton>
            : <IconButton onClick={() => this._minimize()}><ChevronRight /></IconButton>}
        />
        <div style={styles.container}>
          <QAAForum forums={[]} qaaEntity={qId} users={this.state.users} discussions={this.state.discussions} />
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
    activeArea: state.activeArea,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    toggleRightDrawer: toggleRightDrawerAction,
    setFullModActive,
    selectLinkedItem,
    resetModActive,
    showNotification,
  }),
  pure,
  translate,
)

export default enhance(LinkedQAA)
