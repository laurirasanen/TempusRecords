const rp = require("request-promise");

const BASE_URL = "https://tempushub.xyz/api";
const BASE_OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
    },
    json: true,
};

async function getWRSplit(mapId, classId, recordType = "map", recordIndex = 0) {
    let options = {
        ...BASE_OPTIONS,
        uri: BASE_URL + `/WRSplit/${mapId}/${classId}/${recordType}/${recordType != "map" ? recordIndex : ""}`,
    };

    // TODO: regex
    try {
        return await rp(options);
    } catch {
        return null;
    }
}

module.exports.getWRSplit = getWRSplit;
