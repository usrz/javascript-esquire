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
      'src/esquire-inject.js',
      'src/esquire-load.js',
      'lib/promises.test.js',

      'test/deferred.test.js',
      'test/promise.test.js',
      'test/esquire-inject.test.js',
      'test/esquire-global.test.js',
      'test/esquire-loader.test.js',
      'test/modules/*.js',

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
