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
        return 4
      default:
        return 0
    }
  },

  getAreaDimKey: function (metadata, activeArea, selectedItem) {
    const selectedProvince = selectedItem.value
    const activeAreaDim = activeArea.color
    if (activeAreaDim === 'population') return
    let activeprovinceValue = (activeArea.data[selectedProvince] || {})[this.activeAreaDataAccessor(activeAreaDim)]
    if (activeAreaDim === 'religionGeneral') {
      activeprovinceValue = [(metadata['religion'][activeprovinceValue] || {})[3]]
    }
    return activeprovinceValue
  }

}
