const rcon = require("./rcon.js"),
    demo = require("./demo.js");

function start()
{
    rcon.init();

    // Default to just checking recent WR activity,
    // instead of checking all maps.
    var recent = true;
    if (process.argv.length > 2)
    {
        if (process.argv[2] == "all")
        {
            recent = false;
        }
    }

    demo.init(recent);
}

start();
