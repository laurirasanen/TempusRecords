use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Server {
    pub id: u32,
    pub name: Option<String>,
}