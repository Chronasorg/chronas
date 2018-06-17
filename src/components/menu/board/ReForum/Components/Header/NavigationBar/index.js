import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import classnames from 'classnames'
import _ from 'lodash'
import styles from './styles.css'

class NavigationBar extends Component {
  render () {
    const {
      navigationLinks,
      updateCurrentForum
    } = this.props

    if (navigationLinks) {
      return (
        <ul className='NB_navigationBar'>
          { navigationLinks.map(link => {
            if (link.id === 0) {
              return (
                <li key={_.uniqueId('navLink_')}>
                  <NavLink
                    className='NB_links'
                    to='/board'
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
                  to={'/board' + link.link}
                  onClick={() => updateCurrentForum(link.link.substr(1))}
                >
                  {link.name}
                </Link>
              </li>
            )
          }) }
        </ul>
      )
    }

    return null
  }
}

NavigationBar.defaultProps = {
  navigationLinks: [
    {
      id: 0,
      name: 'General',
      link: '/',
    },
  ],
}

NavigationBar.propTypes = {
  navigationLinks: React.PropTypes.array,
}

export default NavigationBar
