module.exports = function(grunt) {

  /* Chai for simple mocha */
  var chai = require('chai');
  chai.config.includeStack = true;
  global.expect = chai.expect;

  /* Grunt initialization */
  grunt.initConfig({

    /* Unit testing */
    'karma': {
      'default': {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],
        logLevel: 'ERROR'
      },
    },

    /* Simple mocha */
    simplemocha: {
      'default': {
        src: [ 'index.js',
               'src/mocha.js',
               'test/deferred.test.js',
               'test/promise.test.js',
               'test/esquire.test.js',
               'test/global.test.js',
               'test/modules/*.js' ]
      }
    },

    /* Uglify task */
    'uglify': {
      'inject': {
        src: 'src/esquire.js',
        dest: 'esquire.min.js'
      },
      'defaut': {
        src: [ 'src/esquire.js', 'src/loader.js' ],
        dest: 'esquire-full.min.js'
      }
    },

    /* Documentation task */
    'jsdoc-ng' : {
      'dist' : {
        src: ['src/**/*.js', 'src/**/*.jsdoc', 'README.md' ],
        dest: 'docs',
        template : 'jsdoc-ng',
        options: {
          "plugins": ["plugins/markdown"],
          "templates": {
            "cleverLinks": true,
          },
          "markdown": {
            "parser": "gfm",
            "hardwrap": true
          }
        }
      }
    },

    /* Publish GirHub Pages */
    'gh-pages': {
      src: '**/*',
      'options': {
        base: 'docs'
      }
    }

  });

  /* Load our plugins */
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc-ng');
  grunt.loadNpmTasks('grunt-gh-pages');

  /* Default task: requirejs then uglify */
  grunt.registerTask('default', ['test', 'uglify']);
  grunt.registerTask('test',    ['karma', 'simplemocha', 'uglify']);
  grunt.registerTask('docs',    ['jsdoc-ng', 'gh-pages']);

};
