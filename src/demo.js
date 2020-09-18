const tempus = require("./tempus.js"),
    downloader = require("./downloader.js"),
    fs = require("fs"),
    utils = require("./utils.js"),
    config = require("./data/config.json"),
    nicknames = require("./data/nicknames.json"),
    blacklist = require("./data/blacklist.json"),
    youtube = require("./youtube.js");

// Some players have changed accounts at some point.
// Records in tempus api have their new steamids but the stv demo files have old ids.
// This breaks the spec_player "STEAMID" command.
const old_steamids = [
    // vice
    {
        current: "STEAM_0:0:203051360",
        old: "STEAM_1:0:115234",
        date: 1523283653.81564,
    },
];
let runs = [];

global.currentDemo = null;
global.isBonusCollection = false;
global.bonusRuns = [];

async function init(recent, mapName, className, bonus) {
    if (mapName && className) {
        // Upload specific run
        let wr = await tempus.getMapWR(mapName, className);
        if (!wr) {
            console.log(`Couldn't find WR for map ${mapName} as ${className}`);
            return;
        }
        runs.push(wr);

        replaceNames();
        playDemo(runs[0]);
        return;
    }

    if (bonus) {
        // Upload bonus runs
        isBonusCollection = true;
        let mapList = await tempus.getMapList();
        // splice bonus runs manually for now so we can get through all maps
        // TODO: remove
        mapList = mapList.splice(290, 50);
        runs = await tempus.getBonusWRs(mapList);

        utils.readJson("./data/uploaded.json", (err, uploaded) => {
            if (err !== null) {
                console.log("Could not read uploaded.json");
                console.log(err);
                return;
            }

            // Remove already uploaded runs
            for (var i = runs.length - 1; i >= 0; i--) {
                if (uploaded.bonuses.includes(runs[i].id)) {
                    runs.splice(i, 1);
                    continue;
                }

                if (!runs[i].demo.filename || !runs[i].demo.url) {
                    runs.splice(i, 1);
                    continue;
                }

                if (runs[i].duration / 60 > config.video.bonusMaxDuration) {
                    console.log(
                        `Removing run too long ${runs[i].map.name} bonus ${runs[i].zone.zoneindex} (${runs[i].class})`
                    );
                    runs.splice(i, 1);
                    continue;
                }

                // Remove blacklisted runs
                var cont = false;
                for (var j = 0; j < blacklist.length; j++) {
                    if (
                        blacklist[j].name === runs[i].map.name &&
                        blacklist[j][runs[i].class].bonuses.includes(runs[i].zone.zoneindex)
                    ) {
                        console.log(
                            `Removing blacklisted ${runs[i].map.name} bonus ${runs[i].zone.zoneindex} (${runs[i].class})`
                        );
                        runs.splice(i, 1);
                        cont = true;
                        break;
                    }
                }

                if (cont) continue;

                // Remove too recent runs
                if (Date.now() - runs[i].demo.date * 1000 < 1000 * 60 * 60 * 24 * config.video.bonusMinAge) {
                    console.log(
                        `Removing run newer than ${config.video.bonusMinAge} days ${runs[i].map.name} bonus ${runs[i].zone.zoneindex} (${runs[i].class})`
                    );
                    runs.splice(i, 1);
                    continue;
                }

                replaceNames();
            }

            // Check for max number of runs
            if (runs.length > config.video.maxBonusesInCollection) {
                let firstDeleted = runs[config.video.maxBonusesInCollection].map.name;
                runs = runs.splice(0, config.video.maxBonusesInCollection);

                // Let's not end the collection midway through a map...
                while (runs[runs.length - 1].map.name === firstDeleted) {
                    runs.splice(runs.length - 1, 1);
                }
            }

            if (runs.length <= 0) {
                console.log("No new runs.");
                return;
            }

            for (let i = 0; i < runs.length; i++) {
                // This is used for concatenating bonus video files before upload
                runs[
                    i
                ].outputFile = `${config.svr.recordingFolder}/${runs[i].demo.filename}_bonus${runs[i].zone.zoneindex}_${runs[i].class}_compressed.mp4`;
                bonusRuns.push(runs[i]);
            }

            playDemo(runs[0]);
        });
        return;
    }

    if (recent) {
        // Check most recent runs
        runs = await tempus.getRecentMapWRs();
    } else {
        // Check all runs
        let mapList = await tempus.getMapList();
        runs = await tempus.getMapWRs(mapList);
    }

    // Sort by date
    runs.sort((a, b) => {
        if (a.demo.date < b.demo.date) return -1;
        if (a.demo.date > b.demo.date) return 1;
        return 0;
    });

    for (var i = runs.length - 1; i >= 0; i--) {
        if (Date.now() - runs[i].map.dateAdded * 1000 < 1000 * 60 * 60 * 24 * config.video.mapMinAge) {
            console.log(
                `Removing run newer than ${config.video.mapMinAge} days ${runs[i].map.name} (${runs[i].class})`
            );
            runs.splice(i, 1);
            continue;
        }

        if (runs[i].duration / 60 > config.video.maxDuration) {
            console.log(`Removing run too long ${runs[i].map.name} (${runs[i].class})`);
            runs.splice(i, 1);
            continue;
        }
    }

    utils.readJson("./data/uploaded.json", (err, uploaded) => {
        if (err !== null) {
            console.log("Could not read uploaded.json");
            console.log(err);
            return;
        }

        // Remove already uploaded runs
        for (var i = runs.length - 1; i >= 0; i--) {
            if (uploaded.maps.includes(runs[i].id)) {
                runs.splice(i, 1);
                continue;
            }

            // Remove blacklisted runs
            var cont = false;
            for (var e = 0; e < blacklist.length; e++) {
                if (blacklist[e].name === runs[i].map.name && blacklist[e][runs[i].class].map) {
                    console.log(`Removing blacklisted ${runs[i].map.name} (${runs[i].class})`);
                    runs.splice(i, 1);
                    cont = true;
                    break;
                }
            }

            if (cont) continue;

            replaceNames();
        }

        if (runs.length <= 0) {
            console.log("No new runs.");
            return;
        }

        playDemo(runs[0]);
    });
}

