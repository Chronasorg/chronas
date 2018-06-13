import axios from 'axios';
import properties from "../../../../../../properties";

export const postDiscussionApi = (discussion) => {
  return axios.post(properties.chronasApiHost + '/board/discussion/newDiscussion', discussion, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};
