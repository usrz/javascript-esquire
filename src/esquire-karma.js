'use strict';

(function(window) {

  /* Placeholder in case we are loaded first */
  if (! window.Esquire) window.Esquire = {};

  /* If we have karma... */
  if (window.__karma__) {
    var karma = window.__karma__;
    console.log("Esquire: We have Karma...");

    /* List of matchers, one must resolve... */
    var matchers = [];

    /**
     * Load a number of scripts before running `Karma`.
     *
     * When working with `Karma` for unit testing, this method can be used to
     * specify what scripts to be loaded with each run.
     *
     * When invoked with a `RegExp`, any file matching the expression will be
     * loaeded.
     *
     * When invoked with a `function`, the specified `function` will be invoked
     * with each file known to `Karma` and said script will be loaded if the
     * function returns a _truthy_ value.
     *
     * This method can be invoked _multiple_ times, and all callbacks or
     * expressions will be evaluated. If any of them matches, the script will
     * be loaded.
     *
     * @static
     * @function karma
     * @memberof Esquire
     * @example
     * // This will load all '/tests/deferred/....js' files
     * Esquire.karma(/^\/tests\/deferred\/.\.js$/);
     *
     * // The function will be invoked with every file, and said file will be
     * // loaded if the function returns a truthy value
     * Esquire.karma(function(file) {
     *   return ...;
     * });
     * @param {function|RegExp} what The regular expression or function matching
     *                               scripts to load before a `Karma` run.
     */
    window.Esquire.karma = function(callbackOrRegExp) {
      if (typeof(callbackOrRegExp) == 'function') {
        matchers.push(callbackOrRegExp);
      } else if (callbackOrRegExp instanceof RegExp) {
        matchers.push(function(fileName) {
          return callbackOrRegExp.test(fileName);
        });
      }
    };

    /* Replace Karma's loaded handler */
    karma.loaded = function() {

      /* Use a dictionary, remove duplicates */
      var scripts = {};

      /* See if any of the files match */
      for (var file in karma.files) {
        if (karma.files.hasOwnProperty(file)) {
          for (var matcher in matchers) {
            if (matchers[matcher](file)) {
              scripts[file] = file + "?" + karma.files[file];
            }
          }
        }
      }

      /* Convert the dictionary in an array */
      var locations = [];
      for (var i in scripts) {
        locations.push(scripts[i]);
      }

      /* Load the scripts if we have to */
      if (locations.length > 0) {

        console.log("Esquire: Loading " + locations.length + " scripts before running Karma");
        window.Esquire.load(locations)
          .then(function(success) {
            console.log("Esquire: Running Karma");
            karma.start();
          }, function(failure) {
            karma.error(failure);
          })

      } else {

        /* No scripts to load, just run */
        karma.start();
      }
    }
  }

})(self);
