/* Disable Karma's error interception */
window.onerror = null;

describe('Esquire loader', function() {

  function file(name) {
    return '/base/test/load/' + name + "?" + Math.floor(Math.random() * 1000000000000);
  }

  it('should have static members', function() {
    expect(Esquire.load).to.be.a('function');
  });

  it('should resolve with no scripts', function(done) {

    Esquire.load()
      .then(function(success) {
        done();
      }, function(failure) {
        done(failure);
      });
  })

  it('should resolve with an empty script', function(done) {

    Esquire.load(file("empty-script.js"))
      .then(function(success) {
        done();
      }, function(failure) {
        done(failure);
      });
  })

  it('should resolve with a normal script', function(done) {

    Esquire.load(file("normal-script.js"))
      .then(function(success) {
        done();
      }, function(failure) {
        done(failure);
      });
  })

  it('should reject on a non existant script', function(done) {

    Esquire.load(file("non-existant.js"))
      .then(function(success) {
        done(new Error("Should fail"));
      }, function(failure) {
        done();
      });
  })

  it('should reject on parse exception', function(done) {

    Esquire.load(file("parse-exception.js"))
      .then(function(success) {
        done(new Error("Should fail"));
      }, function(failure) {
        done();
      });
  })

  it('should reject on undefined variable', function(done) {

    Esquire.load(file("undefined-variable.js"))
      .then(function(success) {
        done(new Error("Should fail"));
      }, function(failure) {
        done();
      });
  })

  it('should reject on exception thrown', function(done) {

    Esquire.load(file("throws-error.js"))
      .then(function(success) {
        done(new Error("Should fail"));
      }, function(failure) {
        done();
      });
  })

  it('should reject on multiple files', function(done) {

    Esquire.load(file("empty-script.js"), file("throws-error.js"))
      .then(function(success) {
        done(new Error("Should fail"));
      }, function(failure) {
        done();
      });
  })

  it('should resolve on multiple files', function(done) {

    Esquire.load(file("empty-script.js"), file("normal-script.js"))
      .then(function(success) {
        done();
      }, function(failure) {
        done(failure);
      });
  })

  it('should load a module from an external script', function(done) {

    Esquire.load(file("module-script.js"))
      .then(function(success) {
        expect(success['loaded-module']).to.exist();
        return new Esquire().require('loaded-module');
      }, function(failure) {
        console.warn("Exception loading script 'module-script.js");
        done(failure);
      })

      .then(function(module) {
        expect(module).to.be.equal('This was loaded from an external module');
        done();

      }, function(failure) {
        console.warn("Exception resolving module from 'module-script.js");
        done(failure);
      })

      .then(function(success) {
        done();
      }, function(failure) {
        done(failure);
      });
  })

})
