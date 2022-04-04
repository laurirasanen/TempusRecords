const net = require("net"),
  fs = require("fs"),
  demo = require("./demo.js"),
  youtube = require("./youtube.js"),
  config = require("./data/config.json"),
  utils = require("./utils.js"),
  videojs = require("./video.js");

let recorded_runs = 0;

// Listen for PlayCommands
let srv = net.createServer(function (sock) {
  sock
    .on("data", function (data) {
      // Skipped via rcon
      if (data.toString().includes("tmps_records_skip")) {
        utils.killSVR();
        demo.skip();
        return;
      }

      // Run end
      if (data.toString().includes("tmps_records_run_end")) {
        console.log("[DEMO] RUN END");

        // Run in seperate scope to prevent currentRun change,
        // add a delay just to make sure SVR is done processing.
        setTimeout(
          (run) => {
            utils.killSVR();

            let filename = `${config.svr.recordingFolder}/${utils.recordingFilename(run)}`;

            // Compress
            videojs.compress(filename, filename.split(".mp4")[0] + ".wav", run, (result, name) => {
              // Upload final output
              if (result === true && (!isCollection || demo.isLastRun(run))) {
                // TODO: fix last run with multiple ffmpeg instances
                youtube.upload(name, run);
              }
            });

            // Limit number of recordings
            recorded_runs++;
            if (recorded_runs < config.youtube.video_limit || isCollection) {
              // Wait for previous process to be killed, avoid engine error
              setTimeout(() => {
                demo.skip();
              }, 2000);
            } else {
              console.log(`Finished recording ${config.youtube.video_limit} runs`);
            }
          },
          10000,
          currentRun
        );

        return;
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
