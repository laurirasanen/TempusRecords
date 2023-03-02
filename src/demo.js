const tempus = require("./tempus.js"),
  downloader = require("./downloader.js"),
  fs = require("fs"),
  utils = require("./utils.js"),
  config = require("./data/config.json"),
  youtube = require("./youtube.js"),
  quality = require("./data/quality.json"),
  fullbright = require("./data/fullbright_maps.json"),
  voiceEnable = require("./data/voice_enable.json"),
  videojs = require("./video.js");

let runs = [];

global.currentRun = null;
global.isCollection = false;
global.collectionRuns = [];
global.noUpload = false;
global.backlog = 0;
global.bufferDays = config.youtube.bufferDays;

async function init(recent, mapName, className, course, bonus, trick, playerId, rankLimit = 10, upload = true) {
  noUpload = !upload;
  runs = [];
  collectionRuns = [];
  currentRun = null;
  isCollection = false;

  // delete cache to fetch new value of json files on reinit
  // todo: replace require with await load for json files
  delete require.cache[require.resolve("./data/uploaded.json")];
  delete require.cache[require.resolve("./data/nicknames.json")];
  let uploaded = require("./data/uploaded.json");

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
      mapList = mapList.filter((map) => map.zones.bonus.length > 0);
    } else {
      mapList = mapList.filter((map) => map.zones.trick.length > 0);
    }

    if (bonus) {
      // continue from where we left off last collection
      let lastMap;

      for (let i = uploaded.bonuses.length - 1; i >= 0; i--) {
        try {
          lastMap = await tempus.getRecordMap(uploaded.bonuses[i]);
          break;
        } catch (err) {
          // no-op on 404, this can happen if the last uploaded bonus was wiped,
          // or if the map doesn't exist anymore, etc...
          // TODO: check if really 404, how to do in graphql??
        }
      }

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
      runs[i].outputFile = `${config.svr.recordingFolder}/${utils.recordingFilename(runs[i], true)}`;
      collectionRuns.push(runs[i]);
    }

    recordRun(runs[0]);
    return;
  }

  if (playerId) {
    isCollection = true;

    // cache these things as they take a lot of api requests
    // in case not recording eveything in one go.
    let mapListPath = `${config.svr.recordingFolder}/maplist.json`;
    let mapList = [];
    if (fs.existsSync(mapListPath)) {
      console.log("Loading map list from json");
      mapList = require(mapListPath);
    } else {
      console.log("Getting map list");
      mapList = await tempus.getMapList();
      fs.writeFileSync(mapListPath, JSON.stringify(mapList, null, 2));
    }

    let soldierPath = `${config.svr.recordingFolder}/soldier.json`;
    let soldierRuns = {};
    if (fs.existsSync(soldierPath)) {
      console.log("Loading soldier runs from json");
      soldierRuns = require(soldierPath);
    } else {
      console.log("Getting soldier runs");
      soldierRuns = await tempus.getPlayerRecords(playerId, mapList, "SOLDIER");
      fs.writeFileSync(soldierPath, JSON.stringify(soldierRuns, null, 2));
    }

    let demoPath = `${config.svr.recordingFolder}/demoman.json`;
    let demoRuns = {};
    if (fs.existsSync(demoPath)) {
      console.log("Loading demoman runs from json");
      demoRuns = require(demoPath);
    } else {
      console.log("Getting demoman runs");
      demoRuns = await tempus.getPlayerRecords(playerId, mapList, "DEMOMAN");
      fs.writeFileSync(demoPath, JSON.stringify(demoRuns, null, 2));
    }

    function checkPlayerRun(run) {
      if (!run) return;

      let hasDemo = run.demo && run.demo.url && run.demo.filename;
      if (!hasDemo || run.rank > rankLimit) {
        console.log(`skipping ${run.map.name}(${run.class}) - rank: ${run.rank}/${rankLimit}, demo: ${hasDemo}`);
        return;
      }

      run.outputFile = `${config.svr.recordingFolder}/${utils.recordingFilename(run, true)}`;
      runs.push(run);
    }

    for (const m of mapList) {
      checkPlayerRun(soldierRuns[m.name]);
      checkPlayerRun(demoRuns[m.name]);
    }

    runs.sort((a, b) => a.date - b.date);

    tempus.replaceNames(runs);
    for (let i = 0; i < runs.length; i++) {
      // Add fake "map" split for timer overlay at end
      runs[i].splits = [
        {
          type: "map",
          zoneindex: 1,
          duration: runs[i].duration,
          comparedDuration: null,
        },
      ];

      collectionRuns.push(runs[i]);
    }

    console.log(`Recording ${runs.length} runs for collection`);
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

  backlog = runs.length;
  // We don't keep track of all uploaded dates,
  // fudge backlog to be longer based on
  // days of queued videos on youtube.
  let daysBehind = Math.ceil((uploaded.last_publish - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysBehind > 0) {
    console.log(`Removing ${daysBehind} from buffer based on last upload date`);
    bufferDays -= daysBehind;
    bufferDays = Math.max(bufferDays, 1);
  }

  recordRun(runs[0]);
}

async function recordCourses() {
  isCollection = true;
  let mapList = await tempus.getMapList();
  mapList = mapList.filter((map) => map.zones.course.length > 0);

  let uploaded = require("./data/uploaded.json");
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
    runs[i].outputFile = `${config.svr.recordingFolder}/${utils.recordingFilename(runs[i], true)}`;
    collectionRuns.push(runs[i]);
  }

  recordRun(runs[0]);
}

