var _oldwindow = global.window;
var _haswindow = 'window' in global;

global.window = global;
require("./src/esquire-inject.js");
if (_haswindow) {
  global.window = _oldwindow;
} else {
  delete global.window;
}

function EsquireAdapter(p) {
  if (this instanceof EsquireAdapter) {
    global.Esquire.apply(this, arguments);
  } else {
    return global.esquire.apply(this, arguments);
  }
};
EsquireAdapter.prototype = global.Esquire.prototype;

module.exports = EsquireAdapter;
