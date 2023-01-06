const ffmpeg = require("fluent-ffmpeg"),
  fs = require("fs"),
  utils = require("./utils.js"),
  config = require("./data/config.json"),
  fullbright = require("./data/fullbright_maps.json");
const { makeFilterStrings } = require("fluent-ffmpeg/lib/utils");

const compressQueue = [];
let ffmpegInstances = 0;

/**
 * Add run to compress queue
 * @returns queue length
 */
function addToQueue(obj) {
  if (!compressQueue.find((c) => c.video === obj.video)) {
    console.log("Adding run to compress queue, position: " + compressQueue.length);
    compressQueue.push(obj);
  }
  return compressQueue.length;
}

/**
 * Compress next run
 */
function compressNext() {
  if (compressQueue.length > 0) {
    compressQueue.splice(0, 1);
  }
  ffmpegInstances--;

  if (compressQueue.length > 0) {
    compress(compressQueue[0].video, compressQueue[0].audio, compressQueue[0].run, compressQueue[0].cb);
  }
}

const ffmpegLogger = {
  debug: (msg) => {
    logger("debug", msg);
  },
  info: (msg) => {
    logger("info", msg);
  },
  warn: (msg) => {
    logger("warn", msg);
  },
  error: (msg) => {
    logger("error", msg);
  },
};

function logger(severity, msg) {
  console.log(`ffmpeg ${severity}: ${msg}`);
}

function getDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg(file, { logger: ffmpegLogger }).ffprobe((err, data) => {
      if (err) {
        reject(err);
        return;
      }
      if (!data) {
        reject("no data");
        return;
      }
      resolve(data.format.duration);
    });
  });
}

