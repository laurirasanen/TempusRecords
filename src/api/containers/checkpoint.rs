use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Checkpoint {
    pub index: u32,
    pub name: String,
    pub time: f32,
    pub split: f32,
}