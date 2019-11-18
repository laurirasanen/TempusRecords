const net = require('net'),
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
                setTimeout(() =>
                {
                    utils.launchSDR(`+playdemo ${currentDemo.demo_info.filename}`);
                }, 1000);
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
