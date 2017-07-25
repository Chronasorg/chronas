import { CHANGE_LOCALE } from './actions';

export default (initialLocale = 'en') => (
  (previousLocale = initialLocale, { type, payload }) => {
    switch (type) {
      case CHANGE_LOCALE:
        return payload;
      default:
        return previousLocale;
    }
  }
);
