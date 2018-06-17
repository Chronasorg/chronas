import {
  FETCH_USER_PROFILE_START,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from './constants';

import {
  fetchHighscoreApi,
} from './api';

/**
 * fetch the users profile from the server
 * @param  {String} userSlug
 * @return {action}
 */
export const fetchHighscore = () => {
  return fetchHighscoreApi().then(
      data => data.data
    );
};
