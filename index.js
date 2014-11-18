'use strict';

/* Just load if we never were initialized */
if (!('Esquire' in global)) {

  /* Preserve the old window, if any */
  var _oldwindow = global.window;
  var _haswindow = 'window' in global;

  /* Create a fake window object for initialization */
  global.window = {
    'console':       global['console'],
    'setTimeout':    global['setTimeout'],
    'setInterval':   global['setInterval'],
    'clearTimeout':  global['clearTimeout'],
    'clearInterval': global['clearInterval']
  };

  /* Load the esquire library */
  require("./src/esquire-inject.js");

  /* Remember our function and class */
  global.Esquire = global.window.Esquire;
  global.esquire = global.window.esquire;

  /* Restore the old window */
  if (_haswindow) {
    global.window = _oldwindow;
  } else {
    delete global.window;
  }
}

/* We are sure we have Esquire in globals */
function EsquireAdapter(p) {
  if (this instanceof EsquireAdapter) {
    global.Esquire.apply(this, arguments);
  } else {
    return global.esquire.apply(this, arguments);
  }
};
EsquireAdapter.prototype = global.Esquire.prototype;

/* Export our adapter */
module.exports = EsquireAdapter;
