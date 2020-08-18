const tempus = require("tempus-api"),
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
        var wr = await tempus.mapWR(mapName, className);
        var overview = await wr.toRecordOverview();
        overview.map = await overview.map.toMapOverview();
        runs = await getOverviews([overview]);

        // Replace name
        for (var i = 0; i < nicknames.length; i++) {
            if (runs[0].player_info.steamid === nicknames[i].steamid) {
                runs[0].player_info.name = nicknames[i].name;
                break;
            }
        }

        playDemo(runs[0]);
        return;
    }

    if (bonus) {
        // Upload bonus runs
        isBonusCollection = true;
        let mapList = await tempus.detailedMapList();
        runs = await getBonusRuns(mapList);

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

                if (!runs[i].demo_info.filename || !runs[i].demo_info.url) {
                    runs.splice(i, 1);
                    continue;
                }

                if (runs[i].duration / 60 > config.video.bonusMaxDuration) {
                    console.log(
                        `Removing run too long ${runs[i].map.name} bonus ${runs[i].bonusNumber} (${
                            runs[i].class === 3 ? "Soldier" : "Demoman"
                        })`
                    );
                    runs.splice(i, 1);
                    continue;
                }

                // Remove blacklisted runs
                var cont = false;
                for (var j = 0; j < blacklist.length; j++) {
                    if (
                        blacklist[j].name === runs[i].map.name &&
                        blacklist[j][runs[i].class].bonuses.includes(runs[i].bonusNumber)
                    ) {
                        console.log(
                            `Removing blacklisted ${runs[i].map.name} bonus ${runs[i].bonusNumber} (${
                                runs[i].class === 3 ? "Soldier" : "Demoman"
                            })`
                        );
                        runs.splice(i, 1);
                        cont = true;
                        break;
                    }
                }

                if (cont) continue;

                // Remove too recent runs
                if (Date.now() - runs[i].demo_info.date * 1000 < 1000 * 60 * 60 * 24 * config.video.bonusMinAge) {
                    console.log(
                        `Removing run newer than ${config.video.bonusMinAge} days ${runs[i].map.name} bonus ${
                            runs[i].bonusNumber
                        } (${runs[i].class === 3 ? "Soldier" : "Demoman"})`
                    );
                    runs.splice(i, 1);
                    continue;
                }

                // Replace names
                for (var e = 0; e < nicknames.length; e++) {
                    if (runs[i].player_info.steamid === nicknames[e].steamid) {
                        runs[i].player_info.name = nicknames[e].name;
                        break;
                    }

                    if (e >= nicknames.length - 1) {
                        console.log(
                            `Warn: no nickname for player ${runs[i].player_info.name} (${runs[i].player_info.steamid})`
                        );
                    }
                }
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
                runs[i].outputFile = `${config.svr.recordingFolder}/${runs[i].demo_info.filename}_bonus${
                    runs[i].bonusNumber
                }_${runs[i].class === 3 ? "soldier" : "demoman"}_compressed.mp4`;
                bonusRuns.push(runs[i]);
            }

            playDemo(runs[0]);
        });
        return;
    }

    if (recent) {
        // Upload most recent runs
        var activity = await tempus.getActivity();
        runs = await getOverviews(activity.map_wrs);
    } else {
        // Upload all runs
        let mapList = await tempus.detailedMapList();
        runs = await getRuns(mapList);
    }

    // Sort by date
    runs.sort((a, b) => {
        if (a.demo_info.date < b.demo_info.date) return -1;
        if (a.demo_info.date > b.demo_info.date) return 1;
        return 0;
    });

    for (var i = runs.length - 1; i >= 0; i--) {
        if (Date.now() - runs[i].map.date_added * 1000 < 1000 * 60 * 60 * 24 * config.video.mapMinAge) {
            console.log(
                `Removing run newer than ${config.video.mapMinAge} days ${runs[i].map.name} (${
                    runs[i].class === 3 ? "Soldier" : "Demoman"
                })`
            );
            runs.splice(i, 1);
            continue;
        }

        if (runs[i].duration / 60 > config.video.maxDuration) {
            console.log(`Removing run too long ${runs[i].map.name} (${runs[i].class === 3 ? "Soldier" : "Demoman"})`);
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
                    console.log(
                        `Removing blacklisted ${runs[i].map.name} (${runs[i].class === 3 ? "Soldier" : "Demoman"})`
                    );
                    runs.splice(i, 1);
                    cont = true;
                    break;
                }
            }

            if (cont) continue;

            // Replace names
            for (var e = 0; e < nicknames.length; e++) {
                if (runs[i].player_info.steamid === nicknames[e].steamid) {
                    runs[i].player_info.name = nicknames[e].name;
                    break;
                }
            }
        }

        if (runs.length <= 0) {
            console.log("No new runs.");
            return;
        }

        playDemo(runs[0]);
    });
}

function skip() {
    for (var i = 0; i < runs.length - 1; i++) {
        if (runs[i] === currentDemo || currentDemo === null) {
            currentDemo = runs[i + 1];
            return playDemo(runs[i + 1]);
        }
    }
}

function isLastRun(demo) {
    return demo.id === runs[runs.length - 1].id;
}

