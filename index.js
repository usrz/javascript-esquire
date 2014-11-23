'use strict';

var path = require('path');
var fs = require('fs');

/* Just load if we never were initialized */
if (!('Esquire' in global)) {
  require("./src/esquire-inject.js");
}

/* We are sure we have Esquire in globals */
function EsquireAdapter() {
  if (this instanceof EsquireAdapter) {
    global.Esquire.apply(this, arguments);
  } else {
    return global.esquire.apply(this, arguments);
  }
};

/* Prototype and static members */
EsquireAdapter.prototype = Esquire.prototype;

Object.defineProperty(EsquireAdapter, 'modules', {
  enumerable: true, configurable: false, get: function() { return global.Esquire.modules }
});

EsquireAdapter.define  = function() { return global.Esquire.define .call(global.Esquire, arguments) };
EsquireAdapter.resolve = function() { return global.Esquire.resolve.call(global.Esquire, arguments) };
EsquireAdapter.module  = function() { return global.Esquire.module .call(global.Esquire, arguments) };

EsquireAdapter.foo = function(re, mo) {
  return re(mo);
}
EsquireAdapter.loadAll = Esquire.loadAll = function (require, what) {
  ///var what = path.join.apply(path, arguments);
  console.log("WHAT IS ", what);
  if (fs.lstatSync(what).isDirectory()) {
    fs.readdirSync(what).forEach(function(name) {
      EsquireAdapter.loadAll(require, path.join(what, name));
    });
  } else if (fs.lstatSync(what).isFile()) {
    require(what);
  }
  return EsquireAdapter;
}

/* Export our adapter */
module.exports = EsquireAdapter;
