import axios from 'axios';
import properties from "../../../../../properties";

export const fetchForums = (forum_id) => {
  return axios.get(properties.chronasApiHost + '/board/forum', { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};

export const fetchUser = () => {
  return axios.get(properties.chronasApiHost + '/board/user/getUser', { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};
