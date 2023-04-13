﻿let http = require("http"),
  https = require("https"),
  fs = require("fs"),
  unzipper = require("unzipper"),
  bz2 = require("unbzip2-stream"),
  demo = require("./demo.js"),
  config = require("./data/config.json");

// Download demo file from AWS
function getDemoFile(run, cb) {
  console.log(`getDemoFile ${run.demo.filename}`);

  if (!cb || typeof cb !== "function") throw "callback is not a function";

  if (!run.demo.url) {
    return cb(null);
  }

  let dest = config.tf2.path + run.demo.filename + ".dem";

  fs.open(dest, "wx", (err, fd) => {
    if (fd) {
      fs.close(fd, (err) => {
        if (err) {
          console.log("[DL] Failed to close demoFile handle");
          console.log(err);
        }
      });
    }

    if (err) {
      if (err.code === "EEXIST" || err.code === "EPERM") {
        // already exists
        return cb(false);
      } else {
        console.log(`[DL] Error opening file ${dest}!`);
        console.log(err);
        return cb(null);
      }
    } else {
      let stream = fs.createWriteStream(dest);

      download(run.demo.url, run, (resp, run) => {
        resp
          .pipe(unzipper.Parse())
          .on("entry", (entry) => {
            entry.pipe(stream);
            stream
              .on("finish", () => {
                stream.close(() => {
                  console.log(`[DL] Downloaded demo ${run.demo.filename}`);
                  return cb(true);
                });
              })
              .on("error", (err) => {
                console.log("[DL] Piping to file failed!");
                console.log(err);

                stream.close(() => {
                  fs.unlink(dest, (err) => {
                    if (err) console.log(`Failed to unlink bad demo ${dest}`);
                    else console.log(`Unlinked bad demo ${dest}`);
                  });
                });

                return cb(null);
              });
          })
          .on("error", (err) => {
            console.log(`[DL] unzip failed!`);
            console.log(err);

            stream.close(() => {
              fs.unlink(dest, (err) => {
                if (err) console.log(`Failed to unlink bad demo ${dest}`);
                else console.log(`Unlinked bad demo ${dest}`);
              });
            });

            return cb(null);
          });
      });
    }
  });
}

// Download map file from http://tempus.site.nfoservers.com/server/maps/
function getMap(mapName, cb) {
  console.log(`getMap ${mapName}`);

  if (!cb || typeof cb !== "function") throw "callback is not a function";

  let dest = config.tf2.path + `download/maps/${mapName}.bsp`;

  fs.open(dest, "wx", (err, fd) => {
    if (fd) {
      fs.close(fd, (err) => {
        if (err) {
          console.log("[DL] Failed to close map handle");
          console.log(err);
        }
      });
    }

    if (err) {
      if (err.code === "EEXIST" || err.code === "EPERM") {
        // already exists
        return cb(false);
      } else {
        console.log(`[DL] Error opening map ${dest}!`);
        console.log(err);
        return cb(null);
      }
    } else {
      let stream = fs.createWriteStream(config.tf2.path + `download/maps/${mapName}.bsp`);
      // let mapUrl = `http://tempus.site.nfoservers.com/server/maps/${mapName}.bsp.bz2`;
      let mapUrl = `https://static.tempus2.xyz/tempus/server/maps/${mapName}.bsp.bz2`;

      download(mapUrl, currentRun, (resp, run) => {
        resp
          .pipe(
            bz2().on("error", (err) => {
              console.log("[TEMPUS] bz2 failed");
              console.log(err);

              stream.close(() => {
                fs.unlink(dest, (err) => {
                  if (err) console.log(`Failed to unlink bad map ${dest}`);
                  else console.log(`Unlinked bad map ${dest}`);
                });
              });

              return;
            })
          )
          .pipe(stream);
        stream
          .on("finish", () => {
            stream.close(() => {
              console.log(`[DL] Downloaded map ${mapName}`);
              return cb(true);
            });
          })
          .on("error", (err) => {
            console.log("[DL] Piping to file failed!");
            console.log(err);

            stream.close(() => {
              fs.unlink(dest, (err) => {
                if (err) console.log(`Failed to unlink bad map ${dest}`);
                else console.log(`Unlinked bad map ${dest}`);
              });
            });

            return cb(null);
          });
      });
    }
  });
}

function download(url, run, callback) {
  let protocol = url.startsWith("https") ? https : http;

  protocol
    .get(url, (response) => {
      callback(response, run);
    })
    .on("error", (err) => {
      console.log("[DL] Error downloading");
      console.log(err.message);
      demo.skip();
    });
}

module.exports.getDemoFile = getDemoFile;
module.exports.getMap = getMap;
