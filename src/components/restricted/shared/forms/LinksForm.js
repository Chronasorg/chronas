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
import { TYPE_METADATA } from '../../../map/actionReducers'
const jsonp = require('jsonp')

const styles = {
  drawerForm: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  formStyle: {
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
    padding: '0 1em 1em 1em',
    maxHeight: 'calc(100% - 236px)',
    overflow: 'auto',
    width: '100%'
  }
}

export class LinksForm extends Component {
  state = {
    metaToUpdate: '',
    successFullyUpdated: false
  }

  handleSubmitWithRedirect = () => {
    console.debug('history')
    this.props.history.goBack()
    return this.props.handleSubmit(values => { })
  }

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
    setModType(TYPE_METADATA)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0]) { this.props.change('coo[0]', nextProps.modActive.data[0]) }
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1]) { this.props.change('coo[1]', nextProps.modActive.data[1]) }
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
      <form className='simple-form' style={styles.drawerForm} >
        <div style={styles.formStyle} key={version}>
          {Children.map(children, input => (
            <FormInput
              basePath={basePath}
              input={input}
              record={record}
              resource={resource}
            />
          ))}
        </div>
        { toolbar &&
        React.cloneElement(toolbar, {
          handleSubmitWithRedirect: this.handleSubmitWithRedirect,
          invalid,
          submitOnEnter,
        })}
      </form>
    )
  }
}

LinksForm.propTypes = {
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

LinksForm.defaultProps = {
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
export default enhance(LinksForm)
