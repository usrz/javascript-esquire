'use strict';

(function(window) {

  if (! window.Esquire) throw new Error("Esquire not available");

  /* ======================================================================== */
  /* Event managemet for script loading                                       */
  /* ======================================================================== */

  /* Loaded scripts are all scripts we already loaded */
  var loadedScripts = {};
  /* Script locations are then-ables for scripts being loaded */
  var scriptPromises = {};

  /* Fetch and remove the promise */
  function fetchDetails(event) {
    var filename = event.filename || event.target && event.target.src;
    if (scriptPromises[filename]) {

      /* Only process this once... */
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();

      /* Try to zap the <script /> element */
      if (event.target && event.target.parentNode) try {
        event.target.parentNode.removeChild(event.target);
      } catch (error) {
        // This might have never slapped in the DOM
      }

      /* Wipe-and-return... */
      var promise = scriptPromises[filename];
      delete scriptPromises[filename];
      promise.remaining -= 1; // decrement!
      return { script: filename, promise: promise };
    }
  }

  function onScriptLoad(event) {
    var details = fetchDetails(event);
    if (details) {
      console.debug("Esquire: Successfully loaded script '", details.script, "'");
      if (details.promise.remaining == 0) {
        details.promise.resolve(Esquire.modules);
      }

    }
  }

  function onScriptError(event) {
    var details = fetchDetails(event);
    if (details) {
      console.warn("Esquire: Unable to load script '", details.script, "'");
      var error = event.error || new Error("Unable to load script '" + details.script + "'");
      details.promise.reject(error);
    }
  }

  /* Global error handlers */
  window.addEventListener('error', onScriptError, true);

  /* ======================================================================== */
  /* Script loader, exposed as a static method on the Esquire class           */
  /* ======================================================================== */

  /* Our document reference */
  var document = window.document;

  /**
   * Load an external script and return a _then-able_
   * [`Promise`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).
   *
   * @static
   * @function load
   * @memberof Esquire
   * @example -
   * Esquire.load('scriptA.js', 'scriptB.js').then(
   *   function(modules) {
   *     // All good: 'modules' will be the same as "Esquire.modules"
   *   },
   *   function(failure) {
   *     // Something bad happend: 'failure' will contain the reason.
   *   }
   * );
   * @param {string|string[]} scripts The script(s) to load.
   * @param {string} [...] - Any other script names, as arguments, to support
   *                         calls like `load('scriptA.js', 'scriptB.js')`
   * @return {Promise} A _then-able_ `Promise` resolving {@link Esquire.modules}.
   */
  function load() {
    if (! document) throw new Error("Esquire: Document not available");

    /* Find our first script and its parent */
    var firstScript = document.getElementsByTagName('script')[0];
    var scriptsParent = firstScript.parentNode;

    /* Our then-able for notifications */
    var thenable = new Esquire.$$Deferred(function(success) {
        return success;
      }, function(failure) {
        throw failure;
      });

    /* Mark the number of remainig scripts on the then-able */
    thenable.remaining = 0;

    /* Create all our script tags */
    var locations = Esquire.$$normalize(arguments).arguments;
    var scripts = [];
    for (var i in locations) {
      (function(location) {
        /* Create our script tags */
        var script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = location;

        /* Normalize location */
        location = script.src;

        /* Skip loading if we already did, or remember location and the prmise */
        if (loadedScripts[location]) {
          console.debug("Esquire: Script '" + location + "' already loaded");
        } else if (scriptPromises[location]) {
          console.debug("Esquire: Script '" + location + "' already being loaded");
        } else {
          script.addEventListener('load', onScriptLoad, false);
          script.addEventListener('error', onScriptError, false);
          scriptPromises[location] = thenable;

          /* Remember our script and its location */
          thenable.remaining += 1;
          scripts.push(script);

        }

      })(locations[i]);
    }

    /* Load all our script tags */
    if (scripts.length == 0) {
      thenable.resolve(Esquire.modules);
    } else {
      for (var i in scripts) {
        console.debug("Esquire: About to load '" + scripts[i].src + "'");
        scriptsParent.insertBefore(scripts[i], firstScript);
      }
    }

    /* Return a then-able */
    return thenable.promise;
  }

  /* ======================================================================== */
  /* Object definition                                                        */
  /* ======================================================================== */

  /* Placeholder for Esquire */
  if (! window.Esquire) window.Esquire = {};
  window.Esquire.load = load;


})(window);