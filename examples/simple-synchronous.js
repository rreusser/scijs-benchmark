'use strict'

var Benchmark = require('../')

new Benchmark({
    maxSamples: 1000,
    maxDuration: 200
  })
  .measure('Cosine x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.cos(Math.PI));
  })
  .measure('Sine x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.sin(Math.PI));
  })
  .run(function(err, results) {
    console.log(results)
    console.log(this.toTable())
  })
