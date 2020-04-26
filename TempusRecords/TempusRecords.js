const rcon = require("./rcon.js"),
    demo = require("./demo.js");

function start() {
    rcon.init();

    // Default to just checking recent WR activity,
    // instead of checking all maps.
    var recent = true;
    var mapName = null;
    var className = null;
    if (process.argv.length > 2) {
        if (process.argv[2] == "all") {
            recent = false;
        }

        if (process.argv.length > 3) {
            recent = false;
            mapName = process.argv[2];
            className = process.argv[3];
        }
    }

    demo.init(recent, mapName, className);
}

start();
