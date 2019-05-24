import React, { Children, Component } from 'react'
import { reduxForm,
  getFormAsyncErrors,
  getFormSyncErrors,
  getFormSubmitErrors, } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Tabs, Tab } from 'material-ui/Tabs'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { showNotification } from 'admin-on-rest'
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import { setModType } from '../buttons/actionReducers'
import { TYPE_MARKER, setData, selectCollectionItem, collectionUpdated } from '../../../map/actionReducers'
import { updateUserScore } from '../../../menu/authentication/actionReducers'
import { epicIdNameArray, properties } from '../../../../properties'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import axios from "axios/index";
// import { Toolbar, FormInput, getDefaultValues } from 'admin-on-rest';

const getStyles = theme => ({
  form: { padding: '0 1em 3em 1em' },
  // TODO: The color will be taken from another property in MUI 0.19 and later
  errorTabButton: { color: theme.textField.errorColor },
})

const formStyle = {
  boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
  padding: '0 1em 1em 1em',
  maxHeight: 'calc(100% - 236px)',
  background: '#f3f3f2',
  overflow: 'auto',
  width: '100%'
}

export class LinkedTabForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      eduDialogOpen: false,
      eduValue: '',
    }
  }

  componentDidMount = () => {
    if (this.props.redirect === 'edit') {
      const urlMetadataLinks = properties.chronasApiHost + '/collections/' + (this.props.defaultValue || {}).wiki
      axios.get(urlMetadataLinks, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}})
        .then((linkedItemResult) => {
          if (linkedItemResult.status === 200) {
            const res = linkedItemResult.data
            let potentialStartingWiki = (((res.map || [])[0] || {}).properties || {}).w

            const linkedItems = {
              media: [],
              content: [],
              id: potentialStartingWiki
            }

            res.media.forEach((imageItem) => {
              linkedItems.media.push({
                src: ((imageItem || {}).properties || {}).id || imageItem._id || imageItem.properties.w,
                wiki: imageItem.wiki || imageItem.properties.w,
                title: imageItem.name || (imageItem.data || {}).title || imageItem.properties.n,
                subtype: imageItem.subtype || imageItem.properties.t,
                source: (imageItem.data || {}).source || imageItem.properties.src,
                subtitle: (!imageItem.year || isNaN(imageItem.year)) ? imageItem.properties.n : imageItem.year,
                year: (!imageItem.year || isNaN(imageItem.year)) ? imageItem.properties.y : imageItem.year,
                score: imageItem.score || imageItem.properties.s,
              })
            })
            linkedItems.content = res.map.sort((a, b) => {
                return (+a.order || 0) - (+b.order || 0)
            })
            linkedItems.media = linkedItems.media.sort((a, b) => (+a.order || +b.score || 0) - (+b.order || +a.score || 0))

            showNotification(linkedItems.media.length + ' linked media item' + ((linkedItems.media.length === 1) ? '' : 's') + ' found')
            console.debug('setData', { ...res, ...linkedItems }, potentialStartingWiki)
            this.props.setData({ ...res, ...linkedItems }, potentialStartingWiki)
          } else {
          }
        })
    }
  }

  handleChange = value => {
    this.setState({ value })
  }

  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { collectionUpdated, setModType, selectCollectionItem, showNotification, initialValues, history } = this.props
      const token = localStorage.getItem('chs_token')
      const username = localStorage.getItem('chs_username')

      const isCollection = values.subtype === 'cc' || values.subtype === 'ce'
      const isEdu = values.subtype === 'ce'

      let bodyToSend = {}
      if (redirect === 'edit') {
        if (isCollection) {
          bodyToSend = values // conditionally
          bodyToSend.owner = username
        }
      } else {
        if (isCollection) {
          const avatar = localStorage.getItem('chs_avatar')
          const username = localStorage.getItem('chs_username')
          bodyToSend = { ...values, avatar, owner: username }
        } else {}
      }

      const metadataItem = encodeURIComponent(values._id)
      fetch(properties.chronasApiHost + '/collections/' + ((redirect === 'edit') ? metadataItem : ''), {
        method: (redirect === 'edit') ? 'PUT' : 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyToSend)
      })
        .then((res) => {
          if (res.status === 200) {
            selectCollectionItem(values._id, false)
            this.props.updateUserScore(1)
            setModType('', [], values.type)
            showNotification((redirect === 'edit') ? 'Item successfully updated' : 'Item successfully added')
            collectionUpdated()
            if (isEdu) this.setState({ eduDialogOpen: true, eduValue: ((res || {}).data || {})._id })
            else history.push('/article')
            // }
          } else {
            showNotification((redirect === 'edit') ? 'Item not updated' : 'Item not added', 'warning')
          }
        })
    });

  componentWillUnmount () {
    this.props.setModType('')
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0]) {
      this.props.change('coo[0]', nextProps.modActive.data[0])
    }
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1]) {
      this.props.change('coo[1]', nextProps.modActive.data[1])
    }
  }

  componentWillMount () {
    this.props.setModType(TYPE_MARKER)
  }

  render () {
    const {
      basePath,
      children,
      contentContainerStyle,
      invalid,
      muiTheme,
      record,
      resource,
      submitOnEnter,
      tabsWithErrors,
      toolbar,
      translate,
      hidesavebutton,
      version,
    } = this.props

    const styles = getStyles(muiTheme);

    const actions = [
      <FlatButton
        label="Acknowledge"
        primary={true}
        keyboardFocused={true}
        onClick={() => {
          this.setState({eduDialogOpen: false})
          this.props.setRightDrawerVisibility(false)
          this.props.history.goBack()
        }}
      />
    ];

    return (
      <form className="tabbed-form collections">
        <Dialog
          title="Educational slide deck successfully created!"
          actions={actions}
          modal={false}
          open={this.state.eduDialogOpen}
          onRequestClose={() => this.setState({eduDialogOpen: false})}
        >
          <p>
            Copy and share this link with your students: <br />
            <b>https://edu.chronas.org/?type=collection&value={this.state.eduValue}&locale=en</b>
          </p>
          <p>
            You can also lookup the shareable link by clicking the slide deck name in the collection menu later. At the end of the deck your students can complete the quiz and the results will be sent to your email-address on submission.
          </p>
        </Dialog>
        <div style={formStyle} key={version}>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            contentContainerStyle={contentContainerStyle}
          >
            {React.Children.map(
              children,
              (tab, index) =>
                tab ? (
                  <Tab
                    key={tab.props.label}
                    className="form-tab"
                    label={translate(tab.props.label, {
                      _: tab.props.label,
                    })}
                    value={index}
                    icon={tab.props.icon}
                    buttonStyle={
                      tabsWithErrors.includes(
                        tab.props.label
                      ) && this.state.value !== index ? (
                        styles.errorTabButton
                      ) : null
                    }
                  >
                    {React.cloneElement(tab, {
                      resource,
                      record,
                      basePath,
                    })}
                  </Tab>
                ) : null
            )}
          </Tabs>
        </div>
        {toolbar && !hidesavebutton &&
        React.cloneElement(toolbar, {
          handleSubmitWithRedirect: this.handleSubmitWithRedirect,
          invalid,
          submitOnEnter,
        })}
      </form>
    )
  }
}

LinkedTabForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
}

const collectErrors = state => {
  const syncErrors = getFormSyncErrors('record-form')(state);
  const asyncErrors = getFormAsyncErrors('record-form')(state);
  const submitErrors = getFormSubmitErrors('record-form')(state);

  return {
    ...syncErrors,
    ...asyncErrors,
    ...submitErrors,
  };
};

export const findTabsWithErrors = (
  state,
  props,
  collectErrorsImpl = collectErrors
) => {
  const errors = collectErrorsImpl(state);

  return Children.toArray(props.children).reduce((acc, child) => {
    const inputs = Children.toArray(child.props.children);

    if (inputs.some(input => errors[input.props.source])) {
      return [...acc, child.props.label];
    }

    return acc;
  }, []);
};

const enhance = compose(
  connect((state, props) => {
      const children = Children.toArray(props.children).reduce(
        (acc, child) => [...acc, ...Children.toArray(child.props.children)],
        []
      );

      return {
        modActive: state.modActive,
        tabsWithErrors: findTabsWithErrors(state, props),
        initialValues: getDefaultValues(state, { ...props, children }),
      };
    },
  {
    collectionUpdated,
    setModType,
    setData,
    selectCollectionItem,
    updateUserScore,
    showNotification
  }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  }),
  muiThemeable()
)

export default enhance(LinkedTabForm)
