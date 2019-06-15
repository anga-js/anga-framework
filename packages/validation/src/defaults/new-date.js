const newDate = function(seed) {
  return function() {
    if (seed === undefined) {
      return new Date()
    }

    return new Date(seed)
  }
}

module.exports = newDate
