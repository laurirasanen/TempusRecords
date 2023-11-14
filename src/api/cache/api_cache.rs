use crate::api::containers::{
    run::Run,
    player::Player,
    map::Map,
};
use crate::api::endpoints::Endpoints;

pub trait ApiCache: Endpoints {
    fn store_run(&self, run: &Run) -> ();
    fn store_map(&self, map: &Map) -> ();
    fn store_player(&self, player: &Player) -> ();
}
