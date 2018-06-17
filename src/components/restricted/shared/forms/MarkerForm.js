import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { showNotification } from 'admin-on-rest';
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues';
import FormInput from 'admin-on-rest/lib/mui/form/FormInput';
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar';
import { setModType } from "../buttons/actionReducers";
import { TYPE_MARKER } from '../../../map/actionReducers'
import properties from "../../../../properties";
// import { Toolbar, FormInput, getDefaultValues } from 'admin-on-rest';

const formStyle = {
  boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
  padding: '0 1em 1em 1em',
  maxHeight: 'calc(100% - 180px)',
  overflow: 'auto',
  width: '100%'
}

export class MarkerForm extends Component {
  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { setModType, showNotification, history } = this.props
      const token = localStorage.getItem('token')

      const wikiURL = values.wiki
      const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
      if (redirect !== 'edit' && wikiIndex > -1) values.wiki = wikiURL.substring(wikiIndex + 20, wikiURL.length)

      const markerItem = decodeURIComponent(values.wiki)
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
  componentWillReceiveProps(nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0])
      this.props.change ("coo[0]" , nextProps.modActive.data[0] )
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1])
      this.props.change ("coo[1]" , nextProps.modActive.data[1] )
  }

  render() {
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
    } = this.props;

    return (
      <form className="simple-form">
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
    );
  }
}

MarkerForm.propTypes = {
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
};

MarkerForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
};

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
);

export default enhance(MarkerForm);
