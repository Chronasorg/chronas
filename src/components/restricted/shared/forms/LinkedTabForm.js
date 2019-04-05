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
import { TYPE_MARKER } from '../../../map/actionReducers'
import { epicIdNameArray, properties } from '../../../../properties'
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
    }
  }

  handleChange = value => {
    this.setState({ value })
  }

  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { setModType, showNotification, initialValues, history } = this.props
      const token = localStorage.getItem('chs_token')
      const wikiURL = values.wiki

      if (values.wiki !== initialValues.wiki && typeof wikiURL !== 'undefined') {
        const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
        if (wikiIndex > -1) values.wiki = wikiURL.substr(wikiIndex + 20)
      }

      const isEpic = epicIdNameArray.map(el => el[0]).includes(values.subtype)

      let bodyToSend = {}
      if (redirect === 'edit') {
        if (isEpic) {
          bodyToSend = {
            'data': {
              'title': values.description,
              'wiki': values.wiki,
              'start': values.year,
              'end': values.end,
              'poster': values.poster
            },
            'wiki': values.wiki,
            'subtype': values.subtype,
            'year': values.year,
            'type': 'e'
          }
          if (values.subtype === 'ew') {
            bodyToSend.data['participants'] = [
              values.attacker.map(el => el.name),
              values.defender.map(el => el.name),
            ]
          }
        } else {
          // updating linked metadata
          if (values.onlyEpicContent !== initialValues.onlyEpicContent) bodyToSend.type = values.onlyEpicContent ? '0' : 'i'
          if (values.year !== initialValues.year) bodyToSend.year = values.year
          if (values.subtype !== initialValues.subtype) bodyToSend.subtype = values.subtype
          if (values.coo && !values.coo.every(e => (initialValues.coo || []).includes(e))) bodyToSend.coo = values.coo
          if (values.wiki !== initialValues.wiki) bodyToSend.wiki = values.wiki

          // any data changed?
          if (values.description !== initialValues.description ||
            values.source !== initialValues.source ||
            values.content !== initialValues.content ||
            values.poster !== initialValues.poster ||
            values.geojson !== initialValues.geojson ||
            values.end !== initialValues.end ||
            JSON.stringify(values.participants || {}) !== JSON.stringify(initialValues.participants || {})) {
            bodyToSend.data = {
              title: initialValues.description,
              source: initialValues.source,
              poster: initialValues.poster,
              content: initialValues.content,
              geojson: initialValues.geojson,
              start: initialValues.year,
              end: initialValues.end,
            }
            if (values.source !== initialValues.source) bodyToSend.data.source = values.source
            if (values.poster !== initialValues.poster) bodyToSend.data.poster = values.poster
            if (values.description !== initialValues.description) bodyToSend.data.title = values.description
            if (values.end !== initialValues.end) bodyToSend.data.end = values.end
            if (values.geojson && values.geojson !== initialValues.geojson) bodyToSend.data.geojson = JSON.parse(values.geojson)
          }
        }
        // attempt post marker if wiki + lat long + year available and wiki new
      } else {
        if (isEpic) {
          bodyToSend = {
            '_id': 'e_' + decodeURIComponent(values.wiki).replace(/ /g, '_'),
            'data': {
              'title': values.description,
              'wiki': values.wiki,
              'start': values.year,
              'end': values.end,
              'poster': values.poster,
            },
            'wiki': values.wiki,
            'subtype': values.subtype,
            'year': values.year,
            'type': 'e'
          }
          if (values.subtype === 'ew') {
            bodyToSend.data['participants'] = [
              values.attacker.map(el => el.name),
              values.defender.map(el => el.name),
            ]
          }
        } else {
          bodyToSend._id = (values.subtype !== 'html') ? values.src : (values.src + '_' + new Date().getTime().toString())
          bodyToSend.type = values.onlyEpicContent ? '0' : 'i'
          // adding linked metadata
          let geojson
          if (values.geojson) geojson = JSON.parse(values.geojson)
          if (values.year) bodyToSend.year = values.year
          if (values.subtype) bodyToSend.subtype = values.subtype
          if (values.wiki) bodyToSend.wiki = values.wiki
          if (values.coo) bodyToSend.coo = values.coo

          // have data?
          bodyToSend.data = {
            title: values.description,
            source: values.source,
            poster: values.poster,
            content: values.content,
            geojson: geojson,
            start: values.year,
            end: values.end,
            participants: (values.participants || []).map(el => el.participantTeam.map(el2 => el2.name))
          }
        }
      }

      const metadataItem = encodeURIComponent(values.src)
      fetch(properties.chronasApiHost + '/metadata/' + ((redirect === 'edit') ? metadataItem : ''), {
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
            setModType('', [], values.type)
            showNotification((redirect === 'edit') ? 'Item successfully updated' : 'Item successfully added')
            if (values.onlyEpicContent) {
              history.push('/mod/links')
            } else {
              history.goBack()
            }
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
    return (
      <form className="tabbed-form">
        <div style={styles.form} key={version}>
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
      /*<form className='simple-form'>
        <div style={formStyle} key={version}>
          {Children.map(children, input => (
            <FormInput
              basePath={basePath}
              input={input}
              record={record}
              resource={resource}
            />
          ))}
        </div>
        {toolbar && !hidesavebutton &&
        React.cloneElement(toolbar, {
          handleSubmitWithRedirect: this.handleSubmitWithRedirect,
          invalid,
          submitOnEnter,
        })}
      </form>*/
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
    setModType,
    showNotification
  }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  }),
  muiThemeable()
)
// const enhance = compose(
//   connect((state, props) => {
//     const children = Children.toArray(props.children).reduce(
//       (acc, child) => [...acc, ...Children.toArray(child.props.children)],
//       []
//     );
//
//     return {
//       modActive: state.modActive,
//       tabsWithErrors: findTabsWithErrors(state, props),
//       initialValues: getDefaultValues(state, { ...props, children }),
//     };
//   },
//   {
//     setModType,
//     showNotification
//   }),
//   reduxForm({
//     form: 'record-form',
//     enableReinitialize: true,
//   }),
//   muiThemeable()
// );

export default enhance(LinkedTabForm)
