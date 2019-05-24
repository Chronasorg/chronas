import React, { Children, Component } from 'react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { showNotification } from 'admin-on-rest'
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import { setModType } from '../buttons/actionReducers'
import { TYPE_MARKER } from '../../../map/actionReducers'
import { properties } from '../../../../properties'

// import { Toolbar, FormInput, getDefaultValues } from 'admin-on-rest';

const formStyle = {
  boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
  padding: '0 1em 1em 1em',
  maxHeight: 'calc(100% - 236px)',
  background: '#f3f3f2',
  overflow: 'auto',
  width: '100%'
}

export class MarkerForm extends Component {
  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { setModType, showNotification, history } = this.props
      const token = localStorage.getItem('chs_token')

      if (values.capital) {
        values.capital = values.capital.map((el) => {
          return [el.capitalStart, el.capitalEnd, el.capitalOwner]
        })
      }
      const wikiURL = values.wiki
      const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
      if (wikiIndex > -1) values.wiki = wikiURL.substring(wikiIndex + 20, wikiURL.length)
      if (values.type.substr(0, 2) === 'w|') values.type = values.type.substr(2)
      if (values.type === 'cp' || values.type === 'c0') values.type = 'c'
      const markerItem = decodeURIComponent(values._id || values.wiki)

      fetch(properties.chronasApiHost + '/markers/' + ((redirect === 'edit') ? markerItem : ''), {
        method: (redirect === 'edit') ? 'PUT' : 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
        .then((res) => {
          if (res.status === 200) {
            setModType('', [], values.type)
            showNotification((redirect === 'edit') ? 'Marker successfully updated' : 'Marker successfully added')
            history.goBack()
          } else {
            showNotification((redirect === 'edit') ? 'Marker not updated' : 'Marker not added', 'warning')
          }
        })
    });

  componentWillUnmount () {
    this.props.setModType('')
  }

  componentWillMount () {
    this.props.setModType(TYPE_MARKER)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0]) {
      this.props.change('coo[0]', nextProps.modActive.data[0])
    }
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1]) {
      this.props.change('coo[1]', nextProps.modActive.data[1])
    }
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

MarkerForm.defaultProps = {
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

export default enhance(MarkerForm)
