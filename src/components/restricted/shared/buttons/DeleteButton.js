import React from 'react';
import { Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';

const DeleteButton = ({ customLabel="Delete", basePath = '', resource = '', id = '', record = {} }) => (

  <FlatButton
    containerElement={<Link to={`${basePath}/${resource}/${id}/delete`} />}
    label={customLabel}
    secondary={true}
    icon={<ActionDelete />}
  />
);

DeleteButton.defaultProps = {
    style: { padding: 0 },
};

export default DeleteButton;
