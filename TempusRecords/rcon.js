const rcon = require('rcon'),
    net = require('net'),
    demo = require('./demo.js'),
    obs = require('./obs.js'),
    utils = require('./utils.js'),
    config = require('./config.json');

var restarting = false,
    active = false,
    conn,
    demo_loaded = false,
    demo_playback = false,
    recorded_runs = 0;

// Listen for play commands
var srv = net.createServer(function (sock)
{
    sock.on('data', function (data)
    {
        if (data.toString().includes('tmps_records_demo_load'))
        {
            console.log('[DEMO] LOADED');
            demo_loaded = true;

            if (currentDemo === undefined) demo.skip();

            runStartTimeout = 5000 + currentDemo.demo_start_tick / 25;

            setTimeout(() =>
            {
                // demo loading took too long
                if (!demo_playback && demo_loaded)
                {
                    console.log(`[DEMO] Playing ${currentDemo.demo_info.filename} timed out, skipping!`);

                    demo.skip();
                    return;
                }

            }, runStartTimeout);
            return;
        }

        if (data.toString().includes('tmps_records_run_start') && demo_loaded)
        {
            console.log('[DEMO] RUN START');
            demo_playback = true;

            // Start OBS recording
            obs.startRecording();

            return;
        }

        if (data.toString().includes('tmps_records_run_end') && demo_playback)
        {
            console.log('[DEMO] RUN END');

            // End OBS recording
            obs.stopRecording(currentDemo.demo_info.filename, currentDemo);

            // Wait a bit for obs to stop recording
            setTimeout(() =>
            {
                demo_playback = false;
                demo_loaded = false;
                conn.send('volume 0'); 

                // Limit number of recordings
                recorded_runs++;
                if (recorded_runs < config.youtube.video_limit)
                {
                    demo.skip();
                }
                else
                {
                    console.log(`Finished recording ${config.youtube.video_limit} runs`);
                }                               
            }, 2000);

            return;
        }
    })
    .on('error', (err) =>
    {
        console.log(err);
    });
});

srv.listen(config.rcon.listen_port, config.rcon.listen_address);

function init()
{
    console.log(config.rcon.address + ':' + config.rcon.port + ':' + config.rcon.password);
    conn = new rcon(config.rcon.address, config.rcon.port, config.rcon.password);

    conn.on('auth', () =>
    {
        console.log('[RCON] Authenticated!');
        conn.send('disconnect; exec cinema; volume 0; rcon_address 127.0.0.1:3002');
        active = true;
        if (restarting)
        {
            restarting = false;
            demo.playDemo(currentDemo);
        }

    }).on('response', (str) =>
    {
        if (str.length === 0)
        {
            // For some reason auth doesn't get called again when restarting TF2 so start playback here after restart
            if (restarting)
            {
                console.log('[RCON] Authenticated!');
                conn.send('disconnect; exec cinema; volume 0; rcon_address 127.0.0.1:3002');
                active = true;
                restarting = false;
                demo.playDemo(currentDemo);
            }

            console.log('[RCON] Received empty response');
            return;
        }
        console.log('[RCON] Received response: ' + str);

    }).on('end', () =>
    {
        console.log('[RCON] Socket closed!');
        active = false;

    }).on('error', (err) =>
    {
        active = false;
        if (err.code === 'ECONNREFUSED')
        {
            console.log(`[RCON] Could not connect to ${conn.host}:${conn.port}!`);
            setTimeout(() =>
            {
                conn.connect();
            }, 5000);
        }
        else if (err.code === 'ECONNRESET')
        {
            console.log('[RCON] Connection reset!');

            restartTF2();
        }
        else if (err.code === 'EPIPE')
        {
            console.log('[RCON] Socket closed by other party!',);

            restartTF2();
        }
        else
        {
            console.log('[RCON] Encountered unhandled error!');
            console.log(err);

            restartTF2();
        }
    });
    try
    {
        conn.connect();
    }
    catch (err)
    {
        console.log('[RCON] Socket closed!');
        console.log(err);

        restartTF2();
    }
}

// Restart tf2 if rcon socket encounters an error.
// This *should* only happen if tf2 crashes.
// This will not get called if you type 'exit' in console.
function restartTF2()
{
    // start tf2 again and restart same demo
    utils.startTF2();
    restarting = true;

    setTimeout(() =>
    {
        conn.connect();
    }, 5000);
}

function instance()
{
    return conn;
}

module.exports.init = init;
module.exports.instance = instance;
module.exports.active = active;