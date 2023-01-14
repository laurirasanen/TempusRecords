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
let uploadCount = 0;
let dailyCount = 0;
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

function fillDescription(template, run, wrSplit = null) {
  desc = "";
  template.forEach((line) => {
    let d = new Date();
    let demo_date = new Date(run.demo.date * 1000);
    let class_tier = run.map.tiers[run.class.toLowerCase()];
    line = line
      .replace("$MAP_URL", "https://tempus.xyz/maps/" + run.map.name)
      .replace("$MAP_AUTHORS", run.map.authors.map((a) => a.name).join(", "))
      .replace("$MAP_TIER", `${class_tier} (${config.tiers[class_tier]})`)
      .replace(
        "$MAP_BOTH_TIERS",
        `${run.map.tiers.soldier} (${config.tiers[run.map.tiers.soldier]}) [S] | ${run.map.tiers.demoman} (${
          config.tiers[run.map.tiers.demoman]
        }) [D]`
      )
      .replace("$MAP", run.map.name)
      .replace("$NAME", run.player.name)
      .replace("$TIME", utils.secondsToTimeStamp(run.duration))
      .replace("$SPLIT", wrSplit ? `(${wrSplit})` : "")
      .replace("$CLASS", `${run.class === "SOLDIER" ? "Soldier" : "Demoman"}`)
      .replace("$DATETIME", d.toUTCString())
      .replace("$DATE", demo_date.toUTCString())
      .replace("$DEMO_URL", "https://tempus.xyz/demos/" + run.demo.id);

    desc += line + "\n";
  });

  // description max size is 5000 bytes,
  // I assume that includes null terminator.
  if (desc.length > 4999) {
    desc = desc.substr(0, 4999);
  }

  return desc;
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

  let stats = fs.statSync(file);
  let fileSize = stats.size;
  let bytes = 0;

  let wrSplit = null;
  for (const split of run.splits) {
    if (split.type === "map") {
      if (split.comparedDuration && split.duration) {
        wrSplit = utils.secondsToTimeStamp(split.duration - split.comparedDuration, true);
      }
      break;
    }
  }

  let description = fillDescription(config.youtube.description, run, wrSplit);

  // Common tags for all videos
  let tags = ["Team Fortress 2", "TF2", "rocketjump", "speedrun", "tempus", "record"];

  // Video specific tags
  let mapParts = run.map.name.split("_");
  tags.push(...mapParts);
  if (mapParts.length > 1) tags.push(`${mapParts[0]}_${mapParts[1]}`);
  tags.push(run.class === "SOLDIER" ? ["soldier", "solly"] : ["demoman", "demo"]);

  // Commas in player name will break youtube tags
  let playerName = run.player.name;
  playerName = playerName.replace(",", "");
  tags.push(playerName);

  let previousProgress = 0;

  // Add to uploaded runs
  utils.readJson("./data/uploaded.json", (err, uploaded) => {
    if (err !== null) {
      console.log("Failed to read last uploaded");
      console.log(err);
      return;
    }

    let now = Date.now();
    let publishAt = uploaded.last_publish > now ? uploaded.last_publish : now;
    let publishDate = new Date(publishAt);

    publishDate.setUTCHours(config.youtube.publishAt.hour);
    publishDate.setUTCMinutes(config.youtube.publishAt.minute);
    publishDate.setUTCSeconds(config.youtube.publishAt.second);
    publishDate.setUTCMilliseconds(config.youtube.publishAt.millisecond);

    while (publishDate.getTime() <= publishAt) {
      publishDate.setTime(publishDate.getTime() + 24 * 60 * 60 * 1000);
    }

    let maxDaily = Math.ceil(backlog / config.youtube.bufferDays);
    let lastForTheDay = false;
    if (dailyCount >= maxDaily) {
      dailyCount = 1;
    } else {
      dailyCount++;
    }

    if (dailyCount >= maxDaily || demo.isLastRun(run)) {
      lastForTheDay = true;
    }

    console.log(`publishDate: ${publishDate.toISOString()}, dailyCount: ${dailyCount}, maxDaily: ${maxDaily}, backlog: ${backlog}, last: ${lastForTheDay}`);

    backlog--;

    let req = youtube_api.videos.insert(
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
            publishAt: publishDate.toISOString(),
          },
        },
        // This is for the callback function
        part: "snippet,status",

        // Only notify on first upload to not spam people
        notifySubscribers: dailyCount === 1,

        // Create the readable stream to upload the video
        media: {
          body: fs.createReadStream(file).on("data", (chunk) => {
            bytes += chunk.length;
            let percentage = (100 * bytes) / fileSize;
            if (percentage > previousProgress + 5) {
              console.log(`Upload: ${Math.round(percentage - (percentage % 5))}%, ${prettyBytes(bytes)} (${file})`);
              previousProgress += 5;
            }
          }),
        },
      },
      (err, response) => {
        if (err) {
          console.log("Failed to upload video");
          console.log(err);
          console.dir(response);
          return;
        } else {
          console.log("Done uploading");
        }

        uploadCount++;
        uploadNext();

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
              console.dir(response);
            } else {
              console.log("Video added to playlist");
            }
          }
        );

        if (lastForTheDay) {
          uploaded.last_publish = publishDate.getTime();
        }
        
        if (!uploaded.maps.includes(run.id)) uploaded.maps.push(run.id);

        utils.writeJson("./data/uploaded.json", uploaded, (err) => {
          if (err !== null) {
            console.log("Failed to write last uploaded");
            console.log(err);
            return;
          }

          console.log("Updated uploaded list");

          // Continue with collection if last run
          if (demo.isLastRun(run)) {
            let type = new Date(Date.now()).getDay() % 3;
            demo.init(false, null, null, type == 0, type == 1, type == 2, !noUpload);
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
      }
    );
  });
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
  const isTrick = collectionRuns[0].zone.type === "trick";
  const isPlayer = collectionRuns[0].zone.type === "map";

  console.log(`Uploading collection`);

  let file = config.svr.recordingFolder + "/collection.mp4";
  if (isCourse) {
    file = config.svr.recordingFolder + `/${collectionRuns[0].map.name}_collection.mp4`;
  }

  let description = "";
  let stats = fs.statSync(file);
  let fileSize = stats.size;
  let bytes = 0;

  let useTimestamps = true;
  let seconds = 0;
  description = "Runs:\n";
  for (let run of collectionRuns) {
    if (useTimestamps) {
      let duration = await videojs.getDuration(run.outputFile);
      let timestamp = utils.secondsToYoutubeChapter(seconds);
      description += `${timestamp} ${run.map.name}`;

      if (isPlayer) {
        description += ` ${new Date(run.date * 1000).toISOString().split("T")[0]} (${
          run.class === "SOLDIER" ? "Soldier" : "Demoman"
        })\n`;
      } else {
        description += ` ${utils.capitalizeFirst(run.zone.type)} ${run.zone.zoneindex}${
          run.zone.customName ? " (" + run.zone.customName + ")" : ""
        } by ${run.player.name} (${run.class === "SOLDIER" ? "Soldier" : "Demoman"})\n`;
      }

      seconds += duration;
    }

    if (!useTimestamps) {
      description += `${run.map.name}${!isPlayer ? " " + utils.capitalizeFirst(run.zone.type) : ""} ${
        run.zone.zoneindex
      } by ${run.player.name} (${run.class === "SOLDIER" ? "Soldier" : "Demoman"})\n`;
    }
  }
  description += "\n";

  description += fillDescription(
    isCourse ? config.youtube.courseCollectionDescription : config.youtube.collectionDescription,
    collectionRuns[0]
  );

  // Common tags for all videos
  let tags = [
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

  if (isPlayer) {
    tags.push(collectionRuns[0].player.name);
  }

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
  } else if (isPlayer) {
    title = config.youtube.playerCollectionTitle;
    title = title.replace("$NAME", collectionRuns[0].player.name);
  }

  title = title.replace("$ZONETYPE", utils.capitalizeFirst(collectionRuns[0].zone.type));
  title = title.replace("$NUMBER", isBonus ? uploaded.bonusCollections + 1 : uploaded.trickCollections + 1);
  title = title.replace("$MAP", collectionRuns[0].map.name);

  let req = youtube_api.videos.insert(
    {
      resource: {
        snippet: {
          title: title,
          description: description,
          tags: tags,
        },
        status: {
          privacyStatus: "private",
          publishAt: isPlayer ? null : new Date(Date.now() + 1000 * 60 * config.youtube.publishDelay).toISOString(), // Allow time for processing before making public
        },
      },
      // This is for the callback function
      part: "snippet,status",

      // Only notify on first upload to not spam people
      notifySubscribers: uploadCount === 0,

      // Create the readable stream to upload the video
      media: {
        body: fs.createReadStream(file).on("data", (chunk) => {
          bytes += chunk.length;
          let percentage = (100 * bytes) / fileSize;
          if (percentage > previousProgress + 5) {
            console.log(`Upload: ${Math.round(percentage - (percentage % 5))}%, ${prettyBytes(bytes)} (${file})`);
            previousProgress += 5;
          }
        }),
      },
    },
    (err, response) => {
      if (err) {
        console.log("Failed to upload video");
        console.log(err);
        console.dir(response);
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
      if (isPlayer) playlist = "PL_D9J2bYWXyLYX9QQ2Nnh61VZnoZbv2mK";

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
            console.dir(response);
          } else {
            console.log("Video added to playlist");
          }
        }
      );

      if (isPlayer) {
        return;
      }

      uploadCount++;

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