function replaceNames() {
    for (var i = 0; i < runs.length; i++) {
        for (var j = 0; j < nicknames.length; j++) {
            if (runs[i].player.steamId === nicknames[j].steamId) {
                runs[i].player.name = nicknames[j].name;
                break;
            }

            if (j >= nicknames.length - 1) {
                console.log(`Warn: no nickname for player ${runs[i].player.name} (${runs[i].player.steamId})`);
            }
        }
    }
}

function skip() {
    for (var i = 0; i < runs.length - 1; i++) {
        if (runs[i] === currentDemo || currentDemo === null) {
            currentDemo = runs[i + 1];
            return playDemo(runs[i + 1]);
        }
    }
}

function isLastRun(run) {
    return run.id === runs[runs.length - 1].id;
}

// TODO: the var name "demo" is used here and in a lot of other places,
// replace with "run", etc. to be less misleading.
function playDemo(demo) {
    if (!demo || !demo.player || !demo.demo) {
        return;
    }

    // Check for existing video if we crashed before, etc
    var video = `${config.svr.recordingFolder}/${demo.demo.filename}_${demo.zone.type + demo.zone.zoneindex}_${
        demo.class
    }.mp4`;
    var audio = `${config.svr.recordingFolder}/${demo.demo.filename}_${demo.zone.type + demo.zone.zoneindex}_${
        demo.class
    }.wav`;

    if (fs.existsSync(video) && fs.existsSync(audio)) {
        console.log(`WARNING: Using existing video '${video}'`);
        console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

        // Compress
        youtube.compress(video, audio, demo, (result, name) => {
            if (result === true) {
                // Upload final output
                if (result === true && (!isBonusCollection || isLastRun(demo))) {
                    youtube.upload(name, demo);
                }
            }
        });

        skip();
        return;
    }

    // Check for already compressed version
    video = `${config.svr.recordingFolder}/${demo.demo.filename}_${demo.zone.type + demo.zone.zoneindex}_${
        demo.class
    }_compressed.mp4`;
    if (fs.existsSync(video)) {
        if (!isBonusCollection || isLastRun(demo)) {
            console.log(`WARNING: Uploading existing video '${video}'`);
            console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

            youtube.upload(video, demo);
        }

        skip();
        return;
    }

    if (!demo.demo.url) {
        skip();
        return;
    }

    // Get map file
    downloader.getMap(demo.map.name, (res) => {
        if (res !== null) {
            // Get demo file
            downloader.getDemoFile(demo, (result) => {
                if (result === null) {
                    console.log("[DL] Error getting demo");
                    skip();
                    return;
                } else if (result === false) {
                    console.log(`[DL] Demo file ${demo.demo.filename} exists already!`);
                }

                startDemo(demo);
            });
        } else {
            return;
        }
    });
}

