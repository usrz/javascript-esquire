'use strict';

module.exports = function(config) {

  console.log("* ================================================= *");
  console.log("* Esquire loader tests also available at:           *");
  console.log("* http://127.0.0.1:9876/base/test/browser/test.html *");
  console.log("* ================================================= *");
  console.log("");

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['mocha', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    /* These need to be in order */
    files: [
      'src/esquire-inject.js',
      'src/esquire-load.js',
      'test/esquire-load.test.js',

      /* To be loaded by Esquire */
      { pattern: 'test/**/*.js',   included: false },
      { pattern: 'test/**/*.html', included: false },
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    browsers: [ 'PhantomJS', 'Chrome', 'Firefox', 'Safari' ],
  });
};
