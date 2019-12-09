const tempus = require('tempus-api'),
    downloader = require('./downloader.js'),
    rcon = require('./rcon.js'),
    fs = require('fs'),
    utils = require('./utils.js'),
    config = require('./config.json'),
    nicknames = require('./nicknames.json'),
    blacklist = require('./blacklist.json'),
    youtube = require('./youtube.js');

// Vice changed accounts at some point.
// All records in tempus api have his new steamid but the old demo files themselves don't.
// This breaks the spec_player "STEAMID" command.
var old_steamids = [
    { current: 'STEAM_0:0:203051360', old: 'STEAM_1:0:115234', date: 1523283653.81564 } // vice
],
    runs = [];

global.currentDemo = null;

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function init(recent)
{
    var mapList = [];
    if (recent)
    {
        var activity = await tempus.getActivity();
        runs = await getOverviews(activity.map_wrs);
    }
    else
    {
        mapList = await tempus.detailedMapList();
        runs = await getRuns(mapList);
    }

    // Sort by date
    runs.sort((a, b) =>
    {
        if (a.demo_info.date < b.demo_info.date) return -1;
        if (a.demo_info.date > b.demo_info.date) return 1;
        return 0;
    });

    for (var i = runs.length - 1; i >= 0; i--)
    {
        if (Date.now() - runs[i].map.date_added * 1000 < (1000 * 60 * 60 * 24 * 7))
        {
            console.log(`Removing run for map newer than 1 week ${runs[i].map.name} (${runs[i].class === 3 ? "Soldier" : "Demoman"})`);
            runs.splice(i, 1);
            continue;
        }
    }

    utils.readJson('./uploaded.json', (err, uploaded) =>
    {
        if (err !== null)
        {
            console.log('Could not read uploaded.json');
            console.log(err);
            return;
        }

        // Remove already uploaded runs
        for (var i = runs.length - 1; i >= 0; i--)
        {
            if (uploaded.maps.includes(runs[i].id))
            {
                runs.splice(i, 1);
                continue;
            }

            // Remove blacklisted runs
            var cont = false;
            for (var e = 0; e < blacklist.length; e++)
            {
                if (blacklist[e].name === runs[i].map.name
                    && blacklist[e].class === runs[i].class)
                {
                    console.log(`Removing blacklisted ${runs[i].map.name} (${runs[i].class === 3 ? "Soldier" : "Demoman"})`);
                    runs.splice(i, 1);
                    cont = true;
                    break;
                }
            }

            if (cont) continue;

            // Replace names
            for (var e = 0; e < nicknames.length; e++)
            {
                if (runs[i].player_info.steamid === nicknames[e].steamid)
                {
                    runs[i].player_info.name = nicknames[e].name;
                    break;
                }
            }
        }

        if (runs.length <= 0)
        {
            console.log("No new runs.");
            return;
        }

        playDemo(runs[0]);
    });
}

function skip()
{
    for (var i = 0; i < runs.length - 1; i++)
    {
        if (runs[i] === currentDemo || currentDemo === null)
        {
            currentDemo = runs[i + 1];
            return playDemo(runs[i + 1]);
        }
    }
}

function playDemo(demo)
{
    if (!demo || !demo.player_info || !demo.demo_info)
    {
        return;
    }

    // Check for existing video
    // if we crashed before, etc..
    var video = `${config.sdr.recording_folder}/${demo.demo_info.filename}_${demo.class === 3 ? "soldier" : "demoman"}.avi`;
    var audio = `${config.sdr.recording_folder}/${demo.demo_info.filename}_${demo.class === 3 ? "soldier" : "demoman"}.wav`;

    if (fs.existsSync(video) && fs.existsSync(audio))
    {
        console.log(`WARNING: Uploading existing video '${video}'`);
        console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

        // Compress
        youtube.compress(video, (result, name) =>
        {
            if (result === true)
            {
                // Compressed, remux audio
                youtube.remux(name, audio, `${video.split(".avi")[0]}_remuxed.mp4`, (result, name) =>
                {
                    // Upload final output
                    if (result === true)
                    {
                        youtube.upload(name, demo);
                    }
                });
            }
        });

        skip();
        return;
    }

    // Check for already compressed and remuxed version
    video = `${config.sdr.recording_folder}/${demo.demo_info.filename}_${demo.class === 3 ? "soldier" : "demoman"}_remuxed.mp4`;
    if (fs.existsSync(video))
    {
        console.log(`WARNING: Uploading existing video '${video}'`);
        console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

        youtube.upload(video, demo);
        skip();
        return;
    }

    // Get map file
    downloader.getMap(demo.map.name, (res) =>
    {
        if (res !== null)
        {
            // Get demo file
            downloader.getDemoFile(demo, (result) =>
            {
                if (result === null)
                {
                    console.log('[DL] Error getting demo');
                    skip();
                    return;
                }
                else if (result === false)
                {
                    console.log(`[DL] Demo file ${demo.demo_info.filename} exists already!`);
                }

                startDemo(demo);
            });
        }
        else
        {
            return;
        }
    });
}

