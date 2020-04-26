const handbrake = require("handbrake-js"),
    youtube_api = require("youtube-api"),
    ffmpegPath = require("@ffmpeg-installer/ffmpeg").path,
    ffmpeg = require("fluent-ffmpeg"),
    fs = require("fs"),
    Lien = require("lien"),
    prettyBytes = require("pretty-bytes"),
    config = require("./config.json"),
    opn = require("opn"),
    utils = require("./utils.js");

let server = new Lien({
    host: "localhost",
    port: "5000",
});

let oauth = youtube_api.authenticate({
    type: "oauth",
    client_id: config.youtube.client_id,
    client_secret: config.youtube.client_secret,
    redirect_url: config.youtube.redirect_url,
});

opn(
    oauth.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube"],
    })
);

server.addPage("/oauth2callback", (lien) => {
    console.log("Trying to get the token using the following code: " + lien.query.code);
    oauth.getToken(lien.query.code, (err, tokens) => {
        if (err) {
            lien.end(err, 400);
            return console.log(err);
        }

        console.log("Got the tokens.");

        oauth.setCredentials(tokens);

        lien.end("Uploads authorized.");
    });
});

function compress(file, cb) {
    if (!cb || typeof cb !== "function") throw "callback is not a function";

    console.log(`Compressing ${file}`);

    handbrake
        .spawn({
            input: file,
            output: `${file.split(".avi")[0]}_compressed.mp4`,
            encoder: "x264",
            vb: "68000",
            "two-pass": true,
            "encoder-profile": "high",
            "encoder-level": "4.2",
            "encoder-preset": "veryfast",
            "encoder-tune": "film",
            rate: 60,
            width: 3840,
            height: 2160,
            aencoder: "copy:aac",
        })
        .on("error", (err) => {
            throw err;
        })
        .on("progress", (progress) => {
            console.log(`${file}: Compressed: ${progress.percentComplete}, ETA: ${progress.eta}`);
        })
        .on("cancel", () => {
            return cb(false, null);
        })
        .on("complete", () => {
            // Remove uncompressed video
            fs.unlink(file, (err) => {
                if (err) {
                    console.log("Failed to unlink uncompressed recording");
                    console.log(err);
                }
            });

            return cb(true, `${file.split(".avi")[0]}_compressed.mp4`);
        });
}

function remux(video, audio, output, cb) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg()
        .input(video)
        .input(audio)
        .videoCodec("copy")
        .outputOptions(["-map 0:v:0", "-map 1:a:0"])
        .save(output)
        .on("error", (err, stdout, stderr) => {
            console.log(err.message);
        })
        .on("end", (stdout, stderr) => {
            console.log("Remux done");

            // Remove old video and audio files
            fs.unlink(video, (err) => {
                if (err) {
                    console.log("Failed to unlink remux input video");
                    console.log(err);
                    return;
                }

                console.log("Unlinked remux input video");
            });
            fs.unlink(audio, (err) => {
                if (err) {
                    console.log("Failed to unlink remux input audio");
                    console.log(err);
                    return;
                }

                console.log("Unlinked remux input audio");
            });

            return cb(true, output);
        });
}

function upload(file, demo) {
    console.log(`Uploading ${file}`);

    var description = "";
    var stats = fs.statSync(file);
    var fileSize = stats.size;
    var bytes = 0;

    config.youtube.description.forEach((line) => {
        var d = new Date();
        var demo_date = new Date(demo.demo_info.date * 1000);
        line = line
            .replace("$MAP_URL", "https://tempus.xyz/maps/" + demo.map.name)
            .replace("$MAP", demo.map.name)
            .replace("$NAME", demo.player_info.name)
            .replace("$TIME", utils.secondsToTimeStamp(demo.duration))
            .replace("$CLASS", demo.class === 3 ? "Soldier" : "Demoman")
            .replace("$DATETIME", d.toUTCString())
            .replace("$DATE", demo_date.toUTCString())

            .replace("$DEMO_URL", "https://tempus.xyz/demos/" + demo.demo_info.id);

        description += line + "\n";
    });

    // Common tags for all videos
    var tags = ["Team Fortress 2", "TF2", "rocketjump", "speedrun", "tempus", "record"];

    // Video specific tags
    var mapParts = demo.map.name.split("_");
    tags.push(...mapParts);
    if (mapParts.length > 1) tags.push(`${mapParts[0]}_${mapParts[1]}`);
    tags.push(demo.class === 3 ? ["soldier", "solly"] : ["demoman", "demo"]);

    // Commas in player name will break youtube tags
    var playerName = demo.player_info.name;
    playerName = playerName.replace(",", "");
    tags.push(playerName);

    var req = youtube_api.videos.insert(
        {
            resource: {
                snippet: {
                    title: config.youtube.title
                        .replace("$NAME", demo.player_info.name)
                        .replace("$MAP", demo.map.name)
                        .replace("$TIME", utils.secondsToTimeStamp(demo.duration)),
                    description: description,
                    tags: tags,
                },
                status: {
                    privacyStatus: "private",
                    publishAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // Allow for 30 mins of processing before making public
                },
            },
            // This is for the callback function
            part: "snippet,status",

            // Create the readable stream to upload the video
            media: {
                body: fs.createReadStream(file).on("data", (chunk) => {
                    bytes += chunk.length;
                    console.log(`${file}: ${prettyBytes(bytes)} (${((100 * bytes) / fileSize).toFixed(2)}%) uploaded.`);
                }),
            },
        },
        (err, data) => {
            if (err) {
                console.log("Failed to upload video");
                console.log(err);
                return;
            } else {
                console.log("Done uploading");
            }

            // Add video to class playlist
            youtube_api.playlistItems.insert(
                {
                    resource: {
                        snippet: {
                            playlistId:
                                demo.class === 3
                                    ? "PL_D9J2bYWXyLFs5OJcTugl_70HqzDN9nv"
                                    : "PL_D9J2bYWXyIeRkUq099oCV8wf5Omf9Fe",
                            resourceId: {
                                kind: "youtube#video",
                                videoId: data.id,
                            },
                        },
                    },
                    part: "snippet",
                },
                (err, data) => {
                    if (err) {
                        console.log("Failed to add video to playlist");
                        console.log(err);
                    } else {
                        console.log("Video added to playlist");
                    }
                }
            );

            // Add to uploaded runs
            utils.readJson("./uploaded.json", (err, uploaded) => {
                if (err !== null) {
                    console.log("Failed to read last uploaded");
                    console.log(err);
                    return;
                }

                if (!uploaded.maps.includes(demo.id)) uploaded.maps.push(demo.id);

                utils.writeJson("./uploaded.json", uploaded, (err) => {
                    if (err !== null) {
                        console.log("Failed to write last uploaded");
                        console.log(err);
                        return;
                    }

                    console.log("Updated uploaded list");
                });

                // Remove compressed video
                if (config.youtube.delete_compressed) {
                    fs.unlink(file, (err) => {
                        if (err) {
                            console.log("Failed to unlink uploaded video");
                            console.log(err);
                            return;
                        }

                        console.log("Unlinked uploaded video");
                    });
                }
            });
        }
    );
}

module.exports.compress = compress;
module.exports.upload = upload;
module.exports.remux = remux;
