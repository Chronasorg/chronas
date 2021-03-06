import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import Header from '../Containers/Header';
import Footer from '../Components/Footer';
import appLayout from '../SharedStyles/appLayout.css';
import styles from './styles.css';

import { updateCurrentForum, getUser } from './actions';
import {showNotification, translate, userLogout} from "admin-on-rest";

class AppContainer extends Component {
  componentDidMount() {
    const {
      params,
      updateCurrentForum,
      setForums,
      getUser,
    } = this.props;

    // get all forum list
      setForums()
    //
    // // check for authenticated user
    // getUser();
    //
    // set current forum based on route
    const currentForum = (params || {}).forum || '';
    updateCurrentForum(currentForum);
  }

  // componentDidUpdate() {
  //   const {
  //     forums,
  //     params,
  //     currentForum,
  //     updateCurrentForum,
  //   } = this.props;
  //
  //   let newCurrentForum = '';
  //   if (params.forum) newCurrentForum = params.forum;
  //   else if (forums) newCurrentForum = forums[0].forum_slug;
  //
  //   // update current forum if necessery
  //   if (newCurrentForum !== currentForum) updateCurrentForum(newCurrentForum);
  // }

  render() {
    const { forums, users, updateCurrentForum } = this.props;

    // render only if we get the forum lists
    if (forums) {
      return (
        <div>
          <Header updateCurrentForum={updateCurrentForum} forums={forums} users={users} />
          {this.props.children}
          <Footer />
        </div>
      );
    }

    return (
      <div className='Board_loadingWrapper'>Loading...</div>
    );
  }
}

const enhance = compose(
  connect(state => ({
  }), {
    getUser
  }),
  pure,
  translate,
)

export default enhance(AppContainer);
