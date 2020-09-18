const { graphql } = require("graphql");
const { schema } = require("tempus-api-graphql");

async function getMapWRs(mapList) {
    let wrs = [];
    for (const map of mapList) {
        wrs.push(await getMapWR(map, "SOLDIER"));
        wrs.push(await getMapWR(map, "DEMOMAN"));
    }
    wrs = wrs.filter((wr) => wr != null);
    return wrs;
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
    return result.data.map.wr;
}

async function getBonusWRs(mapList) {
    let wrs = [];
    for (const map of mapList) {
        let bonusZones = await getTypeZones(map, "bonus");
        for (const zone of bonusZones) {
            wrs.push(await getZoneWR(map, "BONUS", zone.id, "SOLDIER"));
            wrs.push(await getZoneWR(map, "BONUS", zone.id, "DEMOMAN"));
        }
    }
    wrs = wrs.filter((wr) => wr != null);
    return wrs;
}

async function getTypeZones(mapName, zoneType) {
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
    wrs = wrs.filter((wr) => wr != null);
    return wrs;
}

exports.getMapWRs = getMapWRs;
exports.getMapWR = getMapWR;
exports.getBonusWRs = getBonusWRs;
exports.getMapList = getMapList;
exports.getRecentMapWRs = getRecentMapWRs;
