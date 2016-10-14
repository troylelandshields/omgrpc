Mocha Jenkins Reporter
======================

This reporter is useful if you want to run Node.js backend tests using mocha and need a nicely formatted Jenkins reports of the test runs. The existing `xunit` reporter is very similar, but doesn't make it possible to output both XML report and a console output at the same time, which would often be useful with Jenkins.

The `xunit` reporter also doesn't handle separate tests suites but adds all tests to a single suite instead, this reporter instead combines nested test suites to a single suite and uses that in the reports. As a nice plus, this reporter also shows the running time of each suite separately. All the code is released under the `MIT` license which can be found from the end of this file.


General Information
-------------------

First you need to add the library to your package.json, you can use the following setting to get the latest version:

`"mocha-jenkins-reporter": "0.1.9"`

For the actual test run you can use the following Makefile:

```
jenkins:
	@JUNIT_REPORT_PATH=report.xml JUNIT_REPORT_STACK=1 ./node_modules/.bin/mocha --reporter mocha-jenkins-reporter || true

.PHONY: jenkins
```

The @ in the beginning is just `make` syntax for not printing out the line. Because mocha by default reports the number of failed tests as the return code (and it is a good thing) we need to add `|| true` to the end of the command in order to make Jenkins not interpret this run as a crash.

The environment variable `JUNIT_REPORT_PATH` is used for passing the output filename or directory for the reporter. If an explicit filename is used, any existing reports in the same path will be overwritten, so be careful with it. If an existing directory is used instead, then the output will be in the format "path/to/directory/timestamp.xml" where timestamp is milliseconds since January 1, 1970. If the environment variable is not set, no JUnit style XML report is written and the test results are only printed to the console.

The environment variable `JUNIT_REPORT_NAME` is used for giving an optional name for testsuites, defaults to "Mocha Tests".

The environment variable `JUNIT_REPORT_STACK` is used to enable writing the stack trace for failed tests.

Example console output of the reporter:

```
  In test suite number one
      ․ the asynchronous test should work: 47ms

  Suite duration: 0.048 s, Tests: 1
```

Programmatic Configuration
--------------------------
All of the above config values can be set with options passed in to mocha.
```
mocha({
            "reporter": "mocha-jenkins-reporter",
            "reporterOptions": {
                "junit_report_name": "Tests",
                "junit_report_path": "report.xml",
                "junit_report_stack": 1
            }
        }
```

Jenkins Setup
-------------

If you use the Makefile specified in the last section, setting up Jenkins should be pretty straighforward. For the shell execution you can use something like this:

```
cd $WORKSPACE
npm install
make jenkins
```

Make sure to set the `Color ANSI Console Output` on and use for example `xterm` for the `ANSI color map` setting, in order to show the output colors nicely in Jenkins.

After this you should be able to add `Publish JUnit test result report` in your `Post-build Actions` and write for example `report.xml` to the `Test report XMLs` field if your Makefile was exactly as above. You can use your own variations of these commands as you wish, but this should get anyone started.

After all this setting up, just click `Save` and start building, you should get all errors nicely both to the console log as the tests are being run and finally to the Jenkins reports.

SonarQube Integration
---------------------

[SonarQube](http://www.sonarqube.org/) is a popular tool for continuous inspection of code quality. You can find documentation for JavaScript language on [JavaScript Plugin](http://docs.sonarqube.org/display/SONAR/JavaScript+Plugin) page.

One aspect of SonarQube analysis is outcome of unit tests. To properly display test results environment variable `JENKINS_REPORTER_ENABLE_SONAR` must be set to `true`. By default reporter looks for tests in `./test` directory. It can be changed using environment variable `JENKINS_REPORTER_TEST_DIR` and providing relative path to the directory with tests.

License
-------

```
Copyright (c) 2015 Juho Vähä-Herttua and contributors
Copyright (c) 2013-2014 Futurice Ltd and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
