import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import axios from 'axios'
import { setModType, setModData } from '../buttons/actionReducers'
import { updateSingleMetadata } from './../../../map/data/actionReducers'
import properties from '../../../../properties'
import { showNotification } from 'admin-on-rest'
const jsonp = require('jsonp')
const formStyle = { padding: '0 1em 1em 1em' }
export class MetaForm extends Component {
  state = {
    metaToUpdate: '',
    successFullyUpdated: false
  }

  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { history } = this.props
      const wikiURL = values.url
      const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
      let newWikiURL
      if (wikiIndex > -1) {
        newWikiURL = wikiURL.substr(wikiIndex + 20)
      } else {
        return 'Not a full Wikipedia URL'
      }

      const iconURL = values.icon
      const fileIndex = iconURL.indexOf('media/File:') + 6
      const iconUrlPromise = new Promise((resolve, reject) => {
        if (fileIndex !== 5) {
          const filePath = iconURL.substr(fileIndex)
          jsonp('https://commons.wikimedia.org/w/api.php?action=query&titles=' + filePath + '&prop=imageinfo&&iiprop=url&iiurlwidth=100&format=json', null, (err, rulerMetadata) => {
            if (err) {
              resolve('')
            } else {
              const newiconURL = Object.values(rulerMetadata.query.pages)[0].imageinfo[0].thumburl
              resolve(newiconURL)
            }
          })
        } else if ((iconURL.indexOf('/thumb/') > -1) && (iconURL.indexOf('/100px-') === -1)) {
            // wikicommons thumb, but not in right resolution!
          const afterRes = iconURL.indexOf('px-')
          const beforeRes = iconURL.substring(0, afterRes).lastIndexOf('/')
          resolve(iconURL.substring(0, beforeRes) + '/100' + iconURL.substr(afterRes))
        } else {
          resolve(iconURL)
        }
      })

      iconUrlPromise.then((iconUrl) => {
        const nextBodyByType = {
          ruler: [values.name, values.color, newWikiURL, iconUrl],
          culture: [values.name, values.color, newWikiURL, iconUrl],
          religion:        [values.name, values.color, newWikiURL, values.parentname, iconUrl],
          religionGeneral: [values.name, values.color, newWikiURL, iconUrl],
          capital: [values.url, iconUrl],
          province: [values.url, iconUrl]
        }

        const bodyToSend = {}
        const metadataItem = values.type
        bodyToSend['subEntityId'] = values.select || values.name
        bodyToSend['nextBody'] = nextBodyByType[metadataItem]

        const token = localStorage.getItem('token')
        fetch(properties.chronasApiHost + '/metadata/' + metadataItem + '/single', {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyToSend)
        })
          .then((res) => {
            if (res.status === 200) {
              this.setState({
                metaToUpdate: metadataItem,
                successFullyUpdated: true
              })
              this.props.showNotification((redirect === 'edit') ? 'Metadata successfully updated' : 'Metadata successfully added')
              history.goBack()
              // this.props.save(values, redirect)
              // this.props.history.push('/article')
              // this.props.handleClose()
              // this.forceUpdate()
            } else {
              this.setState({
                metaToUpdate: '',
                successFullyUpdated: false
              })
              this.props.showNotification((redirect === 'edit') ? 'Metadata not updated' : 'Metadata not added', 'warning')
            }
          })
      })
    })

  componentWillUnmount () {
    const { metaToUpdate } = this.state
    const { setModType, updateSingleMetadata } = this.props

    // only update relevant
    axios.get(properties.chronasApiHost + '/metadata/' + metaToUpdate)
      .then((metadata) => {
        updateSingleMetadata(metaToUpdate, metadata.data.data)
      })
      .then(() => {
        setModType('', [], metaToUpdate)
      })
      .catch((err) => setModType(''))
  }

  componentDidMount () {
    const { setModType, selectedItem, setModData } = this.props
    const selectedProvince = selectedItem.value
    if (selectedProvince) setModData([selectedProvince])
    setModType('metadata')
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
        {toolbar &&
        React.cloneElement(toolbar, {
          handleSubmitWithRedirect: this.handleSubmitWithRedirect,
          invalid,
          submitOnEnter,
        })}
      </form>
    )
  }
}

MetaForm.propTypes = {
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

MetaForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
}

const enhance = compose(
  connect((state, props) => ({
    initialValues: getDefaultValues(state, props),
    modActive: state.modActive,
    selectedYear: state.selectedYear,
    selectedItem: state.selectedItem,
  }),
    {
      // crudUpdate: crudUpdateAction,
      setModType,
      setModData,
      updateSingleMetadata,
      showNotification
    }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  }),
)
export default enhance(MetaForm)
