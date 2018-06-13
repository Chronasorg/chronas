import {
  FETCH_USER_PROFILE_START,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from './constants';

import {
  fetchUserProfileApi,
} from './api';

/**
 * fetch the users profile from the server
 * @param  {String} userSlug
 * @return {action}
 */
export const fetchUserProfile = (userSlug) => {
  return fetchUserProfileApi(userSlug).then(
      data => data.data
    );
};
