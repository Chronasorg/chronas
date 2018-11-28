/**
 * user profile apis
 */

import axios from 'axios';
import { properties } from "../../../../../../properties";

export const fetchHighscoreApi = () => {
  return axios.get(properties.chronasApiHost + '/users/highscore?top=10', { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};
