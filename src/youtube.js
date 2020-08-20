const youtube_api = require("youtube-api"),
    ffmpeg = require("fluent-ffmpeg"),
    fs = require("fs"),
    Lien = require("lien"),
    prettyBytes = require("pretty-bytes"),
    config = require("./data/config.json"),
    opn = require("opn"),
    utils = require("./utils.js"),
    split = require("./split.js"),
    fullbright = require("./data/fullbright_maps.json"),
    uploaded = require("./data/uploaded.json");

let hasTokens = false;

let server = new Lien({
    host: "localhost",
    port: "5000",
});

let oauth = youtube_api.authenticate(config.youtube.oauth);

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

function getDuration(file) {
    return new Promise((resolve, reject) => {
        ffmpeg(file).ffprobe((err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.format.duration);
        });
    });
}

async function compress(video, audio, demo, cb) {
    if (!cb || typeof cb !== "function") throw "callback is not a function";

    const output = video.split(".mp4")[0] + "_compressed.mp4";
    let prevProgress = 0;

    let wrSplit = null;
    if (isBonusCollection) {
        wrSplit = await split.getWRSplit(demo.map.id, demo.class, "bonus", demo.bonusNumber);
    } else {
        wrSplit = await split.getWRSplit(demo.map.id, demo.class);
    }

    let duration = 0;
    try {
        duration = await getDuration(video);
    } catch (err) {
        console.log(`Failed to get the duration of ${video}`);
        console.log(err);
        return;
    }

    let videoFilters = [
        // Add a slight vignette
        {
            filter: "vignette",
            options: { angle: 0.1 },
        },
    ];

    // Use different color curve for fullbright maps
    let curveFile = "data/color_curves.acv";
    if (fullbright.includes(demo.map.name)) {
        curveFile = "data/color_curves_fullbright.acv";
    }

    // Apply photoshop color curve.
    // Insert before vignette just in case that makes a difference.
    videoFilters.unshift({
        filter: "curves",
        options: { psfile: curveFile },
    });

    let audioFilters = [];

    // Get timestamps for text fading
    let fadeOutEnd = duration - config.video.text.endPadding;
    let fadeOutStart = fadeOutEnd - config.video.text.fadeOutDuration;
    let fadeInEnd = fadeOutStart - config.video.text.displayDuration;
    let fadeInStart = fadeInEnd - config.video.text.fadeInDuration;
    let maxAlpha = config.video.text.maxAlpha;

    // Modify alpha to fade text in and out
    let alphaTimeSplit = `
        min(
            ${maxAlpha},
            if(lt(t,${fadeInStart}),
                0,
                if(lt(t,${fadeInEnd}),
                    (t-${fadeInStart})*${maxAlpha},
                    if(lt(t,${fadeOutStart}),
                        ${maxAlpha},
                        if(lt(t,${fadeOutEnd}),
                            (${maxAlpha}-(t-${fadeOutStart}))*${maxAlpha}
                        )
                    )
                )
            )
        )                        
    `;

    fadeInStart = config.video.text.startPadding;
    fadeInEnd = fadeInStart + config.video.text.fadeInDuration;

    let alphaName = `
        min(
            ${maxAlpha},
            if(lt(t,${fadeInStart}),
                0,
                if(lt(t,${fadeInEnd}),
                    (t-${fadeInStart})*${maxAlpha},
                    if(lt(t,${fadeOutStart}),
                        ${maxAlpha},
                        if(lt(t,${fadeOutEnd}),
                            (${maxAlpha}-(t-${fadeOutStart}))*${maxAlpha}
                        )
                    )
                )
            )
        )                        
    `;

    // Add wr split
    if (wrSplit) {
        // Escape semicolon and wrap in quotes for ffmpeg
        let text = `'${wrSplit.replace(/:/g, "\\:")}'`;

        videoFilters.push({
            filter: "drawtext",
            options: {
                ...config.video.text.ffmpegOptions,
                ...(isBonusCollection ? config.video.text.position.bonus.time : config.video.text.position.map.time),
                text: text,
                alpha: alphaTimeSplit,
            },
        });
    }

    if (isBonusCollection) {
        // Add map name, bonus number, and player name to video

        // Player
        videoFilters.push({
            filter: "drawtext",
            options: {
                ...config.video.text.ffmpegOptions,
                ...config.video.text.position.bonus.player,
                text: demo.player_info.name,
                alpha: alphaName,
            },
        });

        // Map
        videoFilters.push({
            filter: "drawtext",
            options: {
                ...config.video.text.ffmpegOptions,
                ...config.video.text.position.bonus.map,
                text: demo.map.name,
                alpha: alphaName,
            },
        });

        // Bonus
        videoFilters.push({
            filter: "drawtext",
            options: {
                ...config.video.text.ffmpegOptions,
                ...config.video.text.position.bonus.bonus,
                text: "bonus " + demo.bonusNumber,
                alpha: alphaName,
            },
        });
    }

    // Add video fade in/out
    videoFilters.push(
        {
            filter: "fade",
            options: `in:st=0:d=${config.video.fadeInDuration}`,
        },
        {
            filter: "fade",
            options: `out:st=${duration - config.video.fadeOutDuration}:d=${config.video.fadeOutDuration}`,
        }
    );

    // Add audio fade in/out
    audioFilters.push(
        {
            filter: "afade",
            options: `in:st=0:d=${config.audio.fadeInDuration}`,
        },
        {
            filter: "afade",
            options: `out:st=${duration - config.audio.fadeOutDuration}:d=${config.audio.fadeOutDuration}`,
        }
    );

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
            if (config.video.deleteUncompressed) {
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
}

async function upload(file, demo) {
    if (isBonusCollection) {
        concatBonusRuns(() => {
            uploadBonusCollection();
        });
        return;
    }

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

    // Get split
    let wrSplit = await split.getWRSplit(demo.map.id, demo.class);

    config.youtube.description.forEach((line) => {
        var d = new Date();
        var demo_date = new Date(demo.demo_info.date * 1000);
        line = line
            .replace("$MAP_URL", "https://tempus.xyz/maps/" + demo.map.name)
            .replace("$MAP", demo.map.name)
            .replace("$NAME", demo.player_info.name)
            .replace("$TIME", utils.secondsToTimeStamp(demo.duration))
            .replace("$SPLIT", wrSplit ? `(${wrSplit})` : "")
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
            utils.readJson("./data/uploaded.json", (err, uploaded) => {
                if (err !== null) {
                    console.log("Failed to read last uploaded");
                    console.log(err);
                    return;
                }

                if (!uploaded.maps.includes(demo.id)) uploaded.maps.push(demo.id);

                utils.writeJson("./data/uploaded.json", uploaded, (err) => {
                    if (err !== null) {
                        console.log("Failed to write last uploaded");
                        console.log(err);
                        return;
                    }

                    console.log("Updated uploaded list");
                });

                // Remove compressed video
                if (config.video.deleteCompressed) {
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

async function concatBonusRuns(cb) {
    if (typeof cb !== "function") {
        throw "callback is not a function";
    }

    console.log("Concatenating bonus videos");

    let prevProgress = 0;
    let completed = false;
    let duration = 0;
    for (let run of bonusRuns) {
        try {
            duration += await getDuration(run.outputFile);
        } catch (err) {
            console.log(err);
        }
    }
    let frameCount = duration * 60;

    let ff = ffmpeg();
    for (let i = bonusRuns.length - 1; i >= 0; i--) {
        if (!fs.existsSync(bonusRuns[i].outputFile)) {
            bonusRuns.splice(i, 1);
        }
    }
    for (let i = 0; i < bonusRuns.length; i++) {
        ff.input(bonusRuns[i].outputFile);
    }
    ff.on("error", (err) => {
        console.log("Failed to concatenate files");
        console.error(err);
    })
        .on("progress", (progress) => {
            let percentage = (100 * progress.frames) / frameCount;

            if (percentage > prevProgress + 5) {
                let eta = utils.secondsToTimeStamp((frameCount - progress.frames) / progress.currentFps);
                console.log(`Concat progress: ${Math.round(percentage - (percentage % 5))}%, ETA: ${eta}`);
                prevProgress += 5;
            }
        })
        .on("end", () => {
            // This gets called multiple times for some reason
            if (completed) {
                return;
            }
            completed = true;

            console.log("Finished concatenating");
            cb();
        })
        .mergeToFile(config.svr.recordingFolder + "/bonuscollection.mp4", config.svr.recordingFolder);
}

async function uploadBonusCollection() {
    if (!hasTokens) {
        console.log("Awaiting tokens");
        setTimeout(() => {
            uploadBonusCollection();
        }, 5000);
        return;
    }

    console.log(`Uploading bonus collection`);

    var file = config.svr.recordingFolder + "/bonuscollection.mp4";
    var description = "";
    var stats = fs.statSync(file);
    var fileSize = stats.size;
    var bytes = 0;

    let date = new Date();

    let useTimestamps = true;
    let seconds = 0;
    description = "Runs:\n";
    for (let run of bonusRuns) {
        if (useTimestamps) {
            try {
                let duration = await getDuration(run.outputFile);
                let timeElapsed = new Date(0);
                timeElapsed.setSeconds(Math.floor(seconds));
                let timestamp = `${timeElapsed.getMinutes()}:${
                    timeElapsed.getSeconds() < 10 ? "0" : ""
                }${timeElapsed.getSeconds()}`;
                description += `${timestamp} ${run.map.name} Bonus ${run.bonusNumber} by ${run.player_info.name} (${
                    run.class === 3 ? "Soldier" : "Demoman"
                })\n`;
                seconds += duration;
            } catch (err) {
                console.log(`Error getting duration of ${run.outputFile}!`);
                console.error(err);
                // Failing to get the length of 1 video will make all future timestamps inaccurate
                useTimestamps = false;
            }
        }

        if (!useTimestamps) {
            description += `${run.map.name} Bonus ${run.bonusNumber} by ${run.player_info.name} (${
                run.class === 3 ? "Soldier" : "Demoman"
            })\n`;
        }
    }
    description += "\n";

    config.youtube.bonusDescription.forEach((line) => {
        line = line.replace("$DATETIME", date.toUTCString());
        description += line + "\n";
    });

    // Common tags for all videos
    var tags = [
        "Team Fortress 2",
        "TF2",
        "rocketjump",
        "speedrun",
        "tempus",
        "record",
        "bonus",
        "bonuses",
        "bonus collection",
        "soldier",
        "demoman",
    ];

    let previousProgress = 0;

    var req = youtube_api.videos.insert(
        {
            resource: {
                snippet: {
                    title: config.youtube.bonusTitle.replace("$NUMBER", uploaded.bonusCollections + 1),
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

            // Add video to bonus playlist
            youtube_api.playlistItems.insert(
                {
                    resource: {
                        snippet: {
                            playlistId: "PL_D9J2bYWXyJBc0YvjRpqpFc5hY-ieU-B",
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
            utils.readJson("./data/uploaded.json", (err, uploaded) => {
                if (err !== null) {
                    console.log("Failed to read last uploaded");
                    console.log(err);
                    return;
                }

                for (let run of bonusRuns) {
                    if (!uploaded.bonuses.includes(run.id)) {
                        uploaded.bonuses.push(run.id);
                    }
                }

                uploaded.bonusCollections += 1;

                utils.writeJson("./data/uploaded.json", uploaded, (err) => {
                    if (err !== null) {
                        console.log("Failed to write last uploaded");
                        console.log(err);
                        return;
                    }

                    console.log("Updated uploaded list");
                });
            });
        }
    );
}

module.exports.compress = compress;
module.exports.upload = upload;
