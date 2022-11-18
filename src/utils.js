const exec = require("child_process").exec,
  tasklist = require("tasklist"),
  fs = require("fs-extra"),
  config = require("./data/config.json");

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

function killSVR() {
  console.log(`Killing svr`);
  if (svrProc) {
    svrProc.kill("SIGTERM");
  }
  killTF2();
}

function killTF2() {
  console.log(`Killing tf2`);

  tasklist().then((tasks) => {
    tasks.forEach((task) => {
      if (task.imageName == "hl2.exe") {
        process.kill(task.pid);
      }
    });
  });
}

function secondsToTimeStamp(seconds, showPlusSign = false) {
  let sign = "";
  if (seconds < 0) {
    sign = "-";
  } else if (showPlusSign) {
    sign = "+";
  }
  seconds = Math.abs(seconds);

  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
  seconds = Math.floor(seconds % 60);

  let timeStamp = sign;

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

function writeSVRConfigs(quality, demofile, cb) {
  writeSVRProfile(quality, (err) => {
    if (err) {
      console.error("Couldn't write SVR profile");
      console.error(err);
    }
    writeSVRLauncherConfig(quality, demofile, cb);
  });
}

function writeSVRProfile(quality, cb) {
  const profilePath = config.svr.path + "/data/profiles/tempus.ini";
  fs.readFile(profilePath, "utf8", (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    // Replace fps and motion blur sampling
    const re1 = /video_fps=[0-9]+/g;
    const re2 = /motion_blur_fps_mult=[0-9]+/g;
    data = data.replace(re1, `video_fps=${quality.fps}`);
    data = data.replace(re2, `motion_blur_fps_mult=${quality.sampling}`);

    const re3 = /velo_font_size=[0-9]+/g;
    let height = Number(quality.recordingRes.split('x')[1]) * config.video.text.position.speedo.fontsize;
    data = data.replace(re3, `velo_font_size=${height}`);

    fs.writeFile(profilePath, data, cb);
  });
}

function writeSVRLauncherConfig(quality, demofile, cb) {
  const configPath = config.svr.path + "/svr_launch_params.ini";
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    // Replace -w and -h
    const re1 = /-w [0-9]+ -h [0-9]+/g;
    data = data.replace(re1, `-w ${quality.recordingRes.split("x")[0]} -h ${quality.recordingRes.split("x")[1]}`);

    // Replace playdemo command
    const re2 = /\+playdemo [^\s]+/g;
    data = data.replace(re2, `+playdemo ${demofile}`);

    fs.writeFile(configPath, data, cb);
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
    [/\[/g, "\\["],
    [/\]/g, "\\]"],
    [/\(/g, "\\("],
    [/\)/g, "\\)"],
    // single apostrophes cause issues with ffmpeg even when escaped,
    // (at least with drawtext when used in -filter_script:v file)
    // use acute accent instead.
    [/'/g, "´"],
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

function recordingFilename(run, compressed = false) {
  let filename = "";

  if (config.video.filenameIds) {
    // Long file names might cause issues.
    // Run ids are short and unique but slightly more annoying to debug, etc.
    filename += run.id;
  } else {
    filename += `${run.demo.filename}_${run.zone.type}${run.zone.zoneindex}_${run.class}`;
  }

  if (compressed) {
    filename += "_comp";
  }

  filename += ".mp4";

  return filename;
}

function removeMapPrefix(mapName) {
  const prefixes = ["jump_", "rj_", "sj_"];

  for (const prefix of prefixes) {
    if (mapName.split(prefix).length > 0) {
      return mapName.split(prefix)[1];
    }
  }

  return mapName;
}

module.exports.launchSVR = launchSVR;
module.exports.killSVR = killSVR;
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
module.exports.recordingFilename = recordingFilename;
module.exports.removeMapPrefix = removeMapPrefix;
