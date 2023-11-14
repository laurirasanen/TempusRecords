use crate::api::cache::api_cache::ApiCache;
use crate::api::containers::{
    run::Run,
    class::Class,
    map::Map,
    player::Player,
};
use crate::api::endpoints::Endpoints;
use crate::api::remote::remote_api::RemoteApi;

pub struct ApiRunner<C: ApiCache, R: RemoteApi> {
    cache: C,
    remote: R,
}

impl<C, R> ApiRunner<C, R> where C: ApiCache, R: RemoteApi {
    pub fn new(cache: C, remote: R) -> Self {
        Self {
            cache,
            remote,
        }
    }
}

impl<C, R> Endpoints for ApiRunner<C, R> where C: ApiCache, R: RemoteApi {
    fn run_from_id(&self, id: u32) -> Result<Run, String> {
        let mut run = self.cache.run_from_id(id);
        if run.is_err() {
            run = self.remote.run_from_id(id);
            if run.is_ok() {
                self.cache.store_run(&run.clone().unwrap());
            }
        }
        run
    }

    fn run_from_rank(&self, map: &Map, class: Class, rank: u32) -> Result<Run, String> {
        let mut run = self.cache.run_from_rank(map, class, rank);
        if run.is_err() {
            run = self.remote.run_from_rank(map, class, rank);
            if run.is_ok() {
                self.cache.store_run(&run.clone().unwrap());
            }
        }
        run
    }

    fn player_from_id(&self, id: u32) -> Result<Player, String> {
        let mut player = self.cache.player_from_id(id);
        if player.is_err() {
            player = self.remote.player_from_id(id);
            if player.is_ok() {
                self.cache.store_player(&player.clone().unwrap());
            }
        }
        player
    }

    fn player_from_steam_id(&self, steam_id: &str) -> Result<Player, String> {
        let mut player = self.cache.player_from_steam_id(steam_id);
        if player.is_err() {
            player = self.remote.player_from_steam_id(steam_id);
            if player.is_ok() {
                self.cache.store_player(&player.clone().unwrap());
            }
        }
        player
    }

    fn map_from_id(&self, id: u32) -> Result<Map, String> {
        let mut map = self.cache.map_from_id(id);
        if map.is_err() {
            map = self.remote.map_from_id(id);
            if map.is_ok() {
                self.cache.store_map(&map.clone().unwrap());
            }
        }
        map
    }

    fn map_from_name(&self, name: &str) -> Result<Map, String> {
        let mut map = self.cache.map_from_name(name);
        if map.is_err() {
            map = self.remote.map_from_name(name);
            if map.is_ok() {
                self.cache.store_map(&map.clone().unwrap());
            }
        }
        map
    }
}