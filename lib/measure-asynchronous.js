'use strict'

module.exports = measureAsynchronous

function measureAsynchronous (fn, cb) {
  var n = 0, sample = 0

  var t1, t2, tMeasured, delta, stddev, variance
  var mean = 0
  var minimum = Infinity
  var M2 = 0
  var tStart = Date.now()


  var next = function (err, dt) {
    t2 = this.getTime()
    sample++

    if (++sample > this.discardFirst) {
      ++n

      tMeasured = dt === undefined ? this.getTimeDiff(t1, t2) : dt
      delta = tMeasured - mean
      mean += delta / n
      M2 += delta * (tMeasured - mean)
      minimum = Math.min(minimum, tMeasured)
    }

    if (err) {
      cb(err);
    } else if ((n < this.maxSamples && Date.now() - tStart < this.maxDuration) || n < this.minSamples) {
      // If less than maxSamples and not too much time, then get another sample:
      t1 = this.getTime()
      fn(next);
    } else {

      variance = M2 / (n - 1)
      stddev = Math.sqrt(variance)

      cb(null, {
        n: n,
        minimum: minimum,
        mean: mean,
        variance: variance,
        stddev: stddev
      })
    }
  }.bind(this)

  t1 = this.getTime()
  fn(next)
}
