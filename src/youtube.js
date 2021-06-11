const youtube_api = require("youtube-api"),
  fs = require("fs"),
  Lien = require("lien"),
  prettyBytes = require("pretty-bytes"),
  readlineSync = require("readline-sync"),
  config = require("./data/config.json"),
  oauthConfig = require("./data/oauth.json"),
  opn = require("opn"),
  utils = require("./utils.js"),
  demo = require("./demo.js"),
  videojs = require("./video.js");

let hasTokens = false;
let initialized = false;

const uploadQueue = [];

/**
 * Add run to upload queue
 * @returns queue length
 */
function addToQueue(obj) {
  if (!uploadQueue.find((u) => u.file === obj.file)) {
    console.log("Adding run to upload queue, position: " + uploadQueue.length);
    uploadQueue.push(obj);
  }
  return uploadQueue.length;
}

/**
 * Upload next run in queue
 */
function uploadNext() {
  if (uploadQueue.length > 0) {
    uploadQueue.splice(0, 1);
  }

  if (uploadQueue.length > 0) {
    upload(uploadQueue[0].file, uploadQueue[0].run);
  }
}

function init() {
  if (initialized) return;
  initialized = true;

  let server = new Lien({
    host: "localhost",
    port: "5000",
  });

  let oauth = youtube_api.authenticate(oauthConfig);

  opn(
    oauth.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube"],
    })
  );

  server.addPage("/oauth2callback", (lien) => {
    console.log("Trying to get the token using the following code: " + lien.query.code);
    oauth.getToken(lien.query.code, (err, tokens) => {
      if (err) {
        lien.end(err, 400);
        return console.log(err);
      }

      console.log("Got the tokens.");

      oauth.setCredentials(tokens);

      lien.end("Uploads authorized.");

      hasTokens = true;
    });
  });
}

async function upload(file, run) {
  if (noUpload) {
    return;
  }

  if (isCollection) {
    videojs.concatCollection(() => {
      uploadCollection();
    });
    return;
  }

  if (!hasTokens) {
    console.log("Awaiting tokens");
    setTimeout(() => {
      upload(file, run);
    }, 5000);
    return;
  }

  addToQueue({ file, run });
  if (uploadQueue[0].file !== file) {
    // Already uploading something else
    return;
  }

  console.log(`Uploading ${file}`);

  var description = "";
  var stats = fs.statSync(file);
  var fileSize = stats.size;
  var bytes = 0;

  let wrSplit = null;
  for (const split of run.splits) {
    if (split.type === "map") {
      if (split.comparedDuration && split.duration) {
        wrSplit = utils.secondsToTimeStamp(split.duration - split.comparedDuration, true);
      }
      break;
    }
  }

  config.youtube.description.forEach((line) => {
    var d = new Date();
    var demo_date = new Date(run.demo.date * 1000);
    line = line
      .replace("$MAP_URL", "https://tempus.xyz/maps/" + run.map.name)
      .replace("$MAP", run.map.name)
      .replace("$NAME", run.player.name)
      .replace("$TIME", utils.secondsToTimeStamp(run.duration))
      .replace("$SPLIT", wrSplit ? `(${wrSplit})` : "")
      .replace("$CLASS", `${run.class === "SOLDIER" ? "Soldier" : "Demoman"}`)
      .replace("$DATETIME", d.toUTCString())
      .replace("$DATE", demo_date.toUTCString())
      .replace("$DEMO_URL", "https://tempus.xyz/demos/" + run.demo.id);

    description += line + "\n";
  });

  // description max size is 5000 bytes,
  // I assume that includes null terminator.
  if (description.length > 4999) {
    description = description.substr(0, 4999);
  }

  // Common tags for all videos
  var tags = ["Team Fortress 2", "TF2", "rocketjump", "speedrun", "tempus", "record"];

  // Video specific tags
  var mapParts = run.map.name.split("_");
  tags.push(...mapParts);
  if (mapParts.length > 1) tags.push(`${mapParts[0]}_${mapParts[1]}`);
  tags.push(run.class === "SOLDIER" ? ["soldier", "solly"] : ["demoman", "demo"]);

  // Commas in player name will break youtube tags
  var playerName = run.player.name;
  playerName = playerName.replace(",", "");
  tags.push(playerName);

  let previousProgress = 0;

  var req = youtube_api.videos.insert(
    {
      resource: {
        snippet: {
          title: config.youtube.title
            .replace("$NAME", run.player.name)
            .replace("$MAP", run.map.name)
            .replace("$TIME", utils.secondsToTimeStamp(run.duration)),
          description: description,
          tags: tags,
        },
        status: {
          privacyStatus: "private",
          publishAt: new Date(Date.now() + 1000 * 60 * config.youtube.publishDelay).toISOString(),
        },
      },
      // This is for the callback function
      part: "snippet,status",

      // Create the readable stream to upload the video
      media: {
        body: fs.createReadStream(file).on("data", (chunk) => {
          bytes += chunk.length;
          let percentage = (100 * bytes) / fileSize;
          if (percentage > previousProgress + 5) {
            console.log(`${file}: ${prettyBytes(bytes)} (${Math.round(percentage - (percentage % 5))}%) uploaded.`);
            previousProgress += 5;
          }
        }),
      },
    },
    (err, response) => {
      uploadNext();

      if (err) {
        console.log("Failed to upload video");
        console.log(err);
        return;
      } else {
        console.log("Done uploading");
      }
      // Add video to class playlist
      youtube_api.playlistItems.insert(
        {
          resource: {
            snippet: {
              playlistId:
                run.class === "SOLDIER" ? "PL_D9J2bYWXyLFs5OJcTugl_70HqzDN9nv" : "PL_D9J2bYWXyIeRkUq099oCV8wf5Omf9Fe",
              resourceId: {
                kind: "youtube#video",
                videoId: response.data.id,
              },
            },
          },
          part: "snippet",
        },
        (err, response) => {
          if (err) {
            console.log("Failed to add video to playlist");
            console.log(err);
          } else {
            console.log("Video added to playlist");
          }
        }
      );

      // Add to uploaded runs
      utils.readJson("./data/uploaded.json", (err, uploaded) => {
        if (err !== null) {
          console.log("Failed to read last uploaded");
          console.log(err);
          return;
        }

        if (!uploaded.maps.includes(run.id)) uploaded.maps.push(run.id);

        utils.writeJson("./data/uploaded.json", uploaded, (err) => {
          if (err !== null) {
            console.log("Failed to write last uploaded");
            console.log(err);
            return;
          }

          console.log("Updated uploaded list");

          // Continue with bonus if last run
          if (demo.isLastRun(run)) {
            demo.init(false, null, null, false, true, false, !noUpload);
          }
        });

        // Remove compressed video
        if (config.video.deleteCompressed) {
          fs.unlink(file, (err) => {
            if (err) {
              console.log("Failed to unlink uploaded video");
              console.log(err);
              return;
            }

            console.log("Unlinked uploaded video");
          });
        }
      });
    }
  );
}

