const handbrake = require('handbrake-js'),
    youtube_api = require('youtube-api'),
    fs = require('fs'),
    Lien = require('lien'),
    prettyBytes = require('pretty-bytes'),
    config = require('./config.json'),
    opn = require('opn'),
    utils = require('./utils.js');

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

    console.log(`Compressing ${file}`);

    handbrake.spawn(
        {
            "input": file,
            "output": `${file.split(".mp4")[0]}_compressed.mp4`,
            "encoder": "x264",
            "quality": "22",
            "encoder-profile": "high",
            "encoder-level": "4.2",
            "encoder-preset": "slow",
            "rate": 60,
            "width": 2560,
            "height": 1440,
            "aencoder": "copy:aac"
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
    console.log(`Uploading ${file}`);

    var description = "";
    var stats = fs.statSync(file);
    var fileSize = stats.size;

    config.youtube.description.forEach(line =>
    {
        var d = new Date();
        var demo_date = new Date(demo.demo_info.date * 1000);
        line = line.replace("$MAP_URL", 'https://tempus.xyz/maps/' + demo.map.name)
            .replace("$MAP", demo.map.name)
            .replace("$NAME", demo.player_info.name)
            .replace("$TIME", utils.secondsToTimeStamp(demo.duration))
            .replace("$CLASS", demo.class === 3 ? "Soldier" : "Demoman")
            .replace("$DATETIME", d.toUTCString())
            .replace("$DATE", demo_date.toUTCString())
            
            .replace("$DEMO_URL", 'https://tempus.xyz/demos/' + demo.demo_info.id);

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
                privacyStatus: "public"
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
        console.log("Done uploading");
        clearInterval(interval);

        // Update last uploaded timestamp
        utils.readJson('./uploaded.json', (err, uploaded) =>
        {
            if (err !== null)
            {
                console.log('Failed to read last uploaded');
                console.log(err);
                return;
            }

            if (!uploaded.maps.includes(demo.id))
                uploaded.maps.push(demo.id);

            utils.writeJson('./uploaded.json', uploaded, (err) =>
            {
                if (err !== null)
                {
                    console.log('Failed to write last uploaded');
                    console.log(err);
                    return;
                }

                console.log('Updated uploaded list');
            });

            // Remove compressed video
            fs.unlink(file, err =>
            {
                if (err)
                {
                    console.log('Failed to unlink compressed recording');
                    console.log(err);
                    return;
                }

                console.log('Unlinked compressed recording');
            });
        });
    });

    var interval = setInterval(function ()
    {
        console.log(`${prettyBytes(req.req.connection._bytesDispatched)} (${(100 * req.req.connection._bytesDispatched / fileSize).toFixed(2)}%) uploaded.`);
    }, 1000);
}

module.exports.compress = compress;
module.exports.upload = upload;