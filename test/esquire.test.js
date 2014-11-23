'use strict';

(function (global) {
  describe("Esquire inject", function() {

    /* Tests under node/phantom/m$ie */
    var Promise = Esquire.$$Promise; // global.Promise || Esquire.$$Promise;

    /* ======================================================================== */

    describe("basics", function() {

      it('should exist', function() {
        expect(Esquire).to.be.a('function');
      });

      it('should have static members', function() {
        expect(Esquire.define).to.be.a('function');
        expect(Esquire.modules).to.exist;
      });

      it('should have instance members', function() {
        var e = new Esquire();
        expect(e.require).to.be.a('function');
        expect(e.inject).to.be.a('function');
      });

    });

    /* ======================================================================== */

    describe("normal injection", function() {

      promises('should execute without injection', function(done) {

        var a;

        return new Esquire().inject(function() {
          a = "executed";
          return "returned";
        })

        .then(function(b) {
          expect(a).to.be.equal('executed');
          expect(b).to.be.equal('returned');
        })

      });

      /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

      promises('should inject a single module', function() {

        var a;
        return new Esquire().inject(["module-a"], function(injected) {
          a = injected;
          return "returned";
        })

        .then(function(b) {
          expect(a).to.be.equal('valueForModuleA');
          expect(b).to.be.equal('returned');
        })

      });

      promises('should inject a single module twice', function() {

        var a1;
        var a2;
        return new Esquire().inject(["module-a", "module-a"], function(injected1, injected2) {
          a1 = injected1;
          a2 = injected2;
          return 'returned';
        })

        .then(function(b) {
          expect(a1).to.be.equal('valueForModuleA');
          expect(a2).to.be.equal('valueForModuleA');
          expect(b).to.be.equal('returned');
        })

      });

      promises('should inject two modules', function() {

        var a;
        var b;
        return new Esquire().inject(["module-a", "module-b"], function(injected1, injected2) {
          a = injected1;
          b = injected2;
          return 'returned';
        })

        .then(function(c) {
          expect(a).to.be.equal('valueForModuleA');
          expect(b).to.be.match(/^valueForModuleB => /);
          expect(c).to.be.equal('returned');
        })

      });

      promises('should inject with arguments', function() {

        var a;
        var b;
        return new Esquire().inject("module-a", "module-b", function(injected1, injected2) {
          a = injected1;
          b = injected2;
          return 'returned';
        })

        .then(function(c) {
          expect(a).to.be.equal('valueForModuleA');
          expect(b).to.be.match(/^valueForModuleB => /);
          expect(c).to.be.equal('returned');
        })

      })

      promises('should inject with AngularJS array', function() {

        var a;
        var b;
        return new Esquire().inject(["module-a", "module-b", function(injected1, injected2) {
          a = injected1;
          b = injected2;
          return 'returned';
        }])

        .then(function(c) {
          expect(a).to.be.equal('valueForModuleA');
          expect(b).to.be.match(/^valueForModuleB => /);
          expect(c).to.be.equal('returned');
        })

      })

      /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

      promises('should require a single module', function() {

        return new Esquire().require("module-a")
        .then(function(a) {
          expect(a).to.be.equal('valueForModuleA');
        })

      });

      promises('should require a single module twice (arguments)', function() {

        return new Esquire().require("module-a", "module-a")
        .then(function(a) {
          expect(a).to.be.an.instanceof(Array);
          expect(a[0]).to.be.equal('valueForModuleA');
          expect(a[1]).to.be.equal('valueForModuleA');
        })

      });

      promises('should require a single module twice (array)', function() {

        return new Esquire().require(["module-a", "module-a"])
        .then(function(a) {
          expect(a).to.be.an.instanceof(Array);
          expect(a[0]).to.be.equal('valueForModuleA');
          expect(a[1]).to.be.equal('valueForModuleA');
        })

      });

      promises('should require two modules (arguments)', function() {

        return new Esquire().require("module-a", "module-b")
        .then(function(a) {
          expect(a[0]).to.be.equal('valueForModuleA');
          expect(a[1]).to.be.match(/^valueForModuleB => /);
        })

      });

      promises('should require two modules (array)', function() {

        return new Esquire().require(["module-a", "module-b"])
        .then(function(a) {
          expect(a[0]).to.be.equal('valueForModuleA');
          expect(a[1]).to.be.match(/^valueForModuleB => /);
        })

      });

      promises('should fail on construction error', function() {

        return new Esquire().require("module-e")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function(error) {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.be.equal('Esquire: Module \'module-e\' failed to initialize [Cause: This module always fails]');
        })

      });

      promises('should fail on depending on failing module', function() {

        return new Esquire().require("module-f")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function(error) {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.be.equal('Esquire: Module \'module-e\' failed to initialize resolving -> module-f [Cause: This module always fails]');
        })

      });

      promises('should eventually inject a module returning a promise', function() {

        return new Esquire().require("module-g")
        .then(function(success) {
          expect(success).to.equal("value-g");
        })

      });

      promises('should not inject a module returning a rejected promise', function() {

        return new Esquire().require("module-h")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function(error) {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.be.equal('Esquire: Module \'module-h\' failed to initialize [Cause: value-h]');
          expect(error.cause).to.be.instanceof(Error);
          expect(error.cause.message).to.be.equal('value-h');
        })

      });

      promises('should expose a $global module', function() {

        return new Esquire().require("$global")
        .then(function(w) {
          expect(w).to.be.equal(global);
        })

      });

      promises('should expose a $esquire module', function() {

        var e1 = new Esquire();
        return e1.require("$esquire")
        .then(function(e2) {
          expect(e1).to.be.equal(e2);
          expect(e1 === e2).to.be.true;
        })

      });

      promises('should time out waiting injection', function() {

        return new Esquire(100).require("module-i")
        .then(function(success) {
          throw new Error("Should not succeed");
        }, function(error) {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.be.equal('Esquire: Timeout reached waiting for module \'module-i\'');
        })

      });

    });

    /* ======================================================================== */

    describe("per-instance injection", function() {

      promises('should inject once per instance', function() {

        var b0 = new Esquire().require("module-b");
        var b1 = new Esquire().require("module-b");

        return Promise.all([b0, b1]).then(function(b) {
          expect(b[0]).to.match(/^valueForModuleB => /);
          expect(b[1]).to.match(/^valueForModuleB => /);
          expect(b[0]).not.to.equal(b[1]);
        })

      });

      promises('should share injecteded modules per instance', function() {

        var e = new Esquire();
        var b0 = e.require("module-b");
        var b1 = e.require("module-b");

        return Promise.all([b0, b1]).then(function(b) {
          expect(b[0]).to.match(/^valueForModuleB => /);
          expect(b[1]).to.match(/^valueForModuleB => /);
          expect(b[0]).to.equal(b[1]);
        })

      });

      promises('should share injecteded modules per instance on a single call', function() {

        return new Esquire().require("module-b", "module-b")
        .then(function(a) {
          expect(a[0]).to.match(/^valueForModuleB => /);
          expect(a[1]).to.match(/^valueForModuleB => /);
          expect(a[0]).to.equal(a[1]);
        })

      });

      promises('should share the same $global instance', function() {

        var g0 = new Esquire().require("$global");
        var g1 = new Esquire().require("$global");

        return Promise.all([g0, g1]).then(function(g) {
          expect(g[0]).to.be.equal(global);
          expect(g[1]).to.be.equal(global);
          expect(g[0] === g[1]).to.be.true;
        })

      });

      promises('should expose two separate $esquire instances', function() {

        var e0 = new Esquire();
        var e0p = e0.require("$esquire");

        var e1 = new Esquire();
        var e1p = e1.require("$esquire");

        return Promise.all([e0p, e1p]).then(function(e) {
          expect(e0).to.be.equal(e[0]);
          expect(e1).to.be.equal(e[1]);
          expect(e0 === e[0]).to.be.true;
          expect(e1 === e[1]).to.be.true;
          expect(e0).not.to.be.equal(e1);
        });

      });


    });

    /* ======================================================================== */

    describe("dependencies injection", function() {

      promises('should inject a module with dependencies', function() {

        return new Esquire().require("module-c")
        .then(function(c) {
          expect(c['a']).to.equal('valueForModuleA');
          expect(c['b']).to.match(/^valueForModuleB => /);
        })

      });

      promises('should share instances with module with dependencies', function() {

        var e = new Esquire();

        var a = e.require("module-a");
        var b = e.require("module-b");
        var c = e.require("module-c");

        return Promise.all([a, b, c])
        .then(function(x) {
          expect(x[2]['a']).to.equal('valueForModuleA');
          expect(x[2]['b']).to.match(/^valueForModuleB => /);
          expect(x[2]['a']).to.equal(x[0]);
          expect(x[2]['b']).to.equal(x[1]);
        })


      });

      promises('should share instances with module with transitive dependencies', function() {

        var e = new Esquire();

        var a = e.require("module-a");
        var b = e.require("module-b");
        var c = e.require("module-c");
        var d = e.require("module-d");

        return Promise.all([a, b, c, d])
        .then(function(x) {
          expect(x[2]['a']).to.equal('valueForModuleA');
          expect(x[2]['b']).to.match(/^valueForModuleB => /);
          expect(x[2]['a']).to.equal(x[0]);
          expect(x[2]['b']).to.equal(x[1]);
          expect(x[3].transitive).to.equal(x[2]);
        })

      });

    });

    /* ======================================================================== */

    describe("module definition", function() {

      function moduleName() {
        return "random_" + Math.floor(Math.random() * 999999999);
      }

      promises('should define with only name and function', function() {
        var name = moduleName();

        Esquire.define(name, function() {
          expect(arguments.length).to.be.equal(0);
          return "module " + name;
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.equal("return module " + name);
        })

      });

      promises('should define with name, string dependency and function', function() {
        var name = moduleName();

        Esquire.define(name, "module-a", function(a) {
          return "module " + name + ":" + a;
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.equal("return module " + name + ":valueForModuleA");
        })

      });

      promises('should define with name, dependencies array and function', function() {
        var name = moduleName();

        Esquire.define(name, ["module-a", "module-b"], function(a, b) {
          return "module " + name + ":" + a + "/" + b;
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));
        })

      });

      promises('should define with AngularJS arguments', function() {
        var name = moduleName();

        Esquire.define(name, ["module-a", "module-b", function(a, b) {
          return "module " + name + ":" + a + "/" + b;
        }]);

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));
        })

      });

      /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

      promises('should define with an object and undefined dependencies', function() {
        var name = moduleName();

        Esquire.define({
          name: name,
          constructor: function() {
            expect(arguments.length).to.be.equal(0);
            return "module " + name;
          }
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.equal("return module " + name);
        })

      });

      promises('should define with an object and empty dependencies', function() {
        var name = moduleName();

        Esquire.define({
          name: name,
          dependencies: [],
          constructor: function() {
            expect(arguments.length).to.be.equal(0);
            return "module " + name;
          }
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.equal("return module " + name);
        })

      });

      promises('should define with an object and single string dependency', function() {
        var name = moduleName();

        Esquire.define({
          name: name,
          dependencies: 'module-a',
          constructor: function(a) {
            expect(arguments.length).to.be.equal(1);
            return "module " + name + ":" + a;
          }
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.equal("return module " + name + ":valueForModuleA");
        })

      });

      promises('should define with an object and a dependencies array', function() {
        var name = moduleName();

        Esquire.define({
          name: name,
          dependencies: ['module-a', 'module-b'],
          constructor: function(a, b) {
            expect(arguments.length).to.be.equal(2);
            return "module " + name + ":" + a + "/" + b;
          }
        });

        return esquire(name, function(dependency) {
          return "return " + dependency;
        }).then(function(result) {
          expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));
        })

      });

    });

    /* ======================================================================== */

    describe("static module resolution methods", function() {

      it('should return a dictonary of modules', function() {
        var modules = Esquire.modules;
        expect(modules['circular-a'].name   ).to.equal('circular-a');
        expect(modules['circular-b'].name   ).to.equal('circular-b');
        expect(modules['circular-c'].name   ).to.equal('circular-c');
        expect(modules['circular-d'].name   ).to.equal('circular-d');
        expect(modules['circular-e'].name   ).to.equal('circular-e');
        expect(modules['circular-f'].name   ).to.equal('circular-f');
        expect(modules['circular-g'].name   ).to.equal('circular-g');
        expect(modules['circular-self'].name).to.equal('circular-self');
        expect(modules['module-a'].name     ).to.equal('module-a');
        expect(modules['module-b'].name     ).to.equal('module-b');
      });

      it('should return the same module', function() {
        var modules = Esquire.modules;
        expect(modules['circular-a']   ).to.equal(Esquire.module('circular-a'));
        expect(modules['circular-b']   ).to.equal(Esquire.module('circular-b'));
        expect(modules['circular-c']   ).to.equal(Esquire.module('circular-c'));
        expect(modules['circular-d']   ).to.equal(Esquire.module('circular-d'));
        expect(modules['circular-e']   ).to.equal(Esquire.module('circular-e'));
        expect(modules['circular-f']   ).to.equal(Esquire.module('circular-f'));
        expect(modules['circular-g']   ).to.equal(Esquire.module('circular-g'));
        expect(modules['circular-self']).to.equal(Esquire.module('circular-self'));
        expect(modules['module-a']     ).to.equal(Esquire.module('module-a'));
        expect(modules['module-b']     ).to.equal(Esquire.module('module-b'));
      });

      it('should resolve empty dependencies', function() {
        var dependencies = Esquire.resolve('module-a');
        expect(dependencies).to.be.empty;
      });

      it('should resolve valid dependencies', function() {
        var dependencies = Esquire.resolve('module-c');
        expect(dependencies.length).to.equal(2);
        expect(dependencies[0]).to.equal(Esquire.module('module-a'));
        expect(dependencies[1]).to.equal(Esquire.module('module-b'));
      });

      it('should resolve direct dependencies', function() {
        var dependencies = Esquire.resolve('module-d');
        expect(dependencies.length).to.equal(1);
        expect(dependencies[0]).to.equal(Esquire.module('module-c'));
      });

      it('should resolve transitive dependencies', function() {
        var dependencies = Esquire.resolve('module-d', true);
        expect(dependencies.length).to.equal(3);
        expect(dependencies[0]).to.equal(Esquire.module('module-c'));
        expect(dependencies[1]).to.equal(Esquire.module('module-a'));
        expect(dependencies[2]).to.equal(Esquire.module('module-b'));
      });

    });

    /* ======================================================================== */

    describe("failures", function() {

      promises('should fail injecting an unknown module', function() {

        var invoked = false;

        return new Esquire().inject(["not-known"], function() {
          invoked = true;
        }).then(function(success) {
          throw new Error("Should not succeed")
        }, function (failure) {
          expect(failure).to.be.instanceof(Error);
          expect(failure.message).to.match(/module 'not-known' not found/i);
          expect(invoked).to.be.false;
        })

      });

      promises('should fail requiring an unknown module', function() {

        return new Esquire().require("not-known")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function (failure) {
          expect(failure).to.be.instanceof(Error);
          expect(failure.message).to.match(/module 'not-known' not found/i);
        })

      });

      promises('should fail on circular dependencies', function() {

        return new Esquire().require("circular-a")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function (failure) {
          expect(failure).to.be.instanceof(Error);
          expect(failure.message).to.match(/module 'circular-a' has circular dependencies/i);
        })

      });

      promises('should fail on self dependencies', function() {

        return new Esquire().require("circular-self")
        .then(function(success) {
          throw new Error("Should not succeed")
        }, function (failure) {
          expect(failure).to.be.instanceof(Error);
          expect(failure.message).to.match(/module 'circular-self' has circular dependencies/i);
        })

      });

    });

  });

})((function() {
  try {
    return window;
  } catch (e) {
    return global;
  }
})());
