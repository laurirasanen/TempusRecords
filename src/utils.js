const exec = require("child_process").exec,
  tasklist = require("tasklist"),
  fs = require("fs-extra"),
  config = require("./data/config.json");

global.tf2Proc = null;
global.svrProc = null;

function launchSVR() {
  console.log("Launching SVR");

  let launchCmd = `"${config.svr.launch}" ${config.svr.args}`;

  svrProc = exec(launchCmd, { shell: true, cwd: config.svr.path }, (err) => {
    if (err && !err.killed) {
      console.log(err);
    }
  });
}

function launchTF2(args) {
  console.log("Launching TF2");

  let launchCmd = `"${config.tf2.launch}" ${config.tf2.args} ${args}`;

  tf2Proc = exec(launchCmd, (err) => {
    if (err && !err.killed) {
      console.log(err);
      // For some reason this fails occasionally for no obvious reason, retry
      setTimeout(() => {
        launchTF2(args);
      }, 5000);
    }
  });
}

function killSVR() {
  console.log(`Killing svr`);
  if (svrProc) {
    svrProc.kill("SIGTERM");
  }
  killTF2();
}

function killTF2() {
  console.log(`Killing tf2`);
  if (tf2Proc) {
    // kill() will only kill the parent cmd.exe process.
    tf2Proc.kill();
    tf2Proc = null;
  }
  // Killing just hl2.exe would work too, but then
  // the parent cmd.exe process would spew errors in launchTF2.
  tasklist().then((tasks) => {
    tasks.forEach((task) => {
      if (task.imageName == "hl2.exe") {
        process.kill(task.pid);
      }
    });
  });
}

function getLatestFile(directory, cb) {
  if (!cb || typeof cb !== "function") throw "callback is not a function";

  fs.readdir(directory, (err, list) => {
    if (err) {
      throw err;
    }

    var latest_time = 0;
    var latest = null;

    list.forEach((file) => {
      var stats = fs.statSync(directory + "/" + file);
      if (stats.mtimeMs > latest_time) {
        latest_time = stats.mtimeMs;
        latest = directory + "/" + file;
      }
    });

    return cb(latest);
  });
}

function secondsToTimeStamp(seconds, showPlusSign = false) {
  var sign = "";
  if (seconds < 0) {
    sign = "-";
  } else if (showPlusSign) {
    sign = "+";
  }
  seconds = Math.abs(seconds);

  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
  seconds = Math.floor(seconds % 60);

  var timeStamp = sign;

  if (hours > 0) {
    if (hours >= 10) timeStamp += hours + ":";
    else timeStamp += "0" + hours + ":";
  }

  if (minutes >= 10) timeStamp += minutes + ":";
  else timeStamp += "0" + minutes + ":";

  if (seconds >= 10) timeStamp += seconds + ".";
  else timeStamp += "0" + seconds + ".";

  if (milliseconds >= 100) timeStamp += milliseconds;
  else if (milliseconds >= 10) timeStamp += "0" + milliseconds;
  else timeStamp += "00" + milliseconds;

  return timeStamp;
}

function readJson(path, cb) {
  fs.readFile(path, (err, data) => {
    if (err) cb(err);
    else cb(null, JSON.parse(data));
  });
}

function writeJson(path, data, cb) {
  fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
    if (err) cb(err);
    else cb(null);
  });
}

function writeSVRProfile(quality, cb) {
  const profilePath = config.svr.path + "/data/profiles/tempus.json";
  readJson(profilePath, (err, data) => {
    if (err) {
      cb(err);
      return;
    }
    data["movie"]["video-fps"] = quality.fps;
    data["motion-blur"]["fps-mult"] = quality.sampling;
    writeJson(profilePath, data, cb);
  });
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function getAlphaFade(startTime, displayDuration, fadeInDuration, fadeOutDuration, maxAlpha) {
  let fadeInStart = startTime;
  let fadeInEnd = fadeInStart + fadeInDuration;
  let fadeOutStart = fadeInEnd + displayDuration;
  let fadeOutEnd = fadeOutStart + fadeOutDuration;
  return `
        min(
            ${maxAlpha},
            if(lt(t,${fadeInStart}),
                0,
                if(lt(t,${fadeInEnd}),
                    (t-${fadeInStart})*${maxAlpha},
                    if(lt(t,${fadeOutStart}),
                        ${maxAlpha},
                        if(lt(t,${fadeOutEnd}),
                            (${maxAlpha}-(t-${fadeOutStart}))*${maxAlpha}
                        )
                    )
                )
            )
        )                        
    `;
}

function backupConfig() {
  console.log("backing up user config...");
  const srcFolder = config.tf2.path;
  const dstFolder = config.svr.path + "/configs/user";

  if (!fs.existsSync(dstFolder)) {
    fs.mkdirSync(dstFolder);
  } else {
    // Something is already backed up.
    // Copy in case user runs the program twice without 'restore' param inbetween.
    // (overwrites user cfg with recording cfg from tf dir)
    const dateString = new Date(Date.now()).toISOString().replace(/\:/g, "_").replace(/\./g, "_");
    const dstExisting = dstFolder + "_" + dateString;
    console.log(`Copying existing backup ${dstFolder} --> ${dstExisting}`);
    fs.copySync(dstFolder, dstExisting, { overwrite: true });
  }

  copyConfig(srcFolder, dstFolder);
}

function applyConfig() {
  console.log("applying recording config...");
  const srcFolder = config.svr.path + "/configs/tempusrecords";
  const dstFolder = config.tf2.path;
  copyConfig(srcFolder, dstFolder);
}

function restoreConfig() {
  console.log("restoring user config...");
  const srcFolder = config.svr.path + "/configs/user";
  const dstFolder = config.tf2.path;
  copyConfig(srcFolder, dstFolder);
}

function copyConfig(srcFolder, dstFolder) {
  const folders = ["cfg", "custom"];

  folders.forEach((f) => {
    const from = srcFolder + "/" + f;
    const to = dstFolder + "/" + f;
    console.log(`Copying ${from} --> ${to}`);
    fs.copySync(from, to, { overwrite: true });
  });
}

module.exports.launchSVR = launchSVR;
module.exports.launchTF2 = launchTF2;
module.exports.killSVR = killSVR;
module.exports.killTF2 = killTF2;
module.exports.getLatestFile = getLatestFile;
module.exports.secondsToTimeStamp = secondsToTimeStamp;
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.writeSVRProfile = writeSVRProfile;
module.exports.sleep = sleep;
module.exports.getAlphaFade = getAlphaFade;
module.exports.backupConfig = backupConfig;
module.exports.restoreConfig = restoreConfig;
module.exports.applyConfig = applyConfig;
