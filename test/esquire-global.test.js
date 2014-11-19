describe("Esquire $global/any", function() {

  /* ======================================================================== */

  describe.only("basics", function() {

    it('should expose $global/console', function() {

      var gconsole = new Esquire().require('$global/console');
      expect(gconsole).to.equal(console);

    });

    it('should expose not cache $global/any', function() {

      var e = new Esquire();
      var $global = e.require('$global');

      var t0 = e.require("$global/fooTest");
      $global.fooTest = "one";
      var t1 = e.require("$global/fooTest");
      $global.fooTest = 2;
      var t2 = e.require("$global/fooTest");
      delete $global.fooTest;
      var t3 = e.require("$global/fooTest");

      expect(t0).to.be.a('undefined');
      expect(t1).to.equal("one");
      expect(t2).to.equal(2);
      expect(t3).to.be.a('undefined');

    });

    it('should override and cache $global/any with proper definition', function() {

      var count = 0;
      Esquire.define("$global/overrideTest", [], function() {
        return "properly overridden " + (++ count);
      });

      var e = new Esquire();
      var $global = e.require('$global');
      $global.overrideTest = "not overridden";

      var t0 = e.require("$global/overrideTest");
      var t1 = e.require("$global/overrideTest");

      expect(t0).to.be.equal("properly overridden " + count);
      expect(t1).to.be.equal("properly overridden " + count);
      expect(t1).to.be.equal(t0);

    });

    it('should provide a reinjectable $global/any module', function() {

      var script = Esquire.module("$global/console").$$script
                          .replace("$global/console", "rinject-console");
      eval(script);

      var c1 = new Esquire().require("rinject-console");
      var c2 = esquire("$global/console");

      expect(c1).to.equal(c2);

    });


  });
});
