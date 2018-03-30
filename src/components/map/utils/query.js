export default {

  updateQueryStringParameter: function (key, value) {
    let updatedSearchQuery
    const uri = location.search
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
    const separator = uri.indexOf('?') !== -1 ? '&' : '?'
    if (uri.match(re)) {
      updatedSearchQuery = uri.replace(re, '$1' + key + '=' + value + '$2')
    } else {
      updatedSearchQuery = uri + separator + key + '=' + value
    }

    window.history.pushState(null, null, updatedSearchQuery + window.location.hash) // + window.location.hash // TODO
  },

  getURLParameter: function (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || undefined
  },

}
