import React, { Component } from 'react';
import classnames from 'classnames';
import FlatButton from 'material-ui/FlatButton'
import { Link } from 'react-router-dom'
import { translate } from 'admin-on-rest'
import styles from './styles.css';
import Moment from 'moment';
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import {chronasMainColor} from "../../../../../../../styles/chronasColors";

const customStyles = {
  menuButtons: {
    margin: 12,
    backgroundColor: '#d24100',
    color: 'white',
    marginTop: '-1em',
    paddingLeft: '0px',
  }
}

class Profile extends Component {
  render() {
    const {
      name,
      gitHandler,
      location,
      avatarUrl,
      translate,
      username,
      profile
    } = this.props;

    const finalAvatarUrl = avatarUrl ? <img className='UserProfile_avatar' src={avatarUrl} alt={`${name} avatar`} /> : <AccountIcon style={{
      height: '80px',
      width: '80px'
    }} />

    const localStorageUsername = localStorage.getItem('username')

    return (
      <div className='UserProfile_container'>
        <div className='UserProfile_avatarContainer'>
          {finalAvatarUrl}
        </div>
        <div className='UserProfile_infoContainer'>
          <div className='UserProfile_name'>{ name }</div>
          <div className='UserProfile_gitHandler'><i className={classnames('fa fa-github-alt', 'UserProfile_gitIcon')}></i> { gitHandler }</div>
          <div className='UserProfile_location'>member since { Moment(profile.createdAt).from(Moment()) }</div>
        </div>
        <div className='UserProfile_infoContainer'>
          { (localStorageUsername === gitHandler) ? <FlatButton
            key={translate('pos.edit')}
            containerElement={<Link to={'/account'} />}
            hoverColor={chronasMainColor}
            label={translate('pos.edit')}
            style={customStyles.menuButtons} /> : null}
        </div>
      </div>
    );
  }
}

Profile.defaultProps = {
  name: 'N/a',
  gitHandler: 'N/a',
  location: 'Somewhere in the world',
};

Profile.propTypes = {
  name: React.PropTypes.string,
  username: React.PropTypes.string,
  gitHandler: React.PropTypes.string,
  location: React.PropTypes.string,
  avatarUrl: React.PropTypes.string,
};


const enhance = compose(
  connect(state => ({
  }), {
  }),
  translate,
)

export default enhance(Profile);
