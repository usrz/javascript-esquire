describe("Esquire inject", function() {

  /* Tests under node */
  try {
    window;
  } catch (error) {
    global.window = global;
  }

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

    it('should execute without injection', function() {

      var a;
      var b = new Esquire().inject(function() {
        a = "executed";
        return "returned";
      });

      expect(a).to.be.equal('executed');
      expect(b).to.be.equal('returned');

    });

    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

    it('should inject a single module', function() {

      var a;
      var b = new Esquire().inject(["module-a"], function(injected) {
        a = injected;
        return "returned";
      });

      expect(a).to.be.equal('valueForModuleA');
      expect(b).to.be.equal('returned');

    });

    it('should inject a single module twice', function() {

      var a1;
      var a2;
      var b = new Esquire().inject(["module-a", "module-a"], function(injected1, injected2) {
        a1 = injected1;
        a2 = injected2;
        return 'returned';
      });

      expect(a1).to.be.equal('valueForModuleA');
      expect(a2).to.be.equal('valueForModuleA');
      expect(b).to.be.equal('returned');

    });

    it('should inject two modules', function() {

      var a;
      var b;
      var c = new Esquire().inject(["module-a", "module-b"], function(injected1, injected2) {
        a = injected1;
        b = injected2;
        return 'returned';
      });

      expect(a).to.be.equal('valueForModuleA');
      expect(b).to.be.match(/^valueForModuleB => /);
      expect(c).to.be.equal('returned');

    });

    it('should inject with arguments', function() {

      var a;
      var b;
      var c = new Esquire().inject("module-a", "module-b", function(injected1, injected2) {
        a = injected1;
        b = injected2;
        return 'returned';
      });

      expect(a).to.be.equal('valueForModuleA');
      expect(b).to.be.match(/^valueForModuleB => /);
      expect(c).to.be.equal('returned');

    })

    it('should inject with AngularJS array', function() {

      var a;
      var b;
      var c = new Esquire().inject(["module-a", "module-b", function(injected1, injected2) {
        a = injected1;
        b = injected2;
        return 'returned';
      }]);

      expect(a).to.be.equal('valueForModuleA');
      expect(b).to.be.match(/^valueForModuleB => /);
      expect(c).to.be.equal('returned');

    })

    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

    it('should require a single module', function() {

      var a = new Esquire().require("module-a");
      expect(a).to.be.equal('valueForModuleA');

    });

    it('should require a single module twice (arguments)', function() {

      var a = new Esquire().require("module-a", "module-a");
      expect(a).to.be.an.instanceof(Array);
      expect(a[0]).to.be.equal('valueForModuleA');
      expect(a[1]).to.be.equal('valueForModuleA');

    });

    it('should require a single module twice (array)', function() {

      var a = new Esquire().require(["module-a", "module-a"]);
      expect(a).to.be.an.instanceof(Array);
      expect(a[0]).to.be.equal('valueForModuleA');
      expect(a[1]).to.be.equal('valueForModuleA');

    });

    it('should require two modules (arguments)', function() {

      var a = new Esquire().require("module-a", "module-b");
      expect(a[0]).to.be.equal('valueForModuleA');
      expect(a[1]).to.be.match(/^valueForModuleB => /);

    });

    it('should require two modules (array)', function() {

      var a = new Esquire().require(["module-a", "module-b"]);
      expect(a[0]).to.be.equal('valueForModuleA');
      expect(a[1]).to.be.match(/^valueForModuleB => /);

    });

    it('should expose a $window module', function() {

      var w = new Esquire().require("$window");
      expect(w).to.be.equal(window);

    });

    it('should expose a $esquire module', function() {

      var e1 = new Esquire();
      var e2 = e1.require("$esquire");
      expect(e1).to.be.equal(e2);
      expect(e1 === e2).to.be.true;

    });

  });

  /* ======================================================================== */

  describe("per-instance injection", function() {

    it('should inject once per instance', function() {

      var b1 = new Esquire().require("module-b");
      var b2 = new Esquire().require("module-b");

      expect(b1).to.match(/^valueForModuleB => /);
      expect(b2).to.match(/^valueForModuleB => /);
      expect(b1).not.to.equal(b2);

    });

    it('should share injecteded modules per instance', function() {

      var e = new Esquire();
      var b1 = e.require("module-b");
      var b2 = e.require("module-b");

      expect(b1).to.match(/^valueForModuleB => /);
      expect(b2).to.match(/^valueForModuleB => /);
      expect(b1).to.equal(b2);

    });

    it('should share injecteded modules per instance on a single call', function() {

      var a = new Esquire().require("module-b", "module-b");

      expect(a[0]).to.match(/^valueForModuleB => /);
      expect(a[1]).to.match(/^valueForModuleB => /);
      expect(a[0]).to.equal(a[1]);

    });

    it('should share the same $window instance', function() {

      var w1 = new Esquire().require("$window");
      var w2 = new Esquire().require("$window");
      expect(w1).to.be.equal(window);
      expect(w2).to.be.equal(window);
      expect(w1 === w2).to.be.true;

    });

    it('should expose two separate $esquire instances', function() {

      var e1 = new Esquire();
      var e1e = e1.require("$esquire");

      var e2 = new Esquire();
      var e2e = e2.require("$esquire");

      expect(e1).to.be.equal(e1e);
      expect(e2).to.be.equal(e2e);
      expect(e1 === e1e).to.be.true;
      expect(e2 === e2e).to.be.true;
      expect(e1).not.to.be.equal(e2);

    });


  });

  /* ======================================================================== */

  describe("dependencies injection", function() {

    it('should inject a module with dependencies', function() {

      var c = new Esquire().require("module-c");

      expect(c['a']).to.equal('valueForModuleA');
      expect(c['b']).to.match(/^valueForModuleB => /);

    });

    it('should share instances with module with dependencies', function() {

      var e = new Esquire();

      var a = e.require("module-a");
      var b = e.require("module-b");
      var c = e.require("module-c");

      expect(c['a']).to.equal('valueForModuleA');
      expect(c['b']).to.match(/^valueForModuleB => /);

      expect(c['a']).to.equal(a);
      expect(c['b']).to.equal(b);

    });

    it('should share instances with module with transitive dependencies', function() {

      var e = new Esquire();

      var a = e.require("module-a");
      var b = e.require("module-b");
      var c = e.require("module-c");
      var d = e.require("module-d");

      expect(c['a']).to.equal('valueForModuleA');
      expect(c['b']).to.match(/^valueForModuleB => /);

      expect(c['a']).to.equal(a);
      expect(c['b']).to.equal(b);

      expect(d.transitive).to.equal(c);

    });

  });

  /* ======================================================================== */

  describe("module definition", function() {

    function moduleName() {
      return "random_" + Math.floor(Math.random() * 999999999);
    }

    it('should define with only name and function', function() {
      var name = moduleName();

      Esquire.define(name, function() {
        expect(arguments.length).to.be.equal(0);
        return "module " + name;
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.equal("return module " + name);

    });

    it('should define with name, string dependency and function', function() {
      var name = moduleName();

      Esquire.define(name, "module-a", function(a) {
        return "module " + name + ":" + a;
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.equal("return module " + name + ":valueForModuleA");

    });

    it('should define with name, dependencies array and function', function() {
      var name = moduleName();

      Esquire.define(name, ["module-a", "module-b"], function(a, b) {
        return "module " + name + ":" + a + "/" + b;
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));

    });

    it('should define with AngularJS arguments', function() {
      var name = moduleName();

      Esquire.define(name, ["module-a", "module-b", function(a, b) {
        return "module " + name + ":" + a + "/" + b;
      }]);

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));

    });

    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */

    it('should define with an object and undefined dependencies', function() {
      var name = moduleName();

      Esquire.define({
        name: name,
        constructor: function() {
          expect(arguments.length).to.be.equal(0);
          return "module " + name;
        }
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.equal("return module " + name);

    });

    it('should define with an object and empty dependencies', function() {
      var name = moduleName();

      Esquire.define({
        name: name,
        dependencies: [],
        constructor: function() {
          expect(arguments.length).to.be.equal(0);
          return "module " + name;
        }
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.equal("return module " + name);

    });

    it('should define with an object and single string dependency', function() {
      var name = moduleName();

      Esquire.define({
        name: name,
        dependencies: 'module-a',
        constructor: function(a) {
          expect(arguments.length).to.be.equal(1);
          return "module " + name + ":" + a;
        }
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.equal("return module " + name + ":valueForModuleA");

    });

    it('should define with an object and a dependencies array', function() {
      var name = moduleName();

      Esquire.define({
        name: name,
        dependencies: ['module-a', 'module-b'],
        constructor: function(a, b) {
          expect(arguments.length).to.be.equal(2);
          return "module " + name + ":" + a + "/" + b;
        }
      });

      var result = esquire(name, function(dependency) {
        return "return " + dependency;
      })

      expect(result).to.match(new RegExp('^return module ' + name + ':valueForModuleA/valueForModuleB => '));

    });

  });

  /* ======================================================================== */

  describe("static methods", function() {

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

    it('should fail injecting an unknown module', function() {

      var invoked = false;
      expect(function() {
        new Esquire().inject(["not-known"], function() {
          invoked = true;
        });
      }).to.throw(/module 'not-known' not found/i);
      expect(invoked).to.be.false;

    });

    it('should fail requiring an unknown module', function() {

      expect(function() {
        new Esquire().require("not-known");
      }).to.throw(/module 'not-known' not found/i);

    });

    it('should fail on circular dependencies', function() {

      expect(function() {
        new Esquire().require("circular-a");
      }).to.throw(/module 'circular-a' has circular dependencies/i);

    });

    it('should fail on self dependencies', function() {

      expect(function() {
        new Esquire().require("circular-self");
      }).to.throw(/module 'circular-self' has circular dependencies/i);

    });

  });

});
