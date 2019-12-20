const net = require('net'),
    fs = require('fs'),
    tasklist = require('tasklist'),
    demo = require('./demo.js'),
    youtube = require('./youtube.js'),
    config = require('./config.json'),
    utils = require('./utils.js');

var recorded_runs = 0,
    finishedInstances = 0;

// Listen for play commands
var srv = net.createServer(function (sock)
{
    sock.on('data', function (data)
    {
        if (data.toString().includes('tmps_records_run_end'))
        {
            console.log('[DEMO] RUN END');
            finishedInstances++;

            if (finishedInstances === 1)
            {
                // Just finished running SDR audio instance,
                // start video instance.

                // Wait a bit to ensure previous instance has exited
                setTimeout((demoObj) =>
                {
                    // Use listenserver.cfg to load picmip-plugin
                    var listenConfig = 'sv_allow_wait_command 1\n'
                        + 'meta load addons/picmip; wait 100; picmip set -10; '
                        + `wait 100; playdemo ${demoObj.demo_info.filename}; `
                        // starting a listen server does some weird shit with rcon,
                        // need to change rcon_address to something else and back again..
                        + `rcon_address 0.0.0.0:0; rcon_address ${config.rcon.listen_address}:${config.rcon.listen_port}`;

                    fs.writeFile(config.tf2.path + '/cfg/listenserver.cfg', listenConfig, (err) =>
                    {
                        if (err)
                        {
                            console.log('[FILE] Could not write listenserver.cfg!');
                            console.log(err);

                            return;
                        }

                        utils.launchSDR('+map itemtest');
                    });

                }, 1000, currentDemo);
                return;
            }
            else if (finishedInstances > 1)
            {
                // run in seperate scope to prevent currentDemo change,
                // add 5 sec delay just to make sure SDR is done processing
                setTimeout((demoObj) =>
                {
                    // sdr_endmoviequit 1 will throw 'FCVAR_CLIENTCMD_CAN_EXECUTE prevented running command: quit'
                    // in TF2. demo_quitafterplayback 1 doesn't seem to work either with SDR.
                    // Kill TF2 and LauncherCLI to prevent them building up
                    tasklist().then(tasks => 
                    {
                        tasks.forEach((task) => 
                        {
                            if (task.imageName == "hl2.exe" || task.imageName == "LauncherCLI.exe")
                            {
                                process.kill(task.pid);
                            }
                        });
                    });


                    var filename = `${config.sdr.recording_folder}/${demoObj.demo_info.filename}_${demoObj.class === 3 ? "soldier" : "demoman"}.avi`;

                    // Compress
                    youtube.compress(filename, (result, name) =>
                    {
                        if (result === true)
                        {
                            // Compressed, remux audio
                            youtube.remux(name, `${filename.split(".avi")[0]}.wav`, `${filename.split(".avi")[0]}_remuxed.mp4`, (result, name) =>
                            {
                                // Upload final output
                                if (result === true)
                                {
                                    youtube.upload(name, demoObj);
                                }
                            });
                        }
                    });

                    // Limit number of recordings
                    recorded_runs++;
                    if (recorded_runs < config.youtube.video_limit)
                    {
                        finishedInstances = 0;
                        demo.skip();
                    }
                    else
                    {
                        console.log(`Finished recording ${config.youtube.video_limit} runs`);
                    }

                }, 5000, currentDemo);
            }

            return;
        }
        else if (data.toString().includes('tmps_records_skip'))
        {
            tasklist().then(tasks => 
            {
                tasks.forEach((task) => 
                {
                    if (task.imageName == "hl2.exe" || task.imageName == "LauncherCLI.exe")
                    {
                        process.kill(task.pid);
                    }
                });

                demo.skip();
            });
        }
    })
        .on('error', (err) =>
        {
            console.log(err);
        });
});

function init()
{
    srv.listen(config.rcon.listen_port, config.rcon.listen_address);
}

module.exports.init = init;
