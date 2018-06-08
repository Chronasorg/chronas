import axios from 'axios';
import properties from "../../../../../properties";

export const fetchForums = (forum_id) => {
  return axios.get(properties.chronasApiHost + '/board/forum');
};

export const fetchUser = () => {
  return axios.get(properties.chronasApiHost + '/board/user/getUser');
};
