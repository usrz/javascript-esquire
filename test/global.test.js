'use strict';

(function (global) {
  describe("Esquire global dynamic sub-modules", function() {

    /* Tests under node/phantom/m$ie */
    var Promise = Esquire.$$Promise; // global.Promise || Esquire.$$Promise;

    var prefixes = ["$global/", "$global."];
    for (var i in prefixes) {
      var prefix = prefixes[i];

      describe("With '" + prefix + "' prefix", function() {

        promises('should expose "' + prefix + 'console"', function() {

          return new Esquire().require(prefix + 'console')
          .then(function(result) {
            expect(result).to.equal(global.console);
          })

        });

        promises('should not fail for undefined "' + prefix + 'undefinedGlobalSymbol"', function() {

          return new Esquire().require(prefix + 'undefinedGlobalSymbol')
          .then(function(result) {
            expect(result).to.be.an('undefined');
          })

        });

        promises('should expose not cache "' + prefix + 'any"', function() {

          var t0;
          var t1;
          var t2;

          var e = new Esquire();
          delete global.nonCachingTest;

          return e.require(prefix + "nonCachingTest")
          .then(function(t) {
            t0 = t;
            global.nonCachingTest = "one";
            return e.require(prefix + "nonCachingTest");
          }).then(function(t) {
            t1 = t;
            global.nonCachingTest = 2;
            return e.require(prefix + "nonCachingTest");
          }).then(function(t) {
            t2 = t;
            delete global.nonCachingTest;
            return e.require(prefix + "nonCachingTest");
          }).then(function(t3) {
            expect(t0).to.be.a('undefined');
            expect(t1).to.equal("one");
            expect(t2).to.equal(2);
            expect(t3).to.be.a('undefined');
          })

        });
      });
    }

    promises('should correctly resolve prefixed names', function() {

      // This is some of the stuff we found..
      // - window.WebKitBlobBuilder
      // - window.webkitURL
      // - window.msCrypto.subtle
      // - window.crypto.webkitSubtle

      global.prefixedTest = {
        webkitURL: "webkitURL",
        WebKitBlobBuilder: "WebKitBlobBuilder",
        msCrypto1: { subtle: "msCrypto.subtle" },
        crypto2: { webkitSubtle: "crypto.webkitSubtle" }
      };

      var e = new Esquire();
      return Promise.all([
        e.require("$global.prefixedTest.URL"),
        e.require("$global.prefixedTest.BlobBuilder"),
        e.require("$global.prefixedTest.crypto1.subtle"),
        e.require("$global.prefixedTest.crypto2.subtle")
      ]).then(function(result) {
        expect(result[0]).to.equal("webkitURL");
        expect(result[1]).to.equal("WebKitBlobBuilder");
        expect(result[2]).to.equal("msCrypto.subtle");
        expect(result[3]).to.equal("crypto.webkitSubtle");
        delete global.prefixedTest;
      })

    });

    it('should correctly normalize dependency names', function() {

      Esquire.define("$global.forDependency1", ["$global.foo"], function() {});
      Esquire.define("$global/forDependency2", ["$global/bar"], function() {});

      var m1 = Esquire.module("$global/forDependency1");
      var m2 = Esquire.module("$global.forDependency2");

      expect(m1.name).to.equal("$global/forDependency1");
      expect(m2.name).to.equal("$global/forDependency2");

      expect(m1.dependencies).to.deep.equal(["$global/foo"]);
      expect(m2.dependencies).to.deep.equal(["$global/bar"]);

    });

    it('should fail defining same global with different prefix', function() {

      Esquire.define("$global/redefineTest", [], function() {});
      expect(function() {
        Esquire.define("$global.redefineTest", [], function() {});
      }).to.throw("Esquire: Module '$global/redefineTest' already defined");

    });

    it('should override and cache globals with proper definition', function() {

      var count = 0;

      Esquire.define("$global/overrideTest", [], function() {
        return "properly overridden " + (++ count);
      });

      var t0;
      var t1;
      var t2;

      var e = new Esquire();
      delete global.nonCachingTest;

      return e.require("$global/overrideTest")
      .then(function(t) {
        t0 = t;
        return e.require("$global/overrideTest");
      }).then(function(t) {
        t1 = t;
        return e.require("$global.overrideTest");
      }).then(function(t) {
        t2 = t;
        return e.require("$global.overrideTest");
      }).then(function(t3) {
        var expected = "properly overridden " + count;
        expect(t0).to.be.equal(expected);
        expect(t1).to.be.equal(expected);
        expect(t2).to.be.equal(expected);
        expect(t3).to.be.equal(expected);
      })

    });

    promises('should provide a reinjectable global module', function() {

      var script = Esquire.module("$global.console").$$script
                         .replace("$global/console",
                                  "xinject-console");
      eval(script);

      var c0 = new Esquire().require("xinject-console");
      var c1 = esquire("$global.console");

      return Promise.all([c0, c1]).then(function(c) {
        expect(c[0]).to.equal(c[1]);
      })

    });
  });

})((function() {
  try {
    return window;
  } catch (e) {
    return global;
  }
})());
