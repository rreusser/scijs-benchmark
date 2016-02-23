# scijs-benchmark

> A very simple benchmark utility

## Introduction

This module implements a simple, very-few-frills benchmark tool. It performs synchronous or asynchronous tests and allows for either manual or built-in timing. It computes the online mean and variance and returns some simple statistics. Its philosophy is that it coordinates the sampling and sequencing but otherwise tries to add as little as possible.

## Installation

```bash
npm install scijs-benchmark
```

```javascript
var Benchmark = require('scijs-benchmark')
```

## Examples
### Basic example

The example below shows a simple benchmark containing two synchronous tests. The results are outputted as a two-element array containing the results in the order they were added.

```javascript
new Benchmark({
    discardFirst: 10
    maxDuration: 200
    minSamples: 10
    maxSamples: 100,
  })
  .measure('cos(pi) x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.cos(Math.PI));
  })
  .measure('sin(pi) x 100000', function () {
    for (var i = 0; i < 100000; i++, Math.sin(Math.PI));
  })
  .run(function(err, results) {
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

For convenience, the results may be converted to a tabular array with headings. From there it's a one-liner to use a module like [table]() to pretty print them.

```javascript
var table = require('table').default

console.log(table(bench.toTable()))

// ╔═════════════════╤═════════╤══════════════╤═══════════╤═════════════════════════╗
// ║ Test            │ Samples │ Minimum (ms) │ Mean (ms) │ Standard Deviation (ms) ║
// ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
// ║ Cosine x 100000 │ 39      │ 3.00         │ 3.33      │ +/- 0.478 (14.3%)       ║
// ╟─────────────────┼─────────┼──────────────┼───────────┼─────────────────────────╢
// ║ Sine x 100000   │ 39      │ 3.00         │ 3.38      │ +/- 0.544 (16.1%)       ║
// ╚═════════════════╧═════════╧══════════════╧═══════════╧═════════════════════════╝
```

### Automatic timing

The numerically identical minima in the test above reflect the (lack of) precision of `Date.now`.
To use a high resolution timer, you may specify a method for querying the time and computing the
difference. For example, to use `process.hrtime` to compute the time in milliseconds,

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

If your task has custom setup and teardown procedures, you may override built-in timing by simply measuring and returning the time yourself:

```javascript
bench.measure('A complicated test', function () {
  var t1, t2

  // Setup

  t1 = Date.now()
  // Work to be measured
  t2 = Date.now()

  // Teardown

  return t2 - t1
})
```

### Asynchronous benchmarks

If the function provided to `measure` takes an argument, it is interepreted as an asynchronous test. To complete the test, you must execute the callback with errors as the first argument and, optionally, the measured time elapsed as the second.

```javascript
bench.measure('Async test with automatic timing', function (done) {
  myAsyncWork(done)
})

bench.measure('Async test with manual timing', function (done) {
  var t1 = Date.now()
  myAsyncWork(function () {
    ...
    var t2 = Date.now()
    done(null, t2 - t1)
  })
})
```

**NB: If using the asynchronous form, the callback must actually be asynchronous (via `process.nextTick`, `setImmediate`, `setTimeout` or similar), otherwise a stack overflow may result.**


## Usage

### `Benchmark([options])`
Constructor for a set of benchmarks

#### Arguments
- `options`: an object containing options as keys. Options are:

| Variable | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `minSamples` | `Number` | 10 | Minimum number of samples to be acquired. (Overrules maxDuration) |
| `maxSamples` | `Number` | Infinity | Maximum number of samples to be acquired |
| `maxDuration`| `Number` | 5000 | Maximum number of milliseconds for which to acquire samples. (Does not stop single samples already in progress.) |
| `discardFirst` | `Number` | 10 | Number of initial samples to be thrown away. |
| `getTime` | `function()` | `Date.now` | Callback that returns the current time. Used internally in case the elapsed time is not computed and returned manually. Set by default to `Date.now`. |
| `getTimeDiff` | `function(t1, t2)`| `function(t1, t2) { return t2 - t1 }` | Callback executed internally to compute the difference between the start and end times of a sample. Only invoked if the elapsed time is not computed and returned manually. By default, `function(t1, t2) { return t2 - t1 }`. |
| `saveSamples` | `Boolean` | false | Save all samples to an `Array`. (Best used with `maxSamples`. This may get very large!) |

#### Methods
The constructed `Benchmark` contains the following chainable methods:

#### `.measure(name, fn)`
Register a function to be tested. `name` is an arbitrary label. If `fn` takes no arguments, it is interpreted as a synchronous test. If a synchronous test returns anything but `undefined`, the return value is interpreted as a `Number` representing the elapsed time and overrides built-in timing. If `fn` takes arguments, it is passed a callback and interpreted as an asynchronous test. On completion, this callback must be executed with `([err[, timeElapsed]])` as its arguments. The presence of `err` will halt the test. `timeElapsed`, if provided, will override built-in timing.

#### `.run([onComplete])`
Run all tests in series. Optional callback `onComplete` is bound to instance and executed on completion of all tests with arguments `(err, results)`. `results` is an `Array` containing the results of all tests in the order they were added.

#### `.toTable()`
Convert the results to an `Array` of `Array`s of nicely formatted strings. Useful for pretty-printing the results but does not itself generate a string or print to screen.

## License
&copy; 2016 Ricky Reusser. MIT License.