function startDemo(demo)
{
    // Create a tmps_records_spec_player.cfg, which will get executed when the demo loads.
    // The config just contains a 'spec_player "STEAMID"' command.
    // This cannot be done via rcon because the steamid needs quotes around it and source does not like that.

    // Check for old steamids (vice)
    var steamid = demo.player_info.steamid;
    for (var i = 0; i < old_steamids.length; i++)
    {
        if (old_steamids[i].current === demo.player_info.steamid && demo.demo_info.date < old_steamids[i].date)
        {
            steamid = old_steamids[i].old;
        }
    }

    // Write the .cfg
    fs.writeFile(config.tf2.path + '/cfg/tmps_records_spec_player.cfg', `spec_player "${steamid}"`, (err) =>
    {
        if (err)
        {
            console.log('[FILE] Could not write tmps_records_spec_player.cfg!');
            console.log(err);

            return;
        }

        var startPadding = 200,
            endPadding = 150;

        // Commands used to control the demo playback
        // rcon tmps_records_* commands will trigger events in rcon.js
        var commands = [
            { tick: 33, commands: `sdr_outputdir ${config.sdr.recording_folder}; sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${demo.demo_start_tick - startPadding}; demo_setendtick ${demo.demo_end_tick + endPadding + 66}` },
            { tick: demo.demo_start_tick - startPadding, commands: `exec tmps_records_spec_player; spec_mode 4; demo_resume; volume 0.1; rcon tmps_records_run_start; startmovie ${demo.demo_info.filename}_${demo.class === 3 ? "soldier" : "demoman"}.avi` },
            { tick: demo.demo_start_tick, commands: `exec tmps_records_spec_player; spec_mode 4` }, //in case player dead before start_tick
            { tick: demo.demo_end_tick + endPadding - 33, commands: 'rcon tmps_records_run_end' }, //send rcon before endmovie, SDR will quit after processing finishes
            { tick: demo.demo_end_tick + endPadding, commands: 'volume 0; endmovie' }
        ];

        // Write the play commands
        savePlayCommands(demo.demo_info.filename, commands, (success) =>
        {
            if (success)
            {
                currentDemo = demo;

                // Record audio
                utils.launchSDR(`+sdr_audio_only 1 +sdr_audio_disable_video 0 +playdemo ${demo.demo_info.filename}`);

                // NOTE:
                // Turns out PlayCommands are not registered with 'sdr_audio_disable_video' set to 1.
                // Therefore it needs to be set to 0 for 'endmovie' to ever be registered,
                // and the audio file to be closed.
                // Starting another instance of SDR to record video will cause the audio instance
                // to stop playing back video for whatever reason.
                // This is equivalent to setting `sdr_audio_disable_video` to 1...
                // Meaning we cannot record audio and video simulatenously,
                // even with SDR MultiProcess extension enabled.
                // Video will be recorded after audio finishes,
                // in rcon.js, when tmps_records_run_end gets called the first time.
                // The second time, video will be compressed, remuxed together with audio and uploaded.
            }
            else
            {
                console.log('[FILE] FAILED TO WRITE PLAYCOMMANDS');
                return;
            }
        });
    });
}

// Get runs for a list of maps
async function getRuns(mapList)
{
    var runs = [];

    for (var i = 0; i < mapList.length; i++)
    {
        console.log(`Getting map wrs ${i + 1}/${mapList.length}`);
        var map = mapList[i];

        if (map.name == null)
            continue;

        var swr = await tempus.mapWR(map.name, "s");
        if (swr != null)
        {
            var overview = await swr.toRecordOverview();
            overview.map = await overview.map.toMapOverview();
            runs.push(overview);
        }

        await sleep(50);

        var dwr = await tempus.mapWR(map.name, "d");
        if (dwr != null)
        {
            var overview = await dwr.toRecordOverview();
            overview.map = await overview.map.toMapOverview();
            runs.push(overview);
        }

        await sleep(50);
    }

    return runs;
}

async function getOverviews(recordList)
{
    var runs = [];

    for (var i = 0; i < recordList.length; i++)
    {
        console.log(`Getting map wrs ${i + 1}/${recordList.length}`);
        var record = recordList[i];

        if (record == null)
            continue;

        var overview = await record.toRecordOverview();
        overview.map = await overview.map.toMapOverview();
        runs.push(overview);

        await sleep(50);
    }

    return runs;
}

// Save play commands to control the demo playback
function savePlayCommands(filename, commands, cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw ('callback is not a function');

    var data = `demoactions\n{\n`;

    for (var i = 0; i < commands.length; i++)
    {
        data +=
            `   "${i + 1}"\n` +
            '   {\n' +
            '       factory "PlayCommands"\n' +
            `       name "tmps_records${i + 1}"\n` +
            `       starttick "${commands[i].tick}"\n` +
            `       commands "${commands[i].commands}"\n` +
            '   }\n';
    }

    data += '\n}'

    fs.writeFile(config.tf2.path + filename + '.vdm', data, {}, (err) =>
    {
        if (err)
        {
            console.log('[FILE] Error saving PlayCommands!');
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
