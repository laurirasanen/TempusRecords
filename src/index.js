const rcon = require("./rcon.js"),
  demo = require("./demo.js"),
  utils = require("./utils"),
  tempus = require("./tempus");

// TODO: remove unnecessary stuff from svr/configs/tempusrecords
// TODO: dry run launch arg, no youtube upload

async function start() {
  // Default to just checking recent WR activity,
  // instead of checking all maps.
  // TODO: this sucks, just use commander or something for args
  let recent = true;
  let mapName = null;
  let className = null;
  let course = false;
  let bonus = false;
  let trick = false;
  let playerId = null;
  let rankLimit = 10;
  let upload = true;

  if (process.argv.length > 2) {
    if (process.argv[2] == "restore") {
      utils.restoreConfig();
      process.exit();
    }

    if (process.argv[2] == "all") {
      recent = false;
    } else if (process.argv[2] == "course") {
      course = true;
    } else if (process.argv[2] == "bonus") {
      bonus = true;
    } else if (process.argv[2] == "trick") {
      trick = true;
    } else if (process.argv[2] == "nameprompt") {
      tempus.promptAllNames();
      return;
    } else if (process.argv[2] == "map") {
        recent = false;
        mapName = process.argv[3];
        className = process.argv[4];

        if (!mapName.startsWith("jump_")) {
          mapName = "jump_" + mapName;
        }
    } else if (process.argv[2] == "player") {
      recent = false;
      playerId = process.argv[3];
      if (process.argv.length > 4) {
        rankLimit = Number(process.argv[4]);
      }      
    }
  }

  if (!(await utils.isProcessRunning("steam.exe"))) {
    console.log("steam must be running");
    process.exit();
  }

  if(process.argv.includes("noupload")) {
    upload = false;
  }

  if (!process.argv.includes("nocfg")) {
    utils.backupConfig();
    utils.applyConfig();
  }

  rcon.init();
  demo.init(recent, mapName, className, course, bonus, trick, playerId, rankLimit, upload);
}

start();