async function compress(video, audio, run, cb) {
  if (!cb || typeof cb !== "function") throw "callback is not a function";

  addToQueue({ video: video, audio: audio, run: run, cb: cb });
  if (ffmpegInstances >= config.video.ffmpegInstances) {
    // No ffmpeg instances, wait in queue
    return;
  }
  ffmpegInstances++;

  const isMapRun = run.zone.type === "map";
  const isPlayerCollection = isCollection && isMapRun;

  const output = video.split(".mp4")[0] + "_comp.mp4";
  let prevProgress = 0;

  let wrSplits = run.splits ?? [];

  let duration = 0;
  try {
    duration = await getDuration(video);
  } catch (err) {
    console.log(`Failed to get the duration of ${video}`);
    console.log(err);
    return;
  }

  let videoFilters = [
    // Resolution
    {
      filter: "scale",
      options: {
        w: run.quality.outputRes.split("x")[0],
        h: run.quality.outputRes.split("x")[1],
      },
    },
    // Add a slight vignette
    {
      filter: "vignette",
      options: { angle: 0.1 },
    },
  ];

  // Use different color curve for fullbright maps
  let curveFile = "data/color_curves.acv";
  if (fullbright.includes(run.map.name)) {
    curveFile = "data/color_curves_fullbright.acv";
  }

  // Apply photoshop color curve.
  // Insert before vignette just in case that makes a difference.
  videoFilters.unshift({
    filter: "curves",
    options: { psfile: curveFile },
  });

  let audioFilters = [];

  // Fade timestamps
  for (const split of wrSplits) {
    if (split.duration) {
      let alpha = utils.getAlphaFade(
        config.video.startPadding + split.duration - config.video.text.fadeInDuration,
        config.video.text.displayDuration,
        config.video.text.fadeInDuration,
        config.video.text.fadeOutDuration,
        config.video.text.maxAlpha
      );
      let zoneTxt = "";
      switch (split.type) {
        case "checkpoint":
          zoneTxt = `CP${split.zoneindex}: `;
          break;

        case "course":
          zoneTxt = `Course ${split.zoneindex}: `;
          break;

        case "map":
          zoneTxt = "";
          break;

        default:
          throw `Unhandled zone type ${split.type}`;
      }

      let text = `${zoneTxt}${utils.secondsToTimeStamp(split.duration)}`;
      text = utils.sanitize(text, true);

      let textCfg = config.video.text.position.topLeft;
      if (split.type === "map") {
        textCfg = config.video.text.position.middle;
      }

      videoFilters.push({
        filter: "drawtext",
        options: {
          ...config.video.text.ffmpegOptions,
          ...textCfg,
          text: text,
          alpha: alpha,
        },
      });

      if (split.comparedDuration) {
        text = `(${utils.secondsToTimeStamp(split.duration - split.comparedDuration, true)})`;
        text = utils.sanitize(text, true);

        textCfg = config.video.text.position.bottomLeft;
        if (split.type === "map") {
          textCfg = config.video.text.position.middleLower;
        }

        videoFilters.push({
          filter: "drawtext",
          options: {
            ...config.video.text.ffmpegOptions,
            ...textCfg,
            text: text,
            alpha: alpha,
          },
        });
      }
    }
  }

  // Draw map and player name at start,
  // or date for player collections
  if (isMapRun) {
    let alpha = utils.getAlphaFade(
      0,
      config.video.text.displayDurationStart,
      config.video.text.fadeInDuration,
      config.video.text.fadeOutDuration,
      config.video.text.maxAlpha
    );
    videoFilters.push({
      filter: "drawtext",
      options: {
        ...config.video.text.ffmpegOptions,
        ...config.video.text.position.middle,
        text: run.map.name,
        alpha: alpha,
      },
    });
    videoFilters.push({
      filter: "drawtext",
      options: {
        ...config.video.text.ffmpegOptions,
        ...config.video.text.position.middleLower,
        text: isPlayerCollection ? new Date(run.date * 1000).toISOString().split('T')[0] : run.player.name,
        alpha: alpha,
      },
    });
  }

  if (isCollection) {
    // Add map name, zone, and player name to video
    let displayDuration =
      duration - config.video.text.startPadding - config.video.text.fadeInDuration - config.video.text.fadeOutDuration;
    let alphaName = utils.getAlphaFade(
      config.video.text.startPadding,
      displayDuration,
      config.video.text.fadeInDuration,
      config.video.text.fadeOutDuration,
      config.video.text.maxAlpha
    );

    // Player
    videoFilters.push({
      filter: "drawtext",
      options: {
        ...config.video.text.ffmpegOptions,
        ...config.video.text.position.topLeft,
        text: utils.sanitize(run.player.name),
        alpha: alphaName,
      },
    });

    // Map
    videoFilters.push({
      filter: "drawtext",
      options: {
        ...config.video.text.ffmpegOptions,
        ...config.video.text.position.bottomLeft,
        text: utils.sanitize(run.map.name),
        alpha: alphaName,
      },
    });

    if (!isPlayerCollection) {
      if (run.zone.customName) {
        // Custom name in bottom right
        videoFilters.push({
          filter: "drawtext",
          options: {
            ...config.video.text.ffmpegOptions,
            ...config.video.text.position.bottomRight,
            text: utils.sanitize(run.zone.customName),
            alpha: alphaName,
          },
        });

        // Move zone above name
        videoFilters.push({
          filter: "drawtext",
          options: {
            ...config.video.text.ffmpegOptions,
            ...config.video.text.position.topRight,
            text: utils.sanitize(run.zone.type + " " + run.zone.zoneindex),
            alpha: alphaName,
          },
        });
      } else {
        // Zone in bottom right
        videoFilters.push({
          filter: "drawtext",
          options: {
            ...config.video.text.ffmpegOptions,
            ...config.video.text.position.bottomRight,
            text: utils.sanitize(run.zone.type + " " + run.zone.zoneindex),
            alpha: alphaName,
          },
        });
      }
    }
  }

  // Add video fade in/out
  videoFilters.push(
    {
      filter: "fade",
      options: `in:st=0:d=${config.video.fadeInDuration}`,
    },
    {
      filter: "fade",
      options: `out:st=${duration - config.video.fadeOutDuration}:d=${config.video.fadeOutDuration}`,
    }
  );

  // Adjust audio volume, SVR no longer respects volume arg in-game.
  audioFilters.push({
    filter: "volume",
    options: {
      volume: 0.1,
    },
  });

  // Add audio fade in/out
  audioFilters.push(
    {
      filter: "afade",
      options: `in:st=0:d=${config.audio.fadeInDuration}`,
    },
    {
      filter: "afade",
      options: `out:st=${duration - config.audio.fadeOutDuration}:d=${config.audio.fadeOutDuration}`,
    }
  );

  // Write video filters to a file so we can use
  // -filter_script:v instead of -filter:v and
  // avoid hitting command length limits.
  let vfs = makeFilterStrings(videoFilters);
  fs.writeFileSync(`${config.svr.recordingFolder}/videofilters.txt`, vfs.join(","));
  let afs = makeFilterStrings(audioFilters);
  fs.writeFileSync(`${config.svr.recordingFolder}/audiofilters.txt`, afs.join(","));

  let outputOptions = [
    `-filter_script:v ${config.svr.recordingFolder}/videofilters.txt`,
    `-filter_script:a ${config.svr.recordingFolder}/audiofilters.txt`,
    ...config.video.ffmpegOptions,
  ];

  ffmpeg({ logger: ffmpegLogger })
    .input(video)
    .input(audio)
    .fps(run.quality.fps)
    .outputOptions(outputOptions)
    .on("start", () => {
      console.log(`Started compressing ${video}`);
    })
    .on("progress", (progress) => {
      // Progress has no percentage with the settings used,
      // make our own percentage with blackjack and hookers.
      let frameCount = duration * run.quality.fps;
      let percentage = (100 * progress.frames) / frameCount;

      if (percentage > prevProgress + 5) {
        let eta = utils.secondsToTimeStamp((frameCount - progress.frames) / progress.currentFps);
        console.log(`Compress: ${Math.round(percentage - (percentage % 5))}%, ETA: ${eta} (${video})`);
        prevProgress += 5;
      }
    })
    .on("end", () => {
      console.log(`Finished compressing ${video}`);

      // Remove old video and audio
      if (config.video.deleteUncompressed) {
        fs.unlink(video, (err) => {
          if (err) {
            console.log("Failed to unlink uncompressed video");
            console.log(err);
          }
        });

        fs.unlink(audio, (err) => {
          if (err) {
            console.log("Failed to unlink audio");
            console.log(err);
          }
        });
      }

      compressNext();
      return cb(true, output);
    })
    .on("error", (err) => {
      console.log(`Failed to process ${video}`);
      console.log(err.message);

      compressNext();
      return cb(false, null);
    })
    .save(output);
}

