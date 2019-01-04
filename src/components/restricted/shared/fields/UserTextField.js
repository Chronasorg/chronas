import React from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash.get'
import pure from 'recompose/pure'

const UserTextField = ({ source, record = {}, elStyle }) => {
  const username = get(record, source)
  return <Link to={`/community/user/${username}`}><span style={elStyle}>{username}</span></Link>
}

const PureUserTextField = pure(UserTextField)

PureUserTextField.defaultProps = {
  addLabel: true,
}

export default PureUserTextField
