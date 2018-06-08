import axios from 'axios';
import properties from "../../../../../../properties";

/**
 * single discussion apis
 */
export const fetchSingleDiscussion = (discussion_slug) => {
  return axios.get(properties.chronasApiHost + `/board/discussion/${discussion_slug}`);
};

export const toggleFavoriteApi = (discussion_id) => {
  return axios.put(properties.chronasApiHost + `/board/discussion/toggleFavorite/${discussion_id}`);
};

export const postOpinionApi = (opinion) => {
  return axios.post(properties.chronasApiHost + '/board/opinion/newOpinion', opinion);
};

export const deletePostApi = (discussionSlug) => {
  return axios.delete(properties.chronasApiHost + `/board/discussion/deleteDiscussion/${discussionSlug}`);
};

export const deleteOpinionApi = (opinionId) => {
  return axios.delete(properties.chronasApiHost + `/board/opinion/deleteOpinion/${opinionId}`);
};
