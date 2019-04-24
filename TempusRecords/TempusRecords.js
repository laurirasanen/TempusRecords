const rcon = require("./rcon.js"),
    obs = require("./obs.js"),
    demo = require("./demo.js");

function start()
{
    obs.init();
    obs.connect();

    rcon.init();

    demo.init();
}

setTimeout(() =>
{
    start();
}, 5000);
