const { graphql } = require("graphql");
const { schema } = require("tempus-api-graphql");
const { writeJSONSync } = require("fs-extra");
const nicknames = require("./data/nicknames.json");
const blacklist = require("./data/blacklist.json");
const config = require("./data/config.json");
const readlineSync = require("readline-sync");

async function getMapWRs(mapList, filter = true) {
  let wrs = [];
  for (const map of mapList) {
    wrs.push(await getMapWR(map.name, "SOLDIER", filter));
    wrs.push(await getMapWR(map.name, "DEMOMAN", filter));
  }
  if (filter) {
    return filterRuns(wrs);
  } else {
    return wrs;
  }
}

async function getMapWR(mapName, className, filter = true) {
  const query = `
    {
      map(name: "${mapName}") {
        wr(class: ${className}) {
          id
          class
          date
          duration
          demoStartTick
          demoEndTick
          demo {
            id
            date
            url
            filename
          }
          map {
            name
          }
          player {
            name
            steamId
          }                
          splits {
            type
            zoneindex
            duration
            comparedDuration
          }
          zone {
            id
            type
            zoneindex
            customName
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }
  if (filter) {
    return filterRuns(result.data.map.wr);
  } else {
    return result.data.map.wr;
  }
}

async function getExtraWRs(mapList, zoneType, filter = true) {
  let wrs = [];
  for (const map of mapList) {
    let zones = await getTypeZones(map.name, zoneType);

    if (zoneType == "course") {
      // courses
      // don't alternate between classes for each zone
      for (const zone of zones) {
        let swr = await getZoneWR(map.name, zoneType.toUpperCase(), zone.zoneindex, "SOLDIER");
        if (shouldUploadExtra(swr) || !filter) {
          wrs.push(swr);
        }
      }
      for (const zone of zones) {
        let dwr = await getZoneWR(map.name, zoneType.toUpperCase(), zone.zoneindex, "DEMOMAN");
        if (shouldUploadExtra(dwr) || !filter) {
          wrs.push(dwr);
        }
      }

      if (wrs.length > 0 && filter) {
        // Limit to single map at a time
        break;
      }
    } else {
      // bonuses and tricks
      for (const zone of zones) {
        let swr = await getZoneWR(map.name, zoneType.toUpperCase(), zone.zoneindex, "SOLDIER");
        let dwr = await getZoneWR(map.name, zoneType.toUpperCase(), zone.zoneindex, "DEMOMAN");
        if (shouldUploadExtra(swr) || !filter) {
          wrs.push(swr);
        }
        if (shouldUploadExtra(dwr) || !filter) {
          wrs.push(dwr);
        }
      }

      if (!noUpload && filter) {
        // Check for max number of runs,
        // this may be off by 1 since we add 2 at a time.
        if (wrs.length >= config.video.maxRunsInCollection) {
          break;
        }
      }
    }
  }

  if (filter) {
    replaceNames(wrs);
  }

  return wrs;
}

async function getTypeZones(mapName, zoneType) {
  const query = `
    {
      map(name: "${mapName}") {
        zones {
          ${zoneType} {
            id
            zoneindex
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }
  return result.data.map.zones[zoneType];
}

async function getZoneWR(mapName, zoneType, zoneId, className) {
  // TODO: a lot of repeated code with map wrs,
  // probably a better way to do this with graphql
  const query = `
    {
      map(name: "${mapName}") {
        records(zoneType: ${zoneType} zoneId: ${zoneId} limit: 1 class: ${className}) {
          id
          class
          date
          duration
          demoStartTick
          demoEndTick
          demo {
            id
            date
            url
            filename
          }
          map {
            name
          }
          player {
            name
            steamId
          }
          zone {
            id
            type
            zoneindex
            customName
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }
  if (!result.data.map.records.length) {
    return null;
  }

  return result.data.map.records[0];
}

async function getMapList() {
  const query = `
    {
      maps {
        id
        name
        zones {
          bonus {
            zoneindex
          }
          course {
            zoneindex
          }
          trick {
            zoneindex
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }
  return result.data.maps;
}

async function getRecentMapWRs() {
  const query = `
    {
      activity {
        mapWrs {
          class
          map {
            name
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }

  // Activity doesn't include splits,
  // let's query the new WR endpoint.
  let wrs = [];
  for (const wr of result.data.activity.mapWrs) {
    console.log(`Getting recent WRs ${wrs.length + 1}/${result.data.activity.mapWrs.length}`);
    wrs.push(await getMapWR(wr.map.name, wr.class));
  }
  return filterRuns(wrs);
}

function filterRuns(runs) {
  var wasArray = true;
  if (!Array.isArray(runs)) {
    runs = [runs];
    wasArray = false;
  }

  let uploaded = require("./data/uploaded.json");

  // Sanity check
  runs = runs.filter((run) => run != null);

  for (var i = runs.length - 1; i >= 0; i--) {
    // Remove already uploaded runs
    if (uploaded.maps.includes(runs[i].id)) {
      runs.splice(i, 1);
      continue;
    }

    // Make sure demo is uploaded
    if (!runs[i].demo || !runs[i].demo.url) {
      runs.splice(i, 1);
      continue;
    }

    // Remove runs that are too long
    if (runs[i].duration / 60 > config.video.mapMaxDuration) {
      console.log(`Removing run too long: ${runs[i].map.name} (${runs[i].class})`);
      runs.splice(i, 1);
      continue;
    }

    // TODO: date_added is not included in tempus-api-graphql yet
    /*
    // Remove maps that are too recent
    if (Date.now() - runs[i].map.dateAdded * 1000 < 1000 * 60 * 60 * 24 * config.video.mapMinAge) {
      console.log(`Removing run newer than ${config.video.mapMinAge} days: ${runs[i].map.name} (${runs[i].class})`);
      runs.splice(i, 1);
      continue;
    }
    */

    // Remove blacklisted runs
    let cont = false;
    for (var j = 0; j < blacklist.length; j++) {
      if (blacklist[j].name === runs[i].map.name && blacklist[j][runs[i].class].map) {
        console.log(`Removing blacklisted: ${runs[i].map.name} (${runs[i].class})`);
        runs.splice(i, 1);
        cont = true;
        break;
      }
    }
    if (cont) continue;
  }

  replaceNames(runs);

  // Upload oldest runs first
  runs = runs.sort((a, b) => a.date - b.date);

  if (!wasArray) {
    runs = runs.length && runs[0];
  }
  return runs;
}

function replaceNames(runs) {
  for (let i = 0; i < runs.length; i++) {
    for (var j = 0; j < nicknames.length; j++) {
      if (runs[i].player.steamId === nicknames[j].steamId) {
        runs[i].player.name = nicknames[j].name;
        break;
      }

      if (j >= nicknames.length - 1) {
        let answer = readlineSync.question(
          `Add nickname for player ${runs[i].player.name} (${runs[i].player.steamId}) or null to skip: `
        );

        if (answer == null || answer == "null") {
          break;
        }

        runs[i].player.name = answer;
        nicknames.push({
          steamId: runs[i].player.steamId,
          name: runs[i].player.name,
        });

        writeJSONSync("./data/nicknames.json", nicknames, { spaces: 2, EOL: "\n", replacer: null });
      }
    }
  }
}

function shouldUploadExtra(run) {
  // Make sure demo is uploaded
  if (!run || !run.demo || !run.demo.url) {
    return false;
  }

  let uploaded = require("./data/uploaded.json");

  // "courses", "bonuses", "tricks"
  const accessor = run.zone.type.endsWith("s") ? run.zone.type + "es" : run.zone.type + "s";

  if (uploaded[accessor].includes(run.id)) {
    return false;
  }

  if (accessor == "bonuses" || accessor == "tricks") {
    if (run.duration / 60 > config.video.extraMaxDuration) {
      console.log(`Removing run too long: ${run.map.name} ${run.zone.type} ${run.zone.zoneindex} (${run.class})`);
      return false;
    }

    if ((Date.now() - run.date * 1000) / (1000 * 60 * 60 * 24) < config.video.extraMinAge) {
      console.log(
        `Removing run newer than ${config.video.extraMinAge} days: ${run.map.name} ${run.zone.type} ${run.zone.zoneindex} (${run.class})`
      );
      return false;
    }
  }

  for (var j = 0; j < blacklist.length; j++) {
    if (blacklist[j].name === run.map.name && blacklist[j][run.class][accessor].includes(run.zone.zoneindex)) {
      console.log(`Removing blacklisted: ${run.map.name} ${run.zone.type} ${run.zone.zoneindex} (${run.class})`);
      return false;
    }
  }

  return true;
}

async function getRecordMap(recordId) {
  const query = `
    {
      record(id: ${recordId}) {
        map {
          id
          name
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.errors) {
    throw result.errors[0];
  }

  return result.data.record.map;
}

async function promptAllNames() {
  // Check all nicknames for all wrs
  console.log("Getting maplist...");
  let mapList = await getMapList();

  console.log("Getting map wrs...");
  let runs = await getMapWRs(mapList, false);

  console.log("Getting course wrs...");
  runs.push(
    ...(await getExtraWRs(
      mapList.filter((map) => map.zones.course.length > 0),
      "course",
      false
    ))
  );

  console.log("Getting bonus wrs...");
  runs.push(
    ...(await getExtraWRs(
      mapList.filter((map) => map.zones.bonus.length > 0),
      "bonus",
      false
    ))
  );

  console.log("Getting trick wrs...");
  runs.push(
    ...(await getExtraWRs(
      mapList.filter((map) => map.zones.trick.length > 0),
      "trick",
      false
    ))
  );

  replaceNames(runs);
}

exports.getMapWRs = getMapWRs;
exports.getMapWR = getMapWR;
exports.getExtraWRs = getExtraWRs;
exports.getMapList = getMapList;
exports.getRecentMapWRs = getRecentMapWRs;
exports.getRecordMap = getRecordMap;
exports.promptAllNames = promptAllNames;
