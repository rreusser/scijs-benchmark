'use strict'

var Benchmark = require('../')

new Benchmark({
    maxDuration: 200,
    getTime: process.hrtime,
    getTimeDiff: function (t1, t2) {
      return (t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6
    }
  })
  .measure('timeout 100 (timed automatically)', function (done) {
    setTimeout(function () {
      done()
    }, 100)
  })
  .measure('timeout 100 (timed manually)', function (done) {
    var t1 = process.hrtime()
    setTimeout(function () {
      var t2 = process.hrtime()
      done((t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6)
    }, 100)
  })
  .run(function() {
    console.log(this.toTable())
  })
