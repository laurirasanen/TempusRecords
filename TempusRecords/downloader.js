var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    unzip = require('unzip'),
    bz2 = require('unbzip2-stream'),
    models = require('../../DemoTools/fix_models.js'),
    demo = require('./demo.js'),
    config = require('./config.json');

// Download demo file from AWS
function getDemoFile(demo, cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw ('callback is not a function');

    var dest = config.tf2.path + demo.demo_info.filename + '.dem';

    fs.open(dest, 'wx', (err, fd) =>
    {
        if (fd)
        {
            fs.close(fd, (err) =>
            {
                if (err)
                {
                    console.log('[DL] Failed to close demoFile handle');
                    console.log(JSON.stringify(err));
                }
            });
        }

        if (err)
        {
            if (err.code === 'EEXIST' || err.code === 'EPERM')
            {
                // already exists
                return cb(false);
            }
            else
            {
                console.log(`[DL] Error opening file ${dest}!`);
                console.log(JSON.stringify(err));
                return cb(null);
            }
        }
        else
        {

            var stream = fs.createWriteStream(dest);

            download(demo.demo_info.url, false, demo, (resp, demo) =>
            {
                resp.pipe(unzip.Parse())
                    .on('entry', (entry) =>
                    {
                        entry.pipe(stream);
                        stream.on('finish', () =>
                        {
                            stream.close(() =>
                            {
                                console.log(`[DL] Downloaded demo ${demo.demo_info.filename}`);

                                // jungle inferno date 2017-10-20, 1508544000 = 2017-10-21
                                // boshy and kaptain are pretty much only people with original wrs before jungle inferno
                                // un gato has cheval wr with mangler
                                if (demo.demo_info.date < 1508544000 && demo.class == 3 &&
                                    ((demo.player_info.steamid == 'STEAM_0:0:43167835' || demo.player_info.steamid == 'STEAM_0:0:36730682') ||
                                        demo.player_info.steamid == 'STEAM_0:1:53042796' && (demo.demo_info.mapname == 'jump_cheval' || demo.demo_info.mapname == 'jump_arctic_a2')))
                                {

                                    // return true regardless of the fix being succesful
                                    // playing the demo is more important than having working viewmodels
                                    models.fixModels(dest, dest, (err) =>
                                    {
                                        if (err)
                                        {
                                            console.log(`[DEMOTOOLS] Error fixing viewmodels in ${demo.demo_info.filename}`);
                                            console.log(JSON.stringify(err), log);
                                            return cb(true);
                                        }

                                        console.log(`[DEMOTOOLS] Fixed viewmodels in ${demo.demo_info.filename}`);
                                        return cb(true);
                                    });
                                }
                                else
                                    return cb(true);
                            });

                        }).on('error', (err) =>
                        {
                            stream.close(() => { });
                            console.log('[DL] Piping to file failed!');
                            console.log(JSON.stringify(err));
                            return cb(null);
                        });

                    }).on('error', (err) =>
                    {
                        stream.close(() => { });
                        console.log(`[DL] unzip failed!`);
                        console.log(JSON.stringify(err));
                        return cb(null);
                    });
            });
        }
    });
}

// Download map file from http://tempus.site.nfoservers.com/server/maps/
function getMap(mapName, cb)
{
    if (!cb || typeof (cb) !== 'function')
        throw ('callback is not a function');

    var dest = config.tf2.path + `download/maps/${mapName}.bsp`;

    fs.open(dest, 'wx', (err, fd) =>
    {
        if (fd)
        {
            fs.close(fd, (err) =>
            {
                if (err)
                {
                    console.log('[DL] Failed to close map handle');
                    console.log(JSON.stringify(err));
                }
            });
        }

        if (err)
        {
            if (err.code === 'EEXIST' || err.code === 'EPERM')
            {
                // already exists
                return cb(false);
            }
            else
            {
                console.log(`[DL] Error opening map ${dest}!`);
                console.log(JSON.stringify(err));
                return cb(null);
            }
        }
        else
        {

            var stream = fs.createWriteStream(config.tf2.path + `download/maps/${mapName}.bsp`);
            var mapUrl = `http://tempus.site.nfoservers.com/server/maps/${mapName}.bsp.bz2`;

            download(mapUrl, true, currentDemo, (resp, demo) =>
            {

                resp.pipe(bz2()
                    .on('error', (err) =>
                    {
                        stream.close(() => { });
                        console.log('[TEMPUS] bz2 failed');
                        console.log(JSON.stringify(err));
                        return;
                    })
                ).pipe(stream);
                stream.on('finish', () =>
                {
                    stream.close(() =>
                    {
                        console.log(`[DL] Downloaded map ${mapName}`);
                        return cb(true);
                    });

                }).on('error', (err) =>
                {
                    stream.close(() => { });
                    console.log('[DL] Piping to file failed!');
                    console.log(JSON.stringify(err));
                    return cb(null);
                });
            });
        }
    });
}

function download(url, map, demo, callback)
{
    var request = http.get(url, function (response)
    {
        var data;

        response.on("data", function (chunk)
        {
            data += chunk;
        });

        request.on("error", function (e)
        {
            console.log('[DL] Error downloading');
            console.log(e.message);
            demo.skip();
        });

        response.on("error", function (e)
        {
            console.log('[DL] Error downloading');
            console.log(e.message);
            demo.skip();
        });

        callback(response, demo);
    })
    .on('error', (err) =>
    {
        console.log('[DL] Error downloading');
        console.log(err.message);
        demo.skip();
    });
};

module.exports.getDemoFile = getDemoFile;
module.exports.getMap = getMap;