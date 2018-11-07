import axios from 'axios';
import { properties } from "../../../../../../properties";

/**
 * feed apis
 */
export const fetchDiscussions = (forum_slug, sortingMethod, qEntity = '', offset = 0, limit = 5) => { // ${qEntity}
  return axios.get(properties.chronasApiHost + '/board/forum/' + forum_slug + '/discussions?sorting_method=' + sortingMethod + (qEntity ? ('&q=' + qEntity) : '') + (limit ? ('&limit=' + limit) : '') + (offset ? ('&offset=' + offset) : ''), { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};

export const fetchPinnedDiscussions = (forum_slug) => {
  return axios.get(properties.chronasApiHost + `/board/forum/${forum_slug}/pinned_discussions`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};
