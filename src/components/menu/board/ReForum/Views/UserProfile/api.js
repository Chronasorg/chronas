/**
 * user profile apis
 */

import axios from 'axios';
import { properties } from "../../../../../../properties";

export const fetchUserProfileApi = (userSlug) => {
  return axios.get(properties.chronasApiHost + `/board/user/profile/${userSlug}`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};
