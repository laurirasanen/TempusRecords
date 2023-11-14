use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Demo {
    pub id: u32,
    pub date: f64,
    pub filename: Option<String>,
    pub url: Option<String>,
}