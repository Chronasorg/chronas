export var prefix = '$'

function Map () {
}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function (key) {
    return (prefix + key) in this
  },
  get: function (key) {
    return this[prefix + key]
  },
  set: function (key, value) {
    this[prefix + key] = value
    return this
  },
  remove: function (key) {
    var property = prefix + key
    return property in this && delete this[property]
  },
  clear: function () {
    for (var property in this) if (property[0] === prefix) delete this[property]
  },
  keys: function () {
    var keys = []
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1))
    return keys
  },
  children: function () {
    var children = []
    for (var property in this) if (property[0] === prefix) children.push(this[property])
    return children
  },
  entries: function () {
    var entries = []
    for (var property in this) if (property[0] === prefix) entries.push({ key: property.slice(1), value: this[property] })
    return entries
  },
  size: function () {
    var size = 0
    for (var property in this) if (property[0] === prefix) ++size
    return size
  },
  empty: function () {
    for (var property in this) if (property[0] === prefix) return false
    return true
  },
  each: function (f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this)
  }
}

function map (object, f) {
  var map = new Map()

  // Copy constructor.
  if (object instanceof Map) {
    object.each(function (value, key) {
      map.set(key, value)
    })
  } else if (Array.isArray(object)) {
    var i = -1,
      n = object.length,
      o

    if (f == null) while (++i < n) map.set(i, object[i])
    else while (++i < n) map.set(f(o = object[i], i, object), o)
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key])

  return map
}

export default function () {
  var keys = [],
    meta = {},
    sortKeys = [],
    sortValues,
    rollup,
    nest

  function apply (array, depth, createResult, setResult) {
    if (depth >= keys.length) {
      if (sortValues != null) array.sort(sortValues)
      return rollup != null ? rollup(array) : array
    }

    var i = -1,
      n = array.length,
      key = keys[depth++],
      keyValue,
      value,
      valuesByKey = map(),
      children,
      result = createResult()

    while (++i < n) {
      children = valuesByKey.get(keyValue = key(value = array[i]) + '')
      if (children) {
        children.push(value)
      } else {
        valuesByKey.set(keyValue, [value])
      }
    }

    valuesByKey.each(function (children, key) {
      setResult(result, key, apply(children, depth, createResult, setResult))
    })

    return result
  }

  function entries (map, depth) {
    if (++depth > keys.length) return map
    var array, sortKey = sortKeys[depth - 1]
    if (rollup != null && depth >= keys.length) array = map.entries()
    else {
      array = []
      map.each(function (v, k) {
        if (v[0] && depth === 3) {
          const s = {
            name: v[0].province,
            hex: 'rgba(0,0,0,0.4)',
            isProvince: true,
            wiki: (meta[v[0].province] || {}),
            size: v[0].size
          }
          array.push({
            name: k,
            hex: (meta[k] || {})[1] || '#12939A',
            wiki: (meta[k] || {})[2],
            children: entries([s], depth)
          })
        } else {
          array.push({
            name: k,
            'hex': (meta[k] || {})[1] || '#12939A',
            wiki: (meta[k] || {})[2],
            children: entries(v, depth)
          })
        }
      })
    }
    return sortKey != null ? array.sort(function (a, b) {
      return sortKey(a.key, b.key)
    }) : array
  }

  return {
    object: function (array) {
      return apply(array, 0, createObject, setObject)
    },
    map: function (array) {
      return apply(array, 0, createMap, setMap)
    },
    entries: function (array) {
      return entries(apply(array, 0, createMap, setMap), 0)
    },
    meta: function (d) {
      meta = Object.assign({}, d)
      return nest
    },
    key: function (d) {
      keys.push(d)
      return nest
    },
    sortKeys: function (order) {
      sortKeys[keys.length - 1] = order
      return nest
    },
    sortValues: function (order) {
      sortValues = order
      return nest
    },
    rollup: function (f) {
      rollup = f
      return nest
    }
  }
}

function createObject () {
  return {}
}

function setObject (object, key, value) {
  object[key] = value
}

function createMap () {
  return map()
}

function setMap (map, key, value) {
  map.set(key, value)
}