function playDemo(demo) {
    if (!demo || !demo.player_info || !demo.demo_info) {
        return;
    }

    // Check for existing video if we crashed before, etc
    var video = `${config.svr.recordingFolder}/${demo.demo_info.filename}_${
        isBonusCollection ? "bonus" + demo.bonusNumber : "map"
    }_${demo.class === 3 ? "soldier" : "demoman"}.mp4`;
    var audio = `${config.svr.recordingFolder}/${demo.demo_info.filename}_${
        isBonusCollection ? "bonus" + demo.bonusNumber : "map"
    }_${demo.class === 3 ? "soldier" : "demoman"}.wav`;

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
    video = `${config.svr.recordingFolder}/${demo.demo_info.filename}_${
        isBonusCollection ? "bonus" + demo.bonusNumber : "map"
    }_${demo.class === 3 ? "soldier" : "demoman"}_compressed.mp4`;
    if (fs.existsSync(video)) {
        if (!isBonusCollection || isLastRun(demo)) {
            console.log(`WARNING: Uploading existing video '${video}'`);
            console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

            youtube.upload(video, demo);
        }

        skip();
        return;
    }

    if (demo.demo_info.recording === true || !demo.demo_info.url) {
        // Demo is still recording,
        // attemping to download will result in corrupt file.
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
                    console.log(`[DL] Demo file ${demo.demo_info.filename} exists already!`);
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
    // This cannot be done via rcon because the steamid needs quotes around it and source does not like that.

    // Check for old steamids
    var steamid = demo.player_info.steamid;
    for (var i = 0; i < old_steamids.length; i++) {
        if (old_steamids[i].current === demo.player_info.steamid && demo.demo_info.date < old_steamids[i].date) {
            steamid = old_steamids[i].old;
        }
    }

    // Write the .cfg
    fs.writeFile(config.tf2.path + "/cfg/tmps_records_spec_player.cfg", `spec_player "${steamid}"`, (err) => {
        if (err) {
            console.log("[FILE] Could not write tmps_records_spec_player.cfg!");
            console.log(err);

            return;
        }

        let commands = getPlayCommands(demo, false);

        // Write the play commands
        savePlayCommands(demo.demo_info.filename, commands, (success) => {
            if (success) {
                currentDemo = demo;

                // Record audio without SVR
                utils.launchTF2(`+playdemo ${demo.demo_info.filename}`);

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
    const startPadding = 200;
    const endPadding = 200;

    // Commands used to control the demo playback.
    // Executing tmps_records_* config files will trigger events in rcon.js.
    var commands = [
        {
            tick: 33,
            commands: `sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${
                demo.demo_start_tick - startPadding
            }; demo_setendtick ${demo.demo_end_tick + endPadding + 66}`,
        },
        {
            tick: demo.demo_start_tick - startPadding,
            commands: `exec tmps_records_spec_player; spec_mode 4; demo_resume; ${
                isVideo ? "" : "volume 0.1;"
            } rcon tmps_records_run_start; startmovie ${demo.demo_info.filename}_${
                isBonusCollection ? "bonus" + demo.bonusNumber : "map"
            }_${demo.class === 3 ? "soldier" : "demoman"}${isVideo ? ".mp4 tempus" : ".wav wav"}`,
        },
        { tick: demo.demo_start_tick, commands: `exec tmps_records_spec_player; spec_mode 4` }, // In case player dead before start_tick
        { tick: demo.demo_end_tick + endPadding - 33, commands: "rcon tmps_records_run_end" },
        { tick: demo.demo_end_tick + endPadding, commands: "volume 0; endmovie" },
    ];

    return commands;
}

// Get soldier and demo run overviews for a list of maps
async function getRuns(mapList) {
    var runs = [];

    for (var i = 0; i < mapList.length; i++) {
        console.log(`Getting map wrs ${i + 1}/${mapList.length}`);
        var map = mapList[i];

        if (!map) continue;

        var records = await tempus.mapRecords(map.name, "map", 1, 1, 1);
        var classRuns = [];
        if (records.soldier && records.soldier["0"]) {
            classRuns.push(records.soldier["0"]);
        }
        if (records.demoman && records.demoman["0"]) {
            classRuns.push(records.demoman["0"]);
        }

        for (let run of classRuns) {
            try {
                var overview = await run.toRecordOverview();
                overview.map = await overview.map.toMapOverview();
                runs.push(overview);
            } catch (err) {
                console.error(err);
            }
        }

        await utils.sleep(100);
    }

    return runs;
}

// Get soldier and demo bonus run overviews for a list of maps
async function getBonusRuns(mapList) {
    var runs = [];

    for (var i = 0; i < mapList.length; i++) {
        console.log(`Getting bonus wrs for map ${i + 1}/${mapList.length}`);
        var map = mapList[i];

        if (!map) continue;
        let mapOverview = await map.toMapOverview();

        for (var j = 1; j < map.zone_counts.bonus_end + 1; j++) {
            var records = await tempus.mapRecords(map.name, "bonus", j, 1, 1);
            var classRuns = [];
            if (records.soldier && records.soldier["0"]) {
                classRuns.push(records.soldier["0"]);
            }
            if (records.demoman && records.demoman["0"]) {
                classRuns.push(records.demoman["0"]);
            }

            for (let run of classRuns) {
                try {
                    var overview = await run.toRecordOverview();
                    overview.map = mapOverview;
                    overview.bonusNumber = j;
                    runs.push(overview);
                } catch (err) {
                    console.error(err);
                }
            }

            await utils.sleep(100);
        }
    }

    return runs;
}

// Get overviews for a list of records
async function getOverviews(recordList) {
    var runs = [];

    for (var i = 0; i < recordList.length; i++) {
        console.log(`Getting map wrs ${i + 1}/${recordList.length}`);
        var record = recordList[i];

        if (record == null) continue;

        try {
            var overview = await record.toRecordOverview();
            overview.map = await overview.map.toMapOverview();
            runs.push(overview);
        } catch (err) {
            console.error(err);
        }

        await utils.sleep(50);
    }

    return runs;
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
module.exports.getRuns = getRuns;
module.exports.init = init;
module.exports.skip = skip;
module.exports.getPlayCommands = getPlayCommands;
module.exports.savePlayCommands = savePlayCommands;
module.exports.isLastRun = isLastRun;
