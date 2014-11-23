'use strict';

(function (global) {

  describe("Deferred", function() {

    /* Our Deferred class */
    var Deferred = Esquire.$$Deferred;

    /* Validate our assumption on promises by validating the native */
    if (global.Promise) createTests("with native Promise", global.Promise);

    /* Always test our "emulated" and default Promise implementation */
    createTests("with emulated Promize", Esquire.$$Promise);

    /*
     * Parameters:
     * suite -> Suite name
     * PromiseImpl -> Promise implementation
     */
    function createTests(suite, PromiseImpl) {
      describe(suite, function() {

        it("should resolve a deferred", function(done) {

          var deferred = new Deferred();
          var promise = deferred.promise;
          deferred.resolve("foo");

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should resolve a deferred resolved with a resolved promise", function(done) {

          var deferred = new Deferred();
          var promise = deferred.promise;
          deferred.resolve(PromiseImpl.resolve("foo"));

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should reject a deferred", function(done) {

          var deferred = new Deferred();
          var promise = deferred.promise;
          deferred.reject("foo");

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        /* ==================================================================== */

        it("should reject a deferred resolved with a rejected promise", function(done) {

          var deferred = new Deferred();
          var promise = deferred.promise;
          deferred.resolve(PromiseImpl.reject("foo"));

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        /* ==================================================================== */

        it("should handle deep exceptions", function(done) {

          var deferred = new Deferred();

          setTimeout(function() {
            deferred.resolve("foo");
          }, 50);

          var promise1 = deferred.promise.then(function(result) {
            //throw "Gonzo";
            return result;
          });

          var promise2 = promise1.then(function(result) {
            return result;
          });

          var promise3 = promise2.then(function(result) {
            throw "failure=bar";
          })

          var promise4 = promise3.then(function(result) {
            throw "failure=baz";
          });

          promise4.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("failure=bar");
          }));

        });

        /* ==================================================================== */

        it("should resolve deferred resolved with undefined", function(done) {

          var deferred1 = new Deferred();
          var deferred2 = new Deferred();

          setTimeout(function() {
            deferred1.resolve("foo");
            deferred2.resolve("bar");
          }, 50);

          var promise1 = deferred1.promise.then(function(result) {
            // console.log("OK 1", result);
            return "defined";
          });

          var promise2 = deferred2.promise.then(function(result) {
            // console.log("OK 2", result);
          });

          PromiseImpl.all([promise1, promise2]).then(function(success) {
            expect(success).to.be.instanceof(Array);
            expect(success.length).to.equal(2);
            expect(success[0]).to.equal("defined");
            expect(success[1]).to.equal(undefined);
          })

          .then(function(success) {
            done();
          }, function(failure) {
            done(failure);
          });

        });

      });
    }
  });

  /* ======================================================================== */
  /* WRAP: Wrap a done and a function for easy testing                        */
  /* ======================================================================== */

  function wrap(done, what) {
    return(function() {
      try {
        what.apply(this, arguments);
        done();
      } catch (error) {
        done(error);
      }
    })
  }

})((function() {
  try {
    return window;
  } catch (e) {
    return global;
  }
})());
