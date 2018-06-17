import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { showNotification } from 'admin-on-rest'
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import { setModType } from '../buttons/actionReducers'
import { TYPE_MARKER } from '../../../map/actionReducers'
import properties from '../../../../properties'
// import { Toolbar, FormInput, getDefaultValues } from 'admin-on-rest';

const formStyle = {
  boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
  padding: '0 1em 1em 1em',
  maxHeight: 'calc(100% - 180px)',
  overflow: 'auto',
  width: '100%' }

export class LinkedForm extends Component {
  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { setModType, showNotification, initialValues, history } = this.props
      const token = localStorage.getItem('token')
      const wikiURL = values.wiki

      if (values.wiki !== initialValues.wiki && typeof wikiURL !== 'undefined') {
        const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
        if (wikiIndex > -1) values.wiki = wikiURL.substring(wikiIndex + 20, wikiURL.length)
      }

      const bodyToSend = {}
      if (redirect === 'edit') {
        // updating linked metadata

        if (values.onlyEpicContent !== initialValues.onlyEpicContent) bodyToSend.type = values.onlyEpicContent ? '0' : 'i'
        if (values.year !== initialValues.year) bodyToSend.year = values.year
        if (values.subtype !== initialValues.subtype) bodyToSend.subtype = values.subtype
        if (!values.coo.every( e => initialValues.coo.includes(e) )) bodyToSend.coo = values.coo
        if (values.wiki !== initialValues.wiki) bodyToSend.wiki = values.wiki

        // any data changed?
        if (values.description !== initialValues.description ||
          values.source !== initialValues.source) {
          bodyToSend.data = {
            title: initialValues.description,
            source: initialValues.source,
            content: initialValues.content,
            geojson: initialValues.geojson
          }
          if (values.source !== initialValues.source) bodyToSend.data.source = values.source
          if (values.description !== initialValues.description) bodyToSend.data.title = values.description
          if (values.content !== initialValues.content) bodyToSend.data.content = values.content
          if (values.geojson && values.geojson !== initialValues.geojson) bodyToSend.data.geojson = JSON.parse(values.geojson)
        }
        // attempt post marker if wiki + lat long + year available and wiki new
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

        // any data changed?
        if (values.description || values.source) {
          bodyToSend.data = {
            title: values.description,
            source: values.source,
            content: values.content,
            geojson: geojson
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
            history.goBack()
          } else {
            showNotification((redirect === 'edit') ? 'Item not updated' : 'Item not added', 'warning')
          }
        })
    });

  componentWillUnmount () {
    this.props.setModType('')
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0]) { this.props.change('coo[0]', nextProps.modActive.data[0]) }
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1]) { this.props.change('coo[1]', nextProps.modActive.data[1]) }
  }

  componentWillMount () {
    this.props.setModType(TYPE_MARKER)
  }

  render () {
    const {
      basePath,
      children,
      invalid,
      record,
      resource,
      submitOnEnter,
      toolbar,
      hidesavebutton,
      version,
    } = this.props

    return (
      <form className='simple-form'>
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
      </form>
    )
  }
}

LinkedForm.propTypes = {
  basePath: PropTypes.string,
  children: PropTypes.node,
  defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  handleSubmit: PropTypes.func, // passed by redux-form
  invalid: PropTypes.bool,
  history: PropTypes.object,
  record: PropTypes.object,
  resource: PropTypes.string,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  save: PropTypes.func, // the handler defined in the parent, which triggers the REST submission
  submitOnEnter: PropTypes.bool,
  toolbar: PropTypes.element,
  validate: PropTypes.func,
  version: PropTypes.number,
}

LinkedForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
}

const enhance = compose(
  connect((state, props) => ({
    initialValues: getDefaultValues(state, props),
    modActive: state.modActive,
  }),
    {
      setModType,
      showNotification
    }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  })
)

export default enhance(LinkedForm)
