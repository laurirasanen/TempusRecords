const exec = require('child_process').execFile,
    config = require("./config.json"),
    fs = require('fs');

function startTF2()
{
    console.log('Launching TF2');

    var launchCmd = `"${config.steam.path}" -applaunch ${config.steam.game}`;

    for (var i = 0; i < config.tf2.launch_options.length; i++)
    {
        launchCmd += ` ${config.tf2.launch_options[i]}`;
    }            

    exec(launchCmd, null, { shell: true }, function (err, data)
    {
        if (err)
        {
            console.log(err);
        }
    }); 
}

function getLatestFile(directory, cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw 'callback is not a function';

    fs.readdir(directory, (err, list) =>
    {
        if (err)
        {
            throw err;
        }

        var latest_time = 0;
        var latest = null;

        list.forEach(file =>
        {
            var stats = fs.statSync(directory + '/' + file);
            if (stats.mtimeMs > latest_time)
            {
                latest_time = stats.mtimeMs;
                latest = directory + '/' + file;
            }
        });

        return cb(latest);
    });
}

function secondsToTimeStamp(seconds)
{
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor(seconds % 3600 / 60);
    var milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
    seconds = Math.floor(seconds % 60);

    var timeStamp = "";

    if (hours > 0)
    {
        if (hours >= 10) timeStamp += hours + ":";
        else timeStamp += "0" + hours + ":";
    }

    if (minutes > 0)
    {
        if (minutes >= 10) timeStamp += minutes + ":";
        else timeStamp += "0" + minutes + ":";
    }

    if (seconds > 0)
    {
        if (seconds >= 10) timeStamp += seconds + ".";
        else timeStamp += "0" + seconds + ".";
    }

    if (milliseconds >= 100) timeStamp += milliseconds;
    else if (milliseconds >= 10) timeStamp += "0" + milliseconds;
    else timeStamp += "00" + milliseconds;

    return timeStamp;
}

function readJson(path, cb)
{
    fs.readFile(path, (err, data) =>
    {
        if (err)
            cb(err);
        else
            cb(null, JSON.parse(data));
    });
}

function writeJson(path, data, cb)
{
    fs.writeFile(path, JSON.stringify(data, null, 4), (err) =>
    {
        if (err)
            cb(err);
        else
            cb(null);
    });
}

module.exports.startTF2 = startTF2;
module.exports.getLatestFile = getLatestFile;
module.exports.secondsToTimeStamp = secondsToTimeStamp;
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;