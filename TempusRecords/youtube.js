const youtube_api = require("youtube-api"),
    ffmpeg = require("fluent-ffmpeg"),
    fs = require("fs"),
    Lien = require("lien"),
    prettyBytes = require("pretty-bytes"),
    config = require("./config.json"),
    opn = require("opn"),
    utils = require("./utils.js");

let hasTokens = false;

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

        hasTokens = true;
    });
});

function getDuration(file, cb) {
    ffmpeg(file).ffprobe((err, data) => {
        if (err) {
            // Ignore, just don't apply fades
            return cb(false, -1);
        }
        return cb(true, data.format.duration);
    });
}

function compress(video, audio, cb) {
    if (!cb || typeof cb !== "function") throw "callback is not a function";

    const output = video.split(".avi")[0] + "_compressed.mp4";
    let prevProgress = 0;

    getDuration(video, (success, duration) => {
        let videoFilters = [
            // Apply photoshop color curve
            {
                filter: "curves",
                options: { psfile: "color_curves.acv" },
            },
            // Add a slight vignette
            {
                filter: "vignette",
                options: { angle: 0.2 },
            },
        ];
        let audioFilters = [];

        // Add fade in/out
        if (success) {
            videoFilters.push(
                {
                    filter: "fade",
                    options: "in:st=0:d=0.25",
                },
                {
                    filter: "fade",
                    options: `out:st=${duration - 0.5}:d=0.5`,
                }
            );
            audioFilters.push(
                {
                    filter: "afade",
                    options: "in:st=0:d=1",
                },
                {
                    filter: "afade",
                    options: `out:st=${duration - 1.5}:d=1.5`,
                }
            );
        }

        ffmpeg()
            .input(video)
            .input(audio)
            .videoFilters(videoFilters)
            .audioFilters(audioFilters)
            .fps(60)
            .size("3840x2160")
            .outputOptions([
                "-movflags faststart",
                "-c:v libx264",
                "-crf 18",
                "-profile:v high",
                "-level:v 4.2",
                "-preset:v veryfast",
                "-tune:v film",
                "-bf 2",
                "-g 30",
                "-coder 1",
                "-pix_fmt yuv420p",
                "-map 0:v:0",
                "-map 1:a:0",
                "-c:a aac",
                "-profile:a aac_low",
                "-b:a 384k",
            ])
            .save(output)
            .on("start", () => {
                console.log(`Started compressing ${video}`);
            })
            .on("progress", (progress) => {
                // Progress has no percentage with the settings used,
                // make our own percentage with blackjack and hookers.
                let frameCount = duration * 60;
                let percentage = (100 * progress.frames) / frameCount;

                if (percentage > prevProgress + 5) {
                    let eta = utils.secondsToTimeStamp((frameCount - progress.frames) / progress.currentFps);
                    console.log(`Progress: ${Math.round(percentage - (percentage % 5))}%, ETA: ${eta} (${video})`);
                    prevProgress += 5;
                }
            })
            .on("end", () => {
                console.log(`Finished compressing ${video}`);

                // Remove old video and audio
                if (config.youtube.delete_uncompressed) {
                    fs.unlink(video, (err) => {
                        if (err) {
                            console.log("Failed to unlink uncompressed video");
                            console.log(err);
                        }
                    });

                    fs.unlink(audio, (err) => {
                        if (err) {
                            console.log("Failed to unlink audio");
                            console.log(err);
                        }
                    });
                }

                return cb(true, output);
            })
            .on("error", (err) => {
                console.log(`Failed to process ${video}`);
                console.log(err.message);
                return cb(false, null);
            });
    });
}

function upload(file, demo) {
    if (!hasTokens) {
        console.log("Awaiting tokens");
        setTimeout(() => {
            upload(file, demo);
        }, 5000);
        return;
    }

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

    let previousProgress = 0;

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
                    let percentage = (100 * bytes) / fileSize;
                    if (percentage > previousProgress + 5) {
                        console.log(
                            `${file}: ${prettyBytes(bytes)} (${Math.round(percentage - (percentage % 5))}%) uploaded.`
                        );
                        previousProgress += 5;
                    }
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
