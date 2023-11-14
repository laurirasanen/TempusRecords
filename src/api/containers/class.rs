use serde::{Serialize, Deserialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Default)]
pub enum Class {
    #[default]
    SOLDIER = 3,
    DEMOMAN = 4,
}