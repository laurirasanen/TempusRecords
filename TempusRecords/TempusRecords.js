const rcon = require("./rcon.js"),
    demo = require("./demo.js");

function start()
{
    rcon.init();
    demo.init();
}

start();
