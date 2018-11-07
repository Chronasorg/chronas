import _ from 'lodash'
import {
  START_FETCHING_DISCUSSIONS,
  STOP_FETCHING_DISCUSSIONS,
  FETCHING_DISCUSSIONS_SUCCESS,
  FETCHING_DISCUSSIONS_FAILURE,

  START_FETCHING_PINNED_DISCUSSIONS,
  STOP_FETCHING_PINNED_DISCUSSIONS,
  FETCHING_PINNED_DISCUSSIONS_SUCCESS,
  FETCHING_PINNED_DISCUSSIONS_FAILURE,

  UPDATE_SORTING_METHOD,
  INVALID_FORUM,
} from './constants'
import {
  fetchDiscussions,
  fetchPinnedDiscussions,
} from './api'

/**
 * find the id for current forum
 * @param  {Object} state   the state object
 * @param  {String} forum   current forum
 * @return {Number}         the forum id
 */
const findForumId = (state, forum) => {
  const { forums } = state.app
  const forumId = _.find(forums, { forum_slug: forum })

  if (forumId) { return forumId._id } else { return null }
}

/**
 * action to fetch forum discussions
 * @param  {String}  forum               current forum slug
 * @param  {Boolean} feedChanged         if the feed has been changed, default is false
 * @param  {String}  sortingMethod       define the sorting method, default is 'date'
 * @param  {Boolean} sortingChanged      if user chagned the sorting method
 * @return {thunk}
 */
export const getDiscussions = (forumId, sortingMethod, qEntity = '', offset, limit) => {
  return fetchDiscussions(forumId, sortingMethod, qEntity, offset, limit).then(
        data => {
          // console.debug(data)
          return [data.data, +data.headers['x-total-count']]
        },
        error => []
      )
}

/**
 * action to fetch forum pinned discussions
 * @param  {String}  forum                current forum
 * @param  {Boolean} [feedChanged=false]  if the feed has been changed
 * @return {thunk}
 */
export const getPinnedDiscussions = (forumId, feedChanged) => {
  return fetchPinnedDiscussions(forumId).then(
    data => data.data,
    error => []
  )
}

/**
 * Update sorting method
 * @param  {String} method
 * @return {action}
 */
export const updateSortingMethod = (method) => {
  return { type: UPDATE_SORTING_METHOD, payload: method }
}
