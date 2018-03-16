export default {

  activeAreaDataAccessor: function (activeAreaDim) {
    switch (activeAreaDim) {
      case 'ruler':
        return 0
      case 'culture':
        return 1
      case 'religion':
      case 'religionGeneral':
        return 2
      case 'capital':
        return 3
      case 'population':
        return 3
      default:
        return 0
    }
  },

}
