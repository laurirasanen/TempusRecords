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

function writeSVRConfigs(quality, cb) {
  writeSVRProfile(quality, () => {
    writeSVRLauncherConfig(quality, cb);
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

function writeSVRLauncherConfig(quality, cb) {
  const configPath = config.svr.path + "/data/launcher-config.json";
  readJson(configPath, (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    const index = data.games.findIndex((game) => game.id === "tf2-win");
    if (index < 0) {
      throw `Could not find tf2-win in ${configPath}`;
    }

    data.games[index].args = data.games[index].args.split(/-w [0-9]/g)[0];
    data.games[index].args += "-w " + quality.recordingRes.split("x")[0];
    data.games[index].args += " -h " + quality.recordingRes.split("x")[1];

    writeJson(configPath, data, cb);
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
  // TODO: how does this work? should've added comments when i made this
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

    if (!fs.existsSync(from)) return;

    console.log(`Copying ${from} --> ${to}`);
    if (fs.existsSync(to)) {
      fs.rmSync(to, { recursive: true });
    }
    fs.copySync(from, to);
  });
}

function isProcessRunning(proc) {
  return new Promise(function (resolve, reject) {
    if (proc === "") {
      resolve(false);
    }
    exec("tasklist", (err, stdout, stderr) => {
      resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1);
    });
  });
}

function sanitize(str, quote = false) {
  const replace = [
    [/:/g, "\\:"],
    [/'/g, "\\'"],
    [/\[/g, "\\["],
    [/\]/g, "\\]"],
    [/\(/g, "\\("],
    [/\)/g, "\\)"],
  ];
  replace.forEach((r) => {
    str = str.replace(r[0], r[1]);
  });
  if (quote) {
    str = `'${str}'`;
  }
  return str;
}

function capitalizeFirst(str) {
  return str[0].toUpperCase() + str.substr(1);
}

module.exports.launchSVR = launchSVR;
module.exports.launchTF2 = launchTF2;
module.exports.killSVR = killSVR;
module.exports.killTF2 = killTF2;
module.exports.secondsToTimeStamp = secondsToTimeStamp;
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.writeSVRConfigs = writeSVRConfigs;
module.exports.sleep = sleep;
module.exports.getAlphaFade = getAlphaFade;
module.exports.backupConfig = backupConfig;
module.exports.restoreConfig = restoreConfig;
module.exports.applyConfig = applyConfig;
module.exports.isProcessRunning = isProcessRunning;
module.exports.sanitize = sanitize;
module.exports.capitalizeFirst = capitalizeFirst;
