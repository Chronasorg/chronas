import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import { translate, defaultTheme } from 'admin-on-rest'
import styles from './styles.css';
import {themes} from "../../../../../../../properties";

const Logo = (props) => {
  const username = localStorage.getItem('chs_username')
  console.debug("Logo", props)
  return (
    <div className='BoardLogo_logoContainer'>
      <div className='BoardLogo_logoTitle'>Chronas Community</div>
      <div className='rightMenu'>
        <div className='BoardLogo_logoTitle'>
          <FlatButton label="Board" onClick={ () => props.history.push('/community/general') } />
        </div>
        <div className='BoardLogo_logoTitle'>
          <FlatButton label="Member Highscore" onClick={ () => props.history.push('/community/highscore') } />
        </div>
        <div className='BoardLogo_logoTitle'>
          <FlatButton label="My Profile" onClick={ () => props.history.push('/community/user/' + username) } />
        </div>
        <div className='BoardLogo_logoTitle_back' style={{ marginTop: -4 }}>
          <IconButton style={{ width: 32 }} iconStyle={{textAlign: 'right', fontSize: '12px'}} onClick={() => props.history.goBack()} >
            <IconBack style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[props.theme].highlightColors[0]} />
          </IconButton>

          {/*<FlatButton*/}
            {/*style={{ width: 40, minWidth: 40 }}*/}
            {/*icon={<IconBack />}*/}
            {/*primary={true}*/}
            {/*label={''}*/}
            {/*onClick={() => { props.history.goBack() } }*/}
          {/*/>*/}
        </div>
        <div className='BoardLogo_logoTitle_back' style={{ marginLeft: 0, marginTop: -4 }}>
          <IconButton style={{ width: 32 }} iconStyle={{textAlign: 'right', fontSize: '12px'}} onClick={() => props.handleClose()} >
            <CloseIcon style={{ color: 'rgb(106, 106, 106)' }} hoverColor={themes[props.theme].highlightColors[0]} />
          </IconButton>
          {/*<FlatButton*/}
            {/*style={{ width: 40, minWidth: 40 }}*/}
            {/*icon={<CloseIcon />}*/}
            {/*primary={true}*/}
            {/*label={''}*/}
            {/*onClick={() => { props.handleClose() } }*/}
          {/*/>*/}
        </div>
      </div>
    </div>
  );
};

export default Logo;
