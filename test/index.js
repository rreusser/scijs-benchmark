'use strict'

var assert = require('chai').assert
var Benchmark = require('../')

describe('scijs-benchmark', function () {
  it('runs a single synchronous benchmark', function () {
    var b = new Benchmark({
      maxSamples: 5,
      minSamples: 0,
    })
    b.measure('test1', function () {return 1})
    b.run()
    assert.deepEqual(b.results, [
      {name: 'test1', n: 5, mean: 1, variance: 0, stddev: 0, minimum: 1}
    ])
  })

  it('runs two synchronous benchmarks', function () {
    var b = new Benchmark({
      maxSamples: 5,
      minSamples: 0,
    })
    b.measure('test1', function () {return 1})
    b.measure('test2', function () {return 2})
    b.run()
    assert.deepEqual(b.results, [
      {name: 'test1', n: 5, mean: 1, variance: 0, stddev: 0, minimum: 1},
      {name: 'test2', n: 5, mean: 2, variance: 0, stddev: 0, minimum: 2},
    ])
  })

  it('runs a single asynchronous benchmark', function (done) {
    var n = 4
    new Benchmark({
        maxSamples: n,
        minSamples: 0,
      })
      .measure('test1', function (cb) {
        setTimeout(function () {cb(null, 1)}, 1)
      })
      .run(function (err, results) {
        assert.deepEqual(results, [
          {name: 'test1', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('runs two synchronous benchmarks', function (done) {
    var n = 4
    new Benchmark({
        maxSamples: n,
        minSamples: 0
      })
      .measure('test1', function (cb) {
        setTimeout(function () {cb(null, 1)}, 1)
      })
      .measure('test2', function (cb) {
        setTimeout(function () {cb(null, 1)}, 1)
      })
      .run(function (err, results) {
        assert.deepEqual(results, [
          {name: 'test1', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1},
          {name: 'test2', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('runs a synchronous and asynchronous benchmark', function (done) {
    var n = 4
    new Benchmark({
        maxSamples: n,
        minSamples: 0,
      })
      .measure('test1', function () {return 1})
      .measure('test2', function (cb) {
        setTimeout(function () {cb(null, 1)}, 1)
      })
      .run(function (err, results) {
        assert.deepEqual(results, [
          {name: 'test1', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1},
          {name: 'test2', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('avoids stack overflow', function (done) {
    var n = 100000
    var b = new Benchmark({maxSamples: n})
      .measure('test1', function (cb) {
        process.nextTick(function () {cb(null, 1)})
      })
      .run(function () {
        assert.deepEqual(this.results, [
          {name: 'test1', n: n, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('times execution if not done manually', function (done) {
    var n = 4
    var b = new Benchmark({
        maxSamples: 20
      })
      .measure('test1', function () {
        for(var i = 0, x = 0.1; i < 10000; i++, x *= Math.sin(Math.PI));
      })
      .run(function (err, results) {
        assert(results[0].mean > 0)
        done()
      })
  })

  it('bails out when maxDuration met', function (done) {
    var b = new Benchmark({
        maxSamples: Infinity,
        maxDuration: 10
      })
      .measure('test1', function (cb) {
        setTimeout(function () {cb(null, 1)}, 1)
      })
      .run(function (err, results) {
        assert(isFinite(results[0].n))
        done()
      })
  })

  it('sync acquires no less than minSamples samples', function (done) {
    var b = new Benchmark({
        minSamples: 10,
        maxDuration: 0
      })
      .measure('test1', function () {
        var t1 = Date.now()

        // Busy loop for 1ms:
        while (Date.now() - t1 < 1);

        return 1
      })
      .run(function () {
        assert.deepEqual(this.results, [
          {name: 'test1', n: 10, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('async acquires no less than minSamples samples', function (done) {
    var b = new Benchmark({
        minSamples: 10,
        maxDuration: 0
      })
      .measure('test1', function (done) {
        setTimeout(function () {
          done(null, 1)
        }, 1)
      })
      .run(function () {
        assert.deepEqual(this.results, [
          {name: 'test1', n: 10, mean: 1, variance: 0, stddev: 0, minimum: 1}
        ])
        done()
      })
  })

  it('Passing error to async test halts execution', function (done) {
    var n = 0
    var b = new Benchmark({
        minSamples: 10,
        maxDuration: 0
      })
      .measure('test1', function (done) {
        setTimeout(function () {
          if (++n === 8) {
            done('Error encountered')
          } else {
            done(null, 1)
          }
        }, 1)
      })
      .run(function (err, result) {
        assert.match(err, /Error encountered/)
        done()
      })
  })
})
