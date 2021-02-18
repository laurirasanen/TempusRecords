const rcon = require("./rcon.js"),
  demo = require("./demo.js"),
  utils = require("./utils");

function start() {
  // Default to just checking recent WR activity,
  // instead of checking all maps.
  var recent = true;
  var mapName = null;
  var className = null;
  var bonus = false;

  if (process.argv.length > 2) {
    if (process.argv[2] == "restore") {
      utils.restoreConfig();
      return;
    }

    if (process.argv[2] == "all") {
      recent = false;
    } else if (process.argv[2] == "bonus") {
      bonus = true;
    }

    if (process.argv.length > 3) {
      recent = false;
      mapName = process.argv[2];
      className = process.argv[3];

      if (!mapName.startsWith("jump_")) {
        mapName = "jump_" + mapName;
      }
    }
  }

  utils.backupConfig();
  utils.applyConfig();

  rcon.init();
  demo.init(recent, mapName, className, bonus);
}

start();
