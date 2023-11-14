use reqwest;
use serde::Deserialize;
use crate::api::endpoints::Endpoints;
use crate::api::remote::remote_api::RemoteApi;
use crate::api::containers::{
    run::Run,
    player::Player,
    map::Map,
    class::Class,
    demo::Demo,
    tiers::Tiers,
    server::Server,
    zone::Zone,
    zone::ZoneType,
};

const API_URL: &str = "https://tempus2.xyz/api/v0";

#[derive(Deserialize, Debug)]
struct JsonRecordInfo {
    id: u32,
    user_id: u32,
    zone_id: u32,
    duration: f64,
    date: f64,
    server_id: u32,
    class: u32,
    demo_id: u32,
    demo_start_tick: u32,
    demo_end_tick: u32,
    rank: u32,
}

#[derive(Deserialize, Debug)]
struct JsonPlayerInfo {
    id: u32,
    steamid: String,
    name: String,
}

#[derive(Deserialize, Debug)]
struct JsonZoneInfo {
    id: u32,
    map_id: u32,
    #[serde(rename = "type")]
    _type: String,
    zoneindex: u32,
    custom_name: Option<String>,
}

#[derive(Deserialize, Debug)]
struct JsonTierInfo {
    #[serde(rename = "3")]
    _3: u32,
    #[serde(rename = "4")]
    _4: u32,
}

#[derive(Deserialize, Debug)]
struct JsonMapInfo {
    id: u32,
    name: String,
    date_added: f64,
}

#[derive(Deserialize, Debug)]
struct JsonDemoInfo {
    id: u32,
    mapname: String,
    filename: Option<String>,
    date: f64,
    url: Option<String>,
    recording: bool,
    requested: bool,
    uploader_id: Option<u32>,
    server_id: u32,
    expired: bool,
    deleted: bool,
}

#[derive(Deserialize, Debug)]
struct JsonRecord {
    record_info: JsonRecordInfo,
    player_info: JsonPlayerInfo,
    zone_info: JsonZoneInfo,
    tier_info: JsonTierInfo,
    map_info: JsonMapInfo,
    demo_info: JsonDemoInfo,
}

pub struct HttpsApi {
    client: reqwest::blocking::Client,
}

impl HttpsApi {
    pub fn new() -> Self {
        Self {
            client: reqwest::blocking::Client::new()
        }
    }
}

impl RemoteApi for HttpsApi {}

impl Endpoints for HttpsApi {
    fn run_from_id(&self, id: u32) -> Result<Run, String> {
        let res = self.client
            .get(format!("{API_URL}/records/id/{id}/overview"))
            .header("accept", "*/*")
            .send();
        if res.is_err() {
            return Err(res.unwrap_err().to_string());
        }
        let r = res.unwrap();
        let status = r.status().as_u16();
        if status != 200 {
            return Err(format!("Request failed: {:?} - {:?}", r.url().to_string(), status));
        }
        let json: reqwest::Result<JsonRecord> = r.json();
        if json.is_err() {
            return Err(json.unwrap_err().to_string());
        }
        let json = json.unwrap();

        Ok(Run {
            id: json.record_info.id,
            class: if json.record_info.class == 3 { Class::SOLDIER } else { Class::DEMOMAN },
            checkpoints: vec![], // TODO
            date: json.record_info.date,
            demo: Demo {
                id: json.demo_info.id,
                date: json.demo_info.date,
                filename: json.demo_info.filename,
                url: json.demo_info.url,
            },
            demo_start_tick: json.record_info.demo_start_tick,
            demo_end_tick: json.record_info.demo_end_tick,
            duration: json.record_info.duration,
            map: Map {
                id: json.map_info.id,
                authors: vec![], // TODO
                name: json.map_info.name,
                tiers: Tiers {
                    // TODO
                    soldier: 0,
                    demoman: 0,
                },
            },
            player: Player {
                id: json.player_info.id,
                name: json.player_info.name,
                steam_id: json.player_info.steamid,
            },
            rank: json.record_info.rank,
            server: Server {
                id: json.record_info.server_id,
                name: None,
            },
            zone: Zone {
                id: json.zone_info.id,
                zone_type: match json.zone_info._type.as_str() {
                    "map" => ZoneType::MAP,
                    "course" => ZoneType::COURSE,
                    "bonus" => ZoneType::BONUS,
                    "trick" => ZoneType::TRICK,
                    _ => panic!("Invalid zone type {}", json.zone_info._type),
                },
                index: json.zone_info.zoneindex,
                name: json.zone_info.custom_name,
                tiers: Tiers {
                    soldier: json.tier_info._3,
                    demoman: json.tier_info._4,
                },
            },
        })
    }

    fn run_from_rank(&self, map: &Map, class: Class, rank: u32) -> Result<Run, String> {
        todo!()
    }

    fn player_from_id(&self, id: u32) -> Result<Player, String> {
        todo!()
    }
    fn player_from_steam_id(&self, steam_id: &str) -> Result<Player, String> {
        todo!()
    }

    fn map_from_id(&self, id: u32) -> Result<Map, String> {
        todo!()
    }
    fn map_from_name(&self, name: &str) -> Result<Map, String> {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use crate::api::containers::class::Class;
    use crate::api::containers::zone::ZoneType;
    use crate::api::endpoints::Endpoints;
    use crate::api::remote::https_api::HttpsApi;

    #[test]
    fn run_from_id() {
        let api = HttpsApi::new();
        // This run is from 2016 and player has been offline since 2018.
        // Unlikely to change, I hope...
        let run = api.run_from_id(1234567).unwrap();

        assert_eq!(run.id, 1234567);
        assert_eq!(run.class, Class::DEMOMAN);
        assert!(run.rank >= 847);
        assert!(run.duration > 279.9 && run.duration < 280.0);

        assert_eq!(run.demo_start_tick, 4131);
        assert_eq!(run.demo_end_tick, 22793);
        assert_eq!(run.demo.id, 299223);
        assert!(run.demo.date > 1472651023.0 && run.demo.date < 1472651024.0);
        assert_eq!(run.demo.url, None);
        assert_eq!(run.demo.filename, Some("auto-20160831-134343-jump_dystopia".to_string()));

        assert_eq!(run.map.name, "jump_dystopia");
        assert_eq!(run.map.tiers.soldier, 4);
        assert_eq!(run.map.tiers.demoman, 3);
        assert_eq!(run.map.authors.len(), 1);
        assert_eq!(run.map.authors[0].name, "Jasska");

        assert_eq!(run.player.id, 210311);
        assert_eq!(run.player.name, "Katou");
        assert_eq!(run.player.steam_id, "STEAM_0:0:142333441");

        assert_eq!(run.server.id, 4);

        assert_eq!(run.zone.id, 1262);
        assert_eq!(run.zone.zone_type, ZoneType::COURSE);
        assert_eq!(run.zone.index, 2);
        assert_eq!(run.zone.name, None);
        assert_eq!(run.zone.tiers.soldier, 2);
        assert_eq!(run.zone.tiers.demoman, 2);
    }
}
