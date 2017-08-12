import { CHANGE_BASEMAP } from './actions';

export const basemapReducer = (initialBasemap = 'watercolor') => (
  (previousLocale = initialBasemap, { type, payload }) => {
    switch (type) {
      case CHANGE_BASEMAP:
        return payload;
      default:
        return previousLocale;
    }
  }
);
