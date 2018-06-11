import {
  GET_ALL_INFO_START,
  GET_ALL_INFO_SUCCESS,
  GET_ALL_INFO_FAILURE,

  CREATE_FORUM,
  CREATE_FORUM_SUCCESS,
  CREATE_FORUM_FAILURE,

  DELETE_FORUM,
  DELETE_FORUM_SUCCESS,
  DELETE_FORUM_FAILURE,
} from './constants';

import {
  getAdminDashboardInfoAPI,
  createForumAPI,
  deleteForumAPI,
} from './api';

/**
 * get all the info needed for dashboard
 * @return {action}
 */
export const getAdminDashboardInfo = () => {
   return getAdminDashboardInfoAPI().then(
      data => data.data,
      error => false
    );
};

/**
 * create a new forum
 * @param  {Object} forumObj
 * @return {action}
 */
export const createForum = (forumObj) => {
    // call the create forum api
  return createForumAPI(forumObj).then(
      forumData => {
        // get admin info again to refresh the infos
        getAdminDashboardInfoAPI().then(
          data => data.data,
          error => false
        );
      },
      error => false
    );
};

export const deleteForum = (forumId) => {
  return deleteForumAPI(forumId).then(
      forumData => {
        // get admin info again to refresh the infos
        getAdminDashboardInfoAPI().then(
          data => data.data,
          error => false
        );
      },
      error => false
    );
};
