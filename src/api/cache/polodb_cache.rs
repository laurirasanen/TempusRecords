use polodb_core;
use polodb_core::bson::{Bson, doc};

use crate::api::cache::api_cache::ApiCache;
use crate::api::containers::{
    run::Run,
    player::Player,
    map::Map,
    class::Class,
};
use crate::api::endpoints::Endpoints;

const DB_PATH: &str = "./api_cache.polodb";

impl From<Class> for Bson {
    fn from(value: Class) -> Self {
        Self::from(value)
    }
}

pub struct PolodbCache {
    db: polodb_core::Database,
    runs: polodb_core::Collection<Run>,
    maps: polodb_core::Collection<Map>,
    players: polodb_core::Collection<Player>,
}

impl PolodbCache {
    pub fn new() -> Self {
        let db = polodb_core::Database::open_file(DB_PATH)
            .expect("PolodbCache: failed to create db");
        let runs = db.collection::<Run>("runs");
        let maps = db.collection::<Map>("maps");
        let players = db.collection::<Player>("players");

        Self {
            db,
            runs,
            maps,
            players,
        }
    }
}

impl Endpoints for PolodbCache {
    fn run_from_id(&self, id: u32) -> Result<Run, String> {
        let result = self.runs.find_one(doc! {
            "id": id
        });
        if result.is_err() {
            return Err("Failed to query runs table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find run".to_string());
        }

        Ok(opt.unwrap())
    }

    fn run_from_rank(&self, map: &Map, class: Class, rank: u32) -> Result<Run, String> {
        let result = self.runs.find_one(doc! {
            "class": class,
            "map": {
                "id": map.id
            },
            "rank": rank
        });
        if result.is_err() {
            return Err("Failed to query runs table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find run".to_string());
        }

        Ok(opt.unwrap())
    }

    fn player_from_id(&self, id: u32) -> Result<Player, String> {
        let result = self.players.find_one(doc! {
            "id": id
        });
        if result.is_err() {
            return Err("Failed to query players table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find player".to_string());
        }

        Ok(opt.unwrap())
    }

    fn player_from_steam_id(&self, steam_id: &str) -> Result<Player, String> {
        let result = self.players.find_one(doc! {
            "steam_id": steam_id
        });
        if result.is_err() {
            return Err("Failed to query players table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find player".to_string());
        }

        Ok(opt.unwrap())
    }


    fn map_from_id(&self, id: u32) -> Result<Map, String> {
        let result = self.maps.find_one(doc! {
            "id": id
        });
        if result.is_err() {
            return Err("Failed to query maps table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find map".to_string());
        }

        Ok(opt.unwrap())
    }

    fn map_from_name(&self, name: &str) -> Result<Map, String> {
        let result = self.maps.find_one(doc! {
            "name": name
        });
        if result.is_err() {
            return Err("Failed to query maps table".to_string());
        }
        let opt = result.unwrap();
        if opt.is_none() {
            return Err("Failed to find map".to_string());
        }

        Ok(opt.unwrap())
    }
}

impl ApiCache for PolodbCache {
    fn store_run(&self, run: &Run) -> () {
        self.runs.insert_one(run)
            .expect("PolodbCache: failed to store_run");
    }

    fn store_map(&self, map: &Map) -> () {
        self.maps.insert_one(map)
            .expect("PolodbCache: failed to store_map");
    }

    fn store_player(&self, player: &Player) -> () {
        self.players.insert_one(player)
            .expect("PolodbCache: failed to store_player");
    }
}

