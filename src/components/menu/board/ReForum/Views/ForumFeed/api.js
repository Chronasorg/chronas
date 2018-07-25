import axios from 'axios';
import properties from "../../../../../../properties";

/**
 * feed apis
 */
export const fetchDiscussions = (forum_slug, sortingMethod, qEntity = '') => { // ${qEntity}
  return axios.get(properties.chronasApiHost + '/board/forum/' + forum_slug + '/discussions?sorting_method=' + sortingMethod + (qEntity ? ('&q=' + qEntity) : ''), { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};

export const fetchPinnedDiscussions = (forum_slug) => {
  return axios.get(properties.chronasApiHost + `/board/forum/${forum_slug}/pinned_discussions`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};
