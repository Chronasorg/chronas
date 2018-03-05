export default {

  updateQueryStringParameter: function (key, value) {
    let updatedUri
    const uri = location.search
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
    const separator = uri.indexOf('?') !== -1 ? '&' : '?'
    if (uri.match(re)) {
      updatedUri = uri.replace(re, '$1' + key + '=' + value + '$2')
    } else {
      updatedUri = uri + separator + key + '=' + value
    }

    window.history.pushState(null, null, updatedUri)
  },

  getURLParameter: function (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || undefined
  },

}
