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
  var maximum = 0
  var samples = []

  var tTotal = 0

  while (n < this.maxSamples || n < this.minSamples) {

    t1 = this.getTime()
    tRet = fn()
    t2 = this.getTime()

    if (++sample > this.discardFirst) {

      tMeasured = tRet === undefined ? this.getTimeDiff(t1, t2) : tRet

      if (this.saveSamples) {
        samples.push(tMeasured)
      }

      minimum = Math.min(minimum, tMeasured)
      maximum = Math.max(maximum, tMeasured)

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

  var ret = {
    n: n,
    minimum: minimum,
    maximum: maximum,
    mean: mean,
    variance: variance,
    stddev: stddev
  }

  if (this.saveSamples) {
    ret.samples = samples
  }

  return ret
}
