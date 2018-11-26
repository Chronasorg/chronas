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
      bio,
      website,
      username,
      education,
      profile
    } = this.props;

    const finalAvatarUrl = avatarUrl ? <img className='UserProfile_avatar' src={avatarUrl} alt={`${name} avatar`} /> : <AccountIcon style={{
      height: '80px',
      width: '80px'
    }} />

    const localStorageUsername = localStorage.getItem('chs_username')

    const authTypeIcon = (profile.authType) === 'github' ? <i className={classnames('fa fa-github-alt', 'UserProfile_gitIcon')}></i> : (profile.authType) === 'facebook' ? <i className={classnames('fa fa-facebook', 'UserProfile_gitIcon')}></i> : (profile.authType) === 'google' ? <i className={classnames('fa fa-google', 'UserProfile_gitIcon')}></i> : (profile.authType) === 'twitter' ? <i className={classnames('fa fa-twitter', 'UserProfile_gitIcon')}></i> : <i className={classnames('fa fa-chronas-alt', 'UserProfile_gitIcon')}></i>

    return (
      <div><div className='UserProfile_container'>
        <div className='UserProfile_avatarContainer'>
          {finalAvatarUrl}
        </div>
        <div className='UserProfile_infoContainer'>
          <div className='UserProfile_name'>{ name } {education ? <span style={{ fontWeight: 200, fontSize: 16}}> ({education})</span> : ''}</div>
          <div className='UserProfile_gitHandler'> { authTypeIcon } { gitHandler }</div>
          { website && <div className='UserProfile_website'>
            <a target="_blank" href={website}>{website}</a></div>}
          <div className='UserProfile_location' style={{ whiteSpace: 'nowrap' }}>member since { Moment(profile.createdAt).from(Moment()) }</div>
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
        { bio && <p style={{ padding: '2em' }}>
        <span style={{ fontWeight: 800, paddingRight: '1em'}}>Bio:</span>
          {bio}
         </p>}
      </div>
    );
  }
}

Profile.defaultProps = {
  name: 'N/a',
  gitHandler: 'N/a',
  location: 'Somewhere in the world',
};

const enhance = compose(
  connect(state => ({
  }), {
  }),
  translate,
)

export default enhance(Profile);
