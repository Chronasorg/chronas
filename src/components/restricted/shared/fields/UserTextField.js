import React from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';
import get from 'lodash.get';
import pure from 'recompose/pure';

const UserTextField = ({ source, record = {}, elStyle }) => {
  const username = get(record, source)
  return <Link to={`/community/user/${username}`}><span style={elStyle}>{username}</span></Link>;
};

UserTextField.propTypes = {
  addLabel: PropTypes.bool,
  elStyle: PropTypes.object,
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

const PureUserTextField = pure(UserTextField);

PureUserTextField.defaultProps = {
  addLabel: true,
};

export default PureUserTextField;
