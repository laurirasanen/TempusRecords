use crate::api::containers::{
    run::Run,
    player::Player,
    map::Map,
    class::Class,
};

pub trait Endpoints {
    fn run_from_id(&self, id: u32) -> Result<Run, String>;
    fn run_from_rank(&self, map: &Map, class: Class, rank: u32) -> Result<Run, String>;

    fn player_from_id(&self, id: u32) -> Result<Player, String>;
    fn player_from_steam_id(&self, steam_id: &str) -> Result<Player, String>;

    fn map_from_id(&self, id: u32) -> Result<Map, String>;
    fn map_from_name(&self, name: &str) -> Result<Map, String>;
}