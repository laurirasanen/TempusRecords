const rp = require("request-promise");

const BASE_URL = "https://tempushub.xyz/api";
const BASE_OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
    },
    json: true,
};

async function getWRSplit(mapId, className, recordType, recordIndex = 0) {
    if (recordType != "bonus") {
        throw "this function is deprecated for maps, use splits returned by official api";
    }

    let options = {
        ...BASE_OPTIONS,
        uri: BASE_URL + `/WRSplit/${mapId}/${className === "SOLDIER" ? 3 : 4}/${recordType}/${recordIndex}`,
    };

    try {
        let result = await rp(options);
        let re = /WR -[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]/;
        if (result.match(re)) {
            return result.substr(3);
        } else {
            // TODO: make sure this is correct
            console.log(`Split ${result} doesn't match pattern ${re}`);
            return null;
        }
    } catch {
        return null;
    }
}

module.exports.getWRSplit = getWRSplit;
