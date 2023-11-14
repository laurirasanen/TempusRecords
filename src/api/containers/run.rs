use serde::{Serialize, Deserialize};
use crate::api::containers::{
    player::Player,
    map::Map,
    class::Class,
    checkpoint::Checkpoint,
    demo::Demo,
    server::Server,
    zone::Zone,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Run {
    pub id: u32,
    pub class: Class,
    pub checkpoints: Vec<Checkpoint>,
    pub date: f64,
    pub demo: Demo,
    pub demo_start_tick: u32,
    pub demo_end_tick: u32,
    pub duration: f64,
    pub map: Map,
    pub player: Player,
    pub rank: u32,
    pub server: Server,
    pub zone: Zone,
}