const newObject = function(seed) {
  return function() {
    if (seed === undefined) {
      return {}
    }

    return Object.assign({}, seed)
  }
}

module.exports = newObject
