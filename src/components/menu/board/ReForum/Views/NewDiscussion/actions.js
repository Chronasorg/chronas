import { history } from '../../../../../../store/createStore'
import {
  POSTING_DISCUSSION_START,
  POSTING_DISCUSSION_END,
  POSTING_DISCUSSION_SUCCESS,
  POSTING_DISCUSSION_FAILURE,

  UPDATE_DISCUSSION_TITLE,
  UPDATE_DISCUSSION_CONTENT,
  UPDATE_DISCUSSION_PIN_STATUS,
  UPDATE_DISCUSSION_TAGS,

  CLEAR_SUCCESS_MESSAGE,
} from './constants';
import { postDiscussionApi } from './api';

/**
 * post a new discussion
 * @param  {ObjectId} userId
 * @param  {ObjectId} forumId
 * @param  {String} currentForum
 * @return {action}
 */
export const postDiscussion = (userId, forumId, currentForum, currentDiscussion, qId) => {
    const {
      title,
      content,
      tags,
      pinned,
    } = currentDiscussion;

    let validated = true;

    if (!userId || !forumId) {
      validated = false;
      return 'Something is wrong with user/forum.'
    }

    if (title === null || title.length < 15) {
      validated = false;
      return 'Title should be at least 15 characters.'
    }

    if (content === null || content.length === 0) {
      validated = false;
      return 'Please write some content before posting.'
    }

    if (tags === null || tags.length === 0) {
      validated = false;
      return 'Please provide some tags.'
    }

    // make api call if post is validated
    if (validated) {
      postDiscussionApi({
        userId,
        forumId,
        title,
        qa_id: qId,
        content,
        tags,
        pinned,
      }).then(
        (data) => {
          if (qId) {
            history.goBack()
          } else if (data.data.postCreated === true) {
            // issue a redirect to the newly reacted discussion
            history.push(`/community/${currentForum}/discussion/${data.data.discussion_slug}`);
          } else {
            return 'Something is wrong at our server end. Please try again later'
          }
        },
        (error) => {
          return error
        }
      );
    }
}

/**
 * update the discussion title in redux state (controlled input)
 * @param  {String} value
 * @return {action}
 */
export const updateDiscussionTitle = (value) => {
  return {
    type: UPDATE_DISCUSSION_TITLE,
    payload: value,
  };
};

/**
 * update discussion content in redux state (controlled input)
 * @param  {Object} value
 * @return {action}
 */
export const updateDiscussionContent = (value) => {
  return {
    type: UPDATE_DISCUSSION_CONTENT,
    payload: value,
  };
};

/**
 * update discussion pinned status in redux state (controlled input)
 * @param  {Boolean} value
 * @return {action}
 */
export const updateDiscussionPinStatus = (value) => {
  return {
    type: UPDATE_DISCUSSION_PIN_STATUS,
    payload: value,
  };
};

/**
 * update discussion tags in redux state (controlled input)
 * @param  {Array} value
 * @return {action}
 */
export const updateDiscussionTags = (value) => {
  return {
    type: UPDATE_DISCUSSION_TAGS,
    payload: value,
  };
};
