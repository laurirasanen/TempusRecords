﻿const exec = require("child_process").exec,
    tasklist = require("tasklist"),
    fs = require("fs"),
    config = require("./data/config.json");

global.tf2Proc = null;
global.svrProc = null;

function launchSVR() {
    console.log("Launching SVR");

    let launchCmd = `"${config.svr.launch}" ${config.svr.args}`;

    svrProc = exec(launchCmd, { shell: true, cwd: config.svr.path }, (err) => {
        if (err && !err.killed) {
            console.log(err);
        }
    });
}

function launchTF2(args) {
    console.log("Launching TF2");

    let launchCmd = `"${config.tf2.launch}" ${config.tf2.args} ${args}`;

    tf2Proc = exec(launchCmd, (err) => {
        if (err && !err.killed) {
            console.log(err);
        }
    });
}

function killSVR() {
    console.log(`Killing svr`);
    if (svrProc) {
        svrProc.kill("SIGTERM");
    }
    killTF2();
}

function killTF2() {
    console.log(`Killing tf2`);
    if (tf2Proc) {
        // kill() will only kill the parent cmd.exe process.
        tf2Proc.kill();
        tf2Proc = null;
    }
    // Killing just hl2.exe would work too, but then
    // the parent cmd.exe process would spew errors in launchTF2.
    tasklist().then((tasks) => {
        tasks.forEach((task) => {
            if (task.imageName == "hl2.exe") {
                process.kill(task.pid);
            }
        });
    });
}

function getLatestFile(directory, cb) {
    if (!cb || typeof cb !== "function") throw "callback is not a function";

    fs.readdir(directory, (err, list) => {
        if (err) {
            throw err;
        }

        var latest_time = 0;
        var latest = null;

        list.forEach((file) => {
            var stats = fs.statSync(directory + "/" + file);
            if (stats.mtimeMs > latest_time) {
                latest_time = stats.mtimeMs;
                latest = directory + "/" + file;
            }
        });

        return cb(latest);
    });
}

function secondsToTimeStamp(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
    seconds = Math.floor(seconds % 60);

    var timeStamp = "";

    if (hours > 0) {
        if (hours >= 10) timeStamp += hours + ":";
        else timeStamp += "0" + hours + ":";
    }

    if (minutes >= 10) timeStamp += minutes + ":";
    else timeStamp += "0" + minutes + ":";

    if (seconds >= 10) timeStamp += seconds + ".";
    else timeStamp += "0" + seconds + ".";

    if (milliseconds >= 100) timeStamp += milliseconds;
    else if (milliseconds >= 10) timeStamp += "0" + milliseconds;
    else timeStamp += "00" + milliseconds;

    return timeStamp;
}

function readJson(path, cb) {
    fs.readFile(path, (err, data) => {
        if (err) cb(err);
        else cb(null, JSON.parse(data));
    });
}

function writeJson(path, data, cb) {
    fs.writeFile(path, JSON.stringify(data, null, 4), (err) => {
        if (err) cb(err);
        else cb(null);
    });
}

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports.launchSVR = launchSVR;
module.exports.launchTF2 = launchTF2;
module.exports.killSVR = killSVR;
module.exports.killTF2 = killTF2;
module.exports.getLatestFile = getLatestFile;
module.exports.secondsToTimeStamp = secondsToTimeStamp;
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.sleep = sleep;