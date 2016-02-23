'use strict'

var extend = require('util-extend')
var measureSynchronous = require('./lib/measure-synchronous')
var measureAsynchronous = require('./lib/measure-asynchronous')
var toTable = require('./lib/to-table')

module.exports = Benchmark

function Benchmark (options) {
  options = extend({
    minSamples: 10,
    maxSamples: Infinity,
    maxDuration: 5000,
    discardFirst: 10,
    getTime: Date.now,
    saveSamples: false,
    getTimeDiff: function(t1, t2) {
      return t2 - t1
    },
  }, options || {})

  this.minSamples = options.minSamples
  this.maxSamples = options.maxSamples
  this.maxDuration = options.maxDuration
  this.getTime = options.getTime
  this.getTimeDiff = options.getTimeDiff
  this.discardFirst = options.discardFirst
  this.saveSamples = options.saveSamples

  this.results = []
  this._queue = []
}

Benchmark.prototype._measureSynchronous = measureSynchronous
Benchmark.prototype._measureAsynchronous = measureAsynchronous

Benchmark.prototype._executeNext = function (cb) {
  if (this._queue.length > 0) {
    var test = this._queue.shift()

    if (test.fn.length > 0) {
      this._measureAsynchronous(test.fn, function (err, result) {
        if (err) {
          cb(err)
        } else {
          result.name = test.name
          this.results.push(result)
          this._executeNext(cb)
        }
      }.bind(this))
    } else {
      var result = this._measureSynchronous(test.fn)
      result.name = test.name
      this.results.push(result)
      this._executeNext(cb)
    }
  } else {
    cb && cb()
  }

  return this
}

Benchmark.prototype.run = function (cb) {
  return this._executeNext(function (err, result) {
    if (err) {
      cb && cb.bind(this)(err, null)
    } else {
      cb && cb.bind(this)(null, this.results)
    }
  }.bind(this))
}

Benchmark.prototype.measure = function measure (name, fn) {
  this._queue.push({name: name, fn: fn})
  return this
}

Benchmark.prototype.toTable = toTable
