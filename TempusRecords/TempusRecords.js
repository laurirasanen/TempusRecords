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

            // Remembering input format is hard...
            if (!mapName.startsWith("jump_")) {
                mapName = "jump_" + mapName;
            }
            className = className
                .replace("demo", "d")
                .replace("demoman", "d")
                .replace("solly", "s")
                .replace("soldier", "s")
                .replace("3", "s")
                .replace("4", "d");
        }
    }

    demo.init(recent, mapName, className);
}

start();