function skip() {
  for (let i = 0; i < runs.length - 1; i++) {
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

  if (["course", "bonus", "trick"].includes(run.zone.type)) {
    // default to max to avoid ffmpeg issues
    // with different sized frames during concat.
    run.quality = quality[0];
  } else {
    // Get quality options based on duration
    let runLength = run.duration / 60;
    quality.forEach((opt) => {
      if (runLength > opt.minDuration) {
        run.quality = opt;
      }
    });
  }

  // Check for existing video if we crashed before, etc
  let video = `${config.svr.recordingFolder}/${utils.recordingFilename(run)}`;
  let audio = `${config.svr.recordingFolder}/${utils.recordingFilename(run).split(".mp4")[0]}.wav`;

  // Check for already compressed version
  let compressed = `${config.svr.recordingFolder}/${utils.recordingFilename(run, true)}`;
  if (fs.existsSync(compressed)) {
    if (!isCollection || isLastRun(run)) {
      console.log(`WARNING: Uploading existing video '${compressed}'`);
      console.log(`Make sure to delete existing videos if they're corrupted, etc.`);
      // TODO: fix last run with multiple ffmpeg instances
      youtube.upload(compressed, run);
    }

    skip();
    return;
  }

  // Check for video
  if (fs.existsSync(video) && fs.existsSync(audio)) {
    console.log(`WARNING: Using existing video '${video}'`);
    console.log(`Make sure to delete existing videos if they're corrupted, etc.`);

    // Compress
    videojs.compress(video, audio, run, (result, name) => {
      // Upload final output
      if (result === true && (!isCollection || isLastRun(run))) {
        // TODO: fix last run with multiple ffmpeg instances
        youtube.upload(name, run);
      }
    });

    skip();
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

        // Modify tempus profile for SVR and
        // tf2 launch params in 'svr_launch_params.ini'.
        utils.writeSVRConfigs(run.quality, run.demo.filename, (err) => {
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

    let commands = getPlayCommands(run);

    // Write the play commands
    savePlayCommands(run.demo.filename, commands, (success) => {
      if (success) {
        currentRun = run;
        utils.launchSVR();
        // 'tmps_records_run_end' will be called in rcon.js
        // after demo recording finishes.
      } else {
        console.log("[FILE] FAILED TO WRITE PLAYCOMMANDS");
        return;
      }
    });
  });
}

function getPlayCommands(run) {
  let startPadding = config.video.startPadding * 67;
  const endPadding = config.video.endPadding * 67;

  // Some people want to see these strats.
  // 0 = both spins
  // 1 = no start spin
  // 2 = no spins
  let ratPotential = 0;
  if (run.class === "DEMOMAN") {
    ratPotential += 1;
  }
  if (["course", "bonus", "trick"].includes(run.zone.type)) {
    ratPotential += 1;
  }

  let spin0 = "spec_mode 4";
  let spin1 = "spec_mode 4";

  if (ratPotential == 0) {
    spin0 = "spec_mode 5; " + (Math.random() > 0.5 ? "+right; -left" : "+left; -right");
  }
  if (ratPotential <= 1) {
    spin1 = "spec_mode 5; " + (Math.random() > 0.5 ? "+right; -left" : "+left; -right");
  }

  // Show more of the starting strat
  startPadding += ratPotential * 0.5 * 67;

  const paddedStartTick = Math.max(run.demoStartTick - startPadding, 0);
  // const paddedEndTick = Math.min(run.demoEndTick + endPadding, run.demoLength);
  const paddedEndTick = run.demoEndTick + endPadding;

  // Commands used to control the demo playback.
  // Running rcon tmps_records_* commands will trigger events in rcon.js.
  let filename = utils.recordingFilename(run);
  let commands = [
    {
      tick: 33,
      commands: `sensitivity 0; m_yaw 0; m_pitch 0; unbindall; fog_override 1; fog_enable 0; rcon tmps_records_demo_load; demo_gototick ${
        paddedStartTick
      }; demo_setendtick ${paddedEndTick}; mat_fullbright ${
        fullbright.includes(run.map.name) ? 1 : 0
      }; voice_enable ${voiceEnable.includes(run.id) ? 1 : 0}`,
    },
    // Start in 3rd person
    {
      tick: run.demoStartTick - startPadding,
      commands: `exec tmps_records_spec_player; cl_yawspeed 25; ${spin0}; demo_resume; rcon tmps_records_run_start; startmovie ${filename} tempus`,
    },
    { tick: run.demoStartTick - 33, commands: `exec tmps_records_spec_player; spec_mode 4` }, // Back to 1st person
    { tick: run.demoStartTick, commands: `exec tmps_records_spec_player; spec_mode 4` }, // In case player dead before start_tick
    {
      tick: run.demoEndTick - 33 < run.demoStartTick ? run.demoEndTick : run.demoEndTick - 33,
      commands: `${spin1};`,
    }, // 3rd person
    { tick: paddedEndTick - 33, commands: "rcon tmps_records_run_end;" },
    { tick: paddedEndTick, commands: "endmovie" },
  ];

  return commands;
}

// Save play commands to control the demo playback
function savePlayCommands(filename, commands, cb) {
  if (!cb || typeof cb !== "function") throw "callback is not a function";

  let data = `demoactions\n{\n`;

  // TODO: .vdm format is basically json without some characters,
  // could make this more legible by stringifying an object.
  for (let i = 0; i < commands.length; i++) {
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
module.exports.isLastRun = isLastRun;
