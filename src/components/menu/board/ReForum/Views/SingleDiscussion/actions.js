import {
  FETCHING_SINGLE_DISC_START,
  FETCHING_SINGLE_DISC_END,
  FETCHING_SINGLE_DISC_SUCCESS,
  FETCHING_SINGLE_DISC_FAILURE,

  TOGGLE_FAVORITE_START,
  TOGGLE_FAVORITE_SUCCESS,
  TOGGLE_FAVORITE_FAILURE,

  UPDATE_OPINION_CONTENT,

  POSTING_OPINION_START,
  POSTING_OPINION_SUCCESS,
  POSTING_OPINION_FAILURE,

  DELETE_DISC_START,
  DELETE_DISC_SUCCESS,
  DELETE_DISC_REDIRECT,
  DELETE_DISC_FAILURE,

  DELETE_OPINION_START,
  DELETE_OPINION_SUCCESS,
  DELETE_OPINION_FAILURE,
} from './constants'

import {
  fetchSingleDiscussion,
  fetchOpinions,
  toggleFavoriteApi,
  postOpinionApi,
  deletePostApi,
  deleteOpinionApi,
} from './api'

import { history } from '../../../../../../store/createStore'

/**
 * get the discussion from server
 * @param  {String} discussionSlug
 * @return {action}
 */
export const getDiscussion = (discussionSlug) => {
  return fetchSingleDiscussion(discussionSlug).then(
      data => data.data,
      error => []
    )
}

/**
 * toggle favorite status of the discussion
 * @param  {ObjectId} discussionId
 * @return {action}
 */
export const toggleFavorite = (discussionId) => {
  return toggleFavoriteApi(discussionId).then(
    data => data.data,
    error => []
  )
}

/**
 * update opinion content in redux state (controlled input)
 * @param  {Object} value
 * @return {action}
 */
export const updateOpinionContent = (value) => {
  return {
    type: UPDATE_OPINION_CONTENT,
    payload: value,
  }
}

/**
 * post an opinion
 * @param  {Object} opinion
 * @param  {String} discussionSlug
 * @return {action}
 */
export const postOpinion = (opinion, discussionSlug) => {
    // validate the opinion
  if (!opinion.content || opinion.content.length < 20) {
    return 'Please provide a bit more text....at least 20 characters.'
  } else {
      // call the api to post the opinion
    return postOpinionApi(opinion).then(
        data => {
          if (data.data._id) {
            // fetch the discussion to refresh the opinion list
            return fetchSingleDiscussion(discussionSlug).then((data) => { return data.data })
          }
          return 'Something went wrong'
        }
      )
  }
}

/**
 * delete the discussion post
 * @param  {String} discussionSlug
 * @return {action}
 */
export const deletePost = (discussionSlug, currentForum) => {
  return deletePostApi(discussionSlug).then(
      data => {
        if (data.data.deleted) {
          history.push('/community/' + currentForum)
        } else { return 'ERR' }
      }
    )
}

/**
 * after a successfull deletion of a discussion
 * the user should be redirected to the home page
 * @return {action}
 */
export const deletedDiscussionRedirect = () => {
  return (dispatch, getState) => {
    dispatch({ type: DELETE_DISC_REDIRECT })
  }
}

/**
 * delete an opinion
 * @param  {ObjectId} opinionId
 * @param  {String} discussionSlug
 * @return {action}
 */
export const deleteOpinion = (opinionId, discussionSlug) => {
  return deleteOpinionApi(opinionId).then(
      data => {
        if (data.data.deleted) {
          // fetch the discussion again to refresh the opinions
          return fetchSingleDiscussion(discussionSlug).then(
            data => data.data
          )
        }
      }
    )
}
