# scijs-benchmark

> A very simple benchmark utility

## Introduction

This utility provides a simple, few-frills benchmark tool. It performs synchronous or asynchronous tests and allows for either manual or built-in timing. It computes the online mean and variance and returns very simple statistics.

## Examples
### Basic example

A simple synchronous test looks like this:

```javascript
var Benchmark = require('scijs-benchmark')

var bench = new Benchmark({maxDuration: 200})

bench.measure('Cosine x 100000', function () {
  for (var i = 0; i < 100000; i++, Math.cos(Math.PI));
})
bench.measure('Sine x 100000', function () {
  for (var i = 0; i < 100000; i++, Math.sin(Math.PI));
})

bench.run(function(err, results) {
  console.log(results)
})

// Prints:
//  [ { n: 39,
//      minimum: 3,
//      mean: 3.333333333333334,
//      variance: 0.22807017543859653,
//      stddev: 0.47756693294091934,
//      name: 'Cosine x 100000' },
//    { n: 39,
//      minimum: 3,
//      mean: 3.3846153846153855,
//      variance: 0.2955465587044533,
//      stddev: 0.5436419397953521,
//      name: 'Sine x 100000' } ]
```

### Table Output

For convenience, the results may be outputted as a table:

```javascript
console.log(bench.toTable())
// ╔═════════════════╤═════════╤══════════════╤═══════════╤═════════════════════════╗
// ║ Test            │ Samples │ Minimum (ms) │ Mean (ms) │ Standard Deviation (ms) ║
// ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
// ║ Cosine x 100000 │ 39      │ 3.00         │ 3.33      │ +/- 0.478 (14.3%)       ║
// ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
// ║ Sine x 100000   │ 39      │ 3.00         │ 3.38      │ +/- 0.544 (16.1%)       ║
// ╚═════════════════╧═════════╧══════════════╧═══════════╧═════════════════════════╝
```

### Custom timing function

The minimum for both tests reflects the (lack of) precision of `Date.now`. To use a high resolution timer,
you may specify a method for querying the time and computing the difference. For example, to use
`process.hrtime` to compute the time in milliseconds,

```javascript
var bench = new Benchmark({
  maxSamples: 1000,
  maxDuration: 200,
  getTime: process.hrtime,
  getTimeDiff: function (t1, t2) {
    return (t2[0] - t1[0]) * 1e3 + (t2[1] - t1[1]) * 1e-6
  }
})

// Running same tests as above prints:
//  ╔═════════════════╤═════════╤══════════════╤═══════════╤═════════════════════════╗
//  ║ Test            │ Samples │ Minimum (ms) │ Mean (ms) │ Standard Deviation (ms) ║
//  ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
//  ║ Cosine x 100000 │ 39      │ 3.19         │ 3.32      │ +/- 0.354 (10.7%)       ║
//  ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
//  ║ Sine x 100000   │ 44      │ 3.02         │ 3.08      │ +/- 0.110 (3.57%)       ║
//  ╚═════════════════╧═════════╧══════════════╧═══════════╧═════════════════════════╝
```

### Manual timing

If your task has custom setup and teardown procedures, you may override built-in timing with your own by returning the measured time:

```javascript
bench.measure('A complicated test', function () {
  // Complicated setup here
  var t1 = Date.now()
  // Complicated work
  var t2 = Date.now()
  // Teardown

  return t2 - t1
})
```

### Asynchronous benchmarks

If the function provided to `measure` takes an argument, it will be interepreted as an asynchronous test. To complete the test, you must execute the callback with errors as the first argument and, optionally, the measured time elapsed as the second.

```javascript
bench.measure('Async test with manual timing', function (done) {
  var t1 = Date.now()
  myAsyncWork(function () {
    ...
    var t2 = Date.now()
    done(null, t2 - t1)
  })
})
bench.measure('Async test with automatic timing', function (done) {
  myAsyncWork(done)
})
```

**NB: If using the asynchronous form, the callback must actually be called asynchronously (via `process.nextTick`, `setImmediate`, `setTimeout` or similar, otherwise a stack overflow may result.**


## Installation

```bash
npm install scijs-benchmark
```

```javascript
var Benchmark = require('scijs-benchmark')
```


## Usage

### `Benchmark([options])`
Constructor for a set of benchmarks

**Arguments**
- `options`: an object containing options as keys. Options are:
  - **`minSamples : Number`**: Integer representing the minimum number of samples to be acquired. (Overrules maxDuration)
  - **`maxSamples : Number`**: Integer representing the maximum number of samples to be acquired
  - **`maxDuration : Number`**: Number representing the maximum number of milliseconds for which to acquire samples. (Does not stop single samples already in progress.)
  - **`discardFirst : Number`**: Integer representing the number of initial samples to be thrown away. (Useful for ensuring the optimized function is being tested.)
  - **`getTime : function()`**: Callback that returns the current time. Used internally in case the elapsed time is not computed and returned manually. Set by default to `Date.now`.
  - **`getTimeDiff : function(t1, t2)`**: Callback executed internally to compute the difference between the start and end times of a sample. Only invoked if the elapsed time is not computed and returned manually. By default, `function(t1, t2) { return t2 - t1 }`.


#### Methods
The constructed `Benchmark` contains the following methods:

##### `.measure(name, fn)`
Register a function to be tested. If `fn` takes no arguments and returns `undefined`, timing will be performed automatically. I

##### `.run([onComplete])`



## License
&copy; 2016 Ricky Reusser. MIT License.
