'use strict';

(function (global) {

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
    if (! global.it) throw new Error("Global 'it(...)' not available");
    return invoke(it, title, fn);
  }

  promises.skip = function(title, fn) {
    if (! global.it) throw new Error("Global 'it(...)' not available");
    if (! global.it.skip) throw new Error("Global 'it.skip(...)' not available");
    return invoke(it.skip, title, fn);
  }

  promises.only = function(title, fn) {
    if (! global.it) throw new Error("Global 'it(...)' not available");
    if (! global.it.only) throw new Error("Global 'it.only(...)' not available");
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

