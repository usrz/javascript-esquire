describe("Esquire global dynamic sub-modules", function() {

  var prefixes = ["$global/", "$global."];
  for (var i in prefixes) {
    var prefix = prefixes[i];

    describe("With '" + prefix + "' prefix", function() {

      it('should expose "' + prefix + 'console"', function() {

        var gconsole = new Esquire().require(prefix + 'console');
        expect(gconsole).to.equal(console);

      });

      it('should expose not cache "' + prefix + 'any"', function() {

        var e = new Esquire();
        var $global = e.require('$global');

        var t0 = e.require(prefix + "fooTest");
        $global.fooTest = "one";
        var t1 = e.require(prefix + "fooTest");
        $global.fooTest = 2;
        var t2 = e.require(prefix + "fooTest");
        delete $global.fooTest;
        var t3 = e.require(prefix + "fooTest");

        expect(t0).to.be.a('undefined');
        expect(t1).to.equal("one");
        expect(t2).to.equal(2);
        expect(t3).to.be.a('undefined');

      });
    });
  }

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

    var e = new Esquire();
    var $global = e.require('$global');
    $global["overrideTest" + i] = "not overridden";

    var t0 = e.require("$global/overrideTest");
    var t1 = e.require("$global/overrideTest");
    var t3 = e.require("$global.overrideTest");
    var t4 = e.require("$global.overrideTest");

    expect(t0).to.be.equal("properly overridden " + count);
    expect(t1).to.be.equal("properly overridden " + count);
    expect(t3).to.be.equal("properly overridden " + count);
    expect(t4).to.be.equal("properly overridden " + count);

  });

  it('should provide a reinjectable global module', function() {

    var script = Esquire.module("$global.console").$$script
                       .replace("$global/console",
                                "xinject-console");
    eval(script);

    var c1 = new Esquire().require("xinject-console");
    var c2 = esquire("$global.console");

    expect(c1).to.equal(c2);

  });
});
