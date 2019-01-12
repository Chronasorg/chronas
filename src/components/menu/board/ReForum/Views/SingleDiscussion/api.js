import axios from 'axios';
import { properties } from "../../../../../../properties";

/**
 * single discussion apis
 */
export const fetchSingleDiscussion = (discussion_slug) => {
  return axios.get(properties.chronasApiHost + `/board/discussion/${discussion_slug}`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};

export const toggleFavoriteApi = (discussion_id) => {
  return axios.put(properties.chronasApiHost + `/board/discussion/toggleFavorite/${discussion_id}`, {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};

export const postOpinionApi = (opinion) => {
  return axios.post(properties.chronasApiHost + '/board/opinion/newOpinion', opinion, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};


export const editOpinionApi = (opinion) => {
  return axios.post(properties.chronasApiHost + '/board/opinion/newOpinion', opinion, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};

export const deletePostApi = (discussionSlug) => {
  return axios.delete(properties.chronasApiHost + `/board/discussion/deleteDiscussion/${discussionSlug}`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};

export const deleteOpinionApi = (opinionId) => {
  return axios.delete(properties.chronasApiHost + `/board/opinion/deleteOpinion/${opinionId}`, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};


export const voteOpinionApi = (opinionId, delta) => {
  return axios.put(properties.chronasApiHost + `/board/opinion/voteOpinion/${opinionId}?delta=${delta}`, {}, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('chs_token')}});
};
