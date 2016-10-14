/**
 * Module dependencies.
 */

var Base = require('mocha').reporters.Base
  , cursor = Base.cursor
  , color = Base.color
  , fs = require('fs')
  , path = require('path')
  , diff= require('diff')
  , mkdirp = require('mkdirp');

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `Jenkins`.
 */

exports = module.exports = Jenkins;

/**
 * Initialize a new `Jenkins` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Jenkins(runner, options) {
  Base.call(this, runner);
  var self = this,
      options = (options && options.reporterOptions) || {};
  var fd, currentSuite;

  // Default options
  options.junit_report_stack = process.env.JUNIT_REPORT_STACK || options.junit_report_stack;
  options.junit_report_path = process.env.JUNIT_REPORT_PATH || options.junit_report_path;
  options.junit_report_name = process.env.JUNIT_REPORT_NAME || options.junit_report_name || 'Mocha Tests';
  options.jenkins_reporter_enable_sonar = process.env.JENKINS_REPORTER_ENABLE_SONAR || options.jenkins_reporter_enable_sonar;
  options.jenkins_reporter_test_dir =  process.env.JENKINS_REPORTER_TEST_DIR || options.jenkins_reporter_test_dir  || 'test';

  function writeString(str) {
    if (fd) {
      var buf = new Buffer(str);
      fs.writeSync(fd, buf, 0, buf.length, null);
    }
  }

  function genSuiteReport() {
    var testCount = currentSuite.failures+currentSuite.passes;
    if (currentSuite.tests.length > testCount) {
      // we have some skipped suites included
      testCount = currentSuite.tests.length;
    }
    if (testCount === 0) {
      // no tests, we can safely skip printing this suite
      return;
    }

    writeString('<testsuite');
    writeString(' name="'+htmlEscape(currentSuite.suite.fullTitle())+'"');
    writeString(' tests="'+testCount+'"');
    writeString(' failures="'+currentSuite.failures+'"');
    writeString(' skipped="'+(testCount-currentSuite.failures-currentSuite.passes)+'"');
    writeString(' timestamp="'+currentSuite.start.toUTCString()+'"');
    writeString(' time="'+(currentSuite.duration/1000)+'"');
    writeString('>\n');

    if (currentSuite.tests.length === 0 && currentSuite.failures > 0) {
      writeString('<testcase');
      writeString(' classname="'+htmlEscape(currentSuite.suite.fullTitle())+'"');
      writeString(' name="'+htmlEscape(currentSuite.suite.fullTitle())+' before"');
      writeString('>\n');
      writeString('<failure message="Failed during before hook"/>');
      writeString('</testcase>\n');
    } else {
      currentSuite.tests.forEach(function(test) {
        writeString('<testcase');
        writeString(' classname="'+getClassName(test, currentSuite.suite)+'"');
        writeString(' name="'+htmlEscape(test.title)+'"');
        writeString(' time="'+(test.duration/1000)+'"');
        if (test.state == "failed") {
          writeString('>\n');
          writeString('<failure message="');
          if (test.err.message) writeString(htmlEscape(test.err.message));
          writeString('">\n');
          writeString(htmlEscape(unifiedDiff(test.err)));
          writeString('\n</failure>\n');
          writeString('</testcase>\n');
        } else if(test.state === undefined) {
          writeString('>\n');
          writeString('<skipped/>\n');
          writeString('</testcase>\n');
        } else {
          writeString('/>\n');
        }
      });
    }

    writeString('</testsuite>\n');
  }

  function startSuite(suite) {
    currentSuite = {
      suite: suite,
      tests: [],
      start: new Date,
      failures: 0,
      passes: 0
    };
    console.log();
    console.log("  "+suite.fullTitle());
  }

  function endSuite() {
    if (currentSuite != null) {
      currentSuite.duration = new Date - currentSuite.start;
      console.log();
      console.log('  Suite duration: '+(currentSuite.duration/1000)+' s, Tests: '+currentSuite.tests.length);
      try {
      genSuiteReport();
      } catch (err) { console.log(err) }
      currentSuite = null;
    }
  }

  function addTestToSuite(test) {
    currentSuite.tests.push(test);
  }

  function indent() {
    return "    ";
  }

  function htmlEscape(str) {
      return String(str)
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
  }

  function unifiedDiff(err) {
    function escapeInvisibles(line) {
      return line.replace(/\t/g, '<tab>')
                 .replace(/\r/g, '<CR>')
                 .replace(/\n/g, '<LF>\n');
    }
    function cleanUp(line) {
      if (line.match(/\@\@/)) return null;
      if (line.match(/\\ No newline/)) return null;
      return escapeInvisibles(line);
    }
    function notBlank(line) {
      return line != null;
    }

    var actual = err.actual,
        expected = err.expected;

    var lines, msg = '';

    if (err.actual && err.expected) {
      // make sure actual and expected are strings
      if (!(typeof actual === 'string' || actual instanceof String)) {
        actual = JSON.stringify(err.actual);
      }

      if (!(typeof expected === 'string' || expected instanceof String)) {
        expected = JSON.stringify(err.actual);
      }

      msg = diff.createPatch('string', actual, expected);
      lines = msg.split('\n').splice(4);
      msg += lines.map(cleanUp).filter(notBlank).join('\n');
    }

    if (options.junit_report_stack && err.stack) {
      if (msg) msg += '\n';
      lines = err.stack.split('\n').slice(1);
      msg += lines.map(cleanUp).filter(notBlank).join('\n');
    }

    return msg;
  }

  function getClassName(test, suite) {
    var title = suite.fullTitle();
    if (options.jenkins_reporter_enable_sonar) {
      // Inspired by https://github.com/pghalliday/mocha-sonar-reporter
      var relativeTestDir = options.jenkins_reporter_test_dir,
          absoluteTestDir = path.join(process.cwd(), relativeTestDir),
          relativeFilePath = path.relative(absoluteTestDir, test.file),
          fileExt = path.extname(relativeFilePath);
      title = relativeFilePath.replace(new RegExp(fileExt+"$"), '');
    }
    return htmlEscape(title);
  }

  runner.on('start', function() {
    var reportPath = options.junit_report_path;
    var suitesName = options.junit_report_name;
    if (reportPath) {
      if (fs.existsSync(reportPath)) {
        var isDirectory = fs.statSync(reportPath).isDirectory();
        if (isDirectory) reportPath = path.join(reportPath, new Date().getTime() + ".xml"); 
      } else {
        mkdirp.sync(path.dirname(reportPath));
      }
      fd = fs.openSync(reportPath, 'w');
    }
    writeString('<testsuites name="' + suitesName + '">\n');
  });

  runner.on('end', function() {
    endSuite();
    writeString('</testsuites>\n');
    if (fd) fs.closeSync(fd);
    self.epilogue.call(self);
  });

  runner.on('suite', function (suite) {
    if (currentSuite) {
      endSuite();
    }
    startSuite(suite);
  });


  runner.on('test end', function(test) {
    addTestToSuite(test);
  });

  runner.on('pending', function(test) {
    var fmt = indent()
      + color('checkmark', '  -')
      + color('pending', ' %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function(test) {
    currentSuite.passes++;
    var fmt = indent()
      + color('checkmark', '  '+Base.symbols.dot)
      + color('pass', ' %s: ')
      + color(test.speed, '%dms');
   console.log(fmt, test.title, test.duration);
  });

  runner.on('fail', function(test, err) {
    var n = ++currentSuite.failures;
    var fmt = indent()
      + color('fail', '  %d) %s');
    console.log(fmt, n, test.title);
  });
}

Jenkins.prototype.__proto__ = Base.prototype;
