const handbrake = require('handbrake-js'),
    youtube_api = require('youtube-api'),
    fs = require('fs'),
    Lien = require('lien'),
    prettyBytes = require('pretty-bytes'),
    config = require('./config.json'),
    opn = require('opn'),
    utils = require('./utils.js');

var last_up = require('./last_uploaded.json');

let server = new Lien({
    host: "localhost",
    port: "5000"
});

let oauth = youtube_api.authenticate(
{
    type: "oauth",
    client_id: config.youtube.client_id,
    client_secret: config.youtube.client_secret,
    redirect_url: config.youtube.redirect_url
    });

opn(oauth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));

server.addPage("/oauth2callback", lien =>
{
    console.log("Trying to get the token using the following code: " + lien.query.code);
    oauth.getToken(lien.query.code, (err, tokens) =>
    {
        if (err)
        {
            
            lien.end(err, 400);
            return console.log(err);
        }

        console.log("Got the tokens.");

        oauth.setCredentials(tokens);

        lien.end("Uploads authorized.");
    });
});

function compress(file, cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw 'callback is not a function';

    handbrake.spawn(
        {
            input: file,
            output: `${file.split(".mp4")[0]}_compressed.mp4`,
            preset: "Normal"
        })
        .on('error', err =>
        {
            throw err;
        })
        .on('progress', progress =>
        {
            console.log(`Percent complete: ${progress.percentComplete}, ETA: ${progress.eta}`);
        })
        .on('cancel', () =>
        {
            return cb(false, null);
        })
        .on('complete', () =>
        {
            // Remove uncompressed video
            fs.unlink(file, err =>
            {
                if (err)
                {
                    console.log('Failed to unlink uncompressed recording');
                    console.log(err);
                }
            });

            return cb(true, `${file.split(".mp4")[0]}_compressed.mp4`);
        });
}

function upload(file, demo)
{
    var description = "";
    var stats = fs.statSync(file);
    var fileSize = stats.size;

    config.youtube.description.forEach(line =>
    {
        var d = new Date();
        var demo_date = new Date(demo.demo_info.date);
        line = line.replace("$MAP_URL", 'https://tempus.xyz/maps/' + demo.map.name)
            .replace("$MAP", demo.map.name)
            .replace("$NAME", demo.player_info.name)
            .replace("$TIME", utils.secondsToTimeStamp(demo.duration))
            .replace("$CLASS", demo.class)
            .replace("$DATETIME", d.toUTCString())
            .replace("$DATE", demo_date.toUTCString())
            
            .replace("$DEMO_URL", demo.demo_info.url);

        description += line + "\n";
    });

    var req = youtube_api.videos.insert(
    {
        resource:
        {
            snippet:
            {
                title: config.youtube.title.replace("$NAME", demo.player_info.name).replace("$MAP", demo.map.name).replace("$TIME", utils.secondsToTimeStamp(demo.duration)),
                description: description
            },
            status:
            {
                privacyStatus: "private"
            }
        },
        // This is for the callback function
        part: "snippet,status",

        // Create the readable stream to upload the video
        media:
        {
            body: fs.createReadStream(file)
        }
    },
    (err, data) =>
    {
        console.log("Done.");

        // Update last uploaded timestamp
        last_up.map = demo.demo_info.date;

        fs.writeFile('./last_uploaded.json', JSON.stringify(last_up, null, 4), function (err)
        {
            if (err) return console.log(err);
            console.log('Updated last uploaded');
        });

        // Remove compressed video
        fs.unlink(file, err =>
        {
            if (err)
            {
                console.log('Failed to unlink compressed recording');
                console.log(err);
            }
        });

        process.exit();
    });

    setInterval(function ()
    {
        console.log(`${prettyBytes(req.req.connection._bytesDispatched)} (${(100 * req.req.connection._bytesDispatched / fileSize).toFixed(2)}%) uploaded.`);
    }, 1000);
}

module.exports.compress = compress;
module.exports.upload = upload;