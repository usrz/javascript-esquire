'use strict';

(function(window) {

  /* Placeholder in case we are loaded first */
  if (! window.Esquire) throw new Error("Esquire not avaiable");

  /* If we have karma... */
  if (window.__karma__) {
    var karma = window.__karma__;
    console.log("Esquire: We have Karma...");

    /* List of matchers, one must resolve... */
    var matchers = [];

    /* Load scripts for Karma */
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
      var promise;
      if (locations.length > 0) {
        console.log("Esquire: Loading " + locations.length + " scripts before running Karma");
        promise = window.Esquire.load(locations);
      } else {
        promise = window.Esquire.$$Promise.resolve();
      }

      /* Inject tests if we have to */
      if (Esquire.tests) promise = promise.then(Esquire.tests);

      /*  */
      promise.then(function(success) {
        console.log("Esquire: Running Karma...");
        karma.start();
      }, function(failure) {
        console.error("Esquire: Unable to run Karma", failure);
        karma.error(failure);
      });

    }
  }

})(window);