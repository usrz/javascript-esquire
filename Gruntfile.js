module.exports = function(grunt) {

  /* Chai for simple mocha */
  var chai = require('chai');
  chai.config.includeStack = true;
  global.expect = chai.expect;

  /* Grunt initialization */
  grunt.initConfig({

    /* Unit testing */
    'karma': {
      'load': {
        configFile: 'karma.load.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],
        logLevel: 'ERROR'
      },
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
               'test/esquire-global.test.js',
               'test/esquire-inject.test.js',
               'test/modules/*.js' ]
      }
    },

    /* Uglify task */
    'uglify': {
      'load': {
        src: 'src/esquire-load.js',
        dest: 'esquire-load.min.js'
      },
      'inject': {
        src: 'src/esquire-inject.js',
        dest: 'esquire-inject.min.js'
      },
      'defaut': {
        src: [ 'src/esquire-inject.js', 'src/esquire-load.js' ],
        dest: 'esquire.min.js'
      }
    },

    /* Documentation task */
    'jsdoc-ng' : {
      'dist' : {
        src: ['src/*.js', 'README.md' ],
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
