/**
 * user profile apis
 */

import axios from 'axios';
import { properties } from "../../../../../../properties";

export const fetchSustainersApi = () => {
  return axios.get(properties.chronasApiHost + '/users/sustainers?patreon=true', { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};
