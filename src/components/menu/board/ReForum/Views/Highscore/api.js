/**
 * user profile apis
 */

import axios from 'axios';
import properties from "../../../../../../properties";

export const fetchHighscoreApi = () => {
  return axios.get(properties.chronasApiHost + '/users?top=10', { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};
