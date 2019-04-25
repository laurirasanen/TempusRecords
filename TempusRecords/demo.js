const tempus = require('tempus-api'),
    downloader = require('./downloader.js'),
    rcon = require('./rcon.js'),
    obs = require('./obs.js'),
    fs = require('fs'),
    utils = require('./utils.js'),
    config = require('./config.json');

// Vice changed accounts at some point.
// All records in tempus api have his new steamid but the old demo files themselves don't.
// This breaks the spec_player "STEAMID" command.
var old_steamids = [
    { current: 'STEAM_0:0:203051360', old: 'STEAM_1:0:115234', date: 1523283653.81564 } // vice
],
    demo_load_timeout = 20000,
    runs = [];

global.currentDemo = null;

function init()
{
    getRuns((r) =>
    {
        runs = r;

        // Sort by date
        runs.sort((a, b) =>
        {
            if (a.demo_info.date < b.demo_info.date) return -1;
            if (a.demo_info.date > b.demo_info.date) return 1;
            return 0;
        });

        utils.readJson('./last_uploaded.json', (err, last_up) =>
        {
            if (err !== null)
            {
                console.log('Could not read last_uploaded.json');
                console.log(err);
                return;
            }

            // Remove older runs
            for (var i = runs.length - 1; i >= 0; i--)
            {
                if (runs[i].demo_info.date <= last_up.map)
                {
                    console.log(`Removing run older than last uploaded ${runs[i].demo_info.filename}`);
                    runs.splice(i, 1);                    
                }
            }

            if (runs.length <= 0)
            {
                console.log("No new runs.");
                return;
            }

            setTimeout(() =>
            {
                playDemo(runs[0]);
            }, 10000); 
        });           
    });
}

function skip()
{
    for (var i = 0; i < runs.length - 1; i++)
    {
        if (runs[i] === currentDemo || currentDemo === null)
        {
            return playDemo(runs[i + 1]);
        }
    }
}

function playDemo(demo)
{
    if (rcon.active)
        rcon.instance().send('volume 0');

    if (!demo || !demo.player_info || !demo.demo_info)
    {
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
            console.log('[FILE] Could not write tmps_records_spec_player.cfg!',);
            console.log(err);

            return;
        }

        var startPadding = 200,
            endPadding = 150;

        // Commands used to control the demo playback
        // rcon tmps_records_* commands will trigger events in rcon.js
        var commands = [
            { tick: 33, commands: `sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${demo.demo_start_tick - startPadding}; demo_setendtick ${demo.demo_end_tick + endPadding + 66}` },
            { tick: demo.demo_start_tick - startPadding, commands: `exec tmps_records_spec_player; spec_mode 4; demo_resume; volume 0.05; rcon tmps_records_run_start` },
            { tick: demo.demo_start_tick, commands: `exec tmps_records_spec_player; spec_mode 4` }, //in case player dead before start_tick
            { tick: demo.demo_end_tick + endPadding, commands: 'rcon tmps_records_run_end' }
        ];

        // Write the play commands
        savePlayCommands(demo.demo_info.filename, commands, (success) =>
        {
            if (success)
            {
                currentDemo = demo;
                rcon.instance().send(`stopdemo; mat_fullbright 0; volume 0; demo_gototick 0; playdemo ${demo.demo_info.filename}`);

                setTimeout(() =>
                {
                    // demo loading took too long
                    if (!rcon.demo_loaded)
                    {
                        return;
                    }

                }, demo_load_timeout);                
            }
            else
            {
                console.log('[FILE] FAILED TO WRITE PLAYCOMMANDS');
                return;
            }
        });
    });
}

// Get record runs from tempus
function getRuns(cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw 'callback is not a function';

    var runs = [];
    tempus.detailedMapList().then(list =>
    {
        for (var i = 0; i < list.length; i++)
        {
            setTimeout((list, i, runs) =>
            {
                console.log(`Getting map wrs ${i}/${list.length}`);
                var map = list[i];

                if (map.name !== null)
                {
                    tempus.mapWR(map.name, "s").then(x =>
                    {
                        if (x !== undefined)
                        {
                            x.toRecordOverview().then(wr =>
                            {
                                runs.push(wr);
                            })
                            .catch(err =>
                            {
                            console.log(err);
                            });
                        }                        
                    })
                    .catch(err =>
                    {
                        console.log(err);
                    });

                    tempus.mapWR(map.name, "d").then(x =>
                    {
                        if (x !== undefined)
                        {
                            x.toRecordOverview().then(wr =>
                            {
                                runs.push(wr);
                            })
                            .catch(err =>
                            {
                                console.log(err);
                            });
                        }
                    })
                    .catch(err =>
                    {
                        console.log(err);
                    });
                }

                if (i >= list.length - 1)
                {
                    return cb(runs);
                }

            }, i * 200, list, i, runs);
        }
    })
    .catch(err =>
    {
        console.log(err);
    });
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
