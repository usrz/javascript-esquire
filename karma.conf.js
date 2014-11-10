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
      'test/esquire-inject.test.js',
      'test/modules/*.js',
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    browsers: [ 'PhantomJS', 'Chrome', 'Firefox', 'Safari' ],
  });
};
