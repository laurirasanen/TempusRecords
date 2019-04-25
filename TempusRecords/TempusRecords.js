const rcon = require("./rcon.js"),
    obs = require("./obs.js"),
    demo = require("./demo.js"),
    utils = require('./utils.js');

function start()
{
    utils.startTF2();

    obs.init();
    obs.connect();

    rcon.init();

    demo.init();
}

setTimeout(() =>
{
    start();
}, 5000);
