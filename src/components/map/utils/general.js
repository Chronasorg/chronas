export default {

  activeAreaDataAccessor: function (activeAreaDim) {
    switch (activeAreaDim) {
      case 'political':
        return 0
      case 'culture':
        return 1
      case 'religion':
        return 2
      case 'capital':
        return 3
      case 'population':
        return 4
      default:
        return 0
    }
  },

}
