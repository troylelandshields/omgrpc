var unit = require('../poisson-process.js');
var should = require('should');

describe('PoissonProcess', function () {

  describe('#create', function () {
    it('should be a function', function () {
      unit.create.should.be.a.Function;
    });

    it('should require an interval and a function', function () {
      (function () {
        unit.create(100, {});
      }).should.throw(unit.TriggerFunctionError);

      (function () {
        unit.create('100');
      }).should.throw(unit.IntervalError);

      (function () {
        unit.create();
      }).should.throw(unit.IntervalError);
    });

    it('should not accept negative interval', function () {
      (function () {
        unit.create(-100, function () {})
      }).should.throw(unit.IntervalError);
    });

    it('should accept zero interval', function (done) {
      (function () {
        var p = unit.create(0, function () {
          p.stop();
          done();
        });
        p.start();
      }).should.not.throw();
    });
  });

  describe('instance', function () {
    it('should be startable and stoppable', function (done) {
      var p = unit.create(50, function () {
        p.stop();
        done();
      });
      p.start();
    });
  });

  describe('trigger function', function () {
    it('should be called once in each interval in average', function (done) {
      // Test for a stochastic process -> may fail sometimes.
      var calls = 0;
      var maxCalls = 1000;
      var populationInterval = 50;

      // Allowed deviation of sampled interval from
      // the population interval.
      var deviation = 5; // ms

      var startTimestamp = Date.now(); // ms

      var validate = function () {
        var stopTimestamp = Date.now();
        var duration = stopTimestamp - startTimestamp;
        var sampleInterval = duration / maxCalls;

        sampleInterval.should.be.approximately(populationInterval, deviation);
        done();
      };

      var p = unit.create(populationInterval, function () {
        calls += 1;
        if (calls >= maxCalls) {
          p.stop();
          validate();
        }
      });
      p.start();
    });
  });

  it('should have a version with the format #.#.#', function() {
    unit.version.should.match(/^\d+\.\d+\.\d+$/);
  });
});
