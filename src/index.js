const rcon = require("./rcon.js"),
  demo = require("./demo.js"),
  utils = require("./utils");

async function start() {
  // Default to just checking recent WR activity,
  // instead of checking all maps.
  // TODO: this sucks, just use commander or something for args
  var recent = true;
  var mapName = null;
  var className = null;
  var bonus = false;
  var trick = false;

  if (process.argv.length > 2) {
    if (process.argv[2] == "restore") {
      utils.restoreConfig();
      process.exit();
    }

    if (process.argv[2] == "all") {
      recent = false;
    } else if (process.argv[2] == "bonus") {
      bonus = true;
    } else if (process.argv[2] == "trick") {
      trick = true;
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

  if (!(await utils.isProcessRunning("steam.exe"))) {
    console.log("steam must be running");
    process.exit();
  }

  utils.backupConfig();
  utils.applyConfig();

  rcon.init();
  demo.init(recent, mapName, className, bonus, trick);
}

start();
