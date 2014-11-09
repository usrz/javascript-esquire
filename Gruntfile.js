module.exports = function(grunt) {
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
            "cleverLinks":    true,
            "monospaceLinks": true,
            "windowTitle": "Esquire API",
            "minify": true
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
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc-ng');
  grunt.loadNpmTasks('grunt-gh-pages');

  /* Default task: requirejs then uglify */
  grunt.registerTask('default', ['karma', 'uglify'  ]);
  grunt.registerTask('docs',    ['jsdoc-ng', 'gh-pages']);

};
