const tempus = require("./tempus.js"),
  downloader = require("./downloader.js"),
  fs = require("fs"),
  utils = require("./utils.js"),
  config = require("./data/config.json"),
  youtube = require("./youtube.js"),
  quality = require("./data/quality.json"),
  uploaded = require("./data/uploaded.json");

let runs = [];

global.currentRun = null;
global.isCollection = false;
global.collectionRuns = [];
global.noUpload = false;

async function init(recent, mapName, className, course, bonus, trick, upload = true) {
  noUpload = !upload;
  if (mapName && className) {
    // Upload specific run
    let wr = await tempus.getMapWR(mapName, className, false);
    if (!wr) {
      console.log(`Couldn't find WR for map ${mapName} as ${className}`);
      return;
    }
    runs.push(wr);
    recordRun(runs[0]);
    return;
  }

  if (bonus || trick) {
    // Upload collection
    isCollection = true;
    let mapList = await tempus.getMapList();
    if (bonus) {
      mapList = mapList.filter(map => map.zones.bonus.length > 0);
    } else {
      mapList = mapList.filter(map => map.zones.trick.length > 0);
    }

    if (bonus) {
      // continue from where we left off last collection
      let lastMap = await tempus.getRecordMap(uploaded.bonuses[uploaded.bonuses.length - 1]);
      let lastIndex = mapList.findIndex((m) => m.id === lastMap.id);
      if (lastIndex >= 0) {
        let tmp = mapList.splice(0, lastIndex + 1);
        mapList.push(...tmp);
      }
      console.log(`Starting collection from ${mapList[0].name}`);
    }

    runs = await tempus.getExtraWRs(mapList, bonus ? "bonus" : "trick");

    if (runs.length <= 0) {
      console.log("No new runs.");
      return;
    }
    console.log(`Recording ${runs.length} runs for collection`);

    for (let i = 0; i < runs.length; i++) {
      // This is used for concatenating video files before upload
      runs[
        i
      ].outputFile = `${config.svr.recordingFolder}/${runs[i].demo.filename}_${runs[i].zone.type}${runs[i].zone.zoneindex}_${runs[i].class}_compressed.mp4`;
      collectionRuns.push(runs[i]);
    }

    recordRun(runs[0]);
    return;
  }

  if (course) {
    recordCourses();
    return;
  }

  if (recent) {
    // Check most recent runs
    runs = await tempus.getRecentMapWRs();
  } else {
    // Check all runs
    let mapList = await tempus.getMapList();
    runs = await tempus.getMapWRs(mapList);
  }

  if (!runs.length) {
    console.log("No new runs.");
    return;
  }

  recordRun(runs[0]);
}

async function recordCourses() {
  isCollection = true;
  let mapList = await tempus.getMapList();
  mapList = mapList.filter(map => map.zones.course.length > 0);

  if (uploaded.courses.length > 0) {
    // continue from where we left off last collection
    let lastMap = await tempus.getRecordMap(uploaded.courses[uploaded.courses.length - 1]);
    let lastIndex = mapList.findIndex((m) => m.id === lastMap.id);
    if (lastIndex >= 0) {
      let tmp = mapList.splice(0, lastIndex + 1);
      mapList.push(...tmp);
    }
  }
  console.log(`Starting collection from ${mapList[0].name}`);

  runs = await tempus.getExtraWRs(mapList, "course");
  if (!runs.length) {
    console.log("No new runs.");
    return;
  }

  for (let i = 0; i < runs.length; i++) {
    // This is used for concatenating video files before upload
    runs[
      i
    ].outputFile = `${config.svr.recordingFolder}/${runs[i].demo.filename}_${runs[i].zone.type}${runs[i].zone.zoneindex}_${runs[i].class}_compressed.mp4`;
    collectionRuns.push(runs[i]);
  }

  recordRun(runs[0]);
}

function skip() {
  for (var i = 0; i < runs.length - 1; i++) {
    if (runs[i] === currentRun || currentRun === null) {
      currentRun = runs[i + 1];
      return recordRun(runs[i + 1]);
    }
  }
}

function isLastRun(run) {
  return run.id === runs[runs.length - 1].id;
}

