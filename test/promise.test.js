'use strict';

(function (global) {

  describe("Promise", function() {

    /* Validate our assumption on promises by validating the native */
    if (global.Promise) createTests("native implementation", global.Promise);

    /* Always test our "emulated" Promise implementation */
    createTests("emulated implementation", Esquire.$$Promise);

    /*
     * Parameters:
     * suite -> Suite name
     * PromiseImpl -> Promise implementation
     */
    function createTests(suite, PromiseImpl) {

      describe(suite, function() {

        /* ==================================================================== */
        /* BASICS                                                               */
        /* ==================================================================== */

        it("should exist", function() {
          expect(PromiseImpl).to.exist;
          expect(PromiseImpl).to.be.a('function');
        });

        it("should construct a then-able", function() {
          var p = new PromiseImpl(function() {});
          expect(p).to.exist;
          expect(p.then).to.be.a('function');
          expect(p.catch).to.be.a('function');
        });

        /* ==================================================================== */
        /* RESOLUTION                                                           */
        /* ==================================================================== */

        it("should resolve 1", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            resolve("foo");
          });

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should resolve 2", function(done) {

          var promise = PromiseImpl.resolve("foo");

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal('foo');
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should resolve a resolved promise", function(done) {

          var resolved = PromiseImpl.resolve("foo");
          var promise = PromiseImpl.resolve(resolved);

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal('foo');
          }), function(result) {
            done(result || new Error("Failed"));
          });


        });

        /* ==================================================================== */
        /* REJECTION                                                            */
        /* ==================================================================== */

        it("should reject 1", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            reject("foo");
          });

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        /* ==================================================================== */

        it("should reject 2", function(done) {

          var promise = PromiseImpl.reject("foo");

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        /* ==================================================================== */

        it("should reject a rejected promise", function(done) {

          var rejected = PromiseImpl.reject("foo");
          var promise = PromiseImpl.resolve(rejected);

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        /* ==================================================================== */
        /* CHAINING TESTS                                                       */
        /* ==================================================================== */

        it("should handle chaining on resolve", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            resolve("foo");
          }).then(function(result) {
            return result + "bar";
          }, function(result) {
            done(result || new Error("Failed"));
          });

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal('foobar');
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should handle chaining on reject", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            reject("foo");
          }).then(function(result) {
            done(result || new Error("Failed"));
          }, function(result) {
            return result + "bar";
          });

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal('foobar');
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        /* ==================================================================== */

        it("should handle exceptions chaining on resolve", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            resolve("foo");
          }).then(function(result) {
            throw "success=" + result;
          }, function(result) {
            done(result || new Error("Failed"));
          });

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("success=foo");
          }));

        });

        /* ==================================================================== */

        it("should handle exceptions chaining on reject", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            reject("foo");
          }).then(function(result) {
            done(result || new Error("Failed"));
          }, function(result) {
            throw "failure=" + result;
          });

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("failure=foo");
          }));

        });

        /* ==================================================================== */

        it("should handle deep exceptions", function(done) {

          var first = new PromiseImpl(function(resolve, reject) {
            setTimeout(function() {
              resolve("foo");
            }, 20);
          });

          var promise1 = first.then(function(result) {
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
        /* OTHER TESTS                                                          */
        /* ==================================================================== */

        it("should resolve all promises with undefined results", function(done) {
          var p1 = new PromiseImpl(function (resolve, reject) { resolve("defined") });
          var p2 = new PromiseImpl(function (resolve, reject) { resolve() });

          PromiseImpl.all([p1, p2]).then(function(success) {
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

        it("should not throw exceptions", function(done) {

          var promise = new PromiseImpl(function(resolve, reject) {
            throw "foo";
          })

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal("foo");
          }));

        });

        it("should resolve an empty array of promises", function(done) {
          var promise = PromiseImpl.all([]);

          promise.then(wrap(done, function(result) {
            expect(result).to.be.eql([]);
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        it("should combine multiple resolved promises", function(done) {
          var promise = PromiseImpl.all(["foo", PromiseImpl.resolve("bar"), PromiseImpl.resolve("baz")]);

          promise.then(wrap(done, function(result) {
            expect(result).to.be.eql(['foo', 'bar', 'baz']);
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        it("should combine multiple rejected promises", function(done) {
          var promise = PromiseImpl.all(["foo", PromiseImpl.resolve("bar"), PromiseImpl.reject("baz")]);

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal('baz');
          }));

        });

        it("should fail when all is called with undefined", function(done) {

          PromiseImpl.all().then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.instanceof(TypeError);
          }));

        });

        it("should fail when all is called with something other than an array", function(done) {
          var promise = PromiseImpl.all("hello");

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.instanceof(TypeError);
          }));

        });

        it("should race multiple promises with a winning resolution", function(done) {

          var resolvedPromiseImpl = new PromiseImpl(function(resolve, reject) {
            setTimeout(function() {
              resolve("foo");
            }, 20);
          });

          var rejectedPromiseImpl = new PromiseImpl(function(resolve, reject) {
            setTimeout(function() {
              reject("bar");
            }, 200);
          });

          var promise = PromiseImpl.race([resolvedPromiseImpl, rejectedPromiseImpl])

          promise.then(wrap(done, function(result) {
            expect(result).to.be.equal('foo');
          }), function(result) {
            done(result || new Error("Failed"));
          });

        });

        it("should race multiple promises with a winning rejection", function(done) {

          var resolvedPromiseImpl = new PromiseImpl(function(resolve, reject) {
            setTimeout(function() {
              resolve("foo");
            }, 200);
          });

          var rejectedPromiseImpl = new PromiseImpl(function(resolve, reject) {
            setTimeout(function() {
              reject("bar");
            }, 20);
          });

          var promise = PromiseImpl.race([resolvedPromiseImpl, rejectedPromiseImpl])

          promise.then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.equal('bar');
          }));

        });

        it("should not race an undefined array", function(done) {

          PromiseImpl.race().then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.instanceof(TypeError);
          }));

        });

        it("should not race an something other than array", function(done) {

          PromiseImpl.race('foo').then(function(result) {
            done(result || new Error("Failed"));
          }, wrap(done, function(result) {
            expect(result).to.be.instanceof(TypeError);
          }));

        });

        it("should not resolve an empty array of promises", function(done) {

          new PromiseImpl(function(resolve, reject) {

            /* Race the empty array */
            PromiseImpl.race([]).then(function(result) {
              done(result || new Error("Failed"));
            }, wrap(done, function(result) {
              expect(result).to.be.instanceof(TypeError);
              done();
            }));

            /* Confirm after a bit... */
            setTimeout(function() { done() }, 100);
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
