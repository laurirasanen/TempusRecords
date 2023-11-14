use serde::{Serialize, Deserialize};
use crate::api::containers::{
    tiers::Tiers
};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum ZoneType {
    MAP,
    COURSE,
    BONUS,
    TRICK,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Zone {
    pub id: u32,
    pub zone_type: ZoneType,
    pub index: u32,
    pub name: Option<String>,
    pub tiers: Tiers,
}