const rcon = require("./rcon.js"),
    demo = require("./demo.js"),
    utils = require('./utils.js');

function start()
{
    utils.startTF2();

    rcon.init();

    demo.init();
}

start();
