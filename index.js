'use strict';

var path = require('path');
var fs = require('fs');

/* Just load if we never were initialized */
if (!('Esquire' in global)) {
  require("./src/esquire.js");
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


Object.defineProperties(EsquireAdapter, {
  'define':  { enumerable: true, configurable: false, value: function() { return global.Esquire.define .apply(global.Esquire, arguments) } },
  'module':  { enumerable: true, configurable: false, value: function() { return global.Esquire.module .apply(global.Esquire, arguments) } },
  'resolve': { enumerable: true, configurable: false, value: function() { return global.Esquire.resolve.apply(global.Esquire, arguments) } },
  'modules': { enumerable: true, configurable: false, get:   function() { return global.Esquire.modules } }
});

/* Export our adapter */
module.exports = EsquireAdapter;
