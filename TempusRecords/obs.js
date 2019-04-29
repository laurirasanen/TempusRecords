const OBSWebSocket = require('obs-websocket-js'),
    obs = new OBSWebSocket(),
    utils = require('./utils.js'),
    fs = require('fs'),
    youtube = require('./youtube.js'),
    config = require('./config.json');

var connected = false;

function connect()
{
    obs.connect()
    .then(() =>
    {
        console.log('[OBS] Connected!');
        connected = true;
    })
    .catch(err =>
    {
        console.log('[OBS] Connection error! Retrying in 5 seconds.');
        console.log(err);
        connected = false;
    });
}

function init()
{
    obs.on('ConnectionOpened', (data) =>
    {
        console.log('[OBS] Connected!');
        connected = true;

        obs.send('SetRecordingFolder', { "rec-folder": config.obs.recording_folder })
            .catch(err =>
            {
                throw err;
            });
    })
    .on('ConnectionClosed', (data) =>
    {
        console.log('[OBS] Connection closed!');
        connected = false;
        setTimeout(() =>
        {
            obs.connect()
                .catch(err =>
                {
                    console.log('[OBS] Socket error!');
                    console.log(err);
                });
        }, 5000);
    })
    .on('AuthenticationFailure', (data) =>
    {
        console.log('[OBS] Authentication failed!');
    })
    .on('AuthenticationSuccess', (data) =>
    {
        console.log('[OBS] Authentication succeeded!');
    })
    .on('error', (err) =>
    {
        console.log('[OBS] Socket error!');
        console.log(err);
        });
}

function startRecording()
{
    obs.send('StopRecording', {})
        .then(() =>
        {
            console.log('[OBS] Stopped recording');
        })
        .catch(err =>
        {
            
        });

    obs.send('StartRecording', {})
        .then(() =>
        {
            console.log('[OBS] Started recording');
        })
        .catch(err =>
        {
            console.log('[OBS] Failed to start recording');
            console.log(err);
        });
}

function stopRecording(filename, demo, cb)
{
    obs.send('StopRecording', {})
        .then(() =>
        {
            console.log('[OBS] Stopped recording');

                // Rename latest recording
            var recording_folder = config.obs.recording_folder;

            obs.send('GetRecordingFolder').then((messageId, status, folder) =>
            {
                if (status == "ok")
                    recording_folder = folder;
            })
            .catch(err =>
            {
                console.log('Failed to get recording folder');
                console.log(err);
            });

            utils.getLatestFile(recording_folder, (file) =>
            {
                if (file === null)
                {
                    throw "latest file is null";
                }

                filename = recording_folder + '/' + filename;

                // Wait for obs to stop recording
                setTimeout(() =>
                {
                    fs.rename(file, filename, (err) =>
                    {
                        if (err) throw err;
                        console.log(`[OBS] Renamed '${file}' to '${filename}'`);

                        // Compress
                        youtube.compress(filename, (result, name) =>
                        {
                            // Upload compressed
                            if (result === true)
                            {
                                youtube.upload(name, demo);
                            }
                            return cb();
                        });
                    });
                }, 5000);                
            });            
        })
        .catch(err =>
        {
            console.log('[OBS] Failed to stop recording');
            console.log(err);
        });
}

module.exports.init = init;
module.exports.connect = connect;
module.exports.connected = connected;
module.exports.instance = obs;
module.exports.startRecording = startRecording;
module.exports.stopRecording = stopRecording;