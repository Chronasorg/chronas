export const CRUD_UPDATE = 'AOR/CRUD_UPDATE';
export const CRUD_UPDATE_LOADING = 'AOR/CRUD_UPDATE_LOADING';
export const CRUD_UPDATE_FAILURE = 'AOR/CRUD_UPDATE_FAILURE';
export const CRUD_UPDATE_SUCCESS = 'AOR/CRUD_UPDATE_SUCCESS';

export const UPDATE = 'UPDATE';

export const crudUpdate = (
  resource,
  id,
  data,
  previousData,
  basePath,
  redirectTo = 'show'
) => ({
  type: CRUD_UPDATE,
  payload: { id, data, previousData, basePath, redirectTo },
  meta: { resource, fetch: UPDATE, cancelPrevious: false },
});
