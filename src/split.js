const rp = require("request-promise");

const BASE_URL = "https://tempushub.xyz/api";
const BASE_OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
    },
    json: true,
};

async function getWRSplit(mapId, classId, recordType = "map") {
    let options = {
        ...BASE_OPTIONS,
        uri: BASE_URL + `/WRSplit/${mapId}/${classId}/${recordType}`,
    };

    try {
        return await rp(options);
    } catch {
        return null;
    }
}

module.exports.getWRSplit = getWRSplit;
