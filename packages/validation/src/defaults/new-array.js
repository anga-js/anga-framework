const newArray = function(seed) {
  return function() {
    if (seed === undefined) {
      return []
    }
    return seed.slice(0)
  }
}

module.exports = newArray
