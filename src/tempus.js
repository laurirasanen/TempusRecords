const { graphql } = require("graphql");
const { schema } = require("tempus-api-graphql");
const nicknames = require("./data/nicknames.json");
const blacklist = require("./data/blacklist.json");
const config = require("./data/config.json");
const uploaded = require("./data/uploaded.json");

async function getMapWRs(mapList) {
  let wrs = [];
  for (const map of mapList) {
    wrs.push(await getMapWR(map, "SOLDIER"));
    wrs.push(await getMapWR(map, "DEMOMAN"));
  }
  wrs = wrs.filter((wr) => wr != null).sort((a, b) => a.date - b.date);
  return filterRuns(wrs);
}

async function getMapWR(mapName, className) {
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
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.error) {
    throw result.error;
  }
  return filterRuns(result.data.map.wr);
}

async function getBonusWRs(mapList) {
  let wrs = [];
  for (const map of mapList) {
    let bonusZones = await getTypeZones(map.name, "bonus");
    for (const zone of bonusZones) {
      wrs.push(await getZoneWR(map.name, "BONUS", zone.id, "SOLDIER"));
      wrs.push(await getZoneWR(map.name, "BONUS", zone.id, "DEMOMAN"));
    }
  }
  wrs = wrs.filter((wr) => wr != null).sort((a, b) => a.date - b.date);
  return filterRuns(wrs);
}

async function getTypeZones(mapName, zoneType) {
  // TODO: these aren't supported yet
  if (zoneType === "bonus") throw "not supported";
  const query = `
    {
      map(name: "${mapName}") {
        zones {
          ${zoneType} {
            id
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.error) {
    throw result.error;
  }
  return result.data.map.zones[zoneType];
}

async function getZoneWR(mapName, zoneType, zoneId, className) {
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
          }
        }
      }
    }`;

  const result = await graphql(schema, query);
  if (result.error) {
    throw result.error;
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
        name
      }
    }`;

  const result = await graphql(schema, query);
  if (result.error) {
    throw result.error;
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
  if (result.error) {
    throw result.error;
  }

  // Activity doesn't include splits,
  // let's query the new WR endpoint.
  let wrs = [];
  for (const wr of result.data.activity.mapWrs) {
    console.log(`Getting recent WRs ${wrs.length + 1}/${result.data.activity.mapWrs.length}`);
    wrs.push(await getMapWR(wr.map.name, wr.class));
  }
  wrs = wrs.filter((wr) => wr != null).sort((a, b) => a.date - b.date);
  return filterRuns(wrs);
}

function filterRuns(runs) {
  var wasArray = true;
  if (!Array.isArray(runs)) {
    runs = [runs];
    wasArray = false;
  }

  // Sanity check
  runs = runs.filter((run) => run != null);

  for (var i = runs.length - 1; i >= 0; i--) {
    // TODO: handle bonuses

    // Remove already uploaded runs
    if (uploaded.maps.includes(runs[i].id)) {
      runs.splice(i, 1);
      continue;
    }

    // Make sure demo is uploaded
    if (!runs[i].demo.url) {
      runs.splice(i, 1);
      continue;
    }

    // Remove runs that are too long
    if (runs[i].duration / 60 > config.video.mapMaxDuration) {
      console.log(`Removing run too long: ${runs[i].map.name} (${runs[i].class})`);
      runs.splice(i, 1);
      continue;
    }

    // Remove runs that are too recent
    if (Date.now() - runs[i].demo.date * 1000 < 1000 * 60 * 60 * 24 * config.video.mapMinAge) {
      console.log(`Removing run newer than ${config.video.mapMinAge} days: ${runs[i].map.name} (${runs[i].class})`);
      runs.splice(i, 1);
      continue;
    }

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

    // Replace names
    for (var j = 0; j < nicknames.length; j++) {
      if (runs[i].player.steamId === nicknames[j].steamId) {
        runs[i].player.name = nicknames[j].name;
        break;
      }

      if (j >= nicknames.length - 1) {
        console.log(`Warn: no nickname for player ${runs[i].player.name} (${runs[i].player.steamId})`);
      }
    }
  }

  // Upload oldest runs first
  runs = runs.sort((a, b) => a.date - b.date);

  if (!wasArray) {
    runs = runs.length && runs[0];
  }
  return runs;
}

exports.getMapWRs = getMapWRs;
exports.getMapWR = getMapWR;
exports.getBonusWRs = getBonusWRs;
exports.getMapList = getMapList;
exports.getRecentMapWRs = getRecentMapWRs;
