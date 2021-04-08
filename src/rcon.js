const net = require("net"),
  fs = require("fs"),
  demo = require("./demo.js"),
  youtube = require("./youtube.js"),
  config = require("./data/config.json"),
  utils = require("./utils.js");

var recorded_runs = 0,
  finishedInstances = 0;

// Listen for PlayCommands
var srv = net.createServer(function (sock) {
  sock
    .on("data", function (data) {
      if (data.toString().includes("tmps_records_run_end")) {
        console.log("[DEMO] RUN END");
        finishedInstances++;

        if (finishedInstances === 1) {
          // Just finished running recording audio,
          // start SVR for recording video.

          // Wait a bit to ensure audio file is done
          setTimeout(
            (run) => {
              utils.killTF2();

              // Wait a bit to ensure previous instance has exited
              setTimeout(
                (run) => {
                  // TODO: move this to a util function, check for cross-device

                  // Move audio file to svr directory.
                  // fs.rename will throw EXDEV: cross-device link not permitted,
                  // copy and unlink old file instead.
                  try {
                    fs.copyFileSync(
                      `${config.tf2.path}/${utils.recordingFilename(run, true)}`,
                      `${config.svr.recordingFolder}/${utils.recordingFilename(run, true)}`
                    );
                    fs.unlinkSync(`${config.tf2.path}/${utils.recordingFilename(run, true)}`);
                  } catch (err) {
                    console.log("[FILE] Could not movie audio file!");
                    console.error(err);
                    return;
                  }

                  // TODO: remove, not using addons anymore

                  // Use listenserver.cfg to load picmip-plugin.
                  // SVR launch options will load itemtest map so we can use metamod.
                  var listenConfig =
                    "sv_allow_wait_command 1\n" +
                    "meta load addons/picmip; wait 100; picmip set -10; " +
                    `wait 100; playdemo ${run.demo.filename}; ` +
                    // Starting a listen server does some weird shit with rcon,
                    // need to change rcon_address to something else and back again..
                    `rcon_address 0.0.0.0:0; rcon_address ${config.rcon.listenAddress}:${config.rcon.listenPort}`;

                  fs.writeFile(config.tf2.path + "/cfg/listenserver.cfg", listenConfig, (err) => {
                    if (err) {
                      console.log("[FILE] Could not write listenserver.cfg!");
                      console.log(err);

                      return;
                    }

                    // Write PlayerCommands for controlling the demo
                    let commands = demo.getPlayCommands(run, true);
                    demo.savePlayCommands(run.demo.filename, commands, (success) => {
                      if (success) {
                        return utils.launchSVR();
                      }

                      console.log("[FILE] Failed to write PlayCommands!");
                    });
                  });
                },
                2000,
                run
              );
            },
            2000,
            currentRun
          );

          return;
        } else if (finishedInstances > 1) {
          // Run in seperate scope to prevent currentRun change,
          // add a delay just to make sure SVR is done processing.
          setTimeout(
            (run) => {
              utils.killSVR();

              var filename = `${config.svr.recordingFolder}/${utils.recordingFilename(run)}`;

              // Compress
              youtube.compress(filename, `${filename.split(".mp4")[0]}.wav`, run, (result, name) => {
                // Upload final output
                if (result === true && (!isCollection || demo.isLastRun(run))) {
                  youtube.upload(name, run);
                }
              });

              // Limit number of recordings
              recorded_runs++;
              if (recorded_runs < config.youtube.video_limit || isCollection) {
                finishedInstances = 0;
                demo.skip();
              } else {
                console.log(`Finished recording ${config.youtube.video_limit} runs`);
              }
            },
            10000,
            currentRun
          );
        }

        return;
      } else if (data.toString().includes("tmps_records_skip")) {
        utils.killSVR();
        demo.skip();
      }
    })
    .on("error", (err) => {
      console.log(err);
    });
});

function init() {
  srv.listen(config.rcon.listenPort, config.rcon.listenAddress);
}

module.exports.init = init;
