use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Tiers {
    pub soldier: u32,
    pub demoman: u32,
}