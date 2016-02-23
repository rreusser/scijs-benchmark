'use strict'

var Benchmark = require('../')
var table = require('table').default

new Benchmark({
    maxDuration: 200,
    getTime: process.hrtime,
    getTimeDiff: function (t1, t2) {
      return (t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6
    }
  })
  .measure('cos x 10000 (timed automatically)', function () {
    for(var i = 0; i < 10000; i++) {
      Math.cos(Math.PI)
    }
  })
  .measure('cos x 10000 (timed manually)', function () {
    var t1 = process.hrtime()
    for(var i = 0; i < 10000; i++) {
      Math.cos(Math.PI)
    }
    var t2 = process.hrtime()
    return (t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6
  })
  .run(function() {
    console.log(table(this.toTable()))
  })
