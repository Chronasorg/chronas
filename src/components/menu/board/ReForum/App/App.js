import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import Header from '../Containers/Header';
import Footer from '../Components/Footer';
import appLayout from '../SharedStyles/appLayout.css';
import styles from './styles.css';

import { getForums, updateCurrentForum, getUser } from './actions';
import {toggleRightDrawer as toggleRightDrawerAction} from "../../../../content/actionReducers";
import {showNotification, translate, userLogout} from "admin-on-rest";
import {logout, setToken} from "../../../authentication/actionReducers";
import {selectAreaItem as selectAreaItemAction} from "../../../../map/actionReducers";
import {
  setActiveMenu as setActiveMenuAction,
  toggleMenuDrawer as toggleMenuDrawerAction
} from "../../../actionReducers";

class AppContainer extends Component {
  componentDidMount() {
    const {
      params,
      updateCurrentForum,
      getForums,
      getUser,
    } = this.props;

    // // get all forum list
    // getForums();
    //
    // // check for authenticated user
    // getUser();
    //
    // // set current forum based on route
    // const currentForum = params.forum || '';
    // updateCurrentForum(currentForum);
  }

  componentDidUpdate() {
    const {
      forums,
      params,
      currentForum,
      updateCurrentForum,
    } = this.props;

    let newCurrentForum = '';
    if (params.forum) newCurrentForum = params.forum;
    else if (forums) newCurrentForum = forums[0].forum_slug;

    // update current forum if necessery
    if (newCurrentForum !== currentForum) updateCurrentForum(newCurrentForum);
  }

  render() {
    const { forums } = this.props;

    // render only if we get the forum lists
    if (forums) {
      return (
        <div>
          <div className={styles.gitForkTag}>
            <a className={styles.gitLink} href="https://github.com/shoumma/ReForum" target="_blank">Fork on Github</a>
          </div>

          <Header />
          {this.props.children}
          <Footer />
        </div>
      );
    }

    return (
      <div className={styles.loadingWrapper}>Loading...</div>
    );
  }
}

const enhance = compose(
  connect(state => ({
    forums: state.app.forums,
    currentForum: state.app.currentForum,
  }), {
    getForums,
    updateCurrentForum,
    getUser
  }),
  pure,
  translate,
)

export default enhance(AppContainer);