function startDemo(demo) {
    // Create a tmps_records_spec_player.cfg, which will get executed when the demo loads.
    // The config just contains a 'spec_player "STEAMID"' command.
    // This cannot be done via rcon because the steamId needs quotes around it and source does not like that.

    // Check for old steamids
    var steamId = demo.player.steamId;
    for (var i = 0; i < old_steamids.length; i++) {
        if (old_steamids[i].current === demo.player.steamId && demo.demo.date < old_steamids[i].date) {
            steamId = old_steamids[i].old;
        }
    }

    // Write the .cfg
    fs.writeFile(config.tf2.path + "/cfg/tmps_records_spec_player.cfg", `spec_player "${steamId}"`, (err) => {
        if (err) {
            console.log("[FILE] Could not write tmps_records_spec_player.cfg!");
            console.log(err);

            return;
        }

        let commands = getPlayCommands(demo, false);

        // Write the play commands
        savePlayCommands(demo.demo.filename, commands, (success) => {
            if (success) {
                currentDemo = demo;

                // Record audio without SVR
                utils.launchTF2(`+playdemo ${demo.demo.filename}`);

                // Video will be recorded after audio finishes
                // when rcon.js receives 'tmps_records_run_end' the first time.
                // The second time, video will be compressed, remuxed together with audio and uploaded.
            } else {
                console.log("[FILE] FAILED TO WRITE PLAYCOMMANDS");
                return;
            }
        });
    });
}

function getPlayCommands(demo, isVideo = true) {
    const startPadding = config.video.startPadding * 67;
    const endPadding = config.video.endPadding * 67;

    // Commands used to control the demo playback.
    // Running rcon tmps_records_* commands will trigger events in rcon.js.
    var commands = [
        {
            tick: 33,
            commands: `sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${
                demo.demoStartTick - startPadding
            }; demo_setendtick ${demo.demoEndTick + endPadding + 66}`,
        },
        {
            tick: demo.demoStartTick - startPadding,
            commands: `exec tmps_records_spec_player; spec_mode 4; demo_resume; ${
                isVideo ? "" : "volume 0.1;"
            } rcon tmps_records_run_start; startmovie ${demo.demo.filename}_${demo.zone.type + demo.zone.zoneindex}_${
                demo.class
            }${isVideo ? ".mp4 tempus" : ".wav wav"}`,
        },
        { tick: demo.demoStartTick, commands: `exec tmps_records_spec_player; spec_mode 4` }, // In case player dead before start_tick
        { tick: demo.demoEndTick + endPadding - 33, commands: "rcon tmps_records_run_end" },
        { tick: demo.demoEndTick + endPadding, commands: "volume 0; endmovie" },
    ];

    return commands;
}

// Save play commands to control the demo playback
function savePlayCommands(filename, commands, cb) {
    if (!cb || typeof cb !== "function") throw "callback is not a function";

    var data = `demoactions\n{\n`;

    for (var i = 0; i < commands.length; i++) {
        data +=
            `   "${i + 1}"\n` +
            "   {\n" +
            '       factory "PlayCommands"\n' +
            `       name "tmps_records${i + 1}"\n` +
            `       starttick "${commands[i].tick}"\n` +
            `       commands "${commands[i].commands}"\n` +
            "   }\n";
    }

    data += "\n}";

    fs.writeFile(config.tf2.path + filename + ".vdm", data, {}, (err) => {
        if (err) {
            console.log("[FILE] Error saving PlayCommands!");
            console.log(err);
            return cb(false);
        }

        return cb(true);
    });
}

module.exports.playDemo = playDemo;
module.exports.init = init;
module.exports.skip = skip;
module.exports.getPlayCommands = getPlayCommands;
module.exports.savePlayCommands = savePlayCommands;
module.exports.isLastRun = isLastRun;
