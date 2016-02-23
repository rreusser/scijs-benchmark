'use strict'

var Benchmark = require('../')

new Benchmark({
    maxSamples: 1000,
    maxDuration: 200,
    getTime: process.hrtime,
    getTimeDiff: function (t1, t2) {
      return (t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6
    }
  })
  .measure('Cosine x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.cos(Math.PI));
  })
  .measure('Sine x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.sin(Math.PI));
  })
  .run(function() {
    console.log(this.toTable())
  })
