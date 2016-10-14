# poisson-process.js<sup>v0.2.1</sup>

[![npm](https://img.shields.io/npm/v/poisson-process.svg?style=flat)](https://www.npmjs.com/package/poisson-process)
![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat) [![licence](https://img.shields.io/npm/l/poisson-process.svg?style=flat)](https://www.npmjs.com/package/poisson-process)

A JavaScript library to generate events in realistically varying time intervals to __improve realism in your games or animations__. For example it can be used to simulate aliens walking by a window or cars trying to drive over your character on a busy road. It can also be used to simulate the frequency of chat messages, page loads or arriving emails as well as queues, traffic and earthquakes. The underlying mathematical concept is called the [Poisson process](https://en.wikipedia.org/wiki/Poisson_process).

![Constant vs Poisson process](../master/doc/cars.gif?raw=true)

In the animation above, the blue cars drive by in constant time intervals and the red ones in more natural, randomised intervals typical for the Poisson process.



## Usage

It is simple; you specify an __average call interval__ in milliseconds, a __function to be called__ and then __start__ the process.

    var p = PoissonProcess.create(500, function message() {
      console.log('A message arrived.')
    })
    p.start()

Now the `message` function will be called each 500 milliseconds __in average__. The delay from a previous call can vary from near 0 milliseconds to a time that is significantly longer than the given average, even though the both ends are very unlikely.

The process is paused by:

    p.stop()



## Installation

### Browsers

    <script src="scripts/poisson-process.js"></script>

### CommonJS & Node.js

    $ npm install poisson-process
    ---
    > var PoissonProcess = require('poisson-process');

### AMD & Require.js

    define(['scripts/poisson-process'], function (PoissonProcess) { ... });



## API

### PoissonProcess.create(averageIntervalMs, triggerFunction)

The `create` constructor takes in two parameters. The `averageIntervalMs` is an integer and the average interval in milliseconds to call the `triggerFunction`. The `triggerFunction` takes no parameters and does not have to return anything.

    var p = PoissonProcess.create(500, function message() {
      console.log('A message arrived.')
    })

### p.start()

Start the process; begin to call the `triggerFunction`.

    p.start()

### p.stop()

Stop the process; do not anymore call the `triggerFunction`.

    p.stop()

### PoissonProcess.sample(average)

The `sample` provides a raw acces to the underlying generator for the call intervals. It returns a number; a sample from the exponential distribution with the mean `average`.

    PoissonProcess.sample(500)  // returns 323.02...
    PoissonProcess.sample(500)  // returns 941.33...
    PoissonProcess.sample(500)  // returns 609.86...


## Theory

The poisson-process.js is based on the mathematical concept of the [Poisson process](https://en.wikipedia.org/wiki/Poisson_process). It is a stochastic process that is usually perceived in the frequency of earthquakes, arriving mail and, in general, the other series of events where a single event, like an arriving letter, does not much depend on the other events, like the preceding or following letters.

It is well known that inter-arrival times of the events in a Poisson process follow an exponential distribution with a rate parameter *r*. It is also known that the multiplicative inverse of *r*, *1/r* is the average of the inter-arrival times. Therefore to generate an event each *m* milliseconds in average, we sample the exponential distribution of the rate of *1/m*.

More detailed and enjoyable introduction to the theory is given by [Jeff Preshing](http://preshing.com/) at [How to Generate Random Timings for a Poisson Process](http://preshing.com/20111007/how-to-generate-random-timings-for-a-poisson-process/).



## Notes for developers

Run tests with `$ npm test`. Build with `$ gulp`.



## Todo

- More [accurate timing](http://www.sitepoint.com/creating-accurate-timers-in-javascript/).
- Examples.



## Versioning

[Semantic Versioning 2.0.0](http://semver.org/)



## License

[MIT License](../blob/master/LICENSE)
