import React, { Children, Component } from 'react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
// import getDefaultValues from './getDefaultValues';
// import FormInput from './FormInput';
// import Toolbar from './Toolbar';
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import { showNotification } from 'admin-on-rest'
import { setModData, setModType } from '../buttons/actionReducers'
import { properties } from '../../../../properties'

const formStyle = {
  boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
  padding: '0 1em 1em 1em',
  maxHeight: 'calc(100% - 236px)',
  background: '#f3f3f2',
  overflow: 'auto',
  width: '100%'
}

export class AreaForm extends Component {
  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { initialValues, isfromReplace, setModType } = this.props

      if (!values.rulerApply) { delete values.ruler }
      else { values.ruler = values.ruler || "" }
      if (!values.religionApply) { delete values.religion }
      else { values.religion = values.religion || "" }
      if (!values.cultureApply) { delete values.culture }
      else { values.culture = values.culture || "" }
      if (!values.populationApply) { delete values.population }
      else { values.population = values.population || 0 }
      if (!values.replaceWith && isfromReplace) {
        values.replaceWith = ""
      }

      const token = localStorage.getItem('chs_token')
      fetch(properties.chronasApiHost + ((typeof values.replaceWith !== 'undefined') ? '/areas/replace' : '/areas'), {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
        .then((res) => {
          if (res.status === 200) {
            const { start, end = start } = values
            const waitForCompletion = (+end - +start) < 11
            if (waitForCompletion) {
              this.props.showNotification('Area Updated')
            } else {
              this.props.showNotification('Updating ' + (+end - +start) + ' years in the background... this may take a while')
            }
            setModType('', [], 'area')
            this.props.history.goBack()
          } else {
            this.props.showNotification('Area Not Updated Or In Background')
            setModType('', [], '')
          }
        })
    });

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.type === 'areas' && this.props.modActive.data.length !== nextProps.modActive.data.length) {
      this.props.change('provinces', nextProps.modActive.data)
    }
    if (this.props.selectedYear !== nextProps.selectedYear) {
      this.props.change('start', nextProps.selectedYear)
    }
  }

  componentWillUnmount () {
    const { setModType } = this.props
    setModType('')
  }

  componentDidMount () {
    const { setModType, selectedItem, setModData } = this.props
    const selectedProvince = selectedItem.value
    if (selectedProvince) setModData([selectedProvince])
    setModType('areas', selectedProvince ? [selectedProvince] : [])
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

AreaForm.defaultProps = {
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
    showNotification
  }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  }),
)
export default enhance(AreaForm)
