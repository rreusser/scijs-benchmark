'use strict'

module.exports = measureSynchronous

function measureSynchronous (fn) {
  var t1, t2, tRet, tMeasured, delta, variance, stddev
  var sample = 0
  var n = 0
  var mean = 0
  var M2 = 0
  var tStart = Date.now()
  var minimum = Infinity

  var tTotal = 0

  while (n < this.maxSamples) {

    t1 = this.getTime()
    tRet = fn()
    t2 = this.getTime()

    if (++sample > this.discardFirst) {

      tMeasured = tRet === undefined ? this.getTimeDiff(t1, t2) : tRet
      minimum = Math.min(minimum, tMeasured)

      var stddev = Math.sqrt(M2 / (n-1))
      delta = tMeasured - mean

      ++n
      mean += delta / n
      M2 += delta * (tMeasured - mean)
    }

    if (n >= this.minSamples && Date.now() - tStart > this.maxDuration) {
      break;
    }
  }

  variance = M2 / (n - 1)
  stddev = Math.sqrt(variance)

  return {
    n: n,
    minimum: minimum,
    mean: mean,
    variance: variance,
    stddev: stddev
  }
}