async function uploadCollection() {
  if (!hasTokens) {
    console.log("Awaiting tokens");
    setTimeout(() => {
      uploadCollection();
    }, 5000);
    return;
  }

  const isBonus = collectionRuns[0].zone.type === "bonus";
  const isCourse = collectionRuns[0].zone.type === "course";

  console.log(`Uploading collection`);

  var file = config.svr.recordingFolder + "/collection.mp4";
  if (isCourse) {
    file = config.svr.recordingFolder + `/${collectionRuns[0].map.name}_collection.mp4`;
  }

  var description = "";
  var stats = fs.statSync(file);
  var fileSize = stats.size;
  var bytes = 0;

  let date = new Date();

  let useTimestamps = true;
  let seconds = 0;
  description = "Runs:\n";
  for (let run of collectionRuns) {
    if (useTimestamps) {
      let duration = await videojs.getDuration(run.outputFile);
      let timeElapsed = new Date(0);
      timeElapsed.setSeconds(Math.floor(seconds));
      let timestamp = `${timeElapsed.getMinutes()}:${
        timeElapsed.getSeconds() < 10 ? "0" : ""
      }${timeElapsed.getSeconds()}`;
      description += `${timestamp} ${run.map.name} ${utils.capitalizeFirst(run.zone.type)} ${run.zone.zoneindex}${
        run.zone.customName ? " (" + run.zone.customName + ")" : ""
      } by ${run.player.name} (${run.class === "SOLDIER" ? "Soldier" : "Demoman"})\n`;
      seconds += duration;
    }

    if (!useTimestamps) {
      description += `${run.map.name} ${utils.capitalizeFirst(run.zone.type)} ${run.zone.zoneindex} by ${
        run.player.name
      } (${run.class === "SOLDIER" ? "Soldier" : "Demoman"})\n`;
    }
  }
  description += "\n";

  config.youtube.collectionDescription.forEach((line) => {
    line = line.replace("$DATETIME", date.toUTCString());
    description += line + "\n";
  });

  // description max size is 5000 bytes,
  // I assume that includes null terminator.
  if (description.length > 4999) {
    description = description.substr(0, 4999);
  }

  // Common tags for all videos
  var tags = [
    "Team Fortress 2",
    "TF2",
    "rocketjump",
    "speedrun",
    "tempus",
    "record",
    "soldier",
    "demoman",
    collectionRuns[0].zone.type,
    "collection",
  ];

  let previousProgress = 0;
  let uploaded = require("./data/uploaded.json");
  let title = config.youtube.collectionTitle;

  if (isCourse) {
    title = config.youtube.courseCollectionTitle;
  } else if (isBonus) {
    title = config.youtube.bonusCollectionTitle;

    // Add map name initials
    let initials = [
      utils.removeMapPrefix(collectionRuns[0].map.name).substr(0, 1).toUpperCase(),
      utils
        .removeMapPrefix(collectionRuns[collectionRuns.length - 1].map.name)
        .substr(0, 1)
        .toUpperCase(),
    ];

    let initialsText = `${initials[0]}-${initials[1]}`;
    if (initials[0] === initials[1]) {
      initialsText = initials[0];
    }

    title = title.replace("$INITIALS", initialsText);
  }

  title = title.replace("$ZONETYPE", utils.capitalizeFirst(collectionRuns[0].zone.type));
  title = title.replace("$NUMBER", isBonus ? uploaded.bonusCollections + 1 : uploaded.trickCollections + 1);
  title = title.replace("$MAP", collectionRuns[0].map.name);

  var req = youtube_api.videos.insert(
    {
      resource: {
        snippet: {
          title: title,
          description: description,
          tags: tags,
        },
        status: {
          privacyStatus: "private",
          publishAt: new Date(Date.now() + 1000 * 60 * config.youtube.publishDelay).toISOString(), // Allow time for processing before making public
        },
      },
      // This is for the callback function
      part: "snippet,status",

      // Create the readable stream to upload the video
      media: {
        body: fs.createReadStream(file).on("data", (chunk) => {
          bytes += chunk.length;
          let percentage = (100 * bytes) / fileSize;
          if (percentage > previousProgress + 5) {
            console.log(`${file}: ${prettyBytes(bytes)} (${Math.round(percentage - (percentage % 5))}%) uploaded.`);
            previousProgress += 5;
          }
        }),
      },
    },
    (err, response) => {
      if (err) {
        console.log("Failed to upload video");
        console.log(err);
      } else {
        console.log("Done uploading");
      }

      if (!isCourse) {
        // Youtube sucks
        let answer = readlineSync.question("Was youtube processing succesful? Y/n: ");
        if (answer === "n") {
          // Reupload
          uploadCollection();
          return;
        }
      }

      let playlist = "PL_D9J2bYWXyJYdkfuv8s0kTvQygJQkW8_"; // trick
      if (isBonus) playlist = "PL_D9J2bYWXyJBc0YvjRpqpFc5hY-ieU-B";
      if (isCourse) playlist = "PL_D9J2bYWXyI-8Kk7tPKp1ApfnstuWMUn";

      // Add video to playlist
      youtube_api.playlistItems.insert(
        {
          resource: {
            snippet: {
              playlistId: playlist,
              resourceId: {
                kind: "youtube#video",
                videoId: response.data.id,
              },
            },
          },
          part: "snippet",
        },
        (err, response) => {
          if (err) {
            console.log("Failed to add video to playlist");
            console.log(err);
          } else {
            console.log("Video added to playlist");
          }
        }
      );

      // Add to uploaded runs
      utils.readJson("./data/uploaded.json", (err, uploaded) => {
        if (err !== null) {
          console.log("Failed to read last uploaded");
          console.log(err);
          return;
        }

        let accessor = collectionRuns[0].zone.type.endsWith("s")
          ? collectionRuns[0].zone.type + "es"
          : collectionRuns[0].zone.type + "s";
        for (let run of collectionRuns) {
          if (!uploaded[accessor].includes(run.id)) {
            uploaded[accessor].push(run.id);
          }
        }

        if (!isCourse) {
          accessor = collectionRuns[0].zone.type + "Collections";
          uploaded[accessor] += 1;
        }

        utils.writeJson("./data/uploaded.json", uploaded, (err) => {
          if (err !== null) {
            console.log("Failed to write last uploaded");
            console.log(err);
            return;
          }

          console.log("Updated uploaded list");

          demo.init(false, null, null, isCourse, isBonus, !isCourse && !isBonus, true);
        });
      });
    }
  );
}

module.exports.init = init;
module.exports.upload = upload;
