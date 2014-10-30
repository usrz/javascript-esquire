module.exports = function(grunt) {
  grunt.initConfig({

    /* Unit testing */
    karma: {
      load: {
        configFile: 'karma.load.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],
        logLevel: 'ERROR'
      },
      default: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],
        logLevel: 'ERROR'
      },
    },

    /* Uglify task */
    uglify: {
      karma: {
        src: 'src/esquire-karma.js',
        dest: 'esquire-karma.min.js'
      },
      load: {
        src: 'src/esquire-load.js',
        dest: 'esquire-load.min.js'
      },
      inject: {
        src: 'src/esquire-inject.js',
        dest: 'esquire-inject.min.js'
      },
      defaut: {
        src: [ 'src/esquire-inject.js', 'src/esquire-load.js' ],
        dest: 'esquire.min.js'
      }
    },

    /* Documentation task */
    jsdoc : {
      dist : {
        src: ['src/*.js', 'README.md'],
        options: {
          destination: 'docs',
          template : "node_modules/jaguarjs-jsdoc",
          configure : "jsdoc.conf.json"
        }
      }
    }

  });

  /* Load our plugins */
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');

  /* Default task: requirejs then uglify */
  grunt.registerTask('default', ['karma', 'uglify', 'jsdoc']);
  grunt.registerTask('quick', ['uglify', 'jsdoc']);

};
