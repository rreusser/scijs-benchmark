'use strict'

var sprintf = require('sprintf-js').sprintf

module.exports = function toTable () {
  var rows = [[
    'Test',
    'Samples',
    'Minimum (ms)',
    'Maximum (ms)',
    'Mean (ms)',
    'Standard Deviation (ms)'
  ]]

  rows = rows.concat(this.results.map(function(r) {

    var percentFromStd = r.stddev / r.mean * 100

    return [
      r.name,
      r.n,
      sprintf('%.3g', r.minimum),
      sprintf('%.3g', r.maximum),
      sprintf('%.3g', r.mean),
      '+/- ' + sprintf('%.3g', r.stddev) + ' (' + sprintf('%.3g', percentFromStd) + '%)',
    ]
  }))

  return rows
}

