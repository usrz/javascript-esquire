'use strict';

module.exports = function(config) {

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['mocha', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    /* These need to be in order */
    files: [
      'src/mocha.js',

      /* Order here is important */
      'src/esquire.js',
      'src/loader.js',

      /* Execution order of test */
      'test/deferred.test.js',
      'test/promise.test.js',
      'test/esquire.test.js',
      'test/global.test.js',
      'test/loader.test.js',

      /* Pre-loaded modules */
      'test/modules/*.js',

      /* To be loaded during loader test */
      { pattern: 'test/browser/*', included: false },
      { pattern: 'test/loader/*',  included: false },
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    browsers: [ 'PhantomJS', 'Chrome', 'Firefox', 'Safari' ],
  });
};