async function concatCollection(cb) {
  if (typeof cb !== "function") {
    throw "callback is not a function";
  }

  console.log("Concatenating videos");

  for (let i = collectionRuns.length - 1; i >= 0; i--) {
    if (!fs.existsSync(collectionRuns[i].outputFile)) {
      console.log(`WARN: Run in collection but missing file ${collectionRuns[i].outputFile}`);
      collectionRuns.splice(i, 1);
    }
  }

  let duration = 0;

  for (let run of collectionRuns) {
    try {
      duration += await getDuration(run.outputFile);
    } catch (err) {
      console.log(err);
    }
  }

  let frameCount = duration * 60;
  let prevProgress = 0;
  let completed = false;
  let ff = ffmpeg({ logger: ffmpegLogger });

  let targetFile = config.svr.recordingFolder + "/collection.mp4";
  if (collectionRuns[0].zone.type == "course") {
    targetFile = config.svr.recordingFolder + `/${collectionRuns[0].map.name}_collection.mp4`;
  }

  let fileList = "";
  for (let i = 0; i < collectionRuns.length; i++) {
    let parts = collectionRuns[i].outputFile.split("/");
    fileList += `file '${parts[parts.length - 1]}'\n`;
  }
  fs.writeFileSync(`${config.svr.recordingFolder}/videolist.txt`, fileList);

  ff.on("error", (err) => {
    console.log("Failed to concatenate files");
    console.error(err);
  })
    .on("progress", (progress) => {
      let percentage = (100 * progress.frames) / frameCount;

      if (percentage > prevProgress + 5) {
        let eta = utils.secondsToTimeStamp((frameCount - progress.frames) / progress.currentFps);
        console.log(`Concat progress: ${Math.round(percentage - (percentage % 5))}%, ETA: ${eta}`);
        prevProgress += 5;
      }
    })
    .on("end", () => {
      // This gets called multiple times for some reason
      if (completed) {
        return;
      }
      completed = true;

      console.log("Finished concatenating");
      cb();
    })
    // Use concat demuxer instead of filter to avoid re-encode:
    // https://trac.ffmpeg.org/wiki/Concatenate
    .input(`${config.svr.recordingFolder}/videolist.txt`)
    .inputOptions(["-f concat"])
    .outputOptions(["-c copy"])
    .save(targetFile);
}

module.exports.getDuration = getDuration;
module.exports.compress = compress;
module.exports.concatCollection = concatCollection;