function recordRun(run) {
  if (!run || !run.player || !run.demo || !run.demo.url || !run.demo.filename) {
    console.log("Missing info in run");
    console.log(run);
    skip();
    return;
  }

  if (!noUpload) {
    youtube.init();
  }

  // Get quality options
  let runLength = run.duration / 60;
  quality.forEach((opt) => {
    if (runLength > opt.minDuration) {
      run.quality = opt;
    }
  });

  // Check for existing video if we crashed before, etc
  var video = `${config.svr.recordingFolder}/${run.demo.filename}_${run.zone.type + run.zone.zoneindex}_${
    run.class
  }.mp4`;
  var audio = `${config.svr.recordingFolder}/${run.demo.filename}_${run.zone.type + run.zone.zoneindex}_${
    run.class
  }.wav`;

  // Check for already compressed version
  let compressed = video.split(".mp4")[0] + "_compressed.mp4";
  if (fs.existsSync(compressed)) {
    if (!isCollection || isLastRun(run)) {
      console.log(`WARNING: Uploading existing video '${compressed}'`);
      console.log(`Make sure to delete existing videos if they're corrupted, etc.`);
      youtube.upload(compressed, run);
    }

    skip();
    return;
  }

  // Check for video and audio
  if (fs.existsSync(video) && fs.existsSync(audio)) {
    console.log(`WARNING: Using existing video '${video}'`);
    console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

    // Compress
    youtube.compress(video, audio, run, (result, name) => {
      if (result === true) {
        // Upload final output
        if (result === true && (!isCollection || isLastRun(run))) {
          youtube.upload(name, run);
        }
      }

      // Let's wait until we're done in case we're compressing a bunch
      // of existing files. Spawning too many ffmpeg processes means trouble.
      // TODO: add a proper queue for compressions
      skip();
    });

    return;
  }

  // Get map file
  downloader.getMap(run.map.name, (res) => {
    if (res !== null) {
      // Get demo file
      downloader.getDemoFile(run, (result) => {
        if (result === null) {
          console.log("[DL] Error getting demo");
          skip();
          return;
        } else if (result === false) {
          console.log(`[DL] Demo file ${run.demo.filename} exists already!`);
        }

        // Modify tempus profile for SVR
        utils.writeSVRConfigs(run.quality, (err) => {
          if (err) {
            console.log(err);
            console.log("skipping");
            skip();
          }

          startDemo(run);
        });
      });
    }
  });
}

function startDemo(run) {
  // Create a tmps_records_spec_player.cfg, which will get executed when the demo loads.
  // The config just contains a 'spec_player "STEAMID"' command.
  // This cannot be done via rcon because the steamId needs quotes around it and source does not like that.

  // Write the .cfg
  fs.writeFile(config.tf2.path + "/cfg/tmps_records_spec_player.cfg", `spec_player "${run.player.steamId}"`, (err) => {
    if (err) {
      console.log("[FILE] Could not write tmps_records_spec_player.cfg!");
      console.log(err);

      return;
    }

    let commands = getPlayCommands(run, false);

    // Write the play commands
    savePlayCommands(run.demo.filename, commands, (success) => {
      if (success) {
        currentRun = run;

        // Record audio without SVR
        utils.launchTF2(`+playdemo ${run.demo.filename}`);

        // Video will be recorded after audio finishes
        // when rcon.js receives 'tmps_records_run_end' the first time.
        // The second time, video will be compressed, remuxed together with audio and uploaded.
      } else {
        console.log("[FILE] FAILED TO WRITE PLAYCOMMANDS");
        return;
      }
    });
  });
}

function getPlayCommands(run, isVideo = true) {
  const startPadding = config.video.startPadding * 67;
  const endPadding = config.video.endPadding * 67;

  // Commands used to control the demo playback.
  // Running rcon tmps_records_* commands will trigger events in rcon.js.
  var commands = [
    {
      tick: 33,
      commands: `sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${
        run.demoStartTick - startPadding
      }; demo_setendtick ${run.demoEndTick + endPadding + 66}`,
    },
    {
      tick: run.demoStartTick - startPadding,
      commands: `exec tmps_records_spec_player; spec_mode 4; demo_resume; ${
        isVideo ? "" : "volume 0.1;"
      } rcon tmps_records_run_start; startmovie ${run.demo.filename}_${run.zone.type + run.zone.zoneindex}_${
        run.class
      }${isVideo ? ".mp4 tempus" : ".wav wav"}`,
    },
    { tick: run.demoStartTick, commands: `exec tmps_records_spec_player; spec_mode 4` }, // In case player dead before start_tick
    { tick: run.demoEndTick + endPadding - 33, commands: "rcon tmps_records_run_end" },
    { tick: run.demoEndTick + endPadding, commands: "volume 0; endmovie" },
  ];

  return commands;
}

// Save play commands to control the demo playback
function savePlayCommands(filename, commands, cb) {
  if (!cb || typeof cb !== "function") throw "callback is not a function";

  var data = `demoactions\n{\n`;

  // TODO: .vdm format is basically json without some characters,
  // could make this more legible by stringifying an object.
  for (var i = 0; i < commands.length; i++) {
    data +=
      `   "${i + 1}"\n` +
      "   {\n" +
      '       factory "PlayCommands"\n' +
      `       name "tmps_records${i + 1}"\n` +
      `       starttick "${commands[i].tick}"\n` +
      `       commands "${commands[i].commands}"\n` +
      "   }\n";
  }

  data += "\n}";

  fs.writeFile(config.tf2.path + filename + ".vdm", data, {}, (err) => {
    if (err) {
      console.log("[FILE] Error saving PlayCommands!");
      console.log(err);
      return cb(false);
    }

    return cb(true);
  });
}

module.exports.recordRun = recordRun;
module.exports.init = init;
module.exports.skip = skip;
module.exports.getPlayCommands = getPlayCommands;
module.exports.savePlayCommands = savePlayCommands;
module.exports.isLastRun = isLastRun;
