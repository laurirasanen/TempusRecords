use serde::{Serialize, Deserialize};
use crate::api::containers::{
    player::Player,
    tiers::Tiers
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Map {
    pub id: u32,
    pub authors: Vec<Player>,
    pub name: String,
    pub tiers: Tiers,
}