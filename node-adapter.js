global.window = global;
require("./src/esquire-inject.js");
delete global.window;
module.exports = global.Esquire;
