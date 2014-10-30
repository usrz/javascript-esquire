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
      'src/esquire-karma.js',
      'src/esquire-load.js',
      'test/esquire-inject.test.js',

      /* Loaded */
      { pattern: 'test/**/*.js',   included: false },
      { pattern: 'test/**/*.html', included: false },
    ],

    /* Exclude load and browser files */
    exclude: [
      'test/browser/**',
      'test/load/**'
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    browsers: [ 'PhantomJS', 'Chrome', 'Firefox', 'Safari' ],
  });
};
