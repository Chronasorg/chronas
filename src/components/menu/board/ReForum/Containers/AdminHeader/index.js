import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import appLayout from '../../SharedStyles/appLayout.css'
import styles from './styles.css'

// components for AdminHeader
import Logo from '../../Components/Header/Logo'
import NavigationBar from '../../Components/Header/NavigationBar'

class AdminHeader extends Component {
  renderNavLinks () {
    return [
      { name: 'Dashboard', link: '/admin' },
    ]
  }

  render () {
    const { translate, updateCurrentForum, theme, history } = this.props
    // const {
    //   authenticated,
    //   name,
    //   username,
    //   forums,
    //   avatarUrl,
    // } = this.props.user

    return (
      <div className={classnames('appLayout_constraintWidth')}>
        <div className='headerTop'>
          <Logo translate={translate} theme={theme} history={history} />
          Welcome Admin
        </div>
        <NavigationBar
          theme={theme}
          // updateCurrentForum={updateCurrentForum}
          navigationLinks={this.renderNavLinks()}
        />
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
      // user: state.user,
      // forums: state.app.forums,
    }
  }
)(AdminHeader)
