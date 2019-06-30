﻿const net = require('net'),
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
                    var filename = `${config.sdr.recording_folder}/${demoObj.demo_info.filename}.mp4`;

                    // Compress
                    youtube.compress(filename, (result, name) =>
                    {
                        if (result === true)
                        {
                            // Compressed, remux audio
                            // Assume audio recording has already finished,
                            // it should be significantly faster than the video, unless it fails..
                            youtube.remux(name, `${filename.split(".mp4")[0]}.wav`, `${filename.split(".mp4")[0]}_remuxed.mp4`, (result, name) =>
                            {
                                // Upload final output
                                if (result === true)
                                {
                                    youtube.upload(name, demoObj);

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
                                }
                            });
                        }
                    });
                }, 5000, currentDemo);
            }

            return;
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
