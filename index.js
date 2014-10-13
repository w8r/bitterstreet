require("./vendor/spin.js");
require("./vendor/eventtarget.js");
require("./vendor/component.js");

var App = require("./src/app");
require("./src/player");
require("./src/route");

global.app = new App(require("./config.json"));
