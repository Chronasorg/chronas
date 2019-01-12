import React, { Component } from 'react'
import {Tabs, Tab} from 'material-ui/Tabs';
import { Link, NavLink } from 'react-router-dom'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import classnames from 'classnames'
import _ from 'lodash'
import styles from './styles.css'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import {themes} from "../../../../../../../properties";

class NavigationBar extends Component {
  handleChange = (obj) =>  {
    const currLocation = ((this.props.history || {}).location || {}).pathname
    const newforum = obj.props.value

    if (currLocation !== ('/community/' + newforum)) {
      this.props.updateCurrentForum(newforum)
      this.props.history.push('/community/' + newforum)
    }
  }

  render () {
    const {
      navigationLinks,
      currentForum,
      theme
    } = this.props

    if (navigationLinks) {
      return (
        <Tabs
          style={{ padding: 24 }}
          inkBarStyle={{
            backgroundColor: themes[theme].highlightColors[0]
          }}
          value={currentForum}>
          { navigationLinks.map(link => {
            return (
              <Tab
                onActive={this.handleChange} style={{ fontWeight: 'bolder' }} label={link.name} key={link.name} value={link.link.substr(1)} />
            )
          }) }
        </Tabs>
      )
    }

    return null
  }
}

/*
<ul className='NB_navigationBar'>
          { navigationLinks.map(link => {
            return (
              <li key={_.uniqueId('navLink_')}>
                <Link
                  className='NB_links'
                  to={'/community' + link.link}
                  onClick={() => updateCurrentForum(link.link.substr(1))}
                >
                  {link.name}
                </Link>
              </li>
            )
          }) }
        </ul>

        <ul className='NB_navigationBar'>
          { navigationLinks.map(link => {
            if (link.id === 0) {
              return (
                <li key={_.uniqueId('navLink_')}>
                  <NavLink
                    className='NB_links'
                    to='/community'
                    onClick={() => updateCurrentForum('general')}
                  >
                    Home
                  </NavLink>
                </li>
              )
            }

            return (
              <li key={_.uniqueId('navLink_')}>
                <Link
                  className='NB_links'
                  to={'/community' + link.link}
                  onClick={() => updateCurrentForum(link.link.substr(1))}
                >
                  {link.name}
                </Link>
              </li>
            )
          }) }
        </ul>
 */

NavigationBar.defaultProps = {
  navigationLinks: [
    {
      id: 0,
      name: 'General',
      link: '/',
    },
  ],
}

export default NavigationBar
