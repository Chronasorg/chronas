import axios from 'axios';
import properties from "../../../../../../properties";

/**
 * feed apis
 */
export const fetchDiscussions = (forum_id, sortingMethod) => {
  return axios.get(properties.chronasApiHost + `/board/forum/${forum_id}/discussions?sorting_method=${sortingMethod}`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};

export const fetchPinnedDiscussions = (forum_id) => {
  return axios.get(properties.chronasApiHost + `/board/forum/${forum_id}/pinned_discussions`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};
