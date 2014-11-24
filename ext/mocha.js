'use strict';

(function (global) {

  /* Remember the current "it(...)" and "describe(...)" */
  var _it = global.it;
  var _describe = global.describe;

  /* Defer any call to "it(...)" or "describe(...)" */
  var _last = 0;
  var _tests = [];
  function defer(fn) {
    function deferred() {
      var test = "$$esquire_test$$/" + (++_last);
      _tests.push(test);
      var args = arguments;
      Esquire.define(test, [], function() {
        fn.apply(global, args);
      });
    }
    if (fn.only) deferred.only = defer(fn.only);
    if (fn.skip) deferred.skip = defer(fn.skip);
    return deferred;
  }

  /* Mocha might set "it" and "describe" multiple times, trap their values */
  var _defer = true;
  Object.defineProperties(global, {
    "it": {
      enumerable: true,
      configurable: false,
      get: function() {
        if (! _it) throw new Error("Global 'it(...)' not available");
        return _defer ? defer(_it) : _it;
      },
      set: function(it) {
        _it = it;
      }
    },
    "describe": {
      enumerable: true,
      configurable: false,
      get: function() {
        if (! _describe) throw new Error("Global 'it(...)' not available");
        return _defer ? defer(_describe) : _describe;
      },
      set: function(describe) {
        _describe = describe;
      }
    }
  });

  /* Inject tests and return promise */
  Esquire.tests = function() {
    _defer = false;
    console.log("Esquire: Injecting " + _tests.length + " deferred test modules");
    return esquire(_tests)
      .then(function(success) {
        _defer = true;
        return _tests;
      }, function(failure) {
        _defer = true;
        throw failure;
      });
  }

  /* ======================================================================== */

  /* Extension to mocha: "promises(...)" is like a deferred "it(...)"  */
  function invoke(itfn, title, fn) {
    return itfn.call(this, title, function(done) {
      var failure;
      try {
        var promise = fn.call(this);
        if (promise && (typeof(promise.then) === 'function')) {
          promise.then(function(success) {
            done(failure);
          }, function(failure) {
            console.warn("Rejected: ", failure);
            done(failure);
          })
        } else {
          done(new Error("Test did not return a Promise"));
        }
      } catch (error) {
        console.warn("Failed:", error);
        done(failure = error);
      }
    });
  };

  function promises(title, fn) {
    if (! _it) throw new Error("Global 'it(...)' not available");
    return invoke(it, title, fn);
  }

  promises.skip = function(title, fn) {
    if (! _it) throw new Error("Global 'it(...)' not available");
    if (! _it.skip) throw new Error("Global 'it.skip(...)' not available");
    return invoke(it.skip, title, fn);
  }

  promises.only = function(title, fn) {
    if (! _it) throw new Error("Global 'it(...)' not available");
    if (! _it.only) throw new Error("Global 'it.only(...)' not available");
    return invoke(it.only, title, fn);
  }

  global.promises = promises;

})((function() {
  try {
    return window;
  } catch (e) {
    return global;
  }
})());

