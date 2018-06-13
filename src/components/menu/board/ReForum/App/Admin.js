import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';

import { getUser } from './actions';

import AdminHeader from '../Containers/AdminHeader';
import AdminDashboard from '../Views/AdminDashboard';
import appLayout from '../SharedStyles/appLayout.css';
import styles from './styles.css';

class AdminContainer extends Component {
  componentDidMount() {
    // fetch the user
    // this.props.getUser();
  }

  render() {
    const { user, forums } = this.props;

    if (false && user.fetchingUser) {
      return (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          Loading users profile...
        </div>
      );
    }

    if (true || user.role === 'admin') {
      return (
        <div>
          <AdminHeader forums={forums} />
          <AdminDashboard forums={forums} />
          {this.props.children}
        </div>
      );
    }
    else {
      return (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          We are cordially sorry that you are not allowed to view admin panel!<br />
          Please go back to <Link to='/board/'>root</Link> page.
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        Something went wrong.<br />
        Please go back to <Link to='/board/'>root</Link> page.
      </div>
    );
  }
}

export default connect(
  (state) => { return {
    // user: state.user,
  }; },
  (dispatch) => { return {
    // getUser: () => { dispatch(getUser()); },
  }; }
)(AdminContainer);
